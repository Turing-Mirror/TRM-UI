// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { BarChart, niceTick } from "./BarChart";
import { OUT_MS } from "./overlay";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it.each([[0, 1], [1, 1], [3, 1], [4, 2], [6, 2], [7, 5], [16, 10], [31, 20], [301, 200]])(
  "niceTick(%s) returns %s and covers the maximum with three intervals",
  (max, expected) => {
    expect(niceTick(max)).toBe(expected);
    expect(niceTick(max) * 3).toBeGreaterThanOrEqual(max);
  },
);

it("resizes, formats labels and retains the focused tooltip during exit", () => {
  vi.useFakeTimers();
  let resize: ResizeObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe() {}
    disconnect = disconnect;
  });
  view = mount(<BarChart title="Daily totals" data={[{ label: "2026-11-01", value: 10 }]}
    formatValue={(value) => `${value} units`} formatLabel={(label) => label.slice(5)}
    describe={(item) => `${item.label}: ${item.value} records`} />);
  act(() => resize([{ contentRect: { width: 600 } } as ResizeObserverEntry], {} as ResizeObserver));
  expect(view.container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 600 200");
  expect(view.container.querySelectorAll("line")).toHaveLength(4);
  expect(view.container.textContent).toContain("15 units");
  expect(view.container.textContent).toContain("11-01");
  const bar = view.container.querySelector('[role="img"]')!;
  expect(bar.getAttribute("tabindex")).toBe("0");
  act(() => bar.dispatchEvent(new FocusEvent("focusin", { bubbles: true })));
  expect(view.container.querySelector('[role="tooltip"]')?.textContent).toBe("2026-11-01: 10 records");
  expect(bar.getAttribute("aria-describedby")).toBe(view.container.querySelector('[role="tooltip"]')?.id);
  act(() => bar.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
  expect(view.container.querySelector('[role="tooltip"]')?.classList.contains("tooltip-out")).toBe(true);
  act(() => vi.advanceTimersByTime(OUT_MS));
  expect(view.container.querySelector('[role="tooltip"]')).toBeNull();
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it("switches to a table with full labels and formatted values", () => {
  vi.useFakeTimers();
  view = mount(<BarChart title="Daily totals" data={[{ label: "2026-11-01", value: 10 }]}
    formatValue={(value) => `${value} units`} showTableToggle />);
  const options = view.container.querySelectorAll<HTMLButtonElement>("button");
  act(() => options[1].click());
  act(() => vi.advanceTimersByTime(1000));
  expect(view.container.querySelector("table")?.textContent).toContain("2026-11-01");
  expect(view.container.querySelector("table")?.textContent).toContain("10 units");
  expect(view.container.querySelector<HTMLElement>(".trm-chart-scroll")?.hidden).toBe(true);
  act(() => options[0].click());
  act(() => vi.advanceTimersByTime(1000));
  expect(view.container.querySelector("table")).toBeNull();
});

it("renders empty and dense zero series without negative bar widths", () => {
  view = mount(<BarChart title="Empty" data={[]} />);
  expect(view.container.querySelectorAll("line")).toHaveLength(4);
  act(() => view.root.render(<BarChart title="Dense" data={Array.from({ length: 200 }, (_, index) => ({
    label: String(index), value: 0,
  }))} />));
  const hit = view.container.querySelector("rect")!;
  expect(Number(hit.getAttribute("width"))).toBeGreaterThan(0);
  expect(view.container.querySelector("path")?.getAttribute("d")).not.toMatch(/NaN|Infinity/);
});
