/**
 * 分步引导：一次只做一件事，做完点下一步。每一步是否完成由外面按真实状态给出，
 * 不靠用户自己勾。需要去别处办的事，先把引导收成右下角的一个小按钮（WizardPill），
 * 办完点它回来，停在原来那一步。
 */
import { type CSSProperties, type ReactNode, useState } from "react";
import { useI18n } from "../i18n";
import { Btn } from "./ui";
import { Modal } from "./overlay";

export type WizardStep = {
  id: string;
  title: string;
  /** 这一步已按真实状态完成。完成的一段进度条是满的，「下一步」变成主按钮。 */
  done?: boolean;
  body: ReactNode;
};

export function Wizard({
  open,
  title,
  steps,
  step,
  onStep,
  onMinimize,
  onFinish,
}: {
  open: boolean;
  title: string;
  steps: WizardStep[];
  step: string;
  onStep: (id: string) => void;
  /** 收起成小按钮，稍后继续。 */
  onMinimize: () => void;
  onFinish: () => void;
}) {
  const { t } = useI18n();
  // 换步的方向：往后翻从右边进，往前翻从左边进
  const [dir, setDir] = useState<1 | -1>(1);
  const index = Math.max(0, steps.findIndex((s) => s.id === step));
  const cur = steps[index];
  const last = index === steps.length - 1;
  const go = (to: number) => {
    const i = Math.max(0, Math.min(steps.length - 1, to));
    setDir(i > index ? 1 : -1);
    onStep(steps[i].id);
  };
  return (
    <Modal open={open} onClose={onMinimize} width={600} label={title}>
      <div className="p-7">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[22px] font-semibold m-0">{title}</h2>
          <span className="text-[12.5px] text-[var(--meta)]">{t("ui.wizard.count", { n: index + 1, total: steps.length })}</span>
          <button type="button" onClick={onMinimize} className="ml-auto border-0 bg-transparent p-0 text-[12.5px] text-[var(--meta)] hover:text-[var(--ink)] cursor-pointer">
            {t("ui.wizard.later")}
          </button>
        </div>
        <div className="mt-5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => (
            <button key={s.id} type="button" onClick={() => go(i)} aria-current={i === index ? "step" : undefined} className="group border-0 bg-transparent p-0 text-left cursor-pointer">
              <span className="block h-1 rounded-full overflow-hidden bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
                <span
                  className="block h-full rounded-full bg-[var(--accent)] origin-left transition-transform duration-500 ease-[var(--ease)]"
                  style={{ transform: `scaleX(${s.done || i < index ? 1 : i === index ? 0.5 : 0})` }}
                />
              </span>
              <span className={`block mt-2 text-[11.5px] truncate transition-colors ${i === index ? "text-[var(--ink)] font-medium" : "text-[var(--meta)] group-hover:text-[var(--ink-muted)]"}`}>{s.title}</span>
            </button>
          ))}
        </div>
        <div className="relative mt-6 min-h-[220px]">
          <div key={cur?.id} className="wizard-step" style={{ "--dir": dir } as CSSProperties}>
            {cur?.body}
          </div>
        </div>
        <div className="mt-7 flex items-center gap-2">
          {index > 0 ? <Btn onClick={() => go(index - 1)}>{t("ui.wizard.prev")}</Btn> : null}
          <span className="flex-1" />
          {!last && !cur?.done ? <Btn onClick={() => go(index + 1)}>{t("ui.wizard.skip")}</Btn> : null}
          {last ? (
            <Btn primary onClick={onFinish}>{t("ui.wizard.finish")}</Btn>
          ) : (
            <Btn primary={Boolean(cur?.done)} onClick={() => go(index + 1)}>{t("ui.wizard.next")}</Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** 引导收起后留在右下角的小按钮：点它回到引导，叉号表示不再需要。 */
export function WizardPill({ label, detail, onOpen, onClose }: { label: string; detail?: string; onOpen: () => void; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="wizard-pill fixed right-5 bottom-5 z-[40] flex items-center rounded-full bg-[var(--surface)] shadow-[var(--pop-shadow)]">
      <button type="button" onClick={onOpen} className="h-10 pl-4 pr-2 border-0 bg-transparent cursor-pointer text-[13px] text-[var(--ink)]">
        {label}
        {detail ? <span className="ml-2 text-[12px] text-[var(--meta)]">{detail}</span> : null}
      </button>
      <button type="button" onClick={onClose} aria-label={t("ui.wizard.close")} title={t("ui.wizard.close")} className="h-10 w-9 grid place-items-center border-0 bg-transparent cursor-pointer text-[var(--meta)] hover:text-[var(--ink)] rounded-full">
        ×
      </button>
    </div>
  );
}
