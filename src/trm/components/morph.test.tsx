// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Morph } from "./motion";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.unstubAllGlobals(); });

it("does not animate a hidden pane from zero when it becomes visible again", () => {
  let resize = () => {};
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resize = callback; }
    observe() {} disconnect() {}
  });
  view = mount(<Morph><div>Retained page</div></Morph>);
  const outer = view.container.firstElementChild as HTMLElement;
  const inner = outer.firstElementChild as HTMLElement;
  let height = 900, laidOut = true;
  Object.defineProperty(inner, "offsetHeight", { get: () => height });
  inner.getClientRects = () => (laidOut ? [new DOMRect(0, 0, 600, height)] : []) as unknown as DOMRectList;
  act(resize);
  expect(outer.style.height).toBe("");
  height = 1000;
  act(resize);
  expect(outer.style.height).toBe("1000px");
  laidOut = false;
  height = 0;
  act(resize);
  expect(outer.style.height).toBe("");
  laidOut = true;
  height = 1000;
  act(resize);
  expect(outer.style.height).toBe("");
  expect(outer.hasAttribute("data-morphing")).toBe(false);
  height = 1100;
  act(resize);
  expect(outer.style.height).toBe("1100px");
});

it("keeps the replacement height transition when an interrupted transition cancels", () => {
  let resize = () => {};
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resize = callback; }
    observe() {} disconnect() {}
  });
  view = mount(<Morph><div>Resizing content</div></Morph>);
  const outer = view.container.firstElementChild as HTMLElement;
  const inner = outer.firstElementChild as HTMLElement;
  let height = 400;
  Object.defineProperty(inner, "offsetHeight", { get: () => height });
  inner.getClientRects = () => [new DOMRect(0, 0, 600, height)] as unknown as DOMRectList;
  act(resize);
  height = 600;
  act(resize);
  height = 800;
  act(resize);
  act(() => outer.dispatchEvent(Object.assign(new Event("transitioncancel"), { propertyName: "height" })));
  expect(outer.style.height).toBe("800px");
  act(() => outer.dispatchEvent(Object.assign(new Event("transitionend"), { propertyName: "height" })));
  expect(outer.style.height).toBe("");
});
