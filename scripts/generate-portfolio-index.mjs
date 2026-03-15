#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PORTFOLIO_DIR = path.join(PUBLIC_DIR, 'portfolio');
const OUT_FILE = path.join(PORTFOLIO_DIR, 'index.json');

const ALLOWED_EXT = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

async function ensurePortfolioDir() {
    try {
        await fs.mkdir(PORTFOLIO_DIR, { recursive: true });
    } catch (err) {
        // ignore
    }
}

async function buildIndex() {
    await ensurePortfolioDir();

    const entries = await fs.readdir(PORTFOLIO_DIR, { withFileTypes: true });

    const files = [];

    for (const ent of entries) {
        if (!ent.isFile()) continue;
        const ext = path.extname(ent.name).toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) continue;

        const full = path.join(PORTFOLIO_DIR, ent.name);
        const stat = await fs.stat(full);

        files.push({
            filename: ent.name,
            url: `/portfolio/${encodeURIComponent(ent.name)}`,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
        });
    }

    // newest first
    files.sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));

    const out = { images: files };

    await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote ${OUT_FILE} (${files.length} images)`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('generate-portfolio-index.mjs')) {
    buildIndex().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
