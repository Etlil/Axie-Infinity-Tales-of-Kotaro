export const TOWN_TILE=48;
export const TOWN_SIZE={width:48,height:32};
export const TOWN_START={x:22,y:29};
export const FOUNTAIN_CHECKPOINT={x:23,y:16};
export const BUBA_MEETING={x:25,y:15};
export const townPixel=p=>({x:(p.x+.5)*TOWN_TILE,y:(p.y+.5)*TOWN_TILE});
export const BUILDINGS=[
 {id:'tent',x:8,y:5,w:7,h:7,name:'BUBA’S TENT'},
 {id:'gate',x:34,y:2,w:7,h:5,name:'VILLAGE GATE'},
 {id:'well',x:21,y:13,w:3,h:3,name:'SAVE FOUNTAIN'},
 {id:'spring',x:30,y:17,w:8,h:6,name:'HEALING SPRING'},
 {id:'ruins-north',x:20,y:2,w:7,h:5,name:'EMPTY HOMES'},
 {id:'ruins-west',x:8,y:18,w:6,h:5,name:'ABANDONED SHOP'},
];
export const TOWN_PLACES=[
 {id:'gate',x:37,y:7,name:'Village gate',action:'Choose a dungeon'},
 {id:'tent',x:11,y:12,name:'Buba’s tent',action:'Talk to Buba / rank rewards'},
 {id:'spring',x:34,y:16,name:'Puffy’s spring',action:'Visit the healer'},
 {id:'well',...FOUNTAIN_CHECKPOINT,name:'Save fountain',action:'Save your adventure'},
];
// Walkable polygons follow the painted roads and square. All coordinates are
// in tiles of the original 3072×2048 artwork (64 source pixels per tile).
const ROADS=[{x:20,y:16,w:5,h:16},{x:18,y:10,w:10,h:7},{x:9,y:12,w:39,h:3},
 {x:10,y:11,w:3,h:3},{x:36,y:0,w:4,h:15},{x:33,y:14,w:3,h:4}];
export function townWalkable(x,y){
 if(x<1||x>=47||y<1||y>=31)return false;
 if(!ROADS.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h))return false;
 // Gate's centre is a passage; its stone columns remain outside the road.
 return !BUILDINGS.filter(b=>b.id!=='gate').some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
}
export function nearbyPlace(pos){return pos&&TOWN_PLACES.find(p=>Math.abs(p.x-pos.x)+Math.abs(p.y-pos.y)<=1);}
export function townPath(from,to){
 if(!townWalkable(to.x,to.y))return [];
 const queue=[{...from,path:[]}],seen=new Set([from.x+','+from.y]);
 for(let i=0;i<queue.length;i++){
  const n=queue[i];if(n.x===to.x&&n.y===to.y)return n.path;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const p={x:n.x+dx,y:n.y+dy},key=p.x+','+p.y;
   if(!seen.has(key)&&townWalkable(p.x,p.y)){seen.add(key);queue.push({...p,path:[...n.path,p]});}
  }
 }
 return [];
}
