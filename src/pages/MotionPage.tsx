import { PagePad, PageHead, Block, Group, ListItem, useI18n } from "../trm";

const CURVES = [
  { token: "--ease-nav", value: "cubic-bezier(0.32, 0.72, 0, 1)", noteKey: "demo.motion.easeNav" },
  { token: "--spring", value: "cubic-bezier(0.34, 1.42, 0.64, 1)", noteKey: "demo.motion.spring" },
  { token: "--ease", value: "cubic-bezier(0.22, 1, 0.36, 1)", noteKey: "demo.motion.ease" },
] as const;

export function MotionPage() {
  const { t } = useI18n();
  return (
    <PagePad>
      <PageHead title={t("nav.motion")} sub={t("demo.motion.sub")} />

      <Block title={t("demo.motion.curves")}>
        <Group>
          {CURVES.map((c) => (
            <ListItem key={c.token} meta={c.value} title={c.token} desc={t(c.noteKey)} />
          ))}
        </Group>
      </Block>

      <Block title={t("demo.motion.reduce")}>
        <Group>
          <div className="py-4 flex items-center gap-4">
            {/* 不确定进度条：不知道要多久，只表示「在动」。 */}
            <div className="relative flex-1 h-1 rounded-full overflow-hidden bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
              <span className="trm-bar-indeterminate absolute inset-y-0 left-0 w-1/4 rounded-full bg-[var(--accent)]" />
            </div>
            <span aria-hidden className="btn-dots text-[var(--ink-muted)]" />
          </div>
        </Group>
      </Block>
    </PagePad>
  );
}
