#!/usr/bin/env node
/**
 * 设计规范检查：在源码里找规范之外的字号、圆角、时长、层叠数值和手写输入框。
 *
 *   trm-design-check            检查，数量超过基线时失败
 *   trm-design-check --update   把当前数量写成新的基线
 *   trm-design-check --list     列出每一处
 *
 * 基线文件 design-baseline.json 记下每条规则现有的数量。检查只在数量增加时失败，
 * 存量慢慢清，新增的拦住。数量降了会提示下调基线。
 *
 * 自定义的三种方式：
 * - design-check.config.json 里改 allow（允许的数值）、include（检查的目录）、rules（关掉某条规则）。
 * - 个别例外：在那一行或上一行写注释 design-allow: 原因。
 * - 用变量：var(--xxx) 不在检查范围内，覆盖变量就是合法的自定义。
 */
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const args = new Set(process.argv.slice(2));

const DEFAULTS = {
  include: ["src"],
  exclude: ["node_modules", "dist", "lib", "frontend", ".test.", "/test/", "/i18n/"],
  extensions: [".tsx", ".ts", ".css"],
  baseline: "design-baseline.json",
  rules: { fontSize: true, radius: true, duration: true, zIndex: true, rawInput: true },
  allow: {
    // 字号七档。
    fontSize: [25, 22, 16, 15, 13, 12.5, 11.5],
    // 圆角只有 --r 和 --rs 两档；这里列的是允许直接写的小圆角（角标、进度条）。
    radius: [0, 2, 3, 4, 999, 9999],
    // 时长四档。
    duration: [0, 100, 200, 300, 420],
    // 层叠五层。
    zIndex: [0, 1, 10, 100, 200, 300],
  },
};

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const user = readJson(path.join(cwd, "design-check.config.json")) ?? {};
const config = {
  ...DEFAULTS,
  ...user,
  rules: { ...DEFAULTS.rules, ...user.rules },
  allow: { ...DEFAULTS.allow, ...user.allow },
};

const num = (list) => new Set(list.map(Number));
const allowed = {
  fontSize: num(config.allow.fontSize),
  radius: num(config.allow.radius),
  duration: num(config.allow.duration),
  zIndex: num(config.allow.zIndex),
};

/** 每条规则：从一行里找出数值，不在允许范围内的算一处。 */
const RULES = {
  fontSize: {
    label: "字号",
    hint: "用规范里的档位",
    patterns: [/\btext-\[(\d+(?:\.\d+)?)px\]/g, /\bfont-size:\s*(\d+(?:\.\d+)?)px/g],
    ok: (v) => allowed.fontSize.has(v),
  },
  radius: {
    label: "圆角",
    hint: "用 var(--r) 或 var(--rs)",
    patterns: [/\brounded(?:-[trbl]{1,2})?-\[(\d+(?:\.\d+)?)px\]/g, /\bborder-radius:\s*(\d+(?:\.\d+)?)px/g],
    ok: (v) => allowed.radius.has(v),
  },
  duration: {
    label: "时长",
    hint: "用四档时长",
    patterns: [/\bduration-\[(\d+)ms\]/g, /\bduration-(\d+)\b/g, /\btransition(?:-duration)?:[^;]*?\b(\d+)ms/g, /\banimation(?:-duration)?:[^;]*?\b(\d+)ms/g],
    ok: (v) => allowed.duration.has(v),
  },
  zIndex: {
    label: "层叠",
    hint: "用五层里的数值",
    patterns: [/\bz-\[(\d+)\]/g, /\bz-(\d+)\b/g, /\bz-index:\s*(\d+)/g],
    ok: (v) => allowed.zIndex.has(v),
  },
  rawInput: {
    label: "手写输入框",
    hint: "用 TRM UI 的输入组件",
    patterns: [/<(input|textarea|select)\b(?![^>]*type="(?:checkbox|radio|file|range|hidden|color)")/g],
    ok: () => false,
    numeric: false,
  },
};

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = full.split(path.sep).join("/");
    if (config.exclude.some((skip) => rel.includes(skip))) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (config.extensions.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
}

const files = [];
for (const dir of config.include) walk(path.join(cwd, dir), files);

const found = [];
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const isCss = file.endsWith(".css");
  lines.forEach((line, i) => {
    if (line.includes("design-allow:") || (i > 0 && lines[i - 1].includes("design-allow:"))) return;
    for (const [id, rule] of Object.entries(RULES)) {
      if (!config.rules[id]) continue;
      if (id === "rawInput" && isCss) continue;
      for (const pattern of rule.patterns) {
        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(line))) {
          const value = rule.numeric === false ? m[1] : Number(m[1]);
          if (rule.numeric !== false && rule.ok(value)) continue;
          found.push({ rule: id, file: path.relative(cwd, file).split(path.sep).join("/"), line: i + 1, value });
        }
      }
    }
  });
}

const counts = {};
for (const id of Object.keys(RULES)) if (config.rules[id]) counts[id] = found.filter((f) => f.rule === id).length;

const baselineFile = path.join(cwd, config.baseline);

if (args.has("--list")) {
  for (const f of found) console.log(`${RULES[f.rule].label}  ${f.file}:${f.line}  ${f.value}`);
}

if (args.has("--update")) {
  fs.writeFileSync(baselineFile, JSON.stringify(counts, null, 2) + "\n");
  console.log(`基线已更新：${JSON.stringify(counts)}`);
  process.exit(0);
}

const baseline = readJson(baselineFile);
if (!baseline) {
  console.error(`没有基线文件 ${config.baseline}。先运行 trm-design-check --update。`);
  process.exit(1);
}

let failed = false;
const lower = [];
for (const [id, count] of Object.entries(counts)) {
  const limit = baseline[id] ?? 0;
  if (count > limit) {
    failed = true;
    console.error(`${RULES[id].label}：规范之外的写法有 ${count} 处，基线是 ${limit} 处。${RULES[id].hint}，或在那一行加 design-allow: 原因。`);
    const byFile = new Map();
    for (const f of found.filter((x) => x.rule === id)) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
    for (const [file, n] of [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.error(`  ${file}  ${n} 处`);
    console.error("  运行 trm-design-check --list 查看每一处。");
  } else if (count < limit) {
    lower.push(`${RULES[id].label} ${limit} → ${count}`);
  }
}

if (failed) process.exit(1);
if (lower.length) console.log(`设计规范检查通过。数量已减少（${lower.join("，")}），可运行 trm-design-check --update 下调基线。`);
else console.log("设计规范检查通过。");
