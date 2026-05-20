// Scrape the homepage. For each cover image, capture both the src and the
// nearest enclosing <a href> so we can pair every homepage thumbnail with
// its project slug — including projects whose homepage cover differs from
// their detail-page cover.

import { chromium } from "playwright";
import { writeFile, readFile } from "node:fs/promises";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
});
const page = await ctx.newPage();

await page.goto("https://katetan.co/", { waitUntil: "networkidle", timeout: 90000 });

const collected = new Map(); // src -> { href, top }
const snapshot = async () => {
  const found = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img"))
      .map((el) => {
        const src = (el.currentSrc || el.src || "").replace(/\?.*$/, "");
        const a = el.closest("a");
        const href = a?.getAttribute("href") || "";
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { src, href, top };
      })
      .filter((i) => i.src.includes("framerusercontent.com/images/"));
  });
  for (const { src, href, top } of found) {
    if (!collected.has(src)) collected.set(src, { href, top });
  }
};

const totalHeight = await page.evaluate(
  () => document.documentElement.scrollHeight
);
console.log(`Page height: ${totalHeight}px`);

for (let y = 0; y <= totalHeight; y += 300) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(500);
  await snapshot();
}
await page.evaluate((h) => window.scrollTo(0, h), totalHeight);
await page.waitForTimeout(2000);
await snapshot();

await browser.close();

// Build the ordered list of {src, slug, top}
const entries = Array.from(collected.entries())
  .map(([src, { href, top }]) => {
    const match = href.match(/projects\/([a-z0-9-]+)/);
    return { src, slug: match?.[1] || null, top };
  })
  .sort((a, b) => a.top - b.top);

// Take FIRST cover per slug in DOM order
const seen = new Set();
const orderedCovers = []; // {slug, src} in homepage display order
for (const e of entries) {
  if (!e.slug || seen.has(e.slug)) continue;
  seen.add(e.slug);
  orderedCovers.push({ slug: e.slug, src: e.src });
}

const manifest = JSON.parse(
  await readFile(new URL("./manifest.json", import.meta.url), "utf8")
);
manifest.homepage = {
  imgs: entries.map(({ src }) => ({ src })),
  orderedCovers,
  orderedSlugs: orderedCovers.map((c) => c.slug),
};
await writeFile(
  new URL("./manifest.json", import.meta.url),
  JSON.stringify(manifest, null, 2)
);

console.log(`\nMapped ${orderedCovers.length} projects via homepage links:`);
orderedCovers.forEach((c, i) => console.log(`  ${i + 1}. ${c.slug}`));
