const { test, expect } = require('@playwright/test');
const SAVE_KEY = 'atia-adventure-v1';

test('reset confirmation preserves canceled saves and restarts paused combat durably', async ({ page }) => {
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Begin journey'})).toBeVisible();
  // Seed only this isolated test page, once. Reloading after reset cannot reseed it.
  await page.evaluate(key=>{
    localStorage.setItem('settings-test-unrelated','preserved');
    localStorage.setItem(key,JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true,
      activeCharacter:'buba',xp:460,coins:999,wood:30,essence:40,claimedRewards:[1,2],completedStages:[0,1],rescued:[{id:'momo'}]}));
  },SAVE_KEY);
  await page.reload();
  await expect(page.locator('.scene-village')).toBeVisible();
  const saved=await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Reset save data'}).click();
  await expect(page.getByRole('button',{name:'Keep my save'})).toBeFocused();
  await page.getByRole('button',{name:'Keep my save'}).click();
  await expect(page.getByRole('button',{name:'Reset save data'})).toBeFocused();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY)).toBe(saved);
  await expect(page.locator('.profile-block')).toContainText('Buba');
  await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await page.getByRole('button',{name:/Stage 3:/}).click();
  await page.getByRole('button',{name:'Enter encounter'}).click();
  await page.locator('.ability-card').first().click();
  await expect(page.locator('.dodge-controls')).toBeVisible();
  await page.getByRole('button',{name:'Pause encounter'}).click();
  const frozen=await page.locator('.dodge-timer').textContent();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Reset save data'}).click();
  await page.waitForTimeout(1100);
  await expect(page.locator('.dodge-timer')).toHaveText(frozen);
  await page.getByRole('button',{name:'Delete save and restart'}).click();
  await expect(page.getByRole('button',{name:'Begin journey'})).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(1);
  const fresh=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  expect(fresh).toMatchObject({introStep:0,dialogueIndex:0,tutorialWon:false,prologueComplete:false,
    activeCharacter:'kotaro',unlockedCharacters:['kotaro'],amulet:false,xp:0,coins:0,wood:0,essence:0,
    claimedRewards:[],completedStages:[],rescued:[]});
  expect(await page.evaluate(()=>localStorage.getItem('settings-test-unrelated'))).toBe('preserved');
  // The old encounter must not resume or overwrite the fresh checkpoint.
  await page.waitForTimeout(7500);
  await expect(page.getByRole('button',{name:'Begin journey'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Begin journey'})).toBeVisible();
  await page.getByRole('button',{name:'Begin journey'}).click();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Reset save data'}).click();
  await page.getByRole('button',{name:'Delete save and restart'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Begin journey'})).toBeVisible();
  await page.getByRole('button',{name:'Begin journey'}).click();
  for (const name of ['Approach the village','Step into the clearing','Defend yourself']) {
    await page.getByRole('button',{name}).click();
  }
  await expect(page.locator('.enemy-health')).toContainText('Buba');
  await expect(page.locator('.health').first()).toContainText('Kotaro');
  await page.locator('.ability-card').first().click();
  await expect(page.locator('.dodge-controls')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const viewport of [{width:568,height:320},{width:390,height:844}]) {
  test(`reset Settings work with Android touch at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const page=await context.newPage();
    try {
      await page.goto('/');
      await page.getByRole('button',{name:'Settings',exact:true}).tap();
      await expect(page.getByRole('dialog',{name:'Settings'})).toBeVisible();
      await page.screenshot({path:`test-results/settings-${viewport.width}x${viewport.height}.png`});
      await page.getByRole('button',{name:'Reset save data'}).tap();
      for (const name of ['Keep my save','Delete save and restart']) {
        const button=page.getByRole('button',{name});
        await button.scrollIntoViewIfNeeded();
        const r=await button.boundingBox();
        expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);
        expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x+r.width).toBeLessThanOrEqual(viewport.width);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height);
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      await page.screenshot({path:`test-results/reset-${viewport.width}x${viewport.height}.png`});
      await page.getByRole('button',{name:'Delete save and restart'}).tap();
      await expect(page.getByRole('button',{name:'Begin journey'})).toBeVisible();
    } finally {await context.close();}
  });
}
