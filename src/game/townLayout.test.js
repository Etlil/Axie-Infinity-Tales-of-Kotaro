import {TOWN_START,TOWN_PLACES,BUILDINGS,FOUNTAIN_CHECKPOINT,BUBA_MEETING,townWalkable,townPath,nearbyPlace} from './townLayout';
test('town streets are walkable while buildings and boundary blocks stop movement',()=>{
  expect(townWalkable(TOWN_START.x,TOWN_START.y)).toBe(true);
  expect(townWalkable(0,12)).toBe(false);expect(townWalkable(48,12)).toBe(false);
  BUILDINGS.forEach(b=>expect(townWalkable(b.x,b.y)).toBe(false));
  expect(townWalkable(22,14)).toBe(false);
  expect(townWalkable(FOUNTAIN_CHECKPOINT.x,FOUNTAIN_CHECKPOINT.y)).toBe(true);
  expect(townWalkable(5,10)).toBe(false);
  expect(townWalkable(34,19)).toBe(false);
  expect(townWalkable(37,4)).toBe(true);
});
test.each(TOWN_PLACES)('walking to $name follows streets and ends within interaction distance',target=>{
  const path=townPath(TOWN_START,target);let prev=TOWN_START;
  expect(path.length).toBeGreaterThan(0);
  path.forEach(p=>{expect(townWalkable(p.x,p.y)).toBe(true);expect(Math.abs(p.x-prev.x)+Math.abs(p.y-prev.y)).toBe(1);prev=p;});
  expect(nearbyPlace(prev).id).toBe(target.id);
  expect(townPath(prev,TOWN_START).at(-1)).toEqual(TOWN_START);
});
test('remote buildings cannot be interacted with and blocked destinations have no route',()=>{
  expect(nearbyPlace(TOWN_START)).toBeUndefined();expect(townPath(TOWN_START,{x:22,y:14})).toEqual([]);
});
test('the intro meeting and saved return point both connect to the town roads',()=>{
  expect(townPath(TOWN_START,BUBA_MEETING).at(-1)).toEqual(BUBA_MEETING);
  expect(nearbyPlace(FOUNTAIN_CHECKPOINT).id).toBe('well');
  TOWN_PLACES.forEach(target=>{
    if(target.id!=='well')expect(townPath(FOUNTAIN_CHECKPOINT,target).at(-1)).toEqual({x:target.x,y:target.y});
  });
});
