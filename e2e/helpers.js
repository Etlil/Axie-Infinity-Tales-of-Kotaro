const {expect}=require('@playwright/test');
async function contactFirstSlime(page){
  await expect(page.locator('.scene-dungeon')).toBeVisible();
  await page.keyboard.down('ArrowRight');
  await expect(page.locator('.scene-combat')).toBeVisible();
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('.ability-card').first()).toBeEnabled();
}
module.exports={contactFirstSlime};
