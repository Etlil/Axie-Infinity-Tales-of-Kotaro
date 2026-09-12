export const characterCards = {
  kotaro: [
    { id: 'twin-slash', name: 'Twin Slash', damage: 20, kind: 'attack', description: 'Two blades. One opening.', label: 'STRIKE' },
    { id: 'frostguard', name: 'Frostguard', damage: 12, guard: 14, kind: 'guard', description: 'Block 14 damage this turn.', label: 'GUARD' },
    { id: 'moonstep', name: 'Moonstep', damage: 14, heal: 8, kind: 'heal', description: 'Recover 8 health.', label: 'RECOVER' },
  ],
  buba: [
    { id: 'brave-slash', name: 'Brave Slash', damage: 22, kind: 'attack', description: 'A little beast. A mighty sword.', label: 'STRIKE' },
    { id: 'shield-bash', name: 'Shield Bash', damage: 12, guard: 16, kind: 'guard', description: 'Block 16 damage this turn.', label: 'GUARD' },
    { id: 'bright-stroke', name: 'Bright Stroke', damage: 16, heal: 6, kind: 'heal', description: 'A brushstroke of hope. Heal 6.', label: 'RECOVER' },
  ],
};
export const ultimates = {
  kotaro: { id: 'eclipse', name: 'Moonlit Eclipse', damage: 48, kind: 'ultimate', description: 'A spinning twin-blade finish.' },
  buba: { id: 'paintstorm', name: 'Paintstorm', damage: 44, kind: 'ultimate', description: 'Unleash the paintbrush tail.' },
};
export const playerCards = characterCards.kotaro;
export default playerCards;
