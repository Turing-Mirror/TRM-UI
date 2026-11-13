import { describe, expect, it } from "vitest";
import { ART_COUNT, artInitial, artOf } from "./art";

describe("art", () => {
  it("gives the same colour for the same seed and stays inside the palette", () => {
    expect(artOf("Alice v2")).toBe(artOf("Alice v2"));
    for (const seed of ["", "a", "Alice", "爱丽丝", "モデル"]) {
      const n = Number(/--art-(\d+)/.exec(artOf(seed))?.[1]);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(ART_COUNT);
    }
  });

  it("spreads similar names over more than one colour", () => {
    const seen = new Set(["Alice 1", "Alice 2", "Alice 3", "Alice 4", "Alice 5", "Alice 6"].map(artOf));
    expect(seen.size).toBeGreaterThan(1);
  });

  it("takes the first letter or digit of a name", () => {
    expect(artInitial("alice")).toBe("A");
    expect(artInitial("  [v2] 爱丽丝")).toBe("V");
    expect(artInitial("爱丽丝")).toBe("爱");
    expect(artInitial("---")).toBe("");
  });
});
