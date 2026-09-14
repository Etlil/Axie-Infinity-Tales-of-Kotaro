import {createSaveSlots,slotKey,PROFILE_KEY} from './saveSlots';
import {createSession} from './state';

function memoryStorage(seed={}){
  const values=new Map(Object.entries(seed));
  return {values,getItem:jest.fn(k=>values.get(k)||null),setItem:jest.fn((k,v)=>values.set(k,v)),removeItem:jest.fn(k=>values.delete(k))};
}
const legacy={version:1,tutorialWon:true,prologueComplete:true,amulet:true,xp:460,coins:800,activeCharacter:'buba',rescued:[{id:'puffy'}],completedStages:[0,1]};
const sessionFor=storage=>createSession(jest.fn(),{slotStore:createSaveSlots(storage)});

test('boot opens the menu without touching any saves; the old key becomes Slot 1',()=>{
  const storage=memoryStorage({[PROFILE_KEY]:JSON.stringify(legacy)}),session=sessionFor(storage);
  session.emit();session.patch({loading:false,loadProgress:100});
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(session.state).toMatchObject({scene:'menu',activeSlot:null});
  expect(session.state.saveSlots).toHaveLength(5);
  expect(session.state.saveSlots[0]).toMatchObject({id:1,hero:'Buba',xp:460,empty:false});
  expect(session.selectSlot(1)).toEqual({ok:true});
  expect(session.state).toMatchObject({scene:'village',activeSlot:1,xp:460,coins:800,activeCharacter:'buba'});
});

test('slots keep separate progress through switching and reloads; reset affects only the chosen slot',()=>{
  const storage=memoryStorage({[PROFILE_KEY]:JSON.stringify(legacy)}),session=sessionFor(storage);
  session.selectSlot(1);const original=storage.getItem(PROFILE_KEY);
  session.toMainMenu();session.selectSlot(3);
  expect(session.state).toMatchObject({introStep:0,xp:0,activeCharacter:'kotaro',activeSlot:3});
  session.patch({introStep:2});session.toMainMenu();session.selectSlot(1);
  expect(session.state.xp).toBe(460);
  session.toMainMenu();session.selectSlot(3);expect(session.state.introStep).toBe(2);
  expect(session.resetSave()).toBe(true);
  expect(JSON.parse(storage.getItem(slotKey(3))).introStep).toBe(0);
  expect(JSON.parse(storage.getItem(PROFILE_KEY))).toMatchObject(legacy);
  expect(JSON.parse(original)).toMatchObject(legacy);
  const reloaded=sessionFor(storage);reloaded.selectSlot(1);expect(reloaded.state.xp).toBe(460);
  expect(storage.values.has(slotKey(2))).toBe(false);
});

test('autosave runs for progress, never every movement or dodge frame',()=>{
  const storage=memoryStorage(),session=sessionFor(storage);session.selectSlot(1);
  const count=storage.setItem.mock.calls.length,revision=session.state.saveRevision;
  for(let i=0;i<20;i++)session.patch({townPosition:{x:i,y:12},dodgeX:i,dodgeRemaining:i/10});
  expect(storage.setItem).toHaveBeenCalledTimes(count);expect(session.state.saveRevision).toBe(revision);
  session.patch({introStep:1});expect(storage.setItem).toHaveBeenCalledTimes(count+1);
  expect(session.state).toMatchObject({saveKind:'auto',saveStatus:'saved',saveRevision:revision+1});
});

test('only the nearby town fountain can set a durable return point',()=>{
  const storage=memoryStorage({[PROFILE_KEY]:JSON.stringify(legacy)}),session=sessionFor(storage);session.selectSlot(1);
  expect(session.saveAtFountain()).toBe(false);
  session.patch({townPosition:{x:14,y:12},scene:'combat'});expect(session.saveAtFountain()).toBe(false);
  session.patch({scene:'village'});expect(session.saveAtFountain()).toBe(true);
  expect(session.state).toMatchObject({saveStatus:'saved',saveKind:'fountain',townCheckpoint:{x:14,y:12}});
  session.patch({townPosition:{x:26,y:5}});
  const reloaded=sessionFor(storage);reloaded.selectSlot(1);
  expect(reloaded.state).toMatchObject({scene:'village',townPosition:{x:14,y:12}});
});

test('failed writes remain recoverable across slot switches and explicit retry persists them',()=>{
  const storage=memoryStorage(),session=sessionFor(storage);
  storage.setItem.mockImplementation(()=>{throw Error('quota exceeded');});
  session.selectSlot(2);session.patch({introStep:2});
  expect(session.state).toMatchObject({saveAvailable:false,saveStatus:'failed'});
  const calls=storage.setItem.mock.calls.length;session.patch({dodgeX:30});expect(storage.setItem).toHaveBeenCalledTimes(calls);
  session.toMainMenu();session.selectSlot(4);session.patch({introStep:1});session.toMainMenu();session.selectSlot(2);
  expect(session.state.introStep).toBe(2);expect(session.state.saveSlots[1].sessionOnly).toBe(true);
  storage.setItem.mockImplementation((k,v)=>storage.values.set(k,v));
  expect(session.saveNow()).toBe(true);
  expect(JSON.parse(storage.getItem(slotKey(2))).introStep).toBe(2);
  expect(session.state.saveSlots[1].sessionOnly).toBe(false);
  expect(session.state.saveSlots[3].sessionOnly).toBe(true);
});

test('damaged and unreadable saves are preserved instead of replaced with new adventures',()=>{
  const storage=memoryStorage({[PROFILE_KEY]:'broken'}),session=sessionFor(storage);
  expect(session.selectSlot(1).ok).toBe(false);expect(storage.getItem(PROFILE_KEY)).toBe('broken');
  storage.getItem.mockImplementation(()=>{throw Error('blocked');});
  expect(session.selectSlot(2).ok).toBe(false);expect(storage.setItem).not.toHaveBeenCalled();
  expect(session.selectSlot(0).ok).toBe(false);expect(session.selectSlot(6).ok).toBe(false);
});

test('unavailable localStorage still supports five session-only adventures',()=>{
  const session=sessionFor(null);session.selectSlot(5);session.patch({introStep:3});
  expect(session.state.saveStatus).toBe('failed');session.toMainMenu();session.selectSlot(1);
  session.toMainMenu();session.selectSlot(5);expect(session.state.introStep).toBe(3);
});
