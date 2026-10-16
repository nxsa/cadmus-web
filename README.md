# Cadmus Web

Marketing site for Cadmus, built with Astro and deployed as a Cloudflare Worker.
The homepage is prerendered to static HTML at build time; the Worker exists so
on-demand routes can be added later. Portfolio images live in
`public/portfolio/images/` and are rendered into the page from a generated manifest.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Astro, `output: "server"` with the homepage prerendered |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`, plus plain CSS in `src/styles/global.css` |
| Hosting | Cloudflare Workers via `@astrojs/cloudflare` |
| Client JS | None. The page is HTML and CSS only. |

## Prerequisites

- **Node.js 22.22 or newer.** Astro requires `>=22.22.0`. The pinned version lives in
  `.node-version`, so with `nvm` or `fnm` run `nvm use` or `fnm use`.
- **A Cloudflare account**, needed only for deploying. Local development and builds
  work without one.

## Setup

```bash
# 1. get the code
git clone git@github.com:nxsa/cadmus-web.git
cd cadmus-web

# 2. select the pinned Node version
nvm use            # or: fnm use

# 3. install dependencies
npm install

# 4. start the dev server
npm run dev        # http://localhost:4321
```

`npm install` triggers a `postinstall` step that runs `astro sync`, generating
`.astro/types.d.ts`. If types look stale after changing `astro.config.mjs`, re-run
`npx astro sync`.

No environment variables or secrets are needed for local work, and nothing under
`src/` reads `process.env` today.

## Development

| Command | Description |
| --- | --- |
| `npm run dev` | Astro dev server with HMR on <http://localhost:4321> |
| `npm run preview` | Build, then serve the production Worker locally via Wrangler |

`npm run dev` is the everyday loop. `npm run preview` runs the real build and serves
it through Wrangler, which is a closer approximation of the deployed Worker including
the `ASSETS` binding, at the cost of no HMR.

## Build and deploy

```bash
npm run build      # static assets -> dist/client, Worker -> dist/server
npm run deploy     # npm run build && wrangler deploy
```

Authenticate with Cloudflare once before your first deploy:

```bash
npx wrangler login
```

The deploy wiring is worth understanding, because it is not the usual Wrangler setup.
The `@astrojs/cloudflare` adapter writes the Worker's `main` entry and the `ASSETS`
asset binding into `dist/server/wrangler.json` at build time, and Wrangler reads that
through `.wrangler/deploy/config.json`. Expect a "Using redirected Wrangler
configuration" line on deploy. That is why `wrangler.jsonc` deliberately holds only
the settings that stay yours: the Worker `name`, `compatibility_date`,
`compatibility_flags`, and `observability`. Do not add `main` or `assets` to it.

## Project structure

| Path | Purpose |
| --- | --- |
| `astro.config.mjs` | Astro config: Cloudflare adapter, Tailwind, session and image bindings disabled |
| `wrangler.jsonc` | Worker name, compatibility date and flags, observability |
| `src/layouts/Layout.astro` | `<head>` metadata and the font preloads |
| `src/pages/index.astro` | The homepage, prerendered at build time |
| `src/components/PortfolioGallery.astro` | The gallery, rendered from the manifest |
| `src/styles/global.css` | Tailwind import, `@font-face` rules, layout CSS |
| `public/` | Served verbatim at the site root: fonts, logo, portfolio images |
| `scripts/generate-portfolio-index.mjs` | Builds the gallery manifest |
| `docs/migration-nuxt-to-astro.md` | History of the Nuxt to Astro migration |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Astro dev server on port 4321 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Build, then serve the Worker locally via Wrangler |
| `npm run deploy` | Build, then `wrangler deploy` |
| `npm run portfolio:index` | Regenerate `public/portfolio/index.json` |
| `npm run cf-typegen` | Regenerate `worker-configuration.d.ts` (see the caveat below) |

The `predev` and `prebuild` hooks regenerate the portfolio manifest first, so new
images are picked up whenever you restart either command.

## Static portfolio

Drop image files into `public/portfolio/images/`. Allowed extensions are `.webp`,
`.jpg`, `.jpeg`, `.png`, and `.avif`.

To control display order, list the filenames you want first in
`public/portfolio/images/order.json`. Any supported image not listed there is appended
automatically, newest first, so adding an image needs nothing more than placing the
file in that folder.

`public/portfolio/index.json` is the generated manifest the homepage reads at build
time. Regenerate it after adding images and commit it alongside them:

```bash
npm run portfolio:index
```

## Pinned dependency

`package.json` pins `@cloudflare/vite-plugin` to `1.63.2` via `overrides`. This pin is
load-bearing. With `1.64.0`, which `@astrojs/cloudflare`'s `^1.63.1` range would
otherwise resolve to, `npm run dev` dies at startup before the server binds a port,
reporting `Missing field moduleType`. Both `1.63.1` and `1.63.2` are verified working,
and `1.63.2` has been checked against `dev`, `build`, and `wrangler deploy --dry-run`.
Drop the override only once the bug is fixed upstream.

## Note on cf-typegen

`npm run cf-typegen` runs plain `wrangler types`, which reads `wrangler.jsonc`. Because
the adapter now owns the binding declarations, that no longer sees the `ASSETS`
binding and emits an empty `Env`, so the tracked `worker-configuration.d.ts` was left
as-is rather than regenerated. Once on-demand routes exist and those types matter,
generate against the adapter's output after a build instead:

```bash
npm run build
npx wrangler types --config dist/server/wrangler.json
```

That emits `ASSETS: Fetcher`, but it also injects a machine-specific absolute path into
`Cloudflare.GlobalProps.mainModule`, so review the diff before committing.

## Planned, not implemented

The following was specified in the original upload brief but is **not** part of this
codebase. Nothing below exists yet:

- Private `/admin/upload` page with drag-and-drop, progress, and preview
- Session-based admin authentication (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`)
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`
- `POST /api/admin/upload` storing images in an R2 bucket (`cadmus-portfolio`)
- `GET /api/images` and `GET /api/images/:key` for a runtime-rendered gallery

The site keeps the Worker rather than going fully static so these can be added as
on-demand endpoints under `src/pages/api/` without reworking the deploy.
