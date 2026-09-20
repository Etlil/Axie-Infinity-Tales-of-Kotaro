import DodgeSystem,{ARENA,getDodgeTiming,overlapsPlayer} from './DodgeSystem';
function emitter(){const listeners=new Map();return {
  on(n,fn){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(fn);},
  once(n,fn){this.on(n,fn);},off(n,fn){listeners.get(n)?.delete(fn);},
  emit(n,...args){[...(listeners.get(n)||[])].forEach(fn=>fn(...args));},count(n){return listeners.get(n)?.size||0;}
};}
function setup(options={}){
  const keyboard={...emitter(),captures:[37],getCaptures(){return this.captures;},addCapture(keys){this.captures.push(...keys);},removeCapture(keys){this.captures=this.captures.filter(k=>!keys.includes(k));}};
  const scene={input:{keyboard},events:emitter()},onHit=jest.fn(),onResolve=jest.fn(),onUpdate=jest.fn();
  const dodge=new DodgeSystem(scene,{onHit,onResolve,onUpdate,...options});
  const advance=ms=>{while(ms>0){const dt=Math.min(ms,1000/60);scene.events.emit('update',0,dt);ms-=dt;}};
  dodge.start();return {scene,dodge,advance,onHit,onResolve,onUpdate};
}
test('holding movement moves continuously, releasing decelerates, and arena bounds hold',()=>{
  const {dodge,advance}=setup();dodge.plan=[];
  dodge.setControl('right',true);advance(250);expect(dodge.player.x).toBeGreaterThan(380);expect(dodge.player.x).toBeLessThan(420);
  dodge.setControl('right',false);advance(200);expect(Math.abs(dodge.player.vx)).toBeLessThan(10);
  dodge.setControl('left',true);advance(2000);expect(dodge.player.x).toBe(ARENA.left);
});
test('jump uses gravity, lands on the floor, and cannot be spammed in midair',()=>{
  const {dodge,advance}=setup();dodge.plan=[];dodge.setControl('jump',true);advance(140);
  expect(dodge.player.y).toBeLessThan(525);expect(dodge.player.grounded).toBe(false);
  dodge.setControl('jump',false);dodge.setControl('jump',true);advance(100);
  expect(dodge.player.vy).toBeGreaterThan(-400);advance(850);expect(dodge.player.y).toBe(ARENA.floor);
});
test('jumping through a ledge from below lands on its top',()=>{
  const {dodge,advance}=setup();dodge.plan=[];dodge.player.x=375;
  dodge.setControl('right',true);dodge.setControl('jump',true);advance(300);
  dodge.setControl('right',false);advance(350);
  expect(dodge.player.grounded).toBe(true);expect(dodge.player.y).toBe(475);
});
test('moving projectiles collide with the character and grant recovery invulnerability',()=>{
  const {dodge,advance,onHit}=setup();dodge.plan=[];
  const shot=()=>({x:dodge.player.x+55,y:565,vx:-800,vy:0,radius:20,age:0,kind:'thorn'});
  dodge.shots.push(shot());advance(100);expect(onHit).toHaveBeenCalledTimes(1);
  dodge.shots.push(shot());advance(100);expect(onHit).toHaveBeenCalledTimes(1);
  advance(800);dodge.shots.push(shot());advance(100);expect(onHit).toHaveBeenCalledTimes(2);
  expect(overlapsPlayer({x:300,y:440},{x:300,y:566,radius:25})).toBe(false);
});
test('dash crosses an attack safely, consumes cooldown, and recharges',()=>{
  const {dodge,advance,onHit}=setup();dodge.plan=[];
  dodge.setControl('dash',true);dodge.shots.push({x:390,y:565,vx:-500,vy:0,radius:25,age:0,kind:'wave'});
  advance(170);expect(dodge.player.x).toBeGreaterThan(450);expect(onHit).not.toHaveBeenCalled();
  dodge.setControl('dash',false);advance(100);dodge.setControl('dash',true);expect(dodge.player.dash).toBe(0);
  dodge.setControl('dash',false);advance(800);dodge.setControl('dash',true);expect(dodge.player.dash).toBe(180);
});
test('a rescue bonus gives earlier warnings and slower projectiles without longer exposure',()=>{
  expect(getDodgeTiming(.05).duration).toBe(getDodgeTiming().duration);
  expect(getDodgeTiming(.05).warningDuration).toBeCloseTo(682.5);
  expect(getDodgeTiming(.05).speedMultiplier).toBeLessThan(1);
  expect(getDodgeTiming(NaN)).toEqual(getDodgeTiming());expect(getDodgeTiming(-1)).toEqual(getDodgeTiming());
});
test('rain marks a location before actual falling attacks and resolves only once',()=>{
  const {dodge,advance,onResolve}=setup();dodge.start({pattern:'rain',damage:20});advance(300);
  expect(dodge.plan[0].warned).toBe(true);expect(dodge.shots).toHaveLength(0);
  const marked=dodge.plan[0].target.x;dodge.setControl('right',true);advance(620);
  expect(dodge.shots).toHaveLength(3);expect(dodge.shots[1].x).toBe(marked);
  advance(6000);expect(onResolve).toHaveBeenCalledTimes(1);advance(3000);expect(onResolve).toHaveBeenCalledTimes(1);
});
test('multiple input sources release independently and pausing clears held controls',()=>{
  const {dodge,advance,scene}=setup();dodge.plan=[];
  scene.input.keyboard.emit('keydown-D');dodge.setControl('right',true,'finger');
  scene.input.keyboard.emit('keyup-D');expect(dodge.axis()).toBe(1);
  scene.events.emit('pause');expect(dodge.axis()).toBe(0);advance(250);expect(dodge.player.x).toBe(330);
});
test('shutdown cancels attacks and removes its listeners while preserving existing captures',()=>{
  const {dodge,advance,scene,onHit,onResolve}=setup();scene.events.emit('shutdown');advance(10000);
  expect(onHit).not.toHaveBeenCalled();expect(onResolve).not.toHaveBeenCalled();
  expect(scene.events.count('update')).toBe(0);expect(scene.input.keyboard.count('keydown-A')).toBe(0);
  expect(scene.input.keyboard.captures).toEqual([37]);expect(dodge.start()).toBe(false);
});

test('Buba crosses right to left and back, and contact does not destroy his moving body',()=>{
  const {dodge,advance,onHit,onUpdate,onResolve}=setup();dodge.start({pattern:'buba-dash',damage:12});
  advance(300);expect(dodge.plan[0].warned).toBe(true);expect(dodge.shots).toHaveLength(0);
  advance(700);expect(dodge.shots[0]).toMatchObject({kind:'buba-dash',stage:'dash'});
  expect(dodge.shots[0].vx).toBeLessThan(0);
  advance(900);expect(onHit).toHaveBeenCalledTimes(1);expect(dodge.shots).toHaveLength(1);
  expect(onUpdate.mock.calls.at(-1)[0].opponent).toMatchObject({facing:-1,charging:true});
  advance(900);expect(dodge.shots).toHaveLength(0);
  expect(onUpdate.mock.calls.at(-1)[0].opponent).toMatchObject({x:110,facing:1,charging:false});
  advance(1000);expect(dodge.shots[0].vx).toBeGreaterThan(0);
  advance(2400);expect(onHit).toHaveBeenCalledTimes(2);
  expect(onUpdate.mock.calls.at(-1)[0].opponent).toMatchObject({x:1040,facing:-1,charging:false});
  advance(400);expect(onResolve).toHaveBeenCalledTimes(1);
});

test('jumping clears Buba’s low sword rush',()=>{
  const {dodge,advance,onHit}=setup();dodge.start({pattern:'buba-dash'});
  advance(1500);dodge.setControl('jump',true);advance(750);
  expect(onHit).not.toHaveBeenCalled();expect(dodge.shots).toHaveLength(0);
});

test('the mushroom pauses safely with a warning, arcs back, and is caught by Buba',()=>{
  const {dodge,advance,onHit,onUpdate}=setup();dodge.start({pattern:'buba-mushroom'});
  dodge.player.invulnerable=3000;advance(1200);
  const mushroom=dodge.shots[0];expect(mushroom).toMatchObject({kind:'mushroom',stage:'outbound'});
  expect(mushroom.vx).toBeLessThan(0);
  advance(1450);expect(mushroom.stage).toBe('turn');
  expect(onUpdate.mock.calls.at(-1)[0].warnings).toEqual([expect.objectContaining({kind:'mushroom-return'})]);
  dodge.player.x=150;dodge.player.invulnerable=0;advance(100);expect(onHit).not.toHaveBeenCalled();
  advance(1100);expect(mushroom.stage).toBe('return');expect(mushroom.vx).toBeGreaterThan(0);
  expect(mushroom.y).toBeLessThan(500);advance(1300);expect(dodge.shots).toHaveLength(0);
});

test.each(['buba-dash','buba-mushroom'])('%s finishes its return before the phase ends even at the maximum rescue bonus',pattern=>{
  const {dodge,advance,onResolve}=setup({bonus:1});dodge.start({pattern});dodge.player.invulnerable=10000;
  advance(6400);expect(dodge.shots).toHaveLength(0);expect(dodge.active).toBe(true);
  advance(150);expect(onResolve).toHaveBeenCalledTimes(1);
});
