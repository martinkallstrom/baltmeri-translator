# Baltmeri Translator

A "Google Translate"-style interface for **Baltmeri** — a fictional language
synthesized deterministically from the nine languages that ring the Baltic Sea
(Finnish, Estonian, Latvian, Lithuanian, Polish, Russian, Swedish, Danish,
German).

**Live:** https://baltmeri-translator.kindship-ai.workers.dev (public, `noindex`).

The language is defined in [`docs/baltmeri_manual.md`](docs/baltmeri_manual.md),
the authoritative specification. Because every Baltmeri word is the product of a
fixed, repeatable procedure (family-level voting, the Visby Queue tie-breaker,
the Normalization Table), the translator can **show its work**: click any output
word to see the nine source forms that voted, which family won, and how ties
were broken.

## How a translation happens

1. **Analysis (LLM).** Claude reads the source text and produces a word-by-word
   specification: lemma, part of speech, case, number, tense, person, and the
   Baltmeri word order (SVO, adjective before noun, place before time). For every
   lemma the engine does not know it supplies the first dictionary translation in
   all nine languages. The LLM never writes a Baltmeri word.
2. **Synthesis (deterministic).** `src/engine/` normalizes the nine forms,
   computes consonant skeletons, and runs the manual's rules in order: Hanse →
   Domain → Family Vote → Fallback → Collision → Repair. Then it inflects.
3. **Legend (LLM).** Given the engine's trace, Claude writes the tutorial shown
   under the translation: which rule decided each word, who won, where the
   Visby Queue broke a tie, and where the manual decrees a form over its own rules.
4. **Voice.** ElevenLabs *Eleven Multilingual v2* with no language override; the
   model decides how Baltmeri sounds. Playable in the page and downloadable.

The reverse direction parses Baltmeri against the grammar tables and the known
lexicon, then Claude renders the gloss into the target language with its own legend.

Interpretations of the manual and the derivation-order decision are recorded in
[`docs/decisions.md`](docs/decisions.md). The language, its construction and the
engine are described in full in the paper
[`docs/paper/baltmeri-paper.pdf`](docs/paper/baltmeri-paper.pdf).

## Layout

```
src/engine/      pure TypeScript, no dependencies — runs in the Worker and in tests
  languages.ts   families, Visby Queue order, domains
  normalize.ts   §2 table, skeletons, citation stripping
  queue.ts       the Visby Queue with the Rota Rule
  synthesize.ts  §3 Rules 0–5
  repair.ts      §3 Rule 6
  inflect.ts     §4–§8 tables
  lexicon.ts     §12 seed lexicon with nine sources per entry, in manual order
  render.ts      analysed sentence → Baltmeri text with per-word trace
  parse.ts       Baltmeri → glossed analysis
src/server/      Anthropic calls (structured outputs), KV cache, orchestration
src/pages/       Astro UI and API routes (translate, tutorial, speak, lexicon)
test/            golden tests from the manual (117)
```

## Develop

```bash
npm install
cp .env.example .env        # ANTHROPIC_API_KEY, ELEVENLABS_API_KEY
cp .env .dev.vars           # wrangler dev reads this
npm test                    # engine golden tests
npm run build && npm run preview   # http://localhost:8787
```

`npm run deploy` builds and deploys to Cloudflare Workers via wrangler. Secrets
are set with `wrangler secret put ANTHROPIC_API_KEY` and
`wrangler secret put ELEVENLABS_API_KEY`; the derivation cache is the KV
namespace bound as `BALTMERI_CACHE` in `wrangler.jsonc`.

Keyboard: Ctrl/Cmd+Enter translates, Ctrl/Cmd+Shift+S swaps direction.
