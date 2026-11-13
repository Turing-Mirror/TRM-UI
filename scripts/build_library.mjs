import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cp, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localeDir = resolve(root, "i18n/locales");
// The gallery and library use the same translations. Only UI strings belong in
// the distributed package; gallery examples never enter product bundles.
const packs = {};
for (const file of (await readdir(localeDir)).filter(file => file.endsWith(".json")).sort()) {
  const { ui, locale } = JSON.parse(await readFile(resolve(localeDir, file), "utf8"));
  packs[file.slice(0, -5)] = { ui, locale };
}
const packsModule = resolve(root, "src/trm/i18n/packs.ts").replaceAll("\\", "/");
await build({
  root,
  configFile: false,
  plugins: [react(), {
    name: "trm-ui-library-locales",
    enforce: "pre",
    load(id) {
      if (id.replaceAll("\\", "/") === packsModule) {
        return `export const PACKS = ${JSON.stringify(packs)};`;
      }
    },
  }],
  build: {
    outDir: "lib",
    emptyOutDir: true,
    minify: false,
    // 两个入口：组件包，以及 Fabric 系列共用的代码。后者不引用前者，各自成一个文件。
    lib: {
      entry: { index: resolve(root, "src/trm/index.ts"), fabric: resolve(root, "src/trm/fabric/index.ts") },
      formats: ["es"],
      fileName: (_format, name) => `${name}.js`,
    },
    rollupOptions: { external: id => /^(react|react-dom|@tauri-apps\/api)(\/|$)/.test(id) },
  },
});
await cp(resolve(root, "src/trm/styles"), resolve(root, "lib/styles"), { recursive: true });

// 预编译样式表：不用 Tailwind 的项目直接引入 trm-ui/compiled.css 就能用全部组件。
// 里面是变量、组件样式，加上组件包自己用到的工具类。
await build({
  root,
  configFile: false,
  logLevel: "warn",
  plugins: [tailwindcss()],
  build: {
    outDir: "lib/styles",
    emptyOutDir: false,
    cssMinify: true,
    rollupOptions: {
      input: resolve(root, "scripts/compiled_entry.css"),
      output: { assetFileNames: "compiled.css" },
    },
  },
});
