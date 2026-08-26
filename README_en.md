# TRM UI

The UI/UX template behind Turing Mirror Software's desktop products: design tokens, a component library, eight-language i18n, and a Tauri shell that opens a real window.

Extracted from [RVC Fabric](https://github.com/Turing-Mirror/RVC-Fabric). **It contains no product code.**

[简体中文](./README.md)

---

## Why it exists

"Copy RVC Fabric's UI" kept getting carried out as "fork the whole repository and hack on it". Every new product started from a pile of code it never needed, and the design system was kept in sync by hand — drifting a little further with every pass.

Pulling the interface layer out on its own means new products start here, and improvements flow back here — instead of into five diverging copies.

## What's inside

```
src/trm/                 ← the UI template; copy the whole directory
├── index.ts             barrel export
├── components/
│   ├── ui.tsx           PagePad PageHead Block Group Btn ListItem
│   ├── controls.tsx     Field Select RangeBar Slider Toggle
│   ├── SegmentControl.tsx
│   ├── Tooltip.tsx      Tooltip HelpMark
│   ├── TitleBar.tsx     title bar for a frameless window
│   ├── PageHost.tsx     directional page transitions
│   └── ErrorBoundary.tsx
├── i18n/                eight locales, bundled at build time
└── lib/                 nav / clipboard / appearance / host

src/index.css            design tokens + themes + animations  ← the core asset
src/pages/               demo gallery (delete it)
i18n/locales/*.json      locale packs, shared by the UI and the shell
scripts/check_i18n.mjs   three hard i18n checks
index.html               blank-window guard

src-tauri/               ← the desktop shell
├── src/
│   ├── lib.rs           startup order, commands, two watchdogs
│   ├── window_watch.rs  frameless windows: corners, maximize clamp, rescue
│   ├── ui_assets.rs     custom protocol; a frontend/ next to the exe wins
│   ├── config.rs        app_config.json — atomic writes, corrupt files kept
│   ├── logging.rs       shell.log, one file per day, 48h retention
│   ├── i18n.rs          shell-side translation, same packs as the UI
│   ├── paths.rs         product root / User_Data
│   ├── tray.rs          tray icon
│   ├── autostart.rs     start with Windows (registry)
│   └── asset_scope.rs   runtime asset-protocol allowlist
└── icons/
```


## Running it

**UI only** (no Rust toolchain needed):

```bash
npm install && npm run dev
```

Open http://localhost:1410 — a component gallery where everything is a live control.

**With the shell**:

```bash
npm install && npm run tauri:dev
```

You get a frameless window: system-drawn rounded corners on Win11, working title-bar
buttons, a tray icon, and a log at `User_Data/logs/shell/`.

**Building**:

```bash
npm run build          # eslint → tsc → check_i18n → vite build
npm run tauri:build    # all of the above + installers
cargo test --manifest-path src-tauri/Cargo.toml
```

Each stops at the first failure.

## Three hard rules

**1. Every colour comes from a token.** A hard-coded colour is guaranteed wrong in the other theme, and only visible when someone switches — meaning no step of normal development will ever catch it.

**2. Every string comes from a locale pack.** All eight are forced into the same shape by `scripts/check_i18n.mjs` at build time. It checks three things: structural alignment, placeholder alignment, and **that every key referenced by `t("…")` in the source actually exists**. The third matters most — the first two only compare packs against each other, so a key missing from all eight sails straight through and then renders as `s.a1b2c3` on screen.

**3. `src/trm/` imports nothing outside itself** — react, the locale packs, and the single `host.ts` bridge aside. The moment it reaches into product code, the template degrades into "part of one product", which is the problem it exists to solve.

## The theme has three states, not two

This is the easiest thing to get wrong, and getting it wrong means some users see white text on white.

| User setting | `<html>` | Distinguished by |
| --- | --- | --- |
| Explicitly light | `data-theme="light"` | the attribute |
| Explicitly dark | `data-theme="dark"` | the attribute |
| Follow system (default) | *no attribute* | `prefers-color-scheme` |

So dark has to be written twice: once inside the media query (guarded with `:not([data-theme="light"])` so an explicit light choice beats a dark OS), and once under `[data-theme="dark"]`.

**No colour may have its only definition inside a media query or a `[data-theme]` block** — such a colour simply does not exist in the default "follow system" state.

## How the UI and the shell meet

**The UI does not depend on the shell.** Everything that talks to it is collected in a
single file, `src/trm/lib/host.ts`, and every capability degrades quietly when there is
no shell:

| Capability | With the shell | Without (browser) |
| --- | --- | --- |
| Locale persistence | `app_config.json` | `localStorage` |
| Window buttons | minimize / maximize / close | **not drawn** |
| Crash logging | into `shell.log` | console only |
| "UI mounted" signal | feeds the blank-window watchdog | no-op |

In a browser the window buttons are *not drawn* rather than drawn-but-dead: a button
that looks clickable and does nothing reads as a broken app.

Shell detection reads `window.__TAURI_INTERNALS__` instead of try/catching an invoke —
the latter leaves an alarming error in the console.

## What the shell gets right

Each of these was learned the hard way; the comments carry the story:

**Frameless windows** (`window_watch.rs`). Rounded corners on Win11 come from a DWM
attribute, not from "transparent window + CSS radius" — that approach loses the system
shadow and leaves aliased corners. Windows 10 has no such attribute, so it falls back to
clipping with `SetWindowRgn`. The maximized size is clamped to the work area **before it
lands**, in `WM_WINDOWPOSCHANGING`, not afterwards with `SetWindowPos` — doing it
afterwards destroys the restore rectangle and the window can never shrink back.
`WM_NCCALCSIZE` always gives the client area the whole window, otherwise Windows 10
leaves a strip of non-client area nobody paints: the notorious vertical band that appears
on the left edge after you drag the window and never goes away.

**A window that got lost can be found.** `.center()` only knows the primary monitor, and
people with two screens are usually looking at the other one — the window and its taskbar
button both go somewhere invisible, which is indistinguishable from "it never launched".
So the window is placed on whichever monitor the cursor is on.

**Two watchdogs** (`lib.rs`). "It opens blank" and "it hangs on open" are the two failures
a user cannot describe and we cannot see. The first is caught by the UI-mounted signal plus
asset-request counters ("0 served" and "12 served, 1 missing" are completely different
bugs). The second is caught by pinging the event loop from a plain thread: whether those
lines are in the log separates "the Rust side stopped" from "the webview wedged".

**The UI ships separately** (`ui_assets.rs`). It is served over a custom protocol, so a
`frontend/` directory next to the exe replaces the bundled copy without rebuilding the
binary. UI-only patches can therefore be tiny.

**Settings do not get lost** (`config.rs`). Atomic writes (temp file + rename); a file that
fails to parse is renamed aside rather than overwritten; keys added by an upgrade are
filled from defaults instead of reading back null.

## Starting a new product from this

1. Copy the repository. Change `name` in `package.json`, `<title>` in `index.html`, and
   `port` in `vite.config.ts` (each product needs its own port, or WebView2's per-port
   cache will bleed between them).
2. Six places in the shell need your product's details; all are commented:

   | File | What to change |
   | --- | --- |
   | `src-tauri/tauri.conf.json` | `productName` / `identifier` / `devUrl` port |
   | `src-tauri/src/lib.rs` | `APP_TITLE` |
   | `src-tauri/src/paths.rs` | `ROOT_MARKERS` — pick a file that always ships |
   | `src-tauri/src/autostart.rs` | `VALUE_NAME`, and **never change it after release** |
   | `src-tauri/src/config.rs` | add your keys to `defaults()` |
   | `src-tauri/icons/` | `npx tauri icon your-logo.png -o src-tauri/icons` |

3. Delete `src/pages/` and write your own.
4. Delete the `demo` node from the locale packs; keep `ui` and `locale`.
5. Edit `createNav` in `src/App.tsx` — its order is what page-transition direction is
   derived from.
6. Replace `TitleBar`'s `brand`.

## About the comments

The source is heavily commented in Chinese, and most comments explain why something cannot be rewritten the more obvious-looking way. They are not chatter — each one stands on a bug that already happened: a knob that lagged behind the cursor, a seam at the window edge during page transitions, a segment thumb stuck at the old language's width, a help mark that toggled the switch it was explaining.

Deleting them would not shorten the code by much. It would just make the next person step
on the same rakes. Several passages in `window_watch.rs` say "this used to do X — do not
put it back"; those cost the most to learn.

## Licence

MIT. See [LICENSE](./LICENSE).
