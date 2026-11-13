// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";
import { forgetThumb, loadThumb, peekThumb } from "./thumb";

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

/** 给缩略图流程搭一个最小环境：能读文件、能解码、能缩、数据库打不开。 */
function stage(width: number, height: number) {
  const draw = vi.fn();
  const fetched = vi.fn(async () => ({ ok: true, blob: async () => new Blob(["x".repeat(10)]) }));
  vi.stubGlobal("fetch", fetched);
  vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width, height, close: vi.fn() })));
  vi.stubGlobal("indexedDB", { open: () => { throw new Error("blocked"); } });
  vi.stubGlobal("OffscreenCanvas", class {
    constructor(public width: number, public height: number) {}
    getContext() { return { drawImage: draw, imageSmoothingQuality: "low" }; }
    convertToBlob() { return Promise.resolve(new Blob(["small"])); }
  });
  let n = 0;
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:thumb-${++n}`);
  return { draw, fetched };
}

it("shrinks a large image to the requested longest side and remembers it", async () => {
  const { draw, fetched } = stage(4000, 2000);
  const url = await loadThumb("/big-a.png", 640);
  expect(url).toBe("blob:thumb-1");
  expect(draw).toHaveBeenCalledWith(expect.anything(), 0, 0, 640, 320);
  expect(peekThumb("/big-a.png", 640)).toBe(url);
  expect(await loadThumb("/big-a.png", 640)).toBe(url);
  expect(fetched).toHaveBeenCalledTimes(1);
  forgetThumb("/big-a.png");
  expect(peekThumb("/big-a.png", 640)).toBe("");
});

it("uses the original when it is already small or when anything fails", async () => {
  const { draw } = stage(700, 500);
  expect(await loadThumb("/small-a.png", 640)).toBe("/small-a.png");
  expect(draw).not.toHaveBeenCalled();
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
  expect(await loadThumb("/broken-a.png", 640)).toBe("/broken-a.png");
  expect(await loadThumb("data:image/png;base64,AA", 640)).toBe("data:image/png;base64,AA");
});
