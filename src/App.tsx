import { useEffect, useState } from "react";
import {
  TitleBar,
  PageHost,
  createNav,
  applyAppearance,
  useI18n,
  hostWindowControls,
  markReady,
  type ThemeMode,
} from "./trm";
import { OverviewPage } from "./pages/OverviewPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { TypePage } from "./pages/TypePage";
import { ColorPage } from "./pages/ColorPage";
import { MotionPage } from "./pages/MotionPage";

/**
 * 导航顺序**就是**换页动画的方向依据：数组里靠后的页在右边。
 * 改这里的顺序，动画方向跟着改；顺序和标题栏上看到的不一致，
 * 用户的手感就会和动画反着来。
 */
const nav = createNav([
  { id: "overview", labelKey: "nav.overview" },
  { id: "components", labelKey: "nav.components" },
  { id: "type", labelKey: "nav.type" },
  { id: "color", labelKey: "nav.color" },
  { id: "motion", labelKey: "nav.motion", badge: true },
] as const);

type PageId = (typeof nav.defs)[number]["id"];

/** 窗口按钮解析一次就够 —— 它不会在运行期间从「有壳」变成「没壳」。 */
const windowControls = hostWindowControls();

export function App() {
  const { ready } = useI18n();
  const [page, setPage] = useState<PageId>("overview");
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    applyAppearance({ themeMode: theme });
  }, [theme]);

  // 告诉壳界面活着。壳的白窗看门狗等的就是这一句 —— 12 秒内没等到，
  // 它会把「UI 从哪儿来的、处理了几个资源请求、404 了几次」写进日志。
  useEffect(markReady, []);

  // 语言还没从存储里读出来时先不画正文，免得闪一下默认语言。
  // 标题栏照画：窗口框架先出来，观感上比整屏空白好。
  return (
    <div className="h-full flex flex-col">
      <TitleBar
        brand="TRM UI"
        nav={nav}
        page={page}
        onPage={setPage}
        badges={{ motion: true }}
        windowControls={windowControls}
      />
      {ready ? (
        <PageHost nav={nav} page={page}>
          {(id) => {
            switch (id) {
              case "overview":
                return <OverviewPage theme={theme} onTheme={setTheme} />;
              case "components":
                return <ComponentsPage />;
              case "type":
                return <TypePage />;
              case "color":
                return <ColorPage />;
              case "motion":
                return <MotionPage />;
            }
          }}
        </PageHost>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
