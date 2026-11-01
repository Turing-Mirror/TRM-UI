// @vitest-environment happy-dom
import { act } from "react";
import { expect, it, vi } from "vitest";
import { Pager } from "./display";
import { mount } from "../test/dom";

it("can retain the current page for a single-page list without enabling navigation", () => {
  const change = vi.fn();
  const mounted = mount(<Pager page={1} pages={1} onChange={change} />);
  try {
    expect(mounted.container.querySelector("nav")).toBeNull();
    act(() => mounted.root.render(<Pager page={1} pages={1} onChange={change} showSinglePage />));
    const buttons = [...mounted.container.querySelectorAll<HTMLButtonElement>("button")];
    expect(buttons).toHaveLength(3);
    expect(buttons[1].getAttribute("aria-current")).toBe("page");
    expect(buttons[1].textContent).toBe("1");
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[2].disabled).toBe(true);
    act(() => { buttons[0].click(); buttons[2].click(); });
    expect(change).not.toHaveBeenCalled();
  } finally { mounted.unmount(); }
});
