// @vitest-environment happy-dom
import { act } from "react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer";
import { mount, type Mounted } from "../test/dom";
const styles = readFileSync("src/trm/styles/components.css", "utf8");

let view: Mounted;
let sheet: HTMLStyleElement;
beforeEach(() => {
  sheet = document.createElement("style");
  sheet.textContent = styles;
  document.head.appendChild(sheet);
});
afterEach(() => { view?.unmount(); sheet.remove(); vi.restoreAllMocks(); });

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
  expect(area.closest(".trm-chat-composer-field")?.querySelector(".trm-chat-composer-send"))
    .toBeNull();
  expect(area.closest(".trm-chat-composer-field")?.nextElementSibling).toBe(view.container.querySelector("button"));
  const buttonStyle = getComputedStyle(view.container.querySelector("button")!);
  expect(buttonStyle.width).toBe("48px");
  expect(buttonStyle.height).toBe("48px");
  expect(getComputedStyle(view.container.querySelector(".trm-chat-composer-row")!).alignItems).toBe("flex-end");
  expect(getComputedStyle(area).minHeight).toBe("32px");
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
  expect(view.container.querySelector("button")!.className).toBe("trm-chat-composer-send");
  expect(view.container.querySelector(".trm-busy-spinner")).toBeNull();
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
  expect(area.style.height).toBe("32px");
});

it("places the optional state above the field and keeps the editor mounted when it changes", () => {
  const composer = (state: string) => <ChatComposer value="" onChange={() => {}} onSend={() => {}}
    placeholder="Reply" sendLabel="Send" state={<div role="status">{state}</div>} />;
  view = mount(composer("Assistant handling"));
  const area = view.container.querySelector("textarea");
  expect(view.container.querySelector(".trm-chat-composer-row")?.previousElementSibling?.textContent)
    .toBe("Assistant handling");
  act(() => view.root.render(composer("Human handling")));
  expect(view.container.querySelector("textarea")).toBe(area);
});
