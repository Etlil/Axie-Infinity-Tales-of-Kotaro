import {useEffect,useRef} from 'react';
import {dungeonFor,gateOpen} from '../game/dungeonLayout';
export function Direction({direction,symbol,command,prefix='dungeon'}){
  const send=useRef(command);send.current=command;
  useEffect(()=>()=>send.current(prefix+'Input',{direction,pressed:false}),[direction,prefix]);
  const release=()=>command(prefix+'Input',{direction,pressed:false});
  return <button className={'dungeon-direction '+direction} aria-label={'Walk '+direction}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);command(prefix+'Input',{direction,pressed:true});}}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onClick={e=>{if(e.detail===0)command(prefix+'Step',direction);}}>{symbol}</button>;
}
export default function DungeonControls({game,command}){
 const run=game.dungeonRun;if(!run)return null;
 const d=dungeonFor(run),p=run.puzzle,keys=p.collected.length-p.unlocked.length;
 return <>
  <section className="dungeon-objective"><small>FLOOR {run.floor+1} / 3 · {run.defeated} / {d.encounters.length} ENCOUNTERS</small><h1>Aqua Cave</h1><p>Keys: {keys} · Locks: {p.unlocked.length} / {d.locks.length} open</p><p className="puzzle-clue">{gateOpen(run)?run.floor===2?'Find Puffy in the northern chamber.':'Reach the blue stairs to descend.':d.clue}</p></section>
  <div className="dungeon-bottom" data-tile-x={run.x} data-tile-y={run.y} data-floor={run.floor}>
   <div className="dungeon-pad" aria-label="Dungeon movement">{[['up','↑'],['left','←'],['down','↓'],['right','→']].map(([direction,symbol])=><Direction key={direction} direction={direction} symbol={symbol} command={command}/>)}</div>
   <div className="dungeon-hint"><b>{game.activeCharacter==='buba'?'Buba':game.playerName||'Kotaro'} · {game.playerHP} / {game.playerMaxHP} HP</b><span role="status">{game.message}</span><small>WASD / ARROWS · K: KEY · L: LOCK · ↓: NEXT FLOOR</small></div>
   <div className="dungeon-actions"><button className="small-button dungeon-exit" onClick={()=>command('visitVillage')}>Exit to Atia</button></div>
  </div>
 </>;
}
