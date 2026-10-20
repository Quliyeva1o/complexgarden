/**
 * Səhifənin ekran görüntülərini çəkir (sistemdəki Chrome ilə, əlavə brauzer yükləmədən).
 *
 *   node scripts/screenshot.mjs <url> [--widths=1440,390] [--sections=id1,id2] [--out=screenshots/name]
 *
 * --sections verilsə, hər bölmə ayrıca şəkil kimi saxlanılır; əks halda tam səhifə.
 * Konsol xətalarını və horizontal scroll-u da yoxlayır.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const [url, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const widths = (opt.widths ?? "1440,390").split(",").map(Number);
const sections = opt.sections ? opt.sections.split(",") : null;
const out = opt.out ?? "screenshots/page";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
let failed = false;

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${decodeURIComponent(r.url()).slice(0, 160)}`));

  await page.goto(url, { waitUntil: "networkidle" });
  // Lazy şəkillər yüklənsin deyə səhifəni sona qədər sürüşdür
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`[${width}px] horizontal overflow: ${overflow}px${overflow > 0 ? "  <-- PROBLEM" : ""}`);
  if (overflow > 0) failed = true;

  if (sections) {
    for (const id of sections) {
      const el = page.locator(`#${id}`);
      await el.screenshot({ path: `${out}/${width}-${id}.png` });
    }
  } else {
    await page.screenshot({ path: `${out}/${width}-full.png`, fullPage: true });
  }

  if (errors.length) {
    failed = true;
    console.log(`[${width}px] console errors:\n  ${errors.join("\n  ")}`);
  }
  await page.close();
}

await browser.close();
console.log(`Saved to ${out}/`);
process.exit(failed ? 1 : 0);
