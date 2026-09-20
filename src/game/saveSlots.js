// Slot 1 keeps the original key, so existing adventures need no destructive migration.
import {FOUNTAIN_CHECKPOINT} from './townLayout';
export const PROFILE_KEY='atia-adventure-v1';
export const SLOT_COUNT=5;
export const slotKey=id=>id===1?PROFILE_KEY:PROFILE_KEY+'-slot-'+id;
export function createSaveSlots(storage){
  const memory=new Map(),readErrors=new Set(),snapshots=new Map();
  let selectedRaw=null;
  const store={activeId:null,available:Boolean(storage),
    read(id){
      if(memory.has(id))return memory.get(id);
      try{const raw=storage?.getItem(slotKey(id))||null;readErrors.delete(id);snapshots.set(id,raw);return raw;}
      catch{this.available=false;readErrors.add(id);return null;}
    },
    list(){return Array.from({length:SLOT_COUNT},(_,i)=>{
      const id=i+1,raw=this.read(id);
      if(readErrors.has(id)&&!memory.has(id))return {id,empty:false,unreadable:true};
      if(!raw)return {id,empty:true};
      try{
        const p=JSON.parse(raw);
        if(!p||p.version!==1)throw Error('Invalid save');
        return {id,empty:false,hero:p.activeCharacter==='buba'?'Buba':typeof p.playerName==='string'&&p.playerName.trim()?p.playerName.trim().slice(0,20):'Kotaro',xp:Number.isFinite(p.xp)?Math.max(0,p.xp):0,
          chapter:p.prologueComplete?'Atia Town':p.tutorialWon?'Buba’s promise':'The arrival',savedAt:p.savedAt||null,
          fountain:(p.townCheckpoint?.x===14&&p.townCheckpoint?.y===12)||(p.townCheckpoint?.x===FOUNTAIN_CHECKPOINT.x&&p.townCheckpoint?.y===FOUNTAIN_CHECKPOINT.y),sessionOnly:memory.has(id)};
      }catch{return {id,empty:false,damaged:true};}
    });},
    select(id){
      if(!Number.isInteger(id)||id<1||id>SLOT_COUNT)return false;
      const slot=this.list()[id-1];
      if(slot.damaged||slot.unreadable)return false;
      selectedRaw=memory.has(id)?memory.get(id):snapshots.get(id)||null;
      this.activeId=id;return true;
    },
    adapter:{
      getItem(){return store.activeId?selectedRaw:null;},
      setItem(key,json){
        if(!store.activeId)throw Error('Choose a save slot first');
        const value=JSON.stringify({...JSON.parse(json),savedAt:new Date().toISOString()});
        // Keep failed writes in memory so switching slots cannot lose session progress.
        memory.set(store.activeId,value);selectedRaw=value;
        if(!storage){store.available=false;throw Error('Browser storage unavailable');}
        try{storage.setItem(slotKey(store.activeId),value);memory.delete(store.activeId);store.available=true;}
        catch(e){store.available=false;throw e;}
      },
      removeItem(){
        if(!store.activeId)throw Error('Choose a save slot first');
        storage?.removeItem(slotKey(store.activeId));memory.delete(store.activeId);selectedRaw=null;
      },
    },
  };
  return store;
}
