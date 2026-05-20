// One-off scraper for katetan.co
// Visits every project page with a real browser, harvests image URLs + text,
// writes scripts/manifest.json. Run: node scripts/scrape-katetan.mjs

import { chromium } from "playwright";
import { writeFile, readFile } from "node:fs/promises";

const SLUGS = [
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

const BASE = "https://katetan.co";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
});
const page = await ctx.newPage();

const manifest = { homepage: null, projects: {} };

async function scrapeUrl(url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  // Scroll to bottom to trigger lazy-loaded images
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = 400;
    let y = 0;
    const max = document.documentElement.scrollHeight;
    while (y < max) {
      window.scrollTo(0, y);
      y += step;
      await wait(80);
    }
    window.scrollTo(0, 0);
    await wait(200);
  });
  await page.waitForTimeout(800);

  const result = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"))
      .map((el) => {
        const src = el.currentSrc || el.src || "";
        return {
          src,
          alt: el.alt || "",
          width: el.naturalWidth,
          height: el.naturalHeight,
          rect: el.getBoundingClientRect().top + window.scrollY,
        };
      })
      .filter((i) => i.src.includes("framerusercontent.com/images/"));

    const title = document.querySelector("h1")?.innerText?.trim() || "";
    const bodyText = Array.from(document.querySelectorAll("h1, h2, h3, h4, p"))
      .map((e) => e.innerText.trim())
      .filter(Boolean);

    return { imgs, title, bodyText };
  });

  // Deduplicate by src, preserve order by vertical position
  const seen = new Set();
  result.imgs = result.imgs
    .sort((a, b) => a.rect - b.rect)
    .filter((i) => {
      if (seen.has(i.src)) return false;
      seen.add(i.src);
      return true;
    })
    .map(({ rect: _r, ...rest }) => rest);

  return result;
}

console.log("Scraping homepage...");
manifest.homepage = await scrapeUrl(`${BASE}/`);
console.log(`  ${manifest.homepage.imgs.length} images`);

console.log("Scraping about...");
manifest.about = await scrapeUrl(`${BASE}/about`);
console.log(`  ${manifest.about.imgs.length} images, ${manifest.about.bodyText.length} text blocks`);

for (const slug of SLUGS) {
  console.log(`Scraping ${slug}...`);
  try {
    const r = await scrapeUrl(`${BASE}/projects/${slug}`);
    manifest.projects[slug] = r;
    console.log(`  title="${r.title}" imgs=${r.imgs.length}`);
  } catch (err) {
    console.error(`  FAILED: ${err.message}`);
    manifest.projects[slug] = { error: err.message };
  }
}

await browser.close();
await writeFile(
  new URL("./manifest.json", import.meta.url),
  JSON.stringify(manifest, null, 2)
);
console.log("Wrote scripts/manifest.json");
