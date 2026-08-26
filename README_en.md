# TRM UI

The UI/UX template behind Turing Mirror Software's desktop products: design tokens, a component library, eight-language i18n, and a build setup that runs as-is.

Extracted from the interface layer of [RVC Fabric](https://github.com/Turing-Mirror/RVC-Fabric). **It contains no product code.**

[简体中文](./README.md)

---

## Why it exists

"Copy RVC Fabric's UI" kept getting carried out as "fork the whole repository and hack on it". Every new product started from a pile of code it never needed, and the design system was kept in sync by hand — drifting a little further with every pass.

Pulling the interface layer out on its own means new products start here, and improvements flow back here — instead of into five diverging copies.

## What's inside

```
src/trm/                 ← the template itself; copy the whole directory
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
└── lib/                 nav / clipboard / appearance

src/index.css            design tokens + themes + animations  ← the core asset
src/pages/               demo gallery (delete it)
i18n/locales/*.json      the eight locale packs
scripts/check_i18n.mjs   three hard i18n checks
index.html               blank-window guard
```

## Running it

```bash
npm install && npm run dev
```

Open http://localhost:1410 — a component gallery where everything is a live control.

```bash
npm run build
```

The build runs `eslint` → `tsc` → `check_i18n` → `vite build`, stopping at the first failure.

## Three hard rules

**1. Every colour comes from a token.** A hard-coded colour is guaranteed wrong in the other theme, and only visible when someone switches — meaning no step of normal development will ever catch it.

**2. Every string comes from a locale pack.** All eight are forced into the same shape by `scripts/check_i18n.mjs` at build time. It checks three things: structural alignment, placeholder alignment, and **that every key referenced by `t("…")` in the source actually exists**. The third matters most — the first two only compare packs against each other, so a key missing from all eight sails straight through and then renders as `s.a1b2c3` on screen.

**3. `src/trm/` imports nothing outside itself** — react and the locale packs aside. The moment it reaches into product code, the template degrades into "part of one product", which is the problem it exists to solve.

## The theme has three states, not two

This is the easiest thing to get wrong, and getting it wrong means some users see white text on white.

| User setting | `<html>` | Distinguished by |
| --- | --- | --- |
| Explicitly light | `data-theme="light"` | the attribute |
| Explicitly dark | `data-theme="dark"` | the attribute |
| Follow system (default) | *no attribute* | `prefers-color-scheme` |

So dark has to be written twice: once inside the media query (guarded with `:not([data-theme="light"])` so an explicit light choice beats a dark OS), and once under `[data-theme="dark"]`.

**No colour may have its only definition inside a media query or a `[data-theme]` block** — such a colour simply does not exist in the default "follow system" state.

## Wiring it into Tauri

The template does not depend on Tauri and runs fine as a plain web page. There are only three injection points.

**Locale persistence** — defaults to `localStorage`; swap in your config commands:

```tsx
<I18nProvider store={{
  load: () => invoke<Config>("config_get").then((c) => c.ui_locale),
  save: (code) => void invoke("config_set", { patch: { ui_locale: code } }),
}}>
```

**Window buttons** — omit `windowControls` and the three buttons are not drawn at all. In a plain browser they would do nothing, and a button that looks clickable but isn't is worse than no button:

```tsx
const w = getCurrentWindow();
<TitleBar
  windowControls={{
    minimize: () => void w.minimize(),
    toggleMaximize: () => void w.toggleMaximize(),
    close: () => void w.close(),
  }}
  …
/>
```

**Crash logging** — so a user report carries the cause:

```tsx
<ErrorBoundary onError={(detail) => void invoke("ui_log", { line: detail })}>
```

If the wallpaper is a local file, pass `convertFileSrc` as the second argument to `applyAppearance`.

The blank-window guard in `index.html` and `stripCrossorigin` in `vite.config.ts` are both there for Tauri and harmless on the web: the first covers "the bundle never loaded at all", the second covers the whole-window white-out caused by `crossorigin` blocking script loads over a custom protocol.

## Starting a new product from this

1. Copy the repository. Change `name` in `package.json`, `<title>` in `index.html`, and `port` in `vite.config.ts` (each product needs its own port, or WebView2's per-port cache will bleed between them).
2. Delete `src/pages/` and write your own.
3. Delete the `demo` node from the locale packs; keep `ui` and `locale`.
4. Edit `createNav` in `src/App.tsx` — its order is what page-transition direction is derived from.
5. Replace `TitleBar`'s `brand`.

## About the comments

The source is heavily commented in Chinese, and most comments explain why something cannot be rewritten the more obvious-looking way. They are not chatter — each one stands on a bug that already happened: a knob that lagged behind the cursor, a seam at the window edge during page transitions, a segment thumb stuck at the old language's width, a help mark that toggled the switch it was explaining.

Deleting them would not shorten the code by much. It would just make the next person step on the same rakes.

## Licence

MIT. See [LICENSE](./LICENSE).
