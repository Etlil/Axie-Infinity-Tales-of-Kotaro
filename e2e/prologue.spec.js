const {test,expect}=require('@playwright/test');
const {enterAdventure}=require('./helpers');
test('pendant cinematic pauses in Settings and ends in the playable tutorial',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await enterAdventure(page);
 await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_CINEMATIC');
 await page.waitForTimeout(3400);await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.screenshot({path:'test-results/pendant-paused.png'});
 await page.waitForTimeout(4500);await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_CINEMATIC');
 await page.getByRole('button',{name:'Close panel'}).click();
 await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_MOVE');
 await page.screenshot({path:'test-results/approach-desktop.png'});
 await page.keyboard.down('w');await page.waitForTimeout(200);await page.keyboard.up('w');
 await expect(page.locator('[data-direction="up"]')).toHaveClass('done');
 await page.keyboard.down('s');await page.waitForTimeout(180);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.keyboard.up('s');
 await page.getByRole('button',{name:'Close panel'}).click();await page.waitForTimeout(180);
 const stopped=await page.locator('.prologue-objective').getAttribute('data-y');
 await page.waitForTimeout(450);await expect(page.locator('.prologue-objective')).toHaveAttribute('data-y',stopped);
 await page.reload();await enterAdventure(page);
 await expect(page.locator('[data-direction="up"]')).toHaveClass('done');
 expect(errors).toEqual([]);
});
for(const viewport of [{width:844,height:390},{width:390,height:844}])test(`joystick navigation and name entry work at ${viewport.width}x${viewport.height}`,async({browser})=>{
 const context=await browser.newContext({viewport,isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('/');await enterAdventure(page);await page.getByRole('button',{name:'Skip scene'}).tap();
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_MOVE');
  const touch=await context.newCDPSession(page),r=await page.getByRole('group',{name:'Movement joystick'}).boundingBox();
  for(const [dx,dy] of [[0,-30],[-30,0],[0,30],[30,0]]){
   await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2+dx,y:r.y+r.height/2+dy}]});
   await page.waitForTimeout(180);await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_SIGN');
  await page.screenshot({path:`test-results/intro-controls-${viewport.width}.png`});
  const action=await page.getByRole('button',{name:'Interact with ruined sign'}).boundingBox();
  expect(action.x).toBeGreaterThanOrEqual(0);expect(action.y+action.height).toBeLessThanOrEqual(viewport.height);expect(action.height).toBeGreaterThanOrEqual(44);
  // Resume a legitimate half-health story checkpoint to test the virtual keyboard form.
  await page.evaluate(()=>{const k='atia-adventure-v1',p=JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify({...p,tutorialWon:true,dialogueIndex:7}));});
  await page.reload();await enterAdventure(page);
  await page.getByRole('textbox',{name:'Your name'}).fill('Akira');
  await page.screenshot({path:`test-results/name-entry-${viewport.width}.png`});
  await page.getByRole('button',{name:'Confirm name'}).tap();
  await expect(page.locator('.dialogue-box')).toContainText('Nice to meet you, Akira.');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atia-adventure-v1')).playerName)).toBe('Akira');
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
