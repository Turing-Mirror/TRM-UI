// @vitest-environment happy-dom
import { useEffect, act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { createNav } from "../lib/nav";
import { PageHost, PAGE_OUT_MS } from "./PageHost";
const nav = createNav([{id: "a", labelKey: "a"}, {id: "b", labelKey: "b"}] as const);
const mounted = vi.fn();
const removed = vi.fn();
function Page({id}: {id: "a" | "b"}) {
  useEffect(() => { mounted(id); return () => { removed(id); }; }, [id]);
  return <input aria-label={id} defaultValue={id} />;
}
let m: Mounted;
afterEach(() => { m?.unmount(); vi.useRealTimers(); vi.clearAllMocks(); vi.restoreAllMocks(); });
const host = (axis: "x" | "y", page: "a" | "b") => <PageHost nav={nav} page={page} axis={axis}>
  {id => <Page id={id} />}
</PageHost>;
describe("PageHost axis=x", () => {
  it("removes the outgoing page in the same frame and only the new page enters", () => {
    m = mount(host("x", "a"));
    act(() => m.root.render(host("x", "b")));
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
    expect(m.container.querySelector(".page-enter-l")).not.toBeNull();
    expect(m.container.querySelector('[class*="page-leave-"]')).toBeNull();
    expect(removed.mock.calls).toEqual([["a"]]);
    act(() => m.root.render(host("x", "a")));
    expect(m.container.querySelector(".page-enter-r")).not.toBeNull();
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
  });
});
describe("PageHost axis=y", () => {
  it("enabling reduced motion clears the outgoing layer immediately", () => {
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce=false;
    Object.defineProperty(media,"matches",{get:()=>reduce,configurable:true});
    vi.spyOn(window,"matchMedia").mockReturnValue(media);
    m=mount(host("y", "a"));
    act(() => m.root.render(host("y", "b")));
    expect(m.container.querySelectorAll("input")).toHaveLength(2);
    act(() => { reduce=true; media.dispatchEvent(new Event("change")); });
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
    expect(m.container.querySelector('[class*="page-enter-"]')).toBeNull();
  });
  it("keeps the outgoing subtree and its state during a quick return", () => {
    vi.useFakeTimers();
    m = mount(host("y", "a"));
    const a = m.container.querySelector("input")!;
    a.value = "edited";
    act(() => m.root.render(host("y", "b")));
    expect(m.container.querySelector(".page-enter-u")).not.toBeNull();
    expect(m.container.querySelector(".page-leave-u")).not.toBeNull();
    expect(mounted.mock.calls).toEqual([["a"], ["b"]]);
    expect(a.closest("[inert]")).not.toBeNull();
    act(() => m.root.render(host("y", "a")));
    expect(m.container.querySelector(".page-enter-d")).not.toBeNull();
    expect(m.container.querySelector(".page-leave-d")).not.toBeNull();
    expect(m.container.querySelector('input[aria-label="a"]')).toBe(a);
    expect(a.value).toBe("edited");
    act(() => vi.advanceTimersByTime(PAGE_OUT_MS - 1));
    expect(m.container.querySelectorAll("input")).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(removed.mock.calls).toEqual([["b"]]);
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
  });
});
describe.each(["x", "y"] as const)("PageHost axis=%s", axis => {
  it("100 switches leave only one mounted page", () => {
    vi.useFakeTimers();
    m = mount(host(axis, "a"));
    for (let i=0; i<100; i++) {
      act(() => m.root.render(host(axis, i%2 ? "a" : "b")));
      act(() => vi.advanceTimersByTime(500));
    }
    expect(mounted.mock.calls.length-removed.mock.calls.length).toBe(1);
  });
});
