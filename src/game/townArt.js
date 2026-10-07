import {addTerrain} from './terrainTexture';
import {TOWN_SIZE,TOWN_TILE,ROADS,BUILDINGS} from './townLayout';

// Both locations use this palette and the same independently replaceable props.
export const SCENERY={grass:0xb2c355,grassLight:0xc8d97d,road:0xf4d891,edge:0xd9c581,shadow:0x516339};
export const PROP_NAMES=['tree','pine','bush','stone','stump','fence','fence-side','grass','ruins','well','tent','gate','pond'];
const ground=addTerrain;
function prop(scene,name,x,y,width,height=width,flip=false){
 const sprite=scene.add.image(x,y,'town-'+name).setOrigin(.5,1).setFlipX(flip).setDepth(['tree','pine'].includes(name)?1:0);
 sprite.setScale(Math.min(width/sprite.width,height/sprite.height));
 const w=sprite.displayWidth,h=sprite.displayHeight;
 // Shadows are their own layer and share one light direction (upper left).
 if(name!=='grass'){
  scene.add.ellipse(x+w*.1,y-h*.06,w*.8,h*.17,SCENERY.shadow,.09).setDepth(-8);
  scene.add.ellipse(x+w*.07,y-h*.06,w*.57,h*.1,SCENERY.shadow,.14).setDepth(-7);
 }
 return sprite;
}
export function addApproachArtwork(scene){
 const width=1200,height=1091,roads=[{x:443,y:-24,w:240,h:height+48}];
 ground(scene,width,height,roads);
 // The road width, grass, props, and light match the village's southern road.
 for(const [x,y,w,flip] of [[180,280,280,false],[960,220,290,true],[290,600,230,true],[1040,570,300,false],[160,940,310,false],[900,960,260,true],[390,1100,220,false]])prop(scene,'tree',x,y,w,w*1.2,flip);
 for(const [x,y] of [[340,340],[850,430],[310,780],[820,850]])prop(scene,'bush',x,y,135,150);
 for(const [x,y] of [[370,520],[775,240],[785,720],[340,1000]])prop(scene,'grass',x,y,100,105);
 for(const y of [325,660,990]){
  prop(scene,'fence-side',402,y,68,240);
  prop(scene,'fence-side',724,y,68,240,true);
 }
 prop(scene,'stump',345,425,80,78);
 prop(scene,'stump',825,770,85,82);
 prop(scene,'stone',345,690,96,88);
 prop(scene,'stone',840,325,85,78);
 prop(scene,'pine',1070,1010,220,300);
 scene.cameras.main.setBackgroundColor('#b2c355');
}
export function addTownArtwork(scene){
 const width=TOWN_SIZE.width*TOWN_TILE,height=TOWN_SIZE.height*TOWN_TILE+400;
 const roads=ROADS.map(r=>({x:r.x*TOWN_TILE,y:r.y*TOWN_TILE,w:r.w*TOWN_TILE,h:r.h*TOWN_TILE}));
 roads.push({x:20*TOWN_TILE,y:32*TOWN_TILE-18,w:5*TOWN_TILE,h:418});
 ground(scene,width,height,roads);
 const landmarks=BUILDINGS.map(b=>{
  const name=b.id.startsWith('ruins')?'ruins':b.id==='spring'?'pond':b.id;
  const sprite=prop(scene,name,(b.x+b.w/2)*TOWN_TILE,(b.y+b.h)*TOWN_TILE,b.w*TOWN_TILE,b.h*TOWN_TILE);
  return {...b,sprite};
 });
 // Place foliage in the non-walkable pockets, keeping the gate and NPC paths clear.
 const trees=[[3,5,7],[15,3,6],[30,3,7],[45,4,7],[4,14,6],[4,24,7],[15,27,6],[8,31,7],[32,30,7],[43,29,7],[46,16,5],[28,24,5],[17,20,4]];
 trees.forEach(([x,y,w],i)=>prop(scene,i%4===2?'pine':'tree',x*TOWN_TILE,y*TOWN_TILE,w*TOWN_TILE,w*TOWN_TILE*1.2,Boolean(i%2)));
 for(const [x,y] of [[17,9],[31,10],[44,11],[17,24],[29,29],[5,18],[39,26]])prop(scene,'bush',x*TOWN_TILE,y*TOWN_TILE,140,160);
 for(const [x,y] of [[17,7],[28,9],[31,14],[16,17],[28,19],[7,27],[40,23],[16,30]]){
  const px=x*TOWN_TILE,py=y*TOWN_TILE,clearance=12;
  // Keep the whole bottom-anchored grass sprite clear of road edges.
  if(roads.some(r=>px+105/2>r.x-clearance&&px-105/2<r.x+r.w+clearance&&py>r.y-clearance&&py-110<r.y+r.h+clearance))continue;
  prop(scene,'grass',px,py,105,110);
 }
 for(const [x,y] of [[16,25],[30,8],[41,21]])prop(scene,'stump',x*TOWN_TILE,y*TOWN_TILE,95,90);
 for(const [x,y] of [[6,16],[29,8],[42,16],[29,26],[16,28]])prop(scene,'stone',x*TOWN_TILE,y*TOWN_TILE,100,95);
 // Fence wings frame the southern village entrance without closing its road.
 prop(scene,'fence',852,1470,190,95);
 prop(scene,'fence',1308,1470,190,95);
 for(const y of [1700,1920]){
  prop(scene,'fence-side',920,y,65,210);
  prop(scene,'fence-side',1240,y,65,210,true);
 }
 // Additional approach foliage continues in world space instead of stretching a bitmap.
 for(const [x,y] of [[800,1770],[1460,1830],[600,1940],[1780,1760]])prop(scene,'tree',x,y,280,336);
 scene.cameras.main.setBackgroundColor('#b2c355');
 scene.cameras.main.setBounds(0,0,width,height);
 return landmarks;
}
