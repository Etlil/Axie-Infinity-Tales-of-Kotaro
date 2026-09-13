import {TOWN_START,TOWN_PLACES,BUILDINGS,townWalkable,townPath,nearbyPlace} from './townLayout';
test('town streets are walkable while buildings and boundary blocks stop movement',()=>{
  expect(townWalkable(TOWN_START.x,TOWN_START.y)).toBe(true);
  expect(townWalkable(0,12)).toBe(false);expect(townWalkable(32,12)).toBe(false);
  BUILDINGS.forEach(b=>expect(townWalkable(b.x,b.y)).toBe(false));
  expect(townWalkable(14,11)).toBe(false);expect(townWalkable(14,12)).toBe(true);
});
test.each(TOWN_PLACES)('walking to $name follows streets and ends within interaction distance',target=>{
  const path=townPath(TOWN_START,target);let prev=TOWN_START;
  expect(path.length).toBeGreaterThan(0);
  path.forEach(p=>{expect(townWalkable(p.x,p.y)).toBe(true);expect(Math.abs(p.x-prev.x)+Math.abs(p.y-prev.y)).toBe(1);prev=p;});
  expect(nearbyPlace(prev).id).toBe(target.id);
  expect(townPath(prev,TOWN_START).at(-1)).toEqual(TOWN_START);
});
test('remote buildings cannot be interacted with and blocked destinations have no route',()=>{
  expect(nearbyPlace(TOWN_START)).toBeUndefined();expect(townPath(TOWN_START,{x:14,y:10})).toEqual([]);
});
