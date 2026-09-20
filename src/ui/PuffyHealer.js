export default function PuffyHealer({ game, command }) {
  const available=game.scene==='village'&&game.prologueComplete&&game.rescued.some(resident=>resident.id==='puffy');
  const healthy=game.playerHP>=game.playerMaxHP;
  const hero=game.activeCharacter==='buba'?'Buba':game.playerName||'Kotaro';
  return <div className={'puffy-healer '+(healthy?'is-healthy':'')}>
    <div className="puffy-care-portrait"><img src="/assets/atia/puffy-avatar.png" alt="Puffy, Atia’s healer"/><span aria-hidden="true">♥</span></div>
    <div className="puffy-care-copy">
      <p className="puffy-quote">“You brought me home. Now let me take care of you.”</p>
      <p>Visit Puffy after an expedition to restore your Axie’s health. Healing is always free.</p>
      <div className="puffy-health" aria-label={hero+' health'}><strong>{hero}</strong><span>{game.playerHP} / {game.playerMaxHP} HP</span></div>
      <div className="progress-track puffy-health-track"><span style={{width:Math.max(0,Math.min(100,game.playerHP/game.playerMaxHP*100))+'%'}}/></div>
      <button className="gold-button puffy-heal-button" disabled={!available||healthy} onClick={()=>command('healWithPuffy')}>
        <span aria-hidden="true">♥</span>{healthy?'Fully healed':'Restore health'}
      </button>
      <p className="puffy-care-status" role="status">{!available?'Rescue Puffy to unlock village healing.':healthy?'Full health. Ready for your next adventure.':'Puffy’s healing water restores '+(game.playerMaxHP-game.playerHP)+' HP.'}</p>
    </div>
  </div>;
}
