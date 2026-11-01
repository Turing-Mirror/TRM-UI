// @vitest-environment happy-dom
import { act, useEffect, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Swap, Pane, Panes, usePaneOn } from "./motion";
import { mount, type Mounted } from "../test/dom";
let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); });
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
