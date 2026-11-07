// @vitest-environment happy-dom
import { act, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { Switch } from "./controls";
import { Row } from "./rows";

let view: Mounted;
afterEach(() => view?.unmount());

it("names the switch without repeating the row title and reports controlled state", () => {
  function Setting() {
    const [checked, setChecked] = useState(false);
    return <Row title="Prewarm" control={<Switch checked={checked} onChange={setChecked} label="Prewarm" />} />;
  }
  view = mount(<Setting />);
  const input = view.container.querySelector<HTMLInputElement>('[role="switch"]')!;
  expect(input.type).toBe("checkbox");
  expect(input.getAttribute("aria-label")).toBe("Prewarm");
  expect(view.container.textContent).toBe("Prewarm");
  expect(input.getAttribute("aria-checked")).toBe("false");
  act(() => input.click());
  expect(input.checked).toBe(true);
  expect(input.getAttribute("aria-checked")).toBe("true");
  act(() => input.click());
  expect(input.checked).toBe(false);
  expect(input.getAttribute("aria-checked")).toBe("false");
});

it("leaves Space activation to the native checkbox", () => {
  const change = vi.fn();
  view = mount(<Switch checked={false} onChange={change} label="Prewarm" />);
  const input = view.container.querySelector("input")!;
  act(() => input.focus());
  expect(document.activeElement).toBe(input);
  for (const type of ["keydown", "keyup"]) {
    const event = new KeyboardEvent(type, { key: " ", code: "Space", bubbles: true, cancelable: true });
    act(() => input.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(false);
  }
  // happy-dom does not synthesize Space's native click; exercise that activation separately.
  expect(change).not.toHaveBeenCalled();
  act(() => input.click());
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
});

it("blocks activation when disabled", () => {
  const change = vi.fn();
  view = mount(<Switch checked={false} onChange={change} label="Prewarm" disabled />);
  const input = view.container.querySelector("input")!;
  expect(input.disabled).toBe(true);
  act(() => {
    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
    input.click();
  });
  expect(document.activeElement).not.toBe(input);
  expect(change).not.toHaveBeenCalled();
  expect(input.getAttribute("aria-checked")).toBe("false");
});

it("keeps a busy switch at full strength and ignores input until the save settles", () => {
  const change = vi.fn();
  view = mount(<Switch checked busy onChange={change} label="启用" />);
  const input = view.container.querySelector<HTMLInputElement>("input")!;
  expect(input.disabled).toBe(false);
  expect(input.getAttribute("aria-busy")).toBe("true");
  act(() => input.click());
  expect(change).not.toHaveBeenCalled();
});

it("shows visible text when asked and lets the text toggle the switch", () => {
  const change = vi.fn();
  view = mount(<Switch checked={false} onChange={change} label="启用" text="启用" />);
  const input = view.container.querySelector<HTMLInputElement>("input")!;
  expect(input.getAttribute("aria-label")).toBeNull();
  expect(view.container.textContent).toBe("启用");
  act(() => view.container.querySelector<HTMLElement>(".trm-switch-labelled span:last-child")!.click());
  expect(change).toHaveBeenCalledWith(true);
});
