// Reads scripts/manifest.json, downloads images into public/photos/<slug>/,
// and writes src/data/photos.ts as project-centric data.
// Run: node scripts/download-and-build-data.mjs

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const manifest = JSON.parse(
  await readFile(path.join(ROOT, "scripts/manifest.json"), "utf8")
);

const PHOTOS_DIR = path.join(ROOT, "public/photos");

// Order from homepage
const SLUG_ORDER = [
  "part-1-pd-models-2nd-anniversary",
  "part-2-pd-models-2nd-anniversary",
  "ed-comm1", "ed-comm2", "ed-comm3", "ed-comm4", "ed-comm5",
  "seifini",
  "ed-comm6",
  "dimplehsu-2", "dimplehsu",
  "ed-comm7", "ed-comm8", "ed-comm9", "ed-comm10", "ed-comm11",
  "ed-comm12", "ed-comm13", "ed-comm14", "ed-comm15", "ed-comm16",
  "special-project-for-on",
  "ed-comm17", "ed-comm18", "ed-comm19", "ed-comm20", "ed-comm21",
  "dimplehsu3",
];

// Wipe existing photos dir so we start clean
if (existsSync(PHOTOS_DIR)) {
  await rm(PHOTOS_DIR, { recursive: true });
}
await mkdir(PHOTOS_DIR, { recursive: true });

const downloadImage = async (url, destPath) => {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  await pipeline(res.body, createWriteStream(destPath));
};

const extFromUrl = (url) => {
  const m = url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i);
  return m ? m[1].toLowerCase() : "jpg";
};

const extractTitleAndRole = (bodyText) => {
  // Filter out header/footer chrome
  const ignore = new Set([
    "Kate Tan", "projects,", "info", "NEXT", "PREVIOUS",
    "KATETAN.US@GMAIL.COM", "katetan.us@gmail.com",
  ]);
  const meaningful = bodyText.filter((t) => !ignore.has(t));
  return {
    title: meaningful[0] || "",
    role: meaningful[1] || "",
  };
};

const projects = [];

for (const slug of SLUG_ORDER) {
  const data = manifest.projects[slug];
  if (!data || !data.imgs || data.imgs.length === 0) {
    console.warn(`Skipping ${slug}: no images`);
    continue;
  }

  const { title, role } = extractTitleAndRole(data.bodyText || []);
  const projectDir = path.join(PHOTOS_DIR, slug);
  await mkdir(projectDir, { recursive: true });

  const photos = [];
  for (let i = 0; i < data.imgs.length; i++) {
    const img = data.imgs[i];
    const ext = extFromUrl(img.src);
    const n = String(i + 1).padStart(2, "0");
    const filename = `${n}.${ext}`;
    const destPath = path.join(projectDir, filename);

    process.stdout.write(`  [${slug}] ${i + 1}/${data.imgs.length} `);
    try {
      await downloadImage(img.src, destPath);
      console.log(`✓ ${filename}`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
      continue;
    }
    photos.push({
      src: `/photos/${slug}/${filename}`,
    });
  }

  projects.push({ slug, title, role, photos });
}

// Download about portrait
if (manifest.about?.imgs?.length) {
  const portrait = manifest.about.imgs[0];
  const ext = extFromUrl(portrait.src);
  const destPath = path.join(PHOTOS_DIR, `about.${ext}`);
  try {
    await downloadImage(portrait.src, destPath);
    console.log(`✓ about.${ext}`);
  } catch (err) {
    console.log(`✗ about: ${err.message}`);
  }
}

// Now read back actual dimensions using image-size-like trick: rely on
// the alt-empty width/height that Framer rendered. The manifest doesn't have
// natural dimensions (we got rendered widths), so we'll let CSS aspect-ratio
// fall through. We'll skip width/height in the data file.

const tsLines = [
  `// AUTO-GENERATED from scripts/manifest.json by scripts/download-and-build-data.mjs`,
  `// Do not edit by hand — rerun the script to refresh.`,
  ``,
  `export type ProjectPhoto = {`,
  `  src: string;`,
  `};`,
  ``,
  `export type Project = {`,
  `  slug: string;`,
  `  title: string;`,
  `  role: string;`,
  `  photos: ProjectPhoto[];`,
  `};`,
  ``,
  `export const projects: Project[] = ${JSON.stringify(projects, null, 2)};`,
  ``,
  `export const findProject = (slug: string) =>`,
  `  projects.find((p) => p.slug === slug);`,
  ``,
  `export const findProjectIndex = (slug: string) =>`,
  `  projects.findIndex((p) => p.slug === slug);`,
  ``,
];

await writeFile(path.join(ROOT, "src/data/photos.ts"), tsLines.join("\n"));
console.log(`Wrote src/data/photos.ts with ${projects.length} projects.`);
