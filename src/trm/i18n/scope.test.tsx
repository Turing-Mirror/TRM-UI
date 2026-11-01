// @vitest-environment happy-dom
import { act, useState } from "react";
import { afterEach, expect, it } from "vitest";
import { I18nScope, useI18n, type LocaleCode } from "./index";
import { PopupSelect } from "../components/PopupSelect";
import { mount, type Mounted } from "../test/dom";

const PRODUCT_KEY = "custom.caption";
let mounted: Mounted;
afterEach(() => mounted?.unmount());

function Counter() {
  const [count, setCount] = useState(0);
  const { locale, t } = useI18n();
  return <button data-count onClick={() => setCount(count + 1)}>{locale}:{count}:{t(PRODUCT_KEY)}</button>;
}
function Scope({ locale }: { locale: LocaleCode }) {
  return <I18nScope value={{ locale, ready: true, setLocale: () => {}, t: key => key === PRODUCT_KEY ? "product" : key }}>
    <Counter />
    <PopupSelect value="" options={[]} onChange={() => {}} />
  </I18nScope>;
}
it("follows the host locale, falls back to UI translations and preserves child state", () => {
  mounted = mount(<Scope locale="zh-CN" />);
  act(() => mounted.container.querySelector<HTMLButtonElement>("[data-count]")!.click());
  act(() => mounted.root.render(<Scope locale="en-US" />));
  expect(mounted.container.querySelector("[data-count]")!.textContent).toBe("en-US:1:product");
  expect(mounted.container.querySelector("[role=combobox]")!.textContent).toContain("No options available");
});
it("keeps sibling locale scopes independent", () => {
  mounted = mount(<><Scope locale="en-US" /><Scope locale="zh-CN" /></>);
  const controls = mounted.container.querySelectorAll("[role=combobox]");
  expect(controls[0].textContent).toContain("No options available");
  expect(controls[1].textContent).not.toContain("No options available");
  expect(controls[1].textContent).not.toContain("ui.select.empty");
});
