import Phaser from 'phaser';
import DungeonMapScene from './scenes/DungeonMapScene';
import DungeonScene from './scenes/DungeonScene';
import CombatScene from './scenes/CombatScene';
import VictoryScene from './scenes/VictoryScene';
import VillageScene from './scenes/VillageScene';
import DefeatScene from './scenes/DefeatScene';
import { createSession } from './game/state';

export function createGame(parent, onState) {
  let destroyed = false;
  let game = null;
  let inputEnabled = true;
  const session = createSession((snapshot) => {
    if (!destroyed && onState) onState(snapshot);
  });
  const applyInput = (instance) => {
    if (!instance?.input) return;
    instance.input.enabled = inputEnabled;
    if (instance.input.keyboard) instance.input.keyboard.enabled = inputEnabled;
  };
  const config = {
    type: Phaser.AUTO,
    parent,
    width: 1200,
    height: 660,
    transparent: true,
    antialias: true,
    roundPixels: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1200,
      height: 660,
    },
    render: { antialias: true, pixelArt: false },
    scene: [DungeonMapScene, DungeonScene, CombatScene, VictoryScene, VillageScene, DefeatScene],
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
      session.handler = null;
      inputEnabled = false;
      applyInput(game);
      game?.destroy(true);
    },
  };
}

export default createGame;
