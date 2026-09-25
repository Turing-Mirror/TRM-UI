import { describe, expect, it } from "vitest";
import { pageList } from "./display";

describe("pageList", () => {
  it("页数少时全部列出", () => {
    expect(pageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it("在开头时列出前四页与最后一页", () => {
    expect(pageList(2, 12)).toEqual([1, 2, 3, 4, null, 12]);
  });
  it("在中间时首尾之间各留一个省略号", () => {
    expect(pageList(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
  });
  it("在末尾时列出最后四页", () => {
    expect(pageList(12, 12)).toEqual([1, null, 9, 10, 11, 12]);
  });
});
