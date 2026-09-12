export const characterCards = {
  kotaro: [
    { id: 'horn-lance', name: 'Horn Lance', part: 'horn', damage: 20, kind: 'attack', description: 'Launch an icy lance from your horn.', label: 'STRIKE' },
    { id: 'moon-fang', name: 'Moon Fang', part: 'mouth', damage: 14, heal: 8, kind: 'heal', description: 'A moonlit bite. Recover 8 health.', label: 'RECOVER' },
    { id: 'blade-guard', name: 'Blade Guard', part: 'back', damage: 12, guard: 14, kind: 'guard', description: 'Draw your back blades. Block 14 damage.', label: 'GUARD' },
    { id: 'tail-sweep', name: 'Tail Sweep', part: 'tail', damage: 18, kind: 'attack', description: 'Whip a crescent of light from your tail.', label: 'SWEEP' },
  ],
  buba: [
    { id: 'leaf-horn', name: 'Leaf Horn', part: 'horn', damage: 22, kind: 'attack', description: 'Fire a sharp leaf from your leafy horn.', label: 'STRIKE' },
    { id: 'beast-bite', name: 'Beast Bite', part: 'mouth', damage: 18, kind: 'attack', description: 'Snap your jaws with a mighty beast bite.', label: 'BITE' },
    { id: 'shield-bash', name: 'Shield Bash', part: 'back', damage: 12, guard: 16, kind: 'guard', description: 'Swing your back shield. Block 16 damage.', label: 'GUARD' },
    { id: 'brush-tail', name: 'Brush Tail', part: 'tail', damage: 16, heal: 6, kind: 'heal', description: 'Flick your paintbrush tail. Heal 6.', label: 'RECOVER' },
  ],
};
export const ultimates = {
  kotaro: { id: 'eclipse', name: 'Moonlit Eclipse', part: 'back', damage: 48, kind: 'ultimate', description: 'A spinning twin-blade finish.' },
  buba: { id: 'paintstorm', name: 'Paintstorm', part: 'tail', damage: 44, kind: 'ultimate', description: 'Unleash the paintbrush tail.' },
};
export const playerCards = characterCards.kotaro;
export default playerCards;
