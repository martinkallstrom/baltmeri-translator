import { describe, expect, it } from "vitest";
import { Engine } from "../src/engine/index";

/**
 * Entries whose engine derivation is known to differ from the manual's decree.
 * The manual is authoritative, so these are used as decreed; the list is kept
 * exact so any change in engine behaviour shows up here.
 */
export const KNOWN_DIVERGENCES = [
  "herring", "boat", "amber", "be", "baltic-herring", "I", "you", "we", "you-pl", "one", "three", "five",
  "and", "no", "question", "many", "see", "water", "very", "tomorrow", "sail", "swim", "winter", "than",
  "ice", "cod", "salmon", "sun", "cold", "but"
];

describe("§12 mini-lexicon golden derivations", () => {
  const engine = new Engine();
  const byId = new Map(engine.derivations.map((d) => [d.id, d]));

  it("derives every manual entry", () => {
    for (const d of engine.derivations) expect(d.form.length, d.id).toBeGreaterThan(0);
  });

  for (const d of engine.derivations.filter((d) => d.matchesManual !== null)) {
    const decreed = KNOWN_DIVERGENCES.includes(d.id);
    it(`${d.id} → ${d.form} (${decreed ? "manual decree" : "reproduced by the rules"})`, () => {
      if (decreed) expect(d.derived, `${d.id} now matches the manual; remove it from KNOWN_DIVERGENCES`).not.toBe(d.form);
      else expect(d.derived).toBe(d.form);
    });
  }

  it("collision: and → i because ja already means I", () => {
    const and = byId.get("and")!;
    expect(and.form).toBe("i");
    expect(byId.get("I")!.form).toBe("ja");
  });

  it("§8 derivations", () => {
    expect(engine.words.get("size")!.stem).toBe("dužus");
    expect(engine.words.get("fisher")!.stem).toBe("kalaja");
    expect(engine.words.get("little-fish")!.stem).toBe("kalaka");
    expect(engine.words.get("salty")!.stem).toBe("solne");
    expect(engine.words.get("baltic-sea")!.stem).toBe("Baltmeri");
  });

  it("reports the divergence count honestly", () => {
    expect(engine.divergences().map((d) => d.id).sort()).toEqual([...KNOWN_DIVERGENCES].sort());
  });
});
