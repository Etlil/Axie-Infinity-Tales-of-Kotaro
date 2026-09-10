import SceneBase, { label, pill, PALETTE } from './SceneBase';
import { renderWorld, drawAxie } from '../game/art';

export default class DungeonMapScene extends SceneBase {
  constructor() { super('DungeonMapScene'); }

  create() {
    renderWorld(this, 'map');
    this.bindScene('map', 'MAP', 'Momo is waiting beyond the lagoon. Your adventure starts here.', { enemy: null, enemyHP: 0 });

    pill(this, 154, 62, 'THE VERDANT ISLES', { width: 226, size: 14 });
    label(this, 71, 91, 'A world worth wandering.', 16, '#537367').setAlpha(0.85);
    const compass = this.add.container(1115, 78);
    const compassShape = this.add.graphics();
    compassShape.lineStyle(1.5, 0x698574, 0.6).strokeCircle(0, 0, 25);
    compassShape.fillStyle(0x5d8270, 0.9).fillTriangle(0, -20, -6, 7, 6, 7);
    compassShape.fillStyle(0xe9edcc).fillTriangle(0, 20, -6, -7, 6, -7);
    compass.add([compassShape, label(this, 0, -36, 'N', 12, '#617c68').setOrigin(0.5)]);

    this.add.circle(710, 356, 60, 0xfff8d0, 0.26);
    const pulse = this.add.circle(710, 356, 46).setStrokeStyle(2, 0xfff5c2, 0.95);
    this.tweens.add({ targets: pulse, scale: 1.36, alpha: 0.12, duration: 1700, yoyo: true, repeat: -1 });
    this.add.circle(710, 356, 37, 0xfff7d8).setStrokeStyle(3, 0x678855);
    drawAxie(this, 710, 350, { kind: 'momo', scale: 0.48 });
    pill(this, 710, 424, 'Momo’s Lagoon', { width: 203, size: 20 });
    pill(this, 710, 460, 'LEVEL 01  ·  AQUA', { width: 155, fill: 0x447f6f, color: '#fff9e8', size: 11 });
    const lagoon = this.add.zone(710, 390, 225, 182).setInteractive({ useHandCursor: true });
    lagoon.on('pointerdown', () => this.enterDungeon());
    lagoon.on('pointerover', () => pulse.setStrokeStyle(4, 0xfff5c2, 1));
    lagoon.on('pointerout', () => pulse.setStrokeStyle(2, 0xfff5c2, 0.95));

    this.add.circle(280, 420, 18, 0xf8f1d2).setStrokeStyle(3, 0x749164);
    this.add.circle(280, 420, 7, 0x71955d);
    pill(this, 280, 466, 'Your Village', { width: 161, size: 17 });
    label(this, 280, 498, this.state.rescued.length ? 'A FRIEND IS HOME' : 'WHERE WE BELONG', 10, '#67815c').setOrigin(0.5).setLetterSpacing(1.2);
    this.add.zone(280, 440, 195, 140).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('VillageScene'));

    this.add.circle(495, 395, 12, 0xfdf7da).setStrokeStyle(3, 0x8ba06b);
    label(this, 490, 440, 'MOSSY TRAIL', 11, '#6b8667').setOrigin(0.5).setLetterSpacing(1.3);
    this.add.circle(975, 265, 15, 0xece9c9).setStrokeStyle(3, 0x7a9169);
    label(this, 975, 314, 'THE GUARDIAN', 11, '#6b8667').setOrigin(0.5).setLetterSpacing(1.3);
    drawAxie(this, 355, 425, { kind: 'traveler', scale: 0.55 });

    const hint = pill(this, 600, 595, 'Every great journey begins with one small step.', { width: 460, size: 15 });
    hint.setAlpha(0.9);
    label(this, 1137, 598, '01', 24, PALETTE.green).setOrigin(0.5).setAlpha(0.45);
    this.bindKey('keydown-ENTER', () => this.enterDungeon());
  }

  onCommand(action, payload) {
    if (action === 'enterDungeon') this.enterDungeon();
    if (action === 'selectDungeon') this.session.patch({ selectedDungeon: typeof payload === 'string' ? payload : 'momo' });
    if (action === 'visitVillage') this.scene.start('VillageScene');
  }
}
