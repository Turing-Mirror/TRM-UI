import { useState, type ReactNode } from "react";
import { useThumb } from "../lib/thumb";

type CatalogCoverProps = {
  sources: readonly string[];
  placeholder: string;
  release?: ReactNode;
  detail?: ReactNode;
  progress?: number;
  connecting?: boolean;
};

const badge = "absolute left-2.5 text-[11px] px-1.5 py-0.5 rounded-[4px] tabular-nums text-[var(--ink)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] shadow-[inset_0_0_0_1px_var(--line)]";

function CoverImage({ sources, placeholder }: Pick<CatalogCoverProps, "sources" | "placeholder">) {
  const [index, setIndex] = useState(0);
  const src = sources[index];
  // 大图先缩成缩略图；还在生成时不画，露出底色。
  const shown = useThumb(src);
  if (src && !shown) return null;
  return src ? (
    <img key={src} src={shown} alt="" loading="lazy" referrerPolicy="no-referrer" draggable={false}
      onError={() => setIndex(current => current === index ? current + 1 : current)}
      className="absolute inset-0 h-full w-full object-contain" />
  ) : <span aria-hidden>{placeholder}</span>;
}

export function CatalogCover({ sources, placeholder, release, detail, progress, connecting }: CatalogCoverProps) {
  const usable = [...new Set(sources.filter(Boolean))];
  const width = connecting ? 33 : Math.max(0, Math.min(100, progress || 0));
  return (
    <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[var(--r)] bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] text-2xl text-[color-mix(in_srgb,var(--ink)_32%,transparent)]">
      <CoverImage key={JSON.stringify(usable)} sources={usable} placeholder={placeholder} />
      {release ? <span className={`${badge} top-2.5`}>{release}</span> : null}
      {detail ? <span className={`${badge} bottom-2.5`}>{detail}</span> : null}
      {progress !== undefined || connecting ? (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-[color-mix(in_srgb,var(--ink)_16%,transparent)]">
          <div className={`h-full bg-[var(--accent)] ${connecting ? "motion-safe:animate-pulse" : "motion-safe:transition-[width] duration-150"}`}
            style={{ width: `${width > 0 ? Math.max(width, 0.5) : 0}%` }} />
        </div>
      ) : null}
    </div>
  );
}
