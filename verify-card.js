const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000/#/login", { waitUntil: "networkidle" });
  await page.fill('input[name="identifier"]', "demo@ashtro.dev");
  await page.fill('input[name="password"]', "Demo@123");
  await page.click('button[type="submit"]');
  await page.waitForURL("http://localhost:3000/#/", { timeout: 10000 }).catch(() => {});
  await page.goto("http://localhost:3000/#/timeline", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Daily Timeline");
  const card = await page.locator("text=Test task from Playwright");
  const count = await card.count();
  console.log("TASK_CARD_COUNT:", count);
  if (count > 0) {
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: "screenshot-task-card.png" });
    // open edit dialog
    const cardEl = await page.locator('.task-card', { hasText: "Test task from Playwright" });
    await cardEl.hover();
    await page.click('.task-card:has-text("Test task from Playwright") button:has(svg)');
    await page.waitForTimeout(300);
    await page.screenshot({ path: "screenshot-dropdown.png" });
  }
  console.log("ERRORS:", JSON.stringify(errors));
  await browser.close();
})();
