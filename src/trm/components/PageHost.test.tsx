// @vitest-environment happy-dom
import { useEffect, act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { createNav } from "../lib/nav";
import { PageHost } from "./PageHost";
const nav = createNav([{id: "a", labelKey: "a"}, {id: "b", labelKey: "b"}] as const);
const mounted = vi.fn();
const removed = vi.fn();
function Page({id}: {id: "a" | "b"}) {
  useEffect(() => { mounted(id); return () => { removed(id); }; }, [id]);
  return <input aria-label={id} defaultValue={id} />;
}
const host = (page: "a" | "b") => <PageHost nav={nav} page={page}>{id => <Page id={id} />}</PageHost>;
let m: Mounted;
afterEach(() => { m?.unmount(); vi.useRealTimers(); vi.clearAllMocks(); });
describe("PageHost", () => {
  it("keeps the outgoing subtree and its state during a quick return", () => {
    vi.useFakeTimers();
    m = mount(host("a"));
    const a = m.container.querySelector("input")!;
    a.value = "edited";
    act(() => m.root.render(host("b")));
    expect(mounted.mock.calls).toEqual([["a"], ["b"]]);
    expect(a.closest("[inert]")).not.toBeNull();
    act(() => m.root.render(host("a")));
    expect(m.container.querySelector('input[aria-label="a"]')).toBe(a);
    expect(a.value).toBe("edited");
    act(() => vi.advanceTimersByTime(500));
    expect(removed.mock.calls).toEqual([["b"]]);
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
  });
  it("100 switches leave only one mounted page", () => {
    vi.useFakeTimers();
    m = mount(host("a"));
    for (let i=0; i<100; i++) {
      act(() => m.root.render(host(i%2 ? "a" : "b")));
      act(() => vi.advanceTimersByTime(500));
    }
    expect(mounted.mock.calls.length-removed.mock.calls.length).toBe(1);
  });
});
