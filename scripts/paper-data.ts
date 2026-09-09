import { Engine } from "../src/engine/index";
import { INITIAL_QUEUE, LANG_NAMES, type Lang } from "../src/engine/languages";
import { Parser } from "../src/engine/parse";
import { Renderer } from "../src/engine/render";

const e = new Engine();
const ds = e.derivations;
const withManual = ds.filter((d) => d.matchesManual !== null);
const byRule: Record<string, { total: number; ok: number }> = {};
for (const d of withManual) {
  byRule[d.rule] ??= { total: 0, ok: 0 };
  byRule[d.rule].total++;
  if (d.matchesManual) byRule[d.rule].ok++;
}
const byFamily: Record<string, number> = {};
for (const d of ds) if (d.family) byFamily[d.family] = (byFamily[d.family] ?? 0) + 1;
const byDecider: Record<string, number> = {};
for (const d of ds) if (d.decidedBy) byDecider[d.decidedBy] = (byDecider[d.decidedBy] ?? 0) + 1;
const ties = ds.filter((d) => d.hanse?.slots[0]?.tie || d.vote?.tie || d.fallback).length;
const rotations = ds.filter((d) => d.queueBefore.join() !== d.queueAfter.join()).length;
console.log(JSON.stringify({
  entries: ds.length, withManual: withManual.length, reproduced: withManual.filter((d) => d.matchesManual).length,
  byRule, byFamily, byDecider, ties, rotations, initialQueue: INITIAL_QUEUE, canonicalQueue: e.canonicalQueue,
  words: e.words.size
}, null, 1));
console.log("\n=== TABLE (id, manual, derived, rule, family, decider, tie)");
for (const d of ds) {
  const tie = d.hanse?.slots[0]?.tie?.decider ?? d.vote?.tie?.decider ?? d.fallback?.winner ?? "";
  console.log([d.id, d.form, d.derived, d.rule, d.family ?? "", d.decidedBy ?? "", tie, d.matchesManual === null ? "n/a" : d.matchesManual ? "yes" : "no"].join("\t"));
}
console.log("\n=== EXAMPLE TRACES");
for (const id of ["herring", "fish", "amber", "and", "question", "many", "grey"]) {
  const d = ds.find((x) => x.id === id)!;
  console.log(`\n# ${id} → ${d.form} (derived ${d.derived}) rule=${d.rule} family=${d.family} by=${d.decidedBy}`);
  console.log(d.gathered.map((g) => `${g.lang}:${g.raw}→${g.stem}[${g.skeleton.join("")}]`).join("  "));
  if (d.hanse) console.log("hanse", d.hanse.skeleton.join("-"), d.hanse.families.join("+"), "ballots", d.hanse.slots[0].perFamily.map((p) => `${p.family}:${p.value}`).join(","), d.hanse.slots[0].tie ? `tie→${d.hanse.slots[0].tie.decider} queue ${d.hanse.slots[0].tie.queueBefore.join(">")}` : "");
  if (d.vote) console.log("vote", d.vote.tally.map((t) => `${t.stem}:${t.families.join("+")}`).join(","), d.vote.tie ? `tie→${d.vote.tie.decider} queue ${d.vote.tie.queueBefore.join(">")}` : "");
  if (d.fallback) console.log("fallback", d.fallback.winner, d.fallback.queueBefore.join(">"));
  console.log(d.notes.join(" | "));
}
console.log("\n=== NEW WORD DEMO");
const r = new Renderer(e, [
  { id: "bread", pos: "noun", domain: "farm", sources: { fi: "leipä", et: "leib", lv: "maize", lt: "duona", pl: "chleb", ru: "хлеб", sv: "bröd", da: "brød", de: "Brot" } },
  { id: "buy", pos: "verb", domain: "action", sources: { fi: "ostaa", et: "ostma", lv: "pirkt", lt: "pirkti", pl: "kupić", ru: "покупать", sv: "köpa", da: "købe", de: "kaufen" } },
  { id: "child", pos: "noun", domain: "kinship", sources: { fi: "lapsi", et: "laps", lv: "bērns", lt: "vaikas", pl: "dziecko", ru: "ребёнок", sv: "barn", da: "barn", de: "Kind" } },
  { id: "market", pos: "noun", domain: "trade", sources: { fi: "tori", et: "turg", lv: "tirgus", lt: "turgus", pl: "targ", ru: "торг", sv: "torg", da: "torv", de: "Markt" } },
  { id: "ship", pos: "noun", domain: "sea", sources: { fi: "laiva", et: "laev", lv: "kuģis", lt: "laivas", pl: "statek", ru: "корабль", sv: "skepp", da: "skib", de: "Schiff" } },
  { id: "hand", pos: "noun", domain: "body", sources: { fi: "käsi", et: "käsi", lv: "roka", lt: "ranka", pl: "ręka", ru: "рука", sv: "hand", da: "hånd", de: "Hand" } }
]);
for (const d of r.newDerivations) {
  const tie = d.hanse?.slots[0]?.tie?.decider ?? d.vote?.tie?.decider ?? "";
  console.log(`${d.id}\t${d.form}\t${d.rule}\t${d.family}\t${d.decidedBy}\t${tie}\t${d.gathered.map((g) => `${g.lang}:${g.stem}[${g.skeleton.join("")}]`).join(" ")}`);
}
console.log("\n=== PARSE DEMO");
const p = new Parser(e);
for (const t of p.parse("Peleekhüljei odpočiv kaljuil suvil.")) console.log(t.text, "→", t.analyses.map((a) => `${a.lemma} ${a.pos} ${a.features}`).join(" | "));
