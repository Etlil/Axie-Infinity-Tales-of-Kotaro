const SHEETS={'puff-idle':6,'puff-spin':6,'puff-expressions':9,'puff-walk':4,'frog-attack':6,'frog-walk':8,'tongue-base':1,'tongue-tip':1};
export function preloadCaveEnemies(scene){for(const key of Object.keys(SHEETS))scene.load.binary(key+'-source','assets/enemies/'+key+'.png');}
export async function registerCaveEnemies(scene){
 for(const [key,count] of Object.entries(SHEETS)){
  const source=await createImageBitmap(new Blob([scene.cache.binary.get(key+'-source')],{type:'image/png'}));
  const texture=scene.textures.createCanvas(key,256*Math.min(count,4),256*Math.ceil(count/4)),ctx=texture.getContext();
  for(let i=0;i<count;i++){
   const x=Math.round(i*source.width/count),end=Math.round((i+1)*source.width/count);
   ctx.drawImage(source,x,0,end-x,source.height,i%4*256,Math.floor(i/4)*256,256,256);
   texture.add(i,0,i%4*256,Math.floor(i/4)*256,256,256);
  }
  // The tongue drawings have a white paper background, unlike the character PNGs.
  if(key.startsWith('tongue')){
   const image=ctx.getImageData(0,0,256,256);
   for(let i=0;i<image.data.length;i+=4)if(Math.min(image.data[i],image.data[i+1],image.data[i+2])>225)image.data[i+3]=0;
   ctx.putImageData(image,0,0);
  }
  texture.refresh();source.close();scene.cache.binary.remove(key+'-source');
 }
 const anim=(key,texture,frames,rate=8,repeat=-1)=>scene.anims.create({key,frames:frames.map(frame=>({key:texture,frame})),frameRate:rate,repeat});
 anim('puff-idle','puff-idle',[0,1,2,3,4,5]);anim('puff-spin','puff-spin',[0,1,2,3,4,5],16);
 anim('puff-hit','puff-expressions',[6,7,8],9,0);anim('puff-slam','puff-expressions',[3,4,5],10);
 for(const [direction,frames] of Object.entries({right:[0,1],down:[2,3],left:[4,5],up:[6,7]}))anim('frog-walk-'+direction,'frog-walk',frames,7);
 anim('frog-idle','frog-attack',[0,1],4);anim('frog-open','frog-attack',[0,1,2,3,4],9,0);
 anim('frog-caught','frog-attack',[5],1,0);anim('frog-leap','frog-attack',[5],1,0);
}
export function caveEnemy(scene,x,y,kind,scale=1,facing='left'){
 const root=scene.add.container(x,y).setScale(scale);root.kind=kind;
 const shadow=scene.add.ellipse(0,43,70,14,0x081d29,.25);
 const sprite=scene.add.sprite(0,kind==='puff'?-10:0,kind==='puff'?'puff-idle':'frog-attack',0).setDisplaySize(132,132);
 root.add([shadow,sprite]);root.sprite=sprite;
 root.setFacing=direction=>{root.facing=direction;sprite.setFlipX(kind==='frog'&&direction==='left');};root.setFacing(facing);
 root.playAction=action=>{
  const name=kind==='puff'?(action==='spin'||action==='dash'?'spin':action==='hit'?'hit':action==='slam'?'slam':'idle')
   :action==='caught'?'caught':action==='dash'?'leap':action==='attack'||action==='open'?'open':'idle';
  sprite.play(kind+'-'+name,true);
 };
 root.walk=direction=>{
  sprite.setFlipX(false);
  if(kind==='frog')sprite.play('frog-walk-'+direction,true);
  else {sprite.anims.stop();sprite.setTexture('puff-walk',{down:0,right:1,up:2,left:3}[direction]??0);}
 };
 root.playAction('idle');return root;
}
export class TongueVisual {
 constructor(scene){this.base=scene.add.image(0,0,'tongue-base').setOrigin(0,.5).setDepth(11).setVisible(false);this.tip=scene.add.image(0,0,'tongue-tip').setDepth(12).setVisible(false);}
 update(shots){
  const shot=shots.find(s=>s.kind==='frog-tongue');this.base.setVisible(!!shot);this.tip.setVisible(!!shot);
  if(!shot)return;
  const dx=shot.x-shot.originX,dy=shot.y-shot.originY,angle=Math.atan2(dy,dx);
  this.base.setPosition(shot.originX,shot.originY).setRotation(angle).setDisplaySize(Math.hypot(dx,dy),34);
  this.tip.setPosition(shot.x,shot.y).setRotation(angle).setDisplaySize(shot.stage==='caught'?54:28,shot.stage==='caught'?54:28);
 }
 clear(){this.base.setVisible(false);this.tip.setVisible(false);}
}
