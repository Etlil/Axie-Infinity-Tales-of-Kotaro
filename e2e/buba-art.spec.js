const {test,expect}=require('@playwright/test');
const {enterAdventure}=require('./helpers');
const fs=require('fs');
test.use({viewport:{width:844,height:390},isMobile:true,hasTouch:true});

test('Buba artwork loads transparent, changes direction, and uses attack and hurt poses',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('atia-adventure-v1',JSON.stringify({version:1,tutorialWon:true,prologueComplete:true,amulet:true,xp:60,activeCharacter:'buba'})));
 await page.goto('/');await enterAdventure(page);await expect(page.locator('.scene-village')).toBeVisible();
 const result=await page.evaluate(async()=>{
  // Inspect the real development game, without shipping a debug API.
  let require;const chunk=Object.keys(window).find(key=>key.startsWith('webpackChunk'));
  window[chunk].push([['buba-art-check'],{},r=>{require=r;}]);
  const phaserId=Object.keys(require.m).find(key=>/phaser\/(dist|src)\/phaser(?:\.min)?\.js$/.test(key));
  const Phaser=require(phaserId),game=Phaser.Display.Canvas.CanvasPool.pool.map(entry=>entry.parent?.game).find(g=>g?.scene?.isActive('VillageScene'));
  const scene=game.scene.getScene('VillageScene'),textures={};
  for(const kind of ['village','battle','dash','throw','projectile']){
   const canvas=game.textures.get('buba-'+kind+'-drawn').getSourceImage();
   textures[kind]=canvas.toDataURL();
  }
  const {bubaFighter}=require('./src/game/bubaSprites.js');
  const actor=bubaFighter(scene,scene.hero.x+130,scene.hero.y-70,1,'left');
  actor.playAction('hit');const hit=actor.sprite.anims.currentAnim.key;
  actor.playAction('dash');const dash=actor.sprite.anims.currentAnim.key;
  actor.playAction('mushroom');const mushroom=actor.sprite.anims.currentAnim.key;
  actor.destroy();
  const source=await fetch('/assets/buba/village.png').then(r=>r.blob()).then(createImageBitmap);
  const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
  const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);
  const alpha=ctx.getImageData(0,0,1,1).data[3];source.close();
  return {textures,hit,dash,mushroom,alpha};
 });
 expect(result.alpha).toBe(0);expect(result.hit).toBe('buba-drawn-hit');expect(result.dash).toBe('buba-drawn-dash');expect(result.mushroom).toBe('buba-drawn-throw');
 fs.mkdirSync('test-results',{recursive:true});
 for(const [kind,data] of Object.entries(result.textures))fs.writeFileSync('test-results/buba-'+kind+'-atlas.png',Buffer.from(data.split(',')[1],'base64'));
 await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');
 await page.screenshot({path:'test-results/buba-village-new.png'});
 expect(errors).toEqual([]);
});
