# Baltmeri Translator

A "Google Translate"-style interface for **Baltmeri** — a fictional language
synthesized deterministically from the nine languages that ring the Baltic Sea
(Finnish, Estonian, Latvian, Lithuanian, Polish, Russian, Swedish, Danish,
German).

The language itself is defined in [`docs/baltmeri_manual.md`](docs/baltmeri_manual.md),
the authoritative specification. Because every Baltmeri word is the product of a
fixed, repeatable procedure (family-level voting, the Visby Queue tie-breaker,
the Normalization Table), the translator can do something Google Translate
cannot: **show its work** — for every output word, the source forms that voted,
which family won, and how ties were broken.

## Intended interface

- Two panes, source on the left and Baltmeri on the right, with a swap button
  for the reverse direction.
- Source language selectable among the nine Baltic Sea languages (plus English
  as a convenience pivot).
- Word-level derivation trace on hover/click: normalized source forms, vote
  tally, Visby Queue state, resulting stem and inflection.
- Grammar-aware output: noun cases, adjective comparison, verb conjugation and
  syntax per manual §4–§9, not word-for-word substitution.

## Status

Repository scaffold only. Planned as an Astro app deployed as a Cloudflare
Worker via wrangler. See [`TODO.md`](TODO.md) for the build plan.
