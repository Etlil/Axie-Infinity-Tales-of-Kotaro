export const playerCards = [
  {
    id: 'leaf-strike',
    name: 'Leaf Strike',
    damage: 24,
    description: 'A focused strike. Deal 24 damage.',
    kind: 'attack',
    label: 'ATTACK',
  },
  {
    id: 'vine-whip',
    name: 'Vine Whip',
    damage: 18,
    guard: 8,
    description: 'Deal 18 damage. Block 8 damage this turn.',
    kind: 'guard',
    label: 'GUARD',
  },
  {
    id: 'moon-beam',
    name: 'Moon Beam',
    damage: 12,
    heal: 8,
    description: 'Deal 12 damage and recover 8 HP.',
    kind: 'heal',
    label: 'RECOVER',
  },
];

export default playerCards;
