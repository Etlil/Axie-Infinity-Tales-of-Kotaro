const {enterAdventure}=require('./helpers');
const {test,expect}=require('@playwright/test');
test('sanctuary clues and valve controls leave the hero visible on a short phone',async({browser})=>{
  const context=await browser.newContext({viewport:{width:568,height:320},isMobile:true,hasTouch:true}),page=await context.newPage();
  try{
    await page.addInitScript(()=>localStorage.setItem('atia-adventure-v1',JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true,completedStages:[0,1]})));
    await page.goto('/');await enterAdventure(page);await page.getByRole('button',{name:'Adventure',exact:true}).tap();
    await page.getByRole('button',{name:'Level 3: Sunken Sanctuary',exact:true}).tap();
    await page.getByRole('button',{name:'Enter dungeon'}).tap();
    await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-level','2');
    const clue=await page.locator('.dungeon-objective').boundingBox();expect(clue.x+clue.width).toBeLessThan(269);
    for(const name of ['Approach a valve','Reset puzzle','Level map','Exit to Atia']){
      const r=await page.getByRole('button',{name,exact:true}).boundingBox();
      expect(r.height).toBeGreaterThanOrEqual(44);expect(r.y).toBeGreaterThan(180);expect(r.x+r.width).toBeLessThanOrEqual(569);expect(r.y+r.height).toBeLessThanOrEqual(321);
    }
    await page.screenshot({path:'test-results/sanctuary-568x320.png'});
    await page.getByRole('button',{name:'Level map',exact:true}).tap();await expect(page.locator('.scene-map')).toBeVisible();
  }finally{await context.close();}
});
for(const viewport of [{width:568,height:320},{width:390,height:844}]){
  test(`dungeon touch movement, walls and menu input at ${viewport.width}x${viewport.height}`,async({browser})=>{
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true});
    const page=await context.newPage();
    try{
      await page.addInitScript(()=>localStorage.setItem('atia-adventure-v1',JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true})));
      await page.goto('/');await enterAdventure(page);await page.getByRole('button',{name:'Adventure',exact:true}).tap();
      await expect(page.locator('.scene-map')).toBeVisible();
      await expect(page.getByRole('button',{name:'Level 2: Amber Quarry',exact:true})).toBeDisabled();
      await page.screenshot({path:`test-results/level-map-${viewport.width}x${viewport.height}.png`});
      const entry=page.getByRole('button',{name:'Enter dungeon'}),bounds=await entry.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(44);expect(bounds.x+bounds.width).toBeLessThanOrEqual(viewport.width+1);expect(bounds.y+bounds.height).toBeLessThanOrEqual(viewport.height+1);
      await entry.tap();
      await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','8');
      if(viewport.width>viewport.height){
        const clue=await page.locator('.dungeon-objective').boundingBox();
        expect(clue.x+clue.width).toBeLessThan(viewport.width/2-15);
      }
      const touch=await context.newCDPSession(page),up=await page.getByRole('button',{name:'Walk up'}).boundingBox();
      await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:up.x+up.width/2,y:up.y+up.height/2}]});
      await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','3');
      await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(400);await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','3');
      await page.getByRole('button',{name:'Settings',exact:true}).tap();
      await page.keyboard.press('ArrowDown');await page.getByRole('button',{name:'Close panel'}).tap();
      await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','3');
      for(const name of ['Walk up','Walk down','Walk left','Walk right','Exit to Atia']){
        const r=await page.getByRole('button',{name,exact:true}).boundingBox();
        expect(r.height).toBeGreaterThanOrEqual(44);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x+r.width).toBeLessThanOrEqual(viewport.width+1);expect(r.y+r.height).toBeLessThanOrEqual(viewport.height+1);
      }
      await page.screenshot({path:`test-results/dungeon-${viewport.width}x${viewport.height}.png`});
      await page.getByRole('button',{name:'Exit to Atia'}).tap();await expect(page.locator('.scene-village')).toBeVisible();
      await page.getByRole('button',{name:'Adventure',exact:true}).tap();await page.getByRole('button',{name:'Enter dungeon'}).tap();await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','8');
    }finally{await context.close();}
  });
}
