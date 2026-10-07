export default function AttackTutorial({cards,command}){
  return <section className="attack-lesson" aria-labelledby="attack-lesson-title">
    <h2 id="attack-lesson-title">Your first attack</h2>
    <p>Time waits while you choose. Play one card each turn.</p>
    <div className="attack-lesson-cards">{cards.map(card=><div key={card.id}>
      <strong>{card.name}</strong>
      <span>{card.damage} damage{card.guard?` + ${card.guard} shield`:''}</span>
      <small>{card.guard?'Shield absorbs damage during the next dodge phase, then resets.':'A fast sword strike for more damage.'}</small>
    </div>)}</div>
    <p>Select with <b>A / D</b>, then press <b>X</b>. Or press <b>1 / 2</b> or tap a card. Get ready to dodge after your attack!</p>
    <button className="gold-button" onClick={()=>command('finishAttackLesson')}>Got it · choose a card <kbd>X</kbd></button>
  </section>;
}
