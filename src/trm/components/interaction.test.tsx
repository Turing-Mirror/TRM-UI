// @vitest-environment happy-dom
import { act, useRef, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount, pressKey, type Mounted } from "../test/dom";
import { useModalKeys } from "../hooks/useModalKeys";
import { ListItem } from "./ui";
import { SegmentControl } from "./SegmentControl";
const mounts: Mounted[] = [];
afterEach(() => { while(mounts.length) mounts.pop()!.unmount(); vi.useRealTimers(); });
function Modal({children, escape}: {children?: React.ReactNode; escape?: () => void}) {
  const ref=useRef<HTMLDivElement>(null);
  useModalKeys(true,ref,{onEscape:escape});
  return <div role="dialog" ref={ref} tabIndex={-1}>{children}</div>;
}
it("nested actions do not activate the enclosing row", () => {
  const row=vi.fn(), child=vi.fn();
  const m=mount(<ListItem title="row" onClick={row} right={<button onClick={child}>action</button>} />); mounts.push(m);
  act(() => m.container.querySelector("button")!.click());
  expect(child).toHaveBeenCalledOnce(); expect(row).not.toHaveBeenCalled();
  pressKey(m.container.querySelector("button")!,"Enter");
  expect(row).not.toHaveBeenCalled();
  act(() => m.container.querySelector<HTMLElement>('[role="button"]')!.click());
  expect(row).toHaveBeenCalledOnce();
});
it("modal skips disabled and hidden controls and includes selects, links and textareas", () => {
  vi.useFakeTimers();
  const m=mount(<Modal><button disabled>disabled</button><div style={{display:"none"}}><button>hidden</button></div><select><option>A</option></select><a href="#">link</a><textarea /></Modal>); mounts.push(m);
  act(() => vi.runAllTimers());
  expect(document.activeElement).toBe(m.container.querySelector("select"));
  const last=m.container.querySelector("textarea")!;
  act(() => last.focus()); pressKey(last,"Tab");
  expect(document.activeElement).toBe(m.container.querySelector("select"));
});
it("empty modal keeps Tab on its container", () => {
  const m=mount(<Modal />); mounts.push(m);
  const event=new KeyboardEvent("keydown",{key:"Tab",bubbles:true,cancelable:true});
  act(() => document.body.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(m.container.querySelector('[role="dialog"]'));
});
it("only the top modal receives Escape", () => {
  const lower=vi.fn(), upper=vi.fn();
  mounts.push(mount(<Modal escape={lower}><button>lower</button></Modal>));
  const top=mount(<Modal escape={upper}><button>upper</button></Modal>); mounts.push(top);
  pressKey(document.body,"Escape");
  expect(lower).not.toHaveBeenCalled(); expect(upper).toHaveBeenCalledOnce();
  mounts.pop()!.unmount(); pressKey(document.body,"Escape");
  expect(lower).toHaveBeenCalledOnce();
});
function Tabs() {
  const [value,setValue]=useState("a");
  return <SegmentControl role="tablist" value={value} onChange={setValue} options={[{id:"a",label:"A"},{id:"b",label:"B"},{id:"c",label:"C"}]} />;
}
it("nested modal takes priority over its parent effect", () => {
  const outer=vi.fn(), inner=vi.fn();
  mounts.push(mount(<Modal escape={outer}><Modal escape={inner}><button>inner</button></Modal></Modal>));
  pressKey(document.body,"Escape");
  expect(inner).toHaveBeenCalledOnce(); expect(outer).not.toHaveBeenCalled();
});
it("tabs support arrow wrap, Home and End with one tab stop", () => {
  const m=mount(<Tabs />); mounts.push(m);
  const buttons=m.container.querySelectorAll("button");
  pressKey(buttons[0],"ArrowLeft"); expect(document.activeElement).toBe(buttons[2]);
  expect(buttons[2].getAttribute("aria-selected")).toBe("true");
  pressKey(buttons[2],"Home"); expect(document.activeElement).toBe(buttons[0]);
  pressKey(buttons[0],"End"); expect(document.activeElement).toBe(buttons[2]);
  expect([...buttons].filter(b => b.tabIndex===0)).toHaveLength(1);
});
it("group buttons expose selection without intercepting arrows", () => {
  const change=vi.fn();
  const m=mount(<SegmentControl value="a" onChange={change} options={[{id:"a",label:"A"}]} />); mounts.push(m);
  const button=m.container.querySelector("button")!;
  expect(button.getAttribute("aria-pressed")).toBe("true");
  pressKey(button,"ArrowRight"); expect(change).not.toHaveBeenCalled();
});
it("pill animation restarts while the sliding container stays mounted", () => {
  const m=mount(<Tabs />); mounts.push(m);
  const slider=m.container.querySelector('span[aria-hidden]')!;
  const oldVisual=slider.firstElementChild;
  act(() => m.container.querySelectorAll("button")[1].click());
  expect(m.container.querySelector('span[aria-hidden]')).toBe(slider);
  expect(slider.firstElementChild).not.toBe(oldVisual);
  expect(slider.firstElementChild!.className).toContain("seg-thumb-move");
});
