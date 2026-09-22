// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { Slider, Toggle } from "./controls";
import { AccordionGroup, ListItem } from "./ui";
let m: Mounted;
afterEach(() => m?.unmount());
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
