import { useState } from "react";
import {
  AppBar, PageHead, PagePad, Row, RowGroup, Sidebar, SidebarBrand, SidebarItem, Switch, useI18n,
} from "../trm";

/** 同一内容用于概览与规则对照，避免两个示范逐渐变成不同的外壳。 */
export function WebShellDemo({ desktop = false, compact = false }: { desktop?: boolean; compact?: boolean }) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(compact);
  const [page, setPage] = useState("nav.overview");
  const [enabled, setEnabled] = useState(true);
  const toggle = () => setCollapsed((v) => !v);
  const brand = t("demo.webShell.brand");
  return (
    <div className="page-shell h-[320px] flex flex-col overflow-hidden rounded-[var(--r)] border border-[var(--line)]">
      {desktop ? <AppBar brand={brand} sidebarOpen={!collapsed} onSidebar={toggle} /> : null}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          collapsed={collapsed}
          label={t("demo.webShell.title")}
          head={!desktop ? <SidebarBrand brand={brand} collapsed={collapsed} onToggle={toggle} /> : undefined}
          foot={<>
            <SidebarItem
              icon="settings" label={t("nav.settings")} collapsed={collapsed}
              on={page === "nav.settings"} onClick={() => setPage("nav.settings")}
            />
            {!collapsed ? <span className="px-3 text-xs text-[var(--meta)]">{t("demo.webShell.status")}</span> : null}
          </>}
        >
          <SidebarItem
            icon="home" label={t("nav.overview")} collapsed={collapsed}
            on={page === "nav.overview"} onClick={() => setPage("nav.overview")}
          />
          <SidebarItem
            icon="grid" label={t("nav.components")} collapsed={collapsed}
            on={page === "nav.components"} onClick={() => setPage("nav.components")}
          />
        </Sidebar>
        <section className={desktop ? "page-workspace flex-1 min-w-0 overflow-y-auto" : "page-workspace-flush"}>
          <PagePad>
            <PageHead title={t(page)} sub={t("demo.webShell.sub")} />
            {page === "nav.overview" ? (
              <p className="text-sm text-[var(--ink-muted)] whitespace-pre-line">{t("demo.overview.whatBody")}</p>
            ) : (
              <RowGroup>
                <Row title={t("demo.set.prewarm")} control={
                  <Switch checked={enabled} onChange={setEnabled} label={t("demo.set.prewarm")} />
                } />
              </RowGroup>
            )}
          </PagePad>
        </section>
      </div>
    </div>
  );
}
