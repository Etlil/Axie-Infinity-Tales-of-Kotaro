// Tile maps traced from the user's three Aqua Cave sketches. E=start, K=keys,
// L=locks, X=stairs; the two locks on floor three require both branch keys.
export const TILE=48;
const colors={floor:0x345b6a,alternate:0x3c6574,wall:0x132631,brick:0x223e4b,accent:0x85e2ed};
export const AQUA_FLOORS=[
 {rooms:[{x:5,y:8,w:10,h:10},{x:17,y:11,w:6,h:4},{x:25,y:8,w:10,h:10},{x:4,y:20,w:10,h:6},{x:27,y:20,w:10,h:6},{x:27,y:1,w:10,h:5}],
  corridors:[{x:15,y:13,w:10,h:1},{x:20,y:15,w:1,h:3},{x:8,y:18,w:1,h:2},{x:32,y:18,w:1,h:2},{x:31,y:6,w:1,h:2}],
  start:{x:20,y:17},keys:[{x:8,y:23}],locks:[{x:31,y:6}],exit:{x:32,y:2},spawns:[{x:10,y:12},{x:31,y:23}],encounters:[0,1],
  names:['WEST GROTTO','CAVE MOUTH','EAST GROTTO','KEY ALCOVE','STILL POOL','LOWER STAIRS']},
 {rooms:[{x:20,y:13,w:8,h:10},{x:10,y:13,w:7,h:11},{x:33,y:13,w:8,h:11},{x:13,y:3,w:7,h:7},{x:33,y:3,w:8,h:7},{x:1,y:3,w:9,h:7}],
  corridors:[{x:24,y:23,w:1,h:3},{x:17,y:18,w:16,h:1},{x:15,y:10,w:1,h:3},{x:36,y:10,w:1,h:3},{x:10,y:6,w:3,h:1}],
  start:{x:24,y:25},keys:[{x:36,y:6}],locks:[{x:11,y:6}],exit:{x:2,y:6},spawns:[{x:36,y:19},{x:13,y:20}],encounters:[0,1],
  names:['PILLAR HALL','WEST PASSAGE','EAST PASSAGE','LOCK CHAMBER','KEY POOL','LOWER STAIRS']},
 {rooms:[{x:14,y:1,w:12,h:12},{x:4,y:17,w:8,h:6},{x:34,y:17,w:8,h:6},{x:6,y:12,w:4,h:3},{x:36,y:12,w:4,h:3},{x:6,y:25,w:4,h:3},{x:36,y:25,w:4,h:3},{x:23,y:17,w:4,h:5},{x:23,y:23,w:3,h:5}],
  corridors:[{x:20,y:13,w:1,h:11},{x:12,y:20,w:22,h:1},{x:8,y:15,w:1,h:2},{x:38,y:15,w:1,h:2},{x:8,y:23,w:1,h:2},{x:38,y:23,w:1,h:2},{x:20,y:23,w:7,h:1},{x:26,y:25,w:3,h:1}],
  start:{x:28,y:25},keys:[{x:8,y:26},{x:38,y:13}],locks:[{x:20,y:14},{x:20,y:13}],spawns:[{x:8,y:19},{x:38,y:20},{x:20,y:5}],encounters:[0,1,2],
  names:['PUFFY’S CHAMBER','WEST GROTTO','EAST GROTTO','QUIET ALCOVE','EAST KEY','WEST KEY','EMPTY POOL','CROSSROADS','ENTRANCE']},
].map((floor,i)=>({...floor,id:0,floor:i,name:'Aqua Cave',theme:'sanctuary',colors,puzzle:{type:'keys'},puzzleName:i===2?'Two keys, two locks':'Find the cave key',clue:i===2?'Find both branch keys. Walk into each lock to open Puffy’s chamber.':'Find the gold key, walk into the lock, then reach the blue stairs.'}));
export const DUNGEONS=[{...AQUA_FLOORS[0],description:'One cave, three floors. Follow the branching tunnels, collect keys, and rescue Puffy in the deepest chamber.',puzzleName:'Keys and locked passages'}];
export const dungeonFor=run=>AQUA_FLOORS[run?.floor??0]||AQUA_FLOORS[0];
export function freshPuzzle(){return {solved:false,collected:[],unlocked:[]};}
export function createDungeonRun(level=0,floor=0){return {level:0,floor,...AQUA_FLOORS[floor].start,defeated:0,puzzle:freshPuzzle()};}
const inside=(p,r)=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;
export const sameTile=(a,b)=>a?.x===b?.x&&a?.y===b?.y;
export function isFloor(x,y,d){return [...d.rooms,...d.corridors].some(r=>inside({x,y},r));}
export function gateOpen(run){return run.puzzle.unlocked.length===dungeonFor(run).locks.length;}
export function walkable(x,y,run){
 const d=dungeonFor(run),lock=d.locks.findIndex(p=>sameTile(p,{x,y}));
 return isFloor(x,y,d)&&(lock<0||run.puzzle.unlocked.includes(lock));
}
export function moveExplorer(run,dx,dy){
 const p={x:run.x+dx,y:run.y+dy},d=dungeonFor(run);let puzzle=run.puzzle;
 if(!isFloor(p.x,p.y,d))return run;
 const lock=d.locks.findIndex(t=>sameTile(t,p));
 if(lock>=0&&!puzzle.unlocked.includes(lock)){
  if(puzzle.collected.length<=puzzle.unlocked.length)return run;
  const unlocked=[...puzzle.unlocked,lock];puzzle={...puzzle,unlocked,solved:unlocked.length===d.locks.length};
 }
 const key=d.keys.findIndex(t=>sameTile(t,p));
 if(key>=0&&!puzzle.collected.includes(key))puzzle={...puzzle,collected:[...puzzle.collected,key]};
 return {...run,...p,puzzle};
}
export function nextStep(from,to,run){
 const queue=[{...from,first:null}],seen=new Set([from.x+','+from.y]);
 for(let i=0;i<queue.length;i++){
  const node=queue[i];if(sameTile(node,to))return node.first||from;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const p={x:node.x+dx,y:node.y+dy},key=p.x+','+p.y;
   if(!seen.has(key)&&walkable(p.x,p.y,run)){seen.add(key);queue.push({...p,first:node.first||p});}
  }
 }
 return from;
}
