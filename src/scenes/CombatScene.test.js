import CombatScene from './CombatScene';
import { createSession } from '../game/state';
import { bosses, dungeonRooms } from '../data/bosses';

jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {}, Scenes: { Events: { SHUTDOWN: 'shutdown' } } },
}));

function displayObject() {
  const object = {};
  ['setText', 'setOrigin', 'setDepth', 'setX', 'setAlpha'].forEach((name) => {
    object[name] = jest.fn(() => object);
  });
  return object;
}

function encounter(enemy = bosses.momo, roomIndex = 2) {
  const combat = new CombatScene();
  const session = createSession(jest.fn());
  session.patch({ phase: 'PLAYER_TURN', scene: 'combat', enemy, enemyHP: enemy.maxHP, roomIndex });
  combat.game = { session };
  combat.enemy = enemy;
  combat.attackOrigin = { x: 265, y: 393 };
  combat.player = displayObject();
  combat.enemySprite = displayObject();
  combat.actionLabel = displayObject();
  combat.phaseLabel = displayObject();
  combat.timerLabel = displayObject();
  combat.turnLabel = { list: [{}, displayObject()] };
  combat.paintHealth = jest.fn();
  combat.paintLanes = jest.fn();
  combat.add = { text: jest.fn(displayObject) };
  combat.tweens = { add: jest.fn(), killTweensOf: jest.fn() };
  combat.time = { delayedCall: (duration, callback) => setTimeout(callback, duration) };
  combat.cameras = { main: { shake: jest.fn() } };
  combat.scene = { start: jest.fn() };
  combat.dodge = { lane: 1, start: jest.fn() };
  combat.dodgeView = {};
  return { combat, session };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('a card attacks only once, then telegraph and dodge lead to the next player turn', () => {
  const { combat, session } = encounter();
  combat.playCard('leaf-strike');
  combat.playCard('leaf-strike');
  expect(session.state.phase).toBe('PLAYER_ATTACK_ANIM');
  jest.advanceTimersByTime(170);
  expect(session.state.enemyHP).toBe(76);
  jest.advanceTimersByTime(430);
  expect(session.state.phase).toBe('BOSS_TELEGRAPH');
  jest.advanceTimersByTime(700);
  expect(session.state.phase).toBe('DODGE_PHASE');
  expect(combat.dodge.start).toHaveBeenCalledTimes(1);
  expect(combat.dodge.start).toHaveBeenCalledWith({ dangerLane: 2, damage: 20 });
  combat.resolveDodge({ hit: false, damage: 0, lane: 1, dangerLane: 2 });
  jest.advanceTimersByTime(850);
  expect(session.state).toMatchObject({ phase: 'PLAYER_TURN', playerHP: 100, turn: 2, dodges: 1 });
});

test('a lethal boss attack rescues Momo and moves to victory without a counterattack', () => {
  const { combat, session } = encounter();
  session.patch({ enemyHP: 12 });
  combat.playCard('leaf-strike');
  jest.advanceTimersByTime(1250);
  expect(session.state.enemyHP).toBe(0);
  expect(session.state.bonus).toBe(0.05);
  expect(session.state.rescued.map((axie) => axie.id)).toEqual(['momo']);
  expect(combat.dodge.start).not.toHaveBeenCalled();
  expect(combat.scene.start).toHaveBeenCalledWith('VictoryScene');
});

test('clearing a weak encounter advances the route without granting a rescue', () => {
  const { combat, session } = encounter(dungeonRooms[0], 0);
  session.patch({ enemyHP: 12 });
  combat.playCard('leaf-strike');
  jest.advanceTimersByTime(1250);
  expect(session.state.roomIndex).toBe(1);
  expect(session.state.rescued).toHaveLength(0);
  expect(combat.scene.start).toHaveBeenCalledWith('DungeonScene');
});

test('guard reduces one hit, healing respects max HP, and a lethal wave opens defeat', () => {
  const { combat, session } = encounter();
  session.patch({ playerHP: 98 });
  combat.playCard('moon-beam');
  expect(session.state.playerHP).toBe(100);
  jest.clearAllTimers();
  session.patch({ playerHP: 50, guard: 8 });
  combat.resolveDodge({ hit: true, damage: 20, lane: 1, dangerLane: 1 });
  expect(session.state.playerHP).toBe(38);
  jest.advanceTimersByTime(850);
  expect(session.state.guard).toBe(0);
  session.patch({ playerHP: 12 });
  combat.resolveDodge({ hit: true, damage: 20, lane: 1, dangerLane: 1 });
  jest.advanceTimersByTime(850);
  expect(session.state.playerHP).toBe(0);
  expect(combat.scene.start).toHaveBeenCalledWith('DefeatScene');
});
