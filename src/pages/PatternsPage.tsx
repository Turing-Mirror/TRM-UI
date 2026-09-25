import { useState } from "react";
import {
  PagePad,
  PageHead,
  Block,
  Btn,
  Tag,
  Meta,
  Mark,
  Tabs,
  Filters,
  Pager,
  Empty,
  Modal,
  Drawer,
  Dropdown,
  PromptDialog,
  Calendar,
  Icon,
  ICON_NAMES,
  MoreBtn,
  SearchBox,
  useMenu,
  useNotify,
  useI18n,
  type Art,
} from "../trm";

/** 演示用的一排卡片。 */
const CARDS: { art: Art; glyph: string; key: string }[] = [
  { art: 1, glyph: "image", key: "demo.patterns.card1" },
  { art: 2, glyph: "audio", key: "demo.patterns.card2" },
  { art: 4, glyph: "video", key: "demo.patterns.card3" },
  { art: 5, glyph: "file", key: "demo.patterns.card4" },
];

/**
 * 桌面应用常用的模式：菜单、页内分栏、浮层、消息、月历、翻页、卡片。
 * 每一个都能真的点。
 */
export function PatternsPage() {
  const { t } = useI18n();
  const notify = useNotify();
  const menu = useMenu();
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [filter, setFilter] = useState<"all" | "on" | "off">("all");
  const [size, setSize] = useState("m");
  const [page, setPage] = useState(3);
  const [day, setDay] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [naming, setNaming] = useState(false);
  const [q, setQ] = useState("");

  const menuItems = [
    { id: "open", label: t("demo.patterns.open"), icon: "external" as const, onSelect: () => notify.tip(t("demo.patterns.opened")) },
    { id: "rename", label: t("demo.patterns.rename"), icon: "edit" as const, onSelect: () => setNaming(true) },
    { id: "gap", gap: true as const },
    { id: "del", label: t("demo.patterns.delete"), icon: "trash" as const, danger: true, onSelect: () => notify.tip(t("demo.patterns.deleted")) },
  ];

  return (
    <PagePad>
      <PageHead title={t("nav.patterns")} sub={t("demo.patterns.sub")} />

      <Block title={t("demo.patterns.tabs")}>
        <div className="flex flex-col gap-4">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { id: "a", label: t("demo.patterns.tabA"), count: 12 },
              { id: "b", label: t("demo.patterns.tabB"), count: 3 },
              { id: "c", label: t("demo.patterns.tabC") },
            ]}
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Filters
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: t("demo.patterns.all"), count: 15 },
                { id: "on", label: t("demo.patterns.on"), count: 4 },
                { id: "off", label: t("demo.patterns.off"), count: 11 },
              ]}
            />
            <SearchBox value={q} onChange={setQ} />
          </div>
        </div>
      </Block>

      <Block title={t("demo.patterns.menus")}>
        <div className="flex items-center gap-3 flex-wrap">
          <Btn onClick={(e) => menu.open(e.currentTarget, menuItems)}>
            <span className="inline-flex items-center gap-1.5">
              {t("demo.patterns.menuBtn")}
              <Icon name="down" size={14} />
            </span>
          </Btn>
          <Dropdown
            value={size}
            onChange={setSize}
            label={t("demo.patterns.size")}
            options={[
              { id: "s", label: t("demo.patterns.sizeS") },
              { id: "m", label: t("demo.patterns.sizeM") },
              { id: "l", label: t("demo.patterns.sizeL") },
            ]}
          />
          <span onContextMenu={(e) => menu.open(e, menuItems)} className="text-[12.5px] text-[var(--meta)] px-3 py-2 rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--hairline)]">
            {t("demo.patterns.rightClick")}
          </span>
        </div>
      </Block>

      <Block title={t("demo.patterns.cards")}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-6">
          {CARDS.map((c) => (
            <div key={c.key} role="button" tabIndex={0} onContextMenu={(e) => menu.open(e, menuItems)} className="group relative block text-left">
              <span className="sink relative block aspect-[4/3] rounded-[var(--r)] overflow-hidden" style={{ background: `var(--art-${c.art})` }}>
                <span className="absolute inset-0 grid place-items-center">
                  <Mark art={c.art} text="" glyph={c.glyph} size={44} plain />
                </span>
                <span className="absolute right-2 top-2">
                  <MoreBtn onOpen={(el) => menu.open(el, menuItems)} />
                </span>
              </span>
              <span className="mt-2 block text-[13.5px] font-medium">{t(c.key)}</span>
              <Meta className="mt-0.5">{[t("demo.patterns.metaA"), t("demo.patterns.metaB")]}</Meta>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4 flex-wrap">
          <Tag tone="ok">{t("demo.patterns.tagOk")}</Tag>
          <Tag tone="warn">{t("demo.patterns.tagWarn")}</Tag>
          <Tag tone="danger">{t("demo.patterns.tagDanger")}</Tag>
          <Tag tone="accent">{t("demo.patterns.tagAccent")}</Tag>
          <Tag>{t("demo.patterns.tagMuted")}</Tag>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[var(--warn-ink)]">
          <Icon name="alert" size={15} className="text-[var(--warn)]" />
          {t("demo.patterns.warnLine")}
        </div>
      </Block>

      <Block title={t("demo.patterns.overlays")}>
        <div className="flex items-center gap-2 flex-wrap">
          <Btn onClick={() => setModal(true)}>{t("demo.patterns.modal")}</Btn>
          <Btn onClick={() => setDrawer(true)}>{t("demo.patterns.drawer")}</Btn>
          <Btn onClick={() => notify.tip(t("demo.patterns.tipText"))}>{t("demo.patterns.tip")}</Btn>
          <Btn onClick={() => notify.notice({ title: t("demo.patterns.noticeTitle"), text: t("demo.patterns.noticeText"), icon: "check", onOpen: () => setDrawer(true) })}>
            {t("demo.patterns.notice")}
          </Btn>
        </div>
      </Block>

      <Block title={t("demo.patterns.calendar")}>
        <div className="inline-block rounded-[14px] bg-[var(--surface)] shadow-[var(--pop-shadow)]">
          <Calendar value={day} onChange={setDay} />
        </div>
      </Block>

      <Block title={t("demo.patterns.pager")}>
        <Pager page={page} pages={12} onChange={setPage} />
      </Block>

      <Block title={t("demo.patterns.empty")}>
        <Empty icon="folder" title={t("demo.patterns.emptyTitle")} action={<Btn>{t("demo.patterns.emptyAction")}</Btn>} />
      </Block>

      <Block title={t("demo.patterns.icons")}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1 text-[var(--ink-muted)]">
          {ICON_NAMES.map((n) => (
            <span key={n} title={n} className="h-11 grid place-items-center rounded-[var(--rs)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:text-[var(--ink)]">
              <Icon name={n} size={18} />
            </span>
          ))}
        </div>
      </Block>

      <Modal open={modal} onClose={() => setModal(false)} width={420} label={t("demo.patterns.modal")}>
        <div className="p-6">
          <div className="text-[17px] font-semibold">{t("demo.patterns.modal")}</div>
          <div className="mt-2 text-[13px] text-[var(--help)] leading-relaxed">{t("demo.patterns.modalText")}</div>
          <div className="mt-6 flex justify-end gap-2">
            <Btn onClick={() => setModal(false)}>{t("ui.common.cancel")}</Btn>
            <Btn primary onClick={() => setModal(false)}>{t("ui.common.confirm")}</Btn>
          </div>
        </div>
      </Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} label={t("demo.patterns.drawer")}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Mark art={1} text="" glyph="image" size={52} />
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-semibold">{t("demo.patterns.card1")}</div>
              <Meta className="mt-1">{[t("demo.patterns.metaA"), t("demo.patterns.metaB")]}</Meta>
            </div>
          </div>
          <div className="mt-5 text-[13px] text-[var(--help)] leading-relaxed">{t("demo.patterns.drawerText")}</div>
        </div>
      </Drawer>
      <PromptDialog open={naming} title={t("demo.patterns.rename")} initial={t("demo.patterns.card1")} confirm={t("ui.common.confirm")} onClose={() => setNaming(false)} onSubmit={(v) => notify.tip(v)} />
      {menu.node}
    </PagePad>
  );
}
