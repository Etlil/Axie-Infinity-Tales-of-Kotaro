import {act,fireEvent,render,screen,within} from '@testing-library/react';
import App from './App';
import {createGame} from './main';
import {initialState,derive} from './game/state';
import {bosses} from './data/bosses';
jest.mock('./main',()=>({createGame:jest.fn()}));
const command=jest.fn(),destroy=jest.fn();let publish;
beforeEach(()=>{
 command.mockClear();destroy.mockClear();
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
test('cards dispatch the selected ability and lock throughout animations',()=>{
 render(<App/>);publish({scene:'combat',phase:'PLAYER_TURN',enemy:bosses.buba,enemyHP:120});
 fireEvent.click(screen.getByRole('button',{name:/Twin Slash/}));
 expect(command).toHaveBeenCalledWith('playCard','twin-slash');
 expect(screen.getByRole('button',{name:/Moonlit Eclipse/})).toBeDisabled();
 publish({scene:'combat',phase:'PLAYER_ATTACK_ANIM',enemy:bosses.buba});
 ['Twin Slash','Frostguard','Moonstep'].forEach(name=>expect(screen.getByRole('button',{name:new RegExp(name)})).toBeDisabled());
});
test('touch lanes show both position and explicit danger during the dodge phase',()=>{
 render(<App/>);publish({scene:'combat',phase:'DODGE_PHASE',enemy:bosses.buba,lane:1,dangerLane:1,warningActive:true});
 expect(screen.getByRole('button',{name:'Center lane'})).toHaveAttribute('aria-pressed','true');
 expect(screen.getByRole('button',{name:'Center lane'})).toHaveClass('danger');
 fireEvent.click(screen.getByRole('button',{name:'Left lane'}));
 expect(command).toHaveBeenCalledWith('moveLane',0);
 expect(screen.queryByRole('button',{name:/Twin Slash/})).not.toBeInTheDocument();
});
test('Momo must be purified with the amulet before returning home',()=>{
 render(<App/>);publish({scene:'victory',result:{kind:'purify'},amulet:true});
 fireEvent.click(screen.getByRole('button',{name:'Use the amulet'}));
 expect(command).toHaveBeenCalledWith('purify',undefined);
 publish({scene:'victory',result:{kind:'rescued',xp:90,coins:40},rescued:[bosses.momo]});
 expect(screen.getByRole('heading',{name:'Welcome home, Momo.'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Bring Momo home'}));
 expect(command).toHaveBeenCalledWith('visitVillage',undefined);
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
