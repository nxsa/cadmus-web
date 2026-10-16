# Cadmus Web

Astro site deployed as a Cloudflare Worker. The homepage is prerendered to static
HTML at build time; the Worker exists so on-demand routes can be added later.
Portfolio images live in `public/portfolio/images/` and are rendered into the page
from a generated manifest.

## Prerequisites

- Node.js 22.22 or newer (see `.node-version`)
- A Cloudflare account, for deploys

## Install

```bash
npm install
```

`postinstall` runs `astro sync` to generate types.

## Development

```bash
npm run dev
```

Serves on `http://localhost:4321`.

> `astro dev` is currently blocked by an upstream bug in the Cloudflare adapter's dev
> runner (`Missing field moduleType`). See `docs/migration-nuxt-to-astro.md`. Use the
> production-faithful loop below in the meantime.

```bash
npm run preview   # astro build && wrangler dev
```

## Build and deploy

```bash
npm run build     # output in dist/client (assets) and dist/server (Worker)
npm run deploy    # astro build && wrangler deploy
```

The `@astrojs/cloudflare` adapter writes the Worker's `main` entry and `ASSETS` asset
binding into `dist/server/wrangler.json`, and `wrangler deploy` reads that through
`.wrangler/deploy/config.json`. `wrangler.jsonc` holds only the settings that stay
under your control (name, compatibility date and flags, observability).

## Static portfolio

Place image files into `public/portfolio/images/` (allowed: `.webp`, `.jpg`, `.jpeg`,
`.png`, `.avif`).

To control display order, edit `public/portfolio/images/order.json` with the filenames
you want first. Any supported images not listed there are appended automatically,
newest first. Adding an image only requires placing it in the images folder.

`public/portfolio/index.json` is the generated manifest the homepage reads at build
time. Regenerate it with:

```bash
npm run portfolio:index
```

`dev` and `build` both run this automatically first, so new images are picked up when
you restart either command. Commit the regenerated manifest alongside new images.

## Planned, not implemented

The following was specified in the original upload brief but is **not** part of this
codebase. Nothing below exists yet:

- Private `/admin/upload` page with drag-and-drop, progress, and preview
- Session-based admin authentication (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`)
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`
- `POST /api/admin/upload` storing images in an R2 bucket (`cadmus-portfolio`)
- `GET /api/images` and `GET /api/images/:key` for a runtime-rendered gallery

The migration kept the Worker (rather than going fully static) so these can be added
as on-demand routes under `src/pages/api/` without reworking the deploy.
