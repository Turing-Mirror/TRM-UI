import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SegmentOption<T extends string> = {
  id: T;
  label: ReactNode;
  title?: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  /** 窄布局下不画滑块，退回逐项高亮。 */
  compact?: boolean;
  role?: "tablist" | "group";
};

/**
 * 液态玻璃分段控件：**一个会滑动的滑块**，不是给每个按钮各画一块底。
 *
 * 差别在于「同一个东西挪过去了」和「这个灭了那个亮了」—— 前者眼睛跟得住，
 * 后者是两次闪烁。
 */
export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  compact = false,
  role = "group",
}: Props<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [thumb, setThumb] = useState({ x: 0, w: 0 });
  const [squish, setSquish] = useState(false);
  const first = useRef(true);

  const place = useCallback(
    (animate: boolean) => {
      const root = rootRef.current;
      const btn = btnRefs.current.get(value);
      if (!root || !btn) return;
      // `offsetLeft` 是从容器的 padding box 量的，和绝对定位滑块的 `left: 0`
      // 同一个原点 —— 所以这里**不该**再减容器的 padding。减掉 3px 的话滑块
      // 会偏左 3px：左边贴着容器、右边空出 6px，就是那个「药丸歪了」。
      const x = btn.offsetLeft;
      const w = btn.offsetWidth;
      // 值没变就别 setState —— 下面那个「每次渲染都重量一遍」的 effect 靠这条
      // 才不会把自己转起来。
      setThumb((cur) => (cur.x === x && cur.w === w ? cur : { x, w }));
      if (animate && !first.current) {
        setSquish(false);
        // 强制回流，好让动画能被重新触发
        void root.offsetWidth;
        setSquish(true);
      }
      first.current = false;
    },
    [value],
  );

  useLayoutEffect(() => {
    place(!first.current);
  }, [place, compact]);

  // 每次渲染都重量一遍，不带动画。
  //
  // 滑块的宽度是从按钮量出来的，而按钮宽度会因为**文字变了**而变 —— 最典型的
  // 就是切界面语言：「开始 / 停止」变成「Start / Stop」，按钮宽了一截，滑块
  // 还停在中文那个宽度上。上面那个 effect 只认 `value` 和 `compact`，
  // 语言变了它一动不动。
  //
  // `place` 里有「量出来一样就不 setState」的判断，所以这里没有依赖数组也不会
  // 循环渲染。
  useLayoutEffect(() => {
    place(false);
  });

  // 容器或按钮自己变大变小（窗口缩放、侧栏收起、字体加载完成）时重量。
  // 这类变化不一定伴随重渲染，光靠上面那个 effect 抓不到。
  //
  // 依赖用 id 拼出来的串而不是 `options` 本身：调用方多半每次渲染都现拼一个
  // 新数组，拿数组当依赖等于每渲染一次就重建一次观察器。
  const ids = JSON.stringify(options.map((o) => o.id));
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(root);
    for (const el of btnRefs.current.values()) ro.observe(el);
    return () => ro.disconnect();
  }, [place, ids]);

  useEffect(() => {
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [place]);

  return (
    <div
      ref={rootRef}
      role={role}
      className={[
        // inline-flex + w-fit：块级的 flex 容器会撑满父元素，于是字变短之后
        // 药丸还是原来那么长（四个字的标签，条子却按八个字的宽度画）。
        "relative inline-flex w-fit p-[3px] rounded-full",
        "bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]",
        className,
      ].join(" ")}
    >
      {!compact && (
        <span
          aria-hidden
          className={[
            "absolute top-[3px] bottom-[3px] left-0 rounded-full pointer-events-none",
            "bg-[var(--seg-thumb)]",
            "backdrop-blur-[10px] backdrop-saturate-150",
            "shadow-[var(--glass)]",
            "transition-[transform,width] duration-[520ms] ease-[var(--spring)]",
            squish ? "seg-thumb-move" : "",
          ].join(" ")}
          style={{
            width: thumb.w,
            transform: `translateX(${thumb.x}px)`,
          }}
        />
      )}
      {options.map((opt) => {
        const on = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role={role === "tablist" ? "tab" : undefined}
            aria-selected={role === "tablist" ? on : undefined}
            title={opt.title}
            ref={(el) => {
              if (el) btnRefs.current.set(opt.id, el);
              else btnRefs.current.delete(opt.id);
            }}
            onClick={() => onChange(opt.id)}
            className={[
              "relative z-[1] border-0 bg-transparent cursor-pointer whitespace-nowrap",
              "text-[13px] px-4 py-1.5 rounded-full",
              "text-[var(--ink-muted)] transition-[color,transform,background,box-shadow]",
              "duration-200 ease-[var(--ease)] active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
              on ? "text-[var(--ink)]" : "hover:text-[var(--ink)]",
              compact && on ? "bg-[var(--seg-thumb)] shadow-[var(--glass)]" : "",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
