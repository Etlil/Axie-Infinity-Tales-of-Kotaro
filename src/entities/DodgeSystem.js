const isLane = (lane) => Number.isInteger(lane) && lane >= 0 && lane <= 2;
const DODGE_KEYS = [
  ['A', 65, 0], ['LEFT', 37, 0],
  ['S', 83, 1], ['DOWN', 40, 1],
  ['D', 68, 2], ['RIGHT', 39, 2],
];

/** Bonus is a fraction: 0.05 grants five percent more reaction time. */
export function getDodgeTiming(bonus = 0) {
  const multiplier = 1 + (Number.isFinite(bonus) ? Math.max(0, Math.min(1, bonus)) : 0);
  return { duration: 3000 * multiplier, warningDuration: 1000 * multiplier };
}

export function resolveLaneHit(lane, dangerLane, damage) {
  const hit = isLane(lane) && isLane(dangerLane) && lane === dangerLane;
  return {
    hit,
    damage: hit && Number.isFinite(damage) ? Math.max(0, damage) : 0,
    lane,
    dangerLane,
  };
}

/** Scene-owned timing and input. CombatScene owns rendering and health changes. */
export default class DodgeSystem {
  constructor(scene, { onUpdate = () => {}, onResolve = () => {}, bonus = 0, initialLane = 1 } = {}) {
    this.scene = scene;
    this.onUpdate = onUpdate;
    this.onResolve = onResolve;
    this.bonus = bonus;
    this.lane = isLane(initialLane) ? initialLane : 1;
    this.active = false;
    this.destroyed = false;
    this.timer = null;
    this.ownedCaptures = [];
    this.keyboard = scene.input?.keyboard;
    this.handleUpdate = () => this.emitUpdate();
    this.handleShutdown = () => this.destroy();
    this.keyHandlers = DODGE_KEYS.map(([key, , lane]) => {
      const handler = () => this.moveLane(lane);
      this.keyboard?.on(`keydown-${key}`, handler);
      return [`keydown-${key}`, handler];
    });
    this.scene.events.once('shutdown', this.handleShutdown);
  }

  start({ dangerLane, damage, duration = 3000 }) {
    if (this.destroyed) return false;
    if (!isLane(dangerLane)) throw new RangeError('dangerLane must be 0, 1, or 2.');
    this.stop();
    const timing = getDodgeTiming(this.bonus);
    const baseDuration = Number.isFinite(duration) && duration > 0 ? duration : 3000;
    this.duration = baseDuration * (timing.duration / 3000);
    this.warningDuration = Math.min(this.duration, timing.warningDuration);
    this.dangerLane = dangerLane;
    this.damage = damage;
    this.endsAt = this.scene.time.now + this.duration;
    this.active = true;

    // Captures are global inside Phaser, so preserve keys owned by other systems
    // and release only our additions as soon as this dodge phase ends.
    if (this.keyboard?.addCapture) {
      const existing = this.keyboard.getCaptures?.() || [];
      this.ownedCaptures = DODGE_KEYS.map(([, code]) => code).filter((code) => !existing.includes(code));
      this.keyboard.addCapture(this.ownedCaptures);
    }
    this.scene.events.on('update', this.handleUpdate);
    this.timer = this.scene.time.delayedCall(this.duration, () => this.resolve());
    this.emitUpdate();
    return true;
  }

  moveLane(lane) {
    if (!this.active || !isLane(lane)) return false;
    this.lane = lane;
    this.emitUpdate();
    return true;
  }

  emitUpdate() {
    if (!this.active) return;
    const remaining = Math.max(0, this.endsAt - this.scene.time.now);
    const warningActive = remaining <= this.warningDuration;
    this.onUpdate({
      lane: this.lane,
      dangerLane: warningActive ? this.dangerLane : null,
      dodgeRemaining: remaining / 1000,
      warningRemaining: warningActive ? remaining / 1000 : 0,
      warningActive,
      dodgeActive: true,
    });
  }

  resolve() {
    if (!this.active) return;
    const result = resolveLaneHit(this.lane, this.dangerLane, this.damage);
    this.stop();
    this.onResolve(result);
  }

  /** Cancel pending damage without resolving the current attack. */
  stop() {
    this.active = false;
    this.timer?.remove(false);
    this.timer = null;
    this.scene.events.off('update', this.handleUpdate);
    if (this.ownedCaptures.length) this.keyboard?.removeCapture(this.ownedCaptures);
    this.ownedCaptures = [];
  }

  destroy() {
    if (this.destroyed) return;
    this.stop();
    this.destroyed = true;
    this.keyHandlers.forEach(([event, handler]) => this.keyboard?.off(event, handler));
    this.scene.events.off('shutdown', this.handleShutdown);
  }
}
