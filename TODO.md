# TODO

Goal: implement a Google Translate-like web interface for Baltmeri, driven by
a deterministic engine that follows `docs/baltmeri_manual.md` exactly.

## 1. Read the manual, then encode it

The manual is the spec. Encode it as data + rules, not prose:

- **§1 Visby Queue + Rota Rule** — the queue is *stateful*; ties rotate the
  winner to the back. Derivation order (§3 → §10, top to bottom) must be
  reproduced exactly or results diverge. Model this as an explicit,
  serializable state so the trace can show queue state at every tie.
- **§2 Normalization Table** — implement as an ordered rewrite table per source
  language; unit-test every example row in the manual (*båt* → bot,
  *yksi* → üks, *võrk* → vörk, *jūs* → juus, *głęboki* → glembok, …).
- **§3 Synthesis Engine** — family-level voting (one family, one vote).
- **§4–§9 Grammar** — nouns, adjectives/comparison/adverbs, pronouns and
  numerals, verbs, derivation, syntax. Encode paradigms as tables.
- **§12 Mini-lexicon** — seed dictionary. Every entry becomes a golden test:
  re-deriving it from the nine source forms must yield the manual's word.
- **§10–§11 Example sentences and short text** — end-to-end golden tests for
  the full pipeline.
- **§13 Recipe card** — the compact algorithm; use it as the engine's checklist.

## 2. Source dictionaries

Synthesis needs the nine source-language forms for each concept.

- Start with the mini-lexicon (§12) as a hand-curated dictionary.
- For open vocabulary, decide on a source: bundled wordlists (e.g. Wiktionary
  extracts) or an LLM lookup step that returns the nine translations, which
  are then fed to the *deterministic* engine. Keep the LLM strictly upstream of
  the engine — it supplies inputs, never the Baltmeri output.
- Cache derived words so the Visby Queue state stays consistent across
  sessions (the queue mutates on ties; order of first derivation matters —
  document the canonical derivation order or reset the queue per sentence, and
  record the decision in the README).

## 3. Interface

- Two-pane layout with swap, source-language selector (nine languages + English
  pivot), live translation on input.
- Reverse direction (Baltmeri → source) via the cached derivations and the
  grammar tables.
- Derivation trace per word: normalized forms, vote tally, family winner, tie
  breaks with queue state, inflection applied.
- Keyboard: Ctrl/Cmd+Enter to translate, Ctrl/Cmd+Shift+S to swap.

## 4. Stack (decided)

- **Astro** app deployed as a **Cloudflare Worker** with **wrangler**.
  Reference implementation for the same setup:
  `~/Projects/nuvai-health/nuvai-financial` (`astro.config.mjs` with
  `@astrojs/cloudflare`, `wrangler.jsonc` with the `assets` binding and
  `nodejs_compat`, `src/worker.ts` entrypoint, scripts `dev`/`build`/
  `preview`/`deploy`).
- The translation engine as a pure, dependency-free TypeScript package
  (`packages/engine` or `src/engine/`) so it runs both in the browser and in
  the Worker, and can be tested in isolation.
- Translation API as an Astro endpoint (`src/pages/api/translate.json.ts`)
  backed by the engine; the UI calls it, so the reverse direction and the
  derivation cache can live server-side.
- Vitest for the golden tests derived from the manual.

## 5. Voice synthesis (decided)

- Speak Baltmeri output with **ElevenLabs**, model **Eleven Multilingual v2**
  (`eleven_multilingual_v2`).
- **No language override**: do not pass `language_code`; let the model infer
  pronunciation from the text. Baltmeri is not a supported language, and its
  orthography (§2) is closest to a Baltic/Finnic blend, so forcing any single
  language code would bias the accent.
- Secrets live in `.env` (git-ignored): `ANTHROPIC_API_KEY` for the upstream
  LLM lookup step (§2 above), `ELEVENLABS_API_KEY` for TTS. Read them from the
  Worker environment, never from the client bundle.

## 6. Finish

- Convenience scripts: `dev`, `test`, `build`, `deploy`.
- README: usage, derivation-order decision, deployment URL.
- Delete this file when done.
