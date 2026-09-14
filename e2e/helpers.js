const {expect}=require('@playwright/test');
async function contactFirstSlime(page){
  await expect(page.locator('.scene-map, .scene-dungeon')).toBeVisible();
  if(await page.locator('.scene-map').count()){
    await page.getByRole('button',{name:'Level 1: Mosslight Grove',exact:true}).click();
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
