import { useEffect, useState } from "react";
import {
  AppBar,
  Sidebar,
  SidebarItem,
  SidebarHead,
  ActivityRow,
  Mark,
  IconBtn,
  PageHost,
  Notices,
  NoticeProvider,
  createNav,
  applyAppearance,
  useI18n,
  useNotify,
  hostWindowControls,
  markReady,
  type IconName,
  type ThemeMode,
} from "./trm";
import { OverviewPage } from "./pages/OverviewPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { PatternsPage } from "./pages/PatternsPage";
import { TypePage } from "./pages/TypePage";
import { ColorPage } from "./pages/ColorPage";
import { MotionPage } from "./pages/MotionPage";
import { InteractionPage } from "./pages/InteractionPage";

/**
 * 导航顺序**就是**换页动画的方向依据：数组里靠后的页在下面。
 * 改这里的顺序，动画方向跟着改。
 */
const nav = createNav([
  { id: "overview", labelKey: "nav.overview" },
  { id: "components", labelKey: "nav.components" },
  { id: "patterns", labelKey: "nav.patterns" },
  { id: "interaction", labelKey: "nav.interaction" },
  { id: "type", labelKey: "nav.type" },
  { id: "color", labelKey: "nav.color" },
  { id: "motion", labelKey: "nav.motion" },
] as const);

type PageId = (typeof nav.defs)[number]["id"];

const ICONS: Record<PageId, IconName> = {
  overview: "home",
  components: "sliders",
  patterns: "layers",
  interaction: "chat",
  type: "book",
  color: "brush",
  motion: "play",
};

/** 窗口按钮解析一次就够 —— 它不会在运行期间从「有壳」变成「没壳」。 */
const windowControls = hostWindowControls();

/** 窗口宽度小于这个值时侧栏只留图标。 */
const NARROW = 900;

export function App() {
  return (
    <NoticeProvider>
      <Shell />
    </NoticeProvider>
  );
}

function Shell() {
  const { ready, t } = useI18n();
  const notify = useNotify();
  const [page, setPage] = useState<PageId>("overview");
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [open, setOpen] = useState(true);
  const narrow = useNarrow(NARROW);
  const collapsed = narrow || !open;

  useEffect(() => {
    applyAppearance({ themeMode: theme });
  }, [theme]);

  // 告诉壳界面活着。壳的白窗看门狗等的就是这一句 —— 12 秒内没等到，
  // 它会把「UI 从哪儿来的、处理了几个资源请求、404 了几次」写进日志。
  useEffect(markReady, []);

  return (
    <div className="h-full flex flex-col">
      <AppBar
        brand="TRM UI"
        sidebarOpen={!collapsed}
        onSidebar={() => setOpen((v) => !v)}
        windowControls={windowControls}
        actions={<IconBtn icon="search" label={t("demo.shell.search")} onClick={() => notify.tip(t("demo.shell.searchTip"))} />}
      />
      <div className="flex-1 min-h-0 flex">
        <Sidebar
          collapsed={collapsed}
          label={t("demo.shell.nav")}
          foot={<SidebarItem icon="settings" label={t("demo.shell.settings")} collapsed={collapsed} onClick={() => setPage("overview")} />}
        >
          {nav.pages().map((p) => (
            <SidebarItem key={p.id} icon={ICONS[p.id]} label={p.label} on={page === p.id} collapsed={collapsed} onClick={() => setPage(p.id)} />
          ))}
          <SidebarHead label={t("demo.shell.running")} collapsed={collapsed} />
          <Activity collapsed={collapsed} />
        </Sidebar>
        <main className="relative flex-1 min-w-0 flex flex-col">
          {ready ? (
            <PageHost nav={nav} page={page} axis="y">
              {(id) => {
                switch (id) {
                  case "overview":
                    return <OverviewPage theme={theme} onTheme={setTheme} />;
                  case "components":
                    return <ComponentsPage />;
                  case "patterns":
                    return <PatternsPage />;
                  case "interaction":
                    return <InteractionPage />;
                  case "type":
                    return <TypePage />;
                  case "color":
                    return <ColorPage />;
                  case "motion":
                    return <MotionPage />;
                }
              }}
            </PageHost>
          ) : null}
        </main>
      </div>
      <Notices />
    </div>
  );
}

/** 侧栏里两件演示用的事：一件在跑，一件做完了还没看。 */
function Activity({ collapsed }: { collapsed: boolean }) {
  const { t } = useI18n();
  const notify = useNotify();
  const [progress, setProgress] = useState(0.2);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setProgress((p) => (p >= 1 ? 0.05 : Math.min(1, p + 0.01))), 120);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      <ActivityRow
        collapsed={collapsed}
        label={t("demo.shell.taskA")}
        sub={t("demo.shell.taskASub")}
        icon={<Mark art={1} text="" glyph="image" size={20} plain />}
        status={`${Math.round(progress * 100)}%`}
        progress={progress}
        onClick={() => notify.tip(t("demo.shell.taskA"))}
      />
      <ActivityRow
        collapsed={collapsed}
        label={t("demo.shell.taskB")}
        sub={t("demo.shell.taskBSub")}
        icon={<Mark art={4} text="" glyph="audio" size={20} plain />}
        status={t("demo.shell.done")}
        fresh={!seen}
        onClick={() => setSeen(true)}
      />
    </>
  );
}

function useNarrow(px: number) {
  const [narrow, setNarrow] = useState(() => window.innerWidth < px);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px - 1}px)`);
    const fn = () => setNarrow(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [px]);
  return narrow;
}
