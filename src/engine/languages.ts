/** §1 — the nine source languages, four families, the Visby Queue. */
export type Lang = "fi" | "et" | "lv" | "lt" | "pl" | "ru" | "sv" | "da" | "de";
export type Family = "Finnic" | "Baltic" | "Slavic" | "Germanic";

export const LANGS: Lang[] = ["fi", "et", "lv", "lt", "pl", "ru", "sv", "da", "de"];

export const LANG_NAMES: Record<Lang, string> = {
  fi: "Finnish", et: "Estonian", lv: "Latvian", lt: "Lithuanian",
  pl: "Polish", ru: "Russian", sv: "Swedish", da: "Danish", de: "German"
};

/** Members listed in the fixed, non-rotating in-family sub-ranking (§3 Rule 2). */
export const FAMILIES: Record<Family, Lang[]> = {
  Finnic: ["et", "fi"],
  Baltic: ["lv", "lt"],
  Slavic: ["pl", "ru"],
  Germanic: ["sv", "da", "de"]
};

export const FAMILY_OF: Record<Lang, Family> = {
  fi: "Finnic", et: "Finnic", lv: "Baltic", lt: "Baltic",
  pl: "Slavic", ru: "Slavic", sv: "Germanic", da: "Germanic", de: "Germanic"
};

export const FAMILY_ORDER: Family[] = ["Finnic", "Baltic", "Slavic", "Germanic"];

/** Distance from Visby to each language's nearest major coastal city. */
export const INITIAL_QUEUE: Lang[] = ["sv", "lv", "lt", "et", "fi", "pl", "de", "da", "ru"];

/** §3 Rule 2 — semantic domains and the family that owns them. */
export type Domain =
  | "sea" | "fish" | "weather" | "season" | "landscape" | "boat-part"
  | "body" | "kinship" | "colour" | "farm" | "forest"
  | "trade" | "tool" | "town" | "law" | "money" | "abstract"
  | "action" | "motion" | "emotion" | "quality";

export const DOMAIN_FAMILY: Record<Domain, Family> = {
  sea: "Finnic", fish: "Finnic", weather: "Finnic", season: "Finnic", landscape: "Finnic", "boat-part": "Finnic",
  body: "Baltic", kinship: "Baltic", colour: "Baltic", farm: "Baltic", forest: "Baltic",
  trade: "Germanic", tool: "Germanic", town: "Germanic", law: "Germanic", money: "Germanic", abstract: "Germanic",
  action: "Slavic", motion: "Slavic", emotion: "Slavic", quality: "Slavic"
};

export const DOMAINS = Object.keys(DOMAIN_FAMILY) as Domain[];

export type Pos = "noun" | "verb" | "adj" | "adv" | "pron" | "num" | "conj" | "part" | "prep" | "other";

/** Content words go through the Domain Rule; everything else is a Family Vote. */
export const CONTENT_POS: Pos[] = ["noun", "verb", "adj"];
