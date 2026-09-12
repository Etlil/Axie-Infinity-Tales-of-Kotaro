export const bosses = {
  buba: { id: 'buba', name: 'Buba', type: 'Beast', maxHP: 120, dodgePattern: 'platform_arena', cards: [
    { id: 'sword', pattern: 'sweep', name: 'Sword Rush', damage: 12 },
    { id: 'shield', pattern: 'shield', name: 'Shield Bash', damage: 16 },
    { id: 'paintstorm', pattern: 'rain', name: 'Paintstorm', damage: 26, ultimate: true },
  ] },
  momo: { id: 'momo', name: 'Corrupted Momo', type: 'Aqua', maxHP: 132, dodgePattern: 'platform_arena', rescueBonus: { stat: 'dodgeAccuracy', value: 0.05 }, cards: [
    { id: 'wave', pattern: 'wave', name: 'Nightmare Wave', damage: 24 },
    { id: 'ripple', pattern: 'aimed', name: 'Dark Ripple', damage: 18 },
    { id: 'tide', pattern: 'tide', name: 'Tide of Shadows', damage: 32, ultimate: true },
  ] },
};
export const dungeonRooms = [
  { id: 'thornling', name: 'Corrupted Thornling', type: 'Plant', maxHP: 60, location: 'Whispering Woods', xp: 30, cards: [{ id: 'thorns', pattern: 'thorns', name: 'Thorn Rush', damage: 14 }], dodgePattern: 'platform_arena' },
  { id: 'wisp', name: 'Nightmare Wisp', type: 'Dusk', maxHP: 84, location: 'The Hollow Crossing', xp: 45, cards: [{ id: 'mist', pattern: 'aimed', name: 'Violet Mist', damage: 18 }, { id: 'shroud', pattern: 'rain', name: 'Shadowfall', damage: 22 }], dodgePattern: 'platform_arena' },
  { ...bosses.momo, location: 'Momo’s Lagoon', xp: 90 },
];
export const routeNodes = [
  { id: 0, x: 270, y: 610, title: 'Whispering Woods', subtitle: 'Follow the missing villagers', type: 'encounter' },
  { id: 1, x: 485, y: 455, title: 'The Hollow Crossing', subtitle: 'Something stirs in the mist', type: 'encounter' },
  { id: 2, x: 765, y: 390, title: 'Momo’s Lagoon', subtitle: 'A friend behind the corruption', type: 'boss' },
  { id: 3, x: 925, y: 215, title: 'The Ashen Trail', subtitle: 'A future chapter', type: 'locked' },
  { id: 4, x: 660, y: 115, title: 'Beyond the Veil', subtitle: 'A future chapter', type: 'locked' },
];
export default bosses;
