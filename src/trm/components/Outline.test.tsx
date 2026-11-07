// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { Outline } from "./Outline";

let view: Mounted;
afterEach(() => view?.unmount());

const items = [
  { id: "sec-a", label: "A" },
  { id: "sec-b", label: "B" },
];

it("marks the first section, scrolls to a clicked section and marks it at once", () => {
  const scrollTo = vi.fn();
  view = mount(
    <div style={{ overflowY: "auto" }} ref={(el) => {
        if (el) el.scrollTo = scrollTo;
      }}>
      <div>
        <Outline label="Sections" items={items} />
        <section id="sec-a" />
        <section id="sec-b" ref={(el) => {
            if (el) el.getBoundingClientRect = () => ({ top: 500 }) as DOMRect;
          }} />
      </div>
    </div>,
  );
  const nav = view.container.querySelector("nav")!;
  expect(nav.getAttribute("aria-label")).toBe("Sections");
  const [a, b] = [...nav.querySelectorAll("button")];
  expect(a.getAttribute("aria-current")).toBe("location");
  expect(b.hasAttribute("aria-current")).toBe(false);
  act(() => b.click());
  expect(scrollTo).toHaveBeenCalledTimes(1);
  expect(b.getAttribute("aria-current")).toBe("location");
  expect(a.hasAttribute("aria-current")).toBe(false);
});
