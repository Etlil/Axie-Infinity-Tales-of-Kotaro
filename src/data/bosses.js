export const bosses = {
  momo: {
    id: 'momo',
    name: 'Momo',
    type: 'Aqua',
    maxHP: 100,
    cards: [
      { id: 'water-missile', name: 'Water Missile', damage: 20 },
      { id: 'ripple', name: 'Ripple', damage: 15 },
      { id: 'tide-slam', name: 'Tide Slam', damage: 25 },
    ],
    dodgePattern: 'lane_flash',
    rescueBonus: { stat: 'dodgeAccuracy', value: 0.05 },
  },
};

export const dungeonRooms = [
  {
    id: 'lagoon-sprout',
    name: 'Lagoon Sprout',
    type: 'Plant',
    maxHP: 26,
    cards: [{ id: 'leaf-splash', name: 'Leaf Splash', damage: 10 }],
    dodgePattern: 'lane_flash',
    location: 'The Overgrown Path',
  },
  {
    id: 'ripple-sprout',
    name: 'Ripple Sprout',
    type: 'Plant',
    maxHP: 38,
    cards: [{ id: 'ripple-rush', name: 'Ripple Rush', damage: 12 }],
    dodgePattern: 'lane_flash',
    location: 'The Shallow Crossing',
  },
  { ...bosses.momo, location: 'The Lagoon Guardian' },
];

export default bosses;
