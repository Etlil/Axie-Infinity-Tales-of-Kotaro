import { bosses } from '../data/bosses';
import { createSession } from './state';

test('rescuing a friend once grants a permanent bonus without duplicate stacking', () => {
  const session = createSession(jest.fn());
  expect(session.rescue(bosses.momo)).toBe(true);
  expect(session.state.bonus).toBe(0.05);
  expect(session.state.rescued).toHaveLength(1);
  expect(session.rescue(bosses.momo)).toBe(false);
  expect(session.state.rescued).toHaveLength(1);
  expect(session.state.bonus).toBe(0.05);
});

test('a new expedition restores health and progress while keeping village friends', () => {
  const session = createSession(jest.fn());
  session.rescue(bosses.momo);
  session.patch({ playerHP: 0, roomIndex: 2, turn: 9, guard: 8, dodges: 3, hits: 7, dodgeActive: true, dangerLane: 1 });
  session.startRun();
  expect(session.state).toMatchObject({
    playerHP: 100, roomIndex: 0, turn: 1, guard: 0, dodges: 0, hits: 0,
    dodgeActive: false, dangerLane: null, bonus: 0.05,
  });
  expect(session.state.rescued[0].id).toBe('momo');
});

test('each game owns independent progress and publishes immutable state snapshots', () => {
  const publish = jest.fn();
  const first = createSession(publish);
  const second = createSession();
  first.patch({ playerHP: 42 });
  const published = publish.mock.calls[0][0];
  first.patch({ playerHP: 12 });
  first.rescue(bosses.momo);
  expect(published.playerHP).toBe(42);
  expect(second.state.playerHP).toBe(100);
  expect(second.state.rescued).toHaveLength(0);
});
