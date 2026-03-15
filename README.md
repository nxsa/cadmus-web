# Cadmus Web

Nuxt 4 + Cloudflare Worker site with authenticated admin image uploads to R2 and runtime-rendered homepage gallery.

## Prerequisites

- Node.js 20+
- Cloudflare account
- R2 bucket named `cadmus-portfolio` (or update `wrangler.jsonc`)

## Install

```bash
npm install
```

## Configure secrets

Set secrets with Wrangler:

```bash
# Generate SHA-256 hash for your admin password
node -e "const c=require('node:crypto');console.log(c.createHash('sha256').update(process.argv[1]).digest('hex'))" "your-password"

wrangler secret put ADMIN_PASSWORD_HASH
wrangler secret put SESSION_SECRET
```

Notes:

- `ADMIN_PASSWORD_HASH` must be a 64-character SHA-256 hex string.
- `SESSION_SECRET` should be at least 32 random characters.
- `MAX_UPLOAD_FILE_BYTES` defaults to 10MB and can be changed in `wrangler.jsonc`.

## Development

```bash
npm run dev
```

Admin routes:

- `/admin/login`
- `/admin/upload` (protected)

## API overview

- `POST /api/admin/login` → start admin session
- `POST /api/admin/logout` → clear session
- `GET /api/admin/session` → session status
- `POST /api/admin/upload` → protected multi-image upload
- `GET /api/images` → newest-first image list
- `GET /api/images/:key` → proxied image stream from R2

## Test

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Static Portfolio

Place image files into `public/portfolio/` (allowed: `.webp`, `.jpg`, `.jpeg`, `.png`, `.avif`).

Before building, generate `public/portfolio/index.json` with:

```bash
node ./scripts/generate-portfolio-index.mjs
```

This will create `public/portfolio/index.json` listing files (newest-first). The build step runs this automatically via `npm run build` because a `prebuild` script is defined.

The homepage uses `PortfolioGallery` to server-render the static gallery from that index for SEO.
