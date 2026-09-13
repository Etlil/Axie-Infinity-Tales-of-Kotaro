import {act,fireEvent,render,screen,within} from '@testing-library/react';
import App from './App';
import {createGame} from './main';
import {initialState,derive} from './game/state';
import {bosses} from './data/bosses';
import {createDungeonRun} from './game/dungeonLayout';
jest.mock('./main',()=>({createGame:jest.fn()}));
const command=jest.fn(),destroy=jest.fn();let publish;
beforeEach(()=>{
 command.mockReset();destroy.mockClear();
 createGame.mockImplementation((parent,onState)=>{
  publish=update=>act(()=>onState(derive({...initialState(),loading:false,...update})));
  onState(derive({...initialState(),loading:false}));return {command,destroy};
 });
});
test('first launch introduces Atia and unmount releases the engine',()=>{
 const view=render(<App/>);
 expect(screen.getByRole('heading',{name:'ATIA'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Begin journey'}));
 expect(command).toHaveBeenCalledWith('nextIntro',undefined);
 view.unmount();expect(destroy).toHaveBeenCalledTimes(1);
});
test('the gate map respects locks and clearing a run before scene navigation never crashes the controls',()=>{
 render(<App/>);publish({scene:'map',prologueComplete:true});
 expect(screen.getByRole('button',{name:'Level 2: Amber Quarry'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Enter dungeon'}));
 expect(command).toHaveBeenCalledWith('enterDungeon',undefined);
 publish({scene:'dungeon',prologueComplete:true,dungeonRun:createDungeonRun(0)});
 expect(screen.getByRole('button',{name:'Walk up'})).toBeInTheDocument();
 publish({scene:'dungeon',prologueComplete:true,dungeonRun:null});
 expect(screen.queryByRole('button',{name:'Walk up'})).not.toBeInTheDocument();
 publish({scene:'village',prologueComplete:true});
 expect(screen.getByRole('button',{name:'Adventure',exact:true})).toBeInTheDocument();
});
test('cards dispatch the selected ability and lock throughout animations',()=>{
 render(<App/>);publish({scene:'combat',phase:'PLAYER_TURN',enemy:bosses.buba,enemyHP:120});
 fireEvent.click(screen.getByRole('button',{name:/Horn Lance/}));
 expect(command).toHaveBeenCalledWith('playCard','horn-lance');
 expect(screen.getByRole('button',{name:/Moonlit Eclipse/})).toBeDisabled();
 publish({scene:'combat',phase:'PLAYER_ATTACK_ANIM',enemy:bosses.buba});
 ['Horn Lance','Moon Fang','Blade Guard','Tail Sweep'].forEach(name=>expect(screen.getByRole('button',{name:new RegExp(name)})).toBeDisabled());
});
test.each(['kotaro','buba'])('%s exposes four labeled body-part attacks and a separate ultimate',activeCharacter=>{
 const view=render(<App/>);publish({scene:'combat',phase:'PLAYER_TURN',activeCharacter,enemy:bosses.buba,charge:3});
 const cards=[...view.container.querySelectorAll('.ability-card')];
 expect(cards.map(card=>card.dataset.part)).toEqual(['horn','mouth','back','tail']);
 cards.forEach((card,index)=>{
  expect(card).toHaveTextContent(card.dataset.part);
  expect(card).toHaveAttribute('aria-keyshortcuts',String(index+1));
  fireEvent.click(card);
 });
 const state=derive({...initialState(),activeCharacter});
 expect(command.mock.calls.filter(([action])=>action==='playCard')).toEqual(state.cards.map(card=>['playCard',card.id]));
 const ultimate=screen.getByRole('button',{name:new RegExp(state.ultimate.name)});
 expect(ultimate).toHaveAttribute('aria-keyshortcuts','5');
 fireEvent.click(ultimate);expect(command).toHaveBeenLastCalledWith('playCard',state.ultimate.id);
});
test('touch controls dispatch held movement and jump independently',()=>{
 render(<App/>);publish({scene:'combat',phase:'DODGE_PHASE',enemy:bosses.buba,dodgeRemaining:6.5,dodgeX:330,dodgeY:600});
 const right=screen.getByRole('button',{name:'Move right'}),jump=screen.getByRole('button',{name:'Jump'});
 right.setPointerCapture=jest.fn();jump.setPointerCapture=jest.fn();
 fireEvent.pointerDown(right,{pointerId:1});fireEvent.pointerDown(jump,{pointerId:2});
 expect(command).toHaveBeenCalledWith('dodgeInput',expect.objectContaining({control:'right',pressed:true}));
 expect(command).toHaveBeenCalledWith('dodgeInput',expect.objectContaining({control:'jump',pressed:true}));
 fireEvent.pointerCancel(right,{pointerId:1});expect(command).toHaveBeenCalledWith('dodgeInput',expect.objectContaining({control:'right',pressed:false}));
 expect(screen.queryByRole('button',{name:/Horn Lance/})).not.toBeInTheDocument();
});
test('Puffy must be purified with the amulet before returning home',()=>{
 render(<App/>);publish({scene:'victory',result:{kind:'purify'},amulet:true});
 fireEvent.click(screen.getByRole('button',{name:'Use the amulet'}));
 expect(command).toHaveBeenCalledWith('purify',undefined);
 publish({scene:'victory',result:{kind:'rescued',xp:90,coins:40},rescued:[bosses.puffy]});
 expect(screen.getByRole('heading',{name:'Welcome home, Puffy.'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Bring Puffy home'}));
 expect(command).toHaveBeenCalledWith('visitVillage',undefined);
});
test('enemy intent shows the damage of each colliding projectile',()=>{
 render(<App/>);publish({scene:'combat',phase:'DODGE_PHASE',enemy:bosses.puffy,enemyCard:bosses.puffy.cards[0]});
 expect(screen.getByText(/Nightmare Wave.*11 \/ HIT/)).toBeInTheDocument();
});
test('rank rewards remain visible but locked or claimed rewards cannot dispatch',()=>{
 render(<App/>);publish({scene:'village',prologueComplete:true,xp:60,panel:'rewards',claimedRewards:[1]});
 expect(screen.getByRole('dialog',{name:'Buba’s tent'})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Rank 1 claimed'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Claim rank 3'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Claim rank 2'}));
 expect(command).toHaveBeenCalledWith('claimReward',2);
});
test('help disables world input and restores focus on Escape',()=>{
 render(<App/>);publish({scene:'village',prologueComplete:true});
 const help=screen.getByRole('button',{name:'How to play'});help.focus();fireEvent.click(help);
 expect(command).toHaveBeenLastCalledWith('setInputEnabled',false);
 const dialog=screen.getByRole('dialog',{name:'Traveler’s guide'});
 const close=within(dialog).getByRole('button',{name:'Close panel'});expect(close).toHaveFocus();
 fireEvent.keyDown(document,{key:'Tab'});expect(close).toHaveFocus();
 fireEvent.keyDown(document,{key:'Escape'});
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(command).toHaveBeenLastCalledWith('setInputEnabled',true);expect(help).toHaveFocus();
});

test('pausing a dodge locks the engine, and retreat resumes it before navigating',()=>{
 render(<App/>);publish({scene:'combat',phase:'DODGE_PHASE',enemy:bosses.buba,dodgeRemaining:2.4});
 fireEvent.click(screen.getByRole('button',{name:'Pause encounter'}));
 expect(screen.getByRole('dialog',{name:'Game paused'})).toBeInTheDocument();
 expect(command).toHaveBeenCalledWith('setPaused',true);
 expect(command).toHaveBeenLastCalledWith('setInputEnabled',false);
 command.mockClear();
 fireEvent.click(screen.getByRole('button',{name:'Retreat from encounter'}));
 expect(command.mock.calls.slice(0,3)).toEqual([['setPaused',false],['setInputEnabled',true],['retreat',undefined]]);
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('reset requires confirmation; keeping the save never dispatches deletion',()=>{
 render(<App/>);publish({scene:'village',prologueComplete:true,xp:460});
 fireEvent.click(screen.getByRole('button',{name:'Settings'}));
 fireEvent.click(screen.getByRole('button',{name:'Reset save data'}));
 const keep=screen.getByRole('button',{name:'Keep my save'});
 expect(keep).toHaveFocus();expect(screen.getByText(/This can’t be undone/)).toBeInTheDocument();
 expect(command).not.toHaveBeenCalledWith('resetSave',undefined);
 fireEvent.click(keep);
 expect(screen.getByRole('button',{name:'Reset save data'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Close panel'}));
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(command).not.toHaveBeenCalledWith('resetSave',undefined);
});

test('reset from paused combat closes every menu only after successful deletion',()=>{
 render(<App/>);publish({scene:'combat',phase:'DODGE_PHASE',enemy:bosses.buba});
 fireEvent.click(screen.getByRole('button',{name:'Pause encounter'}));
 fireEvent.click(screen.getByRole('button',{name:'Settings'}));
 fireEvent.click(screen.getByRole('button',{name:'Reset save data'}));
 command.mockImplementation(action=>action==='resetSave'?{ok:false,error:'Could not delete this save.'}:undefined);
 fireEvent.click(screen.getByRole('button',{name:'Delete save and restart'}));
 expect(screen.getByRole('alert')).toHaveTextContent('Could not delete this save.');
 expect(screen.getByRole('dialog',{name:'Settings'})).toBeInTheDocument();
 command.mockImplementation(action=>{
  if(action==='resetSave'){publish({});return {ok:true};}
 });
 fireEvent.click(screen.getByRole('button',{name:'Delete save and restart'}));
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Begin journey'})).toBeInTheDocument();
 expect(command).toHaveBeenLastCalledWith('setInputEnabled',true);
});

test('story Settings can close without changing the intro checkpoint',()=>{
 render(<App/>);publish({introStep:2});
 fireEvent.click(screen.getByRole('button',{name:'Settings'}));
 expect(screen.getByRole('dialog',{name:'Settings'})).toBeInTheDocument();
 fireEvent.keyDown(document,{key:'Escape'});
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(command).not.toHaveBeenCalledWith('nextIntro',undefined);
});

test('rescued Puffy offers village healing and locks the button at full health',()=>{
 render(<App/>);publish({scene:'village',prologueComplete:true,playerHP:43});
 expect(screen.queryByRole('button',{name:'Visit Puffy'})).not.toBeInTheDocument();
 const state={scene:'village',prologueComplete:true,activeCharacter:'buba',playerHP:43,rescued:[{id:'puffy'}]};
 publish(state);
 fireEvent.click(screen.getByRole('button',{name:'Visit Puffy'}));
 expect(command).toHaveBeenCalledWith('townTravel','spring');
 publish({...state,panel:'healer'});
 expect(screen.getByRole('dialog',{name:'Puffy’s healing spring'})).toBeInTheDocument();
 expect(screen.getByText('43 / 110 HP')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Restore health'}));
 expect(command).toHaveBeenCalledWith('healWithPuffy',undefined);
 publish({...state,playerHP:110,panel:'healer'});
 expect(screen.getByRole('button',{name:'Fully healed'})).toBeDisabled();
 expect(screen.getByText('Full health. Ready for your next adventure.')).toBeInTheDocument();
});
