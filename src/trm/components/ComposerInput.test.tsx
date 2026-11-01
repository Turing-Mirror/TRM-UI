// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComposerInput } from "./ComposerInput";
import { mount, type Mounted } from "../test/dom";
let view: Mounted;
afterEach(() => { view?.unmount(); vi.restoreAllMocks(); });
describe("ComposerInput", () => {
  it("submits Enter and preserves Shift+Enter and IME confirmation", () => {
    const send = vi.fn();
    view = mount(<ComposerInput value="draft" onChange={() => {}} onSubmit={send} aria-label="Message" />);
    const area = view.container.querySelector("textarea")!;
    for (const extra of [{ shiftKey: true }, { isComposing: true }, { keyCode: 229 }]) {
      const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...extra });
      act(() => area.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
    }
    expect(send).not.toHaveBeenCalled();
    act(() => area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("does not submit while busy and shrinks when the controlled draft is cleared", () => {
    const send = vi.fn();
    let measured = 240;
    vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(() => measured);
    view = mount(<ComposerInput value="long draft" onChange={() => {}} maxHeight={120} onSubmit={send} canSubmit={false} />);
    const area = view.container.querySelector("textarea")!;
    expect(area.style.height).toBe("120px");
    act(() => area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(send).not.toHaveBeenCalled();
    measured = 24;
    act(() => view.root.render(<ComposerInput value="" onChange={() => {}} maxHeight={120} />));
    expect(view.container.querySelector("textarea")).toBe(area);
    expect(area.style.height).toBe("24px");
  });
});
