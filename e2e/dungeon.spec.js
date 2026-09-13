const {test,expect}=require('@playwright/test');
test('explore corridors, encounter single slimes, and find Puffy in the final chamber',async({page})=>{
  test.setTimeout(240000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('atia-adventure-v1',JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true,activeCharacter:'kotaro'})));
  await page.goto('/');await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await expect(page.locator('.scene-dungeon')).toBeVisible();
  await page.screenshot({path:'test-results/dungeon-entrance.png'});
  async function step(dir){await page.getByRole('button',{name:'Walk '+dir}).focus();await page.keyboard.press('Enter');await page.waitForTimeout(165);}
  async function travel(x,y){
    for(let i=0;i<100;i++){
      const p=await page.evaluate(()=>{
        const el=document.querySelector('.dungeon-bottom');
        return el&&document.querySelector('main').dataset.phase==='EXPLORING'?{x:+el.dataset.tileX,y:+el.dataset.tileY}:null;
      });
      if(!p)return;
      if(p.x===x&&p.y===y)return;
      await step(p.y!==y?(p.y<y?'down':'up'):p.x<x?'right':'left');
    }
    throw Error('Could not reach tile '+x+','+y);
  }
  async function fight(){
    for(let i=0;i<12;i++){
      await page.waitForFunction(()=>document.querySelector('.ability-card:not(:disabled)')||!document.querySelector('.scene-combat'));
      if(!await page.locator('.scene-combat').count())return;
      const ult=page.locator('.ultimate-button:not(:disabled)');
      if(await ult.count())await ult.click();else await page.locator('.ability-card').first().click();
      await page.waitForFunction(()=>document.querySelector('.dodge-controls')||!document.querySelector('.scene-combat'));
      if(await page.locator('.dodge-controls').count()){
        await page.keyboard.down('d');await page.keyboard.press('Space');await page.waitForTimeout(300);await page.keyboard.up('d');
      }
    }
    throw Error('Fight did not finish');
  }
  await travel(8,8);await expect(page.locator('.enemy-health')).toContainText('Moss Slime');
  await fight();await page.getByRole('button',{name:'Continue journey'}).click();
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-defeated','1');
  await travel(16,9);await travel(21,12);
  await expect(page.locator('.enemy-health')).toContainText('Dusk Slime');
  await fight();await page.getByRole('button',{name:'Continue journey'}).click();
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-defeated','2');
  await travel(16,9);await travel(24,10);await travel(30,10);await travel(38,8);
  await expect(page.locator('.enemy-health')).toContainText('Corrupted Puffy');
  await page.screenshot({path:'test-results/dungeon-puffy-battle.png'});
  await fight();await page.getByRole('button',{name:'Use the amulet'}).click();
  await page.getByRole('button',{name:'Bring Puffy home'}).click();
  await expect(page.getByRole('button',{name:'Visit Puffy'})).toBeVisible();
  expect(errors).toEqual([]);
});
