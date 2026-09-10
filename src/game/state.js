import { playerCards } from '../data/playerCards';

export function initialState() {
  return {
    scene: 'map',
    phase: 'MAP',
    playerHP: 100,
    playerMaxHP: 100,
    enemy: null,
    enemyHP: 0,
    roomIndex: 0,
    turn: 1,
    rescued: [],
    bonus: 0,
    selectedDungeon: 'momo',
    lane: 1,
    dangerLane: null,
    dodgeRemaining: 0,
    warningRemaining: 0,
    warningActive: false,
    dodgeActive: false,
    guard: 0,
    dodges: 0,
    hits: 0,
    lastDamage: 0,
    message: 'A little courage. A new adventure. Explore Momo’s Lagoon.',
    cards: playerCards,
  };
}

export function createSession(onState) {
  return {
    state: initialState(),
    handler: null,
    patch(update) {
      this.state = { ...this.state, ...update };
      this.emit();
      return this.state;
    },
    emit() {
      if (onState) onState({ ...this.state });
    },
    startRun() {
      this.patch({
        playerHP: 100,
        enemy: null,
        enemyHP: 0,
        roomIndex: 0,
        turn: 1,
        lane: 1,
        dangerLane: null,
        dodgeRemaining: 0,
        warningActive: false,
        dodgeActive: false,
        guard: 0,
        dodges: 0,
        hits: 0,
        lastDamage: 0,
      });
    },
    rescue(boss) {
      if (this.state.rescued.some((axie) => axie.id === boss.id)) return false;
      const rescued = [...this.state.rescued, {
        id: boss.id, name: boss.name, type: boss.type, rescueBonus: boss.rescueBonus,
      }];
      this.patch({
        rescued,
        bonus: rescued.reduce((sum, axie) => sum + (axie.rescueBonus?.value || 0), 0),
      });
      return true;
    },
    command(action, payload) {
      if (this.handler) this.handler(action, payload);
    },
  };
}
