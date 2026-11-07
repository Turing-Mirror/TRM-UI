// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { I18nScope } from "../i18n";
import { AppBar, Sidebar, SidebarBrand, SidebarStatus, type SidebarStatusProps } from "./Sidebar";
import { ICON_NAMES } from "./Icon";
import { FLOW_MS } from "./motion";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.useRealTimers(); });

it.each([
  ["ok", "--ok"], ["warn", "--warn"], ["danger", "--danger"], ["muted", "--meta"],
] as const)("renders a state icon and secondary label with the %s tone only on the glyph", (tone, token) => {
  view = mount(<SidebarStatus icon="online" label="Shop online" tone={tone} collapsed={false} onClick={() => {}} />);
  const button = view.container.querySelector("button")!;
  const svg = button.querySelector("svg")!;
  expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(svg.getAttribute("width")).toBe("18");
  expect(svg.getAttribute("stroke-width")).toBe("1.6");
  expect(svg.classList.contains(`text-[var(${token})]`)).toBe(true);
  expect(button.classList.contains("text-[var(--ink-muted)]")).toBe(true);
  expect(button.textContent).toBe("Shop online");
  act(() => button.focus());
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});

it("keeps a collapsed state named and exposes the full label through a keyboard tooltip", () => {
  const click = vi.fn();
  view = mount(<SidebarStatus icon="offline" label="Shop offline" collapsed onClick={click} />);
  const button = view.container.querySelector("button")!;
  expect(button.getAttribute("aria-label")).toBe("Shop offline");
  expect(button.querySelector('.side-label')?.getAttribute("aria-hidden")).toBe("true");
  expect(button.hasAttribute("data-collapsed")).toBe(true);
  act(() => button.focus());
  const tooltip = document.querySelector('[role="tooltip"]')!;
  expect(tooltip.textContent).toBe("Shop offline");
  expect(button.getAttribute("aria-describedby")).toBe(tooltip.id);
  act(() => button.click());
  expect(click).toHaveBeenCalledTimes(1);
});

it("swaps both shape and tone without replacing the row and rolls only the changed label", () => {
  vi.useFakeTimers();
  const render = (icon: SidebarStatusProps["icon"], tone: SidebarStatusProps["tone"], label: string) =>
    <SidebarStatus icon={icon} tone={tone} label={label} collapsed={false} onClick={() => {}} />;
  view = mount(render("online", "ok", "Shop online"));
  const button = view.container.querySelector("button")!;
  const path = button.querySelector("path")!.getAttribute("d");
  act(() => view.root.render(render("offline", "muted", "Shop offline")));
  expect(view.container.querySelector("button")).toBe(button);
  expect(button.getAttribute("aria-label")).toBe("Shop offline");
  expect(button.querySelector(".sidebar-status-icon .roll-in path")!.getAttribute("d")).not.toBe(path);
  expect(button.querySelector(".side-label .roll-in")!.textContent).toBe("Shop offline");
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(button.querySelectorAll("svg")).toHaveLength(1);
  expect(button.textContent).toBe("Shop offline");
  act(() => view.root.render(render("offline", "danger", "Shop offline")));
  expect(button.querySelector(".sidebar-status-icon .roll-in svg")!.classList.contains("text-[var(--danger)]")).toBe(true);
  expect(button.querySelector(".side-label .roll-out")).toBeNull();
  act(() => view.root.render(render("online", "ok", "Shop online")));
  act(() => vi.advanceTimersByTime(FLOW_MS));
  expect(button.querySelectorAll("svg")).toHaveLength(1);
  expect(button.textContent).toBe("Shop online");
});

it("includes all connection glyphs in the icon gallery registry", () => {
  expect(ICON_NAMES).toEqual(expect.arrayContaining(["online", "offline", "alert", "scan"]));
});

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
