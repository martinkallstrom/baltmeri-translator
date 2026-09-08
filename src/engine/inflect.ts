/** §4–§8 — inflection tables. Every ending is the manual's vote-winner. */
import { repair, type Repaired } from "./repair";

export type Case = "nom" | "gen" | "acc" | "ine" | "ade" | "ela" | "all";
export type Number_ = "sg" | "pl";
export type Tense = "pres" | "past" | "fut";
export type Person = 1 | 2 | 3;
export type Degree = "pos" | "comp" | "sup";

export const CASES: Record<Case, { ending: string; meaning: string }> = {
  nom: { ending: "", meaning: "subject" },
  gen: { ending: "n", meaning: "of, 's" },
  acc: { ending: "a", meaning: "direct object" },
  ine: { ending: "se", meaning: "in, inside" },
  ade: { ending: "l", meaning: "on, at; when" },
  ela: { ending: "ste", meaning: "from, out of" },
  all: { ending: "le", meaning: "to, onto" }
};

export const PLURAL = "i";

/** §4 — stem + -i + case. Accusative plural = nominative plural. */
export function noun(stem: string, number: Number_ = "sg", kase: Case = "nom"): Repaired {
  const pl = number === "pl" ? PLURAL : "";
  const ending = number === "pl" && kase === "acc" ? "" : CASES[kase].ending;
  return repair(stem, pl, ending);
}

/** §5 — bare stems, number agreement only; -m comparative, -st superlative. */
export function adjective(stem: string, number: Number_ = "sg", degree: Degree = "pos"): Repaired {
  const deg = degree === "comp" ? "m" : degree === "sup" ? "st" : "";
  return repair(stem, deg, number === "pl" ? PLURAL : "");
}

/** §5 — adverb from adjective: -t. */
export function adverb(stem: string): Repaired {
  return repair(stem, "t");
}

/** §8 — derivation suffixes. */
export const DERIVATION = {
  abstract: "us", // dužus "size"
  agent: "ja",    // kalaja "fisher"
  diminutive: "ka", // kalaka "little fish"
  adjective: "ne" // solne "salty"
} as const;
export type DerivationKind = keyof typeof DERIVATION;

export function derive(stem: string, kind: DerivationKind): Repaired {
  return repair(stem, DERIVATION[kind]);
}

export const PERSON_ENDINGS: Record<Number_, Record<Person, string>> = {
  sg: { 1: "u", 2: "t", 3: "" },
  pl: { 1: "me", 2: "te", 3: "" }
};

export const INFINITIVE = "te";
export const PAST = "l";
export const FUTURE = "s";

/** §7 — regular verb. */
export function verb(stem: string, tense: Tense, person: Person, number: Number_): Repaired {
  const t = tense === "past" ? PAST : tense === "fut" ? FUTURE : "";
  return repair(stem, t, PERSON_ENDINGS[number][person]);
}

export function infinitive(stem: string): Repaired {
  return repair(stem, INFINITIVE);
}

/** §7 — the suppletive copula. */
export const COPULA: Record<Tense, Record<Number_, Record<Person, string>>> = {
  pres: { sg: { 1: "esu", 2: "est", 3: "er" }, pl: { 1: "esme", 2: "este", 3: "er" } },
  past: { sg: { 1: "bulu", 2: "bulit", 3: "bul" }, pl: { 1: "bulme", 2: "bulte", 3: "bul" } },
  fut: { sg: { 1: "busu", 2: "bust", 3: "bus" }, pl: { 1: "busme", 2: "buste", 3: "bus" } }
};
export const COPULA_INFINITIVE = "bute";

/** §6 — pronouns. Genitives are listed by the manual; other cases are regular. */
export type PronounId = "I" | "you" | "he" | "we" | "you-pl" | "they";
export const PRONOUNS: Record<PronounId, { nom: string; gen: string }> = {
  I: { nom: "ja", gen: "jan" },
  you: { nom: "tu", gen: "tun" },
  he: { nom: "han", gen: "hanen" },
  we: { nom: "me", gen: "men" },
  "you-pl": { nom: "juus", gen: "juusen" },
  they: { nom: "de", gen: "den" }
};

export function pronoun(id: PronounId, kase: Case = "nom"): string {
  const p = PRONOUNS[id];
  if (kase === "nom") return p.nom;
  if (kase === "gen") return p.gen;
  return repair(p.nom, CASES[kase].ending).form;
}

export const NEGATION = "ne";
export const NO = "nei";
export const QUESTION = "li";
