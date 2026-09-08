# BALTMERI
## A Manual for the Deterministic Synthesis of a Baltic Sea Language

---

### 0. The premise

Nine languages ring the Baltic Sea. They belong to four families that have traded, fished, fought and intermarried across the same water for a thousand years, and yet they mostly cannot understand each other. Baltmeri is the answer to a thought experiment: *what if the sea itself had a grammar, and every word in it were decided by a fixed, repeatable procedure applied to those nine languages?*

The word "deterministic" is doing real work. Two people who follow this manual with the same nine dictionaries must arrive at the same Baltmeri word. Nothing is chosen by taste. Where the nine languages agree, Baltmeri simply inherits. Where they disagree, a fixed voting and tie-breaking procedure decides. The only human input is the manual itself.

The name is the first product of the procedure: **balt-** is shared by Baltic, Slavic and Germanic speakers, and **meri** is what the Finns and Estonians call the sea (and what the Slavs almost call it: *more*). So: **Baltmeri**.

---

### 1. The source languages and the Visby Queue

The nine sources, grouped into four families:

| Family | Members | Abbrev. |
|---|---|---|
| Finnic | Finnish, Estonian | fi, et |
| Baltic | Latvian, Lithuanian | lv, lt |
| Slavic | Polish, Russian | pl, ru |
| Germanic | Swedish, Danish, German | sv, da, de |

Voting happens at the **family** level (one family, one vote), so Germanic's three members do not swamp the others.

When a vote ties, the tie is broken by the **Visby Queue**: the nine languages ranked by the straight-line distance from Visby on Gotland — the old Hanseatic hub in the middle of the sea — to their nearest major coastal city.

> Initial Visby Queue: **Swedish, Latvian, Lithuanian, Estonian, Finnish, Polish, German, Danish, Russian**

A tie goes to the tied form supported by the language nearest the *front* of the queue. That language then moves to the *back*. This is the **Rota Rule**: no single language may keep winning ties. Because the queue changes state, the manual fixes the order in which things are derived (§3 → §10, top to bottom); anyone re-deriving Baltmeri must follow the same order.

---

### 2. Phonology and normalization

Baltmeri uses only sounds that at least three of the nine languages share comfortably.

**Consonants:** p t k b d g m n l r s š z ž v j h ts dz
**Vowels:** a e i o u ä ö ü — long vowels written doubled (aa, ee, üü).
**Stress:** always on the first syllable (Finnish, Estonian, Latvian and — in native words — Lithuanian agree; German and Swedish lean that way; no family strongly objects).

Every source word is passed through the **Normalization Table** before anything else happens:

| Source feature | Becomes | Example |
|---|---|---|
| sv/da *å*, fi/et *oo* | o / oo | *båt* → bot |
| sv/de *y*, fi/et *y/ü*, de *ü* | ü | *yksi* → üks |
| et *õ* | ö | *võrk* → vörk |
| lv/lt macrons, nasal vowels (ā, ū, ą, ų) | doubled vowel | *jūs* → juus |
| pl *ę, ą* before consonant | en, an (em, am before b/p) | *głęboki* → glembok |
| pl *cz, sz, ż/rz*, ru *ч, ш, ж* | č → tš is simplified to **š**; sz → š; ż/ж → ž | *śledź* → sledz → sild-class |
| pl *ł*, ru dark *l* | l | *pływać* → plav- |
| pl/ru palatalization (ś, ń, ь) | dropped | *sól* → sol |
| de *ch, sch* | h, š | *Sprache* → sprahe |
| de *z, tz*, lv *c*, lt *c* | ts | *Salz* → salts |
| lv *dz*, lt *dž* | dz | *dzintars* → dzintar |
| Danish stød, Swedish pitch accent, Russian reduction | ignored | |
| Voiced final obstruents | kept voiced (no final devoicing) | *duž* stays duž |

The **consonant skeleton** of a word is its sequence of consonants after normalization, with voicing and palatalization ignored (so *b* = *p*, *d* = *t*, *ś* = *s*). Skeletons are the currency of the whole system: *sild* (sv *sill*, da *sild*) and *śledź* (pl) both have skeleton **S-L-D**, so they count as "the same word" even though nobody would guess it by ear.

---

### 3. The Synthesis Engine

Every Baltmeri word is produced by running the concept through the following rules **in order**, stopping at the first that yields an answer.

#### Rule 0 — Gather
Take the first dictionary translation of the concept in all nine languages. Normalize each (§2). Strip the family's citation-form ending (sv/da infinitive *-a/-e*, de *-en*, fi *-a/-ä*, et *-ma*, lv *-t*, lt *-ti*, pl *-ć*, ru *-ть*; nominal endings lv *-s/-a*, lt *-as/-is/-a*, pl/ru gender vowels). Compute each skeleton.

#### Rule 1 — The Hanse Rule (shared words win)
If the same skeleton (allowing at most **one** differing position, equal length) appears in **two or more families**, the concept is a *Hanse word* — something that has already crossed the sea on its own. Baltmeri takes it. The vowels and any disputed consonant are filled in by family vote, ties by the Visby Queue.

> *herring*: sv sill, da sild, pl śledź, ru seld' → S-L-D in Germanic and Slavic → **sild**.
> *sort/kind*: sv sort, de Sorte, pl sort, ru sort → **sort**.
> *salt*: fi suola, et sool, pl sól, ru sol → S-L in Finnic and Slavic (Germanic S-L-T and Latvian S-L-S are the wrong length) → **sol**.
> *boat*: sv båt, da båd, de Boot, et paat → B-T in Germanic and Finnic → **boot**.
> *amber*: lv dzintars, lt gintaras, ru jantar → DZ/G/J-N-T-R, one differing position → **dzintar** (onset by Visby Queue: Latvian).
> *to be*: lv būt, lt būti, pl być, ru byt' → B-T in Baltic and Slavic → **bu-**.

#### Rule 2 — The Domain Rule (content words)
If no Hanse word exists, a content word (noun, verb, adjective) is assigned to a family by its **semantic domain**, on the historical logic of who has the oldest and richest vocabulary for it:

| Domain | Family | Rationale |
|---|---|---|
| Sea, fish, sea animals, weather, seasons, landscape, boats' parts | **Finnic** | The coastal fisher-cultures of the northern shore |
| Body, kinship, colours, farm, forest | **Baltic** | The most archaic Indo-European vocabulary on the sea |
| Trade, tools, town, law, money, abstract nouns | **Germanic** | The Hanseatic league |
| Verbs of action, motion, emotion; adjectives of quality | **Slavic** | The verb-rich southern shore |

Within the family, if its members disagree, the member nearer the front of the Visby Queue wins (Estonian before Finnish, Latvian before Lithuanian, Polish before Russian, Swedish before Danish before German). This is a fixed sub-ranking and does *not* rotate.

> *fish*: no shared skeleton (kala / zivs / ryba / fisk). Sea domain → Finnic → both say **kala**.
> *Baltic herring* (the small subspecies): fi silakka, et räim, sv strömming, lv reņģe — nothing shared. Sea domain → Finnic → Estonian outranks Finnish → **räim**. So Baltmeri, like Estonian and Swedish, has two herrings: **sild** (Atlantic) and **räim** (Baltic).
> *seal*: fi hylje, et hüljes → **hülje**.
> *grey*: colour → Baltic → lv pelēks → **peleek**.
> *big*: quality → Slavic → pl duży → **duž**.
> *rest (verb)*: action → Slavic → pl odpoczywać → **odpočiv-**.
> *common*: quality → Slavic → pl pospolity → **pospolit**.

#### Rule 3 — Family Vote (function words and grammar)
Pronouns, conjunctions, particles, numerals, and all inflectional endings are decided by family vote. A family votes for a form only if its members agree (same skeleton, one differing position allowed); otherwise it abstains. Most votes wins; ties go to the Visby Queue (§1).

#### Rule 4 — Fallback
If every family abstains, the word is taken from the first language in the current Visby Queue that has a form at all. That language moves to the back.

#### Rule 5 — Collision
If two different concepts produce the same Baltmeri form, the concept derived *later* in this manual takes the runner-up form from its own vote.

> *and*: Finnic **ja**, Slavic **i**, Baltic and Germanic abstain. Tie → Estonian outranks Polish → *ja*. But **ja** already means "I" (§6, derived earlier). Collision → runner-up → **i**.

#### Rule 6 — Repair
After all suffixes are attached:
1. Identical adjacent consonants merge (*lääs-ste* → *lääste*).
2. Word-internal clusters of three or more consonants get an epenthetic **i** before the last consonant (*pospolit-st* → *pospolitist*).
3. Word-final two-consonant clusters are allowed only if the first consonant is l, r, m, n or s (*talv, sort, bust* fine; *vid-t* → *vidit*, *koh-t* → *kohit*, *duž-m* → *dužim*).
4. Any suffix consisting of a single obstruent gets a supporting **-e** (this is why the "in" case is *-se*, not *-s*).

---

### 4. Nouns

**No gender.** Finnic has none; Baltic, Slavic and Germanic disagree with each other about which nouns are what. Gender assignment cannot be made deterministic across the nine, so it is abolished. (This is also the honest outcome of the vote: three gendered families with three incompatible systems cannot agree on a form.)

**No articles.** Finnic, Baltic and Slavic have none: 3 votes to 1.

**Plural: -i.** Baltic (lv *-i*, lt *-ai/-iai*) and Slavic (*-i/-y*) agree on the vowel; Finnic *-t/-d* and Germanic *-er/-e/-en* each cast one vote. 2–1–1 → **-i**. *kala* → *kalai*, *hülje* → *hüljei*, *sort* → *sorti*.

**Cases.** Finnic's rich case system and the Baltic/Slavic middle ground produce seven cases; Germanic contributes little here because its cases are mostly gone. Each ending is the vote-winner for that function; single-obstruent endings take the supporting -e (Rule 6.4).

| Case | Ending | Meaning | Source of the vote |
|---|---|---|---|
| Nominative | -Ø | subject | unanimous |
| Genitive | -n | of, 's | Finnic -n, Germanic -s, Slavic -a tie → Estonian |
| Accusative | -a | direct object | all families abstain → Fallback → Lithuanian -ą |
| Inessive | -se | in, inside | only Finnic has a suffix (-ssa/-s) |
| Adessive | -l | on, at; also *when* (summer, night) | Finnic -lla/-l |
| Elative | -ste | from, out of | Finnic -sta/-st |
| Allative | -le | to, onto | Finnic -lle/-le |

Plural and case stack: stem + **-i** + case. *kalju-i-l* "on the rocks", *Baltmeri-se* "in the Baltic". The accusative plural is identical to the nominative plural (as for inanimates in Slavic, and in Finnic and Germanic generally): *kalai* both "fish (pl.)" and "fish (pl. object)".

**Compounds** are head-final and written solid — every family does this. *peleek + hülje* → **peleekhülje** "grey seal" (the species), as opposed to *peleek hülje*, "a seal that happens to be grey".

---

### 5. Adjectives, comparison, adverbs

Adjectives are **bare stems** and precede the noun (all nine put adjectives first). They agree in **number only** — Germanic-style partial agreement, since Swedish/Danish agree in number but not case, and the full-agreement families cannot agree with each other on *how*:

> *duž kala* "big fish" — *duži kalai* "big fish (pl.)"

**Comparative: -m.** Germanic *-er/-are*, Slavic *-ejš/-sz*, Finnic *-mpi/-m* — three-way tie, Baltic abstains (lv *-āk* vs lt *-esn*). By the queue state at this point the tie goes to Estonian: **-m**. *duž* → *dužim* "bigger" (Rule 6.3).

**Superlative: -st.** Germanic *-st*, Slavic *naj-* tie → Swedish: **-st**. *pospolit* → *pospolitist* "most common".

**Adverbs: -t.** Finnic (fi *-sti*, et *-lt*) and Germanic (*-t*) agree on the dental; Baltic *-i/-ai*, Slavic *-o*. 2–1–1 → **-t**. *duž* → *dužt* "greatly, very much" (Rule 6.3 does not fire: *ž* is not a sonorant, so → *dužit*).

**Derived adjectives: -ne.** Finnic *-(i)nen/-ne* and Slavic *-ny/-nyj* agree → **-ne**. *sol* "salt" → *solne* "salty"; *zim* (pl *zimny*, cold) → *zimne*.

---

### 6. Pronouns and numerals

| | Baltmeri | The vote |
|---|---|---|
| I | **ja** | pl *ja*, ru *ja*, sv *jag*, da *jeg*: skeleton J in two families |
| you | **tu** | T-onset in Baltic, Slavic, Germanic; vowel *u* (lv, lt, sv, da, de) beats *y* |
| he / she / it | **han** | fi *hän* + sv/da *han*: H-N in two families. Like Finnish, no gender |
| we | **me** | M-onset in Finnic, Baltic, Slavic; final -s only Baltic → dropped |
| you (pl.) | **juus** | Finnic *te*, Baltic *jūs*, Slavic *vy* tie → Latvian |
| they | **de** | Slavic *oni*, Germanic *de* tie → Swedish |

Genitive: *jan* "my", *tun* "your", *hanen* "his/her", *men*, *juusen*, *den*.

Numerals 1–5 (Family Vote):

| | | The vote |
|---|---|---|
| 1 | **üks** | four-way tie → Finnish *yksi* |
| 2 | **dva** | D-V skeleton in Baltic (*divi*), Slavic (*dva*), Germanic (*två*) |
| 3 | **tri** | T-R everywhere except Finnic |
| 4 | **četri** | Baltic *četri/keturi* + Slavic *cztery/četyre* (one differing position) |
| 5 | **fem** | Slavic *pięć/pjat'* vs Germanic *fem/fem/fünf* tie → Danish |

The numerals alone show the Rota Rule doing its job: five words, five different winners.

---

### 7. Verbs

**Citation form (infinitive): -te.** Baltic *-t/-ti* and Slavic *-ć/-t'* agree on the dental → *-t* + supporting -e. *vid-te* "to see", *bu-te* "to be", *plav-te* "to swim".

**Person endings.** Finnic, Baltic and Slavic all inflect for person; only Swedish and Danish do not. 3–1 → Baltmeri inflects. Each slot was voted separately:

| | Ending | The vote |
|---|---|---|
| 1sg | **-u** | lv *-u*, lt *-u*, ru *-u* — two families |
| 2sg | **-t** | Finnic *-t/-d*, Baltic *-i*, Slavic *-š* tie → Finnish |
| 3sg | **-Ø** | lv, pl, sv, da all zero |
| 1pl | **-me** | M in all four families |
| 2pl | **-te** | T in all four families |
| 3pl | **-Ø** | Finnic *-vat* vs Germanic *-Ø* tie → Danish |

So the third person is unmarked for number, Scandinavian-style; the plural subject carries the plural. (2pl *-te* is identical to the infinitive *-te*. Baltmeri, like Finnish with its *-te*, lives with it.)

**Past: -l-.** Germanic dental (*-de/-te*) vs Slavic *-l* tie → Polish: **-l-**. Inserted between stem and person ending. *vid-l-u* "I saw", *vid-il* "he saw" (Rule 6.3).

**Future: -s-.** Baltic is the only family with a synthetic future (lv *-š-*, lt *-s-*), and the manual prefers a suffix to a helper verb whenever one exists. *plav-s-me* → *plavisme* "we will swim", *bus* "will be".

**Negation: ne** before the verb (Baltic *ne-*, Slavic *nie/ne*: two families). The answer-word "no" is **nei** (Germanic *nej* + Finnic *ei*).

**Questions: li**, placed after the verb. Every family abstained (Estonian *kas*, Latvian *vai*, Lithuanian *ar*, Polish *czy* all different; Finnish and German have no particle) → Fallback → the queue head with a particle was Russian: **li**, in Russian's own position.

**The copula** is suppletive, as in all nine languages:

| | Present | Past | Future |
|---|---|---|---|
| ja | esu | bulu | busu |
| tu | est | bulit | bust |
| han / de | **er** | bul | bus |
| me | esme | bulme | busme |
| juus | este | bulte | buste |

Present stem *es-* is a Hanse word (lv *esmu*, lt *esu*, pl *jestem*); the third person **er** is a separate vote (lv *ir*, lt *yra*, sv *är*, da *er* — skeleton R in two families).

A full regular paradigm, *vidte* "to see":

| | Present | Past | Future |
|---|---|---|---|
| ja | vidu | vidlu | vidsu |
| tu | vidit | vidlit | vidsit |
| han / de | vid | vidil | vids |
| me | vidme | vidilme | vidisme |
| juus | vidte | vidilte | vidiste |

---

### 8. Derivation

| Suffix | Meaning | Vote | Example |
|---|---|---|---|
| **-us** | abstract noun | Finnic *-us*, Baltic *-um(a)s* | *duž* → **dužus** "size" |
| **-ja** | agent, doer | Finnic *-ja*, Baltic *-ējs/-ėjas* | *kala* → **kalaja** "fisher"; *žegl-* → **žeglja** "sailor" |
| **-ka** | diminutive | Slavic *-ek/-ka*, Estonian *-ke* | *kala* → **kalaka** "little fish" |
| **-ne** | adjective from noun | Finnic + Slavic | *sol* → **solne** "salty" |

---

### 9. Syntax

- **SVO.** All nine are SVO at rest; only Germanic has verb-second, and it loses 3–1. So no inversion, ever: *Home me plavisme* "Tomorrow we will swim."
- Adjective – noun. Genitive – noun (*Baltmerin kala* "the sea's fish"). Numeral – noun.
- Time and place phrases go at the end, place before time (Slavic and Germanic order; Finnic is flexible).
- Existence is expressed with *er* + adessive: *Meril er jää* "There is ice on the sea."
- Quantifiers take the plain plural: *daug kalai* "many fish" (Germanic/Slavic; the Finnic partitive lost).

---

### 10. Example sentences

The three sentences from the original list:

**1. The fish in the Baltic Sea come in many varieties and sizes.**
> **Baltmerin kala er daug sorti i dužusi.**
> Baltmeri-GEN fish is many sort-PL and size-PL
> *daug* "many": Baltic *daudz/daug* vs Germanic *många/mange* tie → Latvian.

**2. Grey seals rest on the rocks in summer.**
> **Peleekhüljei odpočiv kaljuil suvil.**
> grey.seal-PL rest.3 rock-PL-ADE summer-ADE
> *kalju* "rock": Finnic → Estonian. *suvi* "summer": Finnic → Estonian outranks Finnish *kesä*.

**3. Herring is the most common fish in the Baltic Sea.**
> **Räim er pospolitist kala Baltmerise.**
> Baltic.herring is common-SUP fish Baltmeri-INE

More:

> **Ja vidu kalaa vesise.** — I see a fish in the water. *(vesi: Finnic → both agree)*
> **Tu kohit li meria?** — Do you love the sea? *(koh-: emotion → Slavic → pl kochać)*
> **Ja kohu meria dužit.** — I love the sea very much.
> **Kalajai lov räima sügisl.** — Fishers catch Baltic herring in autumn. *(lov-: pl łowić; sügis: Estonian)*
> **Vakar hüljei bul kaljuil.** — Yesterday the seals were on the rocks. *(four-way tie → Lithuanian vakar)*
> **Home me žeglisme Gotlandile bootise.** — Tomorrow we sail to Gotland in a boat. *(home: Finnic homme/huomenna; žegl-: pl żeglować)*
> **Tuul vi lääste.** — The wind blows from the west. *(tuul, lääs: Finnic; vi-: pl wiać)*
> **Ne plavit talvil!** — Don't swim in winter!
> **Üks duž kala er dužim kui tri mali.** — One big fish is bigger than three small ones. *(kui "than": Finnic kuin/kui)*

---

### 11. A short text

> **Baltmeri**
>
> Baltmeri er ne glembok meri. Baltmerin vesi er ne müket solne, i talvil meril er jää. Daug kalai plav Baltmerise: räim, sild, tursk i lohi. Peleekhüljei ži saaril i kaljuil, i suvil de odpočiv päivel.
>
> Kalajai lov räima sügisl. Vakar de vidil daug hüljei meril. Home me žeglisme Gotlandile, i ja vidsu dzintara rannal.
>
> Ja kohu Baltmeria. Meri er zimne, ne glembok, i ne müket solne — ale meri er men.

*The Baltic is not a deep sea. The Baltic's water is not very salty, and in winter there is ice on the sea. Many fish swim in the Baltic: Baltic herring, herring, cod and salmon. Grey seals live on islands and rocks, and in summer they rest in the sun.*

*Fishers catch herring in autumn. Yesterday they saw many seals on the sea. Tomorrow we sail to Gotland, and I will see amber on the shore.*

*I love the Baltic. The sea is cold, not deep, and not very salty — but the sea is ours.*

New words in the text: *glembok* (deep: Slavic → pl *głęboki*), *müket* (very: only Germanic voted, sv *mycket*), *tursk* (cod: Finnic → et *tursk*), *lohi* (salmon: fi *lohi* / et *lõhe*, Finnish wins by one differing position rule collapsing to the shorter), *ži-* (live: Slavic *żyć/žit'*), *saar* (island: Finnic), *päive* (sun/day: Finnic *päivä/päev*), *rand* (shore: Finnic *ranta/rand*), *ale* (but: Slavic *ale/a*; Finnic *mutta/aga*, Baltic *bet*, Germanic *men/aber* — tie → queue).

---

### 12. Mini-lexicon

| Baltmeri | English | Rule / source |
|---|---|---|
| Baltmeri | the Baltic Sea | Hanse + Finnic compound |
| meri | sea | Finnic *meri* + Slavic *more* (Hanse) |
| kala | fish | Domain: Finnic |
| räim | Baltic herring | Domain: Finnic (et) |
| sild | herring | Hanse: Germanic + Slavic |
| tursk | cod | Domain: Finnic (et) |
| lohi | salmon | Domain: Finnic |
| hülje | seal | Domain: Finnic (et) |
| peleek | grey | Domain: Baltic (lv) |
| kalju | rock, cliff | Domain: Finnic (et) |
| saar | island | Domain: Finnic |
| rand | shore | Domain: Finnic |
| vesi | water | Domain: Finnic |
| jää | ice | Domain: Finnic |
| tuul | wind | Domain: Finnic |
| lääs | west | Domain: Finnic (et) |
| suvi / talv / sügis | summer / winter / autumn | Domain: Finnic (et) |
| päive | sun, day | Domain: Finnic |
| boot | boat | Hanse: Germanic + Estonian |
| dzintar | amber | Hanse: Baltic + Russian |
| sol / solne | salt / salty | Hanse: Finnic + Slavic |
| sort | kind, variety | Hanse |
| duž / dužus | big / size | Domain: Slavic (pl) |
| mal | small | Domain: Slavic |
| zimne | cold | Domain: Slavic (pl) |
| glembok | deep | Domain: Slavic (pl) |
| pospolit | common | Domain: Slavic (pl) |
| vidte | to see | Domain: Slavic |
| kohte | to love | Domain: Slavic (pl) |
| lovte | to catch | Domain: Slavic (pl) |
| plavte | to swim | Domain: Slavic |
| žite | to live | Domain: Slavic |
| žeglte | to sail | Domain: Slavic (pl) |
| odpočivte | to rest | Domain: Slavic (pl) |
| vite | to blow | Domain: Slavic (pl) |
| bute / er | to be / is | Hanse + vote |
| daug | many | Vote, tie → Latvian |
| müket | very | Vote (Germanic only) |
| home / vakar | tomorrow / yesterday | Vote, ties → Estonian / Lithuanian |
| i / ale / kui | and / but / than | Vote + Collision |
| ne / nei / li | not / no / (question) | Vote / Vote / Fallback → Russian |

---

### 13. The recipe card

To make any new Baltmeri word:

1. **Gather** the nine translations, normalize, strip endings, compute skeletons.
2. **Hanse check:** same skeleton in two families? Take it.
3. **Content word?** Assign by domain (sea → Finnic, body/colour → Baltic, trade/abstract → Germanic, verbs/quality → Slavic); Estonian, Latvian, Polish, Swedish win inside their families.
4. **Function word or ending?** Family vote; ties by the Visby Queue; move the winner to the back.
5. **Nothing voted?** Fallback to the queue head that has a form.
6. **Collision?** The later concept takes its runner-up.
7. **Repair** clusters and add supporting -e.
8. Inflect: plural **-i**; cases **-n, -a, -se, -l, -ste, -le**; verbs **-u, -t, -Ø, -me, -te, -Ø**, past **-l-**, future **-s-**; negation **ne**; question **li**.

To make a sentence: SVO, adjective before noun, place before time, no articles, no gender, stress the first syllable, and put the sea at the end.

*Meri er men.*
