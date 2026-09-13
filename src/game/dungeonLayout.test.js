import {walkable,nextStep,START,SPAWNS} from './dungeonLayout';
test('rooms connect through narrow corridors and walls stop movement',()=>{
  expect(walkable(START.x,START.y,0)).toBe(true);
  expect(walkable(12,9,0)).toBe(true);expect(walkable(12,8,0)).toBe(false);
  expect(walkable(27,10,1)).toBe(true);expect(walkable(27,11,1)).toBe(false);
  expect(walkable(-1,8,2)).toBe(false);
});
test('the final chamber opens only after both slimes, regardless of older stage clears',()=>{
  expect(walkable(30,10,0)).toBe(false);expect(walkable(30,10,1)).toBe(false);expect(walkable(30,10,2)).toBe(true);
});
test('slime pathfinding stays on walkable tiles and can reach the player through corridors',()=>{
  let pos=SPAWNS[1];
  for(let i=0;i<80&&(pos.x!==START.x||pos.y!==START.y);i++){
    const next=nextStep(pos,START,1);
    expect(Math.abs(next.x-pos.x)+Math.abs(next.y-pos.y)).toBe(1);
    expect(walkable(next.x,next.y,1)).toBe(true);pos=next;
  }
  expect(pos).toEqual(START);
});
