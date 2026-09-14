const {enterAdventure}=require('./helpers');
const {test,expect}=require('@playwright/test');

test('level map, three distinct puzzles, sequential dungeon clears and Puffy rescue',async({page})=>{
  test.setTimeout(600000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{if(!localStorage.getItem('atia-adventure-v1'))localStorage.setItem('atia-adventure-v1',JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true,activeCharacter:'kotaro'}));});
  await page.goto('/');await enterAdventure(page);await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await expect(page.locator('.scene-map')).toBeVisible();
  await expect(page.getByRole('button',{name:'Level 2: Amber Quarry',exact:true})).toBeDisabled();
  await page.screenshot({path:'test-results/dungeon-level-map.png'});
  await page.getByRole('button',{name:'Enter dungeon'}).click();
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
    await expect(page.locator('.scene-combat')).toBeVisible();
    for(let i=0;i<12;i++){
      await page.waitForFunction(()=>document.querySelector('.ability-card:not(:disabled)')||!document.querySelector('.scene-combat'));
      if(!await page.locator('.scene-combat').count()){await expect(page.locator('.scene-victory')).toBeVisible();return;}
      const ult=page.locator('.ultimate-button:not(:disabled)');
      if(await ult.count())await ult.click();else await page.locator('.ability-card').first().click();
      await page.waitForFunction(()=>document.querySelector('.dodge-controls')||!document.querySelector('.scene-combat'));
      if(await page.locator('.dodge-controls').count()){
        await page.keyboard.down('d');await page.keyboard.press('Space');await page.waitForTimeout(300);await page.keyboard.up('d');
      }
    }
    throw Error('Fight did not finish');
  }
  async function resume(){await page.getByRole('button',{name:'Continue journey',exact:true}).click();await expect(page.locator('.scene-dungeon')).toBeVisible();}
  async function nextLevel(index,name){
    await page.getByRole('button',{name:'Back to level map',exact:true}).click();
    await page.getByRole('button',{name:`Level ${index+1}: ${name}`,exact:true}).click();
    await page.getByRole('button',{name:'Enter dungeon'}).click();
    await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-level',String(index));
  }
  await travel(8,8);await fight();await resume();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('atia-adventure-v1')).completedStages)).toEqual([]);
  await travel(16,9);await travel(21,11); // Wrong first rune must not open the seal.
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-puzzle-solved','false');
  await travel(18,11);await travel(18,6);await travel(21,6);await travel(21,11);
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-puzzle-solved','true');
  await page.screenshot({path:'test-results/dungeon-grove-puzzle.png'});
  await travel(24,10);await travel(30,10);await travel(35,10);await fight();
  await nextLevel(1,'Amber Quarry');
  await travel(8,8);await fight();await resume();
  await travel(8,12);await travel(8,19);await travel(8,20);await step('right');await step('down');
  await page.getByRole('button',{name:'Reset puzzle',exact:true}).click();
  await travel(8,21);await travel(8,20);await step('right');await step('right');await step('right');
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-puzzle-solved','true');
  await page.screenshot({path:'test-results/dungeon-quarry-puzzle.png'});
  await travel(14,21);await travel(21,21);await travel(27,21);await fight();
  await nextLevel(2,'Sunken Sanctuary');
  await travel(8,8);await fight();await resume();
  await travel(16,9);await travel(21,12);await fight();await resume();
  await travel(18,12);await travel(18,9);await page.getByRole('button',{name:'Use valve I · E',exact:true}).click();
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-lamps','3');
  await travel(21,9);await page.keyboard.press('e');
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-lamps','5');
  await travel(21,15);await page.getByRole('button',{name:'Use valve III · E',exact:true}).click();
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-puzzle-solved','true');
  await page.screenshot({path:'test-results/dungeon-sanctuary-puzzle.png'});
  await travel(24,10);await travel(30,10);await travel(38,8);
  await expect(page.locator('.enemy-health')).toContainText('Corrupted Puffy');await fight();
  await page.getByRole('button',{name:'Use the amulet',exact:true}).click();
  await page.getByRole('button',{name:'Bring Puffy home',exact:true}).click();
  await expect(page.getByRole('button',{name:'Visit Puffy',exact:true})).toBeVisible();
  await page.reload();await enterAdventure(page);await page.getByRole('button',{name:'Adventure',exact:true}).click();
  await expect(page.locator('.expedition-node.cleared')).toHaveCount(3);
  await page.getByRole('button',{name:'Replay dungeon'}).click();
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-puzzle-solved','false');
  await expect(page.locator('.dungeon-bottom')).toHaveAttribute('data-defeated','0');
  expect(errors).toEqual([]);
});
