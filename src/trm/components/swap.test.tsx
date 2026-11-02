// @vitest-environment happy-dom
import { act, StrictMode, useEffect, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Swap, Pane, Panes, usePaneOn } from "./motion";
import { mount, type Mounted } from "../test/dom";
let view: Mounted;
afterEach(() => { view?.unmount(); vi.restoreAllMocks(); vi.useRealTimers(); });
it.each(["push", "fade"] as const)("retains the existing outgoing DOM and draft with %s", variant => {
  vi.useFakeTimers();
  const mounted = vi.fn(), removed = vi.fn();
  function Draft({ name }: { name: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => { mounted(name); return () => removed(name); }, [name]);
    return <button onClick={() => setCount(value => value + 1)}>{name}:{count}</button>;
  }
  const render = (key: string) => <Swap k={key} variant={variant}><Draft name={key} /></Swap>;
  view = mount(render("one"));
  const original = view.container.querySelector("button")!;
  act(() => original.click());
  act(() => view.root.render(render("two")));
  expect(view.container.contains(original)).toBe(true);
  expect(original.textContent).toBe("one:1");
  expect(mounted.mock.calls.filter(([key]) => key === "one")).toHaveLength(1);
  expect(removed).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(500));
  expect(view.container.contains(original)).toBe(false);
  expect(removed).toHaveBeenCalledWith("one");
});
it("inherits visibility from the enclosing pane", () => {
  function State() { return <span data-active={usePaneOn()}/>; }
  view = mount(<Panes value="other"><Pane id="inside"><Swap k="one"><State /></Swap></Pane><Pane id="other">Other</Pane></Panes>);
  expect(view.container.querySelector("[data-active]")?.getAttribute("data-active")).toBe("false");
});

it("starts newly mounted content transparent during StrictMode effect replay", () => {
  vi.useFakeTimers();
  const animated = vi.spyOn(HTMLElement.prototype, "animate");
  const render = (key: string) => <StrictMode><Swap k={key}><span>{key}</span></Swap></StrictMode>;
  view = mount(render("one"));
  act(() => view.root.render(render("two")));
  const incoming = [...view.container.querySelectorAll("span")].find(el => el.textContent === "two")!.parentElement;
  const fades = animated.mock.calls.filter((_, i) => animated.mock.contexts[i] === incoming)
    .map(([frames]) => frames as Keyframe[]).filter(frames => "opacity" in frames[0]);
  expect(fades.length).toBeGreaterThan(0);
  expect(fades.every(frames => frames[0].opacity === 0)).toBe(true);
});
