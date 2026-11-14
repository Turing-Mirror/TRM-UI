// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { Slider, Toggle } from "./controls";
import { AccordionGroup, Block, ListItem } from "./ui";
let m: Mounted;
afterEach(() => m?.unmount());
it("a collapsible section retains its state after remounting", () => {
  const section = <Block title="Queue" collapsible="test.queue"><span>Pending item</span></Block>;
  localStorage.removeItem("trm.collapsed.test.queue");
  m = mount(section);
  act(() => m.container.querySelector("button")!.click());
  expect(m.container.querySelector("button")!.getAttribute("aria-expanded")).toBe("false");
  expect(m.container.textContent).not.toContain("Pending item");
  m.unmount();
  m = mount(section);
  expect(m.container.textContent).not.toContain("Pending item");
  act(() => m.container.querySelector("button")!.click());
  expect(m.container.textContent).toContain("Pending item");
  localStorage.removeItem("trm.collapsed.test.queue");
});
it("forwards disabled and the accessible name through Slider", () => {
  m = mount(<Slider value={20} min={0} max={100} step={1} onChange={() => {}} ariaLabel="volume" disabled />);
  const input=m.container.querySelector("input")!;
  expect(input.disabled).toBe(true);
  expect(input.getAttribute("aria-label")).toBe("volume");
});
it("a disabled toggle cannot change its value", () => {
  const change=vi.fn();
  m=mount(<Toggle checked={false} onChange={change} label="test" disabled />);
  act(() => m.container.querySelector("input")!.click());
  expect(change).not.toHaveBeenCalled();
});
it("accordion uses an accessible native button", () => {
  const toggle=vi.fn();
  m=mount(<AccordionGroup items={[{id:"a", title:"A", content:"body"}]} openId="a" onToggle={toggle} openLabel="close" closedLabel="open" />);
  const button=m.container.querySelector("button")!;
  expect(button.getAttribute("aria-expanded")).toBe("true");
  act(() => button.click());
  expect(toggle).toHaveBeenCalledWith("a");
});
it("interactive right content does not become a nested button", () => {
  m=mount(<ListItem title="A" onClick={() => {}} right={<button>action</button>} />);
  expect(m.container.querySelector("button button")).toBeNull();
});

it("Toggle uses .trm-check and default layout props by default", () => {
  const onChange = vi.fn();
  m = mount(<Toggle checked={false} onChange={onChange} label="Opt" tip="Explain" />);
  const root = m.container.firstElementChild as HTMLElement;
  const label = root.querySelector("label")!;
  const input = label.querySelector("input[type=checkbox]") as HTMLInputElement;
  const text = label.querySelector("span")!;
  const children = Array.from(root.children);

  expect(root.className).toContain("items-center");
  expect(root.className).toContain("gap-3");
  expect(children[0].querySelector("button")).not.toBeNull();
  expect(children[1]).toBe(label);
  expect(input.className).toBe("trm-check");
  expect(text.className).toContain("text-sm");

  act(() => input.click());
  expect(onChange).toHaveBeenCalledWith(true);
});

it("Toggle supports look, tipPosition, align, className and appearance='native'", () => {
  m = mount(
    <>
      <Toggle
        checked
        onChange={() => {}}
        label="Inline"
        tip="Hint"
        tipPosition="end"
        look="inline"
        align="start"
        className="custom-row"
      />
      <Toggle checked={false} onChange={() => {}} label="Compact" look="compact" />
      <Toggle checked={false} onChange={() => {}} label="Native" align="start" appearance="native" />
    </>,
  );
  const rows = Array.from(m.container.children) as HTMLElement[];

  const inlineRoot = rows[0];
  const inlineChildren = Array.from(inlineRoot.children);
  const inlineLabel = inlineRoot.querySelector("label")!;
  const inlineInput = inlineLabel.querySelector("input")!;
  const inlineText = inlineLabel.querySelector("span")!;
  expect(inlineRoot.className).toContain("custom-row");
  expect(inlineRoot.className).toContain("items-start");
  expect(inlineRoot.className).toContain("gap-2");
  expect(inlineChildren[0]).toBe(inlineLabel);
  expect(inlineChildren[1].querySelector("button")).not.toBeNull();
  expect(inlineInput.className).toBe("trm-check");
  expect(inlineInput.getAttribute("data-align")).toBe("start");
  expect(inlineText.className).toContain("text-[13px]");

  const compactText = rows[1].querySelector("label span")!;
  expect(compactText.className).toContain("text-[12.5px]");
  expect(compactText.className).toContain("text-[var(--ink-muted)]");

  const nativeInput = rows[2].querySelector("input")!;
  expect(nativeInput.className).not.toContain("trm-check");
  expect(nativeInput.className).toContain("mt-0.5");
});

it("applies .trm-check dimensions, radius and align offset in components.css", () => {
  const css = readFileSync("src/trm/styles/components.css", "utf8");
  const sheet = document.createElement("style");
  sheet.textContent = css;
  document.head.appendChild(sheet);
  try {
    m = mount(
      <>
        <input type="checkbox" className="trm-check" aria-label="Standalone" />
        <Toggle checked={false} onChange={() => {}} label="Aligned" align="start" />
      </>,
    );
    const inputs = m.container.querySelectorAll("input");
    const standaloneStyle = getComputedStyle(inputs[0]);
    expect(standaloneStyle.width).toBe("15px");
    expect(standaloneStyle.height).toBe("15px");
    expect(standaloneStyle.borderRadius).toBe("4px");
    expect(standaloneStyle.appearance).toBe("none");
    expect(getComputedStyle(inputs[1]).marginTop).toBe("2px");
  } finally {
    sheet.remove();
  }
});
