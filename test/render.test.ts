import { describe, expect, it } from "vitest";
import { Engine } from "../src/engine/index";
import { Parser } from "../src/engine/parse";
import { Renderer, type SentenceSpec } from "../src/engine/render";

const engine = new Engine();
const render = (s: SentenceSpec) => new Renderer(engine).render([s]).text;

describe("§10 example sentences", () => {
  it("1. The fish in the Baltic Sea come in many varieties and sizes.", () => {
    expect(render({ words: [
      { kind: "noun", lemma: "baltic-sea", case: "gen" }, { kind: "noun", lemma: "fish" }, { kind: "verb", lemma: "be" },
      { kind: "word", lemma: "many" }, { kind: "noun", lemma: "sort", number: "pl" }, { kind: "word", lemma: "and" }, { kind: "noun", lemma: "size", number: "pl" }
    ] })).toBe("Baltmerin kala er daug sorti i dužusi.");
  });
  it("2. Grey seals rest on the rocks in summer.", () => {
    expect(render({ words: [
      { kind: "noun", lemma: "seal", number: "pl", compoundWith: "grey" }, { kind: "verb", lemma: "rest", person: 3, number: "pl" },
      { kind: "noun", lemma: "rock", number: "pl", case: "ade" }, { kind: "noun", lemma: "summer", case: "ade" }
    ] })).toBe("Peleekhüljei odpočiv kaljuil suvil.");
  });
  it("3. Herring is the most common fish in the Baltic Sea.", () => {
    expect(render({ words: [
      { kind: "noun", lemma: "baltic-herring" }, { kind: "verb", lemma: "be" }, { kind: "adj", lemma: "common", degree: "sup" },
      { kind: "noun", lemma: "fish" }, { kind: "noun", lemma: "baltic-sea", case: "ine" }
    ] })).toBe("Räim er pospolitist kala Baltmerise.");
  });
  it("I see a fish in the water.", () => {
    expect(render({ words: [
      { kind: "pron", lemma: "I" }, { kind: "verb", lemma: "see", person: 1 }, { kind: "noun", lemma: "fish", case: "acc" }, { kind: "noun", lemma: "water", case: "ine" }
    ] })).toBe("Ja vidu kalaa vesise.");
  });
  it("Do you love the sea?", () => {
    expect(render({ question: true, words: [
      { kind: "pron", lemma: "you" }, { kind: "verb", lemma: "love", person: 2 }, { kind: "noun", lemma: "sea", case: "acc" }
    ] })).toBe("Tu kohit li meria?");
  });
  it("I love the sea very much.", () => {
    expect(render({ words: [
      { kind: "pron", lemma: "I" }, { kind: "verb", lemma: "love", person: 1 }, { kind: "noun", lemma: "sea", case: "acc" }, { kind: "adv", lemma: "big" }
    ] })).toBe("Ja kohu meria dužit.");
  });
  it("Fishers catch Baltic herring in autumn.", () => {
    expect(render({ words: [
      { kind: "noun", lemma: "fisher", number: "pl" }, { kind: "verb", lemma: "catch", number: "pl" }, { kind: "noun", lemma: "baltic-herring", case: "acc" }, { kind: "noun", lemma: "autumn", case: "ade" }
    ] })).toBe("Kalajai lov räima sügisl.");
  });
  it("Yesterday the seals were on the rocks.", () => {
    expect(render({ words: [
      { kind: "adv", lemma: "yesterday" }, { kind: "noun", lemma: "seal", number: "pl" }, { kind: "verb", lemma: "be", tense: "past", number: "pl" }, { kind: "noun", lemma: "rock", number: "pl", case: "ade" }
    ] })).toBe("Vakar hüljei bul kaljuil.");
  });
  it("Tomorrow we sail to Gotland in a boat.", () => {
    expect(render({ words: [
      { kind: "adv", lemma: "tomorrow" }, { kind: "pron", lemma: "we" }, { kind: "verb", lemma: "sail", tense: "fut", person: 1, number: "pl" },
      { kind: "name", text: "Gotland", case: "all" }, { kind: "noun", lemma: "boat", case: "ine" }
    ] })).toBe("Home me žeglisme Gotlandile bootse.") // the manual prints bootise; Rule 6 as written leaves t+s alone (vidse, vidte);
  });
  it("The wind blows from the west.", () => {
    expect(render({ words: [
      { kind: "noun", lemma: "wind" }, { kind: "verb", lemma: "blow" }, { kind: "noun", lemma: "west", case: "ela" }
    ] })).toBe("Tuul vi lääste.");
  });
  it("Don't swim in winter!", () => {
    expect(render({ negated: true, end: "!", words: [
      { kind: "verb", lemma: "swim", person: 2 }, { kind: "noun", lemma: "winter", case: "ade" }
    ] })).toBe("Ne plavit talvil!");
  });
  it("One big fish is bigger than three small ones.", () => {
    expect(render({ words: [
      { kind: "num", value: 1 }, { kind: "adj", lemma: "big" }, { kind: "noun", lemma: "fish" }, { kind: "verb", lemma: "be" },
      { kind: "adj", lemma: "big", degree: "comp" }, { kind: "word", lemma: "than" }, { kind: "num", value: 3 }, { kind: "adj", lemma: "small", number: "pl" }
    ] })).toBe("Üks duž kala er dužim kui tri mali.");
  });
  it("§11: The Baltic is not a deep sea.", () => {
    expect(render({ negated: true, words: [
      { kind: "noun", lemma: "baltic-sea" }, { kind: "verb", lemma: "be" }, { kind: "adj", lemma: "deep" }, { kind: "noun", lemma: "sea" }
    ] })).toBe("Baltmeri er ne glembok meri.");
  });
});

describe("new concepts", () => {
  it("derives an unknown word from supplied sources, from the canonical queue", () => {
    const r = new Renderer(engine, [{ id: "bread", pos: "noun", domain: "farm", sources: { fi: "leipä", et: "leib", lv: "maize", lt: "duona", pl: "chleb", ru: "хлеб", sv: "bröd", da: "brød", de: "Brot" } }]);
    const out = r.render([{ words: [{ kind: "noun", lemma: "bread", case: "acc" }] }]);
    expect(out.newDerivations).toHaveLength(1);
    expect(out.text).toMatch(/^[A-ZÄÖÜŠŽČ][a-zäöüšžč]+a\.$/);
  });
});

describe("reverse parse", () => {
  it("glosses a manual sentence", () => {
    const p = new Parser(engine);
    const t = p.parse("Peleekhüljei odpočiv kaljuil suvil.");
    expect(t[0].analyses[0].lemma).toBe("grey+seal");
    expect(t[1].analyses[0].lemma).toBe("rest");
    expect(t[2].analyses[0].features).toBe("pl.ade");
    expect(t[3].analyses[0].lemma).toBe("summer");
  });
});
