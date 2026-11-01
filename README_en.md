# TRM UI

Shared frontend foundation and reference design system for the Turing Mirror family of desktop applications. **It contains no product code.**

[中文](./README.md)

---

TRM UI has no separate specification documents. The interface is the example and the code is the explanation: each rule is written once in a data file, the gallery renders it, people see the result on screen, and agents read the same file.

## How an agent uses this project

1. **Look at the interface first.** Run `npm install && npm run dev` and open http://localhost:1410. Every page in the sidebar is both a rule and a working example.
2. **Find the code with this table.**

   | Sidebar | Content | Code |
   | --- | --- | --- |
   | Overview | Shell, theme, overall structure | `src/pages/OverviewPage.tsx` |
   | Components | All base components | `src/pages/ComponentsPage.tsx`, `src/trm/components/` |
   | Patterns | Full-page patterns: lists, details, cleanup, downloads | `src/pages/PatternsPage.tsx`, `src/pages/MorePatterns.tsx` |
   | Interaction | Interaction rules, each with a working wrong and right demo | `src/pages/interactionRules.ts`, `src/pages/ruleDemos.tsx`, `src/pages/InteractionPage.tsx` |
   | Copy | How interface text is written, with wrong and right examples | `src/pages/textRules.ts` |
   | Typography | Font size scale | `src/pages/TypePage.tsx` |
   | Color | Colour variables and what each is for | `src/pages/colorRoles.ts`, `src/index.css` |
   | Motion | Curves, plus the name, description and demo of each motion | `src/pages/motionTerms.ts`, `src/pages/MotionPage.tsx`, `src/trm/components/motion.tsx`, `src/index.css` |
   | History | Established designs that were replaced, by date | `src/pages/historyEntries.ts` |
   | Settings | How a settings page is built | `src/pages/SettingsPage.tsx` |

3. **When building a product interface:** take components from `src/trm/`, use only the variables in `src/index.css` for colour, write text by `textRules.ts`, handle interaction by `interactionRules.ts`, and use the names in `motionTerms.ts` when discussing motion.
4. **When replacing an established design:** add an entry to `historyEntries.ts` with the date, the old design, the new one and the reason.
5. **When changing a rule:** edit its data file and fill in all eight languages; `tsc` fails if one is missing, and the gallery page updates by itself. Do not add Markdown documents and do not copy rules into product repositories.
6. **When changing a component:** `app/src/trm/` in each product repository is a copy of `src/trm/` here. After changing it here, copy the changed files over.
7. **When done:** run `npm run build`, which runs eslint, tsc, the i18n check and vite build in order and stops at the first failure.

The reasons behind each choice are in code comments, most of them explaining why a more obvious-looking version does not work. Each one comes from a problem that already happened; do not delete them.

## Layout

```
src/trm/                 the interface template that products copy
├── components/          all components; entry point is src/trm/index.ts
├── i18n/                eight languages, bundled at build time, switched synchronously
└── lib/                 navigation, clipboard, appearance, the shell bridge (host.ts), hotkeys, mouse side buttons
src/index.css            colours, radii, curves, three-state theme, animation classes
src/pages/               gallery pages and rule data
i18n/locales/*.json      eight locale packs, shared by the interface and the shell
scripts/check_i18n.mjs   checks locale structure, placeholders and references from code
index.html               blank-window fallback

src-tauri/src/           desktop shell
├── lib.rs               start-up order, commands, two watchdogs
├── window_watch.rs      frameless window: corners, maximise, recovering a lost window
├── ui_assets.rs         custom protocol serving the interface; frontend/ next to the exe can replace it
├── config.rs            app_config.json: atomic writes, broken files kept aside, defaults filled in
├── logging.rs           shell.log, one file per day
├── i18n.rs              shell-side translation using the same locale packs
├── paths.rs             product root and User_Data
├── tray.rs              tray icon
├── autostart.rs         start with Windows (registry)
└── asset_scope.rs       runtime allow-list for the asset protocol
```

## Run and build

```bash
npm install && npm run dev          # interface only, no Rust needed
npm install && npm run tauri:dev    # with the desktop shell
npm run build                       # eslint, tsc, i18n check, vite build
npm run tauri:build                 # all of the above plus the installer
cargo test --manifest-path src-tauri/Cargo.toml
```

## Three hard rules

1. **Colours come only from variables.** A hard-coded colour is always wrong in the other theme, and that only shows when someone switches themes.
2. **Interface text comes only from the locale packs.** `scripts/check_i18n.mjs` checks at build time that all eight languages share the same structure and placeholders, and that every key used in `t("…")` exists.
3. **`src/trm/` imports nothing outside itself**, except react, the locale packs and the single bridge in `host.ts`. Once it imports product code, the template becomes part of one product.

## Starting a new product

1. Copy `src/trm/`, `src/index.css`, `i18n/`, `scripts/`, `src-tauri/` and the build configuration. The gallery pages and rule data stay in TRM UI; come back here to read them.
2. Change `name` in `package.json`, `<title>` in `index.html` and the port in `vite.config.ts`. Each product needs its own port, otherwise WebView2's per-port cache gets mixed up.
3. Change the six commented places in the shell:

   | Where | What |
   | --- | --- |
   | `src-tauri/tauri.conf.json` | `productName`, `identifier`, `devUrl` port |
   | `src-tauri/src/lib.rs` | `APP_TITLE` |
   | `src-tauri/src/paths.rs` | `ROOT_MARKERS`: pick a file that always ships with the product |
   | `src-tauri/src/autostart.rs` | `VALUE_NAME`; never change it after release |
   | `src-tauri/src/config.rs` | add the product's own keys in `defaults()` |
   | `src-tauri/icons/` | `npx tauri icon your-logo.png -o src-tauri/icons` |

4. Keep only `ui` and `locale` in the locale packs; `demo` belongs to the gallery.
5. List the pages in `createNav` in `src/App.tsx`. The order sets the direction of the page transition.

## Licence

MIT. See [LICENSE](./LICENSE).
