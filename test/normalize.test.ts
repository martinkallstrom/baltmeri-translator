import { describe, expect, it } from "vitest";
import { normalize, skeletonOf, skeletonsMatch, stripCitation } from "../src/engine/normalize";

describe("§2 Normalization Table", () => {
  it.each([
    ["sv", "båt", "bot"],
    ["fi", "yksi", "üksi"],
    ["et", "võrk", "vörk"],
    ["lv", "jūs", "juus"],
    ["pl", "głęboki", "glemboki"],
    ["pl", "śledź", "sledz"],
    ["pl", "pływać", "plivats"],
    ["pl", "sól", "sol"],
    ["de", "Sprache", "sprahe"],
    ["de", "Salz", "salts"],
    ["lv", "dzintars", "dzintars"],
    ["ru", "сельдь", "seld"],
    ["ru", "жить", "žit"],
    ["sv", "sill", "sil"]
  ] as const)("%s %s → %s", (lang, raw, expected) => {
    expect(normalize(lang, raw)).toBe(expected);
  });
});

describe("consonant skeletons", () => {
  it("treats sild and śledź as the same word", () => {
    expect(skeletonOf("sild")).toEqual(["S", "L", "T"]);
    expect(skeletonOf("sledz")).toEqual(["S", "L", "T"]);
    expect(skeletonsMatch(skeletonOf("sild"), skeletonOf("sledz"))).toBe(true);
  });
  it("allows one differing position at equal length", () => {
    expect(skeletonsMatch(skeletonOf("dzintar"), skeletonOf("jantar"))).toBe(true);
    expect(skeletonsMatch(skeletonOf("četri"), skeletonOf("keturi"))).toBe(true);
    expect(skeletonsMatch(skeletonOf("sol"), skeletonOf("salt"))).toBe(false);
  });
});

describe("§3 Rule 0 citation stripping", () => {
  it.each([
    ["pl", "verb", "kochać", "koch"],
    ["pl", "verb", "żeglować", "żegl"],
    ["pl", "verb", "odpoczywać", "odpoczyw"],
    ["pl", "verb", "być", "by"],
    ["ru", "verb", "видеть", "вид"],
    ["lv", "noun", "dzintars", "dzintar"],
    ["lv", "adj", "pelēks", "pelēk"],
    ["pl", "adj", "duży", "duż"],
    ["et", "verb", "olema", "ole"],
    ["de", "verb", "sehen", "seh"]
  ] as const)("%s %s %s → %s", (lang, pos, raw, expected) => {
    expect(stripCitation(lang, pos, raw)).toBe(expected);
  });
});
