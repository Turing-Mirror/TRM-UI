// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { useMorphState } from "./useMorphState";
import { mount, type Mounted } from "../test/dom";
let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); });
it("cancels obsolete shape changes and retains the previous face until exit completes", () => {
  vi.useFakeTimers();
  let state: ReturnType<typeof useMorphState<string>>;
  function Probe({ target }: { target: string }) { state = useMorphState(target); return null; }
  view = mount(<Probe target="full" />);
  act(() => view.root.render(<Probe target="bubble" />));
  expect(state!.value).toBe("full");
  act(() => view.root.render(<Probe target="panel" />));
  act(() => vi.advanceTimersByTime(50));
  expect(state!).toEqual({ value: "panel", leaving: "full" });
  act(() => vi.advanceTimersByTime(200));
  expect(state!.leaving).toBeNull();
});
