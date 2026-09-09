import { Engine } from "../src/engine/index";
import { LEIPZIG_JAKARTA } from "../src/engine/core";
const e = new Engine();
const ids = new Set(LEIPZIG_JAKARTA.map((c) => c.id));
const byRule: Record<string, number> = {}; const byFam: Record<string, number> = {};
for (const d of e.derivations.filter((d) => ids.has(d.id))) {
  byRule[d.rule] = (byRule[d.rule] ?? 0) + 1; if (d.family) byFam[d.family] = (byFam[d.family] ?? 0) + 1;
  const tie = d.hanse?.slots[0]?.tie?.decider ?? d.vote?.tie?.decider ?? d.fallback?.winner ?? "";
  console.log(`${d.id.padEnd(8)} ${d.form.padEnd(10)} ${d.rule.padEnd(8)} ${(d.family ?? "").padEnd(9)} ${(d.decidedBy ?? "").padEnd(3)} ${tie.padEnd(3)} ${d.collision ? "COLLISION(" + d.collision.clashedWith + ")" : ""} ${d.gathered.map((g) => g.lang + ":" + g.stem).join(" ")}`);
}
console.log({ n: ids.size, byRule, byFam, manualQueue: e.manualQueue.join(","), canonicalQueue: e.canonicalQueue.join(","), words: e.words.size });
const forms = [...e.words.values()].map((w) => w.stem); const dup = forms.filter((f, i) => forms.indexOf(f) !== i);
console.log("duplicate forms:", dup);
