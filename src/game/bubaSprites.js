// The supplied sheets have uneven gutters and mixed-width final rows. Rectangles
// are measured in the original artwork coordinates, not assumed equal cells.
const range=n=>Array.from({length:n},(_,i)=>i);
const villageRows=[0,207,400,592,795,1002,1214,1430,1634];
const villageColumns=[0,222,444,666,887];
const villageFrames=range(32).map(i=>{
 const row=Math.floor(i/4),col=i%4,x=villageColumns[col],y=villageRows[row];
 const inset=col?4:0;
 return {rect:[x+inset,y,villageColumns[col+1]-x-inset,villageRows[row+1]-y],scale:1.02};
});
const dashRows=[
 {y:35,bottom:245,cuts:[0,365,691,1036,1379,1774],feet:[220,220,221,221,221]},
 {y:275,bottom:485,cuts:[0,385,731,1080,1430,1774],feet:[456,453,460,462,461]},
 {y:499,bottom:702,cuts:[0,377,713,1060,1480,1774],feet:[665,663,668,669,693]},
 {y:703,bottom:887,cuts:[0,553,1131,1774],feet:[841,844,844]},
];
const dashFrames=dashRows.flatMap(row=>row.cuts.slice(0,-1).map((x,i)=>({rect:[x,row.y,row.cuts[i+1]-x,row.bottom-row.y],foot:row.feet[i],scale:.82})));
const mushroomFrames=[
 ...range(5).map(i=>({rect:[[0,286,555,826,1105][i],40,[286,269,271,279,310][i],255],foot:276,scale:.65})),
 ...range(6).map(i=>({rect:[i*296,639,i===5?294:296,240],foot:842,scale:.65})),
];
const projectileFrames=[
 {rect:[1380,92,190,205]},{rect:[1566,83,208,212]},
 ...range(7).map(i=>({rect:[i*253,322,i===6?256:253,170]})),
 ...range(5).map(i=>({rect:[i*355,493,i===4?354:355,143]})),
];
export function preloadBuba(scene){
 for(const kind of ['village','battle','dash','mushroom'])scene.load.binary('buba-source-'+kind,'assets/buba/'+kind+'.png');
}
async function pack(scene,kind,source,frames,reference,width=1024){
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const columns=width===1024?2:4;
 const texture=scene.textures.createCanvas('buba-'+kind+'-drawn',width*columns,256*Math.ceil(frames.length/columns));
 const out=texture.getContext(),sx=source.width/reference[0],sy=source.height/reference[1];
 frames.forEach((frame,i)=>{
  const [rx,ry,rw,rh]=frame.rect,x0=Math.round(rx*sx),y0=Math.round(ry*sy),x1=Math.min(source.width,Math.round((rx+rw)*sx)),y1=Math.min(source.height,Math.round((ry+rh)*sy));
  let left=x1,right=x0,top=y1,bottom=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*source.width+x)*4+3]>60){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(left>right)throw new Error('Empty Buba '+kind+' frame '+i);
  const w=right-left+1,h=bottom-top+1;
  // Normalize visible artwork, not the transparent cell. Combat measurements
  // exclude sword trails and thrown mushrooms so effects cannot resize Buba.
  const bodyHeight=kind==='battle'?[570,525][i]:kind==='dash'?[155,145,135,140,140,135,138,137,135,133,133,132,134,135,96,122,122,122][i]:kind==='throw'?205:null;
  const scale=bodyHeight?160/(bodyHeight*sy):kind==='village'?180/h:Math.min((width-16)/w,224/h);
  const dx=i%columns*width,dy=Math.floor(i/columns)*256,foot=frame.foot?frame.foot*sy:bottom;
  out.save();out.translate(dx+width/2,dy+(kind==='projectile'?128:236));if(frame.flip)out.scale(-1,1);
  out.drawImage(source,left,top,w,h,-w*scale/2,kind==='projectile'?-h*scale/2:(top-foot)*scale,w*scale,h*scale);out.restore();
  texture.add(i,0,dx,dy,width,256);
 });
 texture.refresh();canvas.width=1;canvas.height=1;
}
export async function registerBuba(scene){
 const sources={};
 for(const kind of ['village','battle','dash','mushroom'])sources[kind]=await createImageBitmap(new Blob([scene.cache.binary.get('buba-source-'+kind)],{type:'image/png'}));
 try{
  await pack(scene,'village',sources.village,villageFrames,[887,1774],384);
  await pack(scene,'battle',sources.battle,[{rect:[0,0,1070,793],foot:680,scale:.29},{rect:[1070,0,913,793],foot:700,scale:.29,flip:true}],[1983,793]);
  await pack(scene,'dash',sources.dash,dashFrames,[1774,887]);
  await pack(scene,'throw',sources.mushroom,mushroomFrames,[1774,887]);
  await pack(scene,'projectile',sources.mushroom,projectileFrames,[1774,887],256);
 }finally{Object.entries(sources).forEach(([kind,source])=>{source.close();scene.cache.binary.remove('buba-source-'+kind);});}
 const anim=(name,kind,frames,frameRate,repeat=0)=>scene.anims.create({key:'buba-drawn-'+name,frames:frames.map(frame=>({key:'buba-'+kind+'-drawn',frame})),frameRate,repeat});
 ['down','left','up','right'].forEach((dir,i)=>{
  anim('idle-'+dir,'village',range(4).map(n=>i*8+n),5,-1);
  anim('walk-'+dir,'village',range(4).map(n=>i*8+4+n),9,-1);
 });
 anim('idle','battle',[0],1,-1);anim('hit','battle',[1,1,1],9);
 // The first five poses are isolated strides; later source poses include long
 // overlapping trails. Use the clean strides for the repeated crossing rush.
 anim('dash','dash',[0,1,2,3,4],14,-1);
 anim('finish','dash',[15,16,17],12);
 anim('throw','throw',[0,1,2,3,4],12);
 anim('recover','throw',[5,6,7,8,9,10],10);
 anim('projectile','projectile',range(14),20,-1);
}
export function overworldBuba(scene,x,y,height=76){
 // Kotaro's visible height is approximately 224/256 of the requested size.
 const sprite=scene.add.sprite(x,y,'buba-village-drawn',0).setOrigin(.5,236/256).setScale(height*(224/256)/180/2);
 sprite.walk=(direction,moving=true)=>sprite.play('buba-drawn-'+(moving?'walk-':'idle-')+direction,true);
 sprite.walk('down',false);return sprite;
}
export function bubaFighter(scene,x,y,scale,facing){
 const root=scene.add.container(x,y).setScale(scale);
 const shadow=scene.add.ellipse(0,76,60,11,0x16251e,.25);
 const sprite=scene.add.sprite(0,76,'buba-battle-drawn',0).setOrigin(.5,236/256).setScale(1/2);
 root.add([shadow,sprite]);root.sprite=sprite;root.kind='buba';
 root.setFacing=direction=>{root.facing=direction;sprite.setFlipX(direction==='left');};root.setFacing(facing);
 root.partPosition=part=>{const [px,py]=({horn:[28,-65],mouth:[48,-15],back:[-42,-27],tail:[-85,26]})[part];return root.getWorldTransformMatrix().transformPoint((root.facing==='left'?-px:px)/2,76+(py-76)/2);};
 root.playAction=(action='idle',part)=>{
  const pose=action==='hit'?'hit':action==='mushroom'||(action==='attack'&&part==='back')?'throw':action==='recover'?'recover':action==='ultimate'?'finish':['run','dash','attack'].includes(action)?'dash':'idle';
  sprite.removeAllListeners('animationcomplete');sprite.play('buba-drawn-'+pose,true);
  if(['hit','recover','finish'].includes(pose))sprite.once('animationcomplete',()=>{if(sprite.active)root.playAction('idle');});
  // Hold the empty-back throwing pose until the actual projectile returns.
  if(pose==='throw')sprite.once('animationcomplete',()=>{if(sprite.active)sprite.setFrame(4);});
 };
 root.playAction();return root;
}
export class BubaProjectiles{
 constructor(scene){this.scene=scene;this.sprites=new Map();}
 update(shots){
  const mushrooms=shots.filter(shot=>shot.kind==='mushroom');
  for(const [shot,sprite] of this.sprites)if(!mushrooms.includes(shot)){sprite.destroy();this.sprites.delete(shot);}
  for(const shot of mushrooms){
   let sprite=this.sprites.get(shot);
   if(!sprite){sprite=this.scene.add.sprite(shot.x,shot.y,'buba-projectile-drawn',0).setDepth(13).setDisplaySize(102,102);this.sprites.set(shot,sprite);}
   sprite.setPosition(shot.x,shot.y).setFlipX(shot.vx<0).setFrame(Math.floor(shot.age/65)%14);
  }
 }
 clear(){for(const sprite of this.sprites.values())sprite.destroy();this.sprites.clear();}
}
