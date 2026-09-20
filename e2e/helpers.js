const {expect}=require('@playwright/test');
async function contactFirstSlime(page){
  await expect(page.locator('.scene-map, .scene-dungeon')).toBeVisible();
  if(await page.locator('.scene-map').count()){
    await page.getByRole('button',{name:'Level 1: Aqua Cave',exact:true}).click();
    await page.getByRole('button',{name:/^(Enter|Replay) dungeon/}).click();
  }
  await expect(page.locator('.scene-dungeon')).toBeVisible();
  await page.keyboard.down('ArrowRight');
  await expect(page.locator('.scene-combat')).toBeVisible();
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('.ability-card').first()).toBeEnabled();
}
async function enterAdventure(page,slot=1){
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await page.locator('[data-save-slot="'+slot+'"]').click();
  await expect(page.locator('.scene-menu')).toHaveCount(0);
}
module.exports={contactFirstSlime,enterAdventure};
async function reachBuba(page){
  const skip=page.getByRole('button',{name:'Skip scene'});
  if(await skip.isVisible())await skip.click();
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_MOVE');
  for(const key of ['w','a','s','d']){await page.keyboard.down(key);await page.waitForTimeout(120);await page.keyboard.up(key);}
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_SIGN');
  await page.keyboard.down('w');
  await expect(page.getByRole('button',{name:'Interact with ruined sign'})).toBeEnabled();
  await page.keyboard.up('w');await page.keyboard.press('f');
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_SIGN_TEXT');
  await expect(page.locator('.dialogue-box')).toContainText('A\\_/a VXlxg/');
  await page.keyboard.press('f');
  await page.keyboard.down('w');await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_REVEAL');await page.keyboard.up('w');
  await expect(page.locator('main')).toHaveAttribute('data-phase','INTRO_VILLAGE');
  await page.keyboard.down('w');await expect(page.locator('.scene-combat')).toBeVisible();await page.keyboard.up('w');
}
async function finishBubaConversation(page,name='Luna'){
  await expect(page.locator('.scene-dialogue')).toBeVisible();
  for(let i=0;i<35;i++){
    if(await page.locator('.scene-village').count())return;
    const input=page.getByRole('textbox',{name:'Your name'});
    if(await input.isVisible()){await input.fill(name);await page.getByRole('button',{name:'Confirm name'}).click();continue;}
    const choice=page.locator('.response-options button').first();
    if(await choice.isVisible()){await choice.click();continue;}
    const advance=page.locator('.dialogue-advance');
    if(await advance.isVisible()){await advance.click();await page.waitForTimeout(80);}else await page.waitForTimeout(180);
  }
  await expect(page.locator('.scene-village')).toBeVisible();
}
module.exports.reachBuba=reachBuba;
module.exports.finishBubaConversation=finishBubaConversation;
