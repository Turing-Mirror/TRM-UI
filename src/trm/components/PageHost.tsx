import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Nav } from "../lib/nav";

/**
 * 侧栏换页（axis="y"）时离场层挂多久。**必须和 styles/tokens.css 的 `--page-out-ms` 一致。**
 *
 * 短了就是动画放到一半节点被拔掉；长了则是一个已经看不见的图层继续占着。
 * 顶部页签换页（axis="x"）没有离场层：旧页当帧撤下，只有新页淡入。
 */
export const PAGE_OUT_MS = 100;

const PageActiveCtx = createContext(true);

/**
 * 这一页此刻是否正显示着。换页离场、或产品让页面常驻但藏起来时为 false。
 * 菜单、下拉这类浮层读它：页被切走时跟着收起，不留在别的页上面。
 */
export const usePageActive = () => useContext(PageActiveCtx);

/** 产品自己管页面（常驻、分标签页）时，用它告诉里面的组件这一页是否正显示着。 */
export function PageActive({ value, children }: { value: boolean; children: ReactNode }) {
  return <PageActiveCtx.Provider value={value}>{children}</PageActiveCtx.Provider>;
}

type Props<T extends string> = {
  nav: Nav<T>;
  page: T;
  children: (id: T) => ReactNode;
  /**
   * 换页方向的轴。顶部页签用 "x"（默认）：页签上的滑块已经表达方向，旧页直接撤下、新页淡入。
   * 侧栏用 "y"：旧页先淡出，新页再从去向那一侧进来。两种都不让两页同时可见。
   */
  axis?: "x" | "y";
};

/**
 * 按导航顺序做方向性换页：往后翻，新页从去向那一侧进来。
 *
 * 侧栏换页会短暂同时挂两层（离场页 + 入场页），所以 `children` 是个函数而不是节点 ——
 * 它会被调用两次，各画各的那一页。
 */
export function PageHost<T extends string>({ nav, page, children, axis = "x" }: Props<T>) {
  const [phase, setPhase] = useState<{
    /** 叫 `page` 不叫 `current`：`x.current` 读起来像个 ref。 */
    page: T;
    leaving: T | null;
    dir: 1 | -1 | 0;
  }>({ page, leaving: null, dir: 0 });
  const reduce = usePrefersReducedMotion();
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
      setPhase((p) => p.page === page && p.leaving === null && p.dir === 0
        ? p : { page, leaving: null, dir: 0 });
      return;
    }
    if (page === phase.page) return;
    if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
    const dir = nav.direction(phase.page, page);
    if (dir === 0 || axis === "x") {
      setPhase({ page, leaving: null, dir });
      return;
    }
    setPhase({ page, leaving: phase.page, dir });
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      setPhase((p) => ({ ...p, leaving: null }));
    }, PAGE_OUT_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在页面 id 变化时跑
  }, [page, reduce]);

  useEffect(
    () => () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  // 换**页**时回到顶部 —— 不是每次渲染都回。
  //
  // 这里一度写成内联的 `ref={(el) => { if (el) el.scrollTop = 0 }}`。
  // 内联回调每次渲染都是一个新函数，于是 React 每渲染一次就摘一次挂一次，
  // 每一趟都把滚动位置重置掉。只要页面上有任何东西在定时重渲染（进度轮询
  // 之类），用户就会发现这一页**根本滚不动**。
  const paneRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (paneRef.current) paneRef.current.scrollTop = 0;
  }, [phase.page]);

  const [fwd, back] = axis === "y" ? ["u", "d"] : ["l", "r"];
  const enterCls =
    phase.dir === 1 ? `page-enter-${fwd}` : phase.dir === -1 ? `page-enter-${back}` : "";
  const leaveCls =
    phase.dir === 1 ? `page-leave-${fwd}` : phase.dir === -1 ? `page-leave-${back}` : "";

  return (
    <div className="relative flex-1 overflow-hidden">
      {(phase.leaving && phase.leaving !== phase.page
        ? [phase.leaving, phase.page]
        : [phase.page]).map((id) => {
        const leaving = id === phase.leaving;
        return (
          <div
            key={id}
            ref={leaving ? undefined : paneRef}
            data-page-scroll={leaving ? undefined : ""}
            inert={leaving}
            aria-hidden={leaving || undefined}
            className={leaving
              ? `absolute inset-0 overflow-hidden pointer-events-none z-[1] ${leaveCls}`
              : `absolute inset-0 overflow-y-auto z-[2] ${enterCls}`}
          >
            <PageActive value={!leaving}>{children(id)}</PageActive>
          </div>
        );
      })}
    </div>
  );
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
