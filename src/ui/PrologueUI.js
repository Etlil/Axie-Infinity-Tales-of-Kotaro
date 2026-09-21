import {useState} from 'react';
import DialogueBox from './DialogueBox';
import Joystick from './Joystick';
import {RUINED_SIGN,bubaDialogue} from '../data/story';

export default function PrologueUI({game,command,paused}){
  const phase=game.phase,cinematic=game.introStage==='pendant',sign=phase==='INTRO_SIGN_TEXT';
  const moving=['INTRO_MOVE','INTRO_SIGN','INTRO_PATH','INTRO_VILLAGE'].includes(phase);
  return <>
    {cinematic?<><div className="prologue-caption"><small>CHAPTER I</small><h1>A light in the silence</h1></div><button className="small-button skip-cinematic" onClick={()=>command('skipCinematic')} disabled={paused}>Skip scene</button></>:<section className="prologue-objective" data-x={game.introPosition?.x} data-y={game.introPosition?.y}>
      <small>{phase==='INTRO_MOVE'?'FIND YOUR FOOTING':'THE ROAD TO ATIA'}</small>
      <h1>{phase==='INTRO_MOVE'?'A new journey':sign?'The ruined sign':phase==='INTRO_AMBUSH'?'!!!':game.introStage==='village'?'Someone stayed.':'Follow the old road'}</h1>
      {phase==='INTRO_MOVE'?<><p className="keyboard-instruction">Move with W A S D or the arrow keys.</p><p className="touch-instruction">Drag the joystick in all four directions.</p><div className="direction-checklist">{[['up','W','↑'],['left','A','←'],['down','S','↓'],['right','D','→']].map(([direction,key,arrow])=><span key={direction} data-direction={direction} className={game.tutorialDirections.includes(direction)?'done':''}>{game.tutorialDirections.includes(direction)?'✓':arrow} <kbd>{key}</kbd></span>)}</div></>:<p>{phase==='INTRO_SIGN'?'Read the weathered sign beside the road.':game.message}</p>}
      {phase==='INTRO_SIGN'&&<><p className="keyboard-instruction">Approach the sign, then press <kbd>F</kbd> to interact.</p><p className="touch-instruction">Approach the sign, then press the button on the right to interact.</p></>}
    </section>}
    {moving&&<div className="prologue-controls"><Joystick command={command} disabled={paused}/><button className="prologue-interact" aria-label="Interact with ruined sign" disabled={paused||!game.introCanInteract} onClick={()=>command('introInteract')}><span>F</span><b>INTERACT</b></button></div>}
    {sign&&<DialogueBox speaker="Ruined sign" portrait="kotaro" title="The ruined sign" text={RUINED_SIGN} buttonLabel="Leave the sign" onAdvance={()=>command('introInteract')} paused={paused}/>}
  </>;
}

export function BubaConversation({game,command,paused}){
  const line=bubaDialogue[game.dialogueIndex]||bubaDialogue[0],name=game.playerName||'Kotaro';
  const [draft,setDraft]=useState(game.playerName||'');
  if(game.phase==='DIALOGUE_END')return null;
  if(line.type==='name')return <section className="story-choice name-card" aria-label="Introduce yourself">
    <img src="/assets/buba/avatar.png" alt="Buba"/><div><small>BUBA</small><p>{line.text}</p>
    <form onSubmit={e=>{e.preventDefault();if(!paused&&draft.trim())command('namePlayer',draft);}}><label htmlFor="traveler-name">Your name</label><div className="name-entry"><input id="traveler-name" value={draft} maxLength={20} autoComplete="off" autoFocus onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()} onChange={e=>setDraft(e.target.value)} placeholder="Kotaro" disabled={paused}/><button className="gold-button" disabled={paused||!draft.trim()} type="submit">Confirm name</button></div><small>Up to 20 characters · Saved with this adventure</small></form></div>
  </section>;
  if(line.type==='choice')return <section className="story-choice" aria-label="Your response"><small>{name}</small><p>{line.text}</p><div className="response-options">{line.choices.map(choice=><button key={choice} className="gold-button" disabled={paused} onClick={()=>command('nextDialogue')}>{choice}</button>)}</div></section>;
  return <DialogueBox key={game.dialogueIndex} speaker={line.speaker==='mc'?name:line.speaker} portrait={line.speaker==='mc'?'kotaro':'buba'} title={line.speaker==='mc'?'Your thoughts':'Buba’s story'} text={line.text.replace('{name}',name)} onAdvance={()=>command('nextDialogue')} paused={paused}/>;
}
