/**
 * §3 Rule 6 — Repair, applied after all suffixes are attached.
 *
 * Repairs only touch clusters created by attaching a suffix; a cluster that
 * sits inside a stem (Baltmeri, Gotland, tursk) is part of the word as derived.
 * j is a semivowel and does not form clusters (žeglja, kalaja).
 *
 *  6.1 identical adjacent consonants merge                       lääs+ste → lääste
 *  6.2 clusters of ≥3 across the boundary take an epenthetic i:
 *      before a final single-consonant suffix                   vid+s+t → vidsit
 *      otherwise right after the stem                            vid+l+me → vidilme, pospolit+st → pospolitist
 *  6.3 word-final CC only if the first is l r m n s; a final -s is tolerated (vids, bus)
 *                                                                vid+t → vidit, duž+m → dužim, talv+l → talvil
 *  6.4 single-obstruent suffixes carry their supporting -e in the tables (-se, -le, -te)
 */

const VOWEL = /[aeiouäöüj]/;
const SONORANT = new Set(["l", "r", "m", "n", "s"]);

export interface Repaired {
  form: string;
  steps: string[];
}

interface Unit { text: string; cons: boolean; part: number } // part 0 = stem, 1.. = suffix index

function tokenize(s: string, part: number): Unit[] {
  const out: Unit[] = [];
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    const text = two === "ts" || two === "dz" ? two : s[i];
    if (text.length === 2) i++;
    out.push({ text, cons: !VOWEL.test(text[0]), part });
  }
  return out;
}

const join = (u: Unit[]) => u.map((x) => x.text).join("");

export function repair(stem: string, ...suffixes: string[]): Repaired {
  const steps: string[] = [];
  const parts = [stem, ...suffixes.filter(Boolean)];
  let units: Unit[] = parts.flatMap((p, i) => tokenize(p, i));
  const before = join(units);

  // 6.1 — identical adjacent consonants merge (across any boundary)
  for (let i = 1; i < units.length; i++) {
    if (units[i].cons && units[i - 1].cons && units[i].text === units[i - 1].text) {
      units.splice(i, 1);
      i--;
    }
  }
  if (join(units) !== before) steps.push(`6.1 ${before} → ${join(units)}`);

  // 6.2 — clusters of three or more that cross a boundary
  for (let i = 0; i < units.length; ) {
    if (!units[i].cons) { i++; continue; }
    let j = i;
    while (j < units.length && units[j].cons) j++;
    const cluster = units.slice(i, j);
    const crosses = new Set(cluster.map((u) => u.part)).size > 1;
    if (cluster.length >= 3 && crosses) {
      const s0 = join(units);
      const last = cluster[cluster.length - 1];
      const isFinal = j === units.length;
      const lastIsSingleSuffix = last.part > 0 && parts[last.part].length === last.text.length;
      let at: number;
      if (isFinal && lastIsSingleSuffix) at = j - 1; // vidsit, vidlit
      else {
        const stemEnd = cluster.findIndex((u) => u.part > 0);
        at = stemEnd > 0 ? i + stemEnd : i + 1; // vidilme, pospolitist
      }
      units.splice(at, 0, { text: "i", cons: false, part: -1 });
      steps.push(`6.2 ${s0} → ${join(units)}`);
      j++;
    }
    i = j;
  }

  // 6.3 — word-final two-consonant cluster across a boundary
  const n = units.length;
  if (n >= 2 && units[n - 1].cons && units[n - 2].cons && !(n >= 3 && units[n - 3].cons) && units[n - 1].part !== units[n - 2].part) {
    const first = units[n - 2].text;
    const last = units[n - 1].text;
    if (!SONORANT.has(first[0]) && last !== "s") {
      const s0 = join(units);
      units.splice(n - 1, 0, { text: "i", cons: false, part: -1 });
      steps.push(`6.3 ${s0} → ${join(units)}`);
    }
  }
  return { form: join(units), steps };
}
