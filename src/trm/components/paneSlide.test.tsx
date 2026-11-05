// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Pane, Panes, FLOW_MS } from "./motion";
import { mount, type Mounted } from "../test/dom";
let mounted: Mounted;
afterEach(() => { mounted?.unmount(); vi.restoreAllMocks(); vi.useRealTimers(); });
function setup() {
  vi.useFakeTimers();
  const positions = new Map<Element, string>();
  const original = getComputedStyle;
  vi.spyOn(globalThis, "getComputedStyle").mockImplementation(el => {
    const style = original(el);
    return new Proxy(style, { get: (target, key) => key === "transform" && positions.has(el) ? positions.get(el) : Reflect.get(target, key, target) });
  });
  const calls: { element: Element; frames: Keyframe[]; cancel: ReturnType<typeof vi.fn> }[] = [];
  vi.spyOn(HTMLElement.prototype, "animate").mockImplementation(function (this: HTMLElement, frames) {
    const keys = frames as Keyframe[];
    positions.set(this, String(keys[0].transform));
    const cancel = vi.fn(() => positions.delete(this));
    calls.push({ element: this, frames: keys, cancel });
    return { cancel, finished: Promise.resolve() } as unknown as Animation;
  });
  const render = (value: string, transition: "slide" | "push" = "slide") => <Panes value={value} order={["a", "b", "c"]} transition={transition}>{["a", "b", "c"].map(id => <Pane key={id} id={id}><input defaultValue={id} /></Pane>)}</Panes>;
  mounted = mount(render("a"));
  const pane = (id: string) => mounted.container.querySelector<HTMLElement>(`[data-trm-pane="${id}"]`)!;
  const select = (id: string) => act(() => mounted.root.render(render(id)));
  return { calls, positions, pane, select, render };
}
it("slides adjacent categories horizontally without fading or scaling and retains input state", () => {
  const { calls, pane, select } = setup();
  const input = pane("a").querySelector("input")!;
  input.value = "saved";
  select("b");
  expect(calls).toHaveLength(2);
  expect(calls.find(call => call.element === pane("a"))!.frames[1].transform).toBe("translate3d(-100%, 0, 0)");
  expect(calls.find(call => call.element === pane("b"))!.frames[0].transform).toBe("translate3d(100%, 0, 0)");
  expect(calls.every(call => call.frames.every(frame => !("opacity" in frame) && !String(frame.transform).includes("scale")))).toBe(true);
  expect(pane("a").style.opacity).toBe("1");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(pane("a").hidden).toBe(true);
  select("a");
  expect(pane("a").querySelector("input")).toBe(input);
  expect(input.value).toBe("saved");
  expect(calls.at(-1)!.frames[1].transform).toBe("translate3d(100%, 0, 0)");
});
it("reverses from the painted positions and cancels the interrupted animations", () => {
  const { calls, positions, pane, select } = setup();
  select("b");
  positions.set(pane("a"), "matrix(1, 0, 0, 1, -240, 0)");
  positions.set(pane("b"), "matrix(1, 0, 0, 1, 760, 0)");
  const first = calls.slice();
  select("a");
  expect(first.every(call => call.cancel.mock.calls.length === 1)).toBe(true);
  expect(calls.slice(2).map(call => call.frames[0].transform)).toEqual(["matrix(1, 0, 0, 1, -240, 0)", "matrix(1, 0, 0, 1, 760, 0)"]);
});
it("finishes the visible pair before opening the latest third category", () => {
  const { calls, pane, select } = setup();
  select("b");
  select("c");
  expect(pane("a").hidden).toBe(false);
  expect(pane("b").hidden).toBe(false);
  expect(pane("c").hidden).toBe(true);
  expect(calls).toHaveLength(2);
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(pane("a").hidden).toBe(true);
  expect(pane("b").hidden).toBe(false);
  expect(pane("c").hidden).toBe(false);
  expect(calls.at(-1)!.frames[0].transform).toBe("translate3d(100%, 0, 0)");
});
it("leaves the existing default push animation unchanged", () => {
  const { calls, render } = setup();
  act(() => mounted.root.render(render("b", "push")));
  expect(calls.some(call => call.frames.some(frame => "opacity" in frame))).toBe(true);
  expect(calls.some(call => call.frames.some(frame => String(frame.transform).includes("scale(0.99)")))).toBe(true);
});
