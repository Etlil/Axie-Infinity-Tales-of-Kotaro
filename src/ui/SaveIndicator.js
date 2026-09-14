import {useEffect,useState} from 'react';

export default function SaveIndicator({game}){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    if(!game.activeSlot||!game.saveRevision)return;
    setVisible(true);
    const timer=setTimeout(()=>setVisible(false),1800);
    return ()=>clearTimeout(timer);
  },[game.activeSlot,game.saveRevision]);
  if(!game.activeSlot||(!visible&&game.saveStatus!=='failed'))return null;
  const failed=game.saveStatus==='failed';
  return <div className={'save-indicator '+(failed?'save-failed':'save-complete')} role="status" aria-live="polite" data-save-status={game.saveStatus}>
    <span key={game.activeSlot+'-'+game.saveRevision} className="save-star" aria-hidden="true">★</span>
    <span>{failed?'Save failed · keep this tab open':(game.saveKind==='auto'?'Autosaved':'Saved')+' · Slot '+game.activeSlot}</span>
  </div>;
}
