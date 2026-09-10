import { useEffect, useRef, useState } from 'react';
import { createGame } from './main';
import './App.css';

const INITIAL_STATE = { scene: 'map', phase: '', playerHP: 100, playerMaxHP: 100, enemy: null, enemyHP: 0, roomIndex: 0, turn: 1, rescued: [], bonus: 0, lane: 1, dangerLane: null, dodgeRemaining: 0, message: 'Every great adventure begins with a small step.', cards: [] };

function Icon({ name, size = 20 }) {
  const paths = {
    compass: <><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/></>,
    home: <><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/></>,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
    leaf: <path d="M20 4c-9-2-17 3-15 10 3 7 15 3 15-10ZM4 21l11-12M8 16v-5m0 5h5"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    water: <><path d="M12 2S5 10 5 14a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 14c0 2 1 3 3 3"/></>,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>,
    flag: <path d="M5 22V3m0 0c5-5 9 5 15 0v11c-6 5-10-5-15 0"/>,
    book: <path d="M12 5v16M3 3c4-1 7 0 9 2 2-2 5-3 9-2v16c-4-1-7 0-9 2-2-2-5-3-9-2Z"/>,
    check: <path d="m5 12 4 4L19 6"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
    sword: <path d="m14 3 7-1-1 7L9 20l-5-5ZM3 13l8 8M3 21l3-3"/>,
    moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}

function AxiePortrait({ aqua = false, small = false }) {
  const color = aqua ? '#88cec2' : '#f0bb61';
  return <svg className={`axie-portrait ${small ? 'small' : ''}`} viewBox="0 0 240 185" fill="none" aria-hidden="true">
    <ellipse cx="120" cy="160" rx="70" ry="10" fill="#24534a" opacity=".12"/>
    {aqua ? <><path d="m68 81-34-23 11 42 26 4m99-23 34-23-11 42-26 4" fill="#67adab" stroke="#356c63" strokeWidth="3"/><path d="m100 57 1-29 18 20 20-24 2 35" fill="#c7e4bb" stroke="#356c63" strokeWidth="3"/></> : <><rect x="43" y="91" width="33" height="47" rx="12" fill="#957046" stroke="#775a3f" strokeWidth="3"/><path d="m97 62-11-35c19 0 25 14 27 28m0-4c0-23 17-25 29-23-3 16-12 25-29 23" fill="#7e9d59" stroke="#486345" strokeWidth="3"/></>}
    <path d="M56 110c0-39 25-57 65-57 39 0 65 22 65 59 0 31-28 48-65 48-39 0-65-17-65-50Z" fill={color} stroke={aqua ? '#356c63' : '#947047'} strokeWidth="3"/>
    <ellipse cx="98" cy="86" rx="22" ry="12" fill="white" opacity=".14"/>
    <ellipse cx="80" cy="154" rx="15" ry="8" fill={color} stroke={aqua ? '#356c63' : '#947047'} strokeWidth="3"/><ellipse cx="158" cy="154" rx="15" ry="8" fill={color} stroke={aqua ? '#356c63' : '#947047'} strokeWidth="3"/>
    <ellipse cx="99" cy="112" rx="5" ry="7" fill="#304638"/><ellipse cx="146" cy="112" rx="5" ry="7" fill="#304638"/><circle cx="100" cy="110" r="1.7" fill="white"/><circle cx="147" cy="110" r="1.7" fill="white"/>
    <path d="M117 124q5 6 10 0" stroke="#304638" strokeWidth="2.5" strokeLinecap="round"/><ellipse cx="85" cy="123" rx="9" ry="4" fill="#dd8f88" opacity=".6"/><ellipse cx="160" cy="123" rx="9" ry="4" fill="#dd8f88" opacity=".6"/>
    {!aqua && <path d="m63 135 21-4 5 24-22-5Z" fill="#78906a" stroke="#486345" strokeWidth="2"/>}
    {aqua && <><path d="m184 125 19-8-5 20-17-1" fill="#67adab" stroke="#356c63" strokeWidth="3"/><circle cx="46" cy="33" r="6" stroke="#80b9b1" strokeWidth="2"/><circle cx="184" cy="26" r="4" stroke="#80b9b1" strokeWidth="2"/></>}
  </svg>;
}

const TITLES = {
  map: ['THE WORLD IS WAITING', 'Small steps. Big adventures.', 'Explore a little further. Bring someone home.'],
  dungeon: ['CHAPTER 01 · MOMO’S LAGOON', 'Into the quiet wilds.', 'Follow the path through the lagoon. Momo is waiting at the end.'],
  combat: ['CHAPTER 01 · MOMO’S LAGOON', 'A little courage goes a long way.', 'Choose your card. Watch the waves. Find your opening.'],
  victory: ['A NEW FRIEND FOUND', 'Every rescue is a new beginning.', 'Some journeys end with treasure. This one ends with a friend.'],
  village: ['HOME, SWEET HOME', 'Stronger, together.', 'A small village with room for a few more friends.'],
  defeat: ['THE JOURNEY ISN’T OVER', 'Even brave Axies need a rest.', 'Take a breath, find your footing, and try again.'],
};

export default function App() {
  const mount = useRef(null);
  const controller = useRef(null);
  const [game, setGame] = useState(INITIAL_STATE);
  const [help, setHelp] = useState(false);
  const closeHelp = useRef(null);
  useEffect(() => {
    const instance = createGame(mount.current, setGame);
    controller.current = instance;
    return () => { instance.destroy(); controller.current = null; };
  }, []);
  useEffect(() => {
    controller.current?.command('setInputEnabled', !help);
    if (!help) return undefined;
    const previousFocus = document.activeElement;
    closeHelp.current?.focus();
    const keydown = event => {
      if (event.key === 'Escape') setHelp(false);
      if (event.key === 'Tab') { event.preventDefault(); closeHelp.current?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previousFocus?.focus(); };
  }, [help]);
  const command = (action, payload) => controller.current?.command(action, payload);
  const rescued = game.rescued?.length || 0;
  const title = TITLES[game.scene] || TITLES.map;
  const isCombat = game.scene === 'combat';
  const isDodge = isCombat && game.phase === 'DODGE_PHASE';
  const safeNavigation = ['map', 'village', 'victory', 'defeat'].includes(game.scene);
  const sceneLabels = { map: 'World map', dungeon: 'The lagoon path', combat: 'Encounter', victory: 'A friend, rescued', village: 'Your village', defeat: 'A moment to rest' };
  const healthPercent = Math.max(0, Math.min(100, game.playerHP / game.playerMaxHP * 100));
  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="#explore" onClick={event => { event.preventDefault(); if (safeNavigation) command('returnMap'); }} aria-label="Axie Dungeons home"><span className="brand-mark"><Icon name="leaf" size={26}/></span><span className="brand-name">axie<span>dungeons</span></span></a>
      <nav className="main-nav" aria-label="Main navigation"><button className={game.scene !== 'village' ? 'nav-item active' : 'nav-item'} disabled={!safeNavigation} onClick={() => command('returnMap')}><Icon name="compass" size={18}/>Explore</button><button className={game.scene === 'village' ? 'nav-item active' : 'nav-item'} disabled={!safeNavigation} onClick={() => command('visitVillage')}><Icon name="home" size={18}/>My village<span className="nav-count">{rescued}</span></button></nav>
      <div className="header-right"><button className="help-button" aria-label="How to play" onClick={() => setHelp(true)} disabled={isCombat}><Icon name="book" size={17}/><span>How to play</span></button><span className="prototype-badge"><span/>PROTOTYPE</span></div>
    </header>
    <main id="explore">
      <section className="intro"><div><p className="eyebrow"><span className="tiny-star">✦</span>{title[0]}</p><h1>{title[1]}</h1><p className="intro-copy">{title[2]}</p></div><div className="chapter-stamp"><Icon name="flag" size={20}/><span>THE FIRST RESCUE<small>Chapter 01 of your story</small></span></div></section>
      <div className={`adventure-layout ${isCombat ? 'in-combat' : ''}`}>
        <section className="world-card" aria-label={sceneLabels[game.scene]}>
          <div className="world-toolbar"><div><Icon name={game.scene === 'village' ? 'home' : 'compass'} size={17}/><span>{sceneLabels[game.scene]}</span><span className="toolbar-divider"/><span className="region-name">Lunacia</span></div><span className="world-status"><span className="status-dot"/>{isCombat ? `Turn ${game.turn}` : game.scene === 'map' ? '1 dungeon discovered' : game.scene === 'dungeon' ? `Room ${game.roomIndex + 1} of 3` : 'A little closer to home'}</span></div>
          <div className="canvas-wrapper"><div ref={mount} className="game-mount" aria-label="Interactive Axie adventure game"/>{game.scene === 'map' && <><div className="map-caption"><span>THE VERDANT SHORES</span><p>A corner of Lunacia, waiting to be explored.</p></div><div className="compass-rose" aria-hidden="true"><span>N</span><Icon name="compass" size={37}/></div></>}</div>
          <div className={`world-message ${isDodge ? 'dodge-message' : ''}`} role="status"><span className="message-icon"><Icon name={isDodge ? 'water' : game.scene === 'victory' ? 'heart' : 'spark'} size={17}/></span><span>{game.message || 'Your next adventure is just a small step away.'}</span>{game.scene === 'map' && <span className="map-hint">Click a destination to explore<Icon name="arrow" size={15}/></span>}</div>
          {isCombat && <div className="combat-controls"><div className="control-heading"><span>{isDodge ? 'FIND A SAFE LANE' : game.phase === 'PLAYER_TURN' ? 'YOUR TURN · CHOOSE A CARD' : 'WATCH YOUR OPPONENT'}</span><span>{isDodge ? 'A / S / D or arrow keys' : 'One card per turn'}</span></div>
            <div className="lane-controls" aria-label="Dodge lanes">{['Left', 'Center', 'Right'].map((label, index) => <button key={label} disabled={!isDodge} onClick={() => command('moveLane', index)} className={`lane-button ${game.lane === index ? 'selected' : ''} ${isDodge && game.dangerLane === index ? 'danger' : ''}`} aria-pressed={game.lane === index}><kbd>{['A', 'S', 'D'][index]}</kbd>{label}{isDodge && game.dangerLane === index ? <Icon name="water" size={16}/> : game.lane === index ? <span className="lane-dot"/> : null}</button>)}</div>
            <div className="ability-cards">{game.cards.map((card, index) => <button key={card.id} className={`ability-card ability-${index}`} disabled={game.phase !== 'PLAYER_TURN'} onClick={() => command('playCard', card.id)}><span className="ability-icon"><Icon name={['leaf', 'sword', 'moon'][index]} size={25}/></span><span className="ability-copy"><strong>{card.name}</strong><small>{card.description || 'A trusty traveler attack.'}</small></span><span className="ability-damage">{card.damage}<small>DMG</small></span><kbd>{index + 1}</kbd></button>)}</div>
          </div>}
        </section>
        <aside className="detail-panel">
          {['map', 'dungeon'].includes(game.scene) && <><div className="detail-heading"><span className="eyebrow">{game.scene === 'map' ? 'YOUR NEXT ADVENTURE' : 'ON THE TRAIL'}</span><span className="chapter-number">01</span></div><div className="momo-art"><span className="art-type"><Icon name="water" size={13}/>AQUA</span><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><AxiePortrait aqua/><span className="art-caption">A familiar face, a little lost.</span></div><div className="dungeon-heading"><h2>Momo’s Lagoon</h2><span className="difficulty"><i/><i/><i className="faded"/> Gentle</span></div><p className="detail-description">Past the willow trees and quiet waters, a friend needs your help. Follow the ripples. Find Momo.</p><div className="dungeon-facts"><span><Icon name="flag" size={15}/>3 rooms</span><span><Icon name="clock" size={15}/>~3 min</span><span><Icon name="sword" size={15}/>1 boss</span></div><div className="rescue-reward"><span className="reward-icon"><Icon name="spark" size={23}/></span><div><span>RESCUE REWARD</span><strong>+5% Dodge Accuracy</strong><small>A little help from a new friend.</small></div></div>{game.scene === 'dungeon' && <div className="room-progress">{['Reedbank', 'Willow Bend', 'Momo'].map((room, index) => <span key={room} className={index <= game.roomIndex ? 'reached' : ''}>{index < game.roomIndex ? <Icon name="check" size={13}/> : <b>{index + 1}</b>}{room}</span>)}</div>}<button className="primary-button" onClick={() => command(game.scene === 'map' ? 'enterDungeon' : 'advance')}>{game.scene === 'map' ? 'Enter dungeon' : `Enter ${game.roomIndex === 2 ? 'Momo’s sanctuary' : 'room ' + (game.roomIndex + 1)}`}<Icon name="arrow" size={19}/></button><p className="button-note">{game.scene === 'map' ? 'Your story starts with one brave step.' : 'Your health carries between rooms.'}</p></>}
          {isCombat && <><div className="detail-heading"><span className="eyebrow">{game.roomIndex === 2 ? 'THE LAGOON GUARDIAN' : 'A LITTLE OBSTACLE'}</span><span className="chapter-number">0{game.roomIndex + 1}</span></div><div className={`momo-art ${game.roomIndex !== 2 ? 'mob-art' : ''}`}><AxiePortrait aqua/><span className="art-caption">{game.enemy?.type || 'Aqua'} · {game.roomIndex === 2 ? 'Boss encounter' : 'Wild encounter'}</span></div><h2>{game.enemy?.name || 'Lagoon guardian'}</h2><div className="enemy-health-label"><span>Opponent health</span><strong>{game.enemyHP} / {game.enemy?.maxHP || 100}</strong></div><div className="health-track enemy-health"><span style={{ width: `${Math.max(0, game.enemyHP / (game.enemy?.maxHP || 100) * 100)}%` }}/></div><div className={`phase-panel ${isDodge ? 'phase-water' : ''}`}><Icon name={isDodge ? 'water' : 'sword'} size={23}/><strong>{game.phase === 'PLAYER_TURN' ? 'Make your move' : game.phase === 'BOSS_TELEGRAPH' ? 'A wave is coming…' : isDodge ? 'Stay out of the blue lane!' : game.phase === 'RESOLVE_DODGE' ? 'Finding your footing…' : 'A little fighting spirit'}</strong><p>{game.phase === 'PLAYER_TURN' ? 'Play one of your three cards below the arena to deal damage.' : 'Watch the highlighted lane. Move to either safe lane before the wave lands.'}</p></div><div className="field-notes"><Icon name="book" size={17}/><div><strong>Traveler’s field notes</strong><p>A clean dodge means no damage. You can move between lanes as often as you need.</p></div></div><button className="text-button retreat-button" onClick={() => command('returnMap')}>Retreat to the world map</button></>}
          {game.scene === 'victory' && <><div className="detail-heading"><span className="eyebrow">WELCOME TO THE FAMILY</span><Icon name="heart" size={20}/></div><div className="momo-art victory-art"><AxiePortrait aqua/><span className="art-caption">One less Axie out there alone.</span></div><h2>Momo is rescued!</h2><p className="detail-description">The waves settle. Momo is ready for a new adventure — this time, with you.</p><div className="rescue-reward"><span className="reward-icon"><Icon name="spark" size={23}/></span><div><span>VILLAGE BONUS UNLOCKED</span><strong>+5% Dodge Accuracy</strong><small>A longer window to dodge every wave.</small></div></div><button className="primary-button" onClick={() => command('continueVillage')}>Continue to village<Icon name="home" size={19}/></button></>}
          {game.scene === 'village' && <><div className="detail-heading"><span className="eyebrow">A PLACE TO BELONG</span><Icon name="home" size={20}/></div><h2>Our little village</h2><p className="detail-description">Every friend you bring home makes the next journey a little easier.</p><div className="village-resident"><AxiePortrait aqua={rescued > 0}/><strong>{rescued ? 'Momo' : 'A home for new friends'}</strong><span>{rescued ? 'At home by the water' : 'Rescue Momo to welcome your first villager.'}</span>{rescued > 0 && <span className="resident-badge"><Icon name="check" size={14}/>Happily rescued</span>}</div><div className="rescue-reward"><span className="reward-icon"><Icon name="spark" size={23}/></span><div><span>TOTAL VILLAGE BONUS</span><strong>+{Math.round(game.bonus * 100)}% Dodge Accuracy</strong><small>{rescued ? 'Momo gives you 5% more dodge time.' : 'New friendships bring new strength.'}</small></div></div><button className="primary-button" onClick={() => command('returnMap')}>Return to dungeon map<Icon name="arrow" size={19}/></button></>}
          {game.scene === 'defeat' && <><div className="detail-heading"><span className="eyebrow">REST. RESET. RETURN.</span><Icon name="heart" size={20}/></div><div className="momo-art rest-art"><AxiePortrait/><span className="art-caption">Still a brave little traveler.</span></div><h2>A wave too far.</h2><p className="detail-description">Momo is still out there. Come back with full health and try this encounter again.</p><div className="field-notes"><Icon name="book" size={18}/><div><strong>A tip for next time</strong><p>Blue means danger. Move to an unlit lane before the timer runs out.</p></div></div><button className="primary-button" onClick={() => command('retry')}>Try encounter again<Icon name="arrow" size={19}/></button><button className="secondary-button" onClick={() => command('returnMap')}>Return to dungeon map</button></>}
        </aside>
      </div>
      <section className="journey-strip" aria-label="Traveler progress"><div className="traveler-summary"><span className="traveler-avatar"><AxiePortrait small/></span><div className="traveler-info"><span className="eyebrow">YOUR TRAVELER</span><strong>A brave little Axie</strong><div className="traveler-health"><Icon name="heart" size={13}/><div className="health-track"><span style={{ width: `${healthPercent}%` }}/></div><span>{game.playerHP}<small> / {game.playerMaxHP} HP</small></span></div></div></div><div className="journey-summary"><span className="summary-icon"><Icon name="flag" size={25}/></span><div><span className="eyebrow">FRIENDS FOUND</span><strong>{rescued} <span>/ 1</span><small>{rescued ? 'A new friend. A new beginning.' : 'A whole friendship ahead of you.'}</small></strong></div></div><div className="blessing-summary"><span className="summary-icon"><Icon name="spark" size={27}/></span><div><span className="eyebrow">VILLAGE BLESSINGS</span><strong>+{Math.round(game.bonus * 100)}% <span>Dodge Accuracy</span></strong><p>{rescued ? 'A gift from Momo, for every journey.' : 'Bring friends home. Grow stronger together.'}</p></div></div></section>
    </main>
    <footer className="site-footer"><span><Icon name="leaf" size={14}/>Made for the journey, and the friends along the way.</span><span>AXIE DUNGEONS<span className="footer-dot">·</span>AN ADVENTURE IN LUNACIA</span></footer>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()}><button ref={closeHelp} className="dialog-close" onClick={() => setHelp(false)} aria-label="Close how to play"><Icon name="close"/></button><span className="summary-icon"><Icon name="book" size={26}/></span><p className="eyebrow">A TRAVELER’S GUIDE</p><h2 id="help-title">A small guide to a big adventure.</h2><ol><li><strong>Follow the path.</strong> Enter Momo’s Lagoon, clear two little encounters, and reach Momo.</li><li><strong>Play your cards.</strong> Click a card or press <kbd>1</kbd>, <kbd>2</kbd>, or <kbd>3</kbd>. Each card deals its listed damage.</li><li><strong>Watch the water.</strong> A blue lane warns of a coming wave. Move to a safe lane with <kbd>A</kbd> / <kbd>S</kbd> / <kbd>D</kbd>, the arrow keys, or a lane click. Avoid the wave to take no damage.</li><li><strong>Bring a friend home.</strong> Rescue Momo to unlock +5% Dodge Accuracy: 5% more time to dodge in future encounters.</li></ol><p className="help-footnote">Progress stays with you during this session. A fresh page starts a fresh story.</p></section></div>}
  </div>;
}
