// Reads scripts/manifest.json, downloads homepage cover thumbnails (per project)
// when they differ from the project-page first image, measures every photo's
// dimensions, and regenerates src/data/photos.ts.
// Run: node scripts/add-dimensions.mjs

import { readFile, writeFile, readdir, mkdir, unlink, rename } from "node:fs/promises";
import { createWriteStream, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PHOTOS_DIR = path.join(ROOT, "public/photos");
const manifest = JSON.parse(
  await readFile(path.join(ROOT, "scripts/manifest.json"), "utf8")
);

const ALL_SLUGS = [
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

const homepageOrder = manifest.homepage?.orderedSlugs || [];
const homepageCovers = manifest.homepage?.orderedCovers || []; // [{slug, src}]
const seenOrder = new Set(homepageOrder);
const SLUG_ORDER = [
  ...homepageOrder,
  ...ALL_SLUGS.filter((s) => !seenOrder.has(s)),
];

const coverUrlBySlug = Object.fromEntries(
  homepageCovers.map((c) => [c.slug, c.src])
);

// Per-project cover overrides: pick a specific filename inside the slug's
// folder as the gallery cover instead of the default (homepage cover or 01).
const COVER_OVERRIDES = {
  "part-1-pd-models-2nd-anniversary": "02.jpg",
  "ed-comm12": "04.jpg",
};

const downloadImage = async (url, destPath) => {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  await pipeline(res.body, createWriteStream(destPath));
};

const getDims = (filePath) => {
  const out = execFileSync("sips", [
    "-g", "pixelWidth",
    "-g", "pixelHeight",
    filePath,
  ]).toString();
  const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return { w, h };
};

const ignore = new Set([
  "Kate Tan", "projects,", "info", "NEXT", "PREVIOUS",
  "KATETAN.US@GMAIL.COM", "katetan.us@gmail.com",
]);
const extractTitleAndRole = (bodyText) => {
  const meaningful = (bodyText || []).filter((t) => !ignore.has(t));
  return { title: meaningful[0] || "", role: meaningful[1] || "" };
};

const extFromUrl = (url) => {
  const m = url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i);
  return m ? m[1].toLowerCase() : "jpg";
};

const projects = [];
for (const slug of SLUG_ORDER) {
  const data = manifest.projects[slug];
  if (!data?.imgs?.length) continue;

  const dir = path.join(PHOTOS_DIR, slug);
  await mkdir(dir, { recursive: true });
  const existingFiles = new Set(await readdir(dir));

  // Download homepage cover if it's different from any existing project image
  const coverUrl = coverUrlBySlug[slug];
  let coverFilename = null;
  if (coverUrl) {
    const projectUrls = new Set(
      data.imgs.map((i) => i.src.replace(/\?.*$/, ""))
    );
    if (!projectUrls.has(coverUrl)) {
      const ext = extFromUrl(coverUrl);
      coverFilename = `cover.${ext}`;
      const dest = path.join(dir, coverFilename);
      if (!existingFiles.has(coverFilename)) {
        try {
          await downloadImage(coverUrl, dest);
          console.log(`  [${slug}] downloaded homepage cover -> ${coverFilename}`);
        } catch (err) {
          console.log(`  [${slug}] cover download failed: ${err.message}`);
          coverFilename = null;
        }
      }
    }
  }

  // If cover.* duplicates a project image (same aspect within ~1.5%),
  // collapse to one file. Framer often re-uploads the same photo at a
  // different size, so cover.jpg ends up as a redundant copy of 01.jpg.
  // Keep whichever has more pixels: if cover wins, rename it into the
  // duplicate's slot (e.g. cover.jpg → 01.jpg).
  let allFiles = await readdir(dir);
  const coverFile = allFiles.find((f) => f.startsWith("cover."));
  if (coverFile) {
    const coverPath = path.join(dir, coverFile);
    const cov = getDims(coverPath);
    const coverRatio = cov.w / cov.h;
    const coverArea = cov.w * cov.h;

    const candidates = allFiles
      .filter((f) => !f.startsWith("cover."))
      .map((f) => {
        const d = getDims(path.join(dir, f));
        return {
          file: f,
          area: d.w * d.h,
          ratio: d.w / d.h,
          diff: Math.abs(d.w / d.h - coverRatio) / coverRatio,
        };
      })
      .filter((c) => c.diff < 0.015)
      .sort((a, b) => a.diff - b.diff);

    if (candidates.length > 0) {
      const match = candidates[0];
      const matchPath = path.join(dir, match.file);
      if (coverArea > match.area) {
        await unlink(matchPath);
        await rename(coverPath, matchPath);
        console.log(
          `  [${slug}] cover replaced ${match.file} (cover was higher-res)`
        );
      } else {
        await unlink(coverPath);
        console.log(
          `  [${slug}] cover ${coverFile} duplicates ${match.file} — removed`
        );
      }
      allFiles = await readdir(dir);
    }
  }

  const files = allFiles.sort();
  // Move the cover to the front: explicit override > "cover.*" > 01.jpg
  const override = COVER_OVERRIDES[slug];
  files.sort((a, b) => {
    if (override) {
      if (a === override) return -1;
      if (b === override) return 1;
    }
    if (a.startsWith("cover")) return -1;
    if (b.startsWith("cover")) return 1;
    return a.localeCompare(b);
  });

  const photos = files.map((file) => {
    const { w, h } = getDims(path.join(dir, file));
    return { src: `/photos/${slug}/${file}`, width: w, height: h };
  });

  const { title, role } = extractTitleAndRole(data.bodyText);
  projects.push({ slug, title, role, photos });
}

const ts = [
  `// AUTO-GENERATED from scripts/manifest.json by scripts/add-dimensions.mjs`,
  `// Do not edit by hand — rerun the script to refresh.`,
  ``,
  `export type ProjectPhoto = {`,
  `  src: string;`,
  `  width: number;`,
  `  height: number;`,
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
].join("\n");

await writeFile(path.join(ROOT, "src/data/photos.ts"), ts);
console.log(`\nWrote src/data/photos.ts with ${projects.length} projects.`);
