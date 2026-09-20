import CombatScene from './CombatScene';
import { bodyPartAttack } from '../game/bodyPartAttacks';
import { characterCards } from '../data/playerCards';
import { createSession } from '../game/state';
import { bosses, dungeonRooms } from '../data/bosses';
import {createDungeonRun} from '../game/dungeonLayout';
jest.mock('../game/dodgeWorld',()=>({drawArena:jest.fn(),drawHazards:jest.fn()}));
jest.mock('../game/bodyPartAttacks',()=>({bodyPartAttack:jest.fn()}));
jest.mock('phaser',()=>({__esModule:true,default:{Scene:class Scene{}}}));
jest.mock('../game/world',()=>({backdrop:jest.fn(),fighter:jest.fn(),slash:jest.fn(),paintBurst:jest.fn()}));
function displayObject(){const o={};['setOrigin','setDepth','setAlpha','playAction','setStrokeStyle','setPosition','setScale','setAngle'].forEach(name=>{o[name]=jest.fn(()=>o);});return o;}
function encounter(enemy=bosses.puffy,roomIndex=2,tutorial=false){
 const combat=new CombatScene(),session=createSession(jest.fn());
 if(!tutorial){session.finishTutorial();session.finishPrologue();}
 session.patch({phase:'PLAYER_TURN',scene:'combat',enemy,enemyHP:enemy.maxHP,roomIndex,tutorial});
 combat.game={session};combat.enemy=enemy;combat.enemyCard=enemy.cards[0];
 combat.player=displayObject();combat.enemySprite=displayObject();combat.arenaGraphics={clear:jest.fn()};combat.hazardGraphics={clear:jest.fn()};
 combat.add={text:jest.fn(displayObject),ellipse:jest.fn(displayObject)};
 combat.tweens={add:jest.fn(),killTweensOf:jest.fn(),pauseAll:jest.fn(),resumeAll:jest.fn()};
 combat.time={delayedCall:(duration,callback)=>setTimeout(callback,duration)};
 combat.cameras={main:{shake:jest.fn(),pan:jest.fn(),zoomTo:jest.fn()}};combat.scene={start:jest.fn()};
 combat.dodge={start:jest.fn(),stop:jest.fn()};combat.dodgeView={};
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
 expect(session.state.enemyHP).toBe(bosses.puffy.maxHP);
 jest.advanceTimersByTime(240);
 expect(session.state.enemyHP).toBe(bosses.puffy.maxHP-card.damage);
});
test('one card per turn applies damage once before telegraph and dodge',()=>{
 const {combat,session}=encounter();
 combat.playCard('horn-lance');combat.playCard('horn-lance');
 expect(session.state.phase).toBe('PLAYER_ATTACK_ANIM');
 jest.advanceTimersByTime(360);expect(session.state.enemyHP).toBe(112);
 jest.advanceTimersByTime(440);expect(session.state.phase).toBe('BOSS_TELEGRAPH');
 jest.advanceTimersByTime(650);expect(combat.dodge.start).toHaveBeenCalledWith({pattern:'wave',damage:24,tutorialJump:false});
 combat.resolveDodge({hits:0,damage:0,player:{x:330,y:600}});
 jest.advanceTimersByTime(960);
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

test('the Buba encounter opens with his crossing sword rush before a player choice',()=>{
 const {combat,session}=encounter(bosses.buba,0,true);
 combat.beginEncounter();expect(session.state.phase).toBe('BOSS_TELEGRAPH');
 expect(session.state.enemyCard.pattern).toBe('buba-dash');
 combat.playCard('horn-lance');expect(session.state.enemyHP).toBe(120);
 jest.advanceTimersByTime(650);expect(combat.dodge.start).toHaveBeenCalledWith({pattern:'buba-dash',damage:12,tutorialJump:true});
 combat.resolveDodge({hits:0});jest.advanceTimersByTime(960);
 expect(session.state.phase).toBe('PLAYER_TURN');expect(session.state.turn).toBe(2);
 combat.playCard('horn-lance');jest.advanceTimersByTime(800);
 expect(session.state.enemyCard.pattern).toBe('buba-mushroom');
});

test('Buba interrupts at half health, survives a strong attack, and checkpoints dialogue only once',()=>{
 const {combat,session}=encounter(bosses.buba,0,true);
 session.patch({enemyHP:65,charge:3});combat.playCard('eclipse');
 jest.advanceTimersByTime(360);expect(session.state.enemyHP).toBe(60);
 jest.advanceTimersByTime(440);expect(session.state.phase).toBe('ENCOUNTER_WON');
 combat.winEncounter();jest.advanceTimersByTime(600);
 expect(session.state.tutorialWon).toBe(true);expect(session.state.xp).toBe(60);
 expect(combat.scene.start).toHaveBeenCalledTimes(1);
 expect(combat.scene.start).toHaveBeenCalledWith('DialogueScene');
 expect(combat.dodge.start).not.toHaveBeenCalled();
 expect(combat.tweens.add).not.toHaveBeenCalledWith(expect.objectContaining({alpha:.4,duration:400}));
});

test('Buba keeps fighting above half health while ordinary enemies still need to be defeated',()=>{
 const first=encounter(bosses.buba,0,true);first.session.patch({enemyHP:81});
 first.combat.playCard('horn-lance');jest.advanceTimersByTime(800);
 expect(first.session.state.enemyHP).toBe(61);expect(first.session.state.phase).toBe('BOSS_TELEGRAPH');
 const second=encounter();second.session.patch({enemyHP:70});second.combat.playCard('horn-lance');
 jest.advanceTimersByTime(800);expect(second.session.state.enemyHP).toBe(50);
 expect(second.session.state.phase).toBe('BOSS_TELEGRAPH');expect(second.combat.scene.start).not.toHaveBeenCalled();
});

test('Buba’s rendered fighter follows the dash collision body and faces the return direction',()=>{
 const {combat}=encounter(bosses.buba,0,true);
 combat.cameras.main.centerOn=jest.fn();combat.player.setFacing=jest.fn();combat.enemySprite.setFacing=jest.fn();combat.enemySprite.sprite={setFlipX:jest.fn()};
 combat.onDodgeUpdate({player:{x:330,y:600,vx:0,vy:0,dash:0,facing:1,grounded:true,cooldown:0,invulnerable:0},
  shots:[],warnings:[],opponent:{x:470,y:543,facing:1,charging:true},dodgeRemaining:2.5,hits:0});
 expect(combat.enemySprite.setPosition).toHaveBeenCalledWith(470,543);
 expect(combat.enemySprite.setScale).toHaveBeenCalledWith(.82);
 expect(combat.enemySprite.playAction).toHaveBeenCalledWith('dash');
 expect(combat.enemySprite.setFacing).toHaveBeenCalledWith('right');
 expect(combat.player.setFacing).toHaveBeenCalledWith('right');
});
test('Puffy defeat waits for the amulet action before granting a rescue or XP',()=>{
 const {combat,session}=encounter();
 session.patch({enemyHP:12});combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state.result).toEqual({kind:'purify'});
 expect(session.state.rescued).toHaveLength(0);
 expect(session.state.completedStages).toHaveLength(0);
 expect(combat.scene.start).toHaveBeenCalledWith('VictoryScene');
});

test('replaying a rescued Puffy grants replay rewards without a second purification',()=>{
 const {combat,session}=encounter();session.rescue();session.completeStage(2);
 session.patch({enemyHP:12});combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state.result).toEqual({kind:'cleared',xp:20,coins:15,first:false});
 expect(session.state.rescued).toHaveLength(1);expect(session.state.bonus).toBe(.05);
 expect(combat.scene.start).toHaveBeenCalledWith('VictoryScene');
});
test('a normal clear unlocks the next node and grants first-clear rewards',()=>{
 const {combat,session}=encounter(dungeonRooms[0],0);
 session.patch({enemyHP:12});combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state).toMatchObject({unlockedStage:1,completedStages:[0],result:{kind:'cleared',xp:30}});
});

test('dungeon victory removes one slime and retains the exploration return tile',()=>{
 const {combat,session}=encounter(dungeonRooms[0],0);
 session.patch({dungeonRun:{...createDungeonRun(0),x:7,y:8},enemyHP:12});
 combat.playCard('horn-lance');jest.advanceTimersByTime(1400);
 expect(session.state.dungeonRun).toMatchObject({level:0,x:7,y:8,defeated:1});
 expect(session.state.result.kind).toBe('encounter');
 expect(session.state.completedStages).toEqual([]);
});
test('healing is capped, shields are consumed on contact, and lethal contact opens defeat',()=>{
 const {combat,session}=encounter();
 session.patch({playerHP:98});combat.playCard('moon-fang');expect(session.state.playerHP).toBe(100);
 jest.clearAllTimers();session.patch({phase:'DODGE_PHASE',playerHP:50,guard:14});
 combat.takeHit({damage:24,x:330,y:565});expect(session.state.playerHP).toBe(40);expect(session.state.guard).toBe(0);
 session.patch({playerHP:12});combat.takeHit({damage:24,x:330,y:565});jest.advanceTimersByTime(450);
 expect(session.state.playerHP).toBe(0);expect(combat.dodge.stop).toHaveBeenCalled();expect(combat.scene.start).toHaveBeenCalledWith('DefeatScene');
});
test('the cinematic freezes world time until an attack is confirmed',()=>{
 const {combat,session}=encounter();combat.beginPlayerTurn();
 expect(session.state.phase).toBe('PLAYER_FOCUS');combat.playCard('horn-lance');expect(session.state.enemyHP).toBe(132);
 jest.advanceTimersByTime(460);expect(session.state.phase).toBe('PLAYER_TURN');expect(combat.time.paused).toBe(true);
 expect(combat.tweens.pauseAll).toHaveBeenCalled();combat.selectAttack(3);expect(session.state.selectedAttack).toBe(3);
 combat.playCard('tail-sweep');expect(combat.time.paused).toBe(false);expect(combat.tweens.resumeAll).toHaveBeenCalled();
 jest.advanceTimersByTime(360);expect(session.state.enemyHP).toBe(114);
});
