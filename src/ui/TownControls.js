import {Direction} from './DungeonControls';
import {nearbyPlace,TOWN_START} from '../game/townLayout';
export default function TownControls({game,command}){
  const pos=game.townPosition||TOWN_START,place=nearbyPlace(pos),puffy=game.rescued.some(r=>r.id==='puffy');
  return <>
    <section className="town-info"><small>CHAPTER 01 · A TOWN TO RESTORE</small><h1>Atia Town</h1><button className="quest-card town-quest" aria-label="Open story quest" onClick={()=>command('openPanel','journal')}>{puffy?'Puffy rescued · +5% dodge time':'Find Puffy · '+game.completedStages.length+' / 3 dungeons cleared'}</button><p>{place?place.name+' · '+place.action:'WASD / arrows to walk · E to interact'}</p></section>
    <div className="town-bottom" data-tile-x={pos.x} data-tile-y={pos.y}>
      <div className="dungeon-pad town-pad" aria-label="Town movement">{[['up','↑'],['left','←'],['down','↓'],['right','→']].map(([direction,symbol])=><Direction key={direction} direction={direction} symbol={symbol} command={command} prefix="town"/>)}</div>
      <div className="town-status" role="status">{game.message}</div>
      <div className="town-actions"><button className="small-button town-interact" disabled={!place} onClick={()=>command('townInteract')}>{place?'E · '+place.name:'Approach a place to interact'}</button><nav className="town-shortcuts" aria-label="Town destinations and menus">
        <button className="small-button" onClick={()=>command('openPanel','team')}>Team</button>
        <button className="small-button" onClick={()=>command('openPanel','amulet')}>Amulet</button>
        <button className="small-button" aria-label="Rewards" onClick={()=>command('townTravel','tent')}>Buba’s tent{game.availableRewards>0?' · '+game.availableRewards:''}</button>
        {puffy&&<button className="small-button" aria-label="Visit Puffy" onClick={()=>command('townTravel','spring')}>Puffy</button>}
        <button className="small-button" onClick={()=>command('openPanel','journal')}>Journal</button>
        <button className="gold-button" onClick={()=>command('townTravel','gate')}>Adventure</button>
      </nav></div>
    </div>
  </>;
}
