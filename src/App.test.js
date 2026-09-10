import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { createGame } from './main';
import { initialState } from './game/state';
import { bosses } from './data/bosses';

jest.mock('./main', () => ({ createGame: jest.fn() }));

const command = jest.fn();
const destroy = jest.fn();
let publish;

beforeEach(() => {
  command.mockClear();
  destroy.mockClear();
  createGame.mockImplementation((parent, onState) => {
    publish = (update) => act(() => onState({ ...initialState(), ...update }));
    onState(initialState());
    return { command, destroy };
  });
});

test('the map starts a dungeon and releases the game on unmount', () => {
  const view = render(<App />);
  expect(screen.getByRole('heading', { name: 'Small steps. Big adventures.' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Enter dungeon' }));
  expect(command).toHaveBeenCalledWith('enterDungeon', undefined);
  view.unmount();
  expect(destroy).toHaveBeenCalledTimes(1);
});

test('a player turn forwards the selected card and other phases disable all cards', () => {
  render(<App />);
  publish({ scene: 'combat', phase: 'PLAYER_TURN', enemy: bosses.momo, enemyHP: 100, roomIndex: 2 });
  const leafStrike = screen.getByRole('button', { name: /Leaf Strike/ });
  expect(leafStrike).toBeEnabled();
  fireEvent.click(leafStrike);
  expect(command).toHaveBeenCalledWith('playCard', 'leaf-strike');

  publish({ scene: 'combat', phase: 'PLAYER_ATTACK_ANIM', enemy: bosses.momo, enemyHP: 76, roomIndex: 2 });
  command.mockClear();
  ['Leaf Strike', 'Vine Whip', 'Moon Beam'].forEach((name) => {
    const card = screen.getByRole('button', { name: new RegExp(name) });
    expect(card).toBeDisabled();
    fireEvent.click(card);
  });
  expect(command).not.toHaveBeenCalled();
});

test('dodge controls forward lanes only during the dodge phase', () => {
  render(<App />);
  publish({ scene: 'combat', phase: 'DODGE_PHASE', enemy: bosses.momo, enemyHP: 76, lane: 1, dangerLane: 1 });
  const center = screen.getByRole('button', { name: /S Center/ });
  expect(center).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: /A Left/ }));
  expect(command).toHaveBeenCalledWith('moveLane', 0);
  expect(screen.getByRole('button', { name: /Leaf Strike/ })).toBeDisabled();

  publish({ scene: 'combat', phase: 'BOSS_TELEGRAPH', enemy: bosses.momo });
  command.mockClear();
  const right = screen.getByRole('button', { name: /D Right/ });
  expect(right).toBeDisabled();
  fireEvent.click(right);
  expect(command).not.toHaveBeenCalled();
});

test('rescue continues to the village, displays the earned bonus, and returns to the map', () => {
  render(<App />);
  const friendship = { rescued: [bosses.momo], bonus: 0.05 };
  publish({ ...friendship, scene: 'victory', phase: 'RESCUED' });
  expect(screen.getByRole('heading', { name: 'Momo is rescued!' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Continue to village' }));
  expect(command).toHaveBeenCalledWith('continueVillage', undefined);

  publish({ ...friendship, scene: 'village', phase: 'VILLAGE' });
  const village = within(screen.getByRole('complementary'));
  expect(village.getByText('Momo', { exact: true })).toBeInTheDocument();
  expect(village.getByText('+5% Dodge Accuracy', { exact: true })).toBeInTheDocument();
  fireEvent.click(village.getByRole('button', { name: 'Return to dungeon map' }));
  expect(command).toHaveBeenCalledWith('returnMap', undefined);
});

test('the help dialog is named, traps keyboard focus, and restores focus on Escape', () => {
  render(<App />);
  const help = screen.getByRole('button', { name: 'How to play' });
  help.focus();
  fireEvent.click(help);
  expect(command).toHaveBeenLastCalledWith('setInputEnabled', false);
  const dialog = screen.getByRole('dialog', { name: 'A small guide to a big adventure.' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  const close = within(dialog).getByRole('button', { name: 'Close how to play' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(command).toHaveBeenLastCalledWith('setInputEnabled', true);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(help).toHaveFocus();
});
