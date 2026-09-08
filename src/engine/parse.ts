/** Reverse direction: Baltmeri text → glossed analysis, from the grammar tables and known stems. */
import {
  CASES, COPULA, COPULA_INFINITIVE, NEGATION, NO, PRONOUNS, QUESTION, adjective, adverb, derive, infinitive, noun, pronoun, verb,
  type Case, type Degree, type Number_, type Person, type PronounId, type Tense
} from "./inflect";
import type { Engine, Word } from "./index";

export interface Analysis {
  lemma: string;
  gloss: string;
  pos: string;
  features: string;
  stem: string;
}

export interface ParsedToken {
  text: string;
  analyses: Analysis[];
}

const NUMBERS: Number_[] = ["sg", "pl"];
const TENSES: Tense[] = ["pres", "past", "fut"];
const PERSONS: Person[] = [1, 2, 3];
const DEGREES: Degree[] = ["pos", "comp", "sup"];

export class Parser {
  private readonly index = new Map<string, Analysis[]>();

  constructor(engine: Engine, extra: Word[] = []) {
    const add = (form: string, a: Analysis) => {
      const k = form.toLowerCase();
      const list = this.index.get(k) ?? [];
      if (!list.some((x) => x.lemma === a.lemma && x.features === a.features)) list.push(a);
      this.index.set(k, list);
    };
    const words = [...engine.words.values(), ...extra];
    for (const w of words) {
      const base = { lemma: w.id, gloss: w.gloss, stem: w.stem };
      switch (w.pos) {
        case "noun":
          for (const n of NUMBERS) for (const c of Object.keys(CASES) as Case[]) add(noun(w.stem, n, c).form, { ...base, pos: "noun", features: `${n}.${c}` });
          for (const n of NUMBERS) add(noun(derive(w.stem, "adjective").form, n).form, { ...base, pos: "adj", features: `${n} (-ne, from ${w.id})`, gloss: `${w.gloss}-ish, of ${w.gloss}` });
          add(derive(w.stem, "agent").form, { ...base, pos: "noun", features: "agent (-ja)", gloss: `${w.gloss}-er` });
          add(derive(w.stem, "diminutive").form, { ...base, pos: "noun", features: "diminutive (-ka)", gloss: `little ${w.gloss}` });
          break;
        case "adj":
          for (const n of NUMBERS) for (const d of DEGREES) add(adjective(w.stem, n, d).form, { ...base, pos: "adj", features: `${d}.${n}` });
          add(adverb(w.stem).form, { ...base, pos: "adv", features: "adv (-t)", gloss: `${w.gloss}-ly` });
          add(derive(w.stem, "abstract").form, { ...base, pos: "noun", features: "abstract (-us)", gloss: `${w.gloss}-ness` });
          break;
        case "verb":
          if (w.id === "be") break;
          add(infinitive(w.stem).form, { ...base, pos: "verb", features: "inf" });
          for (const t of TENSES) for (const n of NUMBERS) for (const p of PERSONS) add(verb(w.stem, t, p, n).form, { ...base, pos: "verb", features: `${t}.${p}${n}` });
          add(derive(w.stem, "agent").form, { ...base, pos: "noun", features: "agent (-ja)", gloss: `${w.gloss.replace(/^to /, "")}-er` });
          break;
        case "pron":
          break;
        default:
          add(w.stem, { ...base, pos: w.pos, features: "" });
      }
    }
    for (const t of TENSES) for (const n of NUMBERS) for (const p of PERSONS) add(COPULA[t][n][p], { lemma: "be", gloss: "to be", stem: "es-/bu-", pos: "verb", features: `${t}.${p}${n}` });
    add(COPULA_INFINITIVE, { lemma: "be", gloss: "to be", stem: "bu", pos: "verb", features: "inf" });
    for (const id of Object.keys(PRONOUNS) as PronounId[]) {
      const w = engine.words.get(id);
      for (const c of Object.keys(CASES) as Case[]) add(pronoun(id, c), { lemma: id, gloss: w?.gloss ?? id, stem: PRONOUNS[id].nom, pos: "pron", features: c });
    }
    add(NEGATION, { lemma: "not", gloss: "not", stem: NEGATION, pos: "part", features: "" });
    add(NO, { lemma: "no", gloss: "no", stem: NO, pos: "part", features: "" });
    add(QUESTION, { lemma: "question", gloss: "(yes/no question)", stem: QUESTION, pos: "part", features: "" });
  }

  parse(text: string): ParsedToken[] {
    const tokens = text.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) ?? [];
    return tokens.map((t) => {
      const direct = this.index.get(t.toLowerCase()) ?? [];
      if (direct.length) return { text: t, analyses: direct };
      // Head-final compounds: try splitting into two known stems.
      for (let i = 2; i < t.length - 1; i++) {
        const a = this.index.get(t.slice(0, i).toLowerCase());
        const b = this.index.get(t.slice(i).toLowerCase());
        if (a?.length && b?.length) {
          return { text: t, analyses: [{ lemma: `${a[0].lemma}+${b[0].lemma}`, gloss: `${a[0].gloss} ${b[0].gloss} (compound)`, pos: b[0].pos, features: b[0].features, stem: `${a[0].stem}+${b[0].stem}` }] };
        }
      }
      return { text: t, analyses: [] };
    });
  }
}
