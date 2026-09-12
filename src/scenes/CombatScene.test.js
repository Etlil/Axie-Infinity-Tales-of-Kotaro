import CombatScene from './CombatScene';
import { createSession } from '../game/state';
import { bosses, dungeonRooms } from '../data/bosses';
jest.mock('phaser',()=>({__esModule:true,default:{Scene:class Scene{}}}));
jest.mock('../game/world',()=>({backdrop:jest.fn(),fighter:jest.fn(),slash:jest.fn(),paintBurst:jest.fn()}));
function displayObject(){const o={};['setOrigin','setDepth','setAlpha','playAction','setStrokeStyle'].forEach(name=>{o[name]=jest.fn(()=>o);});return o;}
function encounter(enemy=bosses.momo,roomIndex=2,tutorial=false){
 const combat=new CombatScene(),session=createSession(jest.fn());
 if(!tutorial){session.finishTutorial();session.finishPrologue();}
 session.patch({phase:'PLAYER_TURN',scene:'combat',enemy,enemyHP:enemy.maxHP,roomIndex,tutorial});
 combat.game={session};combat.enemy=enemy;combat.enemyCard=enemy.cards[0];
 combat.player=displayObject();combat.enemySprite=displayObject();combat.paintLanes=jest.fn();
 combat.add={text:jest.fn(displayObject),ellipse:jest.fn(displayObject)};
 combat.tweens={add:jest.fn(),killTweensOf:jest.fn()};
 combat.time={delayedCall:(duration,callback)=>setTimeout(callback,duration)};
 combat.cameras={main:{shake:jest.fn()}};combat.scene={start:jest.fn()};
 combat.dodge={lane:1,start:jest.fn()};combat.dodgeView={};
 return {combat,session};
}
beforeEach(()=>jest.useFakeTimers());
afterEach(()=>{jest.clearAllTimers();jest.useRealTimers();});
test('one card per turn applies damage once before telegraph and dodge',()=>{
 const {combat,session}=encounter();
 combat.playCard('twin-slash');combat.playCard('twin-slash');
 expect(session.state.phase).toBe('PLAYER_ATTACK_ANIM');
 jest.advanceTimersByTime(240);expect(session.state.enemyHP).toBe(112);
 jest.advanceTimersByTime(560);expect(session.state.phase).toBe('BOSS_TELEGRAPH');
 jest.advanceTimersByTime(650);expect(combat.dodge.start).toHaveBeenCalledWith({dangerLane:2,damage:24});
 combat.resolveDodge({hit:false,damage:0,lane:1,dangerLane:2});
 jest.advanceTimersByTime(800);
 expect(session.state).toMatchObject({phase:'PLAYER_TURN',playerHP:100,turn:2,dodges:1,charge:1});
});
test('ultimate needs three charges and consumes them for a unique animation',()=>{
 const {combat,session}=encounter();
 combat.playCard('eclipse');expect(session.state.phase).toBe('PLAYER_TURN');
 session.patch({charge:3});combat.playCard('eclipse');
 expect(session.state.charge).toBe(0);
 expect(combat.player.playAction).toHaveBeenCalledWith('ultimate');
 jest.advanceTimersByTime(240);expect(session.state.enemyHP).toBe(84);
});
test('Buba defeat checkpoints the dialogue and never grants a corruption rescue',()=>{
 const {combat,session}=encounter(bosses.buba,0,true);
 session.patch({enemyHP:12});combat.playCard('twin-slash');jest.advanceTimersByTime(1400);
 expect(session.state).toMatchObject({tutorialWon:true,prologueComplete:false,amulet:false,xp:60});
 expect(session.state.rescued).toHaveLength(0);
 expect(combat.scene.start).toHaveBeenCalledWith('DialogueScene');
 expect(combat.dodge.start).not.toHaveBeenCalled();
});
test('Momo defeat waits for the amulet action before granting a rescue or XP',()=>{
 const {combat,session}=encounter();
 session.patch({enemyHP:12});combat.playCard('twin-slash');jest.advanceTimersByTime(1400);
 expect(session.state.result).toEqual({kind:'purify'});
 expect(session.state.rescued).toHaveLength(0);
 expect(session.state.completedStages).toHaveLength(0);
 expect(combat.scene.start).toHaveBeenCalledWith('VictoryScene');
});
test('a normal clear unlocks the next node and grants first-clear rewards',()=>{
 const {combat,session}=encounter(dungeonRooms[0],0);
 session.patch({enemyHP:12});combat.playCard('twin-slash');jest.advanceTimersByTime(1400);
 expect(session.state).toMatchObject({unlockedStage:1,completedStages:[0],result:{kind:'cleared',xp:30}});
});
test('healing is capped, guard absorbs one hit, and lethal damage opens defeat',()=>{
 const {combat,session}=encounter();
 session.patch({playerHP:98});combat.playCard('moonstep');expect(session.state.playerHP).toBe(100);
 jest.clearAllTimers();session.patch({playerHP:50,guard:14});
 combat.resolveDodge({hit:true,damage:24,lane:1,dangerLane:1});
 expect(session.state.playerHP).toBe(40);jest.advanceTimersByTime(800);expect(session.state.guard).toBe(0);
 session.patch({playerHP:12});combat.resolveDodge({hit:true,damage:24,lane:1,dangerLane:1});jest.advanceTimersByTime(800);
 expect(session.state.playerHP).toBe(0);expect(combat.scene.start).toHaveBeenCalledWith('DefeatScene');
});
