import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Capture browser console logs and page errors
page.on("console", (msg) => console.log(`[browser:${msg.type()}]`, msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// Scroll to the founder section and wait for animation
await page.evaluate(() => {
  const el = document.getElementById("about");
  el?.scrollIntoView({ behavior: "instant", block: "center" });
});
await page.waitForTimeout(2000); // 2s — early in assemble
await page.screenshot({ path: "/tmp/qline-2026-05-17/founder-2s.png" });
await page.waitForTimeout(4000); // 6s — late in assemble
await page.screenshot({ path: "/tmp/qline-2026-05-17/founder-6s.png" });
await page.waitForTimeout(4000); // 10s — after cascade
await page.screenshot({ path: "/tmp/qline-2026-05-17/founder-10s.png" });

await browser.close();
console.log("done");
