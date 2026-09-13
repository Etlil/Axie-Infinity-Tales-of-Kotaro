const {test,expect}=require('@playwright/test');
const profile={version:1,tutorialWon:true,prologueComplete:true,amulet:true,xp:60,activeCharacter:'kotaro'};
test('walk the town, collide with the well, interact with Buba, and follow the gate to the level map',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(saved=>localStorage.setItem('atia-adventure-v1',JSON.stringify(saved)),profile);
  await page.goto('/');await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','15');
  await page.keyboard.down('ArrowUp');await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','12');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');
  await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','12');
  await page.keyboard.press('e');await expect(page.getByRole('dialog',{name:'The Atia journal'})).toBeVisible();await page.keyboard.press('Escape');
  async function step(dir){await page.getByRole('button',{name:'Walk '+dir}).focus();await page.keyboard.press('Enter');await page.waitForTimeout(160);}
  for(let i=0;i<8;i++)await step('left');for(let i=0;i<3;i++)await step('up');
  await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-x','6');await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','9');
  await page.keyboard.press('e');await expect(page.getByRole('dialog',{name:'Buba’s tent'})).toBeVisible();
  await page.getByRole('button',{name:'Claim rank 1',exact:true}).click();await page.getByRole('button',{name:'Close panel'}).click();
  await page.screenshot({path:'test-results/town-buba-desktop.png'});
  await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await expect(page.locator('.scene-map')).toBeVisible();await page.getByRole('button',{name:'‹ Atia',exact:true}).click();
  await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-x','26');await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','5');
  await page.keyboard.press('e');await expect(page.locator('.scene-map')).toBeVisible();
  expect(errors).toEqual([]);
});
for(const viewport of [{width:568,height:320},{width:390,height:844}])test(`town touch controls and destinations at ${viewport.width}x${viewport.height}`,async({browser})=>{
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.addInitScript(saved=>localStorage.setItem('atia-adventure-v1',JSON.stringify({...saved,rescued:[{id:'puffy'}],completedStages:[0,1,2]})),profile);
    await page.goto('/');await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','15');
    for(const selector of ['.town-pad button','.town-actions button'])for(const el of await page.locator(selector).all()){
      const r=await el.boundingBox();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.height).toBeGreaterThanOrEqual(44);expect(r.x+r.width).toBeLessThanOrEqual(viewport.width+1);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height+1);
    }
    const touch=await context.newCDPSession(page),up=await page.getByRole('button',{name:'Walk up',exact:true}).boundingBox();
    await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:up.x+up.width/2,y:up.y+up.height/2}]});await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','12');
    await page.getByRole('button',{name:'Settings',exact:true}).tap();await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.getByRole('button',{name:'Close panel'}).tap();
    await page.waitForTimeout(400);await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-y','12');
    await page.screenshot({path:`test-results/town-${viewport.width}x${viewport.height}.png`});
    await page.getByRole('button',{name:'Visit Puffy',exact:true}).tap();await expect(page.getByRole('dialog',{name:'Puffy’s healing spring'})).toBeVisible();
    await expect(page.locator('.town-bottom')).toHaveAttribute('data-tile-x','23');await page.getByRole('button',{name:'Close panel'}).tap();
    await page.getByRole('button',{name:'Adventure',exact:true}).tap();await expect(page.locator('.scene-map')).toBeVisible();
    expect(errors).toEqual([]);
  }finally{await context.close();}
});
