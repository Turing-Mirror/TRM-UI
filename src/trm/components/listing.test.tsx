// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { SearchBox } from "./listing";

let view: Mounted;
afterEach(() => view?.unmount());

it("keeps existing default SearchBox width, placeholder and clear behavior", () => {
  const onChange = vi.fn();
  view = mount(<SearchBox value="abc" onChange={onChange} />);
  const root = view.container.firstElementChild as HTMLElement;
  const input = root.querySelector("input")!;
  const clearBtn = root.querySelector("button")!;

  expect(root.className).toContain("flex-1");
  expect(root.className).toContain("max-w-[320px]");
  expect(root.className).not.toContain("w-full");
  expect(input.placeholder.length).toBeGreaterThan(0);
  expect(input.hasAttribute("aria-label")).toBe(false);

  act(() => clearBtn.click());
  expect(onChange).toHaveBeenCalledWith("");
});

it("supports full, fit, placeholder, ariaLabel and className", () => {
  view = mount(
    <>
      <SearchBox value="" onChange={() => {}} full />
      <SearchBox
        value=""
        onChange={() => {}}
        fit
        placeholder="Filter entries"
        ariaLabel="Filter entries input"
        className="w-60 shrink-0"
      />
    </>,
  );
  const rows = Array.from(view.container.children) as HTMLElement[];

  expect(rows[0].className).toContain("flex-1");
  expect(rows[0].className).toContain("w-full");
  expect(rows[0].className).not.toContain("max-w-[320px]");
  expect(rows[0].querySelector("button")).toBeNull();

  const fitRoot = rows[1];
  const fitInput = fitRoot.querySelector("input")!;
  expect(fitRoot.className).not.toContain("flex-1");
  expect(fitRoot.className).not.toContain("max-w-[320px]");
  expect(fitRoot.className).not.toContain("w-full");
  expect(fitRoot.className).toContain("w-60");
  expect(fitRoot.className).toContain("shrink-0");
  expect(fitInput.placeholder).toBe("Filter entries");
  expect(fitInput.getAttribute("aria-label")).toBe("Filter entries input");
});
