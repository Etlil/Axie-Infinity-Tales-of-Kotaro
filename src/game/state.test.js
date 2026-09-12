import { bosses } from '../data/bosses';
import { createSession, derive, initialState, SAVE_KEY } from './state';
const memory = () => { const data={};return {getItem:key=>data[key],setItem:(key,value)=>{data[key]=value;},removeItem:key=>{delete data[key];}}; };
function unlocked(storage) { const s=createSession(jest.fn(),{storage});s.finishTutorial();s.finishPrologue();return s; }

test('Buba must be defeated before the amulet and playable companion unlock',()=>{
  const s=createSession();
  expect(s.finishPrologue()).toBe(false);
  expect(s.selectCharacter('buba')).toBe(false);
  expect(s.prepareEncounter(0)).toBe(false);
  expect(s.prepareEncounter(0,true)).toBe(true);
  expect(s.state.enemy.id).toBe('buba');
  s.finishTutorial();s.finishTutorial();
  expect(s.state.xp).toBe(60);
  expect(s.state.level).toBe(2);
  s.finishPrologue();
  expect(s.state.amulet).toBe(true);
  expect(s.selectCharacter('buba')).toBe(true);
  expect(s.state.playerMaxHP).toBe(110);
  expect(s.state.ultimate.name).toBe('Paintstorm');
});

test('rank claims are gated and awarded only once, including across reloads',()=>{
  const storage=memory(),s=unlocked(storage);
  expect(s.claimReward(3)).toBe(false);
  expect(s.claimReward(1)).toBe(true);
  expect(s.claimReward(1)).toBe(false);
  expect(s.state.coins).toBe(125);
  const restored=createSession(null,{storage});
  expect(restored.claimReward(1)).toBe(false);
  expect(restored.state.coins).toBe(125);
  expect(restored.claimReward(2)).toBe(true);
  expect(restored.state.wood).toBe(5);
});

test('sequential clears unlock the route and grow the shelter; replays give reduced XP',()=>{
  const s=unlocked();
  expect(s.prepareEncounter(2)).toBe(false);
  expect(s.completeStage(0)).toMatchObject({xp:30,first:true});
  expect(s.prepareEncounter(1)).toBe(true);
  expect(s.completeStage(1)).toMatchObject({xp:45,first:true});
  expect(s.state.tentStage).toBe(0);
  s.rescue(bosses.momo);s.completeStage(2);
  expect(s.state).toMatchObject({level:3,tentStage:1,unlockedStage:2});
  expect(s.completeStage(0)).toMatchObject({xp:20,first:false});
  s.patch({xp:460});
  expect(s.state).toMatchObject({level:5,tentStage:2,nextRankXP:0});
});

test('rescue requires the amulet and the Momo blessing never stacks',()=>{
  const s=createSession();
  expect(s.rescue(bosses.momo)).toBe(false);
  s.finishTutorial();s.finishPrologue();
  expect(s.rescue(bosses.momo)).toBe(true);
  expect(s.rescue(bosses.momo)).toBe(false);
  expect(s.state.rescued).toHaveLength(1);
  expect(s.state.bonus).toBe(.05);
});

test('reload resumes the Buba dialogue checkpoint, then the village after completion',()=>{
  const storage=memory(),s=createSession(null,{storage});
  s.finishTutorial();s.patch({dialogueIndex:3});
  expect(createSession(null,{storage}).state).toMatchObject({scene:'dialogue',dialogueIndex:3});
  s.finishPrologue();s.selectCharacter('buba');s.completeStage(0);
  s.patch({scene:'combat',playerHP:3});
  const restored=createSession(null,{storage});
  expect(restored.state).toMatchObject({scene:'village',activeCharacter:'buba',unlockedStage:1});
  restored.prepareEncounter(1);
  expect(restored.state.playerHP).toBe(110);
});

test('corrupt saves and unavailable storage do not prevent a new game',()=>{
  const storage=memory();storage.setItem(SAVE_KEY,'broken JSON');
  expect(createSession(null,{storage}).state.scene).toBe('intro');
  storage.setItem(SAVE_KEY,JSON.stringify({version:1,xp:-30,activeCharacter:'unknown',completedStages:[-1,99],rescued:[null]}));
  expect(createSession(null,{storage}).state).toMatchObject({xp:0,activeCharacter:'kotaro',unlockedStage:0,rescued:[]});
  const blocked={getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('blocked')}};
  const s=createSession(null,{storage:blocked});s.emit();
  expect(s.state.saveAvailable).toBe(false);
  s.finishTutorial();expect(s.state.tutorialWon).toBe(true);
});

test('new encounters restore health but retain companions, ranks, claims and blessings',()=>{
  const s=unlocked();s.rescue();s.claimReward(1);
  s.patch({playerHP:0,roomIndex:2,turn:9,guard:8,dodges:3,hits:7,dodgeActive:true,dodgeX:900,dodgeY:435,grounded:false});
  s.startRun();
  expect(s.state).toMatchObject({playerHP:100,roomIndex:0,turn:1,guard:0,dodges:0,hits:0,dodgeActive:false,dodgeX:330,dodgeY:600,grounded:true,bonus:.05,claimedRewards:[1]});
});

test('reset clears every checkpoint and encounter while preserving unrelated browser data',()=>{
  const storage=memory(),s=unlocked(storage);
  storage.setItem('another-app','keep this');
  s.rescue();s.claimReward(1);s.completeStage(0);s.selectCharacter('buba');
  s.patch({scene:'combat',phase:'DODGE_PHASE',loading:false,introStep:3,dialogueIndex:5,xp:460,wood:90,
    playerHP:3,charge:3,enemy:bosses.momo,enemyHP:15,dodgeActive:true,panel:'settings',result:{kind:'rescued'}});
  expect(s.resetSave()).toBe(true);
  expect(s.state).toEqual(derive(initialState()));
  expect(storage.getItem('another-app')).toBe('keep this');
  expect(createSession(null,{storage}).state).toEqual(derive(initialState()));
  // A new adventure still autosaves normally after resetting.
  s.patch({introStep:1});
  expect(createSession(null,{storage}).state.introStep).toBe(1);
});

test('failed deletion preserves both the saved profile and the current encounter',()=>{
  const storage=memory(),s=unlocked(storage);
  s.patch({scene:'combat',loading:false,playerHP:7});
  const before=s.state,saved=storage.getItem(SAVE_KEY);
  storage.removeItem=()=>{throw Error('blocked');};
  expect(s.resetSave()).toBe(false);
  expect(s.state).toBe(before);
  expect(storage.getItem(SAVE_KEY)).toBe(saved);
});

test('reset also works for a session with no storage',()=>{
  const s=unlocked();
  expect(s.resetSave()).toBe(true);
  expect(s.state).toEqual(derive({...initialState(),saveAvailable:false}));
});
