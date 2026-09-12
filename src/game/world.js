import Phaser from 'phaser';
import { renderWorld as legacyWorld, drawAxie } from './art';

export function backdrop(scene, kind = 'village') {
  if (kind === 'map') {
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
  if (!['kotaro','buba'].includes(kind)) {
    const mob = drawAxie(scene,x,y,{kind:kind==='momo'?'momo':'mob',scale:scale*1.65,idle:false});
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
  weapon.setPosition(kind==='buba'?-48:57,-35).setAngle(kind==='buba'?-35:35);
  root.add(weapon);
  if(kind==='buba'){
    const shield=scene.add.graphics();
    shield.fillStyle(0x69482c).fillEllipse(48,10,57,67);
    shield.lineStyle(5,0xb58c51).strokeEllipse(48,10,57,67);
    shield.lineStyle(2,0x97693d).lineBetween(33,-10,33,31).lineBetween(47,-18,47,40).lineBetween(61,-9,61,31);
    shield.fillStyle(0xdac7a0).fillCircle(48,10,8);root.add(shield);root.shield=shield;
    root.moveBelow(weapon,sprite);root.moveBelow(shield,sprite);
  } else weapon.setVisible(false);
  root.setScale(scale);root.sprite=sprite;root.weapon=weapon;root.kind=kind;
  root.playAction=(action='idle')=>{
    const key=kind+'-'+action;
    if(!scene.anims.exists(key))return;
    sprite.removeAllListeners('animationcomplete');
    sprite.play(key,true);
    if(kind==='buba'&&action==='idle'){root.moveBelow(weapon,sprite);root.moveBelow(root.shield,sprite);}
    if(action!=='idle'&&action!=='run')sprite.once('animationcomplete',()=>{if(sprite.active)sprite.play(kind+'-idle');});
    if(action==='attack'||action==='ultimate'){
      root.bringToTop(weapon);
      weapon.setVisible(true);scene.tweens.add({targets:weapon,angle:facing==='right'?110:-110,duration:190,yoyo:true,onComplete:()=>{if(kind==='kotaro')weapon.setVisible(false);}});
    }
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
