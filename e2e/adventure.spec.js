const { test, expect } = require('@playwright/test');
const SAVE_KEY = 'atia-adventure-v1';
const profile = { version:1, tutorialWon:true, prologueComplete:true, amulet:true, activeCharacter:'kotaro', xp:60, coins:50, wood:0, essence:0, claimedRewards:[], completedStages:[], rescued:[] };

async function savedVillage(page, overrides = {}) {
  await page.addInitScript(({key, saved}) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(saved)); }, {key:SAVE_KEY,saved:{...profile,...overrides}});
  await page.goto('/');
  await expect(page.locator('.scene-village')).toBeVisible();
}
async function fight(page, { dodge = true, weak = false, shot = null } = {}) {
  await expect(page.locator('.scene-combat')).toBeVisible();
  for (let turn=0;turn<18;turn++) {
    await page.waitForFunction(() => document.querySelector('.ability-card:not(:disabled)') || !document.querySelector('.scene-combat'));
    if (!await page.locator('.scene-combat').count()) return;
    const ultimate = page.locator('.ultimate-button:not(:disabled)');
    if (!weak && await ultimate.count()) await ultimate.click();
    else await page.locator('.ability-card').nth(weak ? 2 : 0).click();
    // Resolve a real React lane button in-frame; transport delays must not
    // consume the one-second reaction window. A separate touch test taps lanes.
    const outcome = await page.waitForFunction(dodge => {
      if (!document.querySelector('.scene-combat')) return 'complete';
      const danger = document.querySelector('.lane-button.danger');
      if (!danger) return false;
      (dodge ? document.querySelector('.lane-button:not(.danger)') : danger).click();
      return 'dodge';
    }, dodge);
    if (await outcome.jsonValue() === 'complete') return;
    if (shot && turn===0) await page.screenshot({path:'test-results/'+shot+'.png'});
    await page.waitForFunction(() => !document.querySelector('.lane-button.danger'));
  }
  throw new Error('Encounter exceeded 18 turns');
}
async function visibleControls(page, selector) {
  const viewport = page.viewportSize();
  const bounds = await page.locator(selector).evaluateAll(elements => elements.map(el => { const r=el.getBoundingClientRect(); return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; }));
  for (const rect of bounds) {
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(viewport.width+1);
    expect(rect.bottom).toBeLessThanOrEqual(viewport.height+1);
    expect(rect.height).toBeGreaterThanOrEqual(39);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
}

test('complete prologue, Buba unlock, rank rewards, route, amulet rescue and durable save', async ({page}) => {
  test.setTimeout(240000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.getByRole('button',{name:'Begin journey'}).click();
  await page.getByRole('button',{name:'Approach the village'}).click();
  await page.getByRole('button',{name:'Step into the clearing'}).click();
  await page.getByRole('button',{name:'Defend yourself'}).click();
  await expect(page.locator('.enemy-health')).toContainText('Buba');
  await page.screenshot({path:'test-results/atia-buba-desktop.png'});
  await fight(page,{shot:'atia-dodge-desktop'});
  await expect(page.getByRole('heading',{name:'You… you stopped.'})).toBeVisible();
  await page.screenshot({path:'test-results/atia-dialogue-desktop.png'});
  for(let i=0;i<4;i++) await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Accept the amulet'}).click();
  await page.getByRole('button',{name:'Restore Atia'}).click();
  await expect(page.locator('.scene-village')).toBeVisible();
  await expect(page.locator('.profile-block')).toContainText('Adventure Rank 2');
  await page.screenshot({path:'test-results/atia-village-desktop.png'});
  await page.getByRole('button',{name:/Buba’s tent/}).click();
  await page.getByRole('button',{name:'Claim rank 1',exact:true}).click();
  await expect(page.getByRole('button',{name:'Rank 1 claimed'})).toBeDisabled();
  await page.getByRole('button',{name:'Claim rank 2',exact:true}).click();
  await expect(page.getByRole('button',{name:'Claim rank 3',exact:true})).toBeDisabled();
  await page.screenshot({path:'test-results/atia-rewards-desktop.png'});
  await page.getByRole('button',{name:'Close panel'}).click();
  await page.getByRole('button',{name:'Team',exact:true}).click();
  await page.getByRole('button',{name:'Choose Buba'}).click();
  await expect(page.locator('.profile-block')).toContainText('Buba');
  await page.getByRole('button',{name:/Village gate/}).click();
  await expect(page.locator('.scene-map')).toBeVisible();
  await page.screenshot({path:'test-results/atia-map-desktop.png'});
  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:'Stage '+(i+1)+': '+['Whispering Woods','The Hollow Crossing','Momo’s Lagoon'][i],exact:true}).click();
    await page.getByRole('button',{name:'Enter encounter',exact:true}).click();
    await expect(page.locator('.ability-card').first()).toContainText('Brave Slash');
    await fight(page);
    if(i<2)await page.getByRole('button',{name:'Continue journey'}).click();
  }
  await expect(page.getByRole('button',{name:'Use the amulet'})).toBeVisible();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).rescued.length,SAVE_KEY)).toBe(0);
  await page.getByRole('button',{name:'Use the amulet'}).click();
  await expect(page.getByRole('heading',{name:'Welcome home, Momo.'})).toBeVisible();
  await page.getByRole('button',{name:'Bring Momo home'}).click();
  await expect(page.locator('.quest-card')).toContainText('+5% dodge time');
  await page.reload();
  await expect(page.locator('.scene-village')).toBeVisible();
  await expect(page.locator('.profile-block')).toContainText('Buba');
  await expect(page.locator('.profile-block')).toContainText('Adventure Rank 3');
  await page.getByRole('button',{name:/Buba’s tent/}).click();
  await expect(page.getByText('A mended canvas tent',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Rank 1 claimed'})).toBeDisabled();
  expect(errors).toEqual([]);
});

test('failed dodges lead to defeat; retry restores the same guardian with full health',async({page})=>{
  await savedVillage(page,{completedStages:[0,1],xp:135});
  await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await page.getByRole('button',{name:'Stage 3: Momo’s Lagoon'}).click();
  await page.getByRole('button',{name:'Enter encounter'}).click();
  await fight(page,{dodge:false,weak:true});
  await expect(page.getByRole('heading',{name:'Your story isn’t over.'})).toBeVisible();
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.locator('.health').first()).toContainText('100 / 100');
  await expect(page.locator('.enemy-health')).toContainText('Corrupted Momo');
  await expect(page.locator('.ability-card').first()).toBeEnabled();
});

test('Android touch controls, portrait and landscape, panel focus and save restoration',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await savedVillage(page);
  await page.screenshot({path:'test-results/atia-village-mobile.png'});
  await visibleControls(page,'.village-dock button');
  await page.getByRole('button',{name:'How to play'}).tap();
  await expect(page.getByRole('dialog',{name:'Traveler’s guide'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'How to play'})).toBeFocused();
  await page.getByRole('button',{name:/Buba’s tent/}).tap();
  await page.getByRole('button',{name:'Claim rank 1',exact:true}).tap();
  await page.screenshot({path:'test-results/atia-rewards-mobile.png'});
  await page.getByRole('button',{name:'Close panel'}).tap();
  await page.getByRole('button',{name:'Adventure',exact:true}).tap();
  await page.screenshot({path:'test-results/atia-map-mobile.png'});
  await page.getByRole('button',{name:'Enter encounter'}).tap();
  await visibleControls(page,'.ability-card,.ultimate-button');
  await page.screenshot({path:'test-results/atia-combat-mobile.png'});
  await page.locator('.ability-card').first().tap();
  await expect(page.locator('.lane-button')).toHaveCount(3);
  await visibleControls(page,'.lane-button');
  await page.getByRole('button',{name:'Right lane',exact:true}).tap();
  await expect(page.getByRole('button',{name:'Right lane',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:'test-results/atia-dodge-mobile.png'});
  await page.setViewportSize({width:844,height:390});
  await page.waitForFunction(()=>document.querySelector('.ability-card:not(:disabled)'));
  await visibleControls(page,'.ability-card,.ultimate-button');
  await page.screenshot({path:'test-results/atia-combat-landscape.png'});
  await page.locator('.ability-card').first().tap();
  await expect(page.locator('.lane-button')).toHaveCount(3);
  await visibleControls(page,'.lane-button');
  await page.getByRole('button',{name:'Left lane',exact:true}).tap();
  await page.getByRole('button',{name:'Retreat from encounter'}).tap();
  await expect(page.locator('.scene-village')).toBeVisible();
  await page.screenshot({path:'test-results/atia-village-landscape.png'});
  await page.reload();
  await expect(page.locator('.scene-village')).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});
