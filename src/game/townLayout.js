export const TOWN_START={x:14,y:15};
export const TOWN_SIZE={width:32,height:24};
export const BUILDINGS=[
  {id:'tent',x:4,y:5,w:5,h:4,name:'BUBA’S TENT'},
  {id:'gate',x:24,y:2,w:5,h:3,name:'VILLAGE GATE'},
  {id:'spring',x:21,y:14,w:5,h:4,name:'HEALING SPRING'},
  {id:'well',x:13,y:9,w:3,h:3,name:'SAVE FOUNTAIN'},
  {id:'ruins-north',x:12,y:3,w:5,h:3,name:'EMPTY HOMES'},
  {id:'ruins-west',x:3,y:15,w:5,h:4,name:'ABANDONED SHOP'},
];
export const TOWN_PLACES=[
  {id:'gate',x:26,y:5,name:'Village gate',action:'Choose a dungeon'},
  {id:'tent',x:6,y:9,name:'Buba’s tent',action:'Claim rank rewards'},
  {id:'spring',x:23,y:18,name:'Puffy’s spring',action:'Visit the healer'},
  {id:'well',x:14,y:12,name:'Save fountain',action:'Save your adventure'},
];
export function townWalkable(x,y){
  return x>=1&&x<TOWN_SIZE.width-1&&y>=1&&y<TOWN_SIZE.height-1&&
    !BUILDINGS.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
}
export function nearbyPlace(pos){return pos&&TOWN_PLACES.find(t=>Math.abs(t.x-pos.x)+Math.abs(t.y-pos.y)<=1);}
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
