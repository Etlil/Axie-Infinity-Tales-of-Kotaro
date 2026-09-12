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
    else await page.locator(weak ? '.ability-card.card-heal' : '.ability-card').first().click();
    await page.waitForFunction(()=>document.querySelector('.dodge-controls')||!document.querySelector('.scene-combat'));
    if (dodge && await page.locator('.dodge-controls').count()) {
      await page.keyboard.down('d');await page.keyboard.press('Space');await page.waitForTimeout(300);await page.keyboard.up('d');
    }
    if (shot && turn===0) await page.screenshot({path:'test-results/'+shot+'.png'});
    await page.waitForFunction(()=>document.querySelector('.ability-card:not(:disabled)')||!document.querySelector('.scene-combat'));

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

test('four body-part keyboard attacks work for both companions; key 5 uses the charged ultimate',async({page})=>{
  test.setTimeout(150000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await savedVillage(page,{completedStages:[0,1],xp:135});
  for (const hero of ['kotaro','buba']) {
    if (hero==='buba') {
      await page.getByRole('button',{name:'Team',exact:true}).click();
      await page.getByRole('button',{name:'Choose Buba',exact:true}).click();
    }
    await page.getByRole('button',{name:'Adventure',exact:true}).click();
    await page.getByRole('button',{name:/Stage 3:/}).click();
    await page.getByRole('button',{name:'Enter encounter',exact:true}).click();
    await expect(page.locator('.ability-card')).toHaveCount(4);
    await page.keyboard.press('5');
    await expect(page.locator('.ability-card').first()).toBeEnabled();
    await page.waitForTimeout(350);
    const frozen=await page.locator('canvas').screenshot();
    await page.waitForTimeout(700);
    expect((await page.locator('canvas').screenshot()).equals(frozen)).toBe(true);
    for (const [index,part] of ['horn','mouth','back','tail'].entries()) {
      const card=page.locator('.ability-card').nth(index);
      await expect(card).toBeEnabled();
      await expect(card).toHaveAttribute('data-part',part);
      const name=await card.locator('strong').textContent();
      await page.keyboard.press(index===0?'x':String(index+1));
      await expect(page.getByRole('status')).toContainText(name+'!');
      await expect(card).toBeDisabled();
      await expect(card).toBeEnabled({timeout:10000});
    }
    await expect(page.locator('.ultimate-button')).toBeEnabled();
    await page.keyboard.press('5');
    await expect(page.getByRole('status')).toContainText(hero==='buba'?'Paintstorm!':'Moonlit Eclipse!');
    await expect(page.locator('.ultimate-button')).toBeDisabled();
    await page.getByRole('button',{name:'Pause encounter'}).click();
    await page.getByRole('button',{name:'Retreat from encounter'}).click();
    await expect(page.locator('.scene-village')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('complete prologue, Buba unlock, rank rewards, route, amulet rescue and durable save', async ({page}) => {
  test.setTimeout(240000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.getByRole('button',{name:'Begin journey'}).click();
  await page.getByRole('button',{name:'Reveal dialogue'}).click();
  await page.getByRole('button',{name:'Approach the village'}).click();
  await page.getByRole('button',{name:'Reveal dialogue'}).click();
  await page.getByRole('button',{name:'Step into the clearing'}).click();
  await page.getByRole('button',{name:'Reveal dialogue'}).click();
  await page.getByRole('button',{name:'Defend yourself'}).click();
  await expect(page.locator('.enemy-health')).toContainText('Buba');
  await page.screenshot({path:'test-results/atia-buba-desktop.png'});
  await fight(page,{shot:'atia-dodge-desktop'});
  await expect(page.getByRole('heading',{name:'You… you stopped.'})).toBeVisible();
  await page.screenshot({path:'test-results/atia-dialogue-desktop.png'});
  for(let i=0;i<4;i++) { await page.getByRole('button',{name:'Reveal dialogue'}).click(); await page.getByRole('button',{name:'Continue',exact:true}).click(); }
  await page.getByRole('button',{name:'Reveal dialogue'}).click();
  await page.getByRole('button',{name:'Accept the amulet'}).click();
  await page.getByRole('button',{name:'Reveal dialogue'}).click();
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
    await expect(page.locator('.ability-card').first()).toContainText('Leaf Horn');
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
  const beforePan = (await page.locator('.world-stage').boundingBox()).x;
  const touch = await context.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:275,y:390}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:125,y:390}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect((await page.locator('.world-stage').boundingBox()).x).toBeLessThan(beforePan-100);
  await page.getByRole('button',{name:'How to play'}).tap();
  await expect(page.getByRole('dialog',{name:'Traveler’s guide'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'How to play'})).toBeFocused();
  await page.getByRole('button',{name:'View camp',exact:true}).tap();
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
  await expect(page.locator('.dodge-controls')).toBeVisible();
  await visibleControls(page,'.movement-button');
  const right=await page.getByRole('button',{name:'Move right',exact:true}).boundingBox();
  const jump=await page.getByRole('button',{name:'Jump',exact:true}).boundingBox();
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:right.x+right.width/2,y:right.y+right.height/2},{id:2,x:jump.x+jump.width/2,y:jump.y+jump.height/2}]});
  await page.waitForTimeout(220);
  expect(Number(await page.locator('.dodge-controls').getAttribute('data-player-x'))).toBeGreaterThan(350);
  expect(Number(await page.locator('.dodge-controls').getAttribute('data-player-y'))).toBeLessThan(550);
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.getByRole('button',{name:'Pause encounter'}).tap();
  await expect(page.getByRole('dialog',{name:'Game paused'})).toBeVisible();
  const frozenTimer = await page.locator('.dodge-timer').textContent();
  // Wait longer than the warning window to prove the scene clock is frozen.
  await page.waitForTimeout(1100);
  await expect(page.locator('.dodge-timer')).toHaveText(frozenTimer);
  await page.getByRole('button',{name:'Resume encounter'}).tap();
  await page.screenshot({path:'test-results/atia-dodge-mobile.png'});
  await page.setViewportSize({width:844,height:390});
  await page.waitForFunction(()=>document.querySelector('.ability-card:not(:disabled)'));
  await visibleControls(page,'.ability-card,.ultimate-button');
  await page.screenshot({path:'test-results/atia-combat-landscape.png'});
  await page.locator('.ability-card').first().tap();
  await expect(page.locator('.dodge-controls')).toBeVisible();
  await visibleControls(page,'.movement-button');
  await page.getByRole('button',{name:'Dash',exact:true}).tap();
  await page.getByRole('button',{name:'Pause encounter'}).tap();
  await page.getByRole('button',{name:'Retreat from encounter'}).tap();
  await expect(page.locator('.scene-village')).toBeVisible();
  await page.screenshot({path:'test-results/atia-village-landscape.png'});
  await page.reload();
  await expect(page.locator('.scene-village')).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});
