import SceneBase, { label, pill } from './SceneBase';
import { renderWorld, drawAxie } from '../game/art';

export default class DefeatScene extends SceneBase {
  constructor() { super('DefeatScene'); }

  create() {
    renderWorld(this, 'defeat');
    this.add.rectangle(600, 330, 1200, 660, 0x284d48, 0.15);
    this.bindScene('defeat', 'DEFEATED', 'A little rest, then another try. Your village friends are still cheering for you.', { guard: 0 });
    pill(this, 600, 89, 'EVERY JOURNEY HAS A PAUSE', { width: 326, size: 14 });
    label(this, 600, 154, 'Rest up, brave traveler.', 41, '#355c4c').setOrigin(0.5);
    label(this, 600, 206, 'The lagoon will be here when you’re ready.', 19, '#587b66').setOrigin(0.5);
    const traveler = drawAxie(this, 600, 379, { kind: 'traveler', scale: 1.35, idle: false });
    traveler.setAngle(-8).setAlpha(0.8);
    label(this, 708, 302, 'z', 24, '#617e69');
    label(this, 735, 278, 'z', 18, '#617e69');
    pill(this, 600, 521, `ROOM ${this.state.roomIndex + 1} OF 3  ·  ${this.state.dodges} WAVES DODGED`, { width: 329, size: 15 });
    label(this, 600, 571, 'Tip: move out of the blue lane before the wave lands.', 17, '#5c7e66').setOrigin(0.5);
    this.bindKey('keydown-ENTER', () => this.retryEncounter());
  }
}
