const {enterAdventure}=require('./helpers');
const { test, expect } = require('@playwright/test');
const {contactFirstSlime}=require('./helpers');
const SAVE_KEY='atia-adventure-v1';

test('legacy Momo rescue becomes Puffy without losing progress or granting another rescue',async({browser})=>{
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[],loaded=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.ok())loaded.push(response.url());});
  try {
    await page.addInitScript(key=>{
      if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,
        amulet:true,activeCharacter:'buba',xp:460,coins:999,wood:30,essence:40,claimedRewards:[1,2],completedStages:[0,1,2],
        rescued:[{id:'momo',name:'Momo'}]}));
    },SAVE_KEY);
    await page.goto('/');await enterAdventure(page);
    await expect(page.locator('.scene-village')).toBeVisible();
    await expect(page.locator('.quest-card')).toContainText('Puffy rescued');
    await expect(page.locator('.quest-card')).toContainText('+5% dodge time');
    await expect(page.locator('.profile-block')).toContainText('Adventure Rank 5');
    const migrated=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
    expect(migrated).toMatchObject({xp:460,coins:999,wood:30,essence:40,claimedRewards:[1,2],completedStages:[0,1,2]});
    expect(migrated.rescued).toEqual([{id:'puffy',name:'Puffy',rescueBonus:{stat:'dodgeAccuracy',value:.05}}]);
    await page.screenshot({path:'test-results/puffy-village-landscape.png'});
    await page.getByRole('button',{name:'Adventure',exact:true}).tap();
    await contactFirstSlime(page);
    await expect(page.locator('.scene-combat')).toHaveAttribute('data-enemy','slime-moss');
    await expect(page.locator('.enemy-health')).toContainText('Moss Slime');
    await expect(page.locator('.ability-card').first()).toBeEnabled();
    expect(loaded.some(url=>url.endsWith('/puffy-sheet.png'))).toBe(true);
    expect(loaded.some(url=>url.endsWith('/momo-avatar.png'))).toBe(false);
    await page.screenshot({path:'test-results/puffy-combat-landscape.png'});
    await page.locator('.ability-card').first().tap();
    await expect(page.locator('.dodge-controls')).toBeVisible();
    await page.screenshot({path:'test-results/puffy-dodge-landscape.png'});
    await expect(page.locator('.health').first()).not.toContainText('110 / 110');
    await page.getByRole('button',{name:'Pause encounter'}).tap();
    await page.getByRole('button',{name:'Retreat from encounter'}).tap();
    await page.getByRole('button',{name:'Visit Puffy',exact:true}).tap();
    await expect(page.getByRole('dialog',{name:'Puffy’s healing spring'})).toBeVisible();
    await expect(page.getByRole('button',{name:'Restore health',exact:true})).toBeEnabled();
    await page.screenshot({path:'test-results/puffy-healer-injured-landscape.png'});
    await page.getByRole('button',{name:'Restore health',exact:true}).tap();
    await expect(page.locator('.puffy-health')).toContainText('110 / 110 HP');
    await expect(page.getByRole('button',{name:'Fully healed',exact:true})).toBeDisabled();
    await page.screenshot({path:'test-results/puffy-healer-landscape.png'});
    await page.setViewportSize({width:568,height:320});
    await expect(page.getByRole('button',{name:'Fully healed',exact:true})).toBeInViewport();
    await page.screenshot({path:'test-results/puffy-healer-small-landscape.png'});
    await page.setViewportSize({width:390,height:844});
    await expect(page.getByRole('button',{name:'Fully healed',exact:true})).toBeInViewport();
    await page.screenshot({path:'test-results/puffy-healer-portrait.png'});
    const afterHealing=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
    expect(afterHealing).toMatchObject({xp:460,coins:999,wood:30,essence:40,claimedRewards:[1,2]});
    await page.reload();await enterAdventure(page);
    await expect(page.locator('.quest-card')).toContainText('Puffy rescued');
    expect((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY)).rescued).toHaveLength(1);
    expect(errors).toEqual([]);
  } finally {await context.close();}
});
