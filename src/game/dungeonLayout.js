// Original shape-based maps. Art can be replaced without changing collision or puzzles.
export const TILE=48;
export const DUNGEONS=[
  {id:0,name:'Mosslight Grove',theme:'grove',description:'Follow the forest runes through an overgrown shrine.',puzzleName:'The waking stones',
    clue:'Walk over SUN → LEAF → MOON. A wrong stone resets the sequence.',
    rooms:[{x:2,y:3,w:9,h:11},{x:16,y:3,w:9,h:11},{x:30,y:6,w:9,h:9}],
    corridors:[{x:11,y:9,w:5,h:1},{x:25,y:10,w:5,h:1}],
    names:['ROOT HOLLOW','THE WAKING STONES','MOSSHEART SHRINE'],start:{x:4,y:8},gate:{x:30,y:10},
    spawns:[{x:8,y:8},{x:35,y:10}],encounters:[0,0],required:1,
    puzzle:{type:'runes',tiles:[{x:18,y:6,name:'SUN'},{x:21,y:6,name:'LEAF'},{x:21,y:11,name:'MOON'}]},
    colors:{floor:0x3c5a48,alternate:0x42624e,wall:0x152e28,brick:0x264239,accent:0x9ee29a}},
  {id:1,name:'Amber Quarry',theme:'quarry',description:'Descend a winding mine and restore its ancient counterweight.',puzzleName:'The counterweight',
    clue:'Push the amber block onto the gold plate. Walk around it to change direction. Reset if it gets stuck.',
    rooms:[{x:2,y:3,w:10,h:10},{x:5,y:17,w:10,h:9},{x:21,y:17,w:11,h:9}],
    corridors:[{x:8,y:13,w:1,h:4},{x:15,y:21,w:6,h:1}],
    names:['OLD MINE','COUNTERWEIGHT WORKS','AMBER VAULT'],start:{x:4,y:8},gate:{x:21,y:21},
    spawns:[{x:8,y:8},{x:27,y:21}],encounters:[1,1],required:1,
    puzzle:{type:'crate',crate:{x:9,y:20},plate:{x:12,y:20}},
    colors:{floor:0x715440,alternate:0x7e5f45,wall:0x302321,brick:0x49362d,accent:0xf3c66c}},
  {id:2,name:'Sunken Sanctuary',theme:'sanctuary',description:'Wake the tidal lights and free Puffy in the final chamber.',puzzleName:'The tidal engine',
    clue:'Light all three lamps. Valve I flips lamps 1+2; II flips 2+3; III flips only 2. Stand by a valve and use it.',
    rooms:[{x:2,y:3,w:9,h:11},{x:16,y:7,w:9,h:11},{x:30,y:2,w:13,h:13}],
    corridors:[{x:11,y:9,w:5,h:1},{x:25,y:10,w:5,h:1}],
    names:['FLOODED HALL','THE TIDAL ENGINE','PUFFY’S CHAMBER'],start:{x:4,y:8},gate:{x:30,y:10},
    spawns:[{x:8,y:8},{x:21,y:12},{x:38,y:8}],encounters:[0,1,2],required:2,
    puzzle:{type:'valves',tiles:[{x:18,y:9,name:'I',mask:3},{x:21,y:9,name:'II',mask:6},{x:21,y:15,name:'III',mask:2}]},
    colors:{floor:0x345566,alternate:0x3b6070,wall:0x152332,brick:0x22394f,accent:0x7de0ec}},
];
export const dungeonFor=run=>DUNGEONS[run?.level??0]||DUNGEONS[0];
export function freshPuzzle(level){
  const p=DUNGEONS[level].puzzle;
  return {solved:false,progress:0,lamps:0,...(p.crate?{crate:{...p.crate}}:{})};
}
export function createDungeonRun(level){return {level,...DUNGEONS[level].start,defeated:0,puzzle:freshPuzzle(level)};}
const inside=(p,r)=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;
export const sameTile=(a,b)=>a?.x===b?.x&&a?.y===b?.y;
export function isFloor(x,y,dungeon){return [...dungeon.rooms,...dungeon.corridors].some(r=>inside({x,y},r));}
export function gateOpen(run){return run.puzzle.solved&&run.defeated>=dungeonFor(run).required;}
export function walkable(x,y,run,{ignoreCrate=false}={}){
  const d=dungeonFor(run);
  return isFloor(x,y,d)&&!(sameTile({x,y},d.gate)&&!gateOpen(run))&&
    (ignoreCrate||!sameTile({x,y},run.puzzle.crate));
}
export function puzzleStep(run,position){
  const p=dungeonFor(run).puzzle;
  if(run.puzzle.solved||p.type!=='runes')return run.puzzle;
  const index=p.tiles.findIndex(t=>sameTile(t,position));
  if(index<0)return run.puzzle;
  const progress=index===run.puzzle.progress?index+1:index===0?1:0;
  return {...run.puzzle,progress,solved:progress===3};
}
export function turnValve(run,index){
  const tile=dungeonFor(run).puzzle.tiles?.[index];
  if(dungeonFor(run).puzzle.type!=='valves'||!tile||run.puzzle.solved)return run.puzzle;
  const lamps=run.puzzle.lamps^tile.mask;
  return {...run.puzzle,lamps,solved:lamps===7};
}
export function moveExplorer(run,dx,dy){
  const p={x:run.x+dx,y:run.y+dy};let puzzle=run.puzzle;
  if(sameTile(p,puzzle.crate)){
    const pushed={x:p.x+dx,y:p.y+dy};
    if(!walkable(pushed.x,pushed.y,run))return run;
    puzzle={...puzzle,crate:pushed,solved:puzzle.solved||sameTile(pushed,dungeonFor(run).puzzle.plate)};
  }
  const next={...run,puzzle};
  if(!walkable(p.x,p.y,next))return run;
  return {...next,...p,puzzle:puzzleStep(next,p)};
}
export function nextStep(from,to,run){
  const queue=[{...from,first:null}],seen=new Set([from.x+','+from.y]);
  for(let i=0;i<queue.length;i++){
    const node=queue[i];
    if(sameTile(node,to))return node.first||from;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const p={x:node.x+dx,y:node.y+dy},key=p.x+','+p.y;
      if(!seen.has(key)&&walkable(p.x,p.y,run)){seen.add(key);queue.push({...p,first:node.first||p});}
    }
  }
  return from;
}
