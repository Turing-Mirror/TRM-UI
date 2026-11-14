// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, pressKey, type Mounted } from "../test/dom";
import { ConfirmDialog } from "./ConfirmDialog";
import { OUT_MS } from "./overlay";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); });

it("blocks cancel, backdrop, Escape and repeated confirmation while busy", () => {
  const close = vi.fn();
  const confirm = vi.fn();
  const dialog = (busy: boolean) => <ConfirmDialog open title="Clear tags?" text="Remove tags."
    confirm="Clear" busy={busy} onClose={close} onConfirm={confirm} />;
  view = mount(dialog(true));
  const panel = document.querySelector('[role="dialog"]')!;
  const buttons = panel.querySelectorAll("button");
  expect([...buttons].every((button) => button.disabled)).toBe(true);
  act(() => buttons.forEach((button) => button.click()));
  act(() => panel.parentElement!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
  pressKey(document.body, "Escape");
  expect(close).not.toHaveBeenCalled();
  expect(confirm).not.toHaveBeenCalled();
  act(() => view.root.render(dialog(false)));
  act(() => buttons[1].click());
  expect(confirm).toHaveBeenCalledOnce();
  act(() => buttons[0].click());
  act(() => panel.parentElement!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
  pressKey(document.body, "Escape");
  expect(close).toHaveBeenCalledTimes(3);
});

it("uses Btn danger styling for dangerous confirmations without legacy class", () => {
  view = mount(<ConfirmDialog open title="Delete item?" text="Cannot undo." confirm="Delete" danger
    busy={false} onClose={() => {}} onConfirm={() => {}} />);
  const buttons = document.querySelectorAll('[role="dialog"] button');
  expect(buttons[1].className).not.toContain("trm-confirm-danger");
  expect(buttons[1].className).toContain("text-[var(--danger-text)]");
});

it("retains the message during exit and stops accepting actions", () => {
  vi.useFakeTimers();
  const close = vi.fn();
  const confirm = vi.fn();
  view = mount(<ConfirmDialog open title="Title" text="Message" confirm="Confirm" danger
    busy={false} onClose={close} onConfirm={confirm} />);
  act(() => view.root.render(<ConfirmDialog open={false} title="" text="" confirm=""
    busy={false} onClose={close} onConfirm={confirm} />));
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Message");
  act(() => document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button').forEach((button) => button.click()));
  expect(close).not.toHaveBeenCalled();
  expect(confirm).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(OUT_MS));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
