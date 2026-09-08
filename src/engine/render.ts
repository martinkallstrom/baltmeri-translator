/**
 * Rendering: an analysed sentence (the interlingua the LLM produces) → Baltmeri.
 * Word forms are fully deterministic; the analysis supplies lemmas and features.
 */
import type { Domain, Pos } from "./languages";
import {
  COPULA, COPULA_INFINITIVE, NEGATION, QUESTION, adjective, adverb, derive, infinitive, noun, pronoun, verb,
  type Case, type Degree, type DerivationKind, type Number_, type Person, type PronounId, type Tense
} from "./inflect";
import type { Engine, Word } from "./index";
import type { Concept, Derivation, SynthesisContext } from "./synthesize";

export type WordSpec =
  | { kind: "noun"; lemma: string; number?: Number_; case?: Case; compoundWith?: string; derive?: DerivationKind }
  | { kind: "adj"; lemma: string; number?: Number_; degree?: Degree }
  | { kind: "adv"; lemma: string; fromAdjective?: boolean }
  | { kind: "verb"; lemma: string; tense?: Tense; person?: Person; number?: Number_; infinitive?: boolean }
  | { kind: "pron"; lemma: PronounId; case?: Case }
  | { kind: "num"; value: number }
  | { kind: "word"; lemma: string } // conjunctions, particles, quantifiers, prepositions
  | { kind: "name"; text: string; case?: Case; number?: Number_ }
  | { kind: "punct"; text: string };

export interface SentenceSpec {
  words: WordSpec[];
  negated?: boolean;
  question?: boolean;
  /** Trailing punctuation, e.g. "." "!" "?" */
  end?: string;
}

export interface NewConcept {
  id: string;
  pos: Pos;
  domain?: Domain;
  gloss?: string;
  sources: Concept["sources"];
}

export interface RenderedToken {
  text: string;
  lemma?: string;
  gloss?: string;
  pos?: string;
  features?: string;
  stem?: string;
  steps?: string[];
  origin?: Word["origin"] | "unknown";
  derivation?: Derivation;
  note?: string;
}

export interface RenderResult {
  text: string;
  tokens: RenderedToken[];
  newDerivations: Derivation[];
  unknown: string[];
}

const NUMERALS: Record<number, string> = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten" };

export class Renderer {
  private readonly derivedNow = new Map<string, { word: Word; derivation: Derivation }>();
  readonly newDerivations: Derivation[] = [];
  readonly unknown: string[] = [];
  private readonly ctx: SynthesisContext;

  constructor(private readonly engine: Engine, newConcepts: NewConcept[] = [], cached: Record<string, Word> = {}) {
    this.ctx = engine.context();
    for (const w of Object.values(cached)) {
      this.derivedNow.set(w.id, { word: w, derivation: w.derivation! });
      this.ctx.taken.set(w.stem, w.id);
    }
    // New concepts are derived in order of first appearance, from the canonical queue.
    for (const c of newConcepts) {
      if (this.engine.lookup(c.id) || this.derivedNow.has(c.id)) continue;
      const d = engine.deriveNew({ ...c, gloss: c.gloss ?? c.id }, this.ctx);
      const word: Word = { id: c.id, pos: c.pos, gloss: c.gloss ?? c.id, stem: d.form, derivation: d, origin: "new" };
      this.derivedNow.set(c.id, { word, derivation: d });
      this.newDerivations.push(d);
    }
  }

  private resolve(lemma: string): Word | undefined {
    return this.engine.lookup(lemma) ?? this.derivedNow.get(lemma.toLowerCase())?.word;
  }

  private base(w: Word): Pick<RenderedToken, "lemma" | "gloss" | "pos" | "stem" | "origin" | "derivation"> {
    return { lemma: w.id, gloss: w.gloss, pos: w.pos, stem: w.stem, origin: w.origin, derivation: w.derivation };
  }

  private missing(lemma: string, pos: string): RenderedToken {
    this.unknown.push(lemma);
    return { text: `[${lemma}]`, lemma, pos, origin: "unknown", note: "No lexicon entry and no source forms supplied." };
  }

  renderWord(spec: WordSpec): RenderedToken {
    switch (spec.kind) {
      case "punct":
        return { text: spec.text };
      case "name": {
        const n = noun(spec.text, spec.number ?? "sg", spec.case ?? "nom");
        return { text: n.form, pos: "name", features: [spec.number ?? "sg", spec.case ?? "nom"].join("."), steps: n.steps, note: "Proper name, inflected like a noun." };
      }
      case "num": {
        const lemma = NUMERALS[spec.value];
        const w = lemma ? this.resolve(lemma) : undefined;
        if (!w) return { text: String(spec.value), pos: "num", note: "Numerals above ten are written in digits." };
        return { text: w.stem, ...this.base(w), features: "num" };
      }
      case "pron": {
        const w = this.resolve(spec.lemma);
        return { text: pronoun(spec.lemma, spec.case ?? "nom"), ...(w ? this.base(w) : { lemma: spec.lemma, pos: "pron" }), features: spec.case ?? "nom" };
      }
      case "word": {
        const w = this.resolve(spec.lemma);
        if (!w) return this.missing(spec.lemma, "word");
        return { text: w.stem, ...this.base(w) };
      }
      case "adv": {
        const w = this.resolve(spec.lemma);
        if (!w) return this.missing(spec.lemma, "adv");
        if (w.pos === "adj" || spec.fromAdjective) {
          const r = adverb(w.stem);
          return { text: r.form, ...this.base(w), features: "adv (-t)", steps: r.steps };
        }
        return { text: w.stem, ...this.base(w) };
      }
      case "adj": {
        const w = this.resolve(spec.lemma);
        if (!w) return this.missing(spec.lemma, "adj");
        const r = adjective(w.stem, spec.number ?? "sg", spec.degree ?? "pos");
        return { text: r.form, ...this.base(w), features: [spec.degree ?? "pos", spec.number ?? "sg"].join("."), steps: r.steps };
      }
      case "noun": {
        const w = this.resolve(spec.lemma);
        if (!w) return this.missing(spec.lemma, "noun");
        let stem = w.stem;
        const steps: string[] = [];
        let note: string | undefined;
        if (spec.derive) {
          const d = derive(stem, spec.derive);
          steps.push(...d.steps);
          note = `Derived with -${d.form.slice(stem.length)} (§8 ${spec.derive}).`;
          stem = d.form;
        }
        if (spec.compoundWith) {
          const mod = this.resolve(spec.compoundWith);
          if (mod) {
            stem = mod.stem + stem;
            note = `Head-final compound: ${mod.stem} + ${w.stem} (§4).`;
          }
        }
        const r = noun(stem, spec.number ?? "sg", spec.case ?? "nom");
        return { text: r.form, ...this.base(w), stem, features: [spec.number ?? "sg", spec.case ?? "nom"].join("."), steps: [...steps, ...r.steps], note };
      }
      case "verb": {
        const w = this.resolve(spec.lemma);
        const tense = spec.tense ?? "pres";
        const person = spec.person ?? 3;
        const number = spec.number ?? "sg";
        if (spec.lemma === "be" || w?.id === "be") {
          const be = this.resolve("be");
          const text = spec.infinitive ? COPULA_INFINITIVE : COPULA[tense][number][person];
          return { text, ...(be ? this.base(be) : { lemma: "be", pos: "verb" }), features: spec.infinitive ? "inf" : `${tense}.${person}${number}`, note: "Suppletive copula (§7)." };
        }
        if (!w) return this.missing(spec.lemma, "verb");
        const r = spec.infinitive ? infinitive(w.stem) : verb(w.stem, tense, person, number);
        return { text: r.form, ...this.base(w), features: spec.infinitive ? "inf (-te)" : `${tense}.${person}${number}`, steps: r.steps };
      }
    }
  }

  renderSentence(s: SentenceSpec): RenderedToken[] {
    const out: RenderedToken[] = [];
    const verbIdx = s.words.findIndex((w) => w.kind === "verb" && !w.infinitive);
    const verbSpec = verbIdx >= 0 ? (s.words[verbIdx] as Extract<WordSpec, { kind: "verb" }>) : null;
    const copula = !!verbSpec && (verbSpec.lemma === "be" || this.resolve(verbSpec.lemma)?.id === "be");
    const neg = (): RenderedToken => ({ text: NEGATION, lemma: "not", gloss: "not", pos: "part", note: copula ? "With the copula, ne precedes the predicate (§11: er ne glembok)." : "Negation precedes the verb (§7)." });
    s.words.forEach((spec, i) => {
      if (s.negated && i === verbIdx && !copula) out.push(neg());
      if (s.negated && verbIdx === -1 && i === 0) out.push(neg());
      out.push(this.renderWord(spec));
      if (s.question && i === verbIdx) out.push({ text: QUESTION, lemma: "question", gloss: "(question)", pos: "part", note: "Question particle li follows the verb (§7)." });
      if (s.negated && i === verbIdx && copula) out.push(neg());
    });
    if (s.question && verbIdx === -1 && out.length) out.push({ text: QUESTION, lemma: "question", gloss: "(question)", pos: "part" });
    // Capitalise the first word.
    const first = out.find((t) => /\p{L}/u.test(t.text));
    if (first && first.pos !== "name") first.text = first.text[0].toUpperCase() + first.text.slice(1);
    if (s.end) out.push({ text: s.end });
    else out.push({ text: s.question ? "?" : "." });
    return out;
  }

  render(sentences: SentenceSpec[]): RenderResult {
    const tokens: RenderedToken[] = [];
    for (const s of sentences) tokens.push(...this.renderSentence(s));
    return { text: joinTokens(tokens), tokens, newDerivations: this.newDerivations, unknown: this.unknown };
  }
}

export function joinTokens(tokens: RenderedToken[]): string {
  let s = "";
  for (const t of tokens) {
    if (!t.text) continue;
    if (/^[.,;:!?]$/.test(t.text)) s += t.text;
    else s += (s ? " " : "") + t.text;
  }
  return s;
}
