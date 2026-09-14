import Phaser from 'phaser';
import { createGame } from './main';

jest.mock('phaser', () => ({
  __esModule: true,
  default: {
    Scene: class Scene {},
    Game: jest.fn(),
    AUTO: 0,
    Scale: { FIT: 1, CENTER_BOTH: 2 },
  },
}));

beforeEach(() => {
  window.localStorage.clear();
  Phaser.Game.mockReset();
  Phaser.Game.mockImplementation((config) => {
    const instance = { input: { enabled: true, keyboard: { enabled: true } }, destroy: jest.fn() };
    config.callbacks.preBoot(instance);
    config.callbacks.postBoot(instance);
    return instance;
  });
});

test('reset stops every old scene, including paused combat, and starts a fresh intro', async () => {
  const controller=createGame(document.createElement('div'),jest.fn());
  expect(controller.command('resetSave').ok).toBe(false);
  await Promise.resolve();
  const game=Phaser.Game.mock.results[0].value;
  game.session.selectSlot(1);
  game.session.patch({loading:false,scene:'combat',phase:'DODGE_PHASE',xp:460});
  game.session.handler=jest.fn();
  game.scene={
    getScene:()=>({sys:{isActive:()=>true}}),pause:jest.fn(),
    getScenes:jest.fn(()=>['CombatScene','VillageScene'].map(key=>({sys:{settings:{key}}}))),
    stop:jest.fn(),start:jest.fn(),
  };
  controller.command('setPaused',true);controller.command('setInputEnabled',false);
  expect(controller.command('resetSave')).toEqual({ok:true});
  expect(game.scene.getScenes).toHaveBeenCalledWith(false);
  expect(game.scene.stop.mock.calls).toEqual([['CombatScene'],['VillageScene']]);
  expect(game.scene.start).toHaveBeenCalledWith('IntroScene');
  expect(game.session.handler).toBeNull();
  expect(game.input.keyboard.enabled).toBe(true);
  expect(controller.getState()).toMatchObject({scene:'intro',introStep:0,xp:0,enemy:null});
  controller.destroy();
});

test('reset storage failure leaves the engine paused and the old handler attached', async () => {
  const controller=createGame(document.createElement('div'),jest.fn());
  await Promise.resolve();
  const game=Phaser.Game.mock.results[0].value,handler=jest.fn();
  game.session.selectSlot(1);game.session.patch({loading:false,xp:460});game.session.handler=handler;
  game.scene={stop:jest.fn(),start:jest.fn()};
  controller.command('setInputEnabled',false);
  const remove=jest.spyOn(Storage.prototype,'removeItem').mockImplementation(()=>{throw Error('blocked');});
  try {
    expect(controller.command('resetSave')).toMatchObject({ok:false,error:expect.stringContaining('unchanged')});
    expect(game.scene.stop).not.toHaveBeenCalled();expect(game.scene.start).not.toHaveBeenCalled();
    expect(game.session.handler).toBe(handler);expect(controller.getState().xp).toBe(460);
    expect(game.input.enabled).toBe(false);
  } finally {remove.mockRestore();controller.destroy();}
});

test('StrictMode cleanup before boot never constructs an abandoned Phaser instance', async () => {
  const abandoned = createGame(document.createElement('div'), jest.fn());
  abandoned.destroy();
  abandoned.destroy();
  const active = createGame(document.createElement('div'), jest.fn());
  await Promise.resolve();
  expect(Phaser.Game).toHaveBeenCalledTimes(1);
  active.destroy();
  expect(Phaser.Game.mock.results[0].value.destroy).toHaveBeenCalledTimes(1);
});

test('input commands are safe before boot and cleanup suppresses late state callbacks', async () => {
  const publish = jest.fn();
  const controller = createGame(document.createElement('div'), publish);
  controller.command('setInputEnabled', false);
  await Promise.resolve();
  const game = Phaser.Game.mock.results[0].value;
  expect(game.input.enabled).toBe(false);
  expect(game.input.keyboard.enabled).toBe(false);
  controller.command('setInputEnabled', true);
  expect(game.input.keyboard.enabled).toBe(true);
  const handler = jest.fn();
  game.session.handler = handler;
  controller.command('enterDungeon');
  expect(handler).toHaveBeenCalledWith('enterDungeon', undefined);

  controller.destroy();
  publish.mockClear();
  game.session.patch({ scene: 'combat' });
  controller.command('enterDungeon');
  expect(publish).not.toHaveBeenCalled();
  expect(game.input.keyboard.enabled).toBe(false);
  expect(handler).toHaveBeenCalledTimes(1);
});

test('the pause menu freezes only an active encounter and resumes it once', async () => {
  const controller = createGame(document.createElement('div'), jest.fn());
  await Promise.resolve();
  const game = Phaser.Game.mock.results[0].value;
  let active = true, paused = false;
  game.scene = {
    getScene: () => ({ sys: { isActive: () => active, isPaused: () => paused } }),
    pause: jest.fn(() => { active = false; paused = true; }),
    resume: jest.fn(() => { active = true; paused = false; }),
  };
  controller.command('setPaused', true);
  controller.command('setPaused', true);
  expect(game.scene.pause).toHaveBeenCalledTimes(1);
  expect(game.scene.pause).toHaveBeenCalledWith('CombatScene');
  controller.command('setPaused', false);
  controller.command('setPaused', false);
  expect(game.scene.resume).toHaveBeenCalledTimes(1);
  active = false;
  controller.command('setPaused', true);
  expect(game.scene.pause).toHaveBeenCalledTimes(1);
  controller.destroy();
});
