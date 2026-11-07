// @vitest-environment happy-dom
import { act } from "react";
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { Chip } from "./Chip";
import { ChipInput } from "./ChipInput";
import type { Tone } from "./display";
import { I18nScope } from "../i18n";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => view?.unmount());

it("renders a read-only keyword and optional decorative icon without a button", () => {
  view = mount(<Chip icon="audio">Headphones</Chip>);
  expect(view.container.querySelector(".trm-chip")?.textContent).toBe("Headphones");
  expect(view.container.querySelector(".trm-chip")?.getAttribute("data-tone")).toBe("muted");
  expect(view.container.querySelector("button")).toBeNull();
  expect(view.container.querySelector('.trm-chip-icon[aria-hidden="true"] svg')).not.toBeNull();
});

it("names and invokes the remove action using the label", () => {
  const remove = vi.fn();
  view = mount(<I18nScope value={{ locale: "en-US", setLocale: () => {}, ready: true }}>
    <Chip onRemove={remove}>Bluetooth</Chip>
  </I18nScope>);
  const button = view.container.querySelector("button")!;
  expect(button.getAttribute("aria-label")).toBe("Remove Bluetooth");
  act(() => button.click());
  expect(remove).toHaveBeenCalledOnce();
});

it("shares the same chip markup and removal behavior with ChipInput", () => {
  const change = vi.fn();
  view = mount(<>
    <Chip onRemove={() => {}}>Bluetooth</Chip>
    <ChipInput value={["Bluetooth"]} onChange={change} label="Keywords" />
  </>);
  const chips = view.container.querySelectorAll(".trm-chip");
  expect(chips).toHaveLength(2);
  expect(chips[0].outerHTML).toBe(chips[1].outerHTML);
  expect(chips[1].getAttribute("data-tone")).toBe("muted");
  act(() => chips[1].querySelector("button")!.click());
  expect(change).toHaveBeenCalledWith([]);
});

// The fill is opaque, so these ratios apply unchanged over page, group and surface backgrounds.
const tokens = readFileSync("src/trm/styles/tokens.css", "utf8");
const tones: readonly Tone[] = ["muted", "ok", "warn", "accent", "danger"];
it.each(tones)("applies the %s tone without changing the chip geometry or fill", tone => {
  const sheet = document.createElement("style");
  sheet.textContent = readFileSync("src/trm/styles/components.css", "utf8");
  document.head.appendChild(sheet);
  try {
    view = mount(<Chip tone={tone} icon="audio">Headphones</Chip>);
    const chip = view.container.querySelector<HTMLElement>(".trm-chip")!;
    expect(chip.dataset.tone).toBe(tone);
    const style = getComputedStyle(chip);
    expect(style.minHeight).toBe("24px");
    expect(style.fontSize).toBe("12.5px");
    const token = tone === "muted" ? "--chip-ink" : `--chip-${tone}-ink`;
    // Distinct sentinels verify that the CSS selector actually selects the requested token.
    chip.style.setProperty("--chip", "rgb(230, 230, 230)");
    chip.style.setProperty(token, "rgb(12, 34, 56)");
    expect(getComputedStyle(chip).color).toBe("rgb(12, 34, 56)");
    expect(getComputedStyle(chip).backgroundColor).toBe("rgb(230, 230, 230)");
  } finally { sheet.remove(); }
});

const rgb = (theme: string, token: string): number[] => {
  const value = theme.match(new RegExp(`${token}: ([^;]+);`))![1];
  const alias = value.match(/^var\((--[^)]+)\)$/);
  if (alias) return rgb(theme, alias[1]);
  const hex = value.slice(1);
  return hex.match(/../g)!.map(channel => parseInt(channel, 16));
};
const luminance = (channels: number[]) => channels.map(channel => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);

const themes = {
  light: tokens.match(/(?:^|\n):root \{[^}]+\}/g)!.join("\n"),
  dark: tokens.match(/:root\[data-theme="dark"\] \{[^}]+\}/g)!.join("\n"),
  systemDark: tokens.match(/:root:not\(\[data-theme="light"\]\) \{[^}]+\}/g)!.join("\n"),
};
it.each(Object.entries(themes).flatMap(([theme, css]) => tones.map(tone => ({ theme, css, tone }))))(
  "keeps $tone label text above 4.5:1 in $theme", ({ css, tone }) => {
  const ink = rgb(css, "--ink");
  const surface = rgb(css, "--surface");
  const weight = Number(tokens.match(/--chip: color-mix\(in srgb, var\(--ink\) (\d+)%/)![1]) / 100;
  expect(tokens).toContain("--chip-ink: var(--ink-muted)");
  const fill = ink.map((channel, i) => channel * weight + surface[i] * (1 - weight));
  const token = tone === "muted" ? "--ink-muted" : `--chip-${tone}-ink`;
  const [low, high] = [luminance(fill), luminance(rgb(css, token))].sort((a, b) => a - b);
  const ratio = (high + 0.05) / (low + 0.05);
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});
