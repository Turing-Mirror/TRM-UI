import { useEffect, useState } from "react";
import { Block, Btn, Ring, PickList, Swap, SearchBox, Slider, stagger, useI18n, useNotify, type PickItem } from "../trm";

const GB = 1024 ** 3;
const MB = 1024 ** 2;

function human(n: number) {
  if (n >= GB) return `${(n / GB).toFixed(2)} GB`;
  if (n >= MB) return `${(n / MB).toFixed(1)} MB`;
  return `${Math.round(n / 1024)} KB`;
}

const SOURCES = ["s1", "s2"] as const;
const SOURCE_KEYS = { s1: "demo.more.source1", s2: "demo.more.source2" } as const;
/** 演示用的条目：编号、所属来源、时长（秒）。名字由语言包给出。 */
const ENTRIES = [
  { id: "e1", key: "demo.more.e1", no: 1, src: "s1", sec: 2.4 },
  { id: "e2", key: "demo.more.e2", no: 2, src: "s1", sec: 1.1 },
  { id: "e3", key: "demo.more.e3", no: 3, src: "s2", sec: 5.0 },
  { id: "e4", key: "demo.more.e4", no: null, src: "s2", sec: 3.2 },
  { id: "e5", key: "demo.more.e5", no: null, src: "s1", sec: 0.8 },
] as const;

/**
 * 三栏：左侧来源，中间列表（单击选中、双击执行），右侧编辑所选一项；
 * 底部固定正在进行的内容，列表多长都不会被挤走。左右两栏随页面滚动时贴在顶上。
 */
export function ListEditPattern() {
  const { t } = useI18n();
  const [src, setSrc] = useState("");
  const [sel, setSel] = useState("");
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState<{ id: string; at: number } | null>(null);
  const [vol, setVol] = useState(80);
  useEffect(() => {
    if (!playing) return;
    const entry = ENTRIES.find((e) => e.id === playing.id);
    const id = window.setInterval(() => setPlaying((p) => (p && entry && p.at < entry.sec ? { ...p, at: Math.min(entry.sec, p.at + 0.1) } : null)), 100);
    return () => window.clearInterval(id);
  }, [playing]);
  const shown = ENTRIES.filter((e) => (!src || e.src === src) && (!q || t(e.key).includes(q)));
  const cur = ENTRIES.find((e) => e.id === sel);
  const now = playing ? ENTRIES.find((e) => e.id === playing.id) : undefined;
  return (
    <Block title={t("demo.more.board")} note={t("demo.more.boardSub")}>
      <div className="grid grid-cols-[150px_minmax(0,1fr)_minmax(220px,280px)] gap-5 items-start max-[900px]:grid-cols-[minmax(0,1fr)_minmax(200px,240px)]">
        <aside className="flex flex-col gap-0.5 max-[900px]:hidden">
          {["", ...SOURCES].map((s) => (
            <button key={s || "all"} type="button" aria-pressed={src === s} onClick={() => { setSrc(s); setSel(""); }} className={`flex items-center px-2.5 py-1.5 rounded-[var(--rs)] border-0 cursor-pointer text-left text-[13px] transition-colors ${src === s ? "bg-[color-mix(in_srgb,var(--ink)_7%,transparent)] text-[var(--ink)] font-medium" : "bg-transparent text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_4%,transparent)]"}`}>
              <span className="truncate">{s ? t(SOURCE_KEYS[s as keyof typeof SOURCE_KEYS]) : t("demo.more.all")}</span>
              <span className="ml-auto text-[11px] text-[var(--meta)] font-normal tabular-nums">{ENTRIES.filter((e) => !s || e.src === s).length}</span>
            </button>
          ))}
        </aside>
        <section className="min-w-0">
          <SearchBox value={q} onChange={setQ} />
          <div className="mt-1.5 px-3 text-[11.5px] text-[var(--meta)] text-right">{t("demo.more.dbl")}</div>
          <Swap k={src} className="mt-1">
            <div className="bg-[var(--group)] rounded-[var(--r)] p-1.5">
              {shown.map((e) => (
                <button key={e.id} type="button" aria-pressed={sel === e.id} onClick={() => setSel(e.id)} onDoubleClick={() => setPlaying({ id: e.id, at: 0 })} className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--rs)] border-0 cursor-pointer text-left transition-colors ${sel === e.id ? "bg-[var(--accent-soft)]" : "bg-transparent hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"}`}>
                  <span className="w-7 flex-none text-right tabular-nums text-[12px] text-[var(--meta)]">{e.no ?? "—"}</span>
                  <span className={`min-w-0 truncate text-[13px] ${sel === e.id ? "text-[var(--accent)] font-medium" : ""}`}>{t(e.key)}</span>
                  {playing?.id === e.id ? (
                    <span aria-hidden className="flex items-end gap-[2px] h-3">
                      {[0, 1, 2].map((i) => <span key={i} className="eq-bar w-[2px] rounded-full bg-[var(--accent)]" style={{ animationDelay: `${i * 0.18}s` }} />)}
                    </span>
                  ) : null}
                  <span className="ml-auto text-[11px] text-[var(--meta)] tabular-nums">{e.sec.toFixed(1)} s</span>
                </button>
              ))}
            </div>
          </Swap>
        </section>
        <aside className="min-w-0">
          <Swap k={sel}>
            {cur ? (
              <div className="bg-[var(--group)] rounded-[var(--r)] p-4 flex flex-col gap-3">
                <div className="text-[15px] font-semibold truncate">{t(cur.key)}</div>
                <Btn primary onClick={() => setPlaying({ id: cur.id, at: 0 })}>{t("demo.more.run")}</Btn>
                <p className="m-0 text-[12px] text-[var(--help)] leading-relaxed">{t("demo.more.editNote")}</p>
              </div>
            ) : (
              <p className="m-0 py-2 text-[12.5px] text-[var(--meta)] leading-relaxed">{t("demo.more.editEmpty")}</p>
            )}
          </Swap>
        </aside>
      </div>
      <div className="mt-4 -mx-2 px-2 py-2.5 flex items-center gap-4 flex-wrap shadow-[0_-1px_0_var(--line)]">
        <span className="text-[12.5px] min-w-[160px] truncate">{now ? t(now.key) : t("demo.more.idle")}</span>
        <div className="flex-1 min-w-[120px] h-1 rounded-full bg-[var(--line)] overflow-hidden">
          <div className="h-full bg-[var(--accent)]" style={{ width: `${now && playing ? (playing.at / now.sec) * 100 : 0}%` }} />
        </div>
        <div className="w-[180px] flex items-center gap-2 text-[12px] text-[var(--meta)]">
          <span className="flex-none">{t("demo.more.volume")}</span>
          <div className="flex-1"><Slider value={vol} min={0} max={100} step={1} onChange={setVol} /></div>
        </div>
        <Btn disabled={!playing} onClick={() => setPlaying(null)}>{t("demo.more.stop")}</Btn>
      </div>
    </Block>
  );
}

/** 存储：环形图说清楚谁占了多少；下面一张勾选清单，每项写明大小与清理后的影响，一次清理。 */
export function CleanupPattern() {
  const { t } = useI18n();
  const notify = useNotify();
  const base: PickItem[] = [
    { id: "temp", label: t("demo.more.temp"), effect: t("demo.more.effectNone"), size: 640 * MB, group: "direct" },
    { id: "logs", label: t("demo.more.logs"), effect: t("demo.more.effectLogs"), size: 36 * MB, group: "direct" },
    { id: "trash", label: t("demo.more.trash"), effect: t("demo.more.effectTrash"), size: 420 * MB, group: "direct" },
    { id: "ckpt", label: t("demo.more.ckpt"), effect: t("demo.more.effectResume"), size: 2.1 * GB, group: "work", indent: true },
    { id: "mid", label: t("demo.more.mid"), effect: t("demo.more.effectRedo"), size: 1.4 * GB, group: "work", indent: true },
    { id: "empty", label: t("demo.more.snap"), effect: t("demo.more.effectNone"), size: 0, group: "work", indent: true },
  ];
  const [items, setItems] = useState(base);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const kept = 3.1 * GB;
  const size = (ids: string[]) => items.filter((x) => ids.includes(x.id)).reduce((n, x) => n + x.size, 0);
  const segs = [
    { id: "keep", label: t("demo.more.kept"), value: kept, color: "var(--accent)" },
    { id: "work", label: t("demo.more.work"), value: size(["ckpt", "mid"]), color: "color-mix(in srgb, var(--accent) 55%, var(--surface))" },
    { id: "junk", label: t("demo.more.junk"), value: size(["temp", "logs", "trash"]), color: "color-mix(in srgb, var(--ink) 20%, var(--surface))" },
  ].filter((s) => s.value > 0).map((s) => ({ ...s, note: human(s.value) }));
  const apply = () => {
    setBusy(true);
    window.setTimeout(() => {
      const freed = size([...picked]);
      setItems((xs) => xs.map((x) => (picked.has(x.id) ? { ...x, size: 0 } : x)));
      setPicked(new Set());
      setBusy(false);
      notify.tip(t("demo.more.freed", { size: human(freed) }));
    }, 700);
  };
  return (
    <Block title={t("demo.more.storage")} action={<Btn onClick={() => { setItems(base); setPicked(new Set()); }}>{t("demo.more.resetDemo")}</Btn>}>
      <div className="bg-[var(--group)] rounded-[var(--r)] px-5 py-4">
        <Ring segments={segs} center={human(kept + size(items.map((x) => x.id)))} sub={t("demo.more.used")} size={124} />
      </div>
      <div className="mt-3">
        <PickList
          items={items}
          picked={picked}
          onToggle={(id) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
          format={human}
          groupLabel={(g) => t(g === "direct" ? "demo.more.groupDirect" : "demo.more.groupWork")}
          summary={(n, total) => (n ? t("demo.more.picked", { n, size: human(total) }) : t("demo.more.pickNone"))}
          action={t("demo.more.clean")}
          busy={busy}
          onApply={apply}
        />
      </div>
    </Block>
  );
}

/** 推荐下载：还什么都没有时，直接给几个，点一下就下载，进度就地显示，可以取消。 */
export function StarterPattern() {
  const { t } = useI18n();
  const items = [
    { id: "a", key: "demo.more.pack1", art: 1 },
    { id: "b", key: "demo.more.pack2", art: 3 },
    { id: "c", key: "demo.more.pack3", art: 5 },
  ];
  const [prog, setProg] = useState<Record<string, number>>({});
  useEffect(() => {
    const active = Object.entries(prog).filter(([, p]) => p >= 0 && p < 100);
    if (!active.length) return;
    const id = window.setTimeout(() => setProg((x) => Object.fromEntries(Object.entries(x).map(([k, p]) => [k, p >= 0 && p < 100 ? Math.min(100, p + 7) : p]))), 160);
    return () => window.clearTimeout(id);
  }, [prog]);
  return (
    <Block title={t("demo.more.starter")} note={t("demo.more.starterSub")}>
      <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
        {items.map((x, i) => {
          const p = prog[x.id];
          return (
            <div key={x.id} className="rise bg-[var(--group)] rounded-[var(--r)] overflow-hidden" style={stagger(i)}>
              <div className="aspect-[16/9]" style={{ background: `linear-gradient(145deg, var(--art-${x.art}), var(--art-${(x.art % 6) + 1}))` }} />
              <div className="px-4 py-3">
                <div className="text-[14px] font-semibold">{t(x.key)}</div>
                <div className="mt-3 flex items-center gap-2">
                  {p === 100 ? (
                    <span className="text-[12.5px] text-[var(--ink-muted)]">{t("demo.more.installed")}</span>
                  ) : p !== undefined ? (
                    <>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--line)] overflow-hidden"><div className="h-full bg-[var(--accent)] transition-[width] duration-150" style={{ width: `${p}%` }} /></div>
                      <span className="text-[11.5px] text-[var(--meta)] tabular-nums w-9 text-right">{p}%</span>
                      <Btn onClick={() => setProg((s) => { const n = { ...s }; delete n[x.id]; return n; })}>{t("ui.common.cancel")}</Btn>
                    </>
                  ) : (
                    <Btn primary onClick={() => setProg((s) => ({ ...s, [x.id]: 0 }))}>{t("demo.more.get")}</Btn>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Block>
  );
}
