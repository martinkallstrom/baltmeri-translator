/** The LLM sits strictly upstream of the engine: it analyses source text and supplies source forms. */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { DOMAINS, LANG_NAMES } from "../engine/languages";
import type { Engine } from "../engine/index";
import type { ParsedToken } from "../engine/parse";
import type { RenderedToken } from "../engine/render";
import { AnalysisZ, ReverseZ, TutorialZ, type Analysis } from "./schema";

const MODEL = "claude-opus-5";

export function client(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, maxRetries: 2, timeout: 90_000 });
}

function lexiconList(engine: Engine): string {
  return [...engine.words.values()].map((w) => `${w.id} (${w.pos}: ${w.gloss})`).join(", ");
}

export function analysisSystemPrompt(engine: Engine): string {
  return `You are the analysis stage of a translator into Baltmeri, a constructed language synthesised deterministically from the nine Baltic Sea languages (Finnish, Estonian, Latvian, Lithuanian, Polish, Russian, Swedish, Danish, German). You never produce Baltmeri words yourself. You analyse the source text into a word-by-word specification, and for every lemma the engine does not know you supply the nine source-language translations. A deterministic engine then derives every Baltmeri word and inflects it.

## Baltmeri syntax you must encode in the word order
- SVO, always. No verb-second inversion: time adverbs may open the sentence, the subject and verb keep their order.
- Adjective before noun. Genitive before noun. Numeral before noun. Quantifiers ("many") take a plain plural noun.
- Place phrases before time phrases, both at the end of the clause.
- No articles, no gender. Third person singular pronoun is always "he" (= he/she/it). Pronouns as subjects may be dropped only if the source drops them.
- Existence: "there is X in/on Y" → [Y in ade/ine] [verb be] [X nom].
- Copula: lemma "be". Adjective predicates stay bare adjectives.
- Yes/no questions: set question=true (the engine places the particle). Wh-questions: the wh-word is a new concept (pos "pron" or "other").
- Negation: set negated=true (the engine places "ne"). Imperatives: verb person 2, end "!".
- Comparison: adjective degree comp/sup; "than" is the word lemma "than".
- Adverbs from adjectives ("greatly", "very much" ≈ adverb of "big"): kind adv with fromAdjective=true. Plain adverbs (tomorrow, very): kind adv, fromAdjective=false.
- Fixed species-like compounds ("grey seal" the species) → noun with compoundWith=modifier lemma; an incidental attribute → separate adjective.
- Derived nouns: agent (-ja: fisher, sailor) → noun lemma of base with derive="agent"; abstract (-us: size) → derive="abstract"; diminutive (-ka) → "diminutive"; adjective-from-noun (-ne: salty) → adj lemma is fine if known, else noun with derive="adjective". Prefer known lexicon ids (size, fisher, sailor, salty, little-fish) when they exist.

## Cases (prepositions become cases; there are no prepositions)
nom subject · gen of/'s · acc direct object · ine in/inside · ade on/at, also "when" (in summer, at night, on Monday) · ela from/out of · all to/onto/towards.
Other relations (with, for, without, under, about…) need a real word: emit kind "word" with a lemma and supply it in newConcepts with pos "prep".

## Lemmas
- Lemma ids are lowercase English: singular nouns, bare infinitives without "to", multiword with hyphens (e.g. "baltic-herring").
- Use these known lexicon ids whenever the meaning fits (do not add them to newConcepts): ${lexiconList(engine)}.
- Every other lemma you use MUST appear once in newConcepts with: pos; domain (one of ${DOMAINS.join(", ")}; null for function words); a short gloss; and the FIRST dictionary translation in each of the nine languages, in native orthography (Cyrillic for Russian), in citation form (infinitive for verbs, nominative singular for nouns, masculine nominative singular for adjectives). Choose the plain everyday word, not a rare synonym.
- Numbers: kind num with the numeric value. Proper names: kind name, text in Latin script, with case and number.
- Punctuation inside a sentence (commas, dashes) → kind punct. Sentence-final punctuation goes in "end".
- Verb person is a string "1" | "2" | "3". Person 3 covers all third persons; number still carries sg/pl.

Set detectedLanguage to the ISO code of the source language (en, fi, et, lv, lt, pl, ru, sv, da, de, or other). Put any caveats in notes (one or two sentences, may be empty).`;
}

export async function analyze(anthropic: Anthropic, engine: Engine, text: string, sourceLang: string): Promise<Analysis> {
  const declared = sourceLang === "auto" ? "unknown (detect it)" : sourceLang;
  const res = await anthropic.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { format: zodOutputFormat(AnalysisZ), effort: "medium" },
    system: analysisSystemPrompt(engine),
    messages: [{ role: "user", content: `Source language: ${declared}\n\nText:\n${text}` }]
  });
  if (res.stop_reason === "refusal") throw new Error("The analysis model declined this text.");
  if (!res.parsed_output) throw new Error("The analysis could not be parsed.");
  return res.parsed_output;
}

export function compactTrace(tokens: RenderedToken[]): string {
  return tokens
    .filter((t) => t.lemma || t.pos === "name")
    .map((t) => {
      const d = t.derivation;
      const parts = [`"${t.text}"`, t.lemma ? `lemma=${t.lemma}` : "", t.pos ?? "", t.features ? `features=${t.features}` : ""];
      if (t.stem) parts.push(`stem=${t.stem}`);
      if (t.origin) parts.push(`origin=${t.origin}`);
      if (d) {
        parts.push(`rule=${d.rule}`);
        if (d.family) parts.push(`family=${d.family}`);
        if (d.decidedBy) parts.push(`decidedBy=${LANG_NAMES[d.decidedBy]}`);
        parts.push(`sources=[${d.gathered.map((g) => `${g.lang}:${g.raw}→${g.stem}(${g.skeleton.join("")})`).join(" ")}]`);
        if (d.hanse) parts.push(`hanse=${d.hanse.skeleton.join("-")} in ${d.hanse.families.join("+")}`);
        if (d.vote) parts.push(`vote=${d.vote.tally.map((x) => `${x.stem}:${x.families.join("+")}`).join(",")}${d.vote.tie ? ` tie→${LANG_NAMES[d.vote.tie.decider]} (queue ${d.vote.tie.queueBefore.join(">")})` : ""}`);
        if (d.hanse?.slots[0]?.tie) parts.push(`tie→${LANG_NAMES[d.hanse.slots[0].tie.decider]} (queue ${d.hanse.slots[0].tie.queueBefore.join(">")})`);
        if (d.collision) parts.push(`collision with "${d.collision.clashedWith}"`);
        if (d.matchesManual === false) parts.push(`MANUAL DECREE: manual says ${d.form}, rules alone gave ${d.derived}`);
        if (d.notes.length) parts.push(`notes=${d.notes.join(" | ")}`);
      }
      if (t.steps?.length) parts.push(`repair=[${t.steps.join("; ")}]`);
      if (t.note) parts.push(`note=${t.note}`);
      return "- " + parts.filter(Boolean).join(" ");
    })
    .join("\n");
}

const TUTORIAL_SYSTEM = `You write the "legend" panel of a Baltmeri translator: a short tutorial explaining how a translation was built. Baltmeri is a constructed language derived deterministically from the nine Baltic Sea languages by a manual: words are normalised, reduced to consonant skeletons, and decided by rules in order — Hanse Rule (a skeleton shared by two or more of the four families: Finnic, Baltic, Slavic, Germanic), Domain Rule (sea/fish/weather/seasons/landscape → Finnic, body/kinship/colour/farm/forest → Baltic, trade/tools/town/law/money/abstract → Germanic, verbs and adjectives of quality → Slavic; Estonian, Latvian, Polish, Swedish rank first inside their families), Family Vote (one family one vote), Fallback, Collision (a later concept takes its runner-up), Repair (merge doubled consonants, epenthetic i in clusters, supporting -e). Ties go to the Visby Queue: languages ranked by distance from Visby, the winner rotating to the back. Grammar: plural -i; cases -n gen, -a acc, -se in, -l on/at/when, -ste from, -le to; adjectives bare and before the noun, -m comparative, -st superlative, -t adverb; verbs -u/-t/-Ø/-me/-te/-Ø, past -l-, future -s-, infinitive -te; copula esu/est/er/esme/este, past bul-, future bus-; negation ne before the verb (after the copula); question particle li after the verb; SVO, place before time.

You receive the source text, the Baltmeri result, and the engine's trace. Write the tutorial in English as Markdown:
- Start with one sentence on the overall structure (word order, what became a case ending).
- Then a bullet per Baltmeri word or tight group: which rule produced the stem, which family/language won and why, any Visby Queue tie-break, any manual decree, then the inflection (ending → meaning) and any repair.
- Only state what the trace supports. If the trace says the manual decreed a form over the rules, say so plainly.
- Warm, curious tone; short sentences; no headings; under 250 words unless the text is long.`;

export async function tutorial(anthropic: Anthropic, source: string, sourceLang: string, baltmeri: string, trace: string): Promise<string> {
  const res = await anthropic.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { format: zodOutputFormat(TutorialZ), effort: "low" },
    system: TUTORIAL_SYSTEM,
    messages: [{ role: "user", content: `Source (${sourceLang}): ${source}\n\nBaltmeri: ${baltmeri}\n\nTrace:\n${trace}` }]
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("The tutorial could not be written.");
  return res.parsed_output.tutorial;
}

const REVERSE_SYSTEM = `You are the rendering stage of a Baltmeri → natural language translator. Baltmeri is a constructed Baltic Sea language (see the grammar below). A deterministic parser has already analysed each Baltmeri token against the grammar tables and the known lexicon; you receive the tokens with their candidate analyses (lemma = English concept id, part of speech, features such as pl.ade = plural adessive "on the …"). Produce:
1. translation — a fluent translation into the requested target language, following the analyses. Pick the most plausible analysis where several are listed. Tokens with no analysis are unknown: keep them as-is (they may be names) and mention them in the tutorial.
2. tutorial — a short English Markdown legend: one line on the sentence structure, then a bullet per word giving lemma, meaning, and how the ending was read (e.g. "kaljuil = kalju 'rock' + -i plural + -l adessive → on the rocks"). Under 200 words.

Grammar: plural -i; cases -n gen, -a acc (acc pl = nom pl), -se in, -l on/at/when, -ste from, -le to; adjectives bare before the noun, agree in number only, -m comparative, -st superlative, -t adverb, -ne adjective-from-noun; verbs person -u/-t/-Ø/-me/-te/-Ø, past -l-, future -s-, infinitive -te; copula esu/est/er/esme/este, bul- past, bus- future; ne = not (before verb, after copula); li = yes/no question particle after the verb; SVO; place before time; no articles; han = he/she/it.`;

export async function reverse(anthropic: Anthropic, tokens: ParsedToken[], targetLang: string): Promise<{ translation: string; tutorial: string }> {
  const listing = tokens
    .map((t) => `${t.text}: ${t.analyses.length ? t.analyses.map((a) => `${a.lemma} [${a.pos}${a.features ? " " + a.features : ""}] "${a.gloss}"`).join(" | ") : "(unknown)"}`)
    .join("\n");
  const res = await anthropic.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { format: zodOutputFormat(ReverseZ), effort: "medium" },
    system: REVERSE_SYSTEM,
    messages: [{ role: "user", content: `Target language: ${targetLang}\n\nTokens:\n${listing}` }]
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("The reverse translation could not be produced.");
  return res.parsed_output;
}
