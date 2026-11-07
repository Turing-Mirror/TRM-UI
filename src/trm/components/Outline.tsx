import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSlider } from "./motion";

export type OutlineItem = { id: string; label: string };
export type OutlineProps = {
  /** 章节列表：id 是页内元素的 id，label 是菜单里显示的名字。 */
  items: OutlineItem[];
  /** 导航的无障碍名称。 */
  label: string;
  /** 章节标题停在滚动区顶边下方的距离。 */
  offset?: number;
};

/** 内容左侧（含页面左右留白）至少要留出这么宽，才放得下侧栏式菜单；不够时菜单改排在内容上方。 */
const RAIL_ROOM = 148;
/** 菜单顶边与下方第一组标题对齐的距离，与 RowGroup 的上边距一致。 */
const GROUP_GAP = 30;
/** 点击跳转后，滚动停下之前不按滚动位置改选中项，免得选中条一路扫过中间各项。 */
const SETTLE_MS = 700;

function scrollRoot(el: HTMLElement | null): HTMLElement | null {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const y = getComputedStyle(node).overflowY;
    if (y === "auto" || y === "scroll") return node;
  }
  return null;
}

/**
 * 页内快捷菜单。宽屏时停在读宽内容左侧的空白里，随页面滚动保持在左上角；
 * 窄屏时排在内容上方。点击平滑滚到对应章节，滚动时选中项跟随当前章节。
 */
export function Outline({ items, label, offset = 24 }: OutlineProps) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(items[0]?.id);
  const [side, setSide] = useState(false);
  const held = useRef(0);
  /** 换排法前菜单占的高度；换完按差值补滚动，下方内容原地不动。 */
  const shift = useRef<{ side: boolean; height: number } | null>(null);
  const { box, pos, armed, jump } = useSlider<HTMLDivElement>();

  // 左侧空白够不够放侧栏，随窗口和侧边栏宽度变化重新判断
  useLayoutEffect(() => {
    const el = rail.current;
    const root = scrollRoot(el);
    if (!el || !root) return;
    // 只按宽度算：页面进场时带位移动画，按坐标量会量偏；隐藏时宽度为 0，不改判断
    const check = () => {
      if (!root.clientWidth || !el.offsetWidth) return;
      const next = (root.clientWidth - el.offsetWidth) / 2 >= RAIL_ROOM;
      const now = el.dataset.side !== undefined;
      if (next !== now) shift.current = { side: now, height: el.offsetHeight };
      setSide(next);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = rail.current;
    const root = scrollRoot(el);
    // 只在排法真的换过之后补：首次挂载时这里和判断在同一次提交里先跑一遍，那时还没换
    if (!el || !root || !shift.current || shift.current.side === side) return;
    const delta = el.offsetHeight - shift.current.height;
    shift.current = null;
    if (delta && root.scrollTop > 0) root.scrollTop += delta;
  }, [side]);

  // 选中项跟随滚动位置：最后一个顶边已经越过参考线的章节
  useEffect(() => {
    const root = scrollRoot(rail.current);
    if (!root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (performance.now() < held.current) return;
      const top = root.getBoundingClientRect().top + offset + 1;
      let current = items[0]?.id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= top) current = item.id;
      }
      // 滚到底时最后几节顶不到参考线，直接选最后一节；页面本身不滚动时不算
      if (root.scrollTop > 0 && root.scrollTop + root.clientHeight >= root.scrollHeight - 2) current = items[items.length - 1]?.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items, offset]);

  const go = (item: OutlineItem, button: HTMLElement) => {
    const root = scrollRoot(rail.current);
    const el = document.getElementById(item.id);
    if (!root || !el) return;
    jump(button);
    setActive(item.id);
    held.current = performance.now() + SETTLE_MS;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - offset;
    root.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      ref={rail}
      className="trm-outline-rail"
      data-side={side || undefined}
      // 停住时菜单顶边和跳到的章节标题同高
      style={side ? { top: offset - GROUP_GAP } : undefined}
    >
      <nav aria-label={label} className="trm-outline" style={side ? { top: GROUP_GAP } : undefined}>
        <div ref={box} className="trm-outline-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === active ? "location" : undefined}
              onClick={(e) => go(item, e.currentTarget)}
            >
              {item.label}
            </button>
          ))}
          {pos ? (
            <span
              aria-hidden
              data-armed={armed || undefined}
              className="slider trm-outline-mark"
              style={side ? { height: pos.h, transform: `translate3d(0, ${pos.y}px, 0)` } : { width: pos.w, top: pos.y + pos.h - 2, transform: `translate3d(${pos.x}px, 0, 0)` }}
            />
          ) : null}
        </div>
      </nav>
    </div>
  );
}
