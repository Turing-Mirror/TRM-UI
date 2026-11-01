import { build } from "vite";
import react from "@vitejs/plugin-react";
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
    lib: { entry: resolve(root, "src/trm/index.ts"), formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: id => /^(react|react-dom|@tauri-apps\/api)(\/|$)/.test(id) },
  },
});
await cp(resolve(root, "src/trm/styles"), resolve(root, "lib/styles"), { recursive: true });
