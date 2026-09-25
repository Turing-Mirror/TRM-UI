import { PagePad, PageHead, Block, Group, useI18n } from "../trm";

const CORE = ["--bg", "--surface", "--rail", "--group", "--stage", "--page-bg", "--scrim"];
const INK = ["--ink", "--ink-muted", "--help", "--meta", "--hairline", "--line", "--focus-line"];
const ACCENT = ["--accent", "--accent-ink", "--accent-soft", "--knob", "--notify"];
const STATE = ["--ok", "--ok-soft", "--warn", "--warn-ink", "--danger", "--danger-soft"];
const ART = ["--art-1", "--art-2", "--art-3", "--art-4", "--art-5", "--art-6"];

/**
 * 色板直接把 CSS 变量画出来，不硬编码任何十六进制值 —— 这样切主题时这一页
 * 自己就跟着变，也就顺便证明了令牌确实是活的。
 */
function Swatch({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-9 h-9 rounded-[var(--rs)] flex-none shadow-[inset_0_0_0_1px_var(--hairline)]" style={{ background: `var(${name})` }} />
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
      <Block title={t("demo.color.groupState")}>
        <Row names={STATE} />
      </Block>
      <Block title={t("demo.color.groupArt")}>
        <Row names={ART} />
      </Block>
    </PagePad>
  );
}
