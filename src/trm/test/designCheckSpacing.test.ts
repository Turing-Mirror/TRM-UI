import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";

const tempDirs: string[] = [];
const scriptPath = path.resolve(import.meta.dirname, "../../../scripts/design_check.mjs");

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function runCheck(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "trm-spacing-check-"));
  tempDirs.push(root);
  fs.writeFileSync(path.join(root, "design-baseline.json"), JSON.stringify({ spacing: 0 }) + "\n");
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  try {
    const stdout = execFileSync(process.execPath, [scriptPath, "--list"], { cwd: root, encoding: "utf8" });
    return { status: 0, output: stdout };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, output: `${e.stdout ?? ""}\n${e.stderr ?? ""}` };
  }
}

it("flags odd integer pixel spacing in Tailwind arbitrary classes and CSS declarations", () => {
  const res = runCheck({
    "src/Sample.tsx": `<div className="gap-[11px] -mt-[7px] px-[12px] gap-1.5 px-2.5" />\n`,
    "src/sample.css": `.a { padding: 7px 9px; margin-block-end: 15px; row-gap: 5px; padding-inline: 23.5px 16px; }\n`,
  });
  expect(res.status).toBe(1);
  expect(res.output).toContain("src/Sample.tsx:1  11");
  expect(res.output).toContain("src/Sample.tsx:1  7");
  expect(res.output).not.toContain("src/Sample.tsx:1  12");
  expect(res.output).toContain("src/sample.css:1  7");
  expect(res.output).toContain("src/sample.css:1  9");
  expect(res.output).toContain("src/sample.css:1  15");
  expect(res.output).toContain("src/sample.css:1  5");
  expect(res.output).not.toContain("23.5");
  expect(res.output).not.toContain("src/sample.css:1  16");
});

it("passes when only Tailwind scales, even pixels, decimals, or design-allow exceptions are present", () => {
  const res = runCheck({
    "src/Allowed.tsx": [
      `const ok = <div className="gap-1.5 px-2.5 py-2 gap-[12px] mb-[16px]" />;`,
      `// design-allow: optical alignment`,
      `const allowed = <div className="px-[13px]" />;`,
    ].join("\n"),
    "src/allowed.css": `.ok { padding-inline: 23.5px 16px; gap: 12px; margin: 0 8px; --row-padding: 7px; }\n`,
  });
  expect(res.status).toBe(0);
});
