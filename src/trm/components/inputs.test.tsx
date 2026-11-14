// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { afterEach, expect, it } from "vitest";
import { mount, type Mounted } from "../test/dom";
import { TextArea, TextInput } from "./inputs";

let view: Mounted;
afterEach(() => view?.unmount());

it("omits look, fit and resize attributes by default", () => {
  view = mount(
    <>
      <TextInput value="alpha" onChange={() => {}} aria-label="Single" />
      <TextArea value="beta" onChange={() => {}} aria-label="Multi" />
    </>,
  );
  const input = view.container.querySelector("input")!;
  const area = view.container.querySelector("textarea")!;

  for (const el of [input, area]) {
    expect(el.hasAttribute("data-look")).toBe(false);
    expect(el.hasAttribute("data-fit")).toBe(false);
    expect(el.hasAttribute("data-resize")).toBe(false);
  }
});

it("maps look, fit and resize props to data attributes", () => {
  view = mount(
    <>
      <TextInput value="" onChange={() => {}} look="compact" fit aria-label="Compact" />
      <TextInput value="" onChange={() => {}} look="bare" aria-label="Bare" />
      <TextArea value="" onChange={() => {}} look="bare" fit resize="none" aria-label="Area" />
    </>,
  );
  const inputs = view.container.querySelectorAll("input");
  const area = view.container.querySelector("textarea")!;

  expect(inputs[0].getAttribute("data-look")).toBe("compact");
  expect(inputs[0].hasAttribute("data-fit")).toBe(true);

  expect(inputs[1].getAttribute("data-look")).toBe("bare");
  expect(inputs[1].hasAttribute("data-fit")).toBe(false);

  expect(area.getAttribute("data-look")).toBe("bare");
  expect(area.hasAttribute("data-fit")).toBe(true);
  expect(area.getAttribute("data-resize")).toBe("none");
});

it("forwards type='search' on TextInput", () => {
  view = mount(<TextInput type="search" value="query" onChange={() => {}} aria-label="Search" />);
  const input = view.container.querySelector("input")!;
  expect(input.type).toBe("search");
  expect(input.getAttribute("type")).toBe("search");
});

it("applies compact, bare, fit and resize CSS rules outside layers", () => {
  const css = readFileSync("src/trm/styles/components.css", "utf8");
  const sheet = document.createElement("style");
  sheet.textContent = css;
  document.head.appendChild(sheet);
  try {
    view = mount(
      <>
        <TextInput value="" onChange={() => {}} aria-label="Field" />
        <TextInput value="" onChange={() => {}} look="compact" fit aria-label="Compact" />
        <TextInput value="" onChange={() => {}} look="bare" aria-label="Bare" />
        <TextArea value="" onChange={() => {}} resize="none" aria-label="NoResize" />
      </>,
    );
    const inputs = view.container.querySelectorAll("input");
    const area = view.container.querySelector("textarea")!;

    expect(getComputedStyle(inputs[0]).width).toBe("100%");
    expect(getComputedStyle(inputs[1]).width).not.toBe("100%");
    expect(getComputedStyle(inputs[1]).paddingTop).toBe("7px");
    expect(getComputedStyle(inputs[1]).paddingLeft).toBe("9px");
    expect(getComputedStyle(inputs[2]).paddingTop).toBe("0px");
    expect(getComputedStyle(inputs[2]).boxShadow).toBe("none");
    expect(getComputedStyle(area).resize).toBe("none");
  } finally {
    sheet.remove();
  }
});
