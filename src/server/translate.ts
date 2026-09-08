/** Orchestration: LLM analysis → deterministic engine → Baltmeri, and the reverse. */
import type Anthropic from "@anthropic-ai/sdk";
import type { KVNamespace } from "@cloudflare/workers-types/experimental";
import { getEngine, type Word } from "../engine/index";
import type { Pos, Domain } from "../engine/languages";
import { Parser } from "../engine/parse";
import { Renderer, type NewConcept, type RenderedToken, type SentenceSpec, type WordSpec } from "../engine/render";
import { makeCache, sha1, type Cache } from "./cache";
import { analyze, compactTrace, reverse as reverseLLM, tutorial as tutorialLLM } from "./llm";
import type { Analysis } from "./schema";

export interface ForwardResult {
  direction: "forward";
  translation: string;
  tokens: RenderedToken[];
  trace: string;
  detectedLanguage: string;
  notes: string;
  unknown: string[];
  newWords: { id: string; form: string; rule: string }[];
  cachedAnalysis: boolean;
}

export interface ReverseResult {
  direction: "reverse";
  translation: string;
  tutorial: string;
  tokens: { text: string; analyses: { lemma: string; gloss: string; pos: string; features: string }[] }[];
}

export class Translator {
  private readonly cache: Cache;
  constructor(private readonly anthropic: Anthropic, kv?: KVNamespace) {
    this.cache = makeCache(kv);
  }

  private toSpec(a: Analysis): { sentences: SentenceSpec[]; newConcepts: NewConcept[] } {
    const sentences: SentenceSpec[] = a.sentences.map((s) => ({
      negated: s.negated,
      question: s.question,
      end: s.end || undefined,
      words: s.words.map((w): WordSpec => {
        switch (w.kind) {
          case "noun": return { kind: "noun", lemma: w.lemma, number: w.number, case: w.case, compoundWith: w.compoundWith ?? undefined, derive: w.derive ?? undefined };
          case "verb": return { kind: "verb", lemma: w.lemma, tense: w.tense, person: Number(w.person) as 1 | 2 | 3, number: w.number, infinitive: w.infinitive };
          case "adj": return { kind: "adj", lemma: w.lemma, number: w.number, degree: w.degree };
          case "adv": return { kind: "adv", lemma: w.lemma, fromAdjective: w.fromAdjective };
          case "pron": return { kind: "pron", lemma: w.lemma, case: w.case };
          case "num": return { kind: "num", value: w.value };
          case "word": return { kind: "word", lemma: w.lemma };
          case "name": return { kind: "name", text: w.text, case: w.case, number: w.number };
          case "punct": return { kind: "punct", text: w.text };
        }
      })
    }));
    const newConcepts: NewConcept[] = a.newConcepts.map((c) => ({
      id: c.id.toLowerCase(), pos: c.pos as Pos, domain: (c.domain ?? undefined) as Domain | undefined, gloss: c.gloss, sources: c.sources
    }));
    return { sentences, newConcepts };
  }

  async forward(text: string, sourceLang: string): Promise<ForwardResult> {
    const engine = getEngine();
    const key = `analysis:v1:${await sha1(`${sourceLang}|${text}`)}`;
    let analysis = await this.cache.get<Analysis>(key);
    const cachedAnalysis = !!analysis;
    if (!analysis) {
      analysis = await analyze(this.anthropic, engine, text, sourceLang);
      await this.cache.put(key, analysis, 60 * 60 * 24 * 30);
    }
    const { sentences, newConcepts } = this.toSpec(analysis);

    // First derivation wins: reuse cached derivations for concepts seen before.
    const cached: Record<string, Word> = {};
    for (const c of newConcepts) {
      const w = await this.cache.get<Word>(`concept:v1:${c.id}`);
      if (w) cached[c.id] = w;
    }
    const renderer = new Renderer(engine, newConcepts, cached);
    const out = renderer.render(sentences);
    const index = new Set((await this.cache.get<string[]>("concepts:index")) ?? []);
    for (const d of out.newDerivations) {
      const c = newConcepts.find((x) => x.id === d.id)!;
      const word: Word = { id: d.id, pos: c.pos, gloss: c.gloss ?? c.id, stem: d.form, derivation: d, origin: "new" };
      await this.cache.put(`concept:v1:${d.id}`, word);
      index.add(d.id);
    }
    if (out.newDerivations.length) await this.cache.put("concepts:index", [...index]);

    return {
      direction: "forward",
      translation: out.text,
      tokens: out.tokens,
      trace: compactTrace(out.tokens),
      detectedLanguage: analysis.detectedLanguage,
      notes: analysis.notes,
      unknown: out.unknown,
      newWords: out.newDerivations.map((d) => ({ id: d.id, form: d.form, rule: d.rule })),
      cachedAnalysis
    };
  }

  async tutorial(source: string, sourceLang: string, baltmeri: string, trace: string): Promise<string> {
    const key = `tutorial:v1:${await sha1(`${sourceLang}|${source}|${baltmeri}`)}`;
    const hit = await this.cache.get<string>(key);
    if (hit) return hit;
    const t = await tutorialLLM(this.anthropic, source, sourceLang, baltmeri, trace);
    await this.cache.put(key, t, 60 * 60 * 24 * 30);
    return t;
  }

  async reverse(text: string, targetLang: string): Promise<ReverseResult> {
    const engine = getEngine();
    const ids = (await this.cache.get<string[]>("concepts:index")) ?? [];
    const extra: Word[] = [];
    for (const id of ids) {
      const w = await this.cache.get<Word>(`concept:v1:${id}`);
      if (w) extra.push(w);
    }
    const parsed = new Parser(engine, extra).parse(text);
    const key = `reverse:v1:${await sha1(`${targetLang}|${text}`)}`;
    let result = await this.cache.get<{ translation: string; tutorial: string }>(key);
    if (!result) {
      result = await reverseLLM(this.anthropic, parsed, targetLang);
      await this.cache.put(key, result, 60 * 60 * 24 * 30);
    }
    return {
      direction: "reverse",
      translation: result.translation,
      tutorial: result.tutorial,
      tokens: parsed.map((t) => ({ text: t.text, analyses: t.analyses.map((a) => ({ lemma: a.lemma, gloss: a.gloss, pos: a.pos, features: a.features })) }))
    };
  }
}
