import SceneBase, { floatingText } from './SceneBase';
import { backdrop, fighter, slash, paintBurst } from '../game/world';
import DodgeSystem from '../entities/DodgeSystem';

const LANES = [360, 600, 840];
const LANE_NAMES = ['left', 'center', 'right'];
const LANE_SEQUENCE = [1, 0, 2, 1, 2, 0];

export default class CombatScene extends SceneBase {
  constructor() { super('CombatScene'); }
  create() {
    this.enemy = this.state.enemy;
    this.dodgeView = { lane: 1, dangerLane: null, dodgeActive: false, warningActive: false };
    this.lastPublishedDodge = '';
    backdrop(this, this.state.tutorial ? 'village' : this.enemy.id === 'momo' ? 'lagoon' : 'battle', { image: false });
    this.bindScene('combat', 'PLAYER_TURN', 'Choose an ability. Watch the warning, then tap a safe lane.', { enemyCard: null });
    this.player = fighter(this, 320, 460, this.state.activeCharacter, 1.35);
    this.enemySprite = fighter(this, 890, 445, this.enemy.id === 'buba' ? 'buba' : this.enemy.id === 'momo' ? 'momo' : 'mob', 1.35, 'left');
    this.laneGraphics = this.add.graphics().setDepth(5);
    this.player.setDepth(8);
    LANES.forEach((x, index) => this.add.zone(x, 592, 218, 160).setDepth(10).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.dodge.moveLane(index)));
    this.dodge = new DodgeSystem(this, { bonus: this.state.bonus, initialLane: 1,
      onUpdate: view => this.onDodgeUpdate(view), onResolve: result => this.resolveDodge(result) });
    this.state.cards.forEach((card, index) => this.bindKey('keydown-' + ['ONE', 'TWO', 'THREE'][index], () => this.playCard(card.id)));
    this.bindKey('keydown-FOUR', () => this.playCard(this.state.ultimate.id));
    this.events.once('shutdown', () => this.dodge.destroy());
  }
  paintLanes() {
    this.laneGraphics.clear();
    if (!this.dodgeView.dodgeActive) return;
    LANES.forEach((x, i) => {
      const danger = this.dodgeView.warningActive && this.dodgeView.dangerLane === i;
      const selected = this.dodgeView.lane === i;
      const water = this.enemy.id === 'momo';
      this.laneGraphics.fillStyle(danger ? water ? 0x358bb0 : 0xc15f7b : selected ? 0xd7b96c : 0x18362d, .68).fillRoundedRect(x - 106, 520, 212, 134, 22);
      this.laneGraphics.lineStyle(danger ? 5 : 2, danger ? water ? 0xa2e4f4 : 0xffa0b6 : selected ? 0xffe6a2 : 0xabc4b2, .9).strokeRoundedRect(x - 106, 520, 212, 134, 22);
      if (danger) this.laneGraphics.lineStyle(5, 0xffebd2, .8).lineBetween(x - 20, 544, x + 20, 584).lineBetween(x + 20, 544, x - 20, 584);
      if (danger && water) for (let row = 0; row < 2; row++) {
        this.laneGraphics.lineStyle(3, 0xd6f7ff, .7).beginPath();
        for (let step = 0; step <= 32; step++) {
          const px = x - 96 + step * 6, py = 610 + row * 20 + Math.sin(step * .4 + this.time.now / 150) * 5;
          if (step === 0) this.laneGraphics.moveTo(px, py); else this.laneGraphics.lineTo(px, py);
        }
        this.laneGraphics.strokePath();
      }
    });
  }
  playCard(id) {
    if (this.state.phase !== 'PLAYER_TURN') return;
    const ultimate = id === this.state.ultimate.id;
    const card = ultimate ? this.state.ultimate : this.state.cards.find(entry => entry.id === id);
    if (!card || (ultimate && this.state.charge < 3)) return;
    this.session.patch({ phase: 'PLAYER_ATTACK_ANIM', message: card.name + '! ' + card.damage + ' damage.',
      guard: card.guard || 0, charge: ultimate ? 0 : Math.min(3, this.state.charge + 1),
      playerHP: Math.min(this.state.playerMaxHP, this.state.playerHP + (card.heal || 0)) });
    this.player.playAction(ultimate ? 'ultimate' : 'attack');
    if (card.guard && this.player.shield) this.player.bringToTop(this.player.shield);
    this.tweens.add({ targets: this.player, x: ultimate ? 605 : 490, duration: 190, yoyo: true, hold: 120, ease: 'Sine.easeOut' });
    this.time.delayedCall(240, () => {
      this.session.patch({ enemyHP: Math.max(0, this.state.enemyHP - card.damage) });
      if (this.state.activeCharacter === 'buba' && (ultimate || card.kind === 'heal')) paintBurst(this, 850, 405);
      else slash(this, 850, 420, ultimate ? 0xe2c8ff : 0xc9eeff, ultimate);
      if (card.guard) {
        const ring = this.add.ellipse(320, 455, 175, 205).setStrokeStyle(5, 0xbddcff, .8).setDepth(12);
        this.tweens.add({ targets: ring, alpha: 0, duration: 750, onComplete: () => ring.destroy() });
      }
      floatingText(this, 890, 325, '−' + card.damage);
      if (card.heal) floatingText(this, 320, 340, '+' + card.heal, '#b3efbe');
      this.enemySprite.playAction('hit');
      this.tweens.add({ targets: this.enemySprite, alpha: .45, duration: 90, yoyo: true, repeat: 1 });
    });
    this.time.delayedCall(800, () => this.state.enemyHP <= 0 ? this.winEncounter() : this.telegraph());
  }
  telegraph() {
    this.enemyCard = this.enemy.cards[(this.state.turn - 1) % this.enemy.cards.length];
    this.session.patch({ phase: 'BOSS_TELEGRAPH', enemyCard: this.enemyCard, message: this.enemy.name + ' is preparing ' + this.enemyCard.name + '.' });
    this.tweens.add({ targets: this.enemySprite, angle: -6, duration: 120, yoyo: true, repeat: 1 });
    this.time.delayedCall(650, () => this.startDodge());
  }
  startDodge() {
    this.session.patch({ phase: 'DODGE_PHASE', message: 'Watch for the marked lane. Tap either safe lane.' });
    this.lastPublishedDodge = '';
    this.tweens.killTweensOf(this.player);
    this.player.playAction('run');
    this.tweens.add({ targets: this.player, x: LANES[this.dodge.lane], y: 588, scaleX: .78, scaleY: .78, angle: 0, duration: 220, onComplete: () => this.player.playAction('idle') });
    this.dodge.start({ dangerLane: LANE_SEQUENCE[(this.state.turn - 1 + this.state.roomIndex) % LANE_SEQUENCE.length], damage: this.enemyCard.damage });
  }
  onDodgeUpdate(view) {
    const moved = this.dodgeView.lane !== view.lane;
    this.dodgeView = view;
    if (moved) {
      this.tweens.killTweensOf(this.player);
      this.player.playAction('run');
      this.tweens.add({ targets: this.player, x: LANES[view.lane], y: 588, scaleX: .78, scaleY: .78, duration: 95, onComplete: () => this.player.playAction('idle') });
    }
    this.paintLanes();
    const tenth = Math.ceil(view.dodgeRemaining * 10) / 10;
    const key = view.lane + ':' + view.dangerLane + ':' + tenth;
    if (key !== this.lastPublishedDodge) {
      this.lastPublishedDodge = key;
      this.session.patch({ ...view, dodgeRemaining: tenth, warningRemaining: Math.ceil(view.warningRemaining * 10) / 10,
        message: view.warningActive ? 'Danger in the ' + LANE_NAMES[view.dangerLane] + ' lane. Move now!' : 'Get ready… the danger lane appears in the final second.' });
    }
  }
  resolveDodge(result) {
    const damage = Math.max(0, result.damage - this.state.guard);
    const message = result.hit ? damage ? 'Caught! −' + damage + ' HP.' : 'Shield held. No damage!' : 'Perfect dodge. No damage!';
    this.enemySprite.playAction(this.enemyCard.ultimate ? 'ultimate' : 'attack');
    if (this.enemy.id === 'buba' && this.enemyCard.ultimate) paintBurst(this, LANES[result.dangerLane], 575);
    else slash(this, LANES[result.dangerLane], 585, this.enemy.id === 'buba' ? 0xffdf95 : 0xd6a4f1, !!this.enemyCard.ultimate);
    this.session.patch({ phase: 'RESOLVE_DODGE', playerHP: Math.max(0, this.state.playerHP - damage), lastDamage: damage,
      hits: this.state.hits + (result.hit ? 1 : 0), dodges: this.state.dodges + (result.hit ? 0 : 1),
      dodgeActive: false, warningActive: false, dodgeRemaining: 0, warningRemaining: 0, dangerLane: null, message });
    this.dodgeView = { ...this.dodgeView, dodgeActive: false, warningActive: false, dangerLane: null };
    this.paintLanes();
    floatingText(this, LANES[result.lane], 498, damage ? '−' + damage : result.hit ? 'BLOCKED' : 'DODGED', damage ? '#ffb4ba' : '#c9efb4');
    if (damage) { this.player.playAction('hit'); this.cameras.main.shake(120, .003); }
    this.time.delayedCall(800, () => {
      if (this.state.playerHP <= 0) this.scene.start('DefeatScene');
      else {
        this.tweens.killTweensOf(this.player);
        this.player.playAction('idle');
        this.tweens.add({ targets: this.player, x: 320, y: 460, scaleX: 1.35, scaleY: 1.35, alpha: 1, duration: 200 });
        this.session.patch({ turn: this.state.turn + 1, guard: 0, phase: 'PLAYER_TURN', message: 'Your turn. Every three abilities charge your ultimate.' });
      }
    });
  }
  winEncounter() {
    this.session.patch({ phase: 'ENCOUNTER_WON', message: this.state.tutorial ? 'Buba lowers his sword…' : 'The nightmare falters.' });
    this.tweens.add({ targets: this.enemySprite, alpha: .4, duration: 400 });
    this.time.delayedCall(600, () => {
      if (this.state.tutorial) { this.session.finishTutorial(); this.scene.start('DialogueScene'); }
      else {
        const result = this.enemy.id === 'momo' && !this.state.rescued.some(x => x.id === 'momo')
          ? { kind: 'purify' } : { kind: 'cleared', ...this.session.completeStage(this.state.roomIndex) };
        this.session.patch({ result });
        this.scene.start('VictoryScene');
      }
    });
  }
  onCommand(action, payload) {
    if (action === 'playCard') this.playCard(typeof payload === 'object' ? payload.id : payload);
    if (action === 'moveLane') this.dodge.moveLane(Number(payload));
  }
}
