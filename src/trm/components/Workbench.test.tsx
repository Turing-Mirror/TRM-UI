// @vitest-environment happy-dom
import { act, useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Workbench, WorkbenchDetail, WorkbenchItem } from "./Workbench";
import { Empty } from "./display";
import { FlowList, FLOW_MS } from "./motion";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
let narrow = false;
let reduced = false;
let media: MediaQueryList;
beforeEach(() => {
  vi.useFakeTimers();
  narrow = false;
  reduced = false;
  media = window.matchMedia("(max-width: 900px)");
  Object.defineProperty(media, "matches", { configurable: true, get: () => narrow });
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  Object.defineProperty(preference, "matches", { configurable: true, get: () => reduced });
  vi.spyOn(window, "matchMedia").mockImplementation(query => query.includes("max-width") ? media : preference);
});
afterEach(() => { view?.unmount(); vi.restoreAllMocks(); vi.useRealTimers(); });

const order = ["z", "a", ""];
function render(selected: string | null) {
  return <Workbench selected={selected} order={order} onBack={() => {}} list={<input defaultValue="Filter" />}
    empty={<Empty icon="chat" title="Choose an item" />} listWidth="22rem"
    detail={<WorkbenchDetail title={`Title ${selected}`} sub="Subtitle" actions={<button>Edit</button>}
      foot={<button>Approve</button>}><p>{`Body ${selected}`}</p></WorkbenchDetail>} />;
}

it("renders the selected detail with header actions, a reading body and a separate foot", () => {
  view = mount(render("z"));
  const section = view.container.querySelector(".trm-workbench-detail")!;
  expect(document.getElementById(section.getAttribute("aria-labelledby")!)?.textContent).toBe("Title z");
  expect(section.querySelector(".trm-workbench-actions button")?.textContent).toBe("Edit");
  expect(section.querySelector(".trm-workbench-body .trm-workbench-read")?.textContent).toBe("Body z");
  expect(section.querySelector(".trm-workbench-foot button")?.textContent).toBe("Approve");
  expect(section.querySelector(".trm-workbench-body .trm-workbench-foot")).toBeNull();
  expect(view.container.querySelector(".trm-workbench-back")).toBeNull();
  expect((view.container.firstElementChild as HTMLElement).style
    .getPropertyValue("--workbench-list-width")).toBe("22rem");
});

it("renders the supplied empty icon and text only for null, including after clearing selection", () => {
  view = mount(render(null));
  expect(view.container.querySelector(".trm-workbench-empty svg")).not.toBeNull();
  expect(view.container.textContent).toContain("Choose an item");
  expect(view.container.querySelector(".trm-workbench-detail")).toBeNull();
  act(() => view.root.render(render("")));
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.querySelector(".trm-workbench-detail")).not.toBeNull();
  expect(view.container.querySelector(".trm-workbench-empty")).toBeNull();
  act(() => view.root.render(render(null)));
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.querySelector(".trm-workbench-detail")).toBeNull();
  expect(view.container.textContent).toContain("Choose an item");
});

it("pushes details in list order, including immediate reversal, and makes the departing detail inert", () => {
  view = mount(render("z"));
  act(() => view.root.render(render("a")));
  const stage = () => view.container.querySelector<HTMLElement>(".trm-workbench-swap [style*='--push']")!;
  expect(stage().style.getPropertyValue("--push")).toBe("1");
  expect(view.container.querySelector(".trm-workbench-swap [inert]")?.textContent).toContain("Body z");
  act(() => view.root.render(render("z")));
  expect(stage().style.getPropertyValue("--push")).toBe("-1");
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.querySelectorAll(".trm-workbench-detail")).toHaveLength(1);
  expect(view.container.textContent).toContain("Body z");
});

it("uses native button semantics for selected state, click, Enter and Space", () => {
  const click = vi.fn();
  const item = (selected: boolean) => <WorkbenchItem title="Question" preview="Answer" meta="12:30"
    tag={<span>Pending</span>} avatar={<span>Q</span>} selected={selected} onClick={click} />;
  view = mount(item(true));
  const button = view.container.querySelector("button")!;
  expect(button.type).toBe("button");
  expect(button.tabIndex).toBe(0);
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.querySelectorAll(".trm-workbench-item-line")).toHaveLength(2);
  expect(button.querySelector(".trm-workbench-preview")?.textContent).toBe("Answer");
  act(() => button.focus());
  expect(document.activeElement).toBe(button);
  // happy-dom does not generate native keyboard clicks. Both keys must reach the browser unprevented.
  for (const key of ["Enter", " "]) {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    act(() => button.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(false);
  }
  act(() => button.click());
  expect(click).toHaveBeenCalledTimes(1);
  act(() => view.root.render(item(false)));
  expect(button.getAttribute("aria-pressed")).toBe("false");
});

it("opens and returns through narrow panes, calling onBack and retaining list DOM, scroll and focus", () => {
  narrow = true;
  const back = vi.fn();
  function Queue() {
    const [selected, select] = useState<string | null>(null);
    return <Workbench selected={selected} order={order} onBack={() => { back(); select(null); }}
      list={<><input defaultValue="Filter" /><WorkbenchItem title="Question" selected={selected === "z"}
        onClick={() => select("z")} /></>} detail={<WorkbenchDetail title="Question">Answer</WorkbenchDetail>} />;
  }
  view = mount(<Queue />);
  const row = view.container.querySelector<HTMLButtonElement>(".trm-workbench-item")!;
  const input = view.container.querySelector("input")!;
  const list = view.container.querySelector<HTMLElement>(".trm-workbench-list")!;
  input.value = "Draft filter";
  list.scrollTop = 140;
  act(() => { row.focus(); row.click(); });
  const backButton = view.container.querySelector<HTMLButtonElement>(".trm-workbench-back")!;
  expect(document.activeElement).toBe(backButton);
  const listPane = view.container.querySelector<HTMLElement>('[data-trm-pane="list"]')!;
  expect(listPane.hasAttribute("inert")).toBe(true);
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(listPane.hidden).toBe(true);
  act(() => backButton.click());
  expect(back).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(row);
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(listPane.hidden).toBe(false);
  expect(view.container.querySelector("input")).toBe(input);
  expect(input.value).toBe("Draft filter");
  expect(list.scrollTop).toBe(140);
  expect(view.container.querySelector<HTMLElement>('[data-trm-pane="detail"]')!.hidden).toBe(true);
});

it("responds to breakpoint changes and unsubscribes on unmount", () => {
  const remove = vi.spyOn(media, "removeEventListener");
  view = mount(render("z"));
  expect(view.container.querySelector(".trm-workbench-panes")).toBeNull();
  act(() => { narrow = true; media.dispatchEvent(new Event("change")); });
  expect(view.container.querySelector(".trm-workbench-panes")).not.toBeNull();
  expect(view.container.querySelector(".trm-workbench-detail")?.textContent).toContain("Body z");
  act(() => { narrow = false; media.dispatchEvent(new Event("change")); });
  expect(view.container.querySelector(".trm-workbench-panes")).toBeNull();
  view.unmount();
  expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
});

it("returns focus to a remaining row when the reviewed row is still collapsing", () => {
  narrow = true;
  function Queue() {
    const [items, setItems] = useState(["z", "a"]);
    const [selected, select] = useState<string | null>(null);
    return <Workbench selected={selected} order={order} onBack={() => select(null)}
      list={<FlowList items={items} keyOf={id => id} render={id => (
        <WorkbenchItem title={id} selected={selected === id} onClick={() => select(id)} />
      )} />} detail={<button className="approve" onClick={() => {
        setItems(items.filter(id => id !== selected));
        select(null);
      }}>Approve</button>} />;
  }
  view = mount(<Queue />);
  const row = view.container.querySelector<HTMLButtonElement>('[data-flow="z"] button')!;
  act(() => { row.focus(); row.click(); });
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  act(() => view.container.querySelector<HTMLButtonElement>(".approve")!.click());
  expect(row.closest("[inert]")).not.toBeNull();
  expect(document.activeElement).toBe(view.container.querySelector('[data-flow="a"] button'));
});

it("honors reduced motion without launching JavaScript push animations", () => {
  reduced = true;
  narrow = true;
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  view = mount(render(null));
  act(() => view.root.render(render("z")));
  act(() => view.root.render(render("a")));
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(animate).not.toHaveBeenCalled();
  expect(view.container.querySelector(".trm-workbench-detail")?.textContent).toContain("Body a");
});
