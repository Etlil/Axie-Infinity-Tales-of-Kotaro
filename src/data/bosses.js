export const bosses = {
  buba: { id: 'buba', name: 'Buba', type: 'Beast', maxHP: 120, dodgePattern: 'platform_arena', cards: [
    { id: 'sword', pattern: 'buba-dash', name: 'Crossing Sword Rush', damage: 12 },
    { id: 'mushroom', pattern: 'buba-mushroom', name: 'Back Mushroom Boomerang', damage: 16 },
  ] },
  puffy: { id: 'puffy', name: 'Corrupted Puffy', type: 'Aqua', maxHP: 132, dodgePattern: 'platform_arena', rescueBonus: { stat: 'dodgeAccuracy', value: 0.05 }, cards: [
    { id: 'wave', pattern: 'wave', name: 'Nightmare Wave', damage: 24 },
    { id: 'ripple', pattern: 'aimed', name: 'Dark Ripple', damage: 18 },
    { id: 'tide', pattern: 'tide', name: 'Tide of Shadows', damage: 32, ultimate: true },
  ] },
};
export const dungeonRooms = [
  {id:'puff',name:'Floating Puff',type:'Aqua',maxHP:60,location:'Aqua Cave',xp:30,dodgePattern:'platform_arena',cards:[
    {id:'spin',pattern:'puff-spin',name:'Spin Pursue',damage:14},
    {id:'slam',pattern:'puff-slam',name:'Ground Slam x2',damage:14}]},
  {id:'frog',name:'Frog',type:'Aqua',maxHP:84,location:'Aqua Cave',xp:45,dodgePattern:'platform_arena',cards:[
    {id:'bubble',pattern:'frog-bubble',name:'Bubble Shot',damage:16},
    {id:'tongue',pattern:'frog-tongue',name:'Tongue Dash',damage:14}]},
  { ...bosses.puffy, location: 'Puffy’s Chamber', xp: 90 },
];
export const routeNodes = [
  { id: 0, x: 270, y: 610, title: 'Mossy Hall', subtitle: 'Follow the missing villagers', type: 'encounter' },
  { id: 1, x: 485, y: 455, title: 'Sunken Passage', subtitle: 'Something stirs in the mist', type: 'encounter' },
  { id: 2, x: 765, y: 390, title: 'Puffy’s Chamber', subtitle: 'A friend behind the corruption', type: 'boss' },
  { id: 3, x: 925, y: 215, title: 'The Ashen Trail', subtitle: 'A future chapter', type: 'locked' },
  { id: 4, x: 660, y: 115, title: 'Beyond the Veil', subtitle: 'A future chapter', type: 'locked' },
];
export default bosses;
