// @vitest-environment happy-dom
import { act, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, pressKey, type Mounted } from "../test/dom";
import { ChipInput } from "./ChipInput";

let view: Mounted;
afterEach(() => view?.unmount());

function setup(initial: string[] = [], separators?: RegExp, disabled = false) {
  const changed = vi.fn();
  function Host() {
    const [value, setValue] = useState(initial);
    return <ChipInput value={value} onChange={(next) => { changed(next); setValue(next); }}
      label="Tags" separators={separators} disabled={disabled} />;
  }
  view = mount(<Host />);
  return { input: view.container.querySelector("input")!, changed };
}

function inputText(input: HTMLInputElement, value: string, isComposing = false) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing }));
  });
}

it("splits both commas, trims chips and deduplicates existing and pasted tags", () => {
  const { input, changed } = setup(["one"]);
  inputText(input, "one, two，two, three");
  expect(changed).toHaveBeenLastCalledWith(["one", "two", "three"]);
  expect(input.value).toBe("");
  inputText(input, "one,");
  expect(changed).toHaveBeenCalledTimes(1);
});

it("does not split or submit during IME composition", () => {
  const { input, changed } = setup();
  act(() => input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
  inputText(input, "中文，输入", true);
  act(() => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true })));
  pressKey(input, ",");
  expect(changed).not.toHaveBeenCalled();
  expect(input.value).toBe("中文，输入");
  act(() => input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
  expect(changed).toHaveBeenLastCalledWith(["中文", "输入"]);
});

it("Backspace removes the last tag only when the draft is empty", () => {
  const { input, changed } = setup(["one", "two"]);
  inputText(input, "draft");
  pressKey(input, "Backspace");
  expect(changed).not.toHaveBeenCalled();
  inputText(input, "");
  pressKey(input, "Backspace");
  expect(changed).toHaveBeenLastCalledWith(["one"]);
});

it("commits on blur and honors custom global separators repeatedly", () => {
  const { input, changed } = setup([], /[;]/g);
  inputText(input, "one;");
  inputText(input, "two;");
  inputText(input, "three,four");
  act(() => input.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
  expect(changed).toHaveBeenLastCalledWith(["one", "two", "three,four"]);
});

it("Enter commits the draft without submitting its enclosing form", () => {
  const { input, changed } = setup();
  inputText(input, "draft");
  const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
  act(() => input.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(changed).toHaveBeenLastCalledWith(["draft"]);
});

it("disabled tags cannot be removed", () => {
  const { input, changed } = setup(["one"], undefined, true);
  expect(input.disabled).toBe(true);
  act(() => view.container.querySelector("button")!.click());
  pressKey(input, "Backspace");
  expect(changed).not.toHaveBeenCalled();
});
