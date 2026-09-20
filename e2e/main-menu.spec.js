const {test,expect}=require('@playwright/test');
const {enterAdventure}=require('./helpers');
const key='atia-adventure-v1';
const legacy={version:1,tutorialWon:true,prologueComplete:true,amulet:true,xp:460,activeCharacter:'buba',coins:876};

test('title menu preserves the legacy save, supports separate slots, and restores the fountain checkpoint',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible();
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await expect(page.getByRole('button',{name:'Reset save data'})).toBeDisabled();
  await page.getByRole('button',{name:'Close panel'}).click();
  await page.getByRole('button',{name:'Credits',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Created by Etlil'})).toBeVisible();
  await page.getByRole('button',{name:'← Back',exact:true}).click();
  await page.getByRole('button',{name:'Quit',exact:true}).click();
  await expect(page.getByText(/You can safely close this browser tab/)).toBeVisible();
  await page.evaluate(({key,legacy})=>localStorage.setItem(key,JSON.stringify(legacy)),{key,legacy});
  await page.reload();await enterAdventure(page);
  await expect(page.locator('.profile-block')).toContainText('Buba');
  await page.getByRole('button',{name:'Save fountain',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Save fountain'})).toBeVisible();
  await page.getByRole('button',{name:'Save at fountain',exact:true}).click();
  await expect(page.getByText('Adventure saved. Your return point is now this fountain.')).toBeVisible();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).townCheckpoint,key)).toEqual({x:23,y:16});
  await page.screenshot({path:'test-results/save-fountain.png'});
  await page.getByRole('button',{name:'Close panel'}).click();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Return to main menu'}).click();
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await expect(page.locator('[data-save-slot]')).toHaveCount(5);
  await expect(page.locator('[data-save-slot="1"]')).toContainText('Fountain checkpoint');
  await page.screenshot({path:'test-results/load-game-desktop.png'});
  await page.locator('[data-save-slot="2"]').click();
  await expect(page.getByRole('button',{name:'Skip scene'})).toBeVisible();
  await page.getByRole('button',{name:'Skip scene'}).click();
  await expect(page.locator('.save-indicator')).toContainText('Autosaved · Slot 2');
  await expect(page.locator('.save-indicator')).toBeHidden();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).coins,key)).toBe(876);
  await page.reload();await enterAdventure(page,2);
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_MOVE');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Reset save data'}).click();
  await expect(page.getByText(/Slot 2 only/)).toBeVisible();
  await page.getByRole('button',{name:'Delete save and restart'}).click();
  await expect(page.getByRole('button',{name:'Skip scene'})).toBeVisible();
  await page.reload();await enterAdventure(page,1);
  await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-x','23');
  await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','16');
  await expect(page.locator('.profile-block')).toContainText('Buba');
  expect(errors).toEqual([]);
});

test('a failed autosave never announces safe quitting and can be retried',async({page})=>{
  await page.addInitScript(()=>{
    const original=Storage.prototype.setItem;
    window.restoreStorage=()=>{Storage.prototype.setItem=original;};
    Storage.prototype.setItem=function(){throw new DOMException('Test quota','QuotaExceededError');};
  });
  await page.goto('/');await enterAdventure(page,3);
  await page.getByRole('button',{name:'Skip scene'}).click();
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_MOVE');
  await expect(page.locator('.save-indicator')).toContainText('Save failed');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Return to main menu'}).click();
  await page.getByRole('button',{name:'Quit',exact:true}).click();
  await expect(page.getByText(/Progress in slot 3 is only stored for this session/)).toBeVisible();
  await expect(page.getByText(/You can safely close/)).toHaveCount(0);
  await page.evaluate(()=>window.restoreStorage());
  await page.getByRole('button',{name:'Retry save'}).click();
  await expect(page.getByText(/You can safely close this browser tab/)).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atia-adventure-v1-slot-3')).introStage)).toBe('move');
});

for(const viewport of [{width:844,height:390},{width:568,height:320},{width:390,height:844}])test(`title and five save slots support touch at ${viewport.width}x${viewport.height}`,async({browser})=>{
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true}),page=await context.newPage();
  try{
    await page.goto('/');await expect(page.getByRole('button',{name:'Start',exact:true})).toBeVisible();
    await page.screenshot({path:`test-results/main-menu-${viewport.width}x${viewport.height}.png`});
    for(const button of await page.locator('.title-actions button').all()){
      const r=await button.boundingBox();expect(r.height).toBeGreaterThanOrEqual(44);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height);expect(r.x+r.width).toBeLessThanOrEqual(viewport.width);
    }
    await page.getByRole('button',{name:'Start',exact:true}).tap();
    await expect(page.locator('[data-save-slot]')).toHaveCount(5);
    await page.screenshot({path:`test-results/load-game-${viewport.width}x${viewport.height}.png`});
    const slot=page.locator('[data-save-slot="5"]');await slot.scrollIntoViewIfNeeded();
    const r=await slot.boundingBox();expect(r.height).toBeGreaterThanOrEqual(44);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await slot.tap();await expect(page.getByRole('button',{name:'Skip scene'})).toBeVisible();
  }finally{await context.close();}
});
