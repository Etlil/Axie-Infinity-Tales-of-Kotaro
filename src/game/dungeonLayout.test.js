import {DUNGEONS,createDungeonRun,walkable,nextStep,gateOpen,puzzleStep,moveExplorer,turnValve,freshPuzzle} from './dungeonLayout';

test.each(DUNGEONS)('$name has connected rooms, solid walls and a puzzle-locked final room',d=>{
  const run=createDungeonRun(d.id);
  expect(walkable(run.x,run.y,run)).toBe(true);
  expect(walkable(-1,8,run)).toBe(false);
  expect(walkable(d.gate.x,d.gate.y,run)).toBe(false);
  run.defeated=d.required;expect(gateOpen(run)).toBe(false);
  run.puzzle.solved=true;expect(gateOpen(run)).toBe(true);
  let pos={x:run.x,y:run.y},target=d.spawns.at(-1);
  for(let i=0;i<120&&(pos.x!==target.x||pos.y!==target.y);i++){
    const next=nextStep(pos,target,run);
    expect(Math.abs(next.x-pos.x)+Math.abs(next.y-pos.y)).toBe(1);
    expect(walkable(next.x,next.y,run)).toBe(true);pos=next;
  }
  expect(pos).toEqual(target);
});
test('slimes chase through corridors but cannot cross the sealed puzzle gate',()=>{
  const run=createDungeonRun(0),d=DUNGEONS[0];
  expect(nextStep(d.spawns[1],run,run)).toEqual(d.spawns[1]);
  let pos={x:19,y:9};
  for(let i=0;i<30&&(pos.x!==run.x||pos.y!==run.y);i++)pos=nextStep(pos,run,run);
  expect(pos).toEqual({x:run.x,y:run.y});
});
test('runes reset on a wrong stone and only solve in sun, leaf, moon order',()=>{
  const run=createDungeonRun(0),tiles=DUNGEONS[0].puzzle.tiles;
  run.puzzle=puzzleStep(run,tiles[0]);expect(run.puzzle.progress).toBe(1);
  run.puzzle=puzzleStep(run,tiles[2]);expect(run.puzzle.progress).toBe(0);
  tiles.forEach(t=>{run.puzzle=puzzleStep(run,t);});
  expect(run.puzzle.solved).toBe(true);expect(gateOpen(run)).toBe(false);
  run.defeated=1;expect(gateOpen(run)).toBe(true);
});
test('crate pushes from any side, stops against walls, and opens the seal only on its plate',()=>{
  let run={...createDungeonRun(1),x:8,y:20,defeated:1};
  run=moveExplorer(run,1,0);expect(run.puzzle.crate).toEqual({x:10,y:20});expect(gateOpen(run)).toBe(false);
  run=moveExplorer(moveExplorer(run,1,0),1,0);expect(run.puzzle.solved).toBe(true);expect(gateOpen(run)).toBe(true);
  const blocked={...createDungeonRun(1),x:6,y:17,puzzle:{...freshPuzzle(1),crate:{x:5,y:17}}};
  expect(moveExplorer(blocked,-1,0)).toBe(blocked);
  expect(freshPuzzle(1).crate).toEqual({x:9,y:20});
});
test('valves toggle paired lamps reversibly and latch the gate when all three are lit',()=>{
  const run=createDungeonRun(2);run.defeated=2;
  run.puzzle=turnValve(run,0);expect(run.puzzle.lamps).toBe(3);expect(gateOpen(run)).toBe(false);
  run.puzzle=turnValve(run,0);expect(run.puzzle.lamps).toBe(0);
  [0,1,2].forEach(i=>{run.puzzle=turnValve(run,i);});expect(run.puzzle.lamps).toBe(7);expect(gateOpen(run)).toBe(true);
  expect(turnValve(run,0)).toEqual(run.puzzle);
});
