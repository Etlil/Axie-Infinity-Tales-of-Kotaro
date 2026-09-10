import Phaser from 'phaser';

export const PALETTE = {
  ink: '#254440', cream: '#fffbea', green: '#50744f', teal: '#379985',
  gold: '#efc564', muted: '#6e8170',
};

export function label(scene, x, y, text, size = 20, color = PALETTE.ink, extra = {}) {
  return scene.add.text(x, y, text, {
    fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: `${size}px`,
    color, fontStyle: 'bold', ...extra,
  });
}

export function pill(scene, x, y, text, { width = 170, fill = 0xfffbea, color = PALETTE.ink, size = 16 } = {}) {
  const container = scene.add.container(x, y);
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x304b40, 0.12).fillRoundedRect(-width / 2, -18, width, 44, 14);
  graphics.fillStyle(fill).fillRoundedRect(-width / 2, -22, width, 44, 14);
  graphics.lineStyle(1.5, 0x304b40, 0.16).strokeRoundedRect(-width / 2, -22, width, 44, 14);
  const textObject = label(scene, 0, 0, text, size, color).setOrigin(0.5);
  container.add([graphics, textObject]);
  return container;
}

export function floatingText(scene, x, y, text, color = '#d16453') {
  const value = label(scene, x, y, text, 32, color, {
    stroke: '#fffbea', strokeThickness: 5,
  }).setOrigin(0.5).setDepth(50);
  scene.tweens.add({ targets: value, y: y - 60, alpha: 0, duration: 1050, ease: 'Cubic.easeOut', onComplete: () => value.destroy() });
}

export default class SceneBase extends Phaser.Scene {
  get session() { return this.game.session; }
  get state() { return this.session.state; }

  bindScene(scene, phase, message, extra = {}) {
    this.session.patch({ scene, phase, message, dangerLane: null, dodgeActive: false, warningActive: false, dodgeRemaining: 0, ...extra });
    const handler = (action, payload) => {
      if (!this.scene.isActive()) return;
      if (action === 'returnMap') {
        this.scene.start('DungeonMapScene');
      } else if (action === 'visitVillage') {
        this.scene.start('VillageScene');
      } else if (action === 'retry' && this.state.scene === 'defeat') {
        this.retryEncounter();
      } else if (action === 'restart') {
        this.session.startRun();
        this.scene.start('DungeonScene');
      } else {
        this.onCommand(action, payload);
      }
    };
    this.session.handler = handler;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.session.handler === handler) this.session.handler = null;
    });
  }

  bindKey(event, callback) {
    this.input.keyboard.on(event, callback);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.input.keyboard.off(event, callback));
  }

  onCommand() {}

  retryEncounter() {
    this.session.patch({ playerHP: this.state.playerMaxHP, lane: 1, guard: 0, lastDamage: 0 });
    this.scene.start('CombatScene');
  }

  enterDungeon() {
    this.session.startRun();
    this.scene.start('DungeonScene');
  }
}
