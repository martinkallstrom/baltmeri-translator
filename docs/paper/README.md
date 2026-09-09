# Baltmeri paper

`baltmeri-paper.pdf` — *Baltmeri: Deterministic Synthesis of a Shared Language for the Baltic Sea from the Nine Languages of Its Shores* (Källström & Retourné, 2026).

Build (requires [Tectonic](https://tectonic-typesetting.github.io/) and the macOS system fonts Charter, Helvetica Neue, Menlo, STIX Two Text):

```bash
npx tsx scripts/paper-tables.ts   # regenerates tab-lexicon.tex from the engine
cd docs/paper && tectonic main.tex
```

Sections live in `sec-*.tex`; references in `refs.bib`; engine statistics quoted in the paper come from `scripts/paper-data.ts`.
