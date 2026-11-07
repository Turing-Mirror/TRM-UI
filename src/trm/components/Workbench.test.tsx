// @vitest-environment happy-dom
import { act, useState } from "react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Workbench, WorkbenchDetail, WorkbenchItem } from "./Workbench";
import { Empty, Filters, Tabs, Pager } from "./display";
import { SearchBox } from "./listing";
import { FlowList, FLOW_MS } from "./motion";
import { mount, type Mounted } from "../test/dom";
const styles = readFileSync("src/trm/styles/components.css", "utf8");

let view: Mounted;
let narrow = false;
let reduced = false;
let media: MediaQueryList;
let sheet: HTMLStyleElement;
beforeEach(() => {
  vi.useFakeTimers();
  narrow = false;
  reduced = false;
  media = window.matchMedia("(max-width: 900px)");
  Object.defineProperty(media, "matches", { configurable: true, get: () => narrow });
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  Object.defineProperty(preference, "matches", { configurable: true, get: () => reduced });
  vi.spyOn(window, "matchMedia").mockImplementation(query => query.includes("max-width") ? media : preference);
  sheet = document.createElement("style");
  sheet.textContent = styles;
  document.head.appendChild(sheet);
});
afterEach(() => { view?.unmount(); sheet.remove(); vi.restoreAllMocks(); vi.useRealTimers(); });

const order = ["z", "a", ""];

it.each(["count", "refresh", "search"])("aligns title, filters and row content for the %s head", variant => {
  const options = [{ id: "all", label: "All" }, { id: "pending", label: "Pending" }];
  view = mount(<div style={{ "--workbench-list-content-inset": "16px", "--workbench-row-inset": "8px",
    "--workbench-row-padding": "8px" } as React.CSSProperties}>
    <Workbench selected={null} order={[]} onBack={() => {}} detail={null}
      listHead={<>
        <div className="trm-workbench-heading"><h3>Queue</h3>
          {variant === "count" ? <span>12</span> : variant === "refresh" ? <button>Refresh</button> : null}
        </div>
        {variant === "search" ? <div className="trm-workbench-search"><SearchBox value="" onChange={() => {}} /></div> : null}
        <div className="trm-workbench-filters"><Filters value="all" options={options} onChange={() => {}} /></div>
        <div className="trm-workbench-filters"><Tabs value="all" options={options} onChange={() => {}} /></div>
      </>}
      list={<WorkbenchItem title="One" selected={false} onClick={() => {}} />}
      pager={<Pager page={1} pages={3} onChange={() => {}} />} />
  </div>);
  const head = view.container.querySelector(".trm-workbench-list-head")!;
  const inset = parseFloat(getComputedStyle(head).paddingInline);
  expect(inset).toBe(16);
  expect(parseFloat(getComputedStyle(head.querySelector(".trm-workbench-heading")!).paddingLeft)).toBe(0);
  const row = getComputedStyle(view.container.querySelector(".trm-workbench-item")!);
  expect(parseFloat(row.marginInline) + parseFloat(row.paddingLeft)).toBe(inset);
  for (const group of head.querySelectorAll(".trm-workbench-filters")) {
    expect(parseFloat(getComputedStyle(group).paddingLeft) || 0).toBe(0);
    expect(parseFloat(getComputedStyle(group.querySelector("button")!).paddingInline)).toBe(0);
    const indicator = group.querySelector<HTMLElement>(".slider")!;
    expect(indicator.parentElement).toBe(group.firstElementChild);
    expect(indicator.style.transform).toContain("0px");
  }
  if (variant === "search") expect(getComputedStyle(head.querySelector(".trm-workbench-search")!).paddingInline).toBe("");
  const foot = view.container.querySelector(".trm-workbench-pager")!;
  expect(foot.parentElement?.className).toBe("trm-workbench-list");
  expect(foot.closest(".trm-workbench-rows")).toBeNull();
  expect(getComputedStyle(foot).flex).toBe("0 0 auto");
});

it("pushes a review body in order without scroll-to-end, while retaining actions and inline foot", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  const review = (selected: string) => <Workbench selected={selected} order={order}
    onBack={() => {}} list={null} detail={<WorkbenchDetail title={selected} sub={selected}
      actions={<button>Edit</button>} notice="Notice" foot={<button>Approve</button>}>
      <p key={selected}>{selected}</p>
    </WorkbenchDetail>} />;
  view = mount(review("z"));
  const action = view.container.querySelector(".trm-workbench-actions button");
  const footer = view.container.querySelector(".trm-workbench-foot");
  const outgoing = view.container.querySelector<HTMLElement>(".trm-workbench-body")!;
  outgoing.scrollTop = 120;
  animate.mockClear();
  act(() => view.root.render(review("a")));
  expect(animate).toHaveBeenCalledTimes(2);
  expect(animate.mock.calls[0][0]).toEqual([{ transform: "none" }, { transform: "translate3d(0, -100%, 0)" }]);
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(0, 100%, 0)" }, { transform: "none" }]);
  expect(outgoing.scrollTop).toBe(120);
  const current = view.container.querySelector<HTMLElement>(".trm-workbench-body-current .trm-workbench-body")!;
  expect(current.scrollTop).toBe(0);
  expect(current.hasAttribute("data-follow-end")).toBe(false);
  expect(view.container.querySelector(".trm-workbench-body-stage .flow-enter, .trm-workbench-body-stage .flow-leave, .trm-workbench-body-stage .rise")).toBeNull();
  expect(view.container.querySelector(".trm-workbench-actions button")).toBe(action);
  expect(view.container.querySelector(".trm-workbench-foot")).toBe(footer);
  expect(footer?.closest(".trm-workbench-body-stage")).toBeNull();
  expect(view.container.querySelector("h3 .roll-in")?.textContent).toBe("a");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  animate.mockClear();
  act(() => view.root.render(review("z")));
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(0, -100%, 0)" }, { transform: "none" }]);
});

const chat = (selected: string, messages = ["first", "second"]) => <Workbench selected={selected}
  order={order} onBack={() => {}} list={null} detail={<WorkbenchDetail title={selected}
    sub={selected} notice="Fixed notice" actions={<button>Action</button>} footMode="pinned"
    foot={<textarea aria-label="Draft" />} scrollToEnd={`${selected}:${messages.length}`}>
    {messages.map(message => <p key={`${selected}:${message}`}>{message}</p>)}
  </WorkbenchDetail>} />;

it("pushes exactly one adjacent opaque body pair in list order, with stationary controls and pre-scrolled content", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(900);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
  document.documentElement.style.setProperty("--ease-nav", "cubic-bezier(0.16, 1, 0.3, 1)");
  view = mount(chat("z"));
  const action = view.container.querySelector("button");
  const composer = view.container.querySelector("textarea");
  const notice = view.container.querySelector(".trm-workbench-notice");
  const outgoing = view.container.querySelector<HTMLElement>(".trm-workbench-body")!;
  outgoing.scrollTop = 200;
  animate.mockClear();
  act(() => view.root.render(chat("a")));
  expect(animate).toHaveBeenCalledTimes(2);
  expect(view.container.querySelectorAll(".trm-workbench-body-layer")).toHaveLength(2);
  expect(view.container.querySelector('.trm-workbench-body-stage[data-direction="1"]')).not.toBeNull();
  expect(view.container.querySelector(".trm-workbench-body-out .trm-workbench-body")).toBe(outgoing);
  expect(outgoing.scrollTop).toBe(200);
  expect(view.container.querySelector<HTMLElement>(".trm-workbench-body-current .trm-workbench-body")!.scrollTop).toBe(600);
  expect(view.container.querySelector(".trm-workbench-body-stage [data-phase=enter], .trm-workbench-body-stage [data-phase=leave]")).toBeNull();
  expect(view.container.querySelector(".trm-workbench-body-stage .rise")).toBeNull();
  for (const [i, call] of animate.mock.calls.entries()) {
    expect((animate.mock.contexts[i] as HTMLElement).className).toContain("trm-workbench-body-layer");
    expect((animate.mock.contexts[i] as HTMLElement).style.opacity).toBe("1");
    expect(call[1]).toMatchObject({ duration: FLOW_MS, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    expect(JSON.stringify(call[0])).not.toMatch(/opacity|scale/);
  }
  expect(animate.mock.calls[0][0]).toEqual([{ transform: "none" }, { transform: "translate3d(0, -100%, 0)" }]);
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(0, 100%, 0)" }, { transform: "none" }]);
  expect(getComputedStyle(view.container.querySelector(".trm-workbench-body-stage")!).overflow).toBe("clip");
  expect(view.container.querySelector("button")).toBe(action);
  expect(view.container.querySelector("textarea")).toBe(composer);
  expect(view.container.querySelector(".trm-workbench-notice")).toBe(notice);
  act(() => vi.advanceTimersByTime(FLOW_MS));
  animate.mockClear();
  act(() => view.root.render(chat("z")));
  expect(animate).toHaveBeenCalledTimes(2);
  expect(animate.mock.calls[0][0]).toEqual([{ transform: "none" }, { transform: "translate3d(0, 100%, 0)" }]);
  expect(animate.mock.calls[1][0]).toEqual([{ transform: "translate3d(0, -100%, 0)" }, { transform: "none" }]);
  document.documentElement.style.removeProperty("--ease-nav");
});

it("expands appended messages in the same body without starting another item push", () => {
  const animate = vi.spyOn(HTMLElement.prototype, "animate");
  view = mount(chat("z"));
  const first = view.container.querySelector(".trm-workbench-body-current p");
  const layer = view.container.querySelector(".trm-workbench-body-current");
  animate.mockClear();
  act(() => view.root.render(chat("z", ["first", "second", "reply"])));
  expect(view.container.querySelector(".trm-workbench-body-current")).toBe(layer);
  expect(view.container.querySelector(".trm-workbench-body-current p")).toBe(first);
  expect(view.container.querySelector('[data-phase="enter"] p')?.textContent).toBe("reply");
  expect(view.container.querySelector(".trm-workbench-body-out")).toBeNull();
  expect(animate.mock.contexts.some(node => (node as HTMLElement).className.includes("trm-workbench-body-layer"))).toBe(false);
});

it("serializes rapid item changes without a third body and skips motion when reduced", () => {
  view = mount(chat("z"));
  act(() => view.root.render(chat("a")));
  act(() => view.root.render(chat("")));
  expect(view.container.querySelectorAll(".trm-workbench-body-layer")).toHaveLength(2);
  expect(view.container.querySelector(".trm-workbench-body-stage")?.getAttribute("data-scope")).toBe("a");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(view.container.querySelector(".trm-workbench-body-stage")?.getAttribute("data-scope")).toBe("");
  expect(view.container.querySelectorAll(".trm-workbench-body-layer")).toHaveLength(2);
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(view.container.querySelectorAll(".trm-workbench-body-layer")).toHaveLength(1);
  reduced = true;
  act(() => view.root.render(chat("z")));
  expect(view.container.querySelectorAll(".trm-workbench-body-layer")).toHaveLength(1);
  expect(view.container.querySelector(".trm-workbench-body-stage")?.getAttribute("data-scope")).toBe("z");
});

it.each([false, true])("insets every row background and rounds its corners (selected=%s)", selected => {
  view = mount(<div style={{ "--workbench-row-inset": "8px", "--workbench-row-padding": "8px", "--workbench-list-content-inset": "16px", "--rs": "8px" } as React.CSSProperties}>
    <div className="trm-workbench-list-head">
      <div className="trm-workbench-heading">Queue</div>
    </div>
    <WorkbenchItem title="Conversation" selected={selected} onClick={() => {}} />
  </div>);
  const row = view.container.querySelector("button")!;
  const css = getComputedStyle(row);
  expect(css.marginInline).toBe("8px");
  expect(css.borderRadius).toBe("8px");
  expect(css.width).toBe("calc(100% - 2 * 8px)");
  const head = getComputedStyle(view.container.querySelector(".trm-workbench-list-head")!);
  const heading = getComputedStyle(view.container.querySelector(".trm-workbench-heading")!);
  for (const side of ["paddingLeft", "paddingRight"] as const) {
    const rowEdge = parseFloat(css.marginInline) + parseFloat(css[side]);
    const headEdge = parseFloat(head.paddingInline) + parseFloat(heading[side]);
    expect(rowEdge).toBe(16);
    expect(rowEdge).toBe(headEdge);
  }
});
function render(selected: string | null) {
  return <Workbench selected={selected} order={order} onBack={() => {}} list={<input defaultValue="Filter" />}
    empty={<Empty icon="chat" title="Choose an item" />} listWidth="22rem"
    detail={<WorkbenchDetail title={`Title ${selected}`} sub="Subtitle" actions={<button>Edit</button>}
      footMode="pinned" foot={<button>Approve</button>}><p>{`Body ${selected}`}</p></WorkbenchDetail>} />;
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

it.each([false, true])("never overlaps empty and detail, including rapid changes (reduced=%s)", preference => {
  reduced = preference;
  view = mount(render(null));
  for (const selected of ["", null, "z", "a", null]) {
    act(() => view.root.render(render(selected)));
    const empty = view.container.querySelector(".trm-workbench-empty");
    const detail = view.container.querySelector(".trm-workbench-detail");
    expect(Boolean(empty)).toBe(selected === null);
    expect(Boolean(detail)).toBe(selected !== null);
    if (selected === null) expect(view.container.querySelector(".swap-out")).toBeNull();
  }
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.querySelector(".trm-workbench-detail")).toBeNull();
  expect(view.container.querySelector(".trm-workbench-empty")?.textContent).toBe("Choose an item");
});

it("retains actions, foot and detail across item switches and immediate reversal, rolling only title text", () => {
  view = mount(render("z"));
  const detail = view.container.querySelector(".trm-workbench-detail");
  const action = view.container.querySelector(".trm-workbench-actions button");
  const foot = view.container.querySelector(".trm-workbench-foot button");
  act(() => view.root.render(render("a")));
  expect(view.container.querySelector("h3 .roll-in")?.textContent).toBe("Title a");
  act(() => view.root.render(render("z")));
  expect(view.container.querySelector("h3 .roll-in")?.textContent).toBe("Title z");
  expect(view.container.querySelector(".trm-workbench-detail")).toBe(detail);
  expect(view.container.querySelector(".trm-workbench-actions button")).toBe(action);
  expect(view.container.querySelector(".trm-workbench-foot button")).toBe(foot);
  expect(action?.closest(".rise")).toBeNull();
  expect(foot?.closest(".rise")).toBeNull();
  expect(view.container.querySelector(".swap-out")).toBeNull();
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.querySelectorAll(".trm-workbench-detail")).toHaveLength(1);
  expect(view.container.textContent).toContain("Body z");
});

it("renders separate sub fields and body parts with ordered delays, retaining them for value changes", () => {
  const detail = (status: string) => <WorkbenchDetail title="Question" sub={["Website", status]}
    actions={<button>Edit</button>} notice="Check the question"><p>Answer</p><p>Sources</p></WorkbenchDetail>;
  const queue = (status: string) => <Workbench selected="z" order={order} onBack={() => {}}
    listHead={<h3>Queue</h3>} list={null} detail={detail(status)} />;
  view = mount(queue("Pending"));
  const fields = view.container.querySelectorAll<HTMLElement>(".trm-workbench-field");
  expect(Array.from(fields, node => node.textContent)).toEqual(["Website", "Pending"]);
  const parts = view.container.querySelectorAll<HTMLElement>(".trm-workbench-part");
  expect(Array.from(parts, node => node.style.animationDelay)).toEqual([
    "0ms", "38ms", "76ms",
  ]);
  expect(view.container.querySelector(".trm-workbench-list .trm-workbench-list-head")?.textContent).toBe("Queue");
  act(() => view.root.render(queue("Approved")));
  expect(view.container.querySelectorAll(".trm-workbench-field")[1]).toBe(fields[1]);
  expect(fields[1].querySelector(".roll-in")?.textContent).toBe("Approved");
  expect(view.container.querySelector(".swap-out")).toBeNull();
});

it("collapses a notice without remounting the title or replaying its entrance", () => {
  const detail = (notice?: string) => <WorkbenchDetail title="Question" notice={notice}><p>Body</p></WorkbenchDetail>;
  view = mount(detail());
  const title = view.container.querySelector("h3");
  const part = view.container.querySelector(".trm-workbench-notice")?.parentElement;
  act(() => view.root.render(detail("Check the question")));
  expect(view.container.querySelector(".trm-workbench-notice[data-open]")?.textContent).toBe("Check the question");
  expect(view.container.querySelector(".trm-workbench-notice")?.parentElement).toBe(part);
  act(() => view.root.render(detail()));
  expect(view.container.querySelector(".trm-workbench-notice[inert]")).not.toBeNull();
  act(() => vi.advanceTimersByTime(FLOW_MS + 1));
  expect(view.container.textContent).not.toContain("Check the question");
  expect(view.container.querySelector("h3")).toBe(title);
});

it.each([false, true])("uses keyed body blocks and preserves shared blocks (reduced=%s)", preference => {
  reduced = preference;
  const detail = (item: string) => <WorkbenchDetail title={<strong>{item}</strong>} titleText={item}
    notice={item === "z" ? "Notice" : undefined}>
    <input key="shared" defaultValue="Retained draft" /><p key={item}>{item}</p>
  </WorkbenchDetail>;
  view = mount(detail("z"));
  const input = view.container.querySelector("input");
  const old = view.container.querySelector("p");
  act(() => view.root.render(detail("a")));
  expect(view.container.querySelector("input")).toBe(input);
  expect(view.container.querySelector("input")?.closest("[data-phase]")?.getAttribute("data-phase")).toBe("stay");
  if (preference) {
    expect(old?.isConnected).toBe(false);
    expect(view.container.querySelector(".roll-out")).toBeNull();
    expect(view.container.querySelector(".trm-workbench-notice")?.textContent).toBe("");
  } else {
    expect(old?.closest('[data-phase="leave"][inert]')).not.toBeNull();
    expect(view.container.querySelector('[data-phase="enter"] p')?.textContent).toBe("a");
    expect(view.container.querySelector("h3 .roll-in strong")?.textContent).toBe("a");
    const part = view.container.querySelector('[data-phase="enter"] .rise')!;
    expect(getComputedStyle(part).animation).toBe("none");
  }
  act(() => view.root.render(detail("z")));
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(view.container.querySelectorAll("p")).toHaveLength(1);
  expect(view.container.querySelector("p")?.textContent).toBe("z");
  expect(view.container.querySelector("input")).toBe(input);
});

it.each([false, true])("follows the changing scroll end without a post-switch jump (reduced=%s)", preference => {
  reduced = preference;
  let height = 900;
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => height);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(300);
  const detail = (item: string) => <WorkbenchDetail title={item} scrollToEnd={item}>
    <p key={item}>{item}</p>
  </WorkbenchDetail>;
  view = mount(detail("z"));
  const body = view.container.querySelector<HTMLElement>(".trm-workbench-body")!;
  expect(body.scrollTop).toBe(600);
  body.scrollTop = 0;
  height = 1200;
  act(() => view.root.render(detail("a")));
  expect(body.scrollTop).toBe(preference ? 900 : 0);
  act(() => vi.advanceTimersByTime(FLOW_MS / 2));
  if (!preference) {
    expect(body.scrollTop).toBeGreaterThan(0);
    expect(body.scrollTop).toBeLessThan(900);
  }
  height = 1500;
  act(() => vi.advanceTimersByTime(FLOW_MS));
  // Reduced motion has no animation frames; its content has already settled synchronously.
  expect(body.scrollTop).toBe(preference ? 900 : 1200);
  act(() => view.root.render(detail("z")));
  act(() => body.dispatchEvent(new WheelEvent("wheel")));
  body.scrollTop = 100;
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(body.scrollTop).toBe(100);
});

it("places form actions after the content by default and pins only the requested foot", () => {
  const detail = (footMode?: "inline" | "pinned") => <WorkbenchDetail title="Question" footMode={footMode}
    foot={<button>Approve</button>}><p>Fields</p></WorkbenchDetail>;
  view = mount(detail());
  const foot = view.container.querySelector(".trm-workbench-foot")!;
  expect(foot.closest(".trm-workbench-body")).not.toBeNull();
  expect(foot.previousElementSibling?.textContent).toBe("Fields");
  act(() => view.root.render(detail("pinned")));
  expect(view.container.querySelector(".trm-workbench-detail > .trm-workbench-foot")).not.toBeNull();
});

it("insets only between rendered rows, including FlowList removal and hover/selection neighbours", () => {
  const queue = (items: string[], selected: string | null = null) => <Workbench selected={selected}
    order={order} onBack={() => {}} detail={null} list={<FlowList items={items} keyOf={id => id}
      render={id => <WorkbenchItem title={id} avatar={<span>Avatar</span>}
        selected={selected === id} onClick={() => {}} />} />} />;
  view = mount(queue(["z", "a", ""]));
  const rows = () => view.container.querySelectorAll<HTMLButtonElement>(".trm-workbench-item");
  expect(Array.from(rows(), row => row.hasAttribute("data-divider"))).toEqual([true, true, false]);
  act(() => rows()[1].dispatchEvent(new PointerEvent("pointerover", { bubbles: true })));
  expect(rows()[0].hasAttribute("data-next-hovered")).toBe(true);
  act(() => rows()[1].dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body })));
  expect(rows()[0].hasAttribute("data-next-hovered")).toBe(false);
  act(() => view.root.render(queue(["z", "a", ""], "a")));
  expect(rows()[0].hasAttribute("data-next-selected")).toBe(true);
  act(() => view.root.render(queue(["z", "a"], "a")));
  expect(rows()[1].hasAttribute("data-divider")).toBe(false);
  act(() => vi.advanceTimersByTime(FLOW_MS + 40));
  expect(rows()).toHaveLength(2);
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
