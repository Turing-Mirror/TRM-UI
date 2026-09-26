/**
 * 勾选清单：每一项写明大小与选中后的影响，底部汇总已选几项、共多少，按一个按钮一次处理。
 * 用在清理存储这类不可撤销的操作上：影响写在勾选框旁边，不只在确认框里说一次；
 * 空的项不可勾；不提供「全选」，误删一次就是不可挽回的信任损失。
 * 分组由 group 给出，同组的排在一起，组名写在上面。
 */
import type { ReactNode } from "react";
import { Btn } from "./ui";

export type PickItem = { id: string; label: string; effect?: string; size: number; group?: string; indent?: boolean };

export function PickList({
  items,
  picked,
  onToggle,
  format,
  summary,
  action,
  busy = false,
  onApply,
  groupLabel,
}: {
  items: PickItem[];
  picked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /** 把大小写成人看的字，比如 1.2 GB。 */
  format: (n: number) => string;
  /** 底部那行字：已选几项、共多少。 */
  summary: (count: number, total: number) => ReactNode;
  action: string;
  busy?: boolean;
  onApply: () => void;
  groupLabel?: (group: string) => ReactNode;
}) {
  const total = items.filter((x) => picked.has(x.id)).reduce((n, x) => n + x.size, 0);
  let lastGroup: string | undefined;
  return (
    <div className="bg-[var(--group)] rounded-[var(--r)] px-5 py-4">
      <ul className="m-0 list-none p-0 flex flex-col">
        {items.map((x) => {
          const head = x.group !== undefined && x.group !== lastGroup && groupLabel ? groupLabel(x.group) : null;
          lastGroup = x.group;
          const empty = x.size === 0;
          return (
            <li key={x.id}>
              {head ? <div className="mt-3 first:mt-0 mb-1 text-[12.5px] font-medium">{head}</div> : null}
              <label className={`flex items-center gap-2.5 py-1.5 text-[13px] ${x.indent ? "pl-4" : ""} ${empty ? "opacity-45" : "cursor-pointer"}`}>
                <input type="checkbox" className="w-[14px] h-[14px] flex-none accent-[var(--accent)]" disabled={empty || busy} checked={picked.has(x.id)} onChange={() => onToggle(x.id)} />
                <span>{x.label}</span>
                {x.effect ? <span className="text-[11.5px] text-[var(--meta)]">{x.effect}</span> : null}
                <span className="ml-auto font-mono text-[11.5px] text-[var(--meta)] tabular-nums">{format(x.size)}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 pt-3 flex items-center gap-3 shadow-[0_-1px_0_var(--hairline)]">
        <span className="text-[12.5px] text-[var(--meta)]" role="status">{summary(picked.size, total)}</span>
        <span className="ml-auto">
          <Btn primary busy={busy} disabled={busy || picked.size === 0} onClick={onApply}>{action}</Btn>
        </span>
      </div>
    </div>
  );
}
