const { test, expect } = require('@playwright/test');

async function enter(page) {
  await page.getByRole('button', { name: 'Enter dungeon', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enter room 1' })).toBeVisible();
}

async function fight(page, shouldDodge, screenshot) {
  for (let turn = 0; turn < 12; turn += 1) {
    await page.waitForFunction(() => document.querySelector('.ability-card:not(:disabled)') || !document.querySelector('.in-combat'));
    if (!await page.locator('.in-combat').count()) return;
    await page.getByRole('button', { name: /Leaf Strike/ }).click();
    await page.waitForFunction(() => document.querySelector('.lane-button.danger') || !document.querySelector('.in-combat'));
    if (!await page.locator('.in-combat').count()) return;
    if (shouldDodge) {
      await page.locator('.lane-button:not(.danger)').first().click();
    } else {
      await page.locator('.lane-button.danger').click();
    }
    if (screenshot && turn === 0) await page.screenshot({ path: `test-results/${screenshot}.png`, fullPage: true });
    await page.waitForFunction(() => !document.querySelector('.lane-button.danger'));
  }
  throw new Error('Encounter exceeded expected turn count');
}

test('complete rescue loop, safe dodges, persistent village bonus and replay', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Small steps. Big adventures.' })).toBeVisible();
  await page.screenshot({ path: 'test-results/map-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'How to play' }).click();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Enter dungeon', exact: true })).toBeVisible();
  await enter(page);
  for (let room = 0; room < 3; room += 1) {
    await page.getByRole('button', { name: room === 2 ? 'Enter Momo’s sanctuary' : `Enter room ${room + 1}` }).click();
    await expect(page.locator('.ability-card')).toHaveCount(3);
    await fight(page, true, room === 2 ? 'combat-desktop' : null);
  }
  await expect(page.getByRole('heading', { name: 'Momo is rescued!' })).toBeVisible();
  await expect(page.locator('.traveler-health')).toContainText('100');
  await page.screenshot({ path: 'test-results/rescue-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Continue to village' }).click();
  await expect(page.getByText('Happily rescued')).toBeVisible();
  await expect(page.locator('.rescue-reward')).toContainText('+5% Dodge Accuracy');
  await page.screenshot({ path: 'test-results/village-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Return to dungeon map' }).click();
  await expect(page.locator('.nav-count')).toHaveText('1');
  await enter(page);
  await expect(page.locator('.blessing-summary')).toContainText('+5%');
  await page.getByRole('button', { name: 'Enter room 1' }).click();
  await page.getByRole('button', { name: 'Retreat to the world map' }).click();
  await expect(page.getByRole('button', { name: 'Enter dungeon', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('failed dodges reach defeat and retry restores health at the same encounter', async ({ page }) => {
  await page.goto('/');
  await enter(page);
  for (let room = 0; room < 3; room += 1) {
    await page.getByRole('button', { name: room === 2 ? 'Enter Momo’s sanctuary' : `Enter room ${room + 1}` }).click();
    await fight(page, false);
    if (await page.getByRole('heading', { name: 'A wave too far.' }).count()) break;
  }
  await expect(page.getByRole('heading', { name: 'A wave too far.' })).toBeVisible();
  await page.getByRole('button', { name: 'Try encounter again' }).click();
  await expect(page.getByRole('heading', { name: 'Momo', exact: true })).toBeVisible();
  await expect(page.locator('.traveler-health')).toContainText('100');
  await expect(page.getByRole('button', { name: /Leaf Strike/ })).toBeEnabled();
});

test('mobile layout, village navigation and keyboard cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/map-mobile.png', fullPage: true });
  await page.getByRole('button', { name: /My village/ }).click();
  await expect(page.getByRole('heading', { name: 'Our little village' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to dungeon map' }).click();
  await enter(page);
  await page.getByRole('button', { name: 'Enter room 1' }).click();
  await page.keyboard.press('1');
  await expect(page.getByRole('button', { name: /Leaf Strike/ })).toBeDisabled();
  await page.waitForFunction(() => document.querySelector('.lane-button.danger'));
  await page.keyboard.press('a');
  await expect(page.locator('.lane-button').first()).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: 'test-results/combat-mobile.png', fullPage: true });
});
