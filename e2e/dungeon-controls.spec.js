const {test,expect}=require('@playwright/test');
for(const viewport of [{width:568,height:320},{width:390,height:844}]){
  test(`dungeon touch movement, walls and menu input at ${viewport.width}x${viewport.height}`,async({browser})=>{
    const context=await browser.newContext({viewport,isMobile:true,hasTouch:true});
    const page=await context.newPage();
    try{
      await page.addInitScript(()=>localStorage.setItem('atia-adventure-v1',JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true})));
      await page.goto('/');await page.getByRole('button',{name:'Adventure',exact:true}).tap();
      await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','8');
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
      await page.getByRole('button',{name:'Adventure',exact:true}).tap();await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-tile-y','8');
    }finally{await context.close();}
  });
}
