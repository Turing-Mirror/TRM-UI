// @vitest-environment happy-dom
import { afterEach, expect, it } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { Btn } from "./ui";

let view: Mounted;
afterEach(() => view?.unmount());

it("uses 0.97 active scale and default border outline", () => {
  view = mount(<Btn>Default</Btn>);
  const btn = document.querySelector("button")!;
  expect(btn.className).toContain("enabled:active:scale-[0.97]");
  expect(btn.className).not.toContain("enabled:active:scale-[0.955]");
  expect(btn.className).toContain("shadow-[inset_0_0_0_1px_var(--line)]");
});

it("renders borderless text button without outline or fill", () => {
  view = mount(<Btn text>More</Btn>);
  const btn = document.querySelector("button")!;
  expect(btn.className).toContain("bg-transparent");
  expect(btn.className).toContain("shadow-none");
  expect(btn.className).toContain("text-[var(--ink-muted)]");
});

it("renders outlined danger, text danger, and solid primary danger variants", () => {
  view = mount(
    <>
      <Btn danger>Delete</Btn>
      <Btn text danger>Remove</Btn>
      <Btn primary danger>Erase</Btn>
    </>,
  );
  const [outlined, textDanger, solidDanger] = document.querySelectorAll("button");
  expect(outlined.className).toContain("text-[var(--danger-text)]");
  expect(outlined.className).toContain("var(--danger)");
  expect(outlined.className).not.toContain("shadow-none");

  expect(textDanger.className).toContain("text-[var(--danger-text)]");
  expect(textDanger.className).toContain("shadow-none");

  expect(solidDanger.className).toContain("bg-[var(--danger-fill)]");
  expect(solidDanger.className).toContain("text-[var(--accent-ink)]");
});
