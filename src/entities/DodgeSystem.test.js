import DodgeSystem, { getDodgeTiming, resolveLaneHit } from './DodgeSystem';

function emitter() {
  const listeners = new Map();
  return {
    on(name, listener) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(listener);
    },
    once(name, listener) { this.on(name, listener); },
    off(name, listener) { listeners.get(name)?.delete(listener); },
    emit(name) { [...(listeners.get(name) || [])].forEach((listener) => listener()); },
    count(name) { return listeners.get(name)?.size || 0; },
  };
}

function makeScene() {
  const timers = [];
  const keyboard = {
    ...emitter(),
    captures: [37], // An existing owner must keep its LEFT capture.
    getCaptures() { return this.captures; },
    addCapture(keys) { this.captures.push(...keys); },
    removeCapture(keys) { this.captures = this.captures.filter((key) => !keys.includes(key)); },
  };
  const scene = {
    input: { keyboard },
    events: emitter(),
    time: {
      now: 0,
      delayedCall(delay, callback) {
        const timer = { at: this.now + delay, callback, removed: false, remove() { this.removed = true; } };
        timers.push(timer);
        return timer;
      },
    },
    advance(milliseconds) {
      this.time.now += milliseconds;
      this.events.emit('update');
      timers.forEach((timer) => {
        if (!timer.removed && timer.at <= this.time.now) {
          timer.removed = true;
          timer.callback();
        }
      });
    },
  };
  return scene;
}

test('reaction bonus extends the entire phase and warning by the same percentage, with safe bounds', () => {
  expect(getDodgeTiming()).toEqual({ duration: 3000, warningDuration: 1000 });
  expect(getDodgeTiming(0.05)).toEqual({ duration: 3150, warningDuration: 1050 });
  expect(getDodgeTiming(-0.5)).toEqual(getDodgeTiming(0));
  expect(getDodgeTiming(2)).toEqual(getDodgeTiming(1));
  expect(getDodgeTiming(NaN)).toEqual(getDodgeTiming(0));
});

test.each([0, 1, 2])('danger lane %i hits only the matching player lane', (dangerLane) => {
  [0, 1, 2].forEach((lane) => {
    expect(resolveLaneHit(lane, dangerLane, 17)).toEqual({
      hit: lane === dangerLane,
      damage: lane === dangerLane ? 17 : 0,
      lane,
      dangerLane,
    });
  });
  expect(resolveLaneHit(-1, dangerLane, 17).hit).toBe(false);
});

test('warning stays concealed until the final second and resolves once using the final lane', () => {
  const scene = makeScene();
  const updates = jest.fn();
  const resolve = jest.fn();
  const dodge = new DodgeSystem(scene, { onUpdate: updates, onResolve: resolve });
  expect(dodge.moveLane(0)).toBe(false);
  dodge.start({ dangerLane: 1, damage: 17 });
  expect(updates).toHaveBeenLastCalledWith({ lane: 1, dangerLane: null, dodgeRemaining: 3, warningRemaining: 0, warningActive: false, dodgeActive: true });
  scene.advance(1999);
  expect(updates.mock.calls.at(-1)[0].dangerLane).toBeNull();
  scene.advance(1);
  expect(updates.mock.calls.at(-1)[0]).toMatchObject({ dangerLane: 1, warningActive: true, warningRemaining: 1 });
  scene.advance(999);
  scene.input.keyboard.emit('keydown-RIGHT');
  expect(updates.mock.calls.at(-1)[0].lane).toBe(2);
  expect(resolve).not.toHaveBeenCalled();
  scene.advance(1);
  expect(resolve).toHaveBeenCalledTimes(1);
  expect(resolve).toHaveBeenCalledWith({ hit: false, damage: 0, lane: 2, dangerLane: 1 });
  expect(dodge.active).toBe(false);
  expect(scene.events.count('update')).toBe(0);
  expect(scene.input.keyboard.captures).toEqual([37]);
  scene.advance(3000);
  expect(resolve).toHaveBeenCalledTimes(1);
});

test('five percent bonus reveals the warning at 2100ms and resolves at 3150ms', () => {
  const scene = makeScene();
  const updates = jest.fn();
  const resolve = jest.fn();
  const dodge = new DodgeSystem(scene, { bonus: 0.05, onUpdate: updates, onResolve: resolve });
  dodge.start({ dangerLane: 1, damage: 12 });
  scene.advance(2099);
  expect(updates.mock.calls.at(-1)[0].warningActive).toBe(false);
  scene.advance(1);
  expect(updates.mock.calls.at(-1)[0].warningRemaining).toBe(1.05);
  scene.advance(1049);
  expect(resolve).not.toHaveBeenCalled();
  scene.advance(1);
  expect(resolve).toHaveBeenCalledWith({ hit: true, damage: 12, lane: 1, dangerLane: 1 });
});

test('every keyboard lane mapping works while active and ignores invalid movement', () => {
  const scene = makeScene();
  const dodge = new DodgeSystem(scene);
  dodge.start({ dangerLane: 2, damage: 8 });
  [['A', 0], ['S', 1], ['D', 2], ['LEFT', 0], ['DOWN', 1], ['RIGHT', 2]].forEach(([key, lane]) => {
    scene.input.keyboard.emit(`keydown-${key}`);
    expect(dodge.lane).toBe(lane);
  });
  expect(dodge.moveLane(3)).toBe(false);
  expect(dodge.moveLane(0.5)).toBe(false);
  dodge.stop();
  scene.input.keyboard.emit('keydown-A');
  expect(dodge.lane).toBe(2);
});

test('restarting replaces pending damage and shutdown removes input, captures, and timers', () => {
  const scene = makeScene();
  const resolve = jest.fn();
  const dodge = new DodgeSystem(scene, { onResolve: resolve });
  dodge.start({ dangerLane: 1, damage: 99 });
  scene.advance(1000);
  dodge.start({ dangerLane: 0, damage: 8 });
  scene.advance(2000);
  expect(resolve).not.toHaveBeenCalled();
  scene.events.emit('shutdown');
  scene.advance(3000);
  expect(resolve).not.toHaveBeenCalled();
  expect(scene.events.count('update')).toBe(0);
  expect(scene.events.count('shutdown')).toBe(0);
  expect(scene.input.keyboard.count('keydown-A')).toBe(0);
  expect(scene.input.keyboard.count('keydown-RIGHT')).toBe(0);
  expect(scene.input.keyboard.captures).toEqual([37]);
  expect(dodge.start({ dangerLane: 1, damage: 1 })).toBe(false);
});
