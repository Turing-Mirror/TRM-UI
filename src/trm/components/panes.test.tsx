// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Pane, Panes, FLOW_MS } from "./motion";
import { mount, type Mounted } from "../test/dom";
let view: Mounted;
afterEach(() => { view?.unmount(); vi.restoreAllMocks(); vi.useRealTimers(); });
it("keeps full-height panes in one positioning container and retains input state across interrupted navigation", () => {
  vi.useFakeTimers();
  const render = (value: string) => <Panes value={value} layout="fill" className="h-full"><Pane id="list"><input defaultValue="draft" /></Pane><Pane id="detail" className="flex"><div>Canvas</div></Pane></Panes>;
  view = mount(render("list"));
  const input = view.container.querySelector("input")!;
  input.value = "unsaved draft";
  expect(view.container.querySelector(".morph")).toBeNull();
  act(() => view.root.render(render("detail")));
  act(() => vi.advanceTimersByTime(80));
  act(() => view.root.render(render("list")));
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.querySelector("input")).toBe(input);
  expect(input.value).toBe("unsaved draft");
  const hidden = view.container.querySelector<HTMLElement>('[data-trm-pane="detail"]')!;
  expect(hidden.hidden).toBe(true);
  expect(hidden.hasAttribute("inert")).toBe(true);
  expect(hidden.parentElement?.classList.contains("trm-panes-fill")).toBe(true);
});

it("restores settled scroll positions even if the browser clamps the outgoing layout", () => {
  vi.useFakeTimers();
  const render = (value: string) => <div data-page-scroll><Panes value={value} order={["list", "detail"]} keepScroll><Pane id="list">Long list</Pane><Pane id="detail">Short detail</Pane></Panes></div>;
  view = mount(render("list"));
  const scroll = view.container.querySelector<HTMLElement>("[data-page-scroll]")!;
  act(() => { scroll.scrollTop = 650; scroll.dispatchEvent(new Event("scroll")); });
  // Simulate the layout commit clamping the previous scroll before restoration runs.
  scroll.scrollTop = 40;
  act(() => view.root.render(render("detail")));
  expect(scroll.scrollTop).toBe(0);
  expect(view.container.querySelector<HTMLElement>('[data-trm-pane="list"]')?.style.top).toBe("-650px");
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  act(() => view.root.render(render("list")));
  expect(scroll.scrollTop).toBe(650);
  act(() => view.root.render(render("list")));
  expect(scroll.scrollTop).toBe(650);
});

it("reverses from the currently painted opacity and transform", () => {
  vi.useFakeTimers();
  const animated = vi.spyOn(HTMLElement.prototype, "animate");
  const render = (value: string) => <Panes value={value}><Pane id="list">List</Pane><Pane id="detail">Detail</Pane></Panes>;
  view = mount(render("list"));
  act(() => view.root.render(render("detail")));
  const detail = view.container.querySelector<HTMLElement>('[data-trm-pane="detail"]')!;
  const computed = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation(el => {
    const style = computed(el);
    if (el !== detail) return style;
    // happy-dom does not paint intermediate animation frames. Supply that browser sample.
    return new Proxy(style, { get(target, key) {
      if (key === "opacity") return "0.18";
      if (key === "transform") return "matrix(1, 0, 0, 1, 8, 0)";
      return Reflect.get(target, key);
    } });
  });
  animated.mockClear();
  act(() => view.root.render(render("list")));
  const keyframes = animated.mock.calls.filter((_, i) => animated.mock.contexts[i] === detail).map(([frames]) => frames as Keyframe[]);
  expect(keyframes.find(frames => "opacity" in frames[0])?.[0].opacity).toBe(0.18);
  expect(keyframes.find(frames => "transform" in frames[0])?.[0].transform).toBe("matrix(1, 0, 0, 1, 8, 0)");
});
