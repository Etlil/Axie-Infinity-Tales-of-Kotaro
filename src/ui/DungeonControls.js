import {useEffect,useRef} from 'react';
function Direction({direction,symbol,command}){
  const send=useRef(command);send.current=command;
  useEffect(()=>()=>send.current('dungeonInput',{direction,pressed:false}),[direction]);
  const release=()=>command('dungeonInput',{direction,pressed:false});
  return <button className={'dungeon-direction '+direction} aria-label={'Walk '+direction}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);command('dungeonInput',{direction,pressed:true});}}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onClick={e=>{if(e.detail===0)command('dungeonStep',direction);}}>{symbol}</button>;
}
export default function DungeonControls({game,command}){
  const defeated=game.dungeonRun?.defeated||0;
  return <>
    <section className="dungeon-objective"><small>THE SUNKEN HALLS · FLOOR 1</small><h1>{defeated>=3?'Dungeon cleared':defeated===2?'Find Puffy’s chamber':'Explore the dungeon'}</h1><p>{defeated>=3?'Return to Atia through the exit button.':defeated===2?'The final seal is open. Puffy waits in the eastern chamber.':'Slimes defeated '+defeated+' / 2 · Contact starts a battle'}</p></section>
    <div className="dungeon-bottom" data-tile-x={game.dungeonRun?.x} data-tile-y={game.dungeonRun?.y} data-defeated={defeated}>
      <div className="dungeon-pad" aria-label="Dungeon movement">{[['up','↑'],['left','←'],['down','↓'],['right','→']].map(([direction,symbol])=><Direction key={direction} direction={direction} symbol={symbol} command={command}/>)}</div>
      <div className="dungeon-hint"><b>{game.activeCharacter==='buba'?'Buba':'Kotaro'} · {game.playerHP} / {game.playerMaxHP} HP</b><span role="status">{game.message}</span><small>WASD / ARROWS · HOLD THE PAD TO WALK</small></div>
      <button className="small-button dungeon-exit" onClick={()=>command('visitVillage')}>Exit to Atia</button>
    </div>
  </>;
}
