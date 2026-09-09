import { describe, expect, it } from "vitest";
import { LEIPZIG_JAKARTA, LEIPZIG_JAKARTA_IN_MANUAL } from "../src/engine/core";
import { Engine } from "../src/engine/index";
import { LANGS } from "../src/engine/languages";

describe("Leipzig–Jakarta core lexicon", () => {
  const engine = new Engine();
  const ids = new Set(LEIPZIG_JAKARTA.map((c) => c.id));

  it("covers the 100 meanings: 84 derived here, 16 fixed by the Manual", () => {
    expect(LEIPZIG_JAKARTA).toHaveLength(84);
    expect(Object.keys(LEIPZIG_JAKARTA_IN_MANUAL)).toHaveLength(16);
    for (const id of Object.values(LEIPZIG_JAKARTA_IN_MANUAL)) if (!id.startsWith("(")) expect(engine.words.has(id), id).toBe(true);
  });

  it("supplies all nine source forms for every concept", () => {
    for (const c of LEIPZIG_JAKARTA) for (const l of LANGS) expect(c.sources[l], `${c.id}.${l}`).toBeTruthy();
  });

  it("derives a pronounceable stem for every concept", () => {
    for (const d of engine.derivations.filter((d) => ids.has(d.id))) {
      expect(d.form, d.id).toMatch(/^[a-zäöüšžč]{2,}$/);
      expect(d.form, d.id).toMatch(/[aeiouäöü]/);
    }
  });

  it("keeps the whole seed lexicon injective, including the copula stems", () => {
    const forms = [...engine.words.values()].map((w) => w.stem);
    expect(new Set(forms).size).toBe(forms.length);
    expect(forms).not.toContain("es");
    expect(forms).not.toContain("er");
  });

  it("derives the Manual first, then the core list, and records both queue states", () => {
    expect(engine.manualQueue).toEqual(["fi", "de", "ru", "pl", "da", "sv", "lt", "et", "lv"]);
    expect(engine.canonicalQueue).toHaveLength(9);
    expect(engine.words.size).toBe(153);
  });

  it.each([["nose", "nos"], ["bone", "kaul"], ["tongue", "meel"], ["child", "barn"], ["bird", "ptak"], ["tooth", "tand"], ["soil", "zem"], ["star", "täht"], ["hand", "rok"], ["who", "kas"], ["what", "mis"]])(
    "%s → %s", (id, form) => { expect(engine.words.get(id)!.stem).toBe(form); }
  );
});
