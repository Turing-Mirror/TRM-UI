import { useI18n } from "../i18n";
import { Btn } from "./ui";

export type ResourceDownloadRowProps = {
  title: string;
  description?: string;
  detail?: string;
  recommended?: boolean;
  installed?: boolean;
  downloading?: boolean;
  removing?: boolean;
  disabled?: boolean;
  progress?: { done?: number; total?: number; message?: string };
  onDownload: () => void;
  onRemove: () => void;
};

export function ResourceDownloadRow({
  title, description, detail, recommended, installed, downloading, removing,
  disabled, progress, onDownload, onRemove,
}: ResourceDownloadRowProps) {
  const { t } = useI18n();
  const pct = progress?.total && progress.total > 0
    ? Math.round(Math.min(1, Math.max(0, (progress.done ?? 0) / progress.total)) * 100)
    : undefined;
  return (
    <div className="py-3.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-[1_1_10rem]">
          <div className="text-[14px] leading-snug">
            {title}
            {recommended ? <span className="ml-1.5 text-[11px] font-medium text-[var(--accent)]">{t("ui.download.recommended")}</span> : null}
          </div>
          {description ? <div className="mt-1 text-[12.5px] leading-snug text-[var(--meta)]">{description}</div> : null}
          {detail ? <div className="mt-1 text-[12px] tabular-nums text-[var(--meta)]">{detail}</div> : null}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {installed ? <span className="px-1 text-[13px] text-[var(--ink-muted)]">{t("ui.download.installed")}</span> : null}
          <Btn className="min-w-[72px]" disabled={disabled || downloading || removing} onClick={installed ? onRemove : onDownload}>
            {installed
              ? t(removing ? "ui.download.removing" : "ui.download.remove")
              : t(downloading ? "ui.download.downloading" : "ui.download.download")}
          </Btn>
        </div>
      </div>
      {downloading && progress ? (
        <div className="mt-2">
          <div role="progressbar" aria-label={title} aria-valuenow={pct}
            className="h-1 w-full overflow-hidden rounded bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]">
            <div className="h-full bg-[var(--accent)] transition-[width] duration-200" style={{ width: `${pct ?? 0}%` }} />
          </div>
          <p className="m-0 mt-1.5 text-[12px] text-[var(--meta)]">
            {progress.message} {pct !== undefined && pct > 0 ? `${pct}%` : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
