// i18n 硬校验：三道关，任何一道不过就让构建失败。
//
// 起因是一次真实事故：十几条新文案只写了 zh-CN 就发布，其余七种语言直接
// 在界面上显示字面 `{v0}`。这类问题肉眼看 diff 永远看不全 —— 一条文案八份
// 语言，漏改任何一份都要等到运行时才炸。所以交给程序当关隘：
//
//   1. 结构：八个语言包的 key 树必须完全一致。
//   2. 占位符：每条字符串里 `{...}` 记号的集合必须与 zh-CN 完全一致 ——
//      多一个少一个都是运行时的字面大括号或者被吞掉的参数。
//   3. 引用：代码里 `t("…")` 写到的 key 必须真的存在于 zh-CN。
//
// 第三道是后加的，而且是最重要的一道：前两道只做语言包之间的横向比对，
// 一个**八份里都没有**的 key 可以一路绿灯过去，然后在界面上显示成
// `s.a1b2c3` 这样的原始 key。加上这道之后当场就查出了另一个产品里九条
// 这样的 key，其中两条是主页的标题和副标题。

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const LOCALES_DIR = join(ROOT, "i18n", "locales");
const SRC_DIR = join(ROOT, "src");
const BASE = "zh-CN";
const OTHERS = ["zh-TW", "en-US", "ja-JP", "ko-KR", "es-ES", "fr-FR", "ru-RU"];

const TOKEN = /\{[^{}]*\}/g;

/** 语言包压平成 dotted-key -> string。 */
function flatten(value, prefix, out) {
  if (typeof value !== "object" || value === null) {
    out[prefix] = String(value);
    return;
  }
  if (Array.isArray(value)) {
    // 有意义的数组按 id 对齐，缺哪一条一目了然；没有 id 就退回下标。
    value.forEach((entry, i) => {
      if (entry && typeof entry === "object" && "id" in entry) {
        for (const [k, v] of Object.entries(entry)) {
          if (k === "id") continue;
          flatten(v, `${prefix}.${entry.id}.${k}`, out);
        }
      } else {
        flatten(entry, `${prefix}.${i}`, out);
      }
    });
    return;
  }
  for (const [k, v] of Object.entries(value)) {
    flatten(v, `${prefix}${prefix ? "." : ""}${k}`, out);
  }
}

function tokens(s) {
  return (s.match(TOKEN) || []).sort().join("|");
}

const packs = {};
for (const loc of [BASE, ...OTHERS]) {
  const raw = readFileSync(join(LOCALES_DIR, `${loc}.json`), "utf-8");
  packs[loc] = {};
  flatten(JSON.parse(raw), "", packs[loc]);
}

const problems = [];
const base = packs[BASE];
const baseKeys = new Set(Object.keys(base));

// ── 1 + 2：结构与占位符 ────────────────────────────────────────────────
for (const loc of OTHERS) {
  const pack = packs[loc];
  const packKeys = new Set(Object.keys(pack));

  for (const k of baseKeys) {
    if (!packKeys.has(k)) {
      problems.push(`${loc}: 缺 key「${k}」`);
      continue;
    }
    const a = tokens(base[k]);
    const b = tokens(pack[k]);
    if (a !== b) {
      problems.push(
        `${loc}: 「${k}」占位符不一致\n    ${BASE}: ${a || "（无）"}\n    ${loc}: ${b || "（无）"}`,
      );
    }
  }
  for (const k of packKeys) {
    if (!baseKeys.has(k)) problems.push(`${loc}: 多出 ${BASE} 没有的 key「${k}」`);
  }
}

// ── 3：代码里引用到的 key 必须存在 ─────────────────────────────────────
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

/** 先去掉注释再扫。注释里出现的 key 不是引用，不该被当成引用，
 *  否则「注释里提了一个已删除的 key」会让构建失败。 */
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

// t("key") / t('key') / t(`key`)，第二个参数随意。
// 变量 key（t(d.labelKey)）扫不到也不该扫 —— 那种只能靠人看。
const CALL = /\bt\(\s*["'`]([^"'`]+)["'`]/g;

for (const file of walk(SRC_DIR)) {
  const code = stripComments(readFileSync(file, "utf-8"));
  const rel = relative(ROOT, file);
  let m;
  while ((m = CALL.exec(code)) !== null) {
    const key = m[1];
    if (!baseKeys.has(key)) {
      problems.push(`${rel}: 引用了 ${BASE} 里没有的 key「${key}」`);
    }
  }
}

if (problems.length) {
  console.error(`i18n 校验失败，共 ${problems.length} 处：\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `i18n 校验通过：${OTHERS.length + 1} 个语言包 × ${baseKeys.size} 条，结构、占位符、代码引用一致`,
);
