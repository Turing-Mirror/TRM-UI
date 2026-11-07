// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { Btn } from "./ui";
import { ChatComposer } from "./ChatComposer";
import { BUSY_DELAY_MS } from "./useDelayedBusy";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); });

it.each(["button", "composer"])("delays %s feedback, blocks clicks immediately and cancels short waits", kind => {
  vi.useFakeTimers();
  const click = vi.fn();
  const render = (busy: boolean) => kind === "button"
    ? <Btn busy={busy} onClick={click}>{busy ? "Working on a long request" : "Send"}</Btn>
    : <ChatComposer value="Reply" placeholder="Reply" sendLabel="Send" onChange={() => {}} onSend={click} sending={busy} />;
  view = mount(render(false));
  const button = view.container.querySelector("button")!;
  const idleContent = button.innerHTML;
  act(() => view.root.render(render(true)));
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.disabled).toBe(true);
  act(() => button.click());
  expect(click).not.toHaveBeenCalled();
  expect(button.innerHTML).toBe(idleContent);
  act(() => vi.advanceTimersByTime(BUSY_DELAY_MS - 1));
  expect(button.querySelector(".trm-busy-spinner")).toBeNull();
  act(() => view.root.render(render(false)));
  act(() => vi.advanceTimersByTime(BUSY_DELAY_MS));
  expect(button.querySelector(".trm-busy-spinner")).toBeNull();
  act(() => view.root.render(render(true)));
  act(() => vi.advanceTimersByTime(BUSY_DELAY_MS));
  expect(button.querySelector(".trm-busy-spinner")).not.toBeNull();
  if (kind === "button") {
    expect(button.firstElementChild?.textContent).toBe("Send");
    expect((button.firstElementChild as HTMLElement).style.opacity).toBe("0");
    expect(button.querySelector(".trm-btn-busy")).not.toBeNull();
  }
  act(() => view.root.render(render(false)));
  expect(button.getAttribute("aria-busy")).toBeNull();
  expect(button.disabled).toBe(false);
  expect(button.innerHTML).toBe(idleContent);
});
