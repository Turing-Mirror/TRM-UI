// @vitest-environment happy-dom
import { act } from "react";
import { expect, it, vi } from "vitest";
import { I18nScope } from "../i18n";
import { mount } from "../test/dom";
import { ResourceDownloadRow } from "./ResourceDownloadRow";

it("keeps a single installed indicator and dispatches only the available action", () => {
  const download = vi.fn();
  const remove = vi.fn();
  const row = (installed: boolean, downloading = false) => (
    <I18nScope value={{ locale: "en-US", setLocale: () => {}, ready: true }}>
      <ResourceDownloadRow title="Example" installed={installed} downloading={downloading}
        progress={{ done: 12, total: 10 }} onDownload={download} onRemove={remove} />
    </I18nScope>
  );
  const view = mount(row(false));
  try {
    const button = () => view.container.querySelector("button")!;
    act(() => { button().click(); });
    expect(download).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();

    act(() => view.root.render(row(false, true)));
    expect(button().disabled).toBe(true);
    expect(view.container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("100");

    act(() => view.root.render(row(true)));
    expect([...view.container.querySelectorAll("span")].filter((node) => node.textContent === "Installed")).toHaveLength(1);
    act(() => { button().click(); });
    expect(remove).toHaveBeenCalledOnce();
    expect(download).toHaveBeenCalledOnce();
  } finally {
    view.unmount();
  }
});
