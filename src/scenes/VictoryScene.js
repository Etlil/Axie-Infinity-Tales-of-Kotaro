import SceneBase, { label, pill } from './SceneBase';
import { renderWorld, drawAxie } from '../game/art';

export default class VictoryScene extends SceneBase {
  constructor() { super('VictoryScene'); }

  create() {
    renderWorld(this, 'victory');
    this.bindScene('victory', 'RESCUED', 'Momo has been rescued! She joins your village and grants +5% Dodge Accuracy.', { enemy: null, enemyHP: 0, guard: 0 });
    this.add.circle(600, 330, 151, 0xfff5bf, 0.29);
    const glow = this.add.circle(600, 330, 119, 0xffffd8, 0.24);
    this.tweens.add({ targets: glow, scale: 1.15, alpha: 0.1, duration: 1700, yoyo: true, repeat: -1 });
    pill(this, 600, 81, 'A NEW FRIEND FOUND', { width: 252, size: 15 });
    label(this, 600, 141, 'Momo has been rescued!', 39, '#365e4b').setOrigin(0.5);
    label(this, 600, 187, 'The lagoon’s gentle guardian is coming home.', 18, '#63836c').setOrigin(0.5);
    drawAxie(this, 600, 342, { kind: 'momo', scale: 1.43 });
    drawAxie(this, 365, 420, { kind: 'traveler', scale: 0.67 });
    for (let i = 0; i < 11; i += 1) {
      const x = 365 + ((i * 79) % 470);
      const y = 232 + ((i * 53) % 197);
      const spark = label(this, x, y, i % 2 ? '✦' : '·', i % 2 ? 19 : 31, '#ddb751').setOrigin(0.5);
      this.tweens.add({ targets: spark, y: y - 15, alpha: 0.2, duration: 900 + i * 83, yoyo: true, repeat: -1 });
    }
    pill(this, 600, 504, '+5% DODGE ACCURACY', { width: 298, fill: 0x4b8877, color: '#fffbe9', size: 17 });
    label(this, 600, 548, 'A little more time to find your footing.', 17, '#5f836b').setOrigin(0.5);
    label(this, 600, 580, 'Momo’s friendship gives your wave warnings 5% more time.', 13, '#75947a').setOrigin(0.5);
    this.bindKey('keydown-ENTER', () => this.scene.start('VillageScene'));
  }

  onCommand(action) {
    if (action === 'continueVillage' || action === 'visitVillage') this.scene.start('VillageScene');
  }
}
