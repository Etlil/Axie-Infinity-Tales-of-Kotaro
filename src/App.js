import { useEffect, useRef, useState } from 'react';
import { createGame } from './main';
import { initialState, derive } from './game/state';
import { rankRewards, tentStages } from './data/story';
import WorldView from './ui/WorldView';
import PrologueUI,{BubaConversation} from './ui/PrologueUI';
import DodgeControls from './ui/DodgeControls';
import SettingsContent from './ui/SettingsContent';
import PuffyHealer from './ui/PuffyHealer';
import DungeonControls from './ui/DungeonControls';
import DungeonSelection from './ui/DungeonSelection';
import TownControls from './ui/TownControls';
import MainMenu,{SAVE_TIP} from './ui/MainMenu';
import SaveIndicator from './ui/SaveIndicator';
import GameLogo from './ui/GameLogo';
import { projectileDamage } from './entities/DodgeSystem';
import './App.css';
import './origins-theme.css';
import './mobile-game.css';
import './cinematic-game.css';
import './settings.css';
import './puffy-healer.css';
import './dungeon.css';
import './expedition-map.css';
import './town.css';
import './main-menu.css';
import './prologue.css';

function Icon({ name, size = 22 }) {
  const paths = {
    compass: <><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/></>,
    home: <><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/></>,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
    back: <path d="M20 12H5m6-6-6 6 6 6"/>,
    heart: <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 3 11 8 15 5-4 13-10 8-15Z"/>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>,
    tent: <><path d="m3 21 9-18 9 18H3Zm6 0 3-9 3 9M9 3l6 6"/></>,
    book: <path d="M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2Z"/>,
    team: <><circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 6"/></>,
    gift: <><path d="M3 9h18v5H3ZM5 14v7h14v-7M12 9v12"/><path d="M12 9C2 8 7-3 12 9c5-12 10-1 0 0Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="5"/></>,
    settings: <><path d="m9 3-.6 3-2.8 1-2.2 2.2L5 12l-1.6 2.8L5.6 17l2.8 1 .6 3h6l.6-3 2.8-1 2.2-2.2L19 12l1.6-2.8L18.4 7l-2.8-1-.6-3Z"/><circle cx="12" cy="12" r="3"/></>,
    play: <path d="m8 4 12 8-12 8Z"/>,
    sword: <path d="m14 3 7-1-1 7L9 20l-5-5ZM3 13l8 8M3 21l3-3"/>,
    horn: <path d="M5 20C5 12 10 12 17 3c2 9-1 16-7 18ZM8 16l6 2"/>,
    mouth: <><path d="M3 8c5-4 13-4 18 0l-2 10c-4 3-10 3-14 0ZM4 9h16M7 9l2 6 2-6m2 0 2 6 2-6"/></>,
    'body-back': <><path d="M3 19c0-7 4-11 9-11s9 4 9 11M7 9 5 3l6 5m3 0 5-5-1 7M3 19h18"/><path d="M9 19v-5h6v5"/></>,
    tail: <path d="M3 20c10 2 15-5 13-10-2-4-7-1-4 2 3 3 8-1 9-9-8 0-14 4-14 10 0 3-1 5-4 7Z"/>,
    shield: <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/>,
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/></>,
    expand: <path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"/>,
    coin: <><circle cx="12" cy="12" r="9"/><path d="m12 6 4 6-4 6-4-6Z"/></>,
    wood: <><path d="m3 16 12-12 6 6-12 12Z"/><ellipse cx="6" cy="19" rx="3" ry="3"/><path d="m9 15 7-7"/></>,
  };
  return <svg className={'game-icon icon-' + name} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}
function Portrait({ character = 'kotaro', className = '' }) {
  return <span className={'portrait ' + character + ' ' + className} aria-hidden="true"/>;
}
function GoldButton({ children, className = '', ...props }) {
  return <button className={'gold-button ' + className} {...props}>{children}<Icon name="arrow" size={18}/></button>;
}
function RankProgress({ game }) {
  return <><div className="rank-line"><span>Adventure Rank {game.level}</span><small>{game.nextRankXP ? game.rankXP + ' / ' + game.nextRankXP + ' XP' : 'MAX RANK'}</small></div><div className="progress-track"><span style={{ width: (game.nextRankXP ? Math.min(100, game.rankXP / game.nextRankXP * 100) : 100) + '%' }}/></div></>;
}
function Health({ name, hp, max, enemy = false, guard = 0 }) {
  return <div className={'health ' + (enemy ? 'enemy-health' : '')}><div><strong>{name}</strong><span>{hp} / {max}</span></div><div className="health-track"><span style={{ width: Math.max(0, hp / max * 100) + '%' }}/></div><small>{guard ? guard + ' SHIELD' : enemy ? 'OPPONENT' : 'YOUR AXIE'}</small></div>;
}

function AbilityCard({ card, index, disabled, selected, command }) {
  return <button className={'ability-card card-' + card.kind + (selected ? ' selected-attack' : '')} data-part={card.part}
    disabled={disabled} onFocus={() => command('selectAttack', index)} onClick={() => command('playCard', card.id)} aria-keyshortcuts={String(index + 1)}>
    <span className="ability-part">{card.guard?'DEFEND':'ATTACK'}<kbd>{index + 1}</kbd></span>
    <span className="ability-top"><span className={'ability-symbol'+(card.guard?' shield-stat':'')} aria-label={card.guard?card.guard+' shield':undefined}>{card.guard?<b>{card.guard}</b>:<Icon name="sword"/>}</span><span>{card.damage}<small>DMG</small></span></span>
    <strong>{card.name}</strong><small className="ability-description">{card.description}</small>
    <span className="ability-label">{card.guard ? card.guard + ' SHIELD' : card.heal ? 'HEAL ' + card.heal : card.label}</span>
  </button>;
}

const heroNameFor=(id,name)=>id==='buba'?'Buba':name||'Kotaro';
function Panel({ game, command, close, panel, fullscreen, showHelp, showSettings, resetSave }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.querySelector('button')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const items = [...dialog.current.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (previous?.isConnected) previous.focus(); };
  }, [close]);
  const titles = { rewards: "Buba’s tent", team: 'Your companions', journal: 'The Atia journal', amulet: 'The moon pendant', help: 'Traveler’s guide', pause: 'Game paused', settings: 'Settings', healer: 'Puffy’s healing spring', fountain:'Save fountain' };
  return <div className="modal-backdrop" onClick={close}><section ref={dialog} className={'panel panel-' + panel} role="dialog" aria-modal="true" aria-labelledby="panel-title" onClick={event => event.stopPropagation()}>
    <button className="icon-button close-panel" onClick={close} aria-label="Close panel"><Icon name="close"/></button>
    <p className="eyebrow">{panel === 'rewards' ? 'A HOME, ONE RANK AT A TIME' : 'ATIA • CHAPTER ONE'}</p><h2 id="panel-title">{titles[panel]}</h2>
    <div className="panel-body">
    {panel === 'pause' && <div className="pause-actions"><p>Take your time. The encounter will wait for you.</p><GoldButton onClick={close}><Icon name="play"/>Resume encounter</GoldButton><button className="small-button" onClick={showSettings}><Icon name="settings"/>Settings</button><button className="small-button" onClick={showHelp}><Icon name="book"/>How to play</button><button className="text-button" aria-label="Retreat from encounter" onClick={() => command('retreat')}>{game.tutorial ? 'Return to the clearing' : 'Return to Atia'}</button></div>}
    {panel === 'settings' && <SettingsContent command={command} saveAvailable={game.saveAvailable} activeSlot={game.activeSlot} inMenu={game.scene==='menu'} fullscreen={fullscreen} showHelp={showHelp} resetSave={resetSave} returnToMenu={()=>command('returnToMenu')} retrySave={()=>command('retrySave')}/>}
    {panel === 'fountain' && <><div className="fountain-emblem" aria-hidden="true">★</div><p>A quiet light rests in the water. Save your journey here and return to this fountain next time you load your adventure.</p><p className="muted">Slot {game.activeSlot} · {heroNameFor(game.activeCharacter,game.playerName)} · Adventure Rank {game.level}</p><GoldButton onClick={()=>command('saveAtFountain')}>Save at fountain</GoldButton>{game.saveKind==='fountain'&&<p className={'fountain-status '+(game.saveStatus==='failed'?'is-failed':'')} role="status">{game.saveStatus==='failed'?'Save failed. Keep this tab open and try again.':'Adventure saved. Your return point is now this fountain.'}</p>}<p className="muted">Your story and rewards also save automatically as you play. Watch for the star in the lower-left corner.</p></>}
    {panel === 'healer' && <PuffyHealer game={game} command={command}/>}
    {panel === 'help' && <button className="small-button guide-fullscreen" onClick={fullscreen}><Icon name="expand"/>Toggle fullscreen</button>}
    {panel === 'rewards' && <>
      <details className="buba-guidance"><summary>Where should I go next?</summary><p>“Start with the nearest Aqua Cave, {game.playerName||'Kotaro'}. Take the gate northeast of the well, then choose the first dungeon on your map. Look for clues to our friends. I’ll be here if you need me.”</p></details>
      <div className="tent-summary"><img src="/assets/buba/avatar.png" alt="Buba"/><div><strong>{tentStages[game.tentStage]}</strong><p>{game.tentStage === 2 ? 'A real roof. A warm light. A place to belong.' : 'A few supplies today. A brighter village tomorrow.'}</p><RankProgress game={game}/></div></div>
      <div className="tent-tiers">{['Rank 1 · Shelter', 'Rank 3 · Mended tent', 'Rank 5 · Lodge'].map((s, i) => <span key={s} className={i <= game.tentStage ? 'reached' : ''}><Icon name={i === 2 ? 'home' : 'tent'} size={18}/>{s}</span>)}</div>
      <p className="muted">Clear encounters to earn Adventure XP. Claim each rank’s supplies once; Buba improves his home as your rank grows.</p>
      <div className="reward-list">{rankRewards.map(reward => {
        const claimed = game.claimedRewards.includes(reward.rank), locked = game.level < reward.rank;
        return <div className={'reward-row ' + (claimed ? 'claimed' : '')} key={reward.rank}><span className="rank-medal">{reward.rank}</span><div><strong>{reward.title}</strong><small><Icon name="coin" size={14}/>{reward.coins} <Icon name="wood" size={14}/>{reward.wood}</small></div><button className={locked || claimed ? 'small-button' : 'small-button claim-button'} disabled={locked || claimed} onClick={() => command('claimReward', reward.rank)} aria-label={claimed ? 'Rank ' + reward.rank + ' claimed' : 'Claim rank ' + reward.rank}>{claimed ? <><Icon name="check" size={16}/>Claimed</> : locked ? <><Icon name="lock" size={14}/>Rank {reward.rank}</> : 'Claim'}</button></div>;
      })}</div>
    </>}
    {panel === 'team' && <><p className="muted">Choose who leads the next expedition. Slash deals 20 damage. Bash deals 5 damage and grants 20 shield.</p><div className="team-grid">{['kotaro', 'buba'].map(id => <article className={'hero-card ' + (game.activeCharacter === id ? 'chosen' : '')} key={id}><Portrait character={id}/><span className="eyebrow">{id === 'kotaro' ? 'THE WHITE WANDERER' : 'THE LAST VILLAGER'}</span><h3>{id === 'kotaro' ? 'Kotaro' : 'Buba'}</h3><p>{id === 'kotaro' ? 'A swift swordsman with a rushing slash and a guarded bash.' : 'A brave village guardian with a sword and shield.'}</p><div className="hero-stats"><span><Icon name="heart" size={16}/>{id === 'kotaro' ? 100 : 110} HP</span><span><Icon name="spark" size={16}/>{'Slash / Bash'}</span></div><button className="small-button" disabled={game.activeCharacter === id || !game.unlockedCharacters.includes(id)} onClick={() => command('selectCharacter', id)}>{!game.unlockedCharacters.includes(id) ? 'Meet Buba first' : game.activeCharacter === id ? 'Leading the journey' : 'Choose ' + (id === 'kotaro' ? 'Kotaro' : 'Buba')}</button></article>)}</div></>}
    {panel === 'amulet' && <><div className="amulet-art"><Icon name="spark" size={72}/></div><blockquote>“It cannot mend everything. But it can bring someone back.”<cite>— Buba</cite></blockquote><p>Buba found this moon pendant at the bottom of the village well beside a torn cloth marked “Help Us.” Its light reacts to corruption. Weaken a corrupted guardian, then let the pendant reach them.</p><div className="journal-note"><Icon name="heart"/><div><strong>{game.rescued.length ? 'Puffy is home' : 'Your first rescue awaits'}</strong><p>{game.rescued.length ? 'Puffy heals you for free at the village spring. Puffy’s blessing also grants 5% more dodge time.' : 'Explore all three floors of Aqua Cave and reach Puffy’s chamber. Bring a villager back to Atia.'}</p></div></div></>}
    {panel === 'journal' && <div className="journal-pages"><span className="journal-date">SIX MONTHS AFTER THE RAID</span><h3>The village that waited</h3><p>Nightmare Axies raided Atia six months ago. Almost everyone became corrupted. Some now serve the enemy; others wander alone, lost in what remains of their old lives.</p><p>Buba was away adventuring when Atia fell. He came back to empty homes and built a small tent from what he could salvage. When a white wanderer arrived, fear made him draw his sword.</p><h3>A promise in the clearing</h3><p>After the battle, Buba found the courage to trust again. He gave you the pendant he found in the well and asked for help restoring Atia, one home and one friend at a time.</p><div className="journal-note"><Icon name="compass"/><div><strong>{game.rescued.length ? 'Chapter one complete' : 'A promise to keep'}</strong><p>{game.rescued.length ? 'Puffy is safe. Keep exploring to grow your Adventure Rank and improve Buba’s home.' : 'Enter the village gate, clear the dungeon chambers, and reverse Puffy’s corruption.'}</p></div></div></div>}
    {panel === 'help' && <><ol className="guide-list"><li><strong>Play an ability.</strong> Time freezes on your turn. Select with A / D and press X, tap a card, or use 1 / 2. Slash deals 20 damage; Bash deals 5 damage and grants 20 shield.</li><li><strong>Watch, then dodge.</strong> Move with A / D or arrows. Jump with Space / W / Up; dash with Shift. On mobile, hold the movement arrows and tap Jump or Dash together. Use the raised ledges when fighting Puffy, avoid the actual projectiles, and use your brief dash invulnerability to cross attacks.</li><li><strong>Bring Atia back.</strong> The village gate opens your level map. Select a dungeon, then walk with WASD, arrows, or the touch pad. Touching a slime starts a battle. Solve each dungeon’s puzzle and clear its encounters to unlock the next level. Use E or the action button beside water valves. Claim Adventure Rank rewards at Buba’s tent. Switch companions from the Team menu.</li><li><strong>Use Buba’s amulet.</strong> Defeat the corrupted lagoon guardian, then choose “Use the amulet” to rescue Puffy.</li></ol><p className="journal-note">Your story, companions, rewards, and rank save automatically to your chosen slot in this browser. Watch for the star at the lower left. Save at the town fountain to set your return point. Unfinished expeditions restart from town; the prologue resumes at your story checkpoint.</p><p className="muted">Walk around Atia with WASD, arrows, or the touch pad. Press F or use the interaction button beside a building. Tap Buba’s tent, Puffy, or Adventure to walk to that destination automatically. Touch controls work in portrait and landscape.</p></>}
    </div>
  </section></div>;
}

export default function App() {
  const mount = useRef(null), controller = useRef(null);
  const [game, setGame] = useState(() => derive(initialState()));
  const [help, setHelp] = useState(false);
  const [paused, setPaused] = useState(false);
  const [settings, setSettings] = useState(false);
  const [fullscreenNote, setFullscreenNote] = useState('');
  useEffect(() => {
    const instance = createGame(mount.current, setGame);
    controller.current = instance;
    return () => { instance.destroy(); controller.current = null; };
  }, []);
  const panel = help ? 'help' : settings ? 'settings' : paused ? 'pause' : game.panel;
  useEffect(() => {
    controller.current?.command('setPaused', Boolean(panel));
    controller.current?.command('setInputEnabled', !panel);
  }, [panel]);
  useEffect(() => {
    const hide = () => { if (document.hidden && ['combat','intro','dialogue'].includes(game.scene)) setPaused(true); };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [game.scene]);
  const command = (action, payload) => {
    if (['retreat','returnToMenu','selectSlot'].includes(action)) {
      setHelp(false); setPaused(false); setSettings(false);
      controller.current?.command('setPaused', false);
      controller.current?.command('setInputEnabled', true);
    }
    return controller.current?.command(action, payload);
  };
  const resetSave = () => {
    const result = command('resetSave');
    if (result?.ok) { setHelp(false); setPaused(false); setSettings(false); setFullscreenNote(''); }
    return result;
  };
  const closePanel = useRef(null);
  closePanel.current = () => {
    if (help) setHelp(false);
    else if (settings) setSettings(false);
    else { setPaused(false); command('closePanel'); }
  };
  const stableClose = useRef(() => closePanel.current()).current;
  const combat = game.scene === 'combat', dodge = combat && game.phase === 'DODGE_PHASE';
  const story = ['intro', 'dialogue'].includes(game.scene);
  const heroName = game.activeCharacter === 'buba' ? 'Buba' : game.playerName || 'Kotaro';
  const fullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else setFullscreenNote('Use your browser menu to add Atia to your home screen.'); }
    catch { setFullscreenNote('Fullscreen is unavailable here. The game still works in your browser.'); }
  };
  return <main className={'game-app scene-' + game.scene + (game.dungeonRun ? ' in-dungeon' : '') + (story ? ' story-scene' : '') + (dodge ? ' is-dodging' : '') + (combat && ['PLAYER_FOCUS','PLAYER_TURN'].includes(game.phase) ? ' is-choosing' : '')} data-scene={game.scene} data-phase={game.phase} data-enemy={game.enemy?.id} style={{ '--village-image': 'url("/assets/atia/village.png")', '--kotaro-walk-image':'url("/assets/kotaro/walk-original.png")', '--kotaro-image': 'url("/assets/atia/kotaro-sheet.png")', '--buba-image': 'url("/assets/buba/avatar.png")', '--arena-image': 'url("/assets/atia/' + (game.enemy?.id === 'buba' || game.tutorial ? 'buba-arena.png' : game.roomIndex === 2 ? 'lagoon-arena.jpg' : 'forest-arena.jpg') + '")' }}>
    <div className="world-fill" aria-hidden="true"/>
    <WorldView scene={game.scene} walkableTown><div className="game-mount" ref={mount} aria-label="Atia game world"/>
    </WorldView>
    <div className="world-shade" aria-hidden="true"/>
    {!story && game.scene!=='menu' && !game.loading && <header className={'game-header ' + (combat ? 'battle-header' : '')}>
      {combat ? <>
        <button className="icon-button pause-control" aria-label="Pause encounter" onClick={() => setPaused(true)}><Icon name="pause"/></button>
        <Health name={heroName} hp={game.playerHP} max={game.playerMaxHP} guard={game.guard}/>
        <span className="turn-badge"><small>TURN</small>{String(game.turn).padStart(2, '0')}</span>
        <Health enemy name={game.enemy?.name || 'Opponent'} hp={game.enemyHP} max={game.enemy?.maxHP || 100}/>
      </> : <>
        <button className="profile-block" onClick={() => command('openPanel', 'team')} aria-label="Open companions"><span className="profile-avatar"><Portrait character={game.activeCharacter}/><b>{game.level}</b></span><span className="profile-copy"><strong>{heroName}<small>ATIA’S WANDERER</small></strong><RankProgress game={game}/></span></button>
        <div className="location-title"><span>THE WORLD OF LUNACIA</span><strong>{game.scene === 'map' ? 'The forest trail' : 'Atia Village'}</strong></div>
        <div className="resources"><span title="Coins"><Icon name="coin" size={18}/>{game.coins}</span><span title="Timber"><Icon name="wood" size={18}/>{game.wood}</span><span title="Essence"><Icon name="spark" size={18}/>{game.essence}</span></div>
      </>}
      <div className="utility-buttons">{!combat && <button className="icon-button" aria-label="Settings" onClick={() => setSettings(true)}><Icon name="settings" size={19}/></button>}<button className="icon-button" disabled={combat} aria-label="How to play" onClick={() => setHelp(true)}><Icon name="book" size={19}/></button></div>
    </header>}
    {story && !game.loading && <button className="icon-button story-settings" aria-label="Settings" onClick={() => setSettings(true)}><Icon name="settings"/></button>}
    {game.loading && <section className="loading-screen"><span className="eyebrow">A NEW STORY IN LUNACIA</span><GameLogo/><p>{game.assetError ? 'An asset could not load. Please refresh to try again.' : 'Finding the way home…'}</p><div className="progress-track"><span style={{ width: (game.loadProgress || 0) + '%' }}/></div><p className="loading-save-tip">{SAVE_TIP}</p></section>}
    {!game.loading && game.scene==='menu' && <MainMenu game={game} command={command}/>}
    {!game.loading && game.scene === 'intro' && <PrologueUI game={game} command={command} paused={Boolean(panel)}/>}
    {!game.loading && game.scene === 'dialogue' && <BubaConversation game={game} command={command} paused={Boolean(panel)}/>}
    {!game.loading && game.scene === 'village' && <TownControls game={game} command={command}/>}
    {!game.loading && game.scene === 'map' && <DungeonSelection game={game} command={command}/>}
    {!game.loading && game.scene === 'dungeon' && <DungeonControls game={game} command={command}/>}
    {!game.loading && combat && <>
      {['PLAYER_FOCUS','PLAYER_TURN'].includes(game.phase) && <><div className="cinematic-matte" aria-hidden="true"/><div className="turn-prompt"><span>TIME HELD</span><strong>Your move.</strong><small><kbd>X</kbd> CONFIRM <i/> A / D SELECT</small></div></>}
      <div className="encounter-heading"><span className="eyebrow">{game.tutorial ? 'PROLOGUE · A FRIGHTENED GUARDIAN' : game.roomIndex === 2 ? 'THE LAGOON GUARDIAN' : 'BEYOND THE GATE'}</span><h1>{game.tutorial ? 'Earn Buba’s trust' : game.enemy?.location}</h1>{game.enemyCard && !['PLAYER_TURN','PLAYER_FOCUS'].includes(game.phase) && <span className={'enemy-intent ' + (game.enemyCard.ultimate ? 'ultimate-intent' : '')}><Icon name={game.enemyCard.ultimate ? 'spark' : 'sword'} size={15}/>{game.enemyCard.name} · {projectileDamage(game.enemyCard.damage)} / HIT</span>}</div>
      <section className={'battle-controls ' + (dodge ? 'dodging' : '')} aria-label="Battle controls">
        <div className="battle-status"><strong>{dodge ? game.warningActive ? 'DANGER — MOVE NOW' : 'GET READY TO DODGE' : game.phase === 'PLAYER_TURN' ? 'YOUR TURN' : game.phase === 'RESOLVE_DODGE' ? game.lastDamage ? 'STAY IN THE FIGHT' : 'SAFE LANDING' : 'IN ACTION'}</strong><span role="status">{game.message}</span></div>
        {dodge ? <DodgeControls game={game} command={command}/> : <div className="ability-cards two-attacks">{game.cards.map((card, i) => <AbilityCard key={card.id} card={card} index={i} selected={game.selectedAttack===i} disabled={game.phase !== 'PLAYER_TURN'} command={command}/>)}</div>}
      </section>
    </>}
    {!game.loading && game.scene === 'victory' && <section className="result-card"><span className="result-emblem">{game.roomIndex === 2 ? <img src="/assets/atia/puffy-avatar.png" alt="Puffy"/> : <Icon name={game.result?.kind === 'purify' ? 'spark' : 'check'} size={34}/>}</span><p className="eyebrow">{game.result?.kind === 'purify' ? 'THE AMULET IS GLOWING' : game.result?.kind === 'rescued' ? 'A LIGHT RETURNS TO ATIA' : 'THE PATH IS CLEAR'}</p><h1>{game.result?.kind === 'purify' ? 'There’s still a light inside.' : game.result?.kind === 'rescued' ? 'Welcome home, Puffy.' : game.result?.kind === 'encounter' ? 'The path ahead opens.' : 'Dungeon cleared!'}</h1><p>{game.result?.kind === 'purify' ? 'The nightmare is weakened. Use Buba’s amulet to bring Puffy back.' : game.result?.kind === 'rescued' ? 'The corruption fades. Puffy returns as Atia’s healer, offering free healing in the village and 5% more time to dodge.' : game.result?.kind === 'encounter' ? 'Keep exploring. Solve the chamber puzzle and find the remaining enemies.' : 'Aqua Cave is clear. Return to Atia or replay the cave for supplies.'}</p>{game.result?.xp && <div className="result-rewards"><span><Icon name="spark"/>+{game.result.xp} XP</span><span><Icon name="coin"/>+{game.result.coins}</span><span>Rank {game.level}</span></div>}{game.result?.kind === 'purify' ? <GoldButton onClick={() => command('purify')}>Use the amulet</GoldButton> : <><GoldButton onClick={() => command(game.result?.kind === 'rescued' ? 'visitVillage' : 'returnMap')}>{game.result?.kind === 'rescued' ? 'Bring Puffy home' : game.result?.kind === 'encounter' ? 'Continue journey' : 'Back to level map'}</GoldButton><button className="text-button" onClick={() => command('visitVillage')}>Return to Atia</button></>}</section>}
    {!game.loading && game.scene === 'defeat' && <section className="result-card"><span className="result-emblem"><Icon name="heart" size={34}/></span><p className="eyebrow">TAKE A BREATH, WANDERER</p><h1>Your story isn’t over.</h1><p>{game.tutorial ? 'Buba is frightened. Jump over his crossing sword dashes and watch for the mushroom’s return.' : 'Rest a moment. Return with full health and try this encounter again.'}</p><GoldButton onClick={() => command('retry')}>Try again</GoldButton><button className="text-button" onClick={() => command('retreat')}>{game.tutorial ? 'Back to the clearing' : 'Return to Atia'}</button></section>}
    {!game.saveAvailable && !game.activeSlot && <div className="save-notice" role="status">Browser storage is unavailable. Progress will last for this session.</div>}
    <SaveIndicator game={game}/>
    {fullscreenNote && <button className="save-notice" onClick={() => setFullscreenNote('')}>{fullscreenNote} ×</button>}
    {panel && <Panel key={panel} game={game} command={command} close={stableClose} panel={panel} fullscreen={fullscreen} showHelp={() => setHelp(true)} showSettings={() => setSettings(true)} resetSave={resetSave}/>}
  </main>;
}
