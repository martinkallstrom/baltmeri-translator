import type { APIRoute } from "astro";
import { getEngine } from "../../engine/index";
import { json } from "../../server/env";

export const prerender = false;

export const GET: APIRoute = async () => {
  const e = getEngine();
  return json({
    canonicalQueue: e.canonicalQueue,
    words: [...e.words.values()].map((w) => ({
      id: w.id, pos: w.pos, gloss: w.gloss, form: w.stem, origin: w.origin,
      rule: w.derivation?.rule, decidedBy: w.derivation?.decidedBy, family: w.derivation?.family,
      matchesManual: w.derivation?.matchesManual, derived: w.derivation?.derived,
      sources: w.derivation?.gathered.map((g) => ({ lang: g.lang, raw: g.raw, stem: g.stem, skeleton: g.skeleton.join("-") })),
      notes: w.derivation?.notes ?? (w.derivedFrom ? [`${w.derivedFrom.from} + -${w.derivedFrom.kind}`] : w.fixedNote ? [w.fixedNote] : [])
    }))
  });
};
