import { writeFileSync } from "node:fs";
import { Engine } from "../src/engine/index";
import { LEXICON } from "../src/engine/lexicon";
const e = new Engine();
const esc = (s: string) => s.replace(/&/g, "\\&").replace(/%/g, "\\%").replace(/_/g, "\\_");
const RULE: Record<string, string> = { hanse: "R1", domain: "R2", vote: "R3", fallback: "R4" };
const rows: string[] = [];
for (const d of e.derivations) {
  const c = LEXICON.find((x) => x.id === d.id)!;
  const status = d.matchesManual === null ? "—" : d.matchesManual ? "\\checkmark" : "$\\dagger$";
  const src = (["fi", "et", "lv", "lt", "pl", "ru", "sv", "da", "de"] as const).map((l) => c.sources[l] ?? "—").join(" · ");
  rows.push(`${esc(c.gloss ?? d.id)} & \\textbf{${d.form}} & ${d.matchesManual === false ? d.derived : ""} & ${RULE[d.rule]} & ${d.family ?? ""}/${d.decidedBy ?? ""} & ${status} & {\\footnotesize ${esc(src)}} \\tabularnewline`);
}
const header = String.raw`\setlength{\tabcolsep}{3pt}
\begin{tabular}{@{}llllllp{9.2cm}@{}}
\toprule
Gloss & Baltmeri & Engine & Rule & Family/by & & Sources (fi · et · lv · lt · pl · ru · sv · da · de) \tabularnewline
\midrule
`;
writeFileSync("docs/paper/tab-lexicon.tex", header + rows.join("\n").replace(/reņģe/g, "{\\stixfont reņģe}") + "\n\\bottomrule\n\\end{tabular}\n");
console.log(rows.length, "rows");
