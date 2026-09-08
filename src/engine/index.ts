/** The Baltmeri engine: derives the seed lexicon in the manual's order, then serves words. */
import { LANGS, type Lang, type Pos } from "./languages";
import { ALIASES, DERIVED, FIXED, LEXICON } from "./lexicon";
import { derive, type DerivationKind } from "./inflect";
import { newContext, synthesize, type Concept, type Derivation, type SynthesisContext } from "./synthesize";

export interface Word {
  id: string;
  pos: Pos;
  gloss: string;
  /** The stem (or, for particles/pronouns, the word). */
  stem: string;
  derivation?: Derivation;
  derivedFrom?: { from: string; kind: DerivationKind; steps: string[] };
  fixedNote?: string;
  /** Where this word came from. */
  origin: "manual" | "derived" | "fixed" | "new";
}

export class Engine {
  readonly words = new Map<string, Word>();
  readonly derivations: Derivation[] = [];
  /** The Visby Queue state after the whole manual has been derived. */
  readonly canonicalQueue: Lang[];
  private readonly taken: Map<string, string>;

  constructor() {
    const ctx = newContext();
    for (const c of LEXICON) {
      const d = synthesize(c, ctx);
      this.derivations.push(d);
      this.words.set(c.id, { id: c.id, pos: c.pos, gloss: c.gloss ?? c.id, stem: d.form, derivation: d, origin: "manual" });
    }
    for (const e of DERIVED) {
      const base = this.words.get(e.from)!;
      const r = derive(base.stem, e.kind);
      ctx.taken.set(r.form, e.id);
      this.words.set(e.id, { id: e.id, pos: e.pos, gloss: e.gloss, stem: r.form, derivedFrom: { from: e.from, kind: e.kind, steps: r.steps }, origin: "derived" });
    }
    for (const f of FIXED) {
      ctx.taken.set(f.form, f.id);
      this.words.set(f.id, { id: f.id, pos: f.pos, gloss: f.gloss, stem: f.form, fixedNote: f.note, origin: "fixed" });
    }
    this.canonicalQueue = ctx.queue.snapshot();
    this.taken = ctx.taken;
  }

  /** Resolve an English lemma (or alias) to a known word. */
  lookup(lemma: string, pos?: Pos): Word | undefined {
    const key = lemma.trim().toLowerCase();
    const id = ALIASES[key] ?? key;
    const w = this.words.get(id) ?? this.words.get(lemma);
    if (!w) return undefined;
    if (pos && w.pos !== pos && !(pos === "noun" && w.pos === "noun")) {
      // Allow adj→adv and noun/adj derivations to resolve through the base word.
      if (!(pos === "adv" && w.pos === "adj")) return w; // caller decides
    }
    return w;
  }

  /** A fresh synthesis context starting from the canonical post-manual queue. */
  context(): SynthesisContext {
    return { queue: newContext(this.canonicalQueue).queue, taken: new Map(this.taken) };
  }

  /** Derive a concept the manual does not cover. Does not mutate the engine; the caller owns the context. */
  deriveNew(concept: Concept, ctx: SynthesisContext): Derivation {
    return synthesize({ ...concept, manual: undefined }, ctx);
  }

  /** All manual entries whose engine derivation differs from the manual's decree. */
  divergences(): { id: string; manual: string; derived: string }[] {
    return this.derivations.filter((d) => d.matchesManual === false).map((d) => ({ id: d.id, manual: d.form, derived: d.derived }));
  }

  static readonly LANGS = LANGS;
}

let shared: Engine | null = null;
export function getEngine(): Engine {
  return (shared ??= new Engine());
}
