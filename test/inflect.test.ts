import { describe, expect, it } from "vitest";
import { COPULA, adjective, adverb, derive, infinitive, noun, pronoun, verb } from "../src/engine/inflect";
import { repair } from "../src/engine/repair";

describe("§3 Rule 6 repair", () => {
  it.each([
    [["lääs", "ste"], "lääste"],
    [["pospolit", "st"], "pospolitist"],
    [["vid", "t"], "vidit"],
    [["koh", "t"], "kohit"],
    [["duž", "m"], "dužim"],
    [["duž", "t"], "dužit"],
    [["talv"], "talv"],
    [["bu", "s", "t"], "bust"],
    [["zimn", "ne"], "zimne"]
  ])("%j → %s", (parts, expected) => {
    expect(repair(parts[0], ...parts.slice(1)).form).toBe(expected);
  });
});

describe("§4 nouns", () => {
  it("plural -i and the seven cases stack", () => {
    expect(noun("kala", "pl").form).toBe("kalai");
    expect(noun("hülje", "pl").form).toBe("hüljei");
    expect(noun("sort", "pl").form).toBe("sorti");
    expect(noun("kalju", "pl", "ade").form).toBe("kaljuil");
    expect(noun("Baltmeri", "sg", "ine").form).toBe("Baltmerise");
    expect(noun("Baltmeri", "sg", "gen").form).toBe("Baltmerin");
    expect(noun("kala", "sg", "acc").form).toBe("kalaa");
    expect(noun("kala", "pl", "acc").form).toBe("kalai");
    expect(noun("suvi", "sg", "ade").form).toBe("suvil");
    expect(noun("lääs", "sg", "ela").form).toBe("lääste");
    expect(noun("Gotland", "sg", "all").form).toBe("Gotlandile");
    expect(noun("vesi", "sg", "ine").form).toBe("vesise");
    expect(noun("sügis", "sg", "ade").form).toBe("sügisl");
    expect(noun("meri", "sg", "ade").form).toBe("meril");
  });
});

describe("§5 adjectives", () => {
  it("compare and derive", () => {
    expect(adjective("duž", "pl").form).toBe("duži");
    expect(adjective("duž", "sg", "comp").form).toBe("dužim");
    expect(adjective("pospolit", "sg", "sup").form).toBe("pospolitist");
    expect(adverb("duž").form).toBe("dužit");
    expect(derive("sol", "adjective").form).toBe("solne");
    expect(derive("duž", "abstract").form).toBe("dužus");
  });
});

describe("§6 pronouns", () => {
  it("genitives", () => {
    expect(pronoun("I", "gen")).toBe("jan");
    expect(pronoun("he", "gen")).toBe("hanen");
    expect(pronoun("we", "gen")).toBe("men");
    expect(pronoun("you-pl", "gen")).toBe("juusen");
  });
});

describe("§7 verbs — the vidte paradigm", () => {
  it("present / past / future", () => {
    expect(infinitive("vid").form).toBe("vidte");
    expect(infinitive("bu").form).toBe("bute");
    expect(infinitive("plav").form).toBe("plavte");
    const table: Record<string, string> = {
      "pres.1sg": "vidu", "pres.2sg": "vidit", "pres.3sg": "vid", "pres.1pl": "vidme", "pres.2pl": "vidte",
      "past.1sg": "vidlu", "past.2sg": "vidlit", "past.3sg": "vidil", "past.1pl": "vidilme", "past.2pl": "vidilte",
      "fut.1sg": "vidsu", "fut.2sg": "vidsit", "fut.3sg": "vids", "fut.1pl": "vidisme", "fut.2pl": "vidiste"
    };
    for (const [k, v] of Object.entries(table)) {
      const [t, pn] = k.split(".") as ["pres" | "past" | "fut", string];
      const person = Number(pn[0]) as 1 | 2 | 3;
      const number = pn.slice(1) as "sg" | "pl";
      expect(verb("vid", t, person, number).form, k).toBe(v);
    }
    expect(verb("plav", "fut", 1, "pl").form).toBe("plavisme");
    expect(verb("žegl", "fut", 1, "pl").form).toBe("žeglisme");
    expect(verb("koh", "pres", 2, "sg").form).toBe("kohit");
    expect(verb("odpočiv", "pres", 3, "pl").form).toBe("odpočiv");
  });
  it("copula", () => {
    expect(COPULA.pres.sg[3]).toBe("er");
    expect(COPULA.past.pl[1]).toBe("bulme");
    expect(COPULA.fut.sg[3]).toBe("bus");
  });
});
