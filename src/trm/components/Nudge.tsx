/**
 * 底部的一条提示：一句标题、一段说明、右边几个按钮。不是弹窗，不拦任何操作；
 * 出现时从下方浮上来，关掉时收起，下面的内容平滑补位。
 * 按钮顺序与系统对话框一致：拒绝在前，主按钮放最后。
 */
import type { ReactNode } from "react";
import { usePresence } from "./overlay";

export function Nudge({ open, title, children, actions }: { open: boolean; title: string; children: ReactNode; actions: ReactNode }) {
  const { mounted, leaving } = usePresence(open, 180);
  if (!mounted) return null;
  return (
    <div className={`grid grid-rows-[1fr] ${leaving ? "nudge-out" : "nudge-in"}`}>
      <div className={leaving ? "min-h-0 overflow-hidden" : "min-h-0"}>
        <div className="rounded-[var(--r)] bg-[var(--surface)] px-4 py-3 shadow-[var(--glass),0_0_0_1px_var(--hairline)] flex items-start gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold mb-1">{title}</div>
            <div className="text-[12.5px] text-[var(--help)] leading-relaxed">{children}</div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">{actions}</div>
        </div>
      </div>
    </div>
  );
}
