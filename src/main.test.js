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
  Phaser.Game.mockReset();
  Phaser.Game.mockImplementation((config) => {
    const instance = { input: { enabled: true, keyboard: { enabled: true } }, destroy: jest.fn() };
    config.callbacks.preBoot(instance);
    config.callbacks.postBoot(instance);
    return instance;
  });
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
