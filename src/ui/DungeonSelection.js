import {DUNGEONS} from '../game/dungeonLayout';
const points=[[19,67],[49,29],[80,57]];
export default function DungeonSelection({game,command}){
  const selected=DUNGEONS[game.selectedStage]||DUNGEONS[0];
  const cleared=game.completedStages.includes(selected.id);
  return <section className="expedition-map" aria-label="Dungeon selection">
    <div className="expedition-heading"><button className="small-button" onClick={()=>command('visitVillage')}>‹ Atia</button><div><small>CHAPTER 01 · A PROMISE TO KEEP</small><h1>Beyond the village gate</h1></div><span>{game.completedStages.length} / 3 cleared</span></div>
    <div className="expedition-route" aria-label="Choose a dungeon">
      <span className="map-region region-grove" aria-hidden="true"/><span className="map-region region-quarry" aria-hidden="true"/><span className="map-region region-water" aria-hidden="true"/>
      <svg className="expedition-path" viewBox="0 0 800 360" preserveAspectRatio="none" aria-hidden="true"><path d="M152 241 C 65 90 285 35 392 104 S 750 100 640 205" className="path-border"/><path d="M152 241 C 65 90 285 35 392 104 S 750 100 640 205" className="path-sand"/><path d="M152 241 C 65 90 285 35 392 104 S 750 100 640 205" className="path-dots"/></svg>
      {DUNGEONS.map((d,i)=>{
        const locked=i>game.unlockedStage,done=game.completedStages.includes(i);
        return <button key={d.id} className={'expedition-node '+d.theme+(game.selectedStage===i?' selected':'')+(done?' cleared':'')} style={{left:points[i][0]+'%',top:points[i][1]+'%'}} disabled={locked} aria-label={'Level '+(i+1)+': '+d.name} aria-pressed={game.selectedStage===i} onClick={()=>command('selectStage',i)}>
          <span className="node-marker">{locked?'◆':done?'✓':i+1}</span><strong>{d.name}</strong><small>{locked?'CLEAR LEVEL '+i:done?'CLEARED':i===2?'RESCUE PUFFY':'EXPLORE'}</small>
        </button>;
      })}
    </div>
    <article className={'expedition-detail '+selected.theme} aria-live="polite"><span className="eyebrow">DUNGEON 0{selected.id+1} · {cleared?'REPLAY AVAILABLE':'EXPEDITION'}</span><h2>{selected.name}</h2><p>{selected.description}</p><div className="expedition-features"><span>3 chambers</span><span>{selected.encounters.length} encounters</span></div><div className="expedition-puzzle"><small>PUZZLE</small><strong>{selected.puzzleName}</strong></div><button className="gold-button" onClick={()=>command('enterDungeon')}>{cleared?'Replay dungeon':'Enter dungeon'} <span aria-hidden="true">›</span></button><small className="expedition-save-note">{cleared?'Replay for extra supplies.':selected.id===2?'Puffy waits in the last chamber.':'Clear this dungeon to unlock the next.'}</small></article>
  </section>;
}
