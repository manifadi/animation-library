#!/usr/bin/env node
// Scans the repo root for project folders and writes projects.json.
// A folder counts as a project if it contains an index.html at its top level.
// Optional <folder>/meta.json can override title, description, tags, date, thumbnail.

import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCLUDE = new Set(["assets", "scripts", "node_modules", ".git", ".github"]);
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"];

function titleFromSlug(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function findThumbnail(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const images = entries
    .filter((e) => e.isFile() && IMAGE_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
  return images[0] ?? null;
}

async function readMeta(dir) {
  try {
    const raw = await readFile(path.join(dir, "meta.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function buildProject(slug) {
  const dir = path.join(ROOT, slug);
  const hasIndex = await stat(path.join(dir, "index.html")).then(() => true).catch(() => false);
  if (!hasIndex) return null;

  const meta = await readMeta(dir);
  const thumbnail = meta.thumbnail ?? (await findThumbnail(dir));

  return {
    slug,
    title: meta.title ?? titleFromSlug(slug),
    description: meta.description ?? "",
    tags: meta.tags ?? [],
    date: meta.date ?? null,
    url: `${slug}/index.html`,
    thumbnail: thumbnail ? `${slug}/${thumbnail}` : null,
  };
}

async function main() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const candidates = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !name.startsWith(".") && !name.startsWith("_") && !EXCLUDE.has(name));

  const projects = (await Promise.all(candidates.map(buildProject))).filter(Boolean);

  projects.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  const outDir = process.argv[2] ? path.resolve(process.argv[2]) : ROOT;
  const outPath = path.join(outDir, "projects.json");
  await writeFile(outPath, JSON.stringify(projects, null, 2) + "\n", "utf8");
  console.log(`Wrote ${projects.length} project(s) to ${outPath}`);
  for (const p of projects) console.log(`  - ${p.title} (${p.slug})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
