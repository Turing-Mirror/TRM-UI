// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { I18nScope } from "../i18n";
import { AppBar, Sidebar, SidebarBrand } from "./Sidebar";

let view: Mounted;
afterEach(() => view?.unmount());

it("places the fixed head and foot outside the scrolling navigation", () => {
  view = mount(<Sidebar collapsed={false} label="Navigation" head={<b>Brand</b>} foot={<span>Status</span>}>
    <button>Overview</button>
  </Sidebar>);
  const nav = view.container.querySelector("nav")!;
  expect(nav.getAttribute("aria-label")).toBe("Navigation");
  expect(nav.firstElementChild?.textContent).toBe("Brand");
  expect(nav.children[1].classList.contains("overflow-y-auto")).toBe(true);
  expect(nav.children[1].textContent).toBe("Overview");
  expect(nav.lastElementChild?.textContent).toBe("Status");
  expect(nav.style.width).toBe("244px");
});

it("keeps the original sidebar structure when no head is supplied", () => {
  view = mount(<Sidebar collapsed label="Navigation"><button>Overview</button></Sidebar>);
  const nav = view.container.querySelector("nav")!;
  expect(nav.children.length).toBe(1);
  expect(nav.style.width).toBe("64px");
  expect(view.container.querySelector(".sidebar-head")).toBeNull();
});

it("toggles with localized labels and removes the collapsed brand", () => {
  const toggle = vi.fn();
  const brand = (collapsed: boolean) => <I18nScope value={{
    locale: "en-US", ready: true, setLocale: () => {}, t: (key) => key,
  }}>
    <SidebarBrand brand={<b>Admin</b>} collapsed={collapsed} onToggle={toggle} />
  </I18nScope>;
  view = mount(brand(false));
  const button = view.container.querySelector("button")!;
  expect(view.container.textContent).toBe("Admin");
  expect(button.getAttribute("aria-label")).toBe("Collapse sidebar");
  act(() => button.click());
  expect(toggle).toHaveBeenCalledTimes(1);
  act(() => view.root.render(brand(true)));
  expect(view.container.textContent).not.toContain("Admin");
  expect(view.container.querySelector("button")!.getAttribute("aria-label")).toBe("Expand sidebar");
  expect(view.container.querySelector("[data-tauri-drag-region]")).toBeNull();
  act(() => view.container.querySelector("button")!.click());
  expect(toggle).toHaveBeenCalledTimes(2);
});

it("preserves the desktop drag region and window controls", () => {
  const close = vi.fn();
  view = mount(<AppBar brand="Desktop" sidebarOpen onSidebar={() => {}} windowControls={{
    minimize: vi.fn(), toggleMaximize: vi.fn(), close,
  }} />);
  expect(view.container.querySelector("header[data-tauri-drag-region]")).not.toBeNull();
  const buttons = view.container.querySelectorAll("button");
  expect(buttons.length).toBe(4);
  act(() => buttons[3].click());
  expect(close).toHaveBeenCalledTimes(1);
});
