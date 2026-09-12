import { characterCards, ultimates } from '../data/playerCards';
import { bosses, dungeonRooms } from '../data/bosses';
import { rankRewards, rankThresholds } from '../data/story';
export const SAVE_KEY = 'atia-adventure-v1';

export function initialState() {
  return { scene: 'intro', phase: 'INTRO', loading: true, introStep: 0, dialogueIndex: 0, tutorialWon: false, prologueComplete: false,
    activeCharacter: 'kotaro', unlockedCharacters: ['kotaro'], amulet: false, xp: 0, level: 1, coins: 0, wood: 0, essence: 0,
    claimedRewards: [], completedStages: [], unlockedStage: 0, selectedStage: 0, tentStage: 0, rescued: [], bonus: 0,
    playerHP: 100, playerMaxHP: 100, enemyHP: 0, enemy: null, roomIndex: 0, tutorial: false, turn: 1,
    selectedAttack: 0, dodgeX: 330, dodgeY: 600, grounded: true, dashReady: true, dashCooldown: 0, dodgeDuration: 6.5, dodgeRemaining: 0, warningRemaining: 0, warningActive: false, dodgeActive: false,
    guard: 0, charge: 0, dodges: 0, hits: 0, lastDamage: 0, cards: characterCards.kotaro, ultimate: ultimates.kotaro,
    message: 'A new story waits beyond the gate.', panel: null, result: null, saveAvailable: true };
}
const profileKeys = ['introStep','dialogueIndex','tutorialWon','prologueComplete','activeCharacter','unlockedCharacters','amulet','xp','coins','wood','essence','claimedRewards','completedStages','unlockedStage','rescued'];
const validIds = new Set(['kotaro','buba']);

export function restoreProfile(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(SAVE_KEY) || 'null');
    if (!saved || saved.version !== 1) return {};
    const clean = {};
    for (const key of ['xp','coins','wood','essence']) clean[key] = Number.isFinite(saved[key]) ? Math.max(0, Math.floor(saved[key])) : 0;
    clean.tutorialWon = saved.tutorialWon === true;
    clean.prologueComplete = saved.prologueComplete === true && clean.tutorialWon;
    clean.amulet = clean.prologueComplete && saved.amulet === true;
    clean.unlockedCharacters = clean.prologueComplete ? ['kotaro','buba'] : ['kotaro'];
    clean.activeCharacter = clean.unlockedCharacters.includes(saved.activeCharacter) ? saved.activeCharacter : 'kotaro';
    clean.claimedRewards = Array.isArray(saved.claimedRewards) ? [...new Set(saved.claimedRewards.filter(x => Number.isInteger(x) && x >= 1 && x <= 5))] : [];
    clean.completedStages = Array.isArray(saved.completedStages) ? [...new Set(saved.completedStages.filter(x => Number.isInteger(x) && x >= 0 && x <= 2))] : [];
    clean.unlockedStage = Math.min(2, clean.completedStages.length ? Math.max(...clean.completedStages) + 1 : 0);
    // The first prototype called the aquatic guardian Momo. Migrate its rescue
    // to Puffy without losing the blessing or letting both entries stack.
    clean.rescued = clean.amulet && Array.isArray(saved.rescued) && saved.rescued.some(x => x?.id === 'puffy' || x?.id === 'momo') ? [{ id:'puffy',name:'Puffy',rescueBonus:bosses.puffy.rescueBonus }] : [];
    clean.introStep = Number.isInteger(saved.introStep) ? Math.max(0,Math.min(3,saved.introStep)) : 0;
    clean.dialogueIndex = Number.isInteger(saved.dialogueIndex) ? Math.max(0,Math.min(5,saved.dialogueIndex)) : 0;
    return clean;
  } catch { return {}; }
}
export function derive(state) {
  const level = rankThresholds.reduce((rank, threshold, i) => state.xp >= threshold ? i + 1 : rank, 1);
  const active = validIds.has(state.activeCharacter) ? state.activeCharacter : 'kotaro';
  return { ...state, level, tentStage: level >= 5 ? 2 : level >= 3 ? 1 : 0,
    playerMaxHP: active === 'buba' ? 110 : 100, cards: characterCards[active], ultimate: ultimates[active],
    bonus: state.rescued.some(x => x.id === 'puffy') ? .05 : 0,
    rankXP: state.xp - rankThresholds[level - 1], nextRankXP: level < 5 ? rankThresholds[level] - rankThresholds[level - 1] : 0,
    availableRewards: rankRewards.filter(r => r.rank <= level && !state.claimedRewards.includes(r.rank)).length };
}
export function createSession(onState, { storage = null } = {}) {
  let lastSaved = '';
  const profile = restoreProfile(storage);
  const state = derive({ ...initialState(), ...profile, saveAvailable: Boolean(storage) });
  state.playerHP = state.playerMaxHP;
  if (state.prologueComplete) state.scene = 'village';
  else if (state.tutorialWon) state.scene = 'dialogue';
  return {
    state, handler: null,
    resetSave() {
      // Remove only Atia's profile. A blocked deletion must leave the current
      // adventure intact, so the UI can report the failure and offer a retry.
      try { storage?.removeItem(SAVE_KEY); } catch { return false; }
      this.state = derive({ ...initialState(), saveAvailable: Boolean(storage) });
      lastSaved = '';
      this.emit();
      return true;
    },
    patch(update) { this.state = derive({ ...this.state, ...update }); this.emit(); return this.state; },
    emit() {
      if (storage) {
        const profile = { version:1 }; profileKeys.forEach(key => { profile[key] = this.state[key]; });
        const json = JSON.stringify(profile);
        if (lastSaved !== json) { try { storage.setItem(SAVE_KEY, json); lastSaved = json; } catch { this.state.saveAvailable = false; } }
      }
      onState?.({ ...this.state });
    },
    prepareEncounter(index = 0, tutorial = false) {
      const enemy = tutorial ? bosses.buba : dungeonRooms[index];
      if (!enemy || (!tutorial && (!this.state.prologueComplete || index > this.state.unlockedStage))) return false;
      this.patch({ tutorial, roomIndex:index, enemy, enemyHP:enemy.maxHP, playerHP:this.state.playerMaxHP, guard:0, charge:0,
        turn:1, selectedAttack:0, dodgeX:330, dodgeY:600, grounded:true, dashReady:true, dashCooldown:0, dodgeActive:false, warningActive:false, dodges:0, hits:0, lastDamage:0, result:null, panel:null });
      return true;
    },
    finishTutorial() {
      if (!this.state.tutorialWon) this.patch({ tutorialWon:true, xp:this.state.xp + 60, coins:this.state.coins + 50, dialogueIndex:0 });
    },
    finishPrologue() { if(!this.state.tutorialWon)return false; this.patch({ prologueComplete:true, amulet:true, unlockedCharacters:['kotaro','buba'], panel:null, playerHP:this.state.playerMaxHP }); return true; },
    completeStage(index) {
      if (!Number.isInteger(index) || index < 0 || index > 2 || !this.state.prologueComplete) return null;
      const first = !this.state.completedStages.includes(index);
      const xp = first ? dungeonRooms[index].xp : 20;
      this.patch({ xp:this.state.xp + xp, coins:this.state.coins + (first ? 40 : 15), essence:this.state.essence + 10,
        completedStages: first ? [...this.state.completedStages,index] : this.state.completedStages,
        unlockedStage:Math.min(2,Math.max(this.state.unlockedStage,index + 1)) });
      return { xp, coins:first ? 40 : 15, first };
    },
    rescue(boss = bosses.puffy) {
      if (!this.state.amulet || this.state.rescued.some(x => x.id === boss.id)) return false;
      this.patch({ rescued:[...this.state.rescued,{id:boss.id,name:'Puffy',rescueBonus:boss.rescueBonus}] }); return true;
    },
    healAtVillage() {
      if (this.state.scene !== 'village' || !this.state.prologueComplete || !this.state.rescued.some(x => x.id === 'puffy')) return 0;
      const healed = Math.max(0, this.state.playerMaxHP - this.state.playerHP);
      if (!healed) return 0;
      this.patch({ playerHP:this.state.playerMaxHP, message:'Puffy restores ' + healed + ' health. You’re ready for another adventure.' });
      return healed;
    },
    claimReward(rank) {
      const reward = rankRewards.find(r => r.rank === rank);
      if (!this.state.prologueComplete || !reward || rank > this.state.level || this.state.claimedRewards.includes(rank)) return false;
      this.patch({ coins:this.state.coins + reward.coins, wood:this.state.wood + reward.wood, claimedRewards:[...this.state.claimedRewards,rank], message:'Supplies claimed. A little more hope for Atia.' });return true;
    },
    selectCharacter(id) {
      if (!this.state.prologueComplete || !this.state.unlockedCharacters.includes(id) || this.state.scene === 'combat') return false;
      this.patch({ activeCharacter:id, playerHP:id === 'buba' ? 110 : 100, message:id === 'buba' ? 'Buba is ready. Sword, shield, and a little courage.' : 'Kotaro takes the lead.' });return true;
    },
    startRun() { return this.prepareEncounter(0,false); },
    command(action,payload) { this.handler?.(action,payload); },
  };
}
