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
  document.documentElement.style.setProperty("--ease-nav", "cubic-bezier(0.16, 1, 0.3, 1)");
});
afterEach(() => {
  view?.unmount(); sheet.remove(); document.documentElement.style.removeProperty("--ease-nav");
  vi.restoreAllMocks(); vi.useRealTimers();
});

const order = ["all", "human", "done"];

it("pushes page changes horizontally in page order and resets scroll, independently of scope order", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  const paged = (page: number, scope = "all") => <QueueList page={page} scope={scope}
    order={order} items={[`${scope}:${page}`]} keyOf={id => id} render={id => <span>{id}</span>} />;
  view = mount(paged(1));
  const root = view.container.querySelector<HTMLElement>(".trm-queue-list")!;
  root.scrollTop = 120;
  act(() => root.dispatchEvent(new Event("scroll")));
  act(() => view.root.render(paged(2)));
  expect(root.scrollTop).toBe(0);
  expect(root.dataset.queuePage).toBe("2");
  expect(animate).toHaveBeenCalledTimes(2);
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(100%, 0, 0)" }, { transform: "none" }]);
  expect(view.container.querySelector(".trm-queue-current .flow-enter")).toBeNull();
  act(() => vi.advanceTimersByTime(FLOW_MS));
  animate.mockClear();
  root.scrollTop = 80;
  act(() => view.root.render(paged(1)));
  expect(root.scrollTop).toBe(0);
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(-100%, 0, 0)" }, { transform: "none" }]);
  act(() => vi.advanceTimersByTime(FLOW_MS));
  act(() => view.root.render(paged(3)));
  act(() => vi.advanceTimersByTime(FLOW_MS));
  animate.mockClear();
  act(() => view.root.render(paged(1, "human")));
  // A filter change takes its direction from tab order even when it resets the page number.
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(100%, 0, 0)" }, { transform: "none" }]);
});

it("serializes rapid page selections and keeps only the latest requested page", () => {
  const paged = (page: number) => <QueueList scope="all" page={page} items={[page]}
    keyOf={String} render={number => <span>{number}</span>} />;
  view = mount(paged(1));
  act(() => view.root.render(paged(2)));
  act(() => view.root.render(paged(3)));
  act(() => view.root.render(paged(1)));
  expect(view.container.querySelectorAll(".trm-queue-stage > div")).toHaveLength(2);
  expect(view.container.querySelector(".trm-queue-list")?.getAttribute("data-queue-page")).toBe("2");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(view.container.querySelector(".trm-queue-list")?.getAttribute("data-queue-page")).toBe("1");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(view.container.querySelectorAll(".trm-queue-stage > div")).toHaveLength(1);
});
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
  expect(getComputedStyle(root).overflowX).toBe("hidden");
  expect(getComputedStyle(root).overflow).toBe("auto");
  expect(view.container.querySelector<HTMLElement>(".trm-queue-out")?.style.top).toBe("-600px");
  expect(animate).toHaveBeenCalledTimes(2);
  for (let i = 0; i < animate.mock.calls.length; i++) {
    expect((animate.mock.contexts[i] as HTMLElement).className).toMatch(/^trm-queue-(current|out)$/);
    const [frames, options] = animate.mock.calls[i];
    expect(JSON.stringify(frames)).not.toContain("scale");
    expect(JSON.stringify(frames)).not.toContain("opacity");
    expect((animate.mock.contexts[i] as HTMLElement).style.opacity).toBe("1");
    expect(options).toMatchObject({ duration: FLOW_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
  }
  const incoming = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-current")!;
  expect(incoming[0]).toEqual([{ transform: "translate3d(100%, 0, 0)" }, { transform: "none" }]);
  const outgoing = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-out")!;
  expect(outgoing[0]).toEqual([{ transform: "none" }, { transform: "translate3d(-100%, 0, 0)" }]);
  const current = view.container.querySelector(".trm-queue-current")!;
  expect(current.querySelectorAll('.flow-enter, .flow-leave')).toHaveLength(0);
  expect(getComputedStyle(current.querySelector(".rise")!).animation).toBe("none");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(root.hasAttribute("data-switching")).toBe(false);
  expect(getComputedStyle(root).overflowX).not.toBe("hidden");
  animate.mockClear();
  act(() => view.root.render(render("all")));
  const reverse = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-current")!;
  expect(reverse[0]).toEqual([{ transform: "translate3d(-100%, 0, 0)" }, { transform: "none" }]);
  const reverseOut = animate.mock.calls.find((_, i) =>
    (animate.mock.contexts[i] as HTMLElement).className === "trm-queue-out")!;
  expect(reverseOut[0]).toEqual([{ transform: "none" }, { transform: "translate3d(100%, 0, 0)" }]);
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(view.container.querySelector(".trm-queue-out")).toBeNull();
});

it("finishes the adjacent pair before sliding to the latest requested scope", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  view = mount(render("all", ["a"]));
  act(() => view.root.render(render("human", ["b"])));
  act(() => vi.advanceTimersByTime(160));
  const current = view.container.querySelector(".trm-queue-current");
  animate.mockClear();
  act(() => view.root.render(render("all", ["a"])));
  act(() => view.root.render(render("done", ["c"])));
  expect(view.container.querySelector(".trm-queue-current")).toBe(current);
  expect(view.container.querySelector(".trm-queue-list")?.getAttribute("data-queue-scope")).toBe("human");
  expect(animate).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(FLOW_MS - 160));
  expect(view.container.querySelector(".trm-queue-list")?.getAttribute("data-queue-scope")).toBe("done");
  expect(view.container.querySelector(".trm-queue-out")).toBe(current);
  expect(view.container.querySelectorAll(".trm-queue-stage > div")).toHaveLength(2);
  expect(animate).toHaveBeenCalledTimes(2);
  for (const [frames] of animate.mock.calls) expect(JSON.stringify(frames)).not.toContain("opacity");
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
  expect((incoming[0] as Keyframe[])[0].transform).toBe("translate3d(-100%, 0, 0)");
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

it("slides a row that changed places within the same scope and leaves opacity alone", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    return Array.from(this.parentElement?.children ?? []).indexOf(this) * 24;
  });
  view = mount(render("all", ["a", "b", "c", "d"]));
  const moved = view.container.querySelector('[data-flow="c"]');
  act(() => view.root.render(render("all", ["c", "a", "b", "d"])));
  expect(view.container.querySelector('[data-flow="c"]')).toBe(moved);
  const calls = animate.mock.calls.map((call, i) => ({
    key: (animate.mock.contexts[i] as HTMLElement).dataset.flow,
    frames: call[0] as Keyframe[],
  }));
  expect(calls.find(c => c.key === "c")?.frames[0].transform).toBe("translate3d(0px, 48px, 0)");
  expect(calls.filter(c => c.key === "a" || c.key === "b").map(c => c.frames[0].transform))
    .toEqual(["translate3d(0px, -24px, 0)", "translate3d(0px, -24px, 0)"]);
  expect(calls.some(c => c.key === "d")).toBe(false);
  expect(calls.every(c => c.frames.every(f => f.opacity === undefined))).toBe(true);
});
