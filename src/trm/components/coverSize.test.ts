import { describe, expect, it } from "vitest";
import { coverSize } from "./coverSize";
describe("cropped cover output", () => {
  it("keeps portrait and landscape proportions", () => {
    expect(coverSize(800, 600)).toEqual([683, 512]);
    expect(coverSize(600, 800)).toEqual([512, 683]);
  });
  it("bounds long free selections without producing a zero dimension", () => {
    expect(coverSize(100000, 1)).toEqual([2048, 1]);
    expect(coverSize(1, 100000)).toEqual([1, 2048]);
  });
});
