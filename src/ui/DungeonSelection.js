import {DUNGEONS} from '../game/dungeonLayout';
export default function DungeonSelection({game,command}){
 const d=DUNGEONS[0],cleared=game.completedStages.includes(0);
 return <section className="expedition-map" aria-label="Dungeon selection">
  <div className="expedition-heading"><button className="small-button" onClick={()=>command('visitVillage')}>‹ Atia</button><div><small>CHAPTER 01 · A PROMISE TO KEEP</small><h1>Aqua Cave</h1></div><span>{cleared?'CLEARED':'3 FLOORS'}</span></div>
  <div className="expedition-route" aria-label="Aqua Cave" style={{'--map-terrain':'url("/assets/map/journey-terrain.svg")'}}>
   <button className={'expedition-node sanctuary selected'+(cleared?' cleared':'')} style={{left:'45%',top:'48%'}} onClick={()=>command('selectStage',0)} aria-label="Select Aqua Cave" aria-pressed="true"><span className="node-marker">{cleared?'✓':'1'}</span><strong>Aqua Cave</strong><small>3 FLOORS · RESCUE PUFFY</small></button>
  </div>
  <article className="expedition-detail sanctuary"><span className="eyebrow">ONE EXPEDITION · THREE FLOORS</span><h2>{d.name}</h2><p>{d.description}</p><div className="expedition-features"><span>4 keys · 4 locks</span><span>Puffy on floor 3</span></div><div className="expedition-puzzle"><small>EXPLORE</small><strong>Find keys → open locks → descend</strong></div><button className="gold-button" onClick={()=>command('enterDungeon')}>{cleared?'Replay Aqua Cave':'Enter Aqua Cave'} ›</button><small className="expedition-save-note">Blue stairs lead down. Returning to Atia ends this expedition.</small></article>
 </section>;
}
