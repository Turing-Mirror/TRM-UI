// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { PopupSelect } from "./PopupSelect";
import { Leave, ModalLayer, OUT_MS } from "./overlay";
import { Swap, FADE_OUT_MS } from "./motion";
import { mount, pressKey, type Mounted } from "../test/dom";

let mounted: Mounted;
afterEach(() => { mounted?.unmount(); vi.useRealTimers(); });

it("selects with the keyboard and preserves a missing saved selection", () => {
  const change = vi.fn();
  mounted = mount(<PopupSelect value="gone" options={[{id:"a", label:"A"}, {id:"b", label:"B"}]} onChange={change} />);
  const trigger = mounted.container.querySelector<HTMLButtonElement>("[role=combobox]")!;
  expect(trigger.textContent).toContain("gone");
  pressKey(trigger, "ArrowDown");
  expect(document.querySelector("[role=listbox]")!.parentElement).toBe(document.body);
  pressKey(trigger, "ArrowDown");
  pressKey(trigger, "Enter");
  expect(change).toHaveBeenCalledWith("a");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
it("retains a conditional modal until its exit finishes and suppresses closing actions during exit", () => {
  vi.useFakeTimers();
  const close = vi.fn();
  mounted = mount(<Leave><ModalLayer onBackdrop={close}><div>panel</div></ModalLayer></Leave>);
  act(() => mounted.root.render(<Leave>{null}</Leave>));
  const layer = document.querySelector<HTMLElement>(".modal-scrim")!;
  expect(layer.parentElement).toBe(document.body);
  expect(layer.dataset.leaving).toBe("true");
  expect(layer.textContent).toBe("panel");
  act(() => layer.click());
  expect(close).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(OUT_MS));
  expect(document.querySelector(".modal-scrim")).toBeNull();
});
it("keeps the fade transition's outgoing content inert until the existing duration ends", () => {
  vi.useFakeTimers();
  mounted = mount(<Swap k="a" variant="fade"><button>A</button></Swap>);
  act(() => mounted.root.render(<Swap k="b" variant="fade"><button>B</button></Swap>));
  expect(mounted.container.querySelector("button")!.textContent).toBe("B");
  const leaving = mounted.container.querySelector<HTMLElement>(".swap-out")!;
  expect(leaving.hasAttribute("inert")).toBe(true);
  expect(leaving.textContent).toBe("A");
  act(() => vi.advanceTimersByTime(FADE_OUT_MS));
  expect(mounted.container.querySelector(".swap-out")).toBeNull();
});
