import { useEffect, useRef, useState } from "react";
import {
  PagePad,
  PageHead,
  Block,
  Group,
  Btn,
  ListItem,
  AccordionGroup,
  Field,
  Select,
  Slider,
  Toggle,
  SegmentControl,
  TextInput,
  TextArea,
  ChipInput,
  DataTable,
  BarChart,
  ConfirmDialog,
  useI18n,
} from "../trm";

export function ComponentsPage() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (busyTimer.current !== null) clearTimeout(busyTimer.current);
  }, []);
  const [on, setOn] = useState(true);
  const [name, setName] = useState("device-01");
  const [volume, setVolume] = useState(60);
  const [autostart, setAutostart] = useState(false);
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [selected, setSelected] = useState("");
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
  }, []);
  const daily = [8, 12, 5, 18, 24, 16, 21].map((value, index) => ({
    label: `2026-11-${String(index + 1).padStart(2, "0")}`, value,
  }));

  return (
    <PagePad>
      <PageHead title={t("nav.components")} />

      <Block title={t("demo.components.buttons")}>
        <Group>
          <div className="py-4 flex items-center gap-2.5 flex-wrap">
            <Btn>{t("demo.btn.normal")}</Btn>
            <Btn primary>{t("demo.btn.primary")}</Btn>
            <Btn on={on} onClick={() => setOn((v) => !v)}>
              {t("demo.btn.on")}
            </Btn>
            <Btn
              busy={busy}
              onClick={() => {
                setBusy(true);
                busyTimer.current = setTimeout(() => setBusy(false), 2200);
              }}
            >
              {t("demo.btn.busy")}
            </Btn>
            <Btn disabled>{t("demo.btn.disabled")}</Btn>
          </div>
        </Group>
      </Block>

      <Block title={t("demo.components.fields")}>
        <Group>
          <div className="py-3 flex flex-col gap-6">
            <Field
              label={t("demo.field.name")}
              tip={t("demo.field.nameTip")}
              control={
                <TextInput
                  value={name}
                  onChange={setName}
                  aria-label={t("demo.field.name")}
                  className="max-w-[340px]"
                />
              }
            />
            <Field
              label={t("demo.field.device")}
              desc={t("demo.field.deviceDesc")}
              control={
                <Select
                  width={240}
                  value="ghost-device"
                  onChange={() => {}}
                  options={[
                    { id: "spk", label: "Speakers (Realtek)" },
                    { id: "hdmi", label: "HDMI Output" },
                  ]}
                />
              }
            />
            <Field
              label={t("demo.field.volume")}
              note={t("demo.field.volumeNote")}
              control={
                <Slider
                  value={volume}
                  min={0}
                  max={100}
                  step={5}
                  defaultValue={50}
                  onChange={setVolume}
                  ariaLabel={t("demo.field.volume")}
                  format={(v) => `${v}%`}
                />
              }
            />
            <Toggle
              checked={autostart}
              onChange={setAutostart}
              label={t("demo.field.enable")}
              tip={t("demo.field.nameTip")}
            />
          </div>
        </Group>
      </Block>

      <Block title={t("demo.shared.title")}>
        <div className="flex flex-col gap-6">
          <Field
            label={t("demo.shared.notes")}
            control={<TextArea value={notes} onChange={setNotes} aria-label={t("demo.shared.notes")}
              placeholder={t("demo.shared.notesPlaceholder")} />}
          />
          <Field
            label={t("demo.shared.tags")}
            control={<ChipInput value={tags} onChange={setTags} label={t("demo.shared.tags")}
              placeholder={t("demo.shared.tagsPlaceholder")} />}
          />
          <div><Btn onClick={() => setConfirmOpen(true)}>{t("demo.shared.clearTags")}</Btn></div>
          <DataTable
            label={t("demo.shared.daily")}
            rows={daily}
            keyOf={(row) => row.label}
            columns={[
              { key: "label", label: t("ui.chart.label"), render: (row) => row.label },
              { key: "value", label: t("ui.chart.value"), render: (row) => row.value, align: "end" },
            ]}
            onRowClick={(row) => setSelected(row.label)}
          />
          {selected ? <p role="status">{t("demo.shared.selected", { name: selected })}</p> : null}
          <BarChart title={t("demo.shared.daily")} data={daily} formatLabel={(label) => label.slice(5)} showTableToggle />
        </div>
        <ConfirmDialog
          open={confirmOpen}
          title={t("demo.shared.confirmTitle")}
          text={t("demo.shared.confirmText")}
          confirm={t("demo.shared.clearTags")}
          danger
          busy={confirmBusy}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmBusy(true);
            confirmTimer.current = setTimeout(() => {
              setTags([]);
              setConfirmBusy(false);
              setConfirmOpen(false);
            }, 900);
          }}
        />
      </Block>

      <Block title={t("demo.components.segment")} note={t("demo.components.segmentNote")}>
        <Group>
          <div className="py-4">
            <SegmentControl
              options={[
                { id: "a", label: t("demo.seg.a") },
                { id: "b", label: t("demo.seg.b") },
                { id: "c", label: t("demo.seg.c") },
              ]}
              value={seg}
              onChange={setSeg}
            />
          </div>
        </Group>
      </Block>

      <Block title={t("demo.components.list")}>
        <Group>
          <AccordionGroup
            items={[{ id: "example", title: t("demo.list.item1"), desc: t("demo.list.item1Desc"), content: t("demo.list.item1Body") }]}
            openId={expanded ? "example" : ""}
            onToggle={() => setExpanded((v) => !v)}
            openLabel="−"
            closedLabel="+"
          />
          <ListItem
            title={t("demo.list.item2")}
            desc={t("demo.list.item2Desc")}
            right={<Btn uw>{t("demo.btn.normal")}</Btn>}
          />
        </Group>
      </Block>
    </PagePad>
  );
}
