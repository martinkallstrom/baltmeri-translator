# Baltmeri Translator

**Baltmeri** is a constructed language for the Baltic Sea: every word is decided
by a fixed, repeatable procedure applied to the nine languages spoken on its
shores (Finnish, Estonian, Latvian, Lithuanian, Polish, Russian, Swedish,
Danish, German), voting as four equal families, with ties broken by the
geography of the sea itself. This repository holds the language's founding
Manual, a deterministic engine that implements it, a public translator, and a
paper describing the whole.

- **Live translator:** https://baltmeri-translator.kindship-ai.workers.dev
- **Project page:** https://baltmeri-translator.kindship-ai.workers.dev/about/
- **Paper (PDF):** [docs/paper/baltmeri-paper.pdf](docs/paper/baltmeri-paper.pdf)
- **The Manual:** [docs/baltmeri_manual.md](docs/baltmeri_manual.md) — the authoritative specification of the language

> *Meri er men.* — The sea is ours.

## Why

Nine languages ring the Baltic and none of them names it from the sea's point
of view: three call it the East Sea, one the West Sea, four the Baltic after a
Latin coinage of 1075. The sea they share is the largest human-induced hypoxic
area in the world, and half a century of joint institutions has not produced a
shared identity. Baltmeri is an attempt to give the sea a voice of its own — a
language that belongs to all nine shores because it was generated from all of
them, and to none because no one chose its words. The [paper](docs/paper/baltmeri-paper.pdf)
develops the argument, the linguistics and the evaluation.

## How a word is decided

1. **Gather** the nine dictionary forms, strip citation endings, normalise to a
   common inventory, reduce each to a **consonant skeleton** (voicing and
   palatalisation ignored: Danish *sild* and Polish *śledź* are both S-L-T).
2. **Hanse Rule.** A skeleton shared by two or more families is inherited.
3. **Domain Rule.** Other content words go to the family that owns their
   semantic domain: sea, fish, weather, landscape → Finnic; body, kinship,
   colour, farm → Baltic; trade, town, law, abstractions → Germanic; verbs and
   adjectives of quality → Slavic.
4. **Family Vote.** Function words and every inflectional ending: one family,
   one vote.
5. **Fallback, Collision, Repair.** Queue head with a form; a later concept
   takes its runner-up; clusters are repaired.

Ties go to the **Visby Queue** — the nine languages ranked by distance from
Visby on Gotland, the medieval Hanseatic hub — and the winner rotates to the
back so no language keeps deciding.

Because it is an algorithm, every word can **show its work**: click any word in
the translator to see the nine forms that voted, which family won, and how the
tie was broken.

## How the translator works

```
source text ──▶ analysis (LLM, constrained JSON) ──▶ engine (deterministic) ──▶ Baltmeri + trace
                lemmas + case/number/tense/person        derive · inflect · repair        │
                nine dictionary forms for new lemmas                                      ▼
                                                                              legend (LLM, from the trace)
```

The language model never writes a Baltmeri word. It analyses the sentence and
supplies dictionary forms; the engine derives and inflects every word; a
second call turns the engine's trace into the explanatory "legend" under each
translation. Spoken output uses Eleven Multilingual v2 with no language
setting. New words are coined from the queue state the Manual leaves behind,
and a word's first derivation is kept forever ("first derivation wins").

Interpretations of the Manual are recorded in [docs/decisions.md](docs/decisions.md).
The engine reproduces 28 of the Manual's 58 lexical decrees from the rules
alone; the other 30 are used as decreed and flagged as such in every trace.
The list is pinned in `test/lexicon.test.ts` so it cannot drift silently.

## Repository layout

```
docs/baltmeri_manual.md   the Manual (§0–§13)
docs/decisions.md         where the Manual is silent or ambiguous, what the engine does
docs/paper/               the paper: LaTeX sources, refs.bib, built PDF
docs/index.html           project page (GitHub Pages-ready; also served at /about)
src/engine/               pure TypeScript, no dependencies — runs in the Worker and in tests
  languages.ts            families, Visby Queue order, domains
  normalize.ts            §2 Normalization Table, skeletons, citation stripping
  queue.ts                the Visby Queue with the Rota Rule
  synthesize.ts           §3 Rules 0–5
  repair.ts               §3 Rule 6
  inflect.ts              §4–§8 tables
  lexicon.ts              §12 seed lexicon with nine sources per entry, in Manual order
  render.ts               analysed sentence → Baltmeri text with per-word trace
  parse.ts                Baltmeri → glossed analysis
src/server/               Anthropic calls (structured outputs), KV cache, orchestration
src/pages/                Astro UI and API routes (translate, tutorial, speak, lexicon)
scripts/                  lexicon check, paper data and tables, site sync
test/                     117 golden tests derived from the Manual
```

## Develop

Requirements: Node 22+, a Cloudflare account, an Anthropic API key, an
ElevenLabs API key.

```bash
npm install
cp .env.example .env        # fill in ANTHROPIC_API_KEY and ELEVENLABS_API_KEY
cp .env .dev.vars           # wrangler dev reads this
npm test                    # engine golden tests
npm run check               # astro type check
npm run build && npm run preview   # http://localhost:8787
```

Useful scripts:

```bash
npx tsx scripts/check-lexicon.ts   # every seed entry: manual form vs engine form
npx tsx scripts/paper-data.ts      # the statistics quoted in the paper
```

## Deploy

The app is an Astro site running as a Cloudflare Worker. To deploy your own:

1. In `wrangler.jsonc`, set `account_id` to yours (or remove it if you have a
   single account) and create a KV namespace for the derivation cache:
   `npx wrangler kv namespace create BALTMERI_CACHE`, then paste its id.
2. Upload the secrets: `npx wrangler secret put ANTHROPIC_API_KEY` and
   `npx wrangler secret put ELEVENLABS_API_KEY`.
3. `npm run deploy`.

Every response carries `X-Robots-Tag: noindex`; the site is public but
unindexed.

## Paper

*Baltmeri: Deterministic Synthesis of a Shared Language for the Baltic Sea from
the Nine Languages of Its Shores.* Martin Källström and Belinda Retourné, 2026.
Sources and build instructions in [docs/paper/](docs/paper/); the PDF is
committed. Tables and figures are generated from the engine's own output.

```bibtex
@techreport{kallstrom2026baltmeri,
  title       = {Baltmeri: Deterministic Synthesis of a Shared Language
                 for the Baltic Sea from the Nine Languages of Its Shores},
  author      = {K{\"a}llstr{\"o}m, Martin and Retourn{\'e}, Belinda},
  institution = {The Baltmeri Project},
  year        = {2026},
  url         = {https://github.com/martinkallstrom/baltmeri-translator}
}
```

## Contributing

The most useful contributions are to the **lexicon**: better first-dictionary
translations for the nine languages, or new concepts with their nine forms and
a domain. Add them to `src/engine/lexicon.ts`, run `npm test`, and if an entry's
derivation changes, update the pinned divergence list in `test/lexicon.test.ts`
and say why in the pull request. Interpretive changes to the rules belong in
`docs/decisions.md` as well as in code.

## License

MIT — see [LICENSE](LICENSE). The Manual, the paper and the code are all
released under the same terms; if you build on the language, a citation is
appreciated.
