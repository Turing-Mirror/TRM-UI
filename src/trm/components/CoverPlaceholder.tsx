import { artInitial, artOf } from "../lib/art";

type CoverPlaceholderProps = {
  /** 显示用的名称，取首字。 */
  name: string;
  /** 决定底色的标识；不传时用名称。同名不同版本的条目传各自的 id，底色就能分开。 */
  seed?: string;
  className?: string;
};

/** 没有封面图时的占位：名称首字压在由标识算出来的预览色上。铺满最近的定位父级。 */
export function CoverPlaceholder({ name, seed, className }: CoverPlaceholderProps) {
  return (
    <span aria-hidden className={`absolute inset-0 grid place-items-center text-[var(--art-ink)] ${className ?? ""}`}
      style={{ background: artOf(seed || name) }}>
      {artInitial(name)}
    </span>
  );
}
