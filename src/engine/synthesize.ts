/** §3 — the Synthesis Engine: Rules 0–5 (Repair, Rule 6, lives in repair.ts). */
import {
  CONTENT_POS, DOMAIN_FAMILY, FAMILIES, FAMILY_OF, FAMILY_ORDER, INITIAL_QUEUE, LANGS,
  type Domain, type Family, type Lang, type Pos
} from "./languages";
import { gather, skeletonsMatch } from "./normalize";
import { VisbyQueue, type TieBreak } from "./queue";

export interface Concept {
  /** English lemma used as the concept id, e.g. "fish", "big", "see". */
  id: string;
  pos: Pos;
  domain?: Domain;
  /** First dictionary translation in each of the nine languages. */
  sources: Partial<Record<Lang, string>>;
  /** The manual's authoritative form, when the manual gives one. */
  manual?: string;
  /** A short English gloss for the UI. */
  gloss?: string;
}

export interface Gathered {
  lang: Lang;
  raw: string;
  normalized: string;
  stem: string;
  skeleton: string[];
}

export interface SlotVote {
  slot: string;
  perFamily: { family: Family; value: string; by: Lang }[];
  winner: string;
  tie?: TieBreak<string>;
}

export interface Derivation {
  id: string;
  pos: Pos;
  /** The form the engine derived by the rules alone. */
  derived: string;
  /** The form actually used: the manual's decree when it exists, else `derived`. */
  form: string;
  matchesManual: boolean | null;
  rule: "hanse" | "domain" | "vote" | "fallback" | "fixed";
  family?: Family;
  decidedBy?: Lang;
  gathered: Gathered[];
  hanse?: { skeleton: string[]; supporters: Lang[]; families: Family[]; slots: SlotVote[] };
  domain?: { domain: Domain; family: Family; members: { lang: Lang; stem: string }[]; chosen: Lang };
  vote?: { ballots: { family: Family; stem: string; by: Lang; abstained: boolean }[]; tally: { stem: string; families: Family[] }[]; tie?: TieBreak<string> };
  fallback?: TieBreak<Lang>;
  collision?: { clashedWith: string; runnerUp: string | null };
  candidates: string[];
  queueBefore: Lang[];
  queueAfter: Lang[];
  notes: string[];
}

/** Rank languages by the fixed in-family sub-ranking (§3 Rule 2). */
function subRank(lang: Lang): number {
  return FAMILIES[FAMILY_OF[lang]].indexOf(lang);
}

function familyMembers(family: Family, g: Gathered[]): Gathered[] {
  return FAMILIES[family].map((l) => g.find((x) => x.lang === l)).filter((x): x is Gathered => !!x && x.stem.length > 0);
}

/** A family's own ballot: members must agree (skeleton match) or it abstains. */
function familyBallot(family: Family, g: Gathered[]): { stem: string; by: Lang } | null {
  const members = familyMembers(family, g);
  if (members.length === 0) return null;
  if (members.length === 1) return { stem: members[0].stem, by: members[0].lang };
  // Find the front-most member that agrees with at least one other member.
  for (const m of members) {
    if (members.some((o) => o !== m && skeletonsMatch(o.skeleton, m.skeleton))) return { stem: m.stem, by: m.lang };
  }
  return null;
}

/**
 * Rule 1 matching. "At most one differing position" is only meaningful once a
 * skeleton has three or more consonants (dzintar, četri); for one- and
 * two-consonant skeletons a differing position would match almost anything,
 * so those must agree exactly (sol, boot, bu-).
 */
export function hanseMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  if (a.length <= 2) return a.every((x, i) => x === b[i]);
  return skeletonsMatch(a, b);
}

/** Group forms by skeleton compatibility, anchored on each group's first member. */
function clusterBySkeleton(g: Gathered[]): Gathered[][] {
  const groups: Gathered[][] = [];
  for (const x of g) {
    const grp = groups.find((grp) => hanseMatch(grp[0].skeleton, x.skeleton));
    if (grp) grp.push(x); else groups.push([x]);
  }
  return groups;
}

function familiesOf(langs: Lang[]): Family[] {
  return FAMILY_ORDER.filter((f) => langs.some((l) => FAMILY_OF[l] === f));
}

/**
 * Rule 1 fill-in: the vowels and any disputed consonant are decided by family
 * vote — each supporting family puts forward its front-ranked member's whole
 * stem, most families wins, ties by the Visby Queue.
 */
function fillHanse(cluster: Gathered[], queue: VisbyQueue): { form: string; slots: SlotVote[]; ballots: { family: Family; stem: string; by: Lang }[]; tie?: TieBreak<string>; runnersUp: string[] } {
  const ballots: { family: Family; stem: string; by: Lang }[] = [];
  for (const fam of FAMILY_ORDER) {
    const members = cluster.filter((x) => FAMILY_OF[x.lang] === fam).sort((a, b) => subRank(a.lang) - subRank(b.lang));
    if (members.length === 0) continue;
    const counts = new Map<string, Gathered[]>();
    for (const m of members) counts.set(m.stem, [...(counts.get(m.stem) ?? []), m]);
    let best: Gathered[] = [];
    for (const v of counts.values()) if (v.length > best.length) best = v;
    const pick = best.length > 1 ? best[0] : members[0];
    ballots.push({ family: fam, stem: pick.stem, by: pick.lang });
  }
  const tally = new Map<string, Lang[]>();
  for (const b of ballots) tally.set(b.stem, [...(tally.get(b.stem) ?? []), b.by]);
  const max = Math.max(...[...tally.values()].map((v) => v.length));
  const top = [...tally].filter(([, v]) => v.length === max);
  let form: string;
  let tie: TieBreak<string> | undefined;
  if (top.length === 1) form = top[0][0];
  else {
    tie = queue.breakTie(top.map(([stem]) => ({ form: stem, supporters: cluster.filter((x) => x.stem === stem).map((x) => x.lang) })));
    form = tie.winner;
  }
  const runnersUp = [...tally.keys()].filter((k) => k !== form).sort((a, b) => tally.get(b)!.length - tally.get(a)!.length);
  const slots: SlotVote[] = [{ slot: "stem", perFamily: ballots.map((b) => ({ family: b.family, value: b.stem, by: b.by })), winner: form, tie }];
  return { form, slots, ballots, tie, runnersUp };
}

export interface SynthesisContext {
  queue: VisbyQueue;
  /** form → concept id, for Rule 5 (Collision). */
  taken: Map<string, string>;
}

export function newContext(queue: Lang[] = INITIAL_QUEUE): SynthesisContext {
  return { queue: new VisbyQueue(queue), taken: new Map() };
}

/** Run one concept through Rules 0–5. Mutates the context (queue state, taken forms). */
export function synthesize(concept: Concept, ctx: SynthesisContext): Derivation {
  const queueBefore = ctx.queue.snapshot();
  const gathered: Gathered[] = LANGS.filter((l) => concept.sources[l]).map((l) => gather(l, concept.pos, concept.sources[l]!));
  const notes: string[] = [];
  const d: Partial<Derivation> = { id: concept.id, pos: concept.pos, gathered, notes, candidates: [] };
  let candidates: string[] = [];

  // Rule 1 — Hanse
  const clusters = clusterBySkeleton(gathered.filter((g) => g.stem));
  const hanseClusters = clusters
    .map((c) => ({ c, fams: familiesOf(c.map((x) => x.lang)) }))
    .filter((x) => x.fams.length >= 2)
    .sort((a, b) => b.fams.length - a.fams.length || b.c.length - a.c.length);
  if (hanseClusters.length > 0) {
    const { c, fams } = hanseClusters[0];
    const { form, slots, tie, runnersUp } = fillHanse(c, ctx.queue);
    d.rule = "hanse";
    d.hanse = { skeleton: c[0].skeleton, supporters: c.map((x) => x.lang), families: fams, slots };
    d.family = FAMILY_OF[tie?.decider ?? c.find((x) => x.stem === form)!.lang];
    d.decidedBy = tie?.decider ?? c.filter((x) => x.stem === form).sort((a, b) => INITIAL_QUEUE.indexOf(a.lang) - INITIAL_QUEUE.indexOf(b.lang))[0].lang;
    candidates = [form, ...runnersUp];
    notes.push(`Hanse word: skeleton ${c[0].skeleton.join("-")} shared by ${fams.join(" + ")}${tie ? `; tie broken by ${tie.decider}` : ""}.`);
  } else if (CONTENT_POS.includes(concept.pos) && concept.domain) {
    // Rule 2 — Domain
    const family = DOMAIN_FAMILY[concept.domain];
    const members = familyMembers(family, gathered);
    d.rule = "domain";
    if (members.length > 0) {
      const chosen = members[0]; // front-most in the fixed sub-ranking
      d.family = family;
      d.decidedBy = chosen.lang;
      d.domain = { domain: concept.domain, family, members: members.map((m) => ({ lang: m.lang, stem: m.stem })), chosen: chosen.lang };
      candidates = members.map((m) => m.stem);
      notes.push(`No shared skeleton. Domain "${concept.domain}" → ${family} → ${chosen.lang} ${chosen.raw}.`);
    } else {
      notes.push(`Domain family ${family} has no form; falling through to a vote.`);
    }
  }

  if (candidates.length === 0) {
    // Rule 3 — Family Vote
    const ballots = FAMILY_ORDER.map((family) => {
      const b = familyBallot(family, gathered);
      return { family, stem: b?.stem ?? "", by: (b?.by ?? FAMILIES[family][0]) as Lang, abstained: !b };
    });
    const voting = ballots.filter((b) => !b.abstained);
    if (voting.length > 0) {
      // Pool ballots whose skeletons match.
      const groups: { stem: string; families: Family[]; langs: Lang[] }[] = [];
      for (const b of voting) {
        const sk = gathered.find((g) => g.lang === b.by)!.skeleton;
        const grp = groups.find((g) => skeletonsMatch(gathered.find((x) => x.lang === g.langs[0])!.skeleton, sk));
        if (grp) { grp.families.push(b.family); grp.langs.push(b.by); } else groups.push({ stem: b.stem, families: [b.family], langs: [b.by] });
      }
      const max = Math.max(...groups.map((g) => g.families.length));
      const top = groups.filter((g) => g.families.length === max);
      let tie: TieBreak<string> | undefined;
      let winner: { stem: string; langs: Lang[] };
      if (top.length === 1) {
        winner = top[0];
        // Within the winning pool, the highest-ranked language's spelling.
        const best = [...top[0].langs].sort((a, b) => INITIAL_QUEUE.indexOf(a) - INITIAL_QUEUE.indexOf(b))[0];
        winner = { stem: gathered.find((g) => g.lang === best)!.stem, langs: top[0].langs };
        d.decidedBy = best;
      } else {
        tie = ctx.queue.breakTie(top.map((g) => ({ form: g.stem, supporters: g.langs })));
        const w = top.find((g) => g.stem === tie!.winner)!;
        winner = { stem: gathered.find((g) => g.lang === tie!.decider)!.stem, langs: w.langs };
        d.decidedBy = tie.decider;
      }
      d.rule = "vote";
      d.vote = { ballots, tally: groups.map((g) => ({ stem: g.stem, families: g.families })), tie };
      d.family = FAMILY_OF[d.decidedBy!];
      candidates = [winner.stem, ...groups.filter((g) => g.stem !== winner.stem).sort((a, b) => b.families.length - a.families.length).map((g) => g.stem)];
      notes.push(`Family vote: ${groups.map((g) => `${g.stem} (${g.families.join("+")})`).join(", ")}${tie ? ` — tie broken by ${tie.decider}` : ""}.`);
    } else {
      // Rule 4 — Fallback
      const withForm = gathered.filter((g) => g.stem).map((g) => g.lang);
      const fb = ctx.queue.fallback(withForm);
      d.rule = "fallback";
      if (fb) {
        d.fallback = fb;
        d.decidedBy = fb.winner;
        d.family = FAMILY_OF[fb.winner];
        const ordered = [...withForm].sort((a, b) => fb.queueBefore.indexOf(a) - fb.queueBefore.indexOf(b));
        candidates = ordered.map((l) => gathered.find((g) => g.lang === l)!.stem);
        notes.push(`Every family abstained. Fallback → queue head with a form: ${fb.winner}.`);
      } else {
        candidates = [concept.id.replace(/[^a-z]/g, "")];
        notes.push("No source forms at all.");
      }
    }
  }

  // Rule 5 — Collision
  let derived = candidates[0];
  const clash = ctx.taken.get(derived);
  if (clash && clash !== concept.id) {
    const runnerUp = candidates.slice(1).find((c) => c && !ctx.taken.has(c)) ?? null;
    d.collision = { clashedWith: clash, runnerUp };
    if (runnerUp) {
      notes.push(`Collision: "${derived}" already means "${clash}" → runner-up "${runnerUp}".`);
      derived = runnerUp;
    } else notes.push(`Collision with "${clash}" but no runner-up available.`);
  }

  const form = concept.manual ?? derived;
  if (concept.manual && concept.manual !== derived) notes.push(`The manual decrees "${concept.manual}"; the engine alone would give "${derived}".`);
  ctx.taken.set(form, concept.id);

  return {
    ...(d as Derivation),
    derived,
    form,
    matchesManual: concept.manual ? concept.manual === derived : null,
    candidates,
    queueBefore,
    queueAfter: ctx.queue.snapshot()
  };
}
