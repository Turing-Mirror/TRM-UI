import { useEffect, useState } from "react";

/**
 * 缩略图：大图在列表里只显示成一小块时，先缩成小图再交给 <img>。
 *
 * 一张 4000 像素的原图解码后占几十兆内存，显示出来却只有两百像素宽。这里把原图缩到
 * 指定边长，存进浏览器的本地数据库，之后每次打开都只读小图。原图本来就不大的原样使用。
 *
 * 任何一步失败（环境不支持、跨域读不到、图片损坏）都退回原图地址，由 <img> 自己处理。
 */

/** 列表封面的默认边长：两百像素宽的框在两倍屏上够清晰。 */
export const THUMB_PX = 640;
/** 原图最长边不超过目标的这个倍数时不缩。 */
const KEEP_RATIO = 1.25;
const DB_NAME = "trm-thumbs";
const STORE = "v1";
/** 本地数据库里最多留这么多条，超过就清空重来。 */
const MAX_ENTRIES = 800;
const QUALITY = 0.86;

/** 本次运行里已经算出来的结果：原图地址 → 可直接显示的地址。 */
const ready = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

type Stored = { blob: Blob | null };

const memoKey = (src: string, px: number) => `${px}|${src}`;

export function thumbSupported(): boolean {
  return (
    typeof createImageBitmap === "function" &&
    typeof fetch === "function" &&
    typeof indexedDB !== "undefined" &&
    typeof URL !== "undefined" &&
    typeof URL.createObjectURL === "function"
  );
}

/** 已经算好的缩略图地址；还没算过返回空串。 */
export function peekThumb(src: string, px = THUMB_PX): string {
  return ready.get(memoKey(src, px)) ?? "";
}

/** 原图换过内容（例如用户改了封面）之后调用，下次显示时重新生成。 */
export function forgetThumb(src: string): void {
  for (const key of [...ready.keys()]) if (key.endsWith(`|${src}`)) ready.delete(key);
}

/** 取缩略图地址。失败时返回原图地址。 */
export function loadThumb(src: string, px = THUMB_PX): Promise<string> {
  if (!src || !thumbSupported() || src.startsWith("data:") || src.startsWith("blob:")) return Promise.resolve(src);
  const key = memoKey(src, px);
  const hit = ready.get(key);
  if (hit) return Promise.resolve(hit);
  const running = pending.get(key);
  if (running) return running;
  const job = build(src, px)
    .catch(() => src)
    .then((url) => {
      ready.set(key, url);
      pending.delete(key);
      return url;
    });
  pending.set(key, job);
  return job;
}

async function build(src: string, px: number): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) return src;
  const blob = await res.blob();
  // 同一个地址的文件换了内容，字节数几乎一定会变：用它区分新旧。
  const dbKey = `${px}|${blob.size}|${src}`;
  const stored = await dbGet(dbKey);
  if (stored) return stored.blob ? URL.createObjectURL(stored.blob) : src;
  const bitmap = await createImageBitmap(blob);
  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= px * KEEP_RATIO) {
      void dbPut(dbKey, { blob: null });
      return src;
    }
    const scale = px / longest;
    const small = await shrink(bitmap, Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
    void dbPut(dbKey, { blob: small });
    return URL.createObjectURL(small);
  } finally {
    bitmap.close();
  }
}

async function shrink(bitmap: ImageBitmap, width: number, height: number): Promise<Blob> {
  if (typeof OffscreenCanvas === "function") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.convertToBlob({ type: "image/webp", quality: QUALITY });
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/webp", QUALITY);
  });
}

let dbOpen: Promise<IDBDatabase | null> | null = null;

function db(): Promise<IDBDatabase | null> {
  dbOpen ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbOpen;
}

async function dbGet(key: string): Promise<Stored | null> {
  const d = await db();
  if (!d) return null;
  return new Promise((resolve) => {
    try {
      const req = d.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Stored | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function dbPut(key: string, value: Stored): Promise<void> {
  const d = await db();
  if (!d) return;
  try {
    const store = d.transaction(STORE, "readwrite").objectStore(STORE);
    const count = store.count();
    count.onsuccess = () => {
      if (count.result >= MAX_ENTRIES) store.clear();
      store.put(value, key);
    };
  } catch {
    /* 存不进去就下次再算 */
  }
}

/**
 * 给 <img> 用的地址：有缩略图用缩略图，否则原图。
 * 还在生成时返回空串，调用方先画占位。环境不支持时直接返回原图地址。
 */
export function useThumb(src: string | undefined, px = THUMB_PX): string {
  const source = src ?? "";
  const direct = !source || !thumbSupported() ? source : peekThumb(source, px);
  const [loaded, setLoaded] = useState<{ src: string; url: string } | null>(null);
  useEffect(() => {
    if (direct || !source) return;
    let alive = true;
    void loadThumb(source, px).then((url) => {
      if (alive) setLoaded({ src: source, url });
    });
    return () => {
      alive = false;
    };
  }, [source, px, direct]);
  if (direct) return direct;
  return loaded && loaded.src === source ? loaded.url : "";
}
