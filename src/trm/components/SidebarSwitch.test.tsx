// @vitest-environment happy-dom
import { act, useState } from "react";
import { afterEach, expect, it } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { SidebarSwitch } from "./Sidebar";

let view: Mounted;
afterEach(() => view?.unmount());

const options = [
  { id: "all", label: "All shops" },
  { id: "a", label: "Shop A" },
];

it("shows the current option, lists options with a check and switches on select", () => {
  function Host() {
    const [value, setValue] = useState("all");
    return <SidebarSwitch icon="store" label="Shop" value={value} options={options} onChange={setValue} collapsed={false} />;
  }
  view = mount(<Host />);
  const button = view.container.querySelector("button")!;
  expect(button.getAttribute("aria-label")).toBe("Shop：All shops");
  expect(button.textContent).toContain("All shops");
  act(() => button.click());
  const items = [...document.querySelectorAll<HTMLButtonElement>("[role=menuitemcheckbox], [role=menuitem], [role=menuitemradio]")];
  expect(items.map((item) => item.textContent?.trim())).toEqual(["All shops", "Shop A"]);
  act(() => items[1].click());
  expect(button.getAttribute("aria-label")).toBe("Shop：Shop A");
});

it("keeps only the icon when collapsed and names the current option on hover", () => {
  view = mount(<SidebarSwitch icon="store" label="Shop" value="a" options={options} onChange={() => {}} collapsed />);
  const button = view.container.querySelector("button")!;
  expect(button.title).toBe("Shop A");
  expect(button.querySelector(".side-label")?.getAttribute("aria-hidden")).toBe("true");
});
