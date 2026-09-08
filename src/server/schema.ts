/** Zod schemas for the structured LLM outputs. Structured outputs need every field present, so optionals are nullable. */
import { z } from "zod";
import { DOMAINS } from "../engine/languages";

export const CaseZ = z.enum(["nom", "gen", "acc", "ine", "ade", "ela", "all"]);
export const NumberZ = z.enum(["sg", "pl"]);

export const WordSpecZ = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("noun"), lemma: z.string(), number: NumberZ, case: CaseZ, compoundWith: z.string().nullable(), derive: z.enum(["abstract", "agent", "diminutive", "adjective"]).nullable() }),
  z.object({ kind: z.literal("adj"), lemma: z.string(), number: NumberZ, degree: z.enum(["pos", "comp", "sup"]) }),
  z.object({ kind: z.literal("adv"), lemma: z.string(), fromAdjective: z.boolean() }),
  z.object({ kind: z.literal("verb"), lemma: z.string(), tense: z.enum(["pres", "past", "fut"]), person: z.enum(["1", "2", "3"]), number: NumberZ, infinitive: z.boolean() }),
  z.object({ kind: z.literal("pron"), lemma: z.enum(["I", "you", "he", "we", "you-pl", "they"]), case: CaseZ }),
  z.object({ kind: z.literal("num"), value: z.number() }),
  z.object({ kind: z.literal("word"), lemma: z.string() }),
  z.object({ kind: z.literal("name"), text: z.string(), case: CaseZ, number: NumberZ }),
  z.object({ kind: z.literal("punct"), text: z.string() })
]);

export const SentenceZ = z.object({
  words: z.array(WordSpecZ),
  negated: z.boolean(),
  question: z.boolean(),
  end: z.string()
});

export const NewConceptZ = z.object({
  id: z.string(),
  pos: z.enum(["noun", "verb", "adj", "adv", "pron", "num", "conj", "part", "prep", "other"]),
  domain: z.enum(DOMAINS as [string, ...string[]]).nullable(),
  gloss: z.string(),
  sources: z.object({ fi: z.string(), et: z.string(), lv: z.string(), lt: z.string(), pl: z.string(), ru: z.string(), sv: z.string(), da: z.string(), de: z.string() })
});

export const AnalysisZ = z.object({
  detectedLanguage: z.string(),
  sentences: z.array(SentenceZ),
  newConcepts: z.array(NewConceptZ),
  notes: z.string()
});
export type Analysis = z.infer<typeof AnalysisZ>;

export const TutorialZ = z.object({ tutorial: z.string() });

export const ReverseZ = z.object({ translation: z.string(), tutorial: z.string() });
