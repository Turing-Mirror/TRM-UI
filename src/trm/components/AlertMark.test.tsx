// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it } from "vitest";
import { AlertMark } from "./AlertMark";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => view?.unmount());

it("names the mark accessibly and shows the same tooltip on keyboard focus", () => {
  view = mount(<AlertMark label="需要人工处理" />);
  const mark = view.container.querySelector<HTMLElement>('[role="img"]')!;
  expect(mark.getAttribute("aria-label")).toBe("需要人工处理");
  expect(mark.tabIndex).toBe(0);
  expect(mark.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  act(() => mark.focus());
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe("需要人工处理");
});
