// @vitest-environment happy-dom
import { act, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { I18nScope } from "../i18n";
import { mount, pressKey, type Mounted } from "../test/dom";
import { ImageCropDialog } from "./ImageCropDialog";

let view: Mounted | undefined;
afterEach(() => {
  view?.unmount();
  view = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function button(label: string) {
  return [...document.querySelectorAll("button")].find((el) => el.textContent === label)!;
}

it("limits canvas preview size and only encodes the full JPEG on save", async () => {
  vi.useFakeTimers();
  const image = document.createElement("img");
  Object.defineProperties(image, {
    naturalWidth: { value: 800 },
    naturalHeight: { value: 600 },
    src: {
      get: () => "data:image/png;base64,AAAA",
      set: () => void Promise.resolve().then(() => image.dispatchEvent(new Event("load"))),
    },
  });
  vi.stubGlobal("Image", vi.fn(function () { return image; }));
  const context = { clearRect: vi.fn(), fillRect: vi.fn(), save: vi.fn(), translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn(), restore: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const encode = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(function (this: HTMLCanvasElement) {
    expect([this.width, this.height]).toEqual([512, 512]);
    return "data:image/jpeg;base64,AAAA";
  });
  const save = vi.fn(async () => {});
  view = mount(<I18nScope value={{ locale: "en-US", setLocale: () => {}, ready: true }}>
    <ImageCropDialog name="Example" pickImage={async () => image.src} onSave={save} onClose={() => {}} />
  </I18nScope>);
  await act(async () => { button("Choose an image…").click(); });
  await act(async () => { await vi.advanceTimersByTimeAsync(100); });
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain("683×512");
  act(() => { button("1:1").click(); });
  await act(async () => { await vi.advanceTimersByTimeAsync(100); });
  const preview = document.querySelector<HTMLCanvasElement>("canvas.object-contain")!;
  expect([preview.width, preview.height]).toEqual([480, 480]);
  expect(encode).not.toHaveBeenCalled();

  await act(async () => { button("Save cover").click(); });
  expect(encode).toHaveBeenCalledExactlyOnceWith("image/jpeg", 0.85);
  expect(save).toHaveBeenCalledExactlyOnceWith("data:image/jpeg;base64,AAAA");
});

it("keeps keyboard focus in the dialog and restores it after canceling", async () => {
  vi.useFakeTimers();
  function Example() {
    const [open, setOpen] = useState(false);
    return <I18nScope value={{ locale: "en-US", setLocale: () => {}, ready: true }}>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <ImageCropDialog name="Example" pickImage={async () => null} onClose={() => setOpen(false)} onSave={async () => {}} />}
    </I18nScope>;
  }
  view = mount(<Example />);
  const trigger = button("Open");
  trigger.focus();
  act(() => { trigger.click(); });
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
  expect(document.activeElement).toBe(button("Cancel"));
  const choose = button("Choose an image…");
  choose.focus();
  pressKey(choose, "Tab");
  expect(document.activeElement).toBe(button("Cancel"));
  pressKey(document.activeElement!, "Escape");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
