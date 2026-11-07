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

function queue() { return view.container.querySelector(".trm-workbench")!; }
function goPage(page: number) {
  act(() => queue().querySelector<HTMLButtonElement>(`.trm-workbench-pager [data-k="p${page}"]`)!.click());
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
}

it("shows a distinct All queue with reviewed rows and rolls the filter heading and total", () => {
  start();
  const head = queue().querySelector(".trm-workbench-list-head .trm-workbench-heading")!;
  expect(head.textContent).toBe("Pending3");
  expect(queue().querySelectorAll(".trm-queue-current .trm-workbench-item")).toHaveLength(2);
  click("All");
  expect(head.querySelector("h3 .roll-in")?.textContent).toBe("All");
  expect(head.querySelector(":scope > .roll .roll-in")?.textContent).toBe("5");
  const rows = queue().querySelectorAll(".trm-queue-current .trm-workbench-item");
  expect(rows).toHaveLength(2);
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  goPage(2);
  expect(queue().querySelector(".trm-queue-current")?.textContent).toContain("Approved");
  goPage(3);
  expect(queue().querySelector(".trm-queue-current")?.textContent).toContain("Rejected");
  click("Pending");
  expect(head.querySelector("h3 .roll-in")?.textContent).toBe("Pending");
  expect(head.querySelector(":scope > .roll .roll-in")?.textContent).toBe("3");
  expect(queue().querySelectorAll(".trm-queue-current .trm-workbench-item")).toHaveLength(2);
  expect(queue().querySelector('.trm-workbench-pager [aria-current="page"]')?.textContent).toBe("1");
});

it("pages instead of loading endlessly, collapses reviewed rows and rolls the pending count", () => {
  start();
  const pager = queue().querySelector(".trm-workbench-pager nav");
  goPage(2);
  expect(queue().querySelectorAll(".trm-workbench-item")).toHaveLength(1);
  expect(queue().querySelector('[data-flow="invite"]')?.getAttribute("data-phase")).toBe("stay");
  expect(queue().querySelector(".trm-workbench-pager nav")).toBe(pager);
  expect(queue().textContent).not.toContain("Load more");
  goPage(1);
  const retained = view.container.querySelector('[data-flow="export"]');
  select("access");
  click("Approve");
  expect(view.container.querySelector('[data-flow="access"]')?.getAttribute("data-phase")).toBe("leave");
  expect(view.container.querySelector(".trm-workbench-heading .roll-in")?.textContent).toBe("2");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(queue().querySelector('[data-flow="access"]')).toBeNull();
  expect(view.container.querySelector('[data-flow="export"]')).toBe(retained);
  click("All");
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(view.container.querySelector('[data-flow="access"]')?.textContent).toContain("Approved");
  select("access");
  expect(view.container.querySelector(".trm-workbench-foot")?.textContent).toBe("Approved");
});

it("clamps to the remaining page after reviewing the last row and pages the chat queue too", () => {
  start();
  goPage(2);
  select("invite");
  click("Approve");
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(queue().querySelector('.trm-workbench-pager [aria-current="page"]')?.textContent).toBe("1");
  expect(queue().querySelectorAll(".trm-queue-current .trm-workbench-item")).toHaveLength(2);
  const chat = view.container.querySelectorAll(".trm-workbench")[1];
  act(() => chat.querySelector<HTMLButtonElement>('.trm-workbench-pager [data-k="p2"]')!.click());
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(chat.querySelectorAll(".trm-workbench-item")).toHaveLength(1);
  expect(chat.querySelector('[data-flow="invite"]')).not.toBeNull();
});

it("keeps edited answers when changing selection and records rejection separately", () => {
  start();
  select("access");
  click("Edit");
  expect(view.container.querySelector(".trm-workbench-body .collapse-area[data-open]")).not.toBeNull();
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

it("appends replies locally, keeps drafts per conversation and toggles the notice", () => {
  start();
  const chat = view.container.querySelectorAll<HTMLElement>(".trm-workbench")[1];
  const choose = (i: number) => {
    act(() => chat.querySelectorAll<HTMLButtonElement>(".trm-workbench-item")[i].click());
    act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  };
  const type = (value: string) => act(() => {
    const area = chat.querySelector("textarea")!;
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(area, value);
    area.dispatchEvent(new Event("input", { bubbles: true }));
  });
  choose(0);
  const composer = chat.querySelector("textarea");
  const action = chat.querySelector(".trm-workbench-actions button");
  expect(chat.querySelector(".trm-chat-state")?.textContent).toBe("Human handling");
  expect(chat.querySelector('.trm-alert-mark[aria-label="Human handling required"]')).not.toBeNull();
  type("A saved draft");
  choose(1);
  expect(chat.querySelector("textarea")).toBe(composer);
  expect(chat.querySelector(".trm-workbench-actions button")).toBe(action);
  expect(chat.querySelector(".trm-chat-state")?.textContent).toBe("Assistant handling");
  expect(chat.querySelector("textarea")!.value).toBe("");
  choose(0);
  expect(chat.querySelector("textarea")!.value).toBe("A saved draft");
  click("Hide notice");
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(chat.querySelector(".trm-workbench-notice")?.textContent).toBe("");
  click("Show notice");
  expect(chat.querySelector(".trm-workbench-notice[data-open]")?.textContent).toContain("Confirm");
  act(() => chat.querySelector("textarea")!
    .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(chat.querySelector('.trm-chat-composer-send[aria-busy="true"]')).not.toBeNull();
  act(() => vi.advanceTimersByTime(650));
  expect(chat.querySelector('[role="log"]')?.textContent).toBe("A saved draft");
  expect(chat.querySelector("textarea")!.value).toBe("");
  expect(chat.querySelector(".trm-workbench-field .roll-in")?.textContent).toBe("Replied");
  expect(chat.querySelector('.trm-workbench-detail > .trm-workbench-foot[data-mode="pinned"]')).not.toBeNull();
});

it("resolves dynamic demo keys in all eight locales", () => {
  start();
  click("All");
  act(() => view.container.querySelectorAll(".trm-workbench")[1]
    .querySelector<HTMLButtonElement>(".trm-workbench-item")!.click());
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  for (const { id } of LOCALES) {
    act(() => view.root.render(<I18nScope value={{ locale: id, setLocale: () => {}, ready: true }}>
      <WorkbenchPattern />
    </I18nScope>));
    expect(view.container.textContent).not.toContain("demo.workbench.");
    expect(view.container.textContent).not.toContain("{n}");
    expect(view.container.querySelector("textarea")!.placeholder).not.toContain("demo.workbench.");
  }
});
