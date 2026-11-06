// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Row, RowGroup, CenterPanel } from "./rows";
import { PagePad } from "./ui";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => { view?.unmount(); });

describe("Row", () => {
  it("places and labels a control after the title and description", () => {
    view = mount(<Row title="Name" desc="Display name" control={<input />} />);
    const input = view.container.querySelector("input")!;
    expect(input.closest(".trm-row-control")).not.toBeNull();
    expect(view.container.querySelector(".trm-row-main")!.firstElementChild!.className).toBe("trm-row-text");
    expect(document.getElementById(input.getAttribute("aria-labelledby")!)!.textContent).toBe("Name");
    expect(document.getElementById(input.getAttribute("aria-describedby")!)!.textContent).toBe("Display name");
  });
  it("stacks long controls and keeps supplemental content outside the action", () => {
    view = mount(<Row title="Notes" stacked control={<textarea aria-label="Custom name" />}><p>Help</p></Row>);
    expect(view.container.querySelector(".trm-row-stacked .trm-row-control textarea")).not.toBeNull();
    expect(view.container.querySelector("textarea")!.getAttribute("aria-label")).toBe("Custom name");
    expect(view.container.querySelector(".trm-row-body")!.textContent).toBe("Help");
  });
  it("uses a focusable native button for keyboard activation without nested help buttons", () => {
    const click = vi.fn();
    view = mount(<Row title="Rules" tip="Open rules" onClick={click}><input aria-label="Extra" /></Row>);
    const button = view.container.querySelector("button")!;
    expect(button.type).toBe("button");
    expect(button.tabIndex).toBe(0);
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button.querySelector("button,input")).toBeNull();
    act(() => button.focus());
    expect(document.activeElement).toBe(button);
    // happy-dom does not synthesize native Enter/Space clicks. Ensure we leave
    // both keys to the browser, then exercise the native activation callback.
    for (const key of ["Enter", " "]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      act(() => button.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
    }
    act(() => button.click());
    expect(click).toHaveBeenCalledTimes(1);
  });
  it("does not turn a control row into a nested button", () => {
    const click = vi.fn();
    view = mount(<Row title="Name" onClick={click} control={<input />} />);
    expect(view.container.querySelector("button")).toBeNull();
    act(() => view.container.querySelector("input")!.click());
    expect(click).not.toHaveBeenCalled();
  });
  it("groups direct rows and exposes section labels", () => {
    view = mount(<RowGroup title="Settings" note="Preferences" action={<button>Reset</button>}><Row title="One" /><Row title="Two" /></RowGroup>);
    expect(view.container.querySelectorAll(".trm-row-card > .trm-row")).toHaveLength(2);
    const section = view.container.querySelector("section")!;
    expect(document.getElementById(section.getAttribute("aria-labelledby")!)!.textContent).toBe("Settings");
  });
});

describe("PagePad", () => {
  it("defaults to full width", () => {
    view = mount(<PagePad>Content</PagePad>);
    expect(view.container.firstElementChild!.classList.contains("trm-page-full")).toBe(true);
  });
  for (const width of ["full", "wide", "read"] as const) {
    it(`preserves fill and responsive padding at ${width} width`, () => {
      view = mount(<PagePad width={width} fill>Content</PagePad>);
      const classes = view.container.firstElementChild!.classList;
      expect(classes.contains(`trm-page-${width}`)).toBe(true);
      expect(classes.contains("h-full")).toBe(true);
      expect(classes.contains("flex-col")).toBe(true);
      expect(classes.contains("max-[720px]:px-4")).toBe(true);
    });
  }
});

it("renders CenterPanel in flow with configurable width and actions", () => {
  view = mount(<CenterPanel title="Confirm" sub="Key" width={480} foot={<button>Continue</button>}><input /></CenterPanel>);
  expect(view.container.querySelector<HTMLElement>("section")!.style.maxInlineSize).toBe("480px");
  expect(view.container.querySelector("[role=dialog]")).toBeNull();
  expect(view.container.querySelector(".trm-center-foot button")).not.toBeNull();
});
