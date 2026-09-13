// Replace the renderer independently of these walkable tiles and spawn points.
export const TILE=48;
export const ROOMS=[{x:2,y:3,w:9,h:11},{x:16,y:7,w:9,h:11},{x:30,y:2,w:13,h:13}];
export const SPAWNS=[{x:8,y:8},{x:21,y:12},{x:38,y:8}];
export const START={x:4,y:8};
export function walkable(x,y,defeated=2){
  if(x>=30&&defeated<2)return false;
  return ROOMS.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h)
    ||(y===9&&x>=11&&x<=15)||(y===10&&x>=25&&x<=29);
}
export function nextStep(from,to,defeated){
  const queue=[{...from,first:null}],seen=new Set([from.x+','+from.y]);
  for(let i=0;i<queue.length;i++){
    const node=queue[i];
    if(node.x===to.x&&node.y===to.y)return node.first||from;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const p={x:node.x+dx,y:node.y+dy},key=p.x+','+p.y;
      if(!seen.has(key)&&walkable(p.x,p.y,defeated)){seen.add(key);queue.push({...p,first:node.first||p});}
    }
  }
  return from;
}
