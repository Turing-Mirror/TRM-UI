// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { I18nScope, FLOW_MS, LOCALES } from "../trm";
import { mount, type Mounted } from "../trm/test/dom";
import { WorkbenchPattern } from "./WorkbenchPattern";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); vi.restoreAllMocks(); });

function start() {
  vi.useFakeTimers();
  view = mount(<I18nScope value={{ locale: "en-US", setLocale: () => {}, ready: true }}>
    <WorkbenchPattern />
  </I18nScope>);
}
function click(label: string) {
  const button = Array.from(view.container.querySelectorAll<HTMLButtonElement>("button"))
    .find(node => node.textContent?.trim() === label && !node.closest("[inert]"));
  expect(button, label).toBeDefined();
  act(() => button!.click());
}
function select(id: string) {
  act(() => view.container.querySelector<HTMLButtonElement>(`[data-flow="${id}"] button`)!.click());
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
}

it("loads more in place, collapses reviewed rows, rolls the pending count and filters results", () => {
  start();
  const retained = view.container.querySelector('[data-flow="export"]');
  click("Load more");
  expect(view.container.querySelector('[data-flow="invite"]')?.getAttribute("data-phase")).toBe("enter");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  select("access");
  click("Approve");
  expect(view.container.querySelector('[data-flow="access"]')?.getAttribute("data-phase")).toBe("leave");
  expect(view.container.querySelector(".trm-workbench-heading .roll-in")?.textContent).toBe("2");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(view.container.querySelector('[data-flow="access"]')).toBeNull();
  expect(view.container.querySelector('[data-flow="export"]')).toBe(retained);
  click("All");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(view.container.querySelector('[data-flow="access"]')?.textContent).toContain("Approved");
  select("access");
  expect(view.container.querySelector(".trm-workbench-foot")?.textContent).toBe("Approved");
});

it("keeps edited answers when changing selection and records rejection separately", () => {
  start();
  select("access");
  click("Edit");
  expect(view.container.querySelector(".collapse-area")?.hasAttribute("data-open")).toBe(true);
  const textarea = view.container.querySelector("textarea")!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(textarea, "Revised answer");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
  select("export");
  select("access");
  expect(view.container.querySelector(".trm-workbench-body")?.textContent).toContain("Revised answer");
  click("Reject");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  click("All");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(view.container.querySelector('[data-flow="access"]')?.textContent).toContain("Rejected");
});

it("resolves dynamic demo keys in all eight locales", () => {
  start();
  for (const { id } of LOCALES) {
    act(() => view.root.render(<I18nScope value={{ locale: id, setLocale: () => {}, ready: true }}>
      <WorkbenchPattern />
    </I18nScope>));
    expect(view.container.textContent).not.toContain("demo.workbench.");
    expect(view.container.textContent).not.toContain("{n}");
  }
});
