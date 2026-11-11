// @vitest-environment happy-dom
import { useEffect, act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { createNav } from "../lib/nav";
import { PageHost } from "./PageHost";

type Id = "a" | "b" | "c";
const nav = createNav([{ id: "a", labelKey: "a" }, { id: "b", labelKey: "b" }, { id: "c", labelKey: "c" }] as const);
const mounted = vi.fn();
const removed = vi.fn();
function Page({ id }: { id: Id }) {
  useEffect(() => { mounted(id); return () => { removed(id); }; }, [id]);
  return <input aria-label={id} defaultValue={id} />;
}
const host = (axis: "x" | "y", page: Id, keep?: (id: Id) => boolean) => <PageHost nav={nav} page={page} axis={axis} keep={keep}>
  {id => <Page id={id} />}
</PageHost>;

/** 可手动结束的动画替身：记录每段动画的起止，finish() 让最后一段走完。 */
function stubAnimate() {
  const runs: { frames: Keyframe[]; cancelled: boolean; finish: () => void }[] = [];
  const original = HTMLElement.prototype.animate;
  HTMLElement.prototype.animate = function (frames: Keyframe[]) {
    let done!: () => void;
    let fail!: (reason: unknown) => void;
    const finished = new Promise<void>((resolve, reject) => { done = resolve; fail = reject; });
    const run = { frames, cancelled: false, finish: done };
    runs.push(run);
    return { finished, cancel: () => { run.cancelled = true; fail(new Error("cancelled")); } } as unknown as Animation;
  } as typeof HTMLElement.prototype.animate;
  return { runs, restore: () => { HTMLElement.prototype.animate = original; } };
}

/** 没有 Web Animations 的环境。 */
function noAnimate() {
  const original = HTMLElement.prototype.animate;
  (HTMLElement.prototype as { animate?: unknown }).animate = undefined;
  return { runs: [], restore: () => { HTMLElement.prototype.animate = original; } };
}

let m: Mounted;
let stub: ReturnType<typeof stubAnimate> | undefined;
afterEach(() => { m?.unmount(); stub?.restore(); stub = undefined; vi.clearAllMocks(); vi.restoreAllMocks(); });
const pane = (id: Id) => m.container.querySelector<HTMLInputElement>(`input[aria-label="${id}"]`)!.parentElement as HTMLElement;
const finish = async () => { await act(async () => { stub!.runs[stub!.runs.length - 1].finish(); await Promise.resolve(); }); };

describe.each(["x", "y"] as const)("PageHost axis=%s", axis => {
  const edge = axis === "y" ? "top" : "left";
  const moved = (slots: number) => axis === "y" ? `translate3d(0, ${slots * 100}%, 0)` : `translate3d(${slots * 100}%, 0, 0)`;

  it("puts the new page edge to edge with the old one and moves both as one strip", async () => {
    stub = stubAnimate();
    m = mount(host(axis, "a"));
    act(() => m.root.render(host(axis, "b")));
    expect(m.container.querySelectorAll("input")).toHaveLength(2);
    expect(pane("a").style[edge]).toBe("0%");
    expect(pane("b").style[edge]).toBe("100%");
    expect(pane("a").hasAttribute("inert")).toBe(true);
    expect(pane("b").hasAttribute("inert")).toBe(false);
    expect(stub.runs).toHaveLength(1);
    expect(stub.runs[0].frames[0].transform).toBe("translate3d(0, 0, 0)");
    expect(stub.runs[0].frames[1].transform).toBe(moved(-1));
    expect(stub.runs[0].frames.every(frame => !("opacity" in frame))).toBe(true);
    await finish();
    expect(removed.mock.calls).toEqual([["a"]]);
    expect(pane("b").style[edge]).toBe("0%");
    expect(pane("b").parentElement!.style.transform).toBe("");
  });

  it("returns to the outgoing page without remounting it or losing its state", async () => {
    stub = stubAnimate();
    m = mount(host(axis, "a"));
    const a = m.container.querySelector("input")!;
    a.value = "edited";
    act(() => m.root.render(host(axis, "b")));
    act(() => m.root.render(host(axis, "a")));
    expect(m.container.querySelector('input[aria-label="a"]')).toBe(a);
    expect(a.value).toBe("edited");
    expect(stub.runs[0].cancelled).toBe(true);
    expect(stub.runs[1].frames[1].transform).toBe(moved(0));
    expect(mounted.mock.calls).toEqual([["a"], ["b"]]);
    await finish();
    expect(removed.mock.calls).toEqual([["b"]]);
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
  });

  it("keeps every page of a quick run on the strip until it settles", async () => {
    stub = stubAnimate();
    m = mount(host(axis, "a"));
    act(() => m.root.render(host(axis, "b")));
    act(() => m.root.render(host(axis, "c")));
    expect(m.container.querySelectorAll("input")).toHaveLength(3);
    expect(pane("c").style[edge]).toBe("200%");
    expect(stub.runs[1].frames[1].transform).toBe(moved(-2));
    await finish();
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
    expect(pane("c").style[edge]).toBe("0%");
  });

  it("switches at once when animation is unavailable", () => {
    stub = noAnimate();
    m = mount(host(axis, "a"));
    act(() => m.root.render(host(axis, "b")));
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
    expect(removed.mock.calls).toEqual([["a"]]);
  });

  it("enabling reduced motion clears the outgoing page immediately", () => {
    stub = stubAnimate();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = false;
    Object.defineProperty(media, "matches", { get: () => reduce, configurable: true });
    vi.spyOn(window, "matchMedia").mockReturnValue(media);
    m = mount(host(axis, "a"));
    act(() => m.root.render(host(axis, "b")));
    expect(m.container.querySelectorAll("input")).toHaveLength(2);
    act(() => { reduce = true; media.dispatchEvent(new Event("change")); });
    expect(m.container.querySelectorAll("input")).toHaveLength(1);
  });

  it("keeps a kept page mounted, hidden and at its scroll position", async () => {
    stub = stubAnimate();
    const keep = (id: Id) => id === "a";
    m = mount(host(axis, "a", keep));
    const a = pane("a");
    a.scrollTop = 130;
    act(() => { a.dispatchEvent(new Event("scroll")); });
    act(() => m.root.render(host(axis, "b", keep)));
    await finish();
    expect(pane("a")).toBe(a);
    expect(a.className).toContain("invisible");
    expect(a.hasAttribute("inert")).toBe(true);
    expect(removed).not.toHaveBeenCalled();
    a.scrollTop = 0;
    act(() => m.root.render(host(axis, "a", keep)));
    expect(pane("a")).toBe(a);
    expect(a.scrollTop).toBe(130);
    expect(a.className).not.toContain("invisible");
  });

  it("100 switches leave only one mounted page", () => {
    stub = noAnimate();
    m = mount(host(axis, "a"));
    for (let i = 0; i < 100; i++) act(() => m.root.render(host(axis, i % 2 ? "a" : "b")));
    expect(mounted.mock.calls.length - removed.mock.calls.length).toBe(1);
  });
});
