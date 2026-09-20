export const characterCards = {
  kotaro: [
    { id: 'slash', name: 'Slash', part: 'back', damage: 20, kind: 'attack', description: 'Rush forward and slash your opponent.', label: 'SLASH' },
    { id: 'bash', name: 'Bash', part: 'back', damage: 5, guard: 20, kind: 'guard', description: 'Dash into your opponent. Gain 20 shield.', label: 'SHIELD' },
  ],
  buba: [
    { id: 'slash', name: 'Slash', part: 'back', damage: 20, kind: 'attack', description: 'Rush forward and slash your opponent.', label: 'SLASH' },
    { id: 'bash', name: 'Bash', part: 'back', damage: 5, guard: 20, kind: 'guard', description: 'Dash into your opponent. Gain 20 shield.', label: 'SHIELD' },
  ],
};
export const ultimates = {
  kotaro: { id: 'eclipse', name: 'Moonlit Eclipse', part: 'back', damage: 48, kind: 'ultimate', description: 'A spinning twin-blade finish.' },
  buba: { id: 'paintstorm', name: 'Paintstorm', part: 'tail', damage: 44, kind: 'ultimate', description: 'Unleash the paintbrush tail.' },
};
export const playerCards = characterCards.kotaro;
export default playerCards;
