/**
 * 一行报错。正文只留真正有用的那一行（长篇报错取最后一行异常，普通多行取第一行），
 * 其余收进「详情」；「复制完整错误」一按就有，一个字都不少。配得上动作的，多给一个按钮。
 */
import { useState } from "react";
import { useI18n } from "../i18n";
import { copyText } from "../lib/clipboard";
import { Btn } from "./ui";

/** 把一长段报错拆成「正文 + 详情」。 */
export function splitErrorText(text: string): { head: string; detail: string; hasMore: boolean } {
  const raw = text || "";
  const lines = raw.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
  if (!lines.length) return { head: raw, detail: "", hasMore: false };
  const looksTrace = /^traceback\b/i.test(lines[0].trim()) || lines.some((l) => /^\s*(File\s+".+"|at\s+\S+\s+\()/.test(l));
  if (looksTrace) {
    let last = lines[lines.length - 1].trim();
    for (let i = lines.length - 1; i >= 0; i--) {
      const ln = lines[i].trim();
      if (ln.startsWith("File ") || ln.startsWith("at ") || /^traceback\b/i.test(ln)) continue;
      last = ln;
      break;
    }
    return { head: last, detail: raw, hasMore: true };
  }
  return { head: lines[0], detail: lines.slice(1).join("\n"), hasMore: lines.length > 1 };
}

export function ErrorNote({ text, action }: { text: string; action?: { label: string; run: () => void } | null }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  const { head, detail, hasMore } = splitErrorText(text);
  return (
    <div className="mt-3">
      <p className="m-0 text-[12.5px] text-[var(--danger)] break-words leading-relaxed select-text">{head}</p>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {action ? <Btn primary onClick={action.run}>{action.label}</Btn> : null}
        {hasMore ? <Btn onClick={() => setOpen(!open)}>{t(open ? "ui.errorNote.hide" : "ui.errorNote.show")}</Btn> : null}
        <Btn
          onClick={() =>
            void copyText(text).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            })
          }
        >
          {t(copied ? "ui.errorNote.copied" : "ui.errorNote.copy")}
        </Btn>
      </div>
      {open && detail ? <pre className="fade-in mt-2 max-h-[220px] overflow-auto rounded-[var(--rs)] bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] p-3 text-[11.5px] leading-relaxed text-[var(--ink-muted)] whitespace-pre-wrap select-text">{detail}</pre> : null}
    </div>
  );
}
