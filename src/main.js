import Phaser from 'phaser';
import DungeonMapScene from './scenes/DungeonMapScene';
import CombatScene from './scenes/CombatScene';
import VictoryScene from './scenes/VictoryScene';
import VillageScene from './scenes/VillageScene';
import DefeatScene from './scenes/DefeatScene';
import { createSession } from './game/state';
import BootScene from './scenes/BootScene';
import IntroScene from './scenes/IntroScene';
import DialogueScene from './scenes/DialogueScene';

export function createGame(parent, onState) {
  let destroyed = false;
  let game = null;
  let resizeObserver = null;
  let resizeFrame = null;
  let inputEnabled = true;
  let storage = null;
  try { storage = window.localStorage; } catch { /* Session play still works when storage is blocked. */ }
  const session = createSession((snapshot) => {
    if (!destroyed && onState) onState(snapshot);
  }, { storage });
  const applyInput = (instance) => {
    if (!instance?.input) return;
    instance.input.enabled = inputEnabled;
    if (instance.input.keyboard) instance.input.keyboard.enabled = inputEnabled;
  };
  const config = {
    type: Phaser.AUTO,
    parent,
    width: 1200,
    height: 800,
    transparent: true,
    antialias: true,
    roundPixels: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1200,
      height: 800,
    },
    render: { antialias: true, pixelArt: false },
    scene: [BootScene, IntroScene, DialogueScene, DungeonMapScene, CombatScene, VictoryScene, VillageScene, DefeatScene],
    callbacks: {
      preBoot: (instance) => {
        instance.session = session;
        applyInput(instance);
      },
      postBoot: (instance) => applyInput(instance),
    },
  };
  // React StrictMode mounts, cleans up, then mounts again in the same task.
  // Defer construction so the abandoned mount never allocates a Phaser game.
  Promise.resolve().then(() => {
    if (destroyed) return;
    game = new Phaser.Game(config);
    // The CSS world changes aspect and position when a phone rotates. Observe
    // its actual bounds so Phaser refreshes after the new layout is measured.
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => { if (!destroyed) game?.scale?.refresh(); });
      });
      resizeObserver.observe(parent);
    }
  });
  session.emit();
  return {
    command(action, payload) {
      if (destroyed) return;
      if (action === 'setInputEnabled') {
        inputEnabled = Boolean(payload);
        applyInput(game);
      } else session.command(action, payload);
    },
    getState() { return { ...session.state }; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      resizeObserver?.disconnect();
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      session.handler = null;
      inputEnabled = false;
      applyInput(game);
      game?.destroy(true);
    },
  };
}

export default createGame;
