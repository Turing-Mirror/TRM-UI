// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.restoreAllMocks(); });

it("sends Enter and button clicks, keeping Shift+Enter and IME confirmation in the editor", () => {
  const send = vi.fn();
  const change = vi.fn();
  view = mount(<ChatComposer value="Reply" onChange={change} onSend={send}
    placeholder="Write a reply" sendLabel="Send reply" />);
  const area = view.container.querySelector("textarea")!;
  for (const extra of [{ shiftKey: true }, { isComposing: true }, { keyCode: 229 }]) {
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, ...extra });
    act(() => area.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(false);
  }
  expect(send).not.toHaveBeenCalled();
  act(() => area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  act(() => view.container.querySelector("button")!.click());
  expect(send).toHaveBeenCalledTimes(2);
  expect(area.placeholder).toBe("Write a reply");
  expect(view.container.querySelector("button")!.getAttribute("aria-label")).toBe("Send reply");
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(area, "Edited reply");
    area.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(change).toHaveBeenCalledWith("Edited reply");
});

it.each([{ disabled: true }, { sending: true }, { value: "  " }])("blocks submission for %j", props => {
  const send = vi.fn();
  view = mount(<ChatComposer value="Reply" onChange={() => {}} onSend={send}
    placeholder="Reply" sendLabel="Send" {...props} />);
  act(() => view.container.querySelector("textarea")!
    .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  act(() => view.container.querySelector("button")!.click());
  expect(send).not.toHaveBeenCalled();
  expect(view.container.querySelector("button")!.disabled).toBe(true);
  if ("sending" in props) expect(view.container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
});

it("grows to the configured maximum and shrinks after the caller clears the draft", () => {
  let height = 300;
  vi.spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get").mockImplementation(() => height);
  const composer = (value: string) => <ChatComposer value={value} onChange={() => {}} onSend={() => {}}
    placeholder="Reply" sendLabel="Send" maxHeight={120} />;
  view = mount(composer("Long reply"));
  const area = view.container.querySelector("textarea")!;
  expect(area.style.height).toBe("120px");
  height = 24;
  act(() => view.root.render(composer("")));
  expect(area.style.height).toBe("24px");
});
