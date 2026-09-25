/**
 * 浮出来的小层：右键菜单、「…」菜单、下拉选择、输入名字的小弹窗。
 *
 * 下拉一律从控件下方展开、左边对齐，不像系统原生列表那样盖在控件上、
 * 只露一个尖角。下方放不下时改从上方展开。
 */
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";
import { Icon, type IconName } from "./Icon";
import { Modal, OUT_MS, useLatest } from "./overlay";

export type Anchor = { x: number; y: number; w: number; h: number };

export const anchorOf = (el: Element): Anchor => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const pointAnchor = (x: number, y: number): Anchor => ({ x, y, w: 0, h: 0 });

const GAP = 6;
const EDGE = 8;

/** 贴着 anchor 摆放一块浮层。side="below" 从下方展开；"right" 从右侧展开（子菜单）。 */
export function Popover({
  anchor,
  onClose,
  children,
  minWidth,
  side = "below",
  label,
  leaving = false,
}: {
  anchor: Anchor;
  onClose: () => void;
  children: ReactNode;
  minWidth?: number;
  side?: "below" | "right";
  label?: string;
  /** 正在收起：放完收起动画再卸下，这期间不接鼠标。 */
  leaving?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; up: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = side === "right" ? anchor.x + anchor.w + 2 : anchor.x;
    let top = side === "right" ? anchor.y - 6 : anchor.y + anchor.h + GAP;
    let up = false;
    if (side === "right" && left + width > vw - EDGE) left = anchor.x - width - 2;
    if (top + height > vh - EDGE) {
      top = side === "right" ? vh - EDGE - height : anchor.y - height - GAP;
      up = side !== "right";
    }
    left = Math.max(EDGE, Math.min(left, vw - EDGE - width));
    top = Math.max(EDGE, top);
    setPos({ left, top, up });
  }, [anchor, side]);

  useEffect(() => {
    if (leaving) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (box.current?.contains(t)) return;
      // 子菜单在另一个层里；点在任何一层菜单里都不算点外面
      if ((t as HTMLElement).closest?.("[data-popover]")) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const blur = () => onClose();
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key, true);
    window.addEventListener("resize", blur);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("resize", blur);
    };
  }, [onClose, leaving]);

  return createPortal(
    <div
      ref={box}
      data-popover
      role="menu"
      aria-label={label}
      className={`fixed z-[70] p-1 bg-[var(--surface)] rounded-[calc(var(--rs)+4px)] shadow-[var(--pop-shadow)] ${pos ? (leaving ? "menu-out pointer-events-none" : pos.up ? "menu-in-up" : "menu-in") : "invisible"}`}
      style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, minWidth: Math.max(minWidth ?? 0, 180) }}
    >
      {children}
    </div>,
    document.body,
  );
}

export type MenuItem =
  | {
      id: string;
      label: string;
      icon?: IconName;
      danger?: boolean;
      checked?: boolean;
      disabled?: boolean;
      /** 选中后菜单是否保持打开。连续勾选多项时用。 */
      keep?: boolean;
      onSelect?: () => void;
      items?: MenuItem[];
    }
  | { id: string; gap: true };

/** 一张菜单。项之间不画线，分组靠一小段空白。 */
export function Menu({ anchor, items, onClose, side, leaving }: { anchor: Anchor; items: MenuItem[]; onClose: () => void; side?: "below" | "right"; leaving?: boolean }) {
  const [sub, setSub] = useState<{ id: string; anchor: Anchor } | null>(null);
  const subItems = sub ? items.find((i) => i.id === sub.id) : undefined;
  return (
    <Popover anchor={anchor} onClose={onClose} side={side} leaving={leaving}>
      {items.map((it) =>
        "gap" in it ? (
          <div key={it.id} className="h-1.5" />
        ) : (
          <button
            key={it.id}
            type="button"
            role={it.checked === undefined ? "menuitem" : "menuitemcheckbox"}
            aria-checked={it.checked}
            disabled={it.disabled}
            onPointerEnter={(e) => setSub(it.items ? { id: it.id, anchor: anchorOf(e.currentTarget) } : null)}
            onClick={(e) => {
              if (it.items) {
                setSub({ id: it.id, anchor: anchorOf(e.currentTarget) });
                return;
              }
              it.onSelect?.();
              if (!it.keep) onClose();
            }}
            className={[
              "w-full flex items-center gap-2.5 h-8 px-2.5 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-left text-[13px] whitespace-nowrap",
              "hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] disabled:opacity-40 disabled:cursor-default",
              it.danger ? "text-[var(--danger)]" : "text-[var(--ink)]",
              sub?.id === it.id ? "bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]" : "",
            ].join(" ")}
          >
            <span className="w-4 flex-none grid place-items-center text-[var(--ink-muted)]">
              {it.checked ? <Icon name="check" size={15} className="text-[var(--accent)]" /> : it.icon ? <Icon name={it.icon} size={15} /> : null}
            </span>
            <span className="flex-1">{it.label}</span>
            {it.items ? <Icon name="chevron" size={13} className="text-[var(--meta)]" /> : null}
          </button>
        ),
      )}
      {sub && subItems && "items" in subItems && subItems.items ? (
        <Menu anchor={sub.anchor} items={subItems.items} onClose={onClose} side="right" leaving={leaving} />
      ) : null}
    </Popover>
  );
}

/** 右键菜单与「…」菜单共用：open 接鼠标事件（右键时按指针位置）或元素（按钮下方）。 */
export function useMenu() {
  const [state, setState] = useState<{ anchor: Anchor; items: MenuItem[]; leaving?: boolean } | null>(null);
  // 收起时先标为收起中，放完动画再卸下
  const close = () => {
    setState((st) => (st ? { ...st, leaving: true } : st));
    window.setTimeout(() => setState((st) => (st?.leaving ? null : st)), OUT_MS);
  };
  const open = (from: MouseEvent | Element, items: MenuItem[]) => {
    if (from instanceof Element) {
      setState({ anchor: anchorOf(from), items });
      return;
    }
    from.preventDefault();
    from.stopPropagation();
    setState({ anchor: pointAnchor(from.clientX, from.clientY), items });
  };
  const node = state ? <Menu anchor={state.anchor} items={state.items} onClose={close} leaving={state.leaving} /> : null;
  return { open, node };
}

/** 下拉选择。代替原生 select：列表从控件下方展开，不盖住控件本身。 */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  full = false,
  label,
  quiet = false,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  full?: boolean;
  label?: string;
  /** 没有边框，只是一段可点的文字。放在标题栏、页头这类地方。 */
  quiet?: boolean;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const current = options.find((o) => o.id === value);
  const [hi, setHi] = useState(0);
  // 收起时列表照原样放完收起动画
  const [closing, setClosing] = useState(false);
  const shown = useLatest(anchor);
  useEffect(() => {
    if (anchor) {
      setClosing(false);
      return;
    }
    setClosing(true);
    const t = window.setTimeout(() => setClosing(false), OUT_MS);
    return () => window.clearTimeout(t);
  }, [anchor]);
  const openList = () => {
    if (!btn.current) return;
    setHi(Math.max(0, options.findIndex((o) => o.id === value)));
    setAnchor(anchorOf(btn.current));
  };
  const pick = (v: T) => {
    onChange(v);
    setAnchor(null);
    btn.current?.focus();
  };
  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={Boolean(anchor)}
        aria-label={label}
        onClick={() => (anchor ? setAnchor(null) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={[
          "inline-flex items-center gap-1.5 text-[13px] text-[var(--ink)] cursor-pointer rounded-[var(--rs)] border-0 transition-colors",
          quiet
            ? "bg-transparent px-2 h-8 hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
            : "bg-transparent pl-3.5 pr-2.5 h-[34px] shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--focus-line)] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--focus-line)]",
          full ? "w-full" : "",
          anchor ? "!shadow-[inset_0_0_0_1px_var(--focus-line)]" : "",
        ].join(" ")}
      >
        <span className="truncate flex-1 text-left">{current?.label ?? value}</span>
        <Icon name="down" size={14} className={`text-[var(--meta)] transition-transform duration-200 ${anchor ? "rotate-180" : ""}`} />
      </button>
      {(anchor || closing) && shown ? (
        <Popover anchor={shown} onClose={() => setAnchor(null)} minWidth={shown.w} label={label} leaving={!anchor}>
          <div
            role="listbox"
            tabIndex={-1}
            ref={(el) => el?.focus()}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(options.length - 1, h + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const o = options[hi]; if (o) pick(o.id); }
              if (e.key === "Tab") setAnchor(null);
            }}
            className="outline-none"
          >
            {options.map((o, i) => (
              <div
                key={o.id}
                role="option"
                aria-selected={o.id === value}
                onPointerEnter={() => setHi(i)}
                onClick={() => pick(o.id)}
                className={`flex items-center gap-2.5 h-8 px-2.5 rounded-[var(--rs)] cursor-pointer text-[13px] whitespace-nowrap ${i === hi ? "bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]" : ""}`}
              >
                <span className="w-4 flex-none">{o.id === value ? <Icon name="check" size={15} className="text-[var(--accent)]" /> : null}</span>
                {o.label}
              </div>
            ))}
          </div>
        </Popover>
      ) : null}
    </>
  );
}

/** 输入一个名字：新建、改名。 */
export function PromptDialog({
  open,
  title,
  initial = "",
  confirm,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  initial?: string;
  confirm: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(initial);
  // 收起时标题与按钮文字保持打开时的样子，不随调用方清空而变
  const shownTitle = useLatest(open ? title : null) ?? title;
  const shownConfirm = useLatest(open ? confirm : null) ?? confirm;
  useEffect(() => {
    if (open) setName(initial);
  }, [open, initial]);
  const submit = () => {
    const v = name.trim();
    if (!v) return;
    onSubmit(v);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} width={380} label={shownTitle}>
      <form
        className="p-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="text-[15px] font-semibold">{shownTitle}</div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-4 w-full h-9 px-3 rounded-[var(--rs)] border-0 bg-transparent text-[13.5px] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_1px_var(--focus-line)] selectable"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-8 px-3.5 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[13px] text-[var(--ink-muted)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]">
            {t("ui.common.cancel")}
          </button>
          <button type="submit" disabled={!name.trim()} className="h-8 px-3.5 rounded-[var(--rs)] border-0 cursor-pointer text-[13px] bg-[var(--accent)] text-[var(--accent-ink)] disabled:opacity-40">
            {shownConfirm}
          </button>
        </div>
      </form>
    </Modal>
  );
}
