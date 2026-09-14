import {useEffect,useRef,useState} from 'react';
import {rankThresholds} from '../data/story';

export const SAVE_TIP='When the ★ icon appears in the lower-left corner, your adventure is saving. Wait for it to disappear before closing the game.';

export default function MainMenu({game,command}){
  const [error,setError]=useState('');
  const root=useRef(null),page=game.menuPage;
  const unsaved=game.saveSlots.filter(s=>s.sessionOnly).map(s=>s.id);
  useEffect(()=>{setError('');root.current?.querySelector('button:not(:disabled)')?.focus();},[page]);
  const back=<button className="small-button menu-back" onClick={()=>command('menuHome')}>← Back</button>;
  return <section ref={root} className={'main-menu menu-page-'+page} aria-label="Main menu">
    <div className="menu-brand"><span className="eyebrow">AXIE · TALES OF</span><h1>ATIA</h1><p>Echoes of a lost village</p><span className="menu-chapter">CHAPTER I · A LITTLE LIGHT</span></div>
    {page==='home'&&<nav className="title-actions" aria-label="Title menu">
      <button className="gold-button menu-start" onClick={()=>command('showSlots')}>Start <span aria-hidden="true">▶</span></button>
      <button className="small-button" onClick={()=>command('openPanel','settings')}>Settings</button>
      <button className="small-button" onClick={()=>command('showCredits')}>Credits</button>
      <button className="text-button" onClick={()=>command('quitGame')}>Quit</button>
    </nav>}
    {page==='slots'&&<div className="menu-sheet slot-sheet">
      <div className="menu-sheet-heading"><div><span className="eyebrow">FIVE LITTLE JOURNEYS</span><h2>Load game</h2></div>{back}</div>
      <p className="menu-description">Continue a journey, or choose an empty slot to begin.</p>
      <div className="save-slot-list">{game.saveSlots.map(slot=>{
        const rank=rankThresholds.reduce((r,t,i)=>slot.xp>=t?i+1:r,1);
        return <button key={slot.id} data-save-slot={slot.id} className={'save-slot '+(slot.empty?'empty-slot':'')}
          disabled={slot.damaged||slot.unreadable} onClick={()=>{const result=command('selectSlot',slot.id);if(!result?.ok)setError(result?.error||'Could not load this slot.');}}
          aria-label={'Slot '+slot.id+': '+(slot.unreadable?'Unavailable':slot.damaged?'Unreadable save':slot.empty?'New adventure':slot.hero+', '+slot.chapter)}>
          <span className="slot-number">{String(slot.id).padStart(2,'0')}</span>
          <span className="slot-copy"><strong>{slot.unreadable?'Storage unavailable':slot.damaged?'Unreadable save':slot.empty?'New adventure':slot.chapter}</strong>
            <small>{slot.unreadable?'This slot could not be checked.':slot.damaged?'Save preserved. Choose another slot.':slot.empty?'An empty page. A new beginning.':slot.hero+' · Rank '+rank+(slot.fountain?' · Fountain checkpoint':'')}</small></span>
          <span className="slot-meta">{slot.sessionOnly?'SESSION ONLY':slot.empty?'+':slot.damaged||slot.unreadable?'!':'CONTINUE'}{slot.savedAt&&<small>{new Date(slot.savedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small>}</span>
        </button>;
      })}</div>
      {error&&<p className="reset-error" role="alert">{error}</p>}
      <p className="slot-footnote">Saves stay in this browser. Unfinished expeditions restart from town; story progress and rewards are kept.</p>
    </div>}
    {page==='credits'&&<div className="menu-sheet credits-sheet"><div className="menu-sheet-heading"><h2>Made with a little light</h2>{back}</div><span className="eyebrow">AN AXIE FAN ADVENTURE</span><h3>Created by Etlil</h3><p>For Vibeathon 2026, and everyone helping Atia find its way home.</p><dl><dt>World & characters</dt><dd>Axie Infinity · Sky Mavis</dd><dt>Character & environment materials</dt><dd>Axie Origins Asset Kit and the Axie community</dd><dt>Game engine</dt><dd>Phaser · React</dd><dt>Typefaces</dt><dd>Changa One · Nunito · SIL Open Font License</dd></dl><p className="slot-footnote">An independent fan prototype. Not an official Sky Mavis release.</p></div>}
    {page==='quit'&&<div className="menu-sheet quit-sheet"><span className="quit-star" aria-hidden="true">✦</span><h2>{unsaved.length?'Your journey is still here.':'Until next time, wanderer.'}</h2><p>{unsaved.length?'Progress in slot '+unsaved.join(', ')+' is only stored for this session. Keep this tab open. Load each affected slot and retry saving before you leave.':'You can safely close this browser tab. Atia will be waiting when you return.'}</p>{game.saveStatus==='failed'&&<button className="gold-button" onClick={()=>command('retrySave')}>Retry save</button>}<p className="slot-footnote">Web browsers let you close the game using the tab controls.</p>{back}</div>}
    <footer className="menu-footer"><span aria-hidden="true">★</span><p>{SAVE_TIP}</p></footer>
  </section>;
}
