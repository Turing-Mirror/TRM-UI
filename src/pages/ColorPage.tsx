import { PagePad, PageHead, Block, Group, useI18n } from "../trm";

const CORE = ["--bg", "--surface", "--group", "--stage", "--page-bg"];
const INK = ["--ink", "--ink-muted", "--help", "--meta", "--hairline", "--line"];
const ACCENT = ["--accent", "--accent-ink", "--accent-soft", "--knob", "--notify"];

/**
 * 色板直接把 CSS 变量画出来，不硬编码任何十六进制值 —— 这样切主题时这一页
 * 自己就跟着变，也就顺便证明了令牌确实是活的。
 */
function Swatch({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className="w-9 h-9 rounded-[var(--rs)] flex-none shadow-[inset_0_0_0_1px_var(--hairline)]"
        style={{ background: `var(${name})` }}
      />
      <code className="text-[12.5px] text-[var(--ink-muted)] select-text">{name}</code>
    </div>
  );
}

function Row({ names }: { names: string[] }) {
  return (
    <Group>
      <div className="py-2 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-x-6">
        {names.map((n) => (
          <Swatch key={n} name={n} />
        ))}
      </div>
    </Group>
  );
}

export function ColorPage() {
  const { t } = useI18n();
  return (
    <PagePad>
      <PageHead title={t("nav.color")} sub={t("demo.color.sub")} />
      <Block title={t("demo.color.groupCore")}>
        <Row names={CORE} />
      </Block>
      <Block title={t("demo.color.groupInk")}>
        <Row names={INK} />
      </Block>
      <Block title={t("demo.color.groupAccent")}>
        <Row names={ACCENT} />
      </Block>
    </PagePad>
  );
}
