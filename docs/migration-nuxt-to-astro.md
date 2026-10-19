# Migrating cadmus-web from Nuxt 4 to Astro

Status: **implemented** (branch `codex/nuxt-to-astro`).

## Why

The site is a single prerendered page plus static assets, deployed as a Cloudflare
Worker. Nuxt's Vue runtime, `@nuxt/ui`, `@nuxt/fonts`, and `@nuxt/image` were all
carrying weight the site never used: the only interactive behaviour was a loading
placeholder that a build-time render removes, and the font module was resolving two
local `.ttf` files while also downloading an unused JetBrains Mono family as 11
subset woff2 files. Astro renders the same page to static HTML with no client
framework, and keeps the Worker available for the planned admin/R2 upload routes.

## What changed

**Toolchain**

- `nuxt`, `vue`, `vue-router`, `@nuxt/ui`, `@nuxt/fonts`, `@nuxt/image`,
  `nitropack`, and `nitro-cloudflare-dev` are gone. `astro`, `@astrojs/cloudflare`,
  and `@tailwindcss/vite` replace them; `tailwindcss`, `wrangler`, and `@types/node`
  stay.
- `astro.config.mjs` uses `output: "server"` with the Cloudflare adapter. The
  homepage sets `export const prerender = true`, so it ships as static HTML while
  on-demand routes remain available for later work.
- The adapter's default KV session driver and Cloudflare Images binding are turned
  off (`session: false`, `imageService: "passthrough"`). Those defaults would have
  added `SESSION` and `IMAGES` bindings the Nuxt deploy never had.
- `wrangler.jsonc` no longer declares `main` or `assets`; the adapter injects both
  into the generated `dist/server/wrangler.json`, and `wrangler deploy` picks that up
  through `.wrangler/deploy/config.json`.
- `tsconfig.json` extends `astro/tsconfigs/strict` instead of the generated `.nuxt/*`
  projects. `env.d.ts` was deleted with its `h3` module augmentation.
- `.node-version` moved from 20 to 22 (Astro 7 requires Node >= 22.22).

**Code**

- `app/app.vue` became `src/layouts/Layout.astro`, carrying the head metadata. Astro
  has no `titleTemplate`, so the title is composed directly as
  `Cadmus - Product Design Studio`.
- `app/pages/index.vue` became `src/pages/index.astro`. `UApp`/`NuxtRouteAnnouncer`
  are gone, `UMain` is a plain `<main>`, and the `UButton` is an `<a href="mailto:...">`.
- `PortfolioGallery.vue` became `PortfolioGallery.astro`, importing
  `public/portfolio/index.json` and rendering every tile into the HTML. The client
  fetch, its loading/empty/error states, and Vue's `TransitionGroup` are gone; the
  40ms-per-tile stagger is now a CSS `@keyframes` reveal carrying the same delays.
- `app/assets/css/main.css` became `src/styles/global.css`, minus the `@nuxt/ui`
  import and the unused `--font-mono` stack. The stone palette values referenced from
  plain CSS rules are inlined (`#fafaf9`, `#f5f5f4`, `#57534e`, `#d6d3d1`) so the
  stylesheet does not depend on Tailwind emitting palette variables.
- Explicit `@font-face` rules were added for Haffer XH 400/600 against the existing
  `public/fonts/*.ttf` files, with both weights preloaded in the layout.
- Removed as dead: `tailwind.config.js` (unused Tailwind v3 config, CommonJS in an
  ESM package) and the unreferenced `public/fonts/family-400|500|600.ttf`.
- Empty Nuxt convention directories (`server/api`, `server/utils`, `shared`, `test`)
  were removed. Astro places endpoints under `src/pages/`.

## Result

The deployed HTTP surface is unchanged: `/` plus static assets. The prerendered HTML
contains all five gallery tiles in `order.json` order, so the page is complete before
any JavaScript runs. Entry CSS dropped from ~192 KB to ~15 KB, and the build no longer
contacts Google Fonts.

Build output moved from `.output/` to `dist/` (`dist/client/` for assets,
`dist/server/` for the Worker). The dev server moves from port 3000 to Astro's 4321.

## Verification performed

- `npm run build` succeeds and emits `dist/client/index.html` plus
  `dist/server/entry.mjs`.
- `npx wrangler deploy --dry-run` succeeds, reporting only the `env.ASSETS` binding
  with the same compatibility date, `nodejs_compat`, and observability settings as
  before.
- `astro preview` serves the built Worker; `/`, `/robots.txt`, `/favicon.ico`,
  `/logo/cadmus-logo.svg`, `/fonts/haffer-xh-400.ttf`, `/portfolio/index.json`, and
  `/portfolio/images/*.webp` all return 200 with the expected content types.

## Resolved issue: `astro dev` and the pinned Vite plugin

`npm run dev` initially failed at startup with an error reading `Missing field
moduleType`, thrown from the Cloudflare Vite plugin's dev-only runner path
(`runInRunnerObject` in `workers/runner-worker/index.js`) before the server bound a
port.

It is **not** caused by this migration. A bare-minimum `astro.config.mjs` containing
only `output: "server"` and `cloudflare()` fails identically, and the error is
unrelated to the workerd or miniflare version.

The actual cause is the Vite plugin version. `@astrojs/cloudflare` depends on
`@cloudflare/vite-plugin: ^1.63.1`, which npm resolves to `1.64.0`, and `1.64.0` breaks
the dev runner. Pinning `1.63.2` in `package.json` via `overrides` fixes it.

Verified with the pin in place: `npm run dev` serves the homepage and every static
asset, `npm run build` succeeds, and `wrangler deploy --dry-run` still reports only the
`env.ASSETS` binding. `1.63.1` also works; `1.64.0` does not.

## Note: `cf-typegen`

`npm run cf-typegen` still runs plain `wrangler types`, which reads `wrangler.jsonc`.
Because the adapter now owns the binding declarations, that no longer sees the
`ASSETS` binding, so it emits an empty `Env`. The tracked `worker-configuration.d.ts`
was therefore deliberately left as-is rather than regenerated.

When on-demand routes are added and the types actually matter, run the generator
against the adapter's output after a build instead:

```bash
npm run build
npx wrangler types --config dist/server/wrangler.json
```

That produces `ASSETS: Fetcher`, but also injects a machine-specific absolute path
into `Cloudflare.GlobalProps.mainModule`, so review the diff before committing.

## Deliberate non-goals

The admin upload flow from the original `Upload.MD` brief (R2 storage, session auth,
`POST /api/admin/upload`, `GET /api/images`) was never implemented and is still not
implemented. It is documented in `README.md` as planned work.
