import SceneBase, { label, pill, floatingText } from './SceneBase';
import { renderWorld, drawAxie } from '../game/art';
import { dungeonRooms } from '../data/bosses';
import { playerCards } from '../data/playerCards';
import DodgeSystem from '../entities/DodgeSystem';

const LANES = [360, 600, 840];
const LANE_NAMES = ['LEFT', 'CENTER', 'RIGHT'];
const LANE_SEQUENCE = [1, 0, 2, 1, 2, 0];

export default class CombatScene extends SceneBase {
  constructor() { super('CombatScene'); }

  create() {
    this.enemy = dungeonRooms[this.state.roomIndex];
    this.attackOrigin = { x: 265, y: 393 };
    this.dodgeView = { lane: 1, dangerLane: null, dodgeActive: false, dodgeRemaining: 0, warningActive: false };
    this.lastPublishedDodge = '';
    renderWorld(this, 'combat');
    this.bindScene('combat', 'PLAYER_TURN', 'Your turn. Choose an ability, then get ready to dodge.', {
      enemy: this.enemy, enemyHP: this.enemy.maxHP, turn: 1, lane: 1, guard: 0,
    });

    this.hud = this.add.graphics().setDepth(20);
    this.playerName = label(this, 64, 47, 'YOUR TRAVELER', 14, '#507666').setDepth(21).setLetterSpacing(1.3);
    this.enemyName = label(this, 1136, 47, this.enemy.name.toUpperCase(), 14, '#507666').setOrigin(1, 0).setDepth(21).setLetterSpacing(1.3);
    this.playerHealth = label(this, 64, 99, '', 14, '#4e725e').setDepth(21);
    this.enemyHealth = label(this, 1136, 99, '', 14, '#4e725e').setOrigin(1, 0).setDepth(21);
    this.turnLabel = pill(this, 600, 65, 'TURN 01', { width: 136, size: 14 }).setDepth(21);
    this.phaseLabel = label(this, 600, 104, 'YOUR TURN', 12, '#5e8b72').setOrigin(0.5).setDepth(21).setLetterSpacing(1.3);
    label(this, 600, 183, this.enemy.id === 'momo' ? 'THE LAGOON GUARDIAN' : `CLEARING ${this.state.roomIndex + 1}`, 12, '#5c8369').setOrigin(0.5).setLetterSpacing(2);
    this.actionLabel = label(this, 600, 219, 'A little courage goes a long way.', 19, '#456d5b').setOrigin(0.5);

    this.player = drawAxie(this, this.attackOrigin.x, this.attackOrigin.y, { kind: 'traveler', scale: 0.96, idle: false });
    this.enemySprite = drawAxie(this, 932, 386, { kind: this.enemy.id === 'momo' ? 'momo' : 'mob', scale: this.enemy.id === 'momo' ? 1.12 : 0.92, flip: true, idle: false });
    label(this, 265, 454, 'TRAVELER', 12, '#5d806a').setOrigin(0.5).setLetterSpacing(1.8);
    label(this, 932, 454, this.enemy.name.toUpperCase(), 12, '#5d806a').setOrigin(0.5).setLetterSpacing(1.8);
    this.laneGraphics = this.add.graphics().setDepth(5);
    this.player.setDepth(8);
    this.laneLabels = LANES.map((x, index) => label(this, x, 602, `${['A / ←', 'S / ↓', 'D / →'][index]}   ${LANE_NAMES[index]}`, 12, '#688576').setOrigin(0.5).setDepth(9));
    LANES.forEach((x, index) => this.add.zone(x, 548, 220, 133).setDepth(10).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.dodge.moveLane(index)));
    this.timerLabel = label(this, 600, 641, 'CHOOSE AN ABILITY BELOW  ·  1 / 2 / 3', 11, '#688576').setOrigin(0.5).setDepth(9).setLetterSpacing(1);

    const patterns = { lane_flash: DodgeSystem };
    const Pattern = patterns[this.enemy.dodgePattern] || DodgeSystem;
    this.dodge = new Pattern(this, {
      bonus: this.state.bonus,
      initialLane: this.state.lane,
      onUpdate: (view) => this.onDodgeUpdate(view),
      onResolve: (result) => this.resolveDodge(result),
    });
    playerCards.forEach((card, index) => this.bindKey(`keydown-${['ONE', 'TWO', 'THREE'][index]}`, () => this.playCard(card.id)));
    this.events.once('shutdown', () => this.dodge.destroy());
    this.paintHealth();
    this.paintLanes();
  }

  paintHealth() {
    this.hud.clear();
    const drawBar = (x, fraction, color) => {
      this.hud.fillStyle(0xfffbee, 0.92).fillRoundedRect(x - 9, 72, 338, 23, 11);
      this.hud.fillStyle(0xd8e0ba).fillRoundedRect(x, 79, 320, 9, 4);
      if (fraction > 0) this.hud.fillStyle(color).fillRoundedRect(x, 79, 320 * fraction, 9, 4);
    };
    drawBar(65, this.state.playerHP / this.state.playerMaxHP, 0x79a477);
    drawBar(815, this.state.enemyHP / this.enemy.maxHP, this.enemy.id === 'momo' ? 0x61b6ad : 0x95ac65);
    this.playerHealth.setText(`${this.state.playerHP} / ${this.state.playerMaxHP} HP${this.state.guard ? `  ·  ${this.state.guard} GUARD` : ''}`);
    this.enemyHealth.setText(`${this.state.enemyHP} / ${this.enemy.maxHP} HP`);
  }

  paintLanes() {
    const view = this.dodgeView;
    this.laneGraphics.clear();
    LANES.forEach((x, index) => {
      const danger = view.warningActive && view.dangerLane === index;
      const selected = view.dodgeActive && view.lane === index;
      this.laneGraphics.fillStyle(danger ? 0x68bdd0 : selected ? 0xd9e7af : 0xf6f1d8, danger ? 0.94 : 0.73).fillRoundedRect(x - 110, 487, 220, 131, 18);
      this.laneGraphics.lineStyle(danger ? 3 : 1.5, danger ? 0x248fb3 : selected ? 0x83a465 : 0x9cb691, danger ? 1 : 0.58).strokeRoundedRect(x - 110, 487, 220, 131, 18);
      if (danger) {
        for (let wave = 0; wave < 3; wave += 1) {
          this.laneGraphics.lineStyle(2, 0xe2f8e6, 0.78).beginPath();
          for (let step = 0; step <= 36; step += 1) {
            const px = x - 90 + step * 5;
            const py = 517 + wave * 21 + Math.sin(step * 0.35 + this.time.now / 150) * 6;
            if (!step) this.laneGraphics.moveTo(px, py); else this.laneGraphics.lineTo(px, py);
          }
          this.laneGraphics.strokePath();
        }
      }
      this.laneLabels[index].setColor(danger ? '#14546b' : selected ? '#4c7150' : '#7f9680');
    });
    if (view.dodgeActive) {
      const total = view.warningActive ? 1 * (1 + this.state.bonus) : 3 * (1 + this.state.bonus);
      const left = view.warningActive ? view.warningRemaining : view.dodgeRemaining;
      this.laneGraphics.fillStyle(0xc1d4af, 0.8).fillRoundedRect(250, 627, 700, 5, 2);
      this.laneGraphics.fillStyle(view.warningActive ? 0x389eb3 : 0x81a372).fillRoundedRect(250, 627, Math.max(1, 700 * left / total), 5, 2);
    }
  }

  setPhase(phase, message, title) {
    this.session.patch({ phase, message });
    if (title) this.phaseLabel.setText(title);
    this.turnLabel.list[1].setText(`TURN ${String(this.state.turn).padStart(2, '0')}`);
  }

  playCard(id) {
    if (this.state.phase !== 'PLAYER_TURN') return;
    const card = playerCards.find((entry) => entry.id === id);
    if (!card) return;
    this.setPhase('PLAYER_ATTACK_ANIM', `${card.name}! ${card.damage} damage.`, 'YOUR ATTACK');
    this.actionLabel.setText(card.name);
    this.session.patch({ guard: card.guard || 0, playerHP: Math.min(this.state.playerMaxHP, this.state.playerHP + (card.heal || 0)) });
    this.tweens.add({ targets: this.player, x: this.attackOrigin.x + 90, angle: -7, duration: 150, yoyo: true, ease: 'Sine.easeOut' });
    this.time.delayedCall(170, () => {
      this.session.patch({ enemyHP: Math.max(0, this.state.enemyHP - card.damage) });
      this.paintHealth();
      floatingText(this, 932, 289, `−${card.damage}`);
      if (card.heal) floatingText(this, 265, 303, `+${card.heal}`, '#64976e');
      this.tweens.add({ targets: this.enemySprite, x: 946, alpha: 0.45, duration: 80, yoyo: true, repeat: 1, onComplete: () => this.enemySprite.setX(932).setAlpha(1) });
    });
    this.time.delayedCall(600, () => {
      if (this.state.enemyHP <= 0) this.winEncounter();
      else this.telegraph();
    });
  }

  telegraph() {
    this.enemyCard = this.enemy.cards[(this.state.turn - 1) % this.enemy.cards.length];
    this.setPhase('BOSS_TELEGRAPH', `${this.enemy.name} is preparing ${this.enemyCard.name}. Watch for the blue lane!`, 'ENEMY TURN');
    this.actionLabel.setText(`${this.enemyCard.name} is coming…`);
    this.tweens.add({ targets: this.enemySprite, angle: 5, alpha: 0.55, duration: 100, yoyo: true, repeat: 2 });
    this.time.delayedCall(700, () => this.startDodge());
  }

  startDodge() {
    this.setPhase('DODGE_PHASE', 'Watch the lanes. Move away when one lights up blue.', 'GET READY TO DODGE');
    this.actionLabel.setText('Watch the water…');
    this.lastPublishedDodge = '';
    this.tweens.killTweensOf(this.player);
    this.tweens.add({ targets: this.player, x: LANES[this.dodge.lane], y: 552, scaleX: 0.45, scaleY: 0.45, angle: 0, duration: 240, ease: 'Sine.easeOut' });
    this.dodge.start({
      dangerLane: LANE_SEQUENCE[(this.state.turn - 1 + this.state.roomIndex) % LANE_SEQUENCE.length],
      damage: this.enemyCard.damage,
    });
  }

  onDodgeUpdate(view) {
    const moved = this.dodgeView.lane !== view.lane;
    this.dodgeView = view;
    if (moved) {
      this.tweens.killTweensOf(this.player);
      this.tweens.add({ targets: this.player, x: LANES[view.lane], y: 552, scaleX: 0.45, scaleY: 0.45, duration: 100, ease: 'Sine.easeOut' });
    }
    this.paintLanes();
    const tenth = Math.ceil(view.dodgeRemaining * 10) / 10;
    this.timerLabel.setText(view.warningActive ? `WAVE IN ${tenth.toFixed(1)}s  ·  MOVE OUT OF ${LANE_NAMES[view.dangerLane]}` : `GET READY  ·  ${Math.ceil(view.dodgeRemaining)}s  ·  A / S / D OR TAP A LANE`);
    this.actionLabel.setText(view.warningActive ? `${LANE_NAMES[view.dangerLane]} LANE — WAVE INCOMING!` : 'Watch the water…');
    const publishKey = `${view.lane}:${view.dangerLane}:${tenth}`;
    if (publishKey !== this.lastPublishedDodge) {
      this.lastPublishedDodge = publishKey;
      this.session.patch({ ...view, dodgeRemaining: tenth, warningRemaining: Math.ceil(view.warningRemaining * 10) / 10,
        message: view.warningActive ? `Wave in the ${LANE_NAMES[view.dangerLane].toLowerCase()} lane! Move to a safe lane.` : 'Watch the lanes. A blue warning will show where the wave lands.',
      });
    }
  }

  resolveDodge(result) {
    const damage = Math.max(0, result.damage - this.state.guard);
    const message = result.hit
      ? damage ? `The wave caught you. −${damage} HP. You can still do this!` : 'Your vines absorbed the wave. No damage!'
      : 'Clean dodge! You avoided the wave.';
    this.session.patch({
      phase: 'RESOLVE_DODGE',
      playerHP: Math.max(0, this.state.playerHP - damage),
      lastDamage: damage,
      hits: this.state.hits + (result.hit ? 1 : 0),
      dodges: this.state.dodges + (result.hit ? 0 : 1),
      dodgeActive: false,
      warningActive: false,
      dodgeRemaining: 0,
      warningRemaining: 0,
      dangerLane: null,
      message,
    });
    this.dodgeView = { ...this.dodgeView, dodgeActive: false, warningActive: false, dangerLane: null };
    this.paintLanes();
    this.paintHealth();
    this.phaseLabel.setText(result.hit ? damage ? 'CAUGHT BY THE WAVE' : 'GUARDED' : 'PERFECT DODGE');
    this.actionLabel.setText(result.hit ? damage ? 'Shake it off, traveler.' : 'A little protection goes a long way.' : 'Light on your feet. Brave at heart.');
    this.timerLabel.setText(result.hit ? damage ? `−${damage} HP  ·  WATCH THE BLUE WARNING NEXT TIME` : 'GUARD ABSORBED THE WAVE' : 'WAVE AVOIDED  ·  NO DAMAGE');
    floatingText(this, LANES[result.lane], 496, damage ? `−${damage}` : result.hit ? 'BLOCKED' : 'DODGED!', damage ? '#c96553' : '#508668');
    if (damage) {
      this.cameras.main.shake(160, 0.004);
      this.tweens.add({ targets: this.player, alpha: 0.35, duration: 100, yoyo: true, repeat: 2 });
    }
    this.time.delayedCall(850, () => {
      if (this.state.playerHP <= 0) {
        this.scene.start('DefeatScene');
      } else {
        this.tweens.killTweensOf(this.player);
        this.tweens.add({ targets: this.player, x: this.attackOrigin.x, y: this.attackOrigin.y, scaleX: 0.96, scaleY: 0.96, alpha: 1, duration: 220 });
        this.session.patch({ turn: this.state.turn + 1, guard: 0 });
        this.setPhase('PLAYER_TURN', 'Your turn. Choose an ability, then get ready to dodge.', 'YOUR TURN');
        this.actionLabel.setText('Make your next move.');
        this.timerLabel.setText('CHOOSE AN ABILITY BELOW  ·  1 / 2 / 3');
        this.paintHealth();
      }
    });
  }

  winEncounter() {
    this.setPhase('ENCOUNTER_WON', this.enemy.id === 'momo' ? 'The lagoon is peaceful again. Momo is free!' : `${this.enemy.name} stepped aside. The path is clear!`, 'PATH CLEARED');
    this.actionLabel.setText(this.enemy.id === 'momo' ? 'A new friend, a brighter journey.' : 'Onward, little traveler.');
    this.tweens.add({ targets: this.enemySprite, alpha: 0.2, y: 370, duration: 400 });
    this.time.delayedCall(650, () => {
      if (this.enemy.rescueBonus) {
        this.session.rescue(this.enemy);
        this.scene.start('VictoryScene');
      } else {
        this.session.patch({ roomIndex: this.state.roomIndex + 1 });
        this.scene.start('DungeonScene');
      }
    });
  }

  onCommand(action, payload) {
    if (action === 'playCard') this.playCard(typeof payload === 'object' ? payload.id : payload);
    if (action === 'moveLane') this.dodge.moveLane(Number(payload));
  }
}
