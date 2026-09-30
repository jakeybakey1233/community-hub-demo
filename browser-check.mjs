import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startStaticServer } from './serve.mjs';
const require = createRequire(import.meta.url);
const screenshotRoot = fileURLToPath(new URL('../screenshots/', import.meta.url));
await mkdir(screenshotRoot, { recursive: true });
const app = await startStaticServer();
let browser;
try {
  browser = await chromium.launch({ headless: true,
    ...(process.env.DEMO_BROWSER_EXECUTABLE ? { executablePath: process.env.DEMO_BROWSER_EXECUTABLE } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(app.url);
  await page.locator('.resource-card').first().waitFor();
  assert.equal(await page.locator('#results-list .resource-card').count(), 9);
  const summary = () => page.locator('#activity-summary').innerText();
  const visibleCount = expected => page.waitForFunction(count => document.querySelector('#activity-summary').textContent.startsWith(`${count} `), expected);
  await page.getByRole('link', { name: /Data operations/ }).click();
  await page.locator('#detail-title').waitFor({ state: 'visible' });
  assert.match(await summary(), /^3 /);
  await page.getByRole('link', { name: /Data quality/ }).click();
  await page.locator('#detail-content .resource-card').waitFor();
  assert.match(await summary(), /^3 /);
  await page.getByRole('link', { name: 'How do you validate a scheduled file import?', exact: true }).click();
  await visibleCount(2);
  await page.locator('#scenario-author').selectOption('you');
  await page.locator('#scenario-form button').click();
  assert.match(await summary(), /^2 /);
  await page.locator('#scenario-author').selectOption('member');
  await page.locator('#scenario-form button').click();
  await visibleCount(3);
  await page.getByRole('button', { name: 'Mark current activity as read' }).click();
  await visibleCount(2);
  await page.goto(`${app.url}/#/browse`);
  await page.locator('#results-list .resource-card').first().waitFor();
  await page.reload();
  assert.match(await summary(), /^2 /);
  await page.locator('#viewer-role').selectOption('moderator');
  assert.match(await summary(), /^2 /);
  await page.locator('#reset-demo').click();
  await visibleCount(3);
  const favorite = page.locator('[data-focus-key="favorite-r1"]');
  await favorite.press('Space');
  assert.equal(await favorite.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.focusKey), 'favorite-r1');
  await page.locator('#favorites-only').check();
  assert.equal(await page.locator('#results-list .resource-card').count(), 1);
  await favorite.press('Space');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'results-heading');
  assert.equal(await page.locator('#no-results').isVisible(), true);
  await page.locator('.empty-reset').click();
  await page.locator('#reset-demo').click();
  await visibleCount(3);

  for (const [width, label] of [[1440, 'desktop'], [390, 'mobile'], [320, 'narrow']]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label} horizontal overflow`);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
      return result.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) }));
    });
    assert.deepEqual(violations, [], `${label} axe violations: ${JSON.stringify(violations)}`);
    if (label !== 'narrow') await page.screenshot({ path: `${screenshotRoot}/community-hub-${label}.jpg`, type: 'jpeg', quality: 85, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${app.url}/#/post/r8`);
  await page.locator('.reply-list').waitFor();
  await page.screenshot({ path: `${screenshotRoot}/community-post.jpg`, type: 'jpeg', quality: 85, fullPage: true });
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  console.log('Browser checks passed. Real desktop, mobile and post screenshots written to screenshots/.');
} finally { if (browser) await browser.close(); await app.close(); }
