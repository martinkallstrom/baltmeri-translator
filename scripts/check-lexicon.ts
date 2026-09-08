import { Engine } from "../src/engine/index";
const e = new Engine();
let ok = 0, bad = 0;
for (const d of e.derivations) {
  if (d.matchesManual === null) { console.log(`  ${d.id.padEnd(16)} -> ${d.derived}  [${d.rule}]`); continue; }
  if (d.matchesManual) ok++; else bad++;
  console.log(`${d.matchesManual ? "OK " : "XX "}${d.id.padEnd(16)} manual=${d.form.padEnd(10)} derived=${d.derived.padEnd(12)} [${d.rule}${d.decidedBy ? " " + d.decidedBy : ""}] ${d.gathered.map(g=>g.lang+":"+g.stem).join(" ")}`);
}
console.log({ ok, bad, queue: e.canonicalQueue.join(",") });
for (const id of ["size","fisher","sailor","little-fish","salty"]) console.log(id, e.words.get(id)!.stem);
