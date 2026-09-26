import { useRef, useState } from "react";
import {
  PagePad,
  PageHead,
  Block,
  Group,
  Btn,
  Field,
  Select,
  Slider,
  Toggle,
  SegmentControl,
  Tabs,
  Swap,
  Nudge,
  HotkeyInput,
  SearchBox,
  LOCALES,
  comboLabel,
  useI18n,
  useNotify,
  type LocaleCode,
  type ThemeMode,
} from "../trm";

export type Look = { theme: ThemeMode; wallpaper: string; blur: number; opacity: number };

const TABS = ["appearance", "general", "keys"] as const;
type Tab = (typeof TABS)[number];
const TAB_KEYS: Record<Tab, string> = { appearance: "demo.set.tab.appearance", general: "demo.set.tab.general", keys: "demo.set.tab.keys" };

/** 演示用的快捷键：动作、所在分组、默认组合（Windows 写法，macOS 上 CmdOrCtrl 显示为 ⌘）。 */
const HOTKEYS = [
  { id: "toggle", group: "main", labelKey: "demo.set.k.toggle", combo: "CmdOrCtrl+F1" },
  { id: "next", group: "main", labelKey: "demo.set.k.next", combo: "CmdOrCtrl+F2" },
  { id: "prev", group: "main", labelKey: "demo.set.k.prev", combo: "CmdOrCtrl+F3" },
  { id: "mute", group: "main", labelKey: "demo.set.k.mute", combo: "CmdOrCtrl+Shift+M" },
  { id: "search", group: "nav", labelKey: "demo.set.k.search", combo: "CmdOrCtrl+K" },
  { id: "back", group: "nav", labelKey: "demo.set.k.back", combo: "Alt+ArrowLeft" },
  { id: "forward", group: "nav", labelKey: "demo.set.k.forward", combo: "Alt+ArrowRight" },
] as const;
const GROUP_KEYS = { main: "demo.set.keysGroupMain", nav: "demo.set.keysGroupNav" } as const;

/**
 * 设置页的三类写法：外观（语言、主题、背景图与磨砂）、常规（关闭方式、开关、在线更新）、
 * 快捷键（逐项录制，可设为全局，可搜索）。改了需要重启才生效的，顶部出一条提示，给出「立即重启」。
 */
export function SettingsPage({ look, onLook, mouseNav, onMouseNav }: { look: Look; onLook: (l: Look) => void; mouseNav: boolean; onMouseNav: (v: boolean) => void }) {
  const { t, locale, setLocale } = useI18n();
  const notify = useNotify();
  const [tab, setTab] = useState<Tab>("appearance");
  const [banner, setBanner] = useState("");
  const [close, setClose] = useState("ask");
  const [auto, setAuto] = useState(false);
  const [compat, setCompat] = useState(false);
  const [prewarm, setPrewarm] = useState(true);
  const [stats, setStats] = useState(true);
  const [restart, setRestart] = useState(false);
  const [checking, setChecking] = useState(false);
  const [updateLine, setUpdateLine] = useState("");
  const [globalOn, setGlobalOn] = useState(true);
  const [combos, setCombos] = useState<Record<string, string>>(() => Object.fromEntries(HOTKEYS.map((h) => [h.id, h.combo])));
  const [global, setGlobal] = useState<Record<string, boolean>>({ toggle: true, next: true, prev: true, mute: true });
  const [q, setQ] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const setCombo = (id: string, combo: string) => {
    const taken = combo ? HOTKEYS.find((h) => h.id !== id && combos[h.id] === combo) : undefined;
    setCombos((c) => ({ ...c, [id]: combo, ...(taken ? { [taken.id]: "" } : {}) }));
    if (taken) notify.tip(t("demo.set.moved", { combo: comboLabel(combo), from: t(taken.labelKey) }));
  };
  const shown = HOTKEYS.filter((h) => !q.trim() || t(h.labelKey).toLowerCase().includes(q.trim().toLowerCase()));
  const check = () => {
    setChecking(true);
    setUpdateLine("");
    window.setTimeout(() => {
      setChecking(false);
      setUpdateLine(t("demo.set.latest"));
    }, 1200);
  };

  return (
    <PagePad>
      <PageHead title={t("nav.settings")} sub={t("demo.set.sub")} />
      <div className="mt-4">
        <Tabs value={tab} onChange={setTab} options={TABS.map((id) => ({ id, label: t(TAB_KEYS[id]) }))} />
      </div>

      {/* 改了需要重启才生效的设置：顶部一条提示，可以立即重启，也可以稍后 */}
      <div className="mt-4">
        <Nudge
          open={restart}
          title={t("demo.set.restartTitle")}
          actions={
            <>
              <Btn onClick={() => setRestart(false)}>{t("demo.set.restartLater")}</Btn>
              <Btn
                primary
                onClick={() => {
                  setRestart(false);
                  notify.tip(t("demo.set.restarted"));
                }}
              >
                {t("demo.set.restartNow")}
              </Btn>
            </>
          }
        >
          {t("demo.set.restartBody")}
        </Nudge>
      </div>

      <Swap k={tab} className="mt-2">
        {tab === "appearance" ? (
          <Block title={t("demo.set.tab.appearance")}>
            <Group>
              <div className="py-4 flex flex-col gap-6">
                <Field inline label={t("demo.set.language")} control={<Select value={locale} onChange={(v) => setLocale(v as LocaleCode)} options={LOCALES.map((l) => ({ id: l.id, label: t(l.labelKey) }))} width={180} />} />
                <Field
                  inline
                  label={t("demo.set.theme")}
                  control={
                    <SegmentControl
                      value={look.theme}
                      onChange={(v) => onLook({ ...look, theme: v as ThemeMode })}
                      options={[
                        { id: "system", label: t("demo.set.themeSystem") },
                        { id: "light", label: t("demo.set.themeLight") },
                        { id: "dark", label: t("demo.set.themeDark") },
                      ]}
                    />
                  }
                />
                <Field
                  inline
                  label={t("demo.set.wallpaper")}
                  note={t("demo.set.wallpaperNote")}
                  control={
                    <span className="flex items-center gap-2">
                      <span className="text-[12.5px] text-[var(--meta)] max-w-[160px] truncate">{look.wallpaper ? t("demo.set.wallpaperSet") : t("demo.set.none")}</span>
                      <Btn onClick={() => file.current?.click()}>{t("demo.set.pick")}</Btn>
                      {look.wallpaper ? <Btn onClick={() => onLook({ ...look, wallpaper: "" })}>{t("demo.set.clear")}</Btn> : null}
                      <input
                        ref={file}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onLook({ ...look, wallpaper: URL.createObjectURL(f) });
                          e.target.value = "";
                        }}
                      />
                    </span>
                  }
                />
                <Field label={t("demo.set.blur")} control={<Slider value={look.blur} min={0} max={100} step={1} onChange={(v) => onLook({ ...look, blur: v })} />} />
                <Field label={t("demo.set.opacity")} control={<Slider value={look.opacity} min={0} max={100} step={1} onChange={(v) => onLook({ ...look, opacity: v })} />} />
                <Field
                  label={t("demo.set.banner")}
                  note={t("demo.set.bannerHint")}
                  control={
                    <input
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      placeholder={t("demo.set.bannerPh")}
                      className="w-full max-w-[420px] text-[13px] text-[var(--ink)] bg-transparent px-3.5 py-2 rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_1px_var(--accent)]"
                    />
                  }
                />
              </div>
            </Group>
          </Block>
        ) : tab === "general" ? (
          <Block title={t("demo.set.tab.general")}>
            <Group>
              <div className="py-4 flex flex-col gap-6">
                <Field
                  inline
                  label={t("demo.set.close")}
                  control={
                    <Select
                      value={close}
                      onChange={setClose}
                      width={160}
                      options={[
                        { id: "ask", label: t("demo.set.closeAsk") },
                        { id: "tray", label: t("demo.set.closeTray") },
                        { id: "quit", label: t("demo.set.closeQuit") },
                      ]}
                    />
                  }
                />
                <Field inline label={t("demo.set.autostart")} control={<Toggle checked={auto} onChange={setAuto} label={t("demo.set.autostart")} />} />
                <Field
                  inline
                  label={t("demo.set.compat")}
                  tip={t("demo.set.compatTip")}
                  control={
                    <Toggle
                      checked={compat}
                      onChange={(v) => {
                        setCompat(v);
                        setRestart(true);
                      }}
                      label={t("demo.set.compat")}
                    />
                  }
                />
                <Field inline label={t("demo.set.prewarm")} note={t("demo.set.prewarmDesc")} control={<Toggle checked={prewarm} onChange={setPrewarm} label={t("demo.set.prewarm")} />} />
                <Field inline label={t("demo.set.stats")} note={t("demo.set.statsDesc")} control={<Toggle checked={stats} onChange={setStats} label={t("demo.set.stats")} />} />
                <Field inline label={t("demo.set.mouse")} note={t("demo.set.mouseDesc")} control={<Toggle checked={mouseNav} onChange={onMouseNav} label={t("demo.set.mouse")} />} />
                <Field
                  inline
                  label={t("demo.set.update")}
                  desc={updateLine || t("demo.set.version", { v: "1.6.0" })}
                  control={<Btn busy={checking} onClick={check}>{checking ? t("demo.set.checking") : t("demo.set.check")}</Btn>}
                />
              </div>
            </Group>
          </Block>
        ) : (
          <Block title={t("demo.set.tab.keys")} action={<Toggle checked={globalOn} onChange={setGlobalOn} label={t("demo.set.keysOn")} />}>
            <div className="max-w-[360px] mb-3">
              <SearchBox value={q} onChange={setQ} />
            </div>
            <Group>
              <div className="py-2">
                {shown.length === 0 ? <p className="m-0 py-3 text-[12.5px] text-[var(--meta)]">{t("demo.set.keysNone")}</p> : null}
                {(["main", "nav"] as const).map((g) => {
                  const rows = shown.filter((h) => h.group === g);
                  if (!rows.length) return null;
                  return (
                    <div key={g} className="py-1">
                      <p className="m-0 pt-2 pb-1 text-[12px] text-[var(--meta)]">{t(GROUP_KEYS[g])}</p>
                      {rows.map((h) => (
                        <div key={h.id} className={`flex items-center gap-3 py-2 ${globalOn ? "" : "opacity-50"}`}>
                          <span className="text-[13px]">{t(h.labelKey)}</span>
                          <span className="ml-auto flex items-center gap-3">
                            {combos[h.id] !== h.combo ? (
                              <button type="button" onClick={() => setCombo(h.id, h.combo)} className="h-7 px-2 rounded-[var(--rs)] border-0 bg-transparent cursor-pointer text-[12px] text-[var(--meta)] hover:text-[var(--ink)]">
                                {t("demo.set.reset")}
                              </button>
                            ) : null}
                            {g === "main" ? (
                              <label className="flex items-center gap-1.5 text-[12px] text-[var(--meta)] cursor-pointer select-none" title={t("demo.set.globalTip")}>
                                <input type="checkbox" checked={global[h.id] ?? false} onChange={(e) => setGlobal((x) => ({ ...x, [h.id]: e.target.checked }))} className="w-[13px] h-[13px]" />
                                {t("demo.set.global")}
                              </label>
                            ) : null}
                            <HotkeyInput value={combos[h.id]} onChange={(c) => setCombo(h.id, c)} label={t(h.labelKey)} />
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </Group>
            <p className="mt-3 mb-0 text-[12px] text-[var(--help)] leading-relaxed">{t("demo.set.keysHint")}</p>
          </Block>
        )}
      </Swap>

    </PagePad>
  );
}
