import SceneBase, { label, pill } from './SceneBase';
import { renderWorld, drawAxie } from '../game/art';

export default class VillageScene extends SceneBase {
  constructor() { super('VillageScene'); }

  create() {
    renderWorld(this, 'village');
    const hasMomo = this.state.rescued.some((axie) => axie.id === 'momo');
    this.bindScene('village', 'VILLAGE', hasMomo ? 'Welcome home. Momo’s friendship makes every journey a little easier.' : 'A quiet place to call home. Rescue Momo to welcome your first friend.', { enemy: null, enemyHP: 0 });
    pill(this, 600, 70, 'A PLACE TO CALL HOME', { width: 277, size: 14 });
    label(this, 600, 128, 'Your little village', 40, '#365f49').setOrigin(0.5);
    label(this, 600, 171, hasMomo ? 'Every friend makes this place a little brighter.' : 'Every adventure brings someone closer to home.', 18, '#5f8168').setOrigin(0.5);
    drawAxie(this, hasMomo ? 448 : 600, 428, { kind: 'traveler', scale: 0.91 });
    pill(this, hasMomo ? 448 : 600, 515, 'Traveler', { width: 136, size: 18 });
    if (hasMomo) {
      drawAxie(this, 732, 420, { kind: 'momo', scale: 1.02 });
      pill(this, 732, 515, 'Momo · Aqua', { width: 170, size: 18 });
      label(this, 732, 554, '+5% Dodge Accuracy', 14, '#477f6e').setOrigin(0.5);
      const heart = label(this, 732, 279, '♥', 25, '#d7957a').setOrigin(0.5);
      this.tweens.add({ targets: heart, y: 266, alpha: 0.55, duration: 950, yoyo: true, repeat: -1 });
    }
    pill(this, 600, 609, `${this.state.rescued.length} FRIEND${this.state.rescued.length === 1 ? '' : 'S'} RESCUED    ·    +${Math.round(this.state.bonus * 100)}% DODGE ACCURACY`, { width: 421, fill: 0xe9edd0, size: 13 });
    this.bindKey('keydown-ENTER', () => this.scene.start('DungeonMapScene'));
  }

  onCommand(action) {
    if (action === 'enterDungeon') this.enterDungeon();
  }
}
