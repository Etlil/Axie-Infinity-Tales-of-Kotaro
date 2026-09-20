import Phaser from 'phaser';
import { renderWorld as legacyWorld, drawAxie } from './art';
import {bubaFighter} from './bubaSprites';

export function backdrop(scene, kind = 'village', { image = true } = {}) {
  if (!image) {
    // The responsive HTML layer supplies an uninterrupted full-screen arena.
    // Keep only fighters and effects on the independently framed canvas.
  } else if (kind === 'map') {
    scene.add.rectangle(600,400,1200,800,0x283f32);
    legacyWorld(scene,'map');
    scene.add.rectangle(600,400,1200,800,0x10271e,.22);
  } else {
    const key = kind === 'lagoon' ? 'lagoon-arena' : kind === 'battle' ? 'forest-arena' : 'atia-village';
    scene.add.image(600,400,key).setDisplaySize(1200,800);
    if (kind === 'intro') scene.add.rectangle(600,400,1200,800,0x101d28,.44);
  }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) for(let i=0;i<17;i++){
    const mote=scene.add.circle((i*137+41)%1200,(i*71+199)%740,1+(i%3),0xffedb2,.45);
    scene.tweens.add({targets:mote,y:mote.y-70,x:mote.x+25,alpha:.08,duration:3500+i*97,yoyo:true,repeat:-1});
  }
}
export function fighter(scene,x,y,kind='kotaro',scale=1,facing='right') {
  if(kind==='buba')return bubaFighter(scene,x,y,scale,facing);
  if(kind==='slime'){
    const root=scene.add.container(x,y).setScale(scale*1.65),body=scene.add.graphics();
    body.fillStyle(0x15332b,.3).fillEllipse(0,37,94,18);
    body.fillStyle(0x7fc58f).fillEllipse(0,0,92,66);
    body.lineStyle(3,0x335e49).strokeEllipse(0,0,92,66);
    body.fillStyle(0xb9eaa9,.7).fillEllipse(-17,-15,22,10);
    body.fillStyle(0x173c38).fillCircle(-15,-1,5).fillCircle(15,-1,5);
    root.add(body);root.kind=kind;
    root.playAction=action=>{if(action!=='idle')scene.tweens.add({targets:body,scaleY:.72,duration:150,yoyo:true});};
    return root;
  }
  if (kind === 'puffy') return puffyFighter(scene,x,y,scale,facing);
  if(kind==='kotaro'&&scene.textures.exists('kotaro-idle-drawn')){
    const root=scene.add.container(x,y).setScale(scale),shadow=scene.add.ellipse(0,76,95,18,0x16251e,.25);
    const sprite=scene.add.sprite(0,78,'kotaro-idle-drawn',0).setOrigin(.5,1).setDisplaySize(179,179);
    root.add([shadow,sprite]);root.sprite=sprite;root.kind=kind;
    root.setFacing=direction=>{root.facing=direction;sprite.setFlipX(direction==='left');};root.setFacing(facing);
    root.partPosition=part=>{const [px,py]=({horn:[34,-82],mouth:[34,-52],back:[-24,-9],tail:[-50,46]})[part];return root.getWorldTransformMatrix().transformPoint(root.facing==='left'?-px:px,py);};
    root.playAction=(action='idle')=>{
      sprite.play(action==='run'?'kotaro-drawn-run':'kotaro-drawn-idle',true);
      if(['attack','ultimate'].includes(action))scene.tweens.add({targets:sprite,angle:root.facing==='left'?-12:12,duration:140,yoyo:true});
      if(action==='hit')scene.tweens.add({targets:sprite,alpha:.35,duration:90,yoyo:true});
    };
    root.playAction();return root;
  }
  if (kind!=='kotaro') {
    const mob = drawAxie(scene,x,y,{kind:'mob',scale:scale*1.65,idle:false});
    mob.setData('kind',kind);mob.playAction=()=>{};return mob;
  }
  const root=scene.add.container(x,y);
  const shadow=scene.add.ellipse(0,76,120,22,0x16251e,.25);
  const sprite=scene.add.sprite(0,0,kind+'-sheet',0).setFlipX(facing==='right');
  root.add([shadow,sprite]);
  const weapon=scene.add.graphics();
  weapon.fillStyle(0x6e442a).fillRoundedRect(-5,8,10,27,3);
  weapon.lineStyle(2,0x593d29).strokeRoundedRect(-5,8,10,27,3);
  weapon.fillStyle(0xf1c261).fillRoundedRect(-16,1,32,9,3);
  weapon.fillStyle(0xe8f0e9).fillTriangle(-7,1,7,1,0,-65);
  weapon.lineStyle(2,0x557380).lineBetween(0,-61,0,-1);
  weapon.setPosition(57,-35).setAngle(35);
  root.add(weapon);
  weapon.setVisible(false);
  root.setScale(scale);root.sprite=sprite;root.weapon=weapon;root.kind=kind;
  // Local attachment points follow the fighter's position, scale, and rotation.
  const points = { horn: [22,-76], mouth: [48,19], back: [-43,-32], tail: [-72,35] };
  root.partPosition = part => {
    const [px,py] = points[part];
    return root.getWorldTransformMatrix().transformPoint(facing === 'right' ? px : -px, py);
  };
  root.playAction=(action='idle',part)=>{
    // Horn, mouth, and tail attacks use their own body motion instead of drawing a sword.
    const bodyMotion = (action==='attack'||action==='ultimate') && part && part!=='back';
    const key=kind+'-'+(bodyMotion ? 'idle' : action);
    if(!scene.anims.exists(key))return;
    sprite.removeAllListeners('animationcomplete');
    sprite.play(key,true);
    if(action!=='idle'&&action!=='run')sprite.once('animationcomplete',()=>{if(sprite.active)sprite.play(kind+'-idle');});
    if((action==='attack'||action==='ultimate') && !bodyMotion){
      root.bringToTop(weapon);
      weapon.setVisible(true);scene.tweens.add({targets:weapon,angle:facing==='right'?110:-110,duration:190,yoyo:true,onComplete:()=>{if(kind==='kotaro')weapon.setVisible(false);}});
    }
  };
  root.playAction('idle');
  return root;
}

function puffyFighter(scene,x,y,scale,facing) {
  const root=scene.add.container(x,y).setScale(scale);
  const shadow=scene.add.ellipse(0,68,120,22,0x16251e,.25);
  const aura=scene.add.ellipse(0,12,173,151,0x764ca8,.22).setStrokeStyle(3,0xae7fe2,.45).setVisible(false);
  const sprite=scene.add.sprite(0,0,'puffy-sheet',0).setFlipX(facing==='right');
  root.add([shadow,aura,sprite]);root.sprite=sprite;root.kind='puffy';
  root.setCorrupted=corrupted=>{
    aura.setVisible(corrupted);
    if(corrupted)sprite.setTint(0xa5b7ed);else sprite.clearTint();
    return root;
  };
  root.playAction=(action='idle')=>{
    const key='puffy-'+action;
    if(!scene.anims.exists(key))return;
    sprite.removeAllListeners('animationcomplete');sprite.play(key,true);
    if(action!=='idle'&&action!=='run')sprite.once('animationcomplete',()=>{if(sprite.active)sprite.play('puffy-idle');});
  };
  root.playAction('idle');
  return root;
}
export function slash(scene,x,y,color=0xc5eaf5,ultimate=false) {
  for(let i=0;i<(ultimate?5:2);i++){
    const g=scene.add.graphics({x:x+(i-1)*20,y:y-30}).setDepth(30);
    g.lineStyle(ultimate?9:6,color,.9).beginPath().arc(0,0,60+i*11,-1.5,1.4).strokePath();
    g.lineStyle(2,0xffffff,.9).beginPath().arc(0,0,55+i*11,-1.5,1.4).strokePath();
    g.setRotation(-.7+i*.55);
    scene.tweens.add({targets:g,alpha:0,scaleX:1.5,scaleY:1.5,duration:360+i*50,onComplete:()=>g.destroy()});
  }
}
export function paintBurst(scene,x,y) {
  const colors=[0xf5bd54,0x6bd8c0,0xdc72a5,0x97c76c,0xa29cec];
  for(let i=0;i<24;i++){
    const a=i*Math.PI*2/24,dist=70+(i%5)*17;
    const drop=scene.add.ellipse(x,y,8+i%4*3,14+i%3*5,colors[i%5],.95).setDepth(32).setAngle(i*21);
    scene.tweens.add({targets:drop,x:x+Math.cos(a)*dist,y:y+Math.sin(a)*dist,alpha:0,scale:1.5,duration:650+i*9,onComplete:()=>drop.destroy()});
  }
}
export function shelterUpgrade(scene,stage) {
  if(stage<1)return;
  const g=scene.add.graphics();
  if(stage>=2){
    g.fillStyle(0x263829,.20).fillEllipse(164,348,237,75);
    g.fillStyle(0xc49658).fillRoundedRect(67,227,162,122,9);
    g.fillStyle(0xe3bf83).fillRect(90,241,112,100);
    g.fillStyle(0x684331).fillRoundedRect(125,271,42,70,12);
    g.fillStyle(0x83513b).fillTriangle(43,255,149,146,248,255);
    g.fillStyle(0xb87849).fillTriangle(58,247,149,169,231,247);
    g.lineStyle(4,0xd9a362).lineBetween(58,247,149,169).lineBetween(149,169,231,247);
    g.fillStyle(0xecca6f).fillRect(93,269,21,25).fillRect(182,269,21,25);
  } else {
    g.lineStyle(8,0xd7b16c).lineBetween(42,330,65,223).lineBetween(65,223,163,272);
    g.fillStyle(0xa6b78c).fillTriangle(45,327,65,223,169,276);
    g.fillStyle(0xe4d3a1).fillTriangle(59,318,65,244,137,279);
  }
  const flags=scene.add.graphics().lineStyle(2,0x5d4531).lineBetween(73,196,291,289);
  for(let i=0;i<6;i++)flags.fillStyle([0xb04e3d,0xdcb25d,0x748e59][i%3]).fillTriangle(77+i*35,198+i*15,98+i*35,207+i*15,82+i*35,227+i*15);
  scene.add.circle(242,351,8,0xffd885,.85);
}
export function routePath(scene,nodes) {
  const curve=new Phaser.Curves.Spline(nodes.map(n=>new Phaser.Math.Vector2(n.x,n.y)));
  const points=curve.getPoints(100);
  const g=scene.add.graphics();
  g.lineStyle(22,0x173929,.45).strokePoints(points);
  g.lineStyle(14,0xe8d8a6,.85).strokePoints(points);
  points.forEach((p,i)=>{if(i%4===0)g.fillStyle(0xfff4cd).fillCircle(p.x,p.y,3);});
}
