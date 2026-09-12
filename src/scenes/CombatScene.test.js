import CombatScene from './CombatScene';
import { bodyPartAttack } from '../game/bodyPartAttacks';
import { characterCards } from '../data/playerCards';
import { createSession } from '../game/state';
import { bosses, dungeonRooms } from '../data/bosses';
jest.mock('../game/bodyPartAttacks',()=>({bodyPartAttack:jest.fn()}));
jest.mock('phaser',()=>({__esModule:true,default:{Scene:class Scene{}}}));
jest.mock('../game/world',()=>({backdrop:jest.fn(),fighter:jest.fn(),slash:jest.fn(),paintBurst:jest.fn()}));
function displayObject(){const o={};['setOrigin','setDepth','setAlpha','playAction','setStrokeStyle','setPosition','setScale','setAngle'].forEach(name=>{o[name]=jest.fn(()=>o);});return o;}
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
beforeEach(()=>{jest.clearAllMocks();jest.useFakeTimers();});
afterEach(()=>{jest.clearAllTimers();jest.useRealTimers();});
test.each(Object.entries(characterCards).flatMap(([hero,cards]) => cards.map(card => [hero,card.part,card])))('%s %s attack applies its effect once and animates the matching body part',(hero,part,card)=>{
 const {combat,session}=encounter();
 session.patch({activeCharacter:hero,playerHP:50});
 combat.playCard(card.id);combat.playCard(card.id);
 expect(combat.player.playAction).toHaveBeenCalledWith('attack',part);
 expect(session.state).toMatchObject({charge:1,guard:card.guard || 0,playerHP:50+(card.heal || 0)});
 jest.advanceTimersByTime(120);
 expect(bodyPartAttack).toHaveBeenCalledTimes(1);
 expect(bodyPartAttack).toHaveBeenCalledWith(combat,combat.player,card,{x:850,y:420});
 expect(session.state.enemyHP).toBe(bosses.momo.maxHP);
 jest.advanceTimersByTime(240);
 expect(session.state.enemyHP).toBe(bosses.momo.maxHP-card.damage);
});
test('one card per turn applies damage once before telegraph and dodge',()=>{
 const {combat,session}=encounter();
 combat.playCard('horn-lance');combat.playCard('horn-lance');
 expect(session.state.phase).toBe('PLAYER_ATTACK_ANIM');
 jest.advanceTimersByTime(360);expect(session.state.enemyHP).toBe(112);
 jest.advanceTimersByTime(440);expect(session.state.phase).toBe('BOSS_TELEGRAPH');
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
 expect(combat.player.playAction).toHaveBeenCalledWith('ultimate','back');
 jest.advanceTimersByTime(360);expect(session.state.enemyHP).toBe(84);
});
test('Buba defeat checkpoints the dialogue and never grants a corruption rescue',()=>{
 const {combat,session}=encounter(bosses.buba,0,true);
 session.patch({enemyHP:12});combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state).toMatchObject({tutorialWon:true,prologueComplete:false,amulet:false,xp:60});
 expect(session.state.rescued).toHaveLength(0);
 expect(combat.scene.start).toHaveBeenCalledWith('DialogueScene');
 expect(combat.dodge.start).not.toHaveBeenCalled();
});
test('Momo defeat waits for the amulet action before granting a rescue or XP',()=>{
 const {combat,session}=encounter();
 session.patch({enemyHP:12});combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state.result).toEqual({kind:'purify'});
 expect(session.state.rescued).toHaveLength(0);
 expect(session.state.completedStages).toHaveLength(0);
 expect(combat.scene.start).toHaveBeenCalledWith('VictoryScene');
});
test('a normal clear unlocks the next node and grants first-clear rewards',()=>{
 const {combat,session}=encounter(dungeonRooms[0],0);
 session.patch({enemyHP:12});combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state).toMatchObject({unlockedStage:1,completedStages:[0],result:{kind:'cleared',xp:30}});
});
test('healing is capped, guard absorbs one hit, and lethal damage opens defeat',()=>{
 const {combat,session}=encounter();
 session.patch({playerHP:98});combat.playCard('moon-fang');expect(session.state.playerHP).toBe(100);
 jest.clearAllTimers();session.patch({playerHP:50,guard:14});
 combat.resolveDodge({hit:true,damage:24,lane:1,dangerLane:1});
 expect(session.state.playerHP).toBe(40);jest.advanceTimersByTime(800);expect(session.state.guard).toBe(0);
 session.patch({playerHP:12});combat.resolveDodge({hit:true,damage:24,lane:1,dangerLane:1});jest.advanceTimersByTime(800);
 expect(session.state.playerHP).toBe(0);expect(combat.scene.start).toHaveBeenCalledWith('DefeatScene');
});
