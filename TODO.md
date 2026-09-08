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

## 4. Stack (suggested — adjust when building)

- TypeScript throughout; the engine as a dependency-free, pure package
  (`packages/engine`) so it can be tested in isolation and reused.
- Web UI as a static app (Vite + a small framework or vanilla) deployed on
  Cloudflare Workers/Pages, consistent with the other repos in this account.
- Vitest for the golden tests derived from the manual.

## 5. Finish

- Convenience scripts: `dev`, `test`, `build`, `deploy`.
- README: usage, derivation-order decision, deployment URL.
- Delete this file when done.
