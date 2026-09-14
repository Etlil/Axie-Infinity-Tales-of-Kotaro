import Phaser from 'phaser';
import DungeonMapScene from './scenes/DungeonMapScene';
import LevelSelectScene from './scenes/LevelSelectScene';
import CombatScene from './scenes/CombatScene';
import VictoryScene from './scenes/VictoryScene';
import VillageScene from './scenes/VillageScene';
import DefeatScene from './scenes/DefeatScene';
import { createSession } from './game/state';
import BootScene from './scenes/BootScene';
import IntroScene from './scenes/IntroScene';
import DialogueScene from './scenes/DialogueScene';
import MainMenuScene from './scenes/MainMenuScene';
import {createSaveSlots} from './game/saveSlots';

export function createGame(parent, onState) {
  let destroyed = false;
  let game = null;
  let resizeObserver = null;
  let resizeFrame = null;
  let inputEnabled = true;
  let paused = false;
  let storage = null;
  try { storage = window.localStorage; } catch { /* Session play still works when storage is blocked. */ }
  const session = createSession((snapshot) => {
    if (!destroyed && onState) onState(snapshot);
  }, { slotStore:createSaveSlots(storage) });
  const applyInput = (instance) => {
    if (!instance?.input) return;
    instance.input.enabled = inputEnabled;
    if (instance.input.keyboard) instance.input.keyboard.enabled = inputEnabled;
  };
  const applyPause = () => {
    const scene = game?.scene?.getScene('CombatScene');
    if (!scene) return;
    if (paused && scene.sys.isActive()) game.scene.pause('CombatScene');
    else if (!paused && scene.sys.isPaused()) game.scene.resume('CombatScene');
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
    scene: [BootScene, MainMenuScene, IntroScene, DialogueScene, LevelSelectScene, DungeonMapScene, CombatScene, VictoryScene, VillageScene, DefeatScene],
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
      } else if (action === 'setPaused') {
        paused = Boolean(payload);
        applyPause();
      } else if(action==='selectSlot'||action==='returnToMenu'){
        if(!game?.scene||session.state.loading)return {ok:false,error:'The game is still loading.'};
        // Stop paused combat too, so queued attacks cannot reach another save slot.
        if(action==='selectSlot'&&session.state.scene!=='menu')return {ok:false,error:'Choose a slot from the main menu.'};
        const result=action==='selectSlot'?session.selectSlot(payload):{ok:session.toMainMenu()};
        if(!result.ok)return result;
        session.handler=null;game.scene.getScenes(false).forEach(scene=>game.scene.stop(scene.sys.settings.key));
        paused=false;inputEnabled=true;applyInput(game);
        const key=action==='returnToMenu'?'MainMenuScene':session.state.prologueComplete?'VillageScene':session.state.tutorialWon?'DialogueScene':'IntroScene';
        game.scene.start(key);return result;
      } else if(action==='retrySave'){
        return {ok:session.saveNow('manual')};
      } else if (action === 'resetSave') {
        if (!game?.scene || session.state.loading) return { ok: false, error: 'The adventure is still loading. Please try again in a moment.' };
        if (!session.resetSave()) return { ok: false, error: 'Your browser could not delete the save. Your adventure is unchanged. Please try again.' };
        // Stop paused scenes too: their pending attacks must never reach the
        // fresh adventure. Keep the loaded textures and restart the intro.
        session.handler = null;
        game.scene.getScenes(false).forEach(scene => game.scene.stop(scene.sys.settings.key));
        paused = false;
        inputEnabled = true;
        applyInput(game);
        game.scene.start('IntroScene');
        return { ok: true };
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
