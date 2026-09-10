import SceneBase, { label, pill } from './SceneBase';
import { renderWorld, drawAxie } from '../game/art';
import { dungeonRooms } from '../data/bosses';

const STOPS = [350, 650, 950];

export default class DungeonScene extends SceneBase {
  constructor() { super('DungeonScene'); }

  create() {
    const room = dungeonRooms[this.state.roomIndex];
    renderWorld(this, 'dungeon');
    this.bindScene('dungeon', 'TRAVERSAL', this.state.roomIndex === 0
      ? 'Follow the mossy trail. A small guardian waits in the first clearing.'
      : `Path cleared! Advance to ${room.location.toLowerCase()}.`, { enemy: null, enemyHP: 0, guard: 0 });

    pill(this, 193, 61, 'MOMO’S LAGOON', { width: 261, size: 15 });
    label(this, 63, 102, room.location, 28);
    label(this, 63, 139, `ROOM ${this.state.roomIndex + 1} OF 3`, 12, '#638b73').setLetterSpacing(2);
    const path = this.add.graphics();
    path.lineStyle(5, 0xf7e7b4, 0.85).lineBetween(240, 436, 1000, 436);

    STOPS.forEach((x, i) => {
      const passed = i < this.state.roomIndex;
      const current = i === this.state.roomIndex;
      this.add.circle(x, 436, 23, passed ? 0x6f9d71 : 0xfbf2cf).setStrokeStyle(3, current ? 0xb58c44 : 0x97ab7a);
      label(this, x, 436, passed ? '✓' : `${i + 1}`, 18, passed ? '#fff9e5' : '#67855b').setOrigin(0.5);
      label(this, x, 482, i === 2 ? 'MOMO' : `CLEARING ${i + 1}`, 13, '#527b61').setOrigin(0.5).setLetterSpacing(1);
      if (!passed) drawAxie(this, x, 354, { kind: i === 2 ? 'momo' : 'mob', scale: i === 2 ? 0.66 : 0.48 });
      if (current) {
        const arrow = label(this, x, 246, '↓', 37, '#e6a841').setOrigin(0.5);
        this.tweens.add({ targets: arrow, y: 259, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.add.zone(x, 371, 160, 205).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.advance());
      }
    });
    this.traveler = drawAxie(this, this.state.roomIndex === 0 ? 200 : STOPS[this.state.roomIndex - 1], 400, { kind: 'traveler', scale: 0.72 });
    pill(this, 600, 588, 'Take a breath. The next clearing is just ahead.', { width: 450, size: 16 });
    this.bindKey('keydown-SPACE', () => this.advance());
    this.bindKey('keydown-RIGHT', () => this.advance());
    this.bindKey('keydown-ENTER', () => this.advance());
  }

  advance() {
    if (this.state.phase !== 'TRAVERSAL') return;
    this.session.patch({ phase: 'TRAVERSING', message: 'Into the clearing…' });
    this.tweens.add({
      targets: this.traveler,
      x: STOPS[this.state.roomIndex] - 70,
      duration: 620,
      ease: 'Sine.easeInOut',
      onComplete: () => this.scene.start('CombatScene'),
    });
  }

  onCommand(action) {
    if (action === 'advance') this.advance();
  }
}
