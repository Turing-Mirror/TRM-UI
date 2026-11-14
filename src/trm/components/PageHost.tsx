import {
  Activity,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Nav } from "../lib/nav";
import { FLOW_MS, curve } from "./motion";

const PageActiveCtx = createContext(true);

/**
 * 这一页此刻是否正显示着。换页离场、或页面常驻但藏起来时为 false。
 * 菜单、下拉这类浮层读它：页被切走时跟着收起，不留在别的页上面。
 */
export const usePageActive = () => useContext(PageActiveCtx);

/** 产品自己管页面（常驻、分标签页）时，用它告诉里面的组件这一页是否正显示着。 */
export function PageActive({ value, children }: { value: boolean; children: ReactNode }) {
  return <PageActiveCtx.Provider value={value}>{children}</PageActiveCtx.Provider>;
}

/** 这一页被切走时执行一次。常驻页用它收起一次性的结果文字，回来时不再看到上次的提示。 */
export function usePageLeave(fn: () => void): void {
  const active = usePageActive();
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => {
    if (!active) latest.current();
  }, [active]);
}

type Props<T extends string> = {
  /** 只用到方向：按导航顺序，往后为 1，往前为 -1。 */
  nav: Pick<Nav<T>, "direction">;
  page: T;
  children: (id: T) => ReactNode;
  /** 换页方向的轴。顶部页签用 "x"（默认），侧栏用 "y"：导航竖着排，页面就上下推。 */
  axis?: "x" | "y";
  /**
   * 离开后仍保持挂载的页：输入、筛选和滚动位置都留着，再来时不重新搭建。
   * - `true`：藏起来但照常运行，监听和轮询都不停。适合离开后还有事在进行的页。
   * - `"paused"`：藏起来并停掉副作用，回来时重新执行一遍，数据照样刷新。适合其余的页。
   */
  keep?: (id: T) => boolean | "paused";
  /** 空闲时提前搭好的页，第一次进入不再有搭建的停顿。只对 `keep` 认可的页有效；露面之前副作用不执行。 */
  warm?: readonly T[];
  /** 某一页容器的附加类名。默认纵向滚动；不该滚动的页传 "overflow-hidden"。 */
  paneClassName?: (id: T) => string;
};

/** 胶片上的一页：slot 是它在胶片上的格子，相邻的页格子相差 1。 */
type Layer<T> = { id: T; slot: number };
type State<T> = { page: T; layers: Layer<T>[]; seq: number; seen: T[] };

/** 提前搭页的间隔：一次只搭一页，让出时间给眼前的操作。 */
const WARM_GAP_MS = 600;

/**
 * 整页推移：新旧两页首尾相接，像一条胶片整体平移一个页面的距离，全程不透明、不缩放。
 *
 * - 点击当帧就开始，新页同一帧挂上。
 * - 中途改主意：胶片从此刻画到的位置接着走，不从头重放。反向回去时原来那一页还在，
 *   状态不丢；连续往前翻时，页面一格一格接在后面，中间不露空白。
 * - 只动胶片这一层的 transform，页面内容不参与每帧计算。停稳后撤掉 transform，文字不发糊。
 * - 减弱动态效果时直接切换。
 *
 * 同时可能挂着几页，所以 `children` 是个函数而不是节点 —— 它会被每一页各调用一次。
 */
export function PageHost<T extends string>({ nav, page, children, axis = "x", keep, warm, paneClassName }: Props<T>) {
  const reduce = usePrefersReducedMotion();
  const [st, setSt] = useState<State<T>>({ page, layers: [{ id: page, slot: 0 }], seq: 0, seen: [page] });
  const [parked, setParked] = useState<T[]>([]);
  const strip = useRef<HTMLDivElement>(null);
  const running = useRef<Animation | null>(null);
  const panes = useRef(new Map<T, HTMLDivElement>());
  const scrolls = useRef(new Map<T, number>());

  if (st.page !== page) {
    const dir = reduce ? 0 : nav.direction(st.page, page);
    const from = st.layers.find((l) => l.id === st.page);
    const seen = st.seen.includes(page) ? st.seen : [...st.seen, page];
    if (dir === 0 || !from) {
      setSt({ page, layers: [{ id: page, slot: 0 }], seq: st.seq + 1, seen });
    } else {
      const slot = from.slot + dir;
      // 新页接在当前页的去向一侧。那一格若还留着更早的离场页，由新页顶替。
      const layers = st.layers.filter((l) => l.id !== page && l.slot !== slot);
      setSt({ page, layers: [...layers, { id: page, slot }], seq: st.seq + 1, seen });
    }
  } else if (reduce && st.layers.length > 1) {
    setSt({ ...st, layers: [{ id: page, slot: 0 }], seq: st.seq + 1 });
  }
  // 常驻页一旦露过面就留在台上；之后不在胶片上时藏起来。
  const wanted = keep ? [...new Set([...parked, ...st.layers.map((l) => l.id)])].filter(keep) : [];
  if (wanted.length !== parked.length) setParked(wanted);

  const slot = st.layers.find((l) => l.id === st.page)?.slot ?? 0;
  const moving = st.layers.length > 1;

  // 常驻页回来时回到离开时的滚动位置；必须在启动胶片动画前恢复，免得写入 scrollTop 在动画开始后触发二次排版。
  const shown = useRef(page);
  useLayoutEffect(() => {
    const left = panes.current.get(shown.current);
    if (left && shown.current !== st.page) scrolls.current.set(shown.current, left.scrollTop);
    shown.current = st.page;
    const el = panes.current.get(st.page);
    const saved = scrolls.current.get(st.page);
    if (el && saved !== undefined && el.scrollTop !== saved) el.scrollTop = saved;
  }, [st.page]);

  useLayoutEffect(() => {
    const el = strip.current;
    if (!el) return;
    // 胶片的位置不交给 React 的 style：提交时它会先把终点写上去，这里就读不到此刻画到哪了。
    // 先读此刻的位置，再写终点，动画从读到的位置接着走。
    const painted = moving ? getComputedStyle(el).transform : "";
    el.style.transform = slot ? shift(axis, -slot) : "";
    if (!moving) {
      running.current?.cancel();
      running.current = null;
      return;
    }
    const settle = () => {
      running.current = null;
      setSt((s) => (s.seq === st.seq ? { ...s, layers: [{ id: s.page, slot: 0 }] } : s));
    };
    if (typeof el.animate !== "function") {
      settle();
      return;
    }
    running.current?.cancel();
    const animation = el.animate(
      [{ transform: painted && painted !== "none" ? painted : "translate3d(0, 0, 0)" }, { transform: shift(axis, -slot) }],
      { duration: FLOW_MS, easing: curve("--ease-nav") },
    );
    running.current = animation;
    animation.finished.then(() => { if (running.current === animation) settle(); }, () => undefined);
    // Safari 在新页首次显形并提交合成层前就会让 WAAPI 时钟开始走，第一帧常直接跳过 ease-nav 前段。
    // 先停在起点等本帧排版/图层提交，再从下一帧 VSync 播放，保证整段曲线从 0% 起走。
    if (
      typeof animation.pause === "function" &&
      typeof animation.play === "function" &&
      typeof requestAnimationFrame === "function" &&
      (typeof document === "undefined" || !document.hidden)
    ) {
      animation.pause();
      let raf = requestAnimationFrame(() => {
        raf = 0;
        if (running.current === animation) animation.play();
      });
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 换页和停稳各跑一次
  }, [st.seq, slot, moving]);
  useEffect(() => () => running.current?.cancel(), []);

  // 提前搭页：停稳之后、浏览器空闲时，一次加一页到台下。
  const next = moving || !keep ? undefined : warm?.find((id) => keep(id) && id !== st.page && !parked.includes(id));
  useEffect(() => {
    if (next === undefined) return;
    let idle = 0;
    const add = () => setParked((p) => (p.includes(next) ? p : [...p, next]));
    const timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(add, { timeout: WARM_GAP_MS * 4 });
      else add();
    }, WARM_GAP_MS);
    return () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [next]);

  const onStrip = new Map(st.layers.map((l) => [l.id, l.slot]));
  // 按 id 排序，节点先后永远不变：换格子时 React 不挪节点，滚动位置不会被重置。
  const ids = [...new Set([...onStrip.keys(), ...parked])].sort();
  const mounted = ids.join("\n");
  useEffect(() => {
    // 已卸下的页不留滚动位置，下次来从头看。
    const alive = new Set(mounted.split("\n"));
    for (const id of scrolls.current.keys()) if (!alive.has(id)) scrolls.current.delete(id);
  }, [mounted]);

  return (
    <div className="relative flex-1 overflow-clip">
      <div ref={strip} className={`absolute inset-0 ${st.seq ? "flow-quiet" : ""}`} style={moving ? { willChange: "transform" } : undefined}>
        {ids.map((id) => {
          const at = onStrip.get(id);
          const active = id === st.page;
          // 台下的页：停用副作用的，和还没露过面的，交给 Activity 藏起来。
          const resting = at === undefined && (keep?.(id) === "paused" || !st.seen.includes(id));
          return (
            <div
              key={id}
              ref={(el) => {
                if (el) panes.current.set(id, el);
                else panes.current.delete(id);
              }}
              data-page-scroll={active ? "" : undefined}
              data-page-resting={at === undefined ? "" : undefined}
              inert={!active}
              aria-hidden={!active || undefined}
              className={`absolute ${paneClassName?.(id) ?? "overflow-y-auto"} ${at === undefined ? "invisible" : ""}`}
              style={{
                ...place(axis, at ?? slot),
                contain: "layout style paint",
                ...(moving && at !== undefined ? { willChange: "transform" } : null),
              }}
            >
              <Activity mode={resting ? "hidden" : "visible"}>
                <PageActive value={active}>{children(id)}</PageActive>
              </Activity>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function shift(axis: "x" | "y", slots: number): string {
  return axis === "y" ? `translate3d(0, ${slots * 100}%, 0)` : `translate3d(${slots * 100}%, 0, 0)`;
}

function place(axis: "x" | "y", slot: number): CSSProperties {
  return axis === "y"
    ? { left: 0, right: 0, top: `${slot * 100}%`, height: "100%" }
    : { top: 0, bottom: 0, left: `${slot * 100}%`, width: "100%" };
}

function usePrefersReducedMotion(): boolean {
  const [v, setV] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setV(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return v;
}
