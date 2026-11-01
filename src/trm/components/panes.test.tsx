// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Pane, Panes, FLOW_MS } from "./motion";
import { mount, type Mounted } from "../test/dom";
let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); });
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
