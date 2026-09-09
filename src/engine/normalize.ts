/** §2 — Normalization Table, consonant skeletons, citation-form stripping (§3 Rule 0). */
import type { Lang, Pos } from "./languages";

type Rule = [RegExp, string];

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "jo", ж: "ž", з: "z", и: "i", й: "j", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "č", ш: "š",
  щ: "š", ъ: "", ы: "i", ь: "", э: "e", ю: "ju", я: "ja"
};

function transliterate(s: string): string {
  return s.split("").map((c) => (c in CYRILLIC ? CYRILLIC[c] : c)).join("");
}

/** Ordered rewrite rules per language. Applied after lowercasing and NFC. */
const RULES: Record<Lang, Rule[]> = {
  fi: [[/y/g, "ü"], [/å/g, "o"], [/w/g, "v"], [/c/g, "k"], [/x/g, "ks"]],
  et: [[/y/g, "ü"], [/õ/g, "ö"], [/w/g, "v"], [/c/g, "k"], [/x/g, "ks"]],
  lv: [
    [/ā/g, "aa"], [/ē/g, "ee"], [/ī/g, "ii"], [/ū/g, "uu"], [/ō/g, "oo"],
    [/dž/g, "dz"], [/ģ/g, "g"], [/ķ/g, "k"], [/ļ/g, "l"], [/ņ/g, "n"], [/c/g, "ts"]
  ],
  lt: [
    [/ą/g, "aa"], [/ę/g, "ee"], [/ė/g, "ee"], [/į/g, "ii"], [/ų/g, "uu"], [/ū/g, "uu"], [/y/g, "ii"],
    [/dž/g, "dz"], [/c/g, "ts"]
  ],
  pl: [
    [/ch/g, "h"], [/cz/g, "č"], [/sz/g, "š"], [/(?<=[ptk])rz/g, "š"], [/rz/g, "ž"], [/ż/g, "ž"], [/dź/g, "dz"], [/dż/g, "dz"],
    [/ć/g, "ts"], [/ś/g, "s"], [/ź/g, "z"], [/ń/g, "n"], [/ł/g, "l"], [/ó/g, "o"], [/w/g, "v"],
    [/ę(?=[bp])/g, "em"], [/ę(?=[bcdfghjklmnrstvzčšž])/g, "en"], [/ę/g, "e"],
    [/ą(?=[bp])/g, "am"], [/ą(?=[bcdfghjklmnrstvzčšž])/g, "an"], [/ą/g, "a"],
    [/c/g, "ts"], [/y/g, "i"], [/i(?=[aeiouäöü])/g, ""]
  ],
  ru: [[/'/g, ""], [/ʹ/g, ""], [/y(?=[aeiou])/g, "j"], [/y/g, "i"], [/kh/g, "h"], [/zh/g, "ž"], [/sh/g, "š"], [/ch/g, "č"], [/c/g, "ts"]],
  sv: [[/å/g, "o"], [/y/g, "ü"], [/ck/g, "k"], [/sj/g, "š"], [/x/g, "ks"], [/c/g, "k"], [/w/g, "v"], [/z/g, "s"]],
  da: [[/å/g, "o"], [/æ/g, "ä"], [/ø/g, "ö"], [/y/g, "ü"], [/ck/g, "k"], [/x/g, "ks"], [/c/g, "k"], [/w/g, "v"], [/z/g, "s"]],
  de: [
    [/sch/g, "š"], [/ch/g, "h"], [/ß/g, "s"], [/tz/g, "ts"], [/z/g, "ts"], [/ck/g, "k"], [/y/g, "ü"],
    [/qu/g, "kv"], [/x/g, "ks"], [/ph/g, "f"], [/th/g, "t"], [/dt/g, "t"], [/w/g, "v"], [/c/g, "k"]
  ]
};

const ALLOWED = new Set("abcdefghijklmnoprstuvzäöüšžč".split(""));

/** Strip any diacritic the table did not handle, keep the Baltmeri inventory letters. */
function toInventory(s: string): string {
  let out = "";
  for (const ch of s) {
    if (ALLOWED.has(ch)) { out += ch; continue; }
    if (ch === " " || ch === "-") continue; // "i går" → igor: multi-word citations fuse
    const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (ALLOWED.has(base)) out += base;
  }
  return out;
}

/** §2 — normalize one source-language word. */
export function normalize(lang: Lang, raw: string): string {
  let s = raw.trim().toLowerCase().normalize("NFC");
  if (lang === "ru") s = transliterate(s);
  for (const [re, rep] of RULES[lang]) s = s.replace(re, rep);
  s = toInventory(s);
  // Geminates carry no information in the skeleton system (sv sill → S-L).
  s = s.replace(/([bcdfghjklmnprstvzšžč])\1/g, "$1");
  return s;
}

/** Skeleton classes: voicing and palatalization ignored, affricates fold into their stop. */
const CLASS: Record<string, string> = {
  p: "P", b: "P", f: "P",
  t: "T", d: "T",
  k: "K", g: "K",
  s: "S", z: "S", š: "S", ž: "S",
  č: "Č",
  m: "M", n: "N", l: "L", r: "R", v: "V", j: "J", h: "H"
};

/** Split a normalized form into alternating vowel/consonant segments: V0 C1 V1 C2 V2 … */
export function segments(form: string): { vowels: string[]; consonants: string[] } {
  const vowels: string[] = [];
  const consonants: string[] = [];
  let v = "";
  let c = "";
  const flushC = () => { if (c) { consonants.push(c); vowels.push(v); v = ""; c = ""; } };
  for (const ch of form) {
    if ("aeiouäöü".includes(ch)) {
      if (c) flushC();
      v += ch;
    } else {
      // ts and dz are single consonants
      if (c && !((c.endsWith("t") && ch === "s") || (c.endsWith("d") && ch === "z"))) {
        consonants.push(c); vowels.push(v); v = "";
        c = ch;
      } else {
        c += ch;
      }
    }
  }
  if (c) { consonants.push(c); vowels.push(v); v = ""; }
  vowels.push(v); // trailing vowel
  // vowels[i] precedes consonants[i]; vowels[n] is final.
  return { vowels, consonants };
}

export function skeletonOf(form: string): string[] {
  const { consonants } = segments(form);
  return consonants.map((c) => {
    if (c === "ts") return "T";
    if (c === "dz") return "T";
    return CLASS[c[0]] ?? c[0].toUpperCase();
  });
}

/** §3 Rule 1 — same length, at most one differing position. */
export function skeletonsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
  return diff <= 1;
}

const MIN_STEM = 2;
const HAS_VOWEL = /[aeiouyäöüõåæøāēīūōąęėįųóаеёиоуыэюя]/i;

/** Strip the first matching ending whose remainder is still a pronounceable stem (≥2 letters with a vowel). */
function stripOnce(s: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = s.match(re);
    if (!m) continue;
    const rest = s.slice(0, s.length - m[0].length);
    if (rest.length >= MIN_STEM && HAS_VOWEL.test(rest)) return rest;
  }
  return s;
}

/**
 * §3 Rule 0 — strip the family's citation-form ending. Runs on the raw
 * (lowercased) word so that Polish -ć and Russian -ть are recognisable.
 */
export function stripCitation(lang: Lang, pos: Pos, raw: string): string {
  const s = raw.trim().toLowerCase().normalize("NFC");
  if (pos === "verb") {
    switch (lang) {
      case "sv": case "da": return stripOnce(s, [/[ae]$/]);
      case "de": return stripOnce(s, [/en$/, /n$/]);
      case "fi": return stripOnce(s, [/[aä]$/]);
      case "et": return stripOnce(s, [/ma$/]);
      case "lv": return stripOnce(s, [/[āēī]ties$/, /ties$/, /[āēī]t$/, /t$/]);
      case "lt": return stripOnce(s, [/[ėyo]tis$/, /tis$/, /uoti$/, /[ėyo]ti$/, /ti$/]);
      case "pl": return stripOnce(s, [/ować$/, /ieć$/, /[aeiyą]ć$/, /ć$/]);
      case "ru": {
        const t = stripOnce(s, [/ться$/, /ть$/, /ти$/, /t'sja$/, /t'$/, /tʹ$/, /ti$/]);
        return t === s ? t : stripOnce(t, [/[aeiouyаеёиоуыэюя]$/]);
      }
    }
  }
  if (pos === "noun") {
    switch (lang) {
      case "lv": return stripOnce(s, [/is$/, /us$/, /s$/, /[ae]$/]);
      case "lt": return stripOnce(s, [/ias$/, /as$/, /is$/, /us$/, /ys$/, /uo$/, /ė$/, /a$/]);
      case "pl": return stripOnce(s, [/[aoe]$/]);
      case "ru": return stripOnce(s, [/[аоея]$/, /[aoe]$/]);
      case "et": return stripOnce(s, [/(?<=e)s$/]);
      default: return s;
    }
  }
  if (pos === "adj") {
    switch (lang) {
      case "lv": return stripOnce(s, [/š$/, /s$/]);
      case "lt": return stripOnce(s, [/as$/, /us$/, /is$/]);
      case "pl": return stripOnce(s, [/[yia]$/]);
      case "ru": return stripOnce(s, [/(ый|ий|ой|yj|ij|oj)$/]);
      default: return s;
    }
  }
  return s;
}

/** Full Rule 0 for one language: strip, then normalize, then skeleton. */
export function gather(lang: Lang, pos: Pos, raw: string) {
  const stripped = stripCitation(lang, pos, raw);
  const stem = normalize(lang, stripped);
  return { lang, raw, normalized: normalize(lang, raw), stem, skeleton: skeletonOf(stem) };
}
