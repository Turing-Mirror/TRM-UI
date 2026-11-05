// @vitest-environment happy-dom
import { act, useEffect, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { MenuBtn, useMenu } from "./Menu";
import { PageActive } from "./PageHost";
import { NoticeProvider, Notices, useNotify } from "./Notices";
import { Drawer, OUT_MS } from "./overlay";

const mounts: Mounted[] = [];
const keydown = (el: Element, key: string) =>
  act(() => { el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount();
  vi.useRealTimers();
});

describe("Menu", () => {
  it("重开再收起时，旧计时器不会提前卸下正在收起的菜单", () => {
    vi.useFakeTimers();
    mounts.push(mount(<MenuBtn label="打开" items={[{ id: "a", label: "甲" }]} />));
    const btn = document.querySelector("button")!;
    act(() => btn.click());
    act(() => btn.click());
    act(() => vi.advanceTimersByTime(OUT_MS / 2));
    act(() => btn.click());
    act(() => btn.click());
    act(() => vi.advanceTimersByTime(OUT_MS / 2 + 10));
    expect(document.querySelector("[data-popover]")).not.toBeNull();
    act(() => vi.advanceTimersByTime(OUT_MS));
    expect(document.querySelector("[data-popover]")).toBeNull();
  });

  it("第一项获得焦点，方向键在项之间移动", () => {
    mounts.push(mount(<MenuBtn label="打开" items={[{ id: "a", label: "甲" }, { id: "b", label: "乙" }, { id: "c", label: "丙", disabled: true }]} />));
    act(() => document.querySelector("button")!.click());
    const items = [...document.querySelectorAll<HTMLButtonElement>("[role=menuitem]")];
    expect(document.activeElement).toBe(items[0]);
    keydown(items[0], "ArrowDown");
    expect(document.activeElement).toBe(items[1]);
    keydown(items[1], "ArrowDown");
    expect(document.activeElement).toBe(items[0]);
    keydown(items[0], "End");
    expect(document.activeElement).toBe(items[1]);
  });

  it("所在页被切走时菜单收起", () => {
    function Page() {
      const menu = useMenu();
      return <button onClick={(e) => menu.open(e.currentTarget, [{ id: "a", label: "甲" }])}>打开{menu.node}</button>;
    }
    function Host() {
      const [on, setOn] = useState(true);
      return <><button data-switch onClick={() => setOn(false)}>换页</button><PageActive value={on}><Page /></PageActive></>;
    }
    mounts.push(mount(<Host />));
    act(() => document.querySelectorAll("button")[1].click());
    expect(document.querySelector("[data-popover]:not(.menu-out)")).not.toBeNull();
    act(() => document.querySelector<HTMLButtonElement>("[data-switch]")!.click());
    expect(document.querySelector("[data-popover]")?.classList.contains("menu-out")).toBe(true);
  });
});

describe("Notices", () => {
  it("在关闭按钮上按回车只关闭，不打开通知", () => {
    const opened = vi.fn();
    function Send() {
      const notify = useNotify();
      useEffect(() => { notify.notice({ title: "完成", onOpen: opened }); }, [notify]);
      return null;
    }
    mounts.push(mount(<NoticeProvider><Send /><Notices /></NoticeProvider>));
    const close = document.querySelector<HTMLButtonElement>("[role=button] button")!;
    keydown(close, "Enter");
    expect(opened).not.toHaveBeenCalled();
    const card = document.querySelector<HTMLElement>("[role=button]")!;
    keydown(card, " ");
    expect(opened).toHaveBeenCalledTimes(1);
  });
});

describe("Drawer", () => {
  it("打开时焦点进入抽屉，Esc 关闭", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    mounts.push(mount(<Drawer open onClose={onClose} label="详情"><button>内部</button></Drawer>));
    act(() => vi.advanceTimersByTime(1));
    const aside = document.querySelector("aside")!;
    expect(aside.contains(document.activeElement)).toBe(true);
    keydown(document.activeElement!, "Escape");
    expect(onClose).toHaveBeenCalled();
  });
});
