/**
 * §12 — the seed lexicon, listed in the manual's derivation order (§0, §3 → §11).
 * Each entry carries the nine source forms so the engine re-derives it; `manual`
 * is the manual's decree and is authoritative where the two disagree.
 */
import type { Concept } from "./synthesize";
import type { DerivationKind } from "./inflect";

export interface DerivedEntry {
  id: string;
  gloss: string;
  from: string;
  kind: DerivationKind;
  pos: "noun" | "adj";
}

export interface FixedEntry {
  id: string;
  gloss: string;
  pos: "noun";
  form: string;
  note: string;
}

export const LEXICON: Concept[] = [
  // §0 — the name
  { id: "sea", gloss: "sea", pos: "noun", domain: "sea", manual: "meri",
    sources: { fi: "meri", et: "meri", lv: "jūra", lt: "jūra", pl: "morze", ru: "море", sv: "hav", da: "hav", de: "Meer" } },
  // §3 Rule 1 examples
  { id: "herring", gloss: "herring (Atlantic)", pos: "noun", domain: "fish", manual: "sild",
    sources: { fi: "silli", et: "heeringas", lv: "siļķe", lt: "silkė", pl: "śledź", ru: "сельдь", sv: "sill", da: "sild", de: "Hering" } },
  { id: "sort", gloss: "sort, kind, variety", pos: "noun", domain: "trade", manual: "sort",
    sources: { fi: "laji", et: "sort", lv: "sorts", lt: "rūšis", pl: "sort", ru: "сорт", sv: "sort", da: "sort", de: "Sorte" } },
  { id: "salt", gloss: "salt", pos: "noun", domain: "sea", manual: "sol",
    sources: { fi: "suola", et: "sool", lv: "sāls", lt: "druska", pl: "sól", ru: "соль", sv: "salt", da: "salt", de: "Salz" } },
  { id: "boat", gloss: "boat", pos: "noun", domain: "sea", manual: "boot",
    sources: { fi: "vene", et: "paat", lv: "laiva", lt: "laivas", pl: "łódź", ru: "лодка", sv: "båt", da: "båd", de: "Boot" } },
  { id: "amber", gloss: "amber", pos: "noun", domain: "sea", manual: "dzintar",
    sources: { fi: "meripihka", et: "merevaik", lv: "dzintars", lt: "gintaras", pl: "bursztyn", ru: "янтарь", sv: "bärnsten", da: "rav", de: "Bernstein" } },
  { id: "be", gloss: "to be", pos: "verb", domain: "action", manual: "bu",
    sources: { fi: "olla", et: "olema", lv: "būt", lt: "būti", pl: "być", ru: "быть", sv: "vara", da: "være", de: "sein" } },
  // §3 Rule 2 examples
  { id: "fish", gloss: "fish", pos: "noun", domain: "fish", manual: "kala",
    sources: { fi: "kala", et: "kala", lv: "zivs", lt: "žuvis", pl: "ryba", ru: "рыба", sv: "fisk", da: "fisk", de: "Fisch" } },
  { id: "baltic-herring", gloss: "Baltic herring", pos: "noun", domain: "fish", manual: "räim",
    sources: { fi: "silakka", et: "räim", lv: "reņģe", lt: "strimelė", pl: "sałaka", ru: "салака", sv: "strömming", da: "østersøsild", de: "Strömling" } },
  { id: "seal", gloss: "seal", pos: "noun", domain: "sea", manual: "hülje",
    sources: { fi: "hylje", et: "hüljes", lv: "ronis", lt: "ruonis", pl: "foka", ru: "тюлень", sv: "säl", da: "sæl", de: "Robbe" } },
  { id: "grey", gloss: "grey", pos: "adj", domain: "colour", manual: "peleek",
    sources: { fi: "harmaa", et: "hall", lv: "pelēks", lt: "pilkas", pl: "szary", ru: "серый", sv: "grå", da: "grå", de: "grau" } },
  { id: "big", gloss: "big", pos: "adj", domain: "quality", manual: "duž",
    sources: { fi: "suuri", et: "suur", lv: "liels", lt: "didelis", pl: "duży", ru: "большой", sv: "stor", da: "stor", de: "groß" } },
  { id: "rest", gloss: "to rest", pos: "verb", domain: "action", manual: "odpočiv",
    sources: { fi: "levätä", et: "puhkama", lv: "atpūsties", lt: "ilsėtis", pl: "odpoczywać", ru: "отдыхать", sv: "vila", da: "hvile", de: "ruhen" } },
  { id: "common", gloss: "common", pos: "adj", domain: "quality", manual: "pospolit",
    sources: { fi: "yleinen", et: "tavaline", lv: "parasts", lt: "paprastas", pl: "pospolity", ru: "обычный", sv: "vanlig", da: "almindelig", de: "gewöhnlich" } },
  // §6 — pronouns
  { id: "I", gloss: "I", pos: "pron", manual: "ja",
    sources: { fi: "minä", et: "mina", lv: "es", lt: "aš", pl: "ja", ru: "я", sv: "jag", da: "jeg", de: "ich" } },
  { id: "you", gloss: "you (sg.)", pos: "pron", manual: "tu",
    sources: { fi: "sinä", et: "sina", lv: "tu", lt: "tu", pl: "ty", ru: "ты", sv: "du", da: "du", de: "du" } },
  { id: "he", gloss: "he / she / it", pos: "pron", manual: "han",
    sources: { fi: "hän", et: "tema", lv: "viņš", lt: "jis", pl: "on", ru: "он", sv: "han", da: "han", de: "er" } },
  { id: "we", gloss: "we", pos: "pron", manual: "me",
    sources: { fi: "me", et: "meie", lv: "mēs", lt: "mes", pl: "my", ru: "мы", sv: "vi", da: "vi", de: "wir" } },
  { id: "you-pl", gloss: "you (pl.)", pos: "pron", manual: "juus",
    sources: { fi: "te", et: "teie", lv: "jūs", lt: "jūs", pl: "wy", ru: "вы", sv: "ni", da: "I", de: "ihr" } },
  { id: "they", gloss: "they", pos: "pron", manual: "de",
    sources: { fi: "he", et: "nad", lv: "viņi", lt: "jie", pl: "oni", ru: "они", sv: "de", da: "de", de: "sie" } },
  // §6 — numerals
  { id: "one", gloss: "one", pos: "num", manual: "üks",
    sources: { fi: "yksi", et: "üks", lv: "viens", lt: "vienas", pl: "jeden", ru: "один", sv: "en", da: "en", de: "eins" } },
  { id: "two", gloss: "two", pos: "num", manual: "dva",
    sources: { fi: "kaksi", et: "kaks", lv: "divi", lt: "du", pl: "dwa", ru: "два", sv: "två", da: "to", de: "zwei" } },
  { id: "three", gloss: "three", pos: "num", manual: "tri",
    sources: { fi: "kolme", et: "kolm", lv: "trīs", lt: "trys", pl: "trzy", ru: "три", sv: "tre", da: "tre", de: "drei" } },
  { id: "four", gloss: "four", pos: "num", manual: "četri",
    sources: { fi: "neljä", et: "neli", lv: "četri", lt: "keturi", pl: "cztery", ru: "четыре", sv: "fyra", da: "fire", de: "vier" } },
  { id: "five", gloss: "five", pos: "num", manual: "fem",
    sources: { fi: "viisi", et: "viis", lv: "pieci", lt: "penki", pl: "pięć", ru: "пять", sv: "fem", da: "fem", de: "fünf" } },
  { id: "six", gloss: "six", pos: "num",
    sources: { fi: "kuusi", et: "kuus", lv: "seši", lt: "šeši", pl: "sześć", ru: "шесть", sv: "sex", da: "seks", de: "sechs" } },
  { id: "seven", gloss: "seven", pos: "num",
    sources: { fi: "seitsemän", et: "seitse", lv: "septiņi", lt: "septyni", pl: "siedem", ru: "семь", sv: "sju", da: "syv", de: "sieben" } },
  { id: "eight", gloss: "eight", pos: "num",
    sources: { fi: "kahdeksan", et: "kaheksa", lv: "astoņi", lt: "aštuoni", pl: "osiem", ru: "восемь", sv: "åtta", da: "otte", de: "acht" } },
  { id: "nine", gloss: "nine", pos: "num",
    sources: { fi: "yhdeksän", et: "üheksa", lv: "deviņi", lt: "devyni", pl: "dziewięć", ru: "девять", sv: "nio", da: "ni", de: "neun" } },
  { id: "ten", gloss: "ten", pos: "num",
    sources: { fi: "kymmenen", et: "kümme", lv: "desmit", lt: "dešimt", pl: "dziesięć", ru: "десять", sv: "tio", da: "ti", de: "zehn" } },
  // §3 Rule 5 example (needs "I" to exist first)
  { id: "and", gloss: "and", pos: "conj", manual: "i",
    sources: { fi: "ja", et: "ja", lv: "un", lt: "ir", pl: "i", ru: "и", sv: "och", da: "og", de: "und" } },
  // §7 — particles
  { id: "not", gloss: "not", pos: "part", manual: "ne",
    sources: { fi: "ei", et: "ei", lv: "ne", lt: "ne", pl: "nie", ru: "не", sv: "inte", da: "ikke", de: "nicht" } },
  { id: "no", gloss: "no (answer)", pos: "part", manual: "nei",
    sources: { fi: "ei", et: "ei", lv: "nē", lt: "ne", pl: "nie", ru: "нет", sv: "nej", da: "nej", de: "nein" } },
  { id: "question", gloss: "(yes/no question particle)", pos: "part", manual: "li",
    sources: { et: "kas", lv: "vai", lt: "ar", pl: "czy", ru: "ли" } },
  // §10 — example sentences, in order of appearance
  { id: "many", gloss: "many", pos: "other", manual: "daug",
    sources: { fi: "monta", et: "palju", lv: "daudz", lt: "daug", pl: "wiele", ru: "много", sv: "många", da: "mange", de: "viele" } },
  { id: "rock", gloss: "rock, cliff", pos: "noun", domain: "landscape", manual: "kalju",
    sources: { fi: "kallio", et: "kalju", lv: "klints", lt: "uola", pl: "skała", ru: "скала", sv: "klippa", da: "klippe", de: "Felsen" } },
  { id: "summer", gloss: "summer", pos: "noun", domain: "season", manual: "suvi",
    sources: { fi: "kesä", et: "suvi", lv: "vasara", lt: "vasara", pl: "lato", ru: "лето", sv: "sommar", da: "sommer", de: "Sommer" } },
  { id: "see", gloss: "to see", pos: "verb", domain: "action", manual: "vid",
    sources: { fi: "nähdä", et: "nägema", lv: "redzēt", lt: "matyti", pl: "widzieć", ru: "видеть", sv: "se", da: "se", de: "sehen" } },
  { id: "water", gloss: "water", pos: "noun", domain: "sea", manual: "vesi",
    sources: { fi: "vesi", et: "vesi", lv: "ūdens", lt: "vanduo", pl: "woda", ru: "вода", sv: "vatten", da: "vand", de: "Wasser" } },
  { id: "love", gloss: "to love", pos: "verb", domain: "emotion", manual: "koh",
    sources: { fi: "rakastaa", et: "armastama", lv: "mīlēt", lt: "mylėti", pl: "kochać", ru: "любить", sv: "älska", da: "elske", de: "lieben" } },
  { id: "catch", gloss: "to catch", pos: "verb", domain: "action", manual: "lov",
    sources: { fi: "pyydystää", et: "püüdma", lv: "ķert", lt: "gaudyti", pl: "łowić", ru: "ловить", sv: "fånga", da: "fange", de: "fangen" } },
  { id: "autumn", gloss: "autumn", pos: "noun", domain: "season", manual: "sügis",
    sources: { fi: "syksy", et: "sügis", lv: "rudens", lt: "ruduo", pl: "jesień", ru: "осень", sv: "höst", da: "efterår", de: "Herbst" } },
  { id: "yesterday", gloss: "yesterday", pos: "adv", manual: "vakar",
    sources: { fi: "eilen", et: "eile", lv: "vakar", lt: "vakar", pl: "wczoraj", ru: "вчера", sv: "igår", da: "i går", de: "gestern" } },
  { id: "tomorrow", gloss: "tomorrow", pos: "adv", manual: "home",
    sources: { fi: "huomenna", et: "homme", lv: "rīt", lt: "rytoj", pl: "jutro", ru: "завтра", sv: "imorgon", da: "i morgen", de: "morgen" } },
  { id: "sail", gloss: "to sail", pos: "verb", domain: "motion", manual: "žegl",
    sources: { fi: "purjehtia", et: "purjetama", lv: "burāt", lt: "buriuoti", pl: "żeglować", ru: "плыть", sv: "segla", da: "sejle", de: "segeln" } },
  { id: "wind", gloss: "wind", pos: "noun", domain: "weather", manual: "tuul",
    sources: { fi: "tuuli", et: "tuul", lv: "vējš", lt: "vėjas", pl: "wiatr", ru: "ветер", sv: "vind", da: "vind", de: "Wind" } },
  { id: "blow", gloss: "to blow (wind)", pos: "verb", domain: "action", manual: "vi",
    sources: { fi: "tuulla", et: "puhuma", lv: "pūst", lt: "pūsti", pl: "wiać", ru: "веять", sv: "blåsa", da: "blæse", de: "wehen" } },
  { id: "west", gloss: "west", pos: "noun", domain: "landscape", manual: "lääs",
    sources: { fi: "länsi", et: "lääs", lv: "rietumi", lt: "vakarai", pl: "zachód", ru: "запад", sv: "väster", da: "vest", de: "Westen" } },
  { id: "swim", gloss: "to swim", pos: "verb", domain: "motion", manual: "plav",
    sources: { fi: "uida", et: "ujuma", lv: "peldēt", lt: "plaukti", pl: "pływać", ru: "плавать", sv: "simma", da: "svømme", de: "schwimmen" } },
  { id: "winter", gloss: "winter", pos: "noun", domain: "season", manual: "talv",
    sources: { fi: "talvi", et: "talv", lv: "ziema", lt: "žiema", pl: "zima", ru: "зима", sv: "vinter", da: "vinter", de: "Winter" } },
  { id: "small", gloss: "small", pos: "adj", domain: "quality", manual: "mal",
    sources: { fi: "pieni", et: "väike", lv: "mazs", lt: "mažas", pl: "mały", ru: "малый", sv: "liten", da: "lille", de: "klein" } },
  { id: "than", gloss: "than", pos: "conj", manual: "kui",
    sources: { fi: "kuin", et: "kui", lv: "nekā", lt: "nei", pl: "niż", ru: "чем", sv: "än", da: "end", de: "als" } },
  // §11 — the short text
  { id: "deep", gloss: "deep", pos: "adj", domain: "quality", manual: "glembok",
    sources: { fi: "syvä", et: "sügav", lv: "dziļš", lt: "gilus", pl: "głęboki", ru: "глубокий", sv: "djup", da: "dyb", de: "tief" } },
  { id: "very", gloss: "very", pos: "adv", manual: "müket",
    sources: { fi: "hyvin", et: "väga", lv: "ļoti", lt: "labai", pl: "bardzo", ru: "очень", sv: "mycket", da: "meget", de: "sehr" } },
  { id: "ice", gloss: "ice", pos: "noun", domain: "sea", manual: "jää",
    sources: { fi: "jää", et: "jää", lv: "ledus", lt: "ledas", pl: "lód", ru: "лёд", sv: "is", da: "is", de: "Eis" } },
  { id: "cod", gloss: "cod", pos: "noun", domain: "fish", manual: "tursk",
    sources: { fi: "turska", et: "tursk", lv: "menca", lt: "menkė", pl: "dorsz", ru: "треска", sv: "torsk", da: "torsk", de: "Dorsch" } },
  { id: "salmon", gloss: "salmon", pos: "noun", domain: "fish", manual: "lohi",
    sources: { fi: "lohi", et: "lõhe", lv: "lasis", lt: "lašiša", pl: "łosoś", ru: "лосось", sv: "lax", da: "laks", de: "Lachs" } },
  { id: "live", gloss: "to live", pos: "verb", domain: "action", manual: "ži",
    sources: { fi: "elää", et: "elama", lv: "dzīvot", lt: "gyventi", pl: "żyć", ru: "жить", sv: "leva", da: "leve", de: "leben" } },
  { id: "island", gloss: "island", pos: "noun", domain: "landscape", manual: "saar",
    sources: { fi: "saari", et: "saar", lv: "sala", lt: "sala", pl: "wyspa", ru: "остров", sv: "ö", da: "ø", de: "Insel" } },
  { id: "sun", gloss: "sun, day", pos: "noun", domain: "weather", manual: "päive",
    sources: { fi: "päivä", et: "päev", lv: "saule", lt: "saulė", pl: "słońce", ru: "солнце", sv: "sol", da: "sol", de: "Sonne" } },
  { id: "shore", gloss: "shore", pos: "noun", domain: "landscape", manual: "rand",
    sources: { fi: "ranta", et: "rand", lv: "krasts", lt: "krantas", pl: "brzeg", ru: "берег", sv: "strand", da: "strand", de: "Strand" } },
  { id: "cold", gloss: "cold", pos: "adj", domain: "quality", manual: "zimne",
    sources: { fi: "kylmä", et: "külm", lv: "auksts", lt: "šaltas", pl: "zimny", ru: "холодный", sv: "kall", da: "kold", de: "kalt" } },
  { id: "but", gloss: "but", pos: "conj", manual: "ale",
    sources: { fi: "mutta", et: "aga", lv: "bet", lt: "bet", pl: "ale", ru: "но", sv: "men", da: "men", de: "aber" } }
];

/** §8 — words the manual builds with derivation suffixes. */
export const DERIVED: DerivedEntry[] = [
  { id: "size", gloss: "size", from: "big", kind: "abstract", pos: "noun" },
  { id: "fisher", gloss: "fisher", from: "fish", kind: "agent", pos: "noun" },
  { id: "sailor", gloss: "sailor", from: "sail", kind: "agent", pos: "noun" },
  { id: "little-fish", gloss: "little fish", from: "fish", kind: "diminutive", pos: "noun" },
  { id: "salty", gloss: "salty", from: "salt", kind: "adjective", pos: "adj" }
];

/** Forms the manual fixes directly. */
export const FIXED: FixedEntry[] = [
  { id: "baltic-sea", gloss: "the Baltic Sea", pos: "noun", form: "Baltmeri", note: "§0: balt- (Hanse) + meri (Finnic), head-final compound" }
];

/** Synonyms the LLM analysis may use; mapped onto lexicon ids. */
export const ALIASES: Record<string, string> = {
  day: "sun", ocean: "sea", kind: "sort", variety: "sort", type: "sort", large: "big", little: "small", cliff: "rock",
  "he/she/it": "he", she: "he", it: "he", "you (plural)": "you-pl", "you.pl": "you-pl", baltic: "baltic-sea", "baltic sea": "baltic-sea",
  "the baltic": "baltic-sea", herring: "herring", "atlantic herring": "herring", strömming: "baltic-herring", fisherman: "fisher", fishermen: "fisher",
  stone: "rock", foot: "leg", arm: "hand", flesh: "meat", do: "make", earth: "soil", ground: "soil", weep: "cry", crush: "grind", shade: "shadow", beat: "hit", distant: "far", broad: "wide", chest: "breast"
};
