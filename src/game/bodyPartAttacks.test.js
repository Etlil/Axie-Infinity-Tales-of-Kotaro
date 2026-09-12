import { bodyPartAttack } from './bodyPartAttacks';
import { paintBurst } from './world';
jest.mock('./world',()=>({paintBurst:jest.fn(),slash:jest.fn()}));

function effect() {
  const object={};
  ['setDepth','setData','setScale','setPosition','setRotation','setStrokeStyle','fillStyle','fillTriangle',
    'lineStyle','lineBetween','beginPath','arc','strokePath','fillEllipse','strokeEllipse','fillCircle','destroy']
    .forEach(method=>{object[method]=jest.fn(()=>object);});
  return object;
}
function setup() {
  const missile=effect(),trail=effect(),halo=effect();
  const scene={add:{circle:jest.fn(()=>halo),graphics:jest.fn().mockReturnValueOnce(missile).mockReturnValueOnce(trail)},tweens:{add:jest.fn()}};
  const actor={kind:'kotaro',partPosition:jest.fn(()=>({x:420,y:318}))};
  return {scene,actor,missile,trail};
}

test('a projectile starts at the moving body attachment and reaches the enemy before cleanup',()=>{
  const {scene,actor,missile,trail}=setup();
  bodyPartAttack(scene,actor,{part:'horn'},{x:850,y:420});
  expect(actor.partPosition).toHaveBeenCalledWith('horn');
  expect(scene.add.graphics).toHaveBeenNthCalledWith(1,{x:420,y:318});
  const flight=scene.tweens.add.mock.calls.find(([tween])=>'progress' in tween)[0];
  flight.targets.progress=1;flight.onUpdate();
  expect(missile.setPosition).toHaveBeenLastCalledWith(850,420);
  flight.onComplete();expect(missile.destroy).toHaveBeenCalledTimes(1);
  const fade=scene.tweens.add.mock.calls.find(([tween])=>tween.targets===trail)[0];
  fade.onComplete();expect(trail.destroy).toHaveBeenCalledTimes(1);
});

test('Buba flicks paint from his tail on a curling path, with a larger ultimate splash',()=>{
  const {scene,actor,missile}=setup();actor.kind='buba';paintBurst.mockClear();
  bodyPartAttack(scene,actor,{part:'tail',kind:'ultimate'},{x:850,y:420});
  expect(actor.partPosition).toHaveBeenCalledWith('tail');
  const flight=scene.tweens.add.mock.calls.find(([tween])=>'progress' in tween)[0];
  flight.targets.progress=.1;flight.onUpdate();
  const [x,y]=missile.setPosition.mock.calls[0];
  expect(x).toBeLessThan(420);expect(y).toBeLessThan(318);
  expect(paintBurst).not.toHaveBeenCalled();
  flight.onComplete();expect(paintBurst).toHaveBeenCalledTimes(3);
  expect(paintBurst).toHaveBeenCalledWith(scene,850,420);
});
