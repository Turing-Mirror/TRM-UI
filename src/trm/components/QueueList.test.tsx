// @vitest-environment happy-dom
import { act } from "react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { QueueList, FLOW_MS } from "./motion";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
let sheet: HTMLStyleElement;
beforeEach(() => {
  vi.useFakeTimers();
  sheet = document.createElement("style");
  sheet.textContent = readFileSync("src/trm/styles/components.css", "utf8");
  document.head.appendChild(sheet);
});
afterEach(() => { view?.unmount(); sheet.remove(); vi.restoreAllMocks(); vi.useRealTimers(); });

const order = ["all", "human", "done"];
const rowKeys = Array.from({ length: 40 }, (_, i) => String(i));
const render = (scope: string, items = rowKeys, suffix = "", dir?: -1 | 1) => (
  <QueueList scope={scope} order={order} dir={dir} items={items} keyOf={id => id}
    render={id => <div className="rise"><input aria-label={id} defaultValue={id} />{id}{suffix}</div>} />
);

it("pushes one whole layer in tab order, keeps rows still and resets only the new scope's scroll", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  view = mount(render("all"));
  const root = view.container.querySelector<HTMLElement>(".trm-queue-list")!;
  root.scrollTop = 600;
  act(() => root.dispatchEvent(new Event("scroll")));
  act(() => view.root.render(render("human", rowKeys.slice(10))));
  expect(root.scrollTop).toBe(0);
  expect(view.container.querySelector<HTMLElement>(".trm-queue-out")?.style.top).toBe("-600px");
  expect(animate).toHaveBeenCalledTimes(2);
  for (let i = 0; i < animate.mock.calls.length; i++) {
    expect((animate.mock.contexts[i] as HTMLElement).className).toMatch(/^trm-queue-(current|out)$/);
    const [frames, options] = animate.mock.calls[i];
    expect(JSON.stringify(frames)).not.toContain("scale");
    expect(options).toMatchObject({ duration: FLOW_MS });
  }
  const incoming = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-current")!;
  expect((incoming[0] as Keyframe[])[0].transform).toBe("translate3d(6%, 0, 0)");
  const current = view.container.querySelector(".trm-queue-current")!;
  expect(current.querySelectorAll('.flow-enter, .flow-leave')).toHaveLength(0);
  expect(getComputedStyle(current.querySelector(".rise")!).animation).toBe("none");
  animate.mockClear();
  act(() => view.root.render(render("all")));
  const reverse = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-current")!;
  expect((reverse[0] as Keyframe[])[0].transform).toBe("translate3d(-6%, 0, 0)");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(view.container.querySelector(".trm-queue-out")).toBeNull();
});

it("appends only new rows and updates content without animating or remounting existing rows", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  view = mount(render("all", rowKeys.slice(0, 20)));
  const first = view.container.querySelector('[data-flow="0"]');
  const root = view.container.querySelector<HTMLElement>(".trm-queue-list")!;
  root.scrollTop = 300;
  act(() => view.root.render(render("all", rowKeys)));
  expect(view.container.querySelector('[data-flow="0"]')).toBe(first);
  expect(view.container.querySelectorAll(".flow-enter")).toHaveLength(20);
  expect(first?.getAttribute("data-phase")).toBe("stay");
  expect(root.scrollTop).toBe(300);
  expect(animate).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  act(() => view.root.render(render("all", rowKeys, " updated")));
  expect(first?.textContent).toBe("0 updated");
  expect(view.container.querySelectorAll(".flow-enter, .flow-leave")).toHaveLength(0);
  expect(animate).not.toHaveBeenCalled();
});

it("collapses only a removed row and expands only a middle insertion, with no neighbour FLIP", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  // Simulate changed row positions so an accidental reintroduction of FLIP cannot pass on zero layout.
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    const rows = Array.from(this.parentElement?.children ?? [])
      .filter(row => row.getAttribute("data-phase") !== "leave");
    return rows.indexOf(this) * 24;
  });
  view = mount(render("all", ["a", "b", "c"]));
  const kept = view.container.querySelector('[data-flow="c"]');
  act(() => view.root.render(render("all", ["a", "c"])));
  expect(view.container.querySelectorAll(".flow-leave")).toHaveLength(1);
  expect(view.container.querySelector('.flow-leave[inert]')?.getAttribute("data-flow")).toBe("b");
  expect(view.container.querySelectorAll(".flow-enter")).toHaveLength(0);
  expect(view.container.querySelector('[data-flow="c"]')).toBe(kept);
  expect(animate).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  act(() => view.root.render(render("all", ["a", "x", "c"])));
  expect(view.container.querySelectorAll(".flow-enter")).toHaveLength(1);
  expect(view.container.querySelector('.flow-enter')?.getAttribute("data-flow")).toBe("x");
  expect(view.container.querySelector('[data-flow="c"]')).toBe(kept);
});

it("accepts an explicit direction and switches immediately under reduced motion", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  view = mount(render("all"));
  act(() => view.root.render(render("human", [], "", -1)));
  const incoming = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-current")!;
  expect((incoming[0] as Keyframe[])[0].transform).toBe("translate3d(-6%, 0, 0)");
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  Object.defineProperty(media, "matches", { configurable: true, value: true });
  vi.spyOn(window, "matchMedia").mockReturnValue(media);
  animate.mockClear();
  act(() => view.root.render(render("all")));
  expect(view.container.querySelector(".trm-queue-out")).toBeNull();
  expect(view.container.querySelectorAll("[data-flow]")).toHaveLength(40);
  expect(animate).not.toHaveBeenCalled();
});

it("freezes an unfinished removal in the outgoing scope until the whole layer leaves", () => {
  view = mount(render("all", ["a", "b", "c"]));
  const removed = view.container.querySelector('[data-flow="b"]')!;
  act(() => view.root.render(render("all", ["a", "c"])));
  act(() => vi.advanceTimersByTime(300));
  act(() => view.root.render(render("human", ["d"])));
  expect(removed.closest(".trm-queue-out[inert]")).not.toBeNull();
  expect(getComputedStyle(removed).animationPlayState).toBe("paused");
  act(() => vi.advanceTimersByTime(200));
  expect(removed.isConnected).toBe(true);
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(removed.isConnected).toBe(false);
});
