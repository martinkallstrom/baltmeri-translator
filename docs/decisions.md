# Engine decisions

Where the manual is silent, ambiguous, or contradicts its own examples, the engine
does the following. Every decision is visible in the per-word trace in the UI.

## Normalization and skeletons (§2)

- Polish *cz* and Russian *ч* stay **č** (the manual's own outputs use it: *četri*, *odpočiv*);
  *sz/ш* → š, *ż/rz/ж* → ž.
- Skeleton classes: P (p b f), T (t d ts dz), K (k g), S (s z š ž), Č, M, N, L, R, V, J, H.
  Affricates fold into their stop so that *śledź* → S-L-T matches *sild*.
- Geminates collapse (*sill* → sil), multi-word citations fuse (*i går* → igor).
- Citation endings are stripped from the raw word before normalization so Polish *-ć*
  and Russian *-ть* are recognisable. A stripped stem must keep at least two letters
  and a vowel; otherwise the next, lighter ending pattern is tried (*być* → by,
  *chować* → chow-, not *ch-*; *ssać* → ssa-, not *s-*).
- Latvian and Lithuanian infinitives lose their theme vowel with the ending
  (*zināt* → zin-, *stovėti* → stov-), so that verb stems are comparable with the
  Slavic and Germanic ones.
- Polish *rz* devoices to **š** after *p, t, k* (*przychodzić* → pšihodz-, *trzy* → tši),
  as in Polish pronunciation; elsewhere it is ž.

## Hanse Rule matching (§3 Rule 1)

"At most one differing position" applies only to skeletons of three or more consonants
(*dzintar*, *četri*). One- and two-consonant skeletons must agree exactly; otherwise
S-L (salt) would match S-R (island) and almost everything becomes a Hanse word.

## Filling in a Hanse word

The vowels and any disputed consonant are decided by a whole-stem family vote: each
supporting family puts forward its front-ranked member's stem, most families wins,
ties go to the Visby Queue. (A position-by-position vote was tried and produced
unpronounceable blends such as *muur* for sea.)

## Family ballots (§3 Rule 3)

A family votes when two members' skeletons match (one differing position allowed at any
length, as the manual states), or when only one member has a form at all. Germanic votes
when any two of its three members agree.

## Repair (§3 Rule 6)

Only clusters created by attaching a suffix are repaired; a cluster inside a derived
stem is left alone (*Baltmeri*, *Gotland*, *tursk*). *j* is a semivowel and never forms a
cluster (*žeglja*, *kalaja*). Epenthesis follows the manual's own verb paradigm:
before a final single-consonant suffix (*vid-s-t* → vidsit), otherwise right after the
stem (*vid-l-me* → vidilme, *pospolit-st* → pospolitist). A final *-s* is tolerated
(*vids*, *bus*). Consequence: the engine writes *bootse* where the manual once prints
*bootise*.

## Negation

*ne* precedes the verb, except with the copula where it precedes the predicate, as in
the manual's text (*Baltmeri er ne glembok meri*).

## The seed lexicon: Manual, then Leipzig–Jakarta

The seed lexicon has two blocks. The **Manual's** 58 decreed items (plus numerals six
to ten and the derived words) are derived first, in the manual's order (§0, §3 → §11),
from the initial queue. The **Leipzig–Jakarta list** — the 100 meanings found least
borrowable across the World Loanword Database (Tadmor, Haspelmath & Taylor 2010) —
is derived next, in list order, from the queue state the Manual leaves behind
(`engine.manualQueue`). Sixteen of its meanings are already fixed by the Manual; the
other 84 (`src/engine/core.ts`) have no manual decree: what the procedure yields is the
word. Their nine source forms were written by hand as first-dictionary citation forms.

The copula stems *es-* and *er* are registered as taken before anything is derived, so
no later concept can coin them (the procedure alone would have made "to eat" *es-*,
giving *esu* both "I am" and "I eat"; "eat" takes its runner-up, *söö-*).

## Derivation order and the Visby Queue

The queue state after the whole seed lexicon (Manual + Leipzig–Jakarta) has been
derived is the **canonical queue**. Every translation request starts a fresh queue from
the canonical state and derives new concepts in order of first appearance in the
request. (The paper, written before the core list was added, describes the post-Manual
queue as canonical; that state is still recorded as `manualQueue`.) A concept's first derivation is cached (Cloudflare KV) and
reused forever after, so a word never changes once it has been coined ("first
derivation wins"), while two users translating different texts cannot perturb each
other's tie-breaks.

## Manual decrees

The manual is authoritative. Where the rules alone give a different form from the manual's
lexicon, the manual's form is used and the trace shows both ("manual decree"). Currently
28 of the 58 manual entries reproduce from the rules alone; the other 30 are listed in
`test/lexicon.test.ts` and the test fails if that list drifts.
