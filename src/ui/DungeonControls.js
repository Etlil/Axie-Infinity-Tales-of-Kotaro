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
  const run=game.dungeonRun;
  if(!run)return null;
  const d=dungeonFor(run),defeated=run.defeated,puzzle=run.puzzle;
  const valve=d.puzzle.type==='valves'?d.puzzle.tiles.find(t=>Math.abs(t.x-run.x)+Math.abs(t.y-run.y)<=1):null;
  const progress=d.puzzle.type==='runes'?puzzle.progress+' / 3 stones':d.puzzle.type==='valves'?'Lamps '+[0,1,2].map(i=>(puzzle.lamps&(1<<i))?'●':'○').join(' '):'Push the block onto the plate';
  return <>
    <section className="dungeon-objective"><small>DUNGEON 0{d.id+1} · {defeated} / {d.encounters.length} ENCOUNTERS</small><h1>{d.name}</h1><p>{gateOpen(run)?'Final chamber open · '+(d.id===2?'Find Puffy':'Defeat the shrine slime'):d.puzzleName+' · '+(puzzle.solved?'Solved':progress)}</p><p className="puzzle-clue">{puzzle.solved?'The puzzle is solved. Clear the remaining encounters.':d.clue}</p></section>
    <div className="dungeon-bottom" data-tile-x={run.x} data-tile-y={run.y} data-defeated={defeated} data-level={run.level} data-puzzle-solved={puzzle.solved} data-puzzle-progress={puzzle.progress} data-lamps={puzzle.lamps}>
      <div className="dungeon-pad" aria-label="Dungeon movement">{[['up','↑'],['left','←'],['down','↓'],['right','→']].map(([direction,symbol])=><Direction key={direction} direction={direction} symbol={symbol} command={command}/>)}</div>
      <div className="dungeon-hint"><b>{game.activeCharacter==='buba'?'Buba':game.playerName||'Kotaro'} · {game.playerHP} / {game.playerMaxHP} HP</b><span role="status">{game.message}</span><small>WASD / ARROWS · HOLD THE PAD TO WALK</small></div>
      <div className="dungeon-actions">{d.puzzle.type==='valves'&&!puzzle.solved&&<button className="small-button" disabled={!valve} onClick={()=>command('interactPuzzle')}>{valve?'Use valve '+valve.name+' · E':'Approach a valve'}</button>}{!puzzle.solved&&<button className="small-button" onClick={()=>command('resetPuzzle')}>Reset puzzle</button>}<button className="small-button dungeon-exit" onClick={()=>command('openMap')}>Level map</button><button className="small-button dungeon-exit" onClick={()=>command('visitVillage')}>Exit to Atia</button></div>
    </div>
  </>;
}
