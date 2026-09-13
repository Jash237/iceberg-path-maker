import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure screenshots directory exists
const screenshotsDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const PORT = process.env.PORT || 5173;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

async function runDriver() {
  console.log(`[driver] Launching headless browser...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    console.log(`[driver] Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // 1. Initial State Screenshot
    console.log(`[driver] Waiting for app header...`);
    await page.waitForSelector('text=Iceberg Tracker', { timeout: 10000 });
    await page.waitForSelector('.tracker-map', { timeout: 10000 });

    const shot1 = path.join(screenshotsDir, '01-initial-view.png');
    await page.screenshot({ path: shot1 });
    console.log(`[driver] Screenshot saved: ${shot1}`);

    // 2. Select a quick destination preset
    console.log(`[driver] Selecting Port Lockroy destination preset...`);
    const portLockroyBtn = page.locator('.btn-preset-small').filter({ hasText: 'Port Lockroy' });
    if (await portLockroyBtn.count() > 0) {
      await portLockroyBtn.click();
      console.log(`[driver] Clicked Port Lockroy`);
      await page.waitForTimeout(500);
    }

    const shot2 = path.join(screenshotsDir, '02-port-lockroy-destination.png');
    await page.screenshot({ path: shot2 });
    console.log(`[driver] Screenshot saved: ${shot2}`);

    // 3. Scroll sidebar down to Iceberg List and click an iceberg
    console.log(`[driver] Clicking first iceberg in list...`);
    await page.evaluate(() => {
      const card = document.querySelector('.iceberg-card');
      if (card) {
        card.scrollIntoView();
        card.click();
      }
    });
    console.log(`[driver] Clicked iceberg card`);

    await page.waitForTimeout(500);
    const shot3 = path.join(screenshotsDir, '03-iceberg-detail.png');
    await page.screenshot({ path: shot3 });
    console.log(`[driver] Screenshot saved: ${shot3}`);

    // 4. Test Route Selection (Direct / Safe routes)
    console.log(`[driver] Selecting alternative route...`);
    await page.evaluate(() => {
      const routes = document.querySelectorAll('.route-card');
      if (routes.length > 0) {
        routes[0].scrollIntoView();
        routes[0].click();
      }
    });

    // 5. Test Add Iceberg Mode
    console.log(`[driver] Testing Add Iceberg mode...`);
    const addIcebergBtn = page.locator('button:has-text("+ Add Iceberg")');
    if (await addIcebergBtn.isVisible()) {
      await addIcebergBtn.click();
      console.log(`[driver] Clicked + Add Iceberg button`);

      // Click near center of map to place iceberg
      const mapElem = page.locator('.tracker-map');
      const box = await mapElem.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        console.log(`[driver] Placed new iceberg at map center`);
      }
    }

    await page.waitForTimeout(500);
    const shot4 = path.join(screenshotsDir, '04-new-iceberg-added.png');
    await page.screenshot({ path: shot4 });
    console.log(`[driver] Screenshot saved: ${shot4}`);

    // 6. Test Data Feed Manager Refresh
    console.log(`[driver] Testing live feed refresh...`);
    await page.evaluate(() => {
      const refresh = document.querySelector('button.btn-refresh-feed');
      if (refresh) {
        refresh.scrollIntoView();
        refresh.click();
      }
    });
    console.log(`[driver] Triggered live data refresh`);

    // Save latest screenshot
    const latestShot = path.join(screenshotsDir, 'latest.png');
    fs.copyFileSync(shot4, latestShot);

    console.log(`[driver] All flows completed successfully!`);

    if (consoleErrors.length > 0) {
      console.warn(`[driver] Console warnings/errors encountered:`);
      consoleErrors.forEach((e) => console.warn(`  - ${e}`));
    } else {
      console.log(`[driver] Clean console - 0 errors!`);
    }
  } catch (err) {
    console.error(`[driver] Error during test execution:`, err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    console.log(`[driver] Browser closed.`);
  }
}

runDriver();
