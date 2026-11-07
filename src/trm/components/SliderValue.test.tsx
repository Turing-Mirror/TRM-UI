// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, pressKey, type Mounted } from "../test/dom";
import { Slider, SliderValue } from "./controls";

let m: Mounted;
afterEach(() => m?.unmount());
function open() {
  act(() => m.container.querySelector('[role="button"]')!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
  return m.container.querySelector<HTMLInputElement>('input[type="text"]')!;
}
function type(input: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

it("edits the unformatted value, selects it and submits once across Enter and blur", () => {
  const change = vi.fn();
  m = mount(<Slider value={0.123} min={0} max={1} step={0.001} onChange={change} format={v => `${v.toFixed(1)} dB`} ariaLabel="gain" />);
  expect(m.container.textContent).toBe("0.1 dB");
  const input = open();
  expect(input.value).toBe("0.123");
  expect(input.selectionStart).toBe(0);
  expect(input.selectionEnd).toBe(5);
  expect(document.activeElement).toBe(input);
  expect(input.getAttribute("aria-label")).toBe("gain");
  type(input, "0.456");
  act(() => {
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
  });
  expect(change.mock.calls).toEqual([[0.456]]);
  expect(document.activeElement).toBe(m.container.querySelector('[role="button"]'));
});

it.each([
  ["100", -1, 1, 0.1, 1],
  ["-100", -1, 1, 0.1, -1],
  ["0.15", 0, 1, 0.1, 0.2],
  ["0.35", 0.05, 1.05, 0.1, 0.35],
  ["1", 0, 1, 0.6, 0.6],
  ["3.6e-5", 0, 0.01, 1e-5, 0.00004],
  ["-0.16", -0.25, 1, 0.1, -0.15],
])("aligns %s to range [%s, %s] and step %s", (draft, min, max, step, expected) => {
  const change = vi.fn();
  m = mount(<SliderValue value={0} min={min} max={max} step={step} onChange={change} />);
  const input = open(); type(input, draft); pressKey(input, "Enter");
  expect(change.mock.calls).toEqual([[expected]]);
});

it("keeps a draft across external updates and cancels to the latest value", () => {
  const change = vi.fn();
  const render = (value: number) => <SliderValue value={value} min={0} max={10} step={0.1} onChange={change} />;
  m = mount(render(1));
  const input = open(); type(input, "2.7");
  act(() => m.root.render(render(3)));
  expect(input.value).toBe("2.7");
  pressKey(input, "Escape");
  expect(change).not.toHaveBeenCalled();
  expect(m.container.textContent).toBe("3");
  expect(document.activeElement).toBe(m.container.querySelector('[role="button"]'));
});

it("commits on blur without taking focus from the next control", () => {
  const change = vi.fn();
  m = mount(<><SliderValue value={1} min={0} max={10} step={0.1} onChange={change} /><button>Next</button></>);
  const input = open(); type(input, "2.7");
  const next = m.container.querySelector("button")!;
  act(() => next.focus());
  expect(change.mock.calls).toEqual([[2.7]]);
  expect(document.activeElement).toBe(next);
});

it.each(["", "-", "bad", "Infinity", "NaN"])("cancels invalid input %s", draft => {
  const change = vi.fn();
  m = mount(<SliderValue value={1} min={0} max={10} step={0.1} onChange={change} />);
  const input = open(); type(input, draft); pressKey(input, "Enter");
  expect(change).not.toHaveBeenCalled();
  expect(m.container.textContent).toBe("1");
});

it("cannot edit while disabled and discards a draft when disabled externally", () => {
  const change = vi.fn();
  const render = (disabled: boolean) => <SliderValue value={1} min={0} max={10} step={0.1} onChange={change} disabled={disabled} />;
  m = mount(render(true));
  expect(open()).toBeNull();
  act(() => m.root.render(render(false)));
  const input = open(); type(input, "2.7");
  act(() => m.root.render(render(true)));
  expect(m.container.querySelector('input[type="text"]')).toBeNull();
  expect(change).not.toHaveBeenCalled();
});

it("isolates numeric editing from track reset and parent Escape shortcuts", () => {
  const reset = vi.fn(), key = vi.fn();
  m = mount(<div onDoubleClick={reset} onKeyDown={key}><Slider value={1} min={0} max={10} step={1} onChange={() => {}} /></div>);
  const input = open(); pressKey(input, "Escape");
  expect(reset).not.toHaveBeenCalled(); expect(key).not.toHaveBeenCalled();
  act(() => m.container.querySelector('input[type="range"]')!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
  expect(reset).toHaveBeenCalledOnce();
  pressKey(m.container.querySelector('[role="button"]')!, "Enter");
  expect(m.container.querySelector('input[type="text"]')).not.toBeNull();
});
