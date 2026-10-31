/**
 * 分步引导：一次只做一件事，做完点下一步。每一步是否完成由外面按真实状态给出，
 * 不靠用户自己勾。需要去别处办的事，先把引导收成右下角的一个小按钮（WizardPill），
 * 办完点它回来，停在原来那一步。
 *
 * 可以在步骤之前放一页须知（notice）：例如出了问题去哪里反馈。须知停留几秒后才能
 * 确认，确认过的由外面记住，下次不再出现。
 */
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
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

export type WizardNotice = {
  title: string;
  body: ReactNode;
  /** 放在正文右侧的内容，例如二维码。窄窗口时落到正文下方。 */
  aside?: ReactNode;
  /** 左下角的附加按钮，例如打开问题反馈页。 */
  actions?: ReactNode;
  /** 至少停留几秒才能确认。 */
  seconds?: number;
  onAck: () => void;
};

export function Wizard({
  open,
  title,
  steps,
  step,
  onStep,
  onMinimize,
  onFinish,
  notice,
}: {
  open: boolean;
  title: string;
  steps: WizardStep[];
  step: string;
  onStep: (id: string) => void;
  /** 收起成小按钮，稍后继续。 */
  onMinimize: () => void;
  onFinish: () => void;
  /** 有它就先显示须知，确认后才进入步骤。 */
  notice?: WizardNotice;
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
      {notice ? <NoticeBody notice={notice} /> : <div className="p-7">
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
      </div>}
    </Modal>
  );
}

/** 须知页：停够 seconds 秒才能确认。 */
function NoticeBody({ notice }: { notice: WizardNotice }) {
  const { t } = useI18n();
  const [left, setLeft] = useState(notice.seconds ?? 5);
  useEffect(() => {
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left]);
  return (
    <div className="p-7 wizard-step" style={{ "--dir": 1 } as CSSProperties}>
      <h2 className="text-[22px] font-semibold m-0">{notice.title}</h2>
      <div className="mt-5 flex gap-6 items-start max-[560px]:flex-col">
        <div className="flex-1 min-w-0 text-[13.5px] text-[var(--ink)] leading-relaxed">{notice.body}</div>
        {notice.aside ? <div className="flex-none">{notice.aside}</div> : null}
      </div>
      <div className="mt-7 flex items-center gap-2">
        {notice.actions}
        <span className="flex-1" />
        <Btn primary disabled={left > 0} onClick={notice.onAck}>
          {left > 0 ? t("ui.wizard.noticeWait", { n: left }) : t("ui.wizard.noticeOk")}
        </Btn>
      </div>
    </div>
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
