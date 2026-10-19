#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PORTFOLIO_DIR = path.join(PUBLIC_DIR, 'portfolio');
const IMAGES_DIR = path.join(PORTFOLIO_DIR, 'images');
const ORDER_FILE = path.join(IMAGES_DIR, 'order.json');
const OUT_FILE = path.join(PORTFOLIO_DIR, 'index.json');

const ALLOWED_EXT = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

async function ensurePortfolioDir() {
    try {
        await fs.mkdir(IMAGES_DIR, { recursive: true });
    } catch (err) {
        // ignore
    }
}

async function readImageOrder() {
    try {
        const contents = await fs.readFile(ORDER_FILE, 'utf8');
        const order = JSON.parse(contents);

        return Array.isArray(order) ? order.filter(filename => typeof filename === 'string') : [];
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.warn(`Unable to read ${ORDER_FILE}; using newest-first order.`);
        }

        return [];
    }
}

async function buildIndex() {
    await ensurePortfolioDir();

    const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
    const imageOrder = await readImageOrder();

    const files = [];

    for (const ent of entries) {
        if (!ent.isFile()) continue;
        const ext = path.extname(ent.name).toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) continue;

        const full = path.join(IMAGES_DIR, ent.name);
        const stat = await fs.stat(full);

        files.push({
            filename: ent.name,
            url: `/portfolio/images/${encodeURIComponent(ent.name)}`,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
        });
    }

    const filesByName = new Map(files.map(file => [file.filename, file]));
    const orderedFiles = [];
    const orderedNames = new Set();

    for (const filename of imageOrder) {
        const file = filesByName.get(filename);

        if (file && !orderedNames.has(filename)) {
            orderedFiles.push(file);
            orderedNames.add(filename);
        }
    }

    const remainingFiles = files
        .filter(file => !orderedNames.has(file.filename))
        .sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));

    const out = { images: [...orderedFiles, ...remainingFiles] };

    await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote ${OUT_FILE} (${files.length} images)`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('generate-portfolio-index.mjs')) {
    buildIndex().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
