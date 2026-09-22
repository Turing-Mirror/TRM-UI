import { useState } from "react";
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
  useI18n,
} from "../trm";

export function ComponentsPage() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [on, setOn] = useState(true);
  const [name, setName] = useState("device-01");
  const [volume, setVolume] = useState(60);
  const [autostart, setAutostart] = useState(false);
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [expanded, setExpanded] = useState(false);

  return (
    <PagePad>
      <PageHead title={t("nav.components")} sub={t("demo.components.sub")} />

      <Block title={t("demo.components.buttons")} note={t("demo.components.buttonsNote")}>
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
                window.setTimeout(() => setBusy(false), 2200);
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
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={[
                    "text-[13px] text-[var(--ink)] bg-transparent w-full max-w-[340px]",
                    "px-3.5 py-[7px] rounded-[var(--rs)] shadow-[inset_0_0_0_1px_var(--line)]",
                    "outline-none focus:shadow-[inset_0_0_0_1px_var(--accent)] select-text",
                  ].join(" ")}
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
