import {createSession,SAVE_KEY,restoreProfile} from './state';
import {bubaDialogue,RUINED_SIGN} from '../data/story';
const storageFor=profile=>{let value=JSON.stringify(profile);return {getItem:()=>value,setItem:(key,v)=>{value=v;},removeItem:()=>{value=null;}};};
test('tutorial milestones and a chosen name resume within the same save',()=>{
 const storage=storageFor({version:1}),s=createSession(null,{storage});
 s.patch({introStage:'sign',tutorialDirections:['up','down','left','right'],signRead:true});
 s.finishTutorial();expect(s.setPlayerName('  Luna  ')).toBe(true);s.patch({dialogueIndex:13});
 const loaded=createSession(null,{storage});
 expect(loaded.state).toMatchObject({scene:'dialogue',introStage:'sign',signRead:true,dialogueIndex:13,playerName:'Luna',nameConfirmed:true});
 expect(loaded.state.tutorialDirections).toHaveLength(4);
});
test('old saves preserve completed adventures and migrate the fountain to the painted well',()=>{
 const p=restoreProfile(storageFor({version:1,tutorialWon:true,prologueComplete:true,townCheckpoint:{x:14,y:12},xp:460,claimedRewards:[1,2]}));
 expect(p).toMatchObject({prologueComplete:true,playerName:'Kotaro',nameConfirmed:true,townCheckpoint:{x:23,y:16},xp:460,claimedRewards:[1,2]});
});
test('invalid tutorial progress cannot bypass navigation or name entry',()=>{
 const p=restoreProfile(storageFor({version:1,prologueVersion:2,introStage:'village',tutorialDirections:['up','up','bogus'],signRead:true,tutorialWon:true,dialogueIndex:15,playerName:''}));
 expect(p).toMatchObject({introStage:'move',tutorialDirections:['up'],signRead:false,nameConfirmed:false,dialogueIndex:bubaDialogue.findIndex(x=>x.type==='name')});
});
test('name entry is gated, bounded, and saved as text',()=>{
 const storage=storageFor({version:1}),s=createSession(null,{storage});
 expect(s.setPlayerName('Luna')).toBe(false);s.finishTutorial();
 expect(s.setPlayerName('   ')).toBe(false);expect(s.setPlayerName('a'.repeat(50))).toBe(true);
 expect(s.state.playerName).toHaveLength(20);
 expect(JSON.parse(storage.getItem(SAVE_KEY)).playerName).toBe('a'.repeat(20));
});
test('the ruined sign preserves the literal broken lettering',()=>{
 expect(RUINED_SIGN).toBe(String.raw`A\_/a VXlxg/`);
});
