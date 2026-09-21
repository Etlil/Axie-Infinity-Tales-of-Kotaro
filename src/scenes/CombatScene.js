import SceneBase, { floatingText } from './SceneBase';
import { backdrop, fighter, slash } from '../game/world';
import { drawArena, drawHazards } from '../game/dodgeWorld';
import DodgeSystem from '../entities/DodgeSystem';
import {BubaProjectiles} from '../game/bubaSprites';

export default class CombatScene extends SceneBase {
  constructor(){super('CombatScene');}
  create(){
    this.enemy=this.state.enemy;this.time.paused=false;this.tweens.resumeAll();
    this.reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.lastPublishedDodge='';this.lastAction='';this.jumpLessonShown=false;
    const arenaKey=this.enemy.id==='buba'||this.state.tutorial?'buba-arena':this.state.roomIndex===2?'lagoon-arena':'forest-arena';
    const arena=this.add.image(600,400,arenaKey).setDepth(-100);
    const cover=Math.max(1200/arena.width,800/arena.height);
    arena.setScale(cover);
    backdrop(this,this.state.tutorial?'village':this.enemy.id==='puffy'?'lagoon':'battle',{image:false});
    this.bindScene('combat','PLAYER_FOCUS','Take a breath. Choose your next move.',{enemyCard:null,selectedAttack:0});
    this.player=fighter(this,320,460,this.state.activeCharacter,1.35).setDepth(8);
    this.enemySprite=fighter(this,890,445,this.enemy.id==='buba'?'buba':this.enemy.id==='puffy'?'puffy':this.enemy.id.startsWith('slime')?'slime':'mob',1.35,'left');
    this.enemySprite.setCorrupted?.(this.enemy.id==='puffy');
    this.arenaGraphics=this.add.graphics().setDepth(4);
    this.hazardGraphics=this.add.graphics().setDepth(12);
    this.bubaProjectiles=new BubaProjectiles(this);
    this.dodge=new DodgeSystem(this,{bonus:this.state.bonus,onUpdate:view=>this.onDodgeUpdate(view),
      onTutorial:waiting=>{this.freezeWorld(waiting);this.session.patch({jumpTutorial:waiting});},
      onHit:hit=>this.takeHit(hit),onResolve:result=>this.resolveDodge(result),
      onLaunch:kind=>this.enemySprite.playAction(kind==='buba-dash'?'dash':kind==='mushroom'?'mushroom':this.enemyCard?.ultimate?'ultimate':'attack')});
    this.state.cards.forEach((card,i)=>this.bindKey('keydown-'+['ONE','TWO','THREE','FOUR'][i],()=>this.playCard(card.id)));
    this.bindKey('keydown-X',()=>this.playCard(this.state.cards[this.state.selectedAttack||0].id));
    ['A','LEFT'].forEach(key=>this.bindKey('keydown-'+key,()=>this.selectAttack((this.state.selectedAttack+this.state.cards.length-1)%this.state.cards.length)));
    ['D','RIGHT'].forEach(key=>this.bindKey('keydown-'+key,()=>this.selectAttack((this.state.selectedAttack+1)%this.state.cards.length)));
    this.events.once('shutdown',()=>{this.cameraTween?.stop();this.bubaProjectiles.clear();this.dodge.destroy();this.time.paused=false;});
    this.beginEncounter();
  }
  beginEncounter(){
    if(this.state.tutorial&&this.enemy.id==='buba')this.telegraph(true);
    else this.beginPlayerTurn();
  }
  cameraMove(x,y,zoom,duration,ease='Cubic.easeOut'){
    const camera=this.cameras.main;
    this.cameraTween?.stop();
    const pose={x:camera.scrollX+camera.width/2,y:camera.scrollY+camera.height/2,zoom:camera.zoom};
    const apply=()=>{
      camera.setZoom(pose.zoom).centerOn(pose.x,pose.y);
    };
    if(this.reducedMotion){Object.assign(pose,{x,y,zoom:1});apply();return;}
    this.cameraTween=this.tweens.add({targets:pose,x,y,zoom,duration,ease,onUpdate:apply,onComplete:apply});
  }
  freezeWorld(frozen){
    this.time.paused=frozen;
    if(frozen)this.tweens.pauseAll();else this.tweens.resumeAll();
    [this.player,this.enemySprite].forEach(actor=>{
      if(frozen)actor.sprite?.anims.pause();else actor.sprite?.anims.resume();
    });
  }
  beginPlayerTurn(){
    this.dodge.stop();this.arenaGraphics.clear();this.hazardGraphics.clear();
    this.bubaProjectiles?.clear();this.mushroomInFlight=false;
    this.tweens.killTweensOf(this.player);this.tweens.killTweensOf(this.enemySprite);
    this.player.setPosition(320,460).setScale(1.35).setAngle(0).setAlpha(1);this.player.playAction('stance');
    if(this.player.setFacing)this.player.setFacing('right');else this.player.sprite?.setFlipX(true);
    this.enemySprite.setPosition(890,445).setScale(1.35*(['buba','puffy'].includes(this.enemy.id)?1:1.65)).setAngle(0);this.enemySprite.playAction('idle');
    this.enemySprite.setFacing?.('left');
    this.session.patch({phase:'PLAYER_FOCUS',dodgeActive:false,enemyCard:null,guard:0,selectedAttack:0,message:'Take a breath. Your move.'});
    this.freezeWorld(false);
    const duration=this.reducedMotion?0:620;
    this.cameraMove(510,420,1.32,240);
    if(!this.reducedMotion)this.time.delayedCall(240,()=>this.cameraMove(525,420,1.25,380,'Sine.easeOut'));
    if(!this.reducedMotion)[this.player,this.enemySprite].forEach((actor,i)=>this.tweens.add({targets:actor,y:actor.y-7,duration:1050+i*130,yoyo:true,repeat:-1,ease:'Sine.easeInOut'}));
    this.time.delayedCall(duration,()=>{
      this.session.patch({phase:'PLAYER_TURN',message:'Time is held. Choose a move, then press X or tap its card.'});
    });
  }
  selectAttack(index){if(this.state.phase==='PLAYER_TURN'&&Number.isInteger(index)&&index>=0&&index<this.state.cards.length)this.session.patch({selectedAttack:index});}
  playCard(id) {
    if (this.state.phase !== 'PLAYER_TURN') return;
    const card = this.state.cards.find(entry => entry.id === id);
    if (!card) return;
    this.freezeWorld(false);
    this.cameraMove(775,435,1.4,150,'Cubic.easeIn');
    this.session.patch({ phase: 'PLAYER_ATTACK_ANIM', message: card.name + '! ' + card.damage + ' damage.',
      guard: card.guard || 0, charge: 0,
      playerHP: Math.min(this.state.playerMaxHP, this.state.playerHP + (card.heal || 0)) });
    // A fast tap may arrive during the previous return-to-position tween.
    this.tweens.killTweensOf(this.player);
    this.tweens.killTweensOf(this.enemySprite);this.enemySprite.setPosition(890,445);
    this.player.setPosition(320,460).setScale(1.35).setAngle(0);
    this.player.playAction(card.id==='slash'?'stance':this.player.kind==='kotaro'?'stance':'idle');
    if (card.guard && this.player.shield) this.player.bringToTop(this.player.shield);
    this.tweens.add({targets:this.player,x:735,duration:150,ease:'Cubic.easeIn',onComplete:()=>{
      if(card.id==='slash'){
        this.player.playAction('attack');slash(this,850,425,0xe5f5ff);
      }else{
        this.tweens.add({targets:this.enemySprite,x:920,angle:5,duration:90,yoyo:true});
        const impact=this.add.circle(830,445,20,0xffe7a3,.65).setDepth(12);
        this.tweens.add({targets:impact,scale:2.3,alpha:0,duration:220,onComplete:()=>impact.destroy()});
      }
      if(!this.reducedMotion)this.cameras.main.shake(90,.003);
      this.cameraMove(805,435,1.48,65);
      this.time.delayedCall(110,()=>this.cameraMove(740,425,1.3,360,'Sine.easeOut'));
      this.time.delayedCall(180,()=>this.tweens.add({targets:this.player,x:320,duration:200,ease:'Sine.easeOut'}));
    }});
    this.time.delayedCall(360, () => {
      const minimum=this.state.tutorial&&this.enemy.id==='buba'?Math.min(this.state.enemyHP,this.enemy.maxHP/2):0;
      this.session.patch({ enemyHP: Math.max(minimum, this.state.enemyHP - card.damage) });
      if (card.guard) {
        const ring = this.add.ellipse(320, 455, 175, 205).setStrokeStyle(5, 0xbddcff, .8).setDepth(12);
        this.tweens.add({ targets: ring, alpha: 0, duration: 750, onComplete: () => ring.destroy() });
      }
      floatingText(this, 890, 325, '−' + card.damage);
      if (card.heal) floatingText(this, 320, 340, '+' + card.heal, '#b3efbe');
      this.enemySprite.playAction('hit');
      this.tweens.add({ targets: this.enemySprite, alpha: .45, duration: 90, yoyo: true, repeat: 1 });
    });
    this.time.delayedCall(800, () => {
      const threshold=this.state.tutorial&&this.enemy.id==='buba'?this.enemy.maxHP/2:0;
      if(this.state.enemyHP<=threshold)this.winEncounter();else this.telegraph();
    });
  }
  telegraph(opening=false){
    this.enemyCard=this.enemy.cards[opening?0:(this.state.turn-1)%this.enemy.cards.length];
    const message=this.enemyCard.pattern==='buba-dash'?'Buba lunges from the right, then returns from the left. Jump or dash through his sword!'
      :this.enemyCard.pattern==='buba-mushroom'?'Buba throws his back mushroom. Watch for its glowing return arc!'
        :this.enemy.name+' readies '+this.enemyCard.name+'. Get ready to move!';
    this.session.patch({phase:'BOSS_TELEGRAPH',enemyCard:this.enemyCard,message});
    this.cameraMove(600,400,1,420,'Sine.easeInOut');
    this.tweens.add({targets:this.enemySprite,angle:-6,duration:120,yoyo:true,repeat:1});
    this.time.delayedCall(650,()=>this.startDodge());
  }
  startDodge(){
    this.lastPublishedDodge='';this.lastAction='';this.lastEnemyAction='';
    this.tweens.killTweensOf(this.player);this.tweens.killTweensOf(this.enemySprite);
    this.player.setScale(.75).setAngle(0);this.enemySprite.setPosition(1040,540).setScale(.82*(['buba','puffy'].includes(this.enemy.id)?1:1.65)).setAngle(0);
    drawArena(this.arenaGraphics,this.enemy.id==='puffy');
    this.session.patch({phase:'DODGE_PHASE',dodgeActive:true,dodgeDuration:6.5,jumpTutorial:false,message:'Move freely. Jump over low attacks; dash through danger.'});
    const tutorialJump=this.state.tutorial&&this.enemy.id==='buba'&&!this.jumpLessonShown;
    this.jumpLessonShown=true;
    this.dodge.start({pattern:this.enemyCard.pattern,damage:this.enemyCard.damage,tutorialJump,platforms:this.enemy.id==='puffy'});
  }
  onDodgeUpdate(view){
    const p=view.player;
    this.player.setPosition(p.x,p.y-57).setScale(.75).setAngle(p.dash>0?p.facing*8:p.grounded?0:Math.max(-12,Math.min(12,p.vy/50)));
    this.player.setAlpha(p.invulnerable>210?(Math.floor(p.invulnerable/90)%2?.45:1):1);
    const action=this.player.kind==='buba'&&p.invulnerable>400?'hit':!p.grounded?'jump':Math.abs(p.vx)>30?'run':'idle';
    if(this.lastAction!==action){this.player.playAction(action);this.lastAction=action;}
    if(this.player.setFacing)this.player.setFacing(p.facing===1?'right':'left');else this.player.sprite?.setFlipX(p.facing===1);
    if(view.opponent&&this.enemy.id==='buba'){
      const opponent=view.opponent;
      this.enemySprite.setPosition(opponent.x,opponent.y).setScale(.82);
      this.enemySprite.setFacing?.(opponent.facing>0?'right':'left');
      const action=opponent.charging?'dash':'idle';
      if(this.lastEnemyAction!==action){this.enemySprite.playAction(action);this.lastEnemyAction=action;}
    }
    drawHazards(this.hazardGraphics,view,this.enemy.id);
    this.bubaProjectiles?.update(view.shots);
    const mushroomInFlight=view.shots.some(shot=>shot.kind==='mushroom');
    if(this.mushroomInFlight&&!mushroomInFlight)this.enemySprite.playAction('recover');
    this.mushroomInFlight=mushroomInFlight;
    const portrait=window.innerHeight>window.innerWidth;
    this.cameras.main.centerOn(portrait?p.x:600,portrait?440:400);
    const tenth=Math.ceil(view.dodgeRemaining*10)/10;
    const key=tenth+':'+view.hits;
    if(key!==this.lastPublishedDodge){this.lastPublishedDodge=key;
      this.session.patch({dodgeRemaining:tenth,dodgeX:Math.round(p.x),dodgeY:Math.round(p.y),grounded:p.grounded,
        dashReady:p.cooldown<=0,dashCooldown:p.cooldown/1000,warningActive:view.warnings.length>0});
    }
  }
  takeHit(hit){
    if(this.state.phase!=='DODGE_PHASE')return;
    const absorbed=Math.min(this.state.guard,hit.damage),damage=hit.damage-absorbed;
    this.session.patch({playerHP:Math.max(0,this.state.playerHP-damage),guard:this.state.guard-absorbed,
      hits:this.state.hits+1,lastDamage:damage,message:damage?'Hit! Keep moving.': 'Shield absorbed the hit!'});
    floatingText(this,hit.x,hit.y,damage?'-'+damage:'BLOCKED',damage?'#ffb4ba':'#bff5d6');
    if(damage&&!this.reducedMotion)this.cameras.main.shake(100,.002);
    if(this.state.playerHP<=0){
      this.dodge.stop();this.session.patch({phase:'RESOLVE_DODGE',dodgeActive:false});
      this.time.delayedCall(450,()=>this.scene.start('DefeatScene'));
    }
  }
  resolveDodge(result){
    this.hazardGraphics.clear();
    this.bubaProjectiles?.clear();
    this.session.patch({phase:'RESOLVE_DODGE',dodges:this.state.dodges+(result.hits?0:1),dodgeActive:false,
      warningActive:false,dodgeRemaining:0,message:result.hits?'You held on. Find your opening.':'Untouched. Your opening!'});
    this.time.delayedCall(500,()=>{this.session.patch({turn:this.state.turn+1});this.beginPlayerTurn();});
  }
  winEncounter() {
    if(this.state.phase==='ENCOUNTER_WON')return;
    this.dodge.stop();
    this.session.patch({ phase: 'ENCOUNTER_WON', message: this.state.tutorial ? 'Buba lowers his sword…' : 'The nightmare falters.' });
    this.enemySprite.playAction('idle');
    if(!this.state.tutorial)this.tweens.add({ targets: this.enemySprite, alpha: .4, duration: 400 });
    this.time.delayedCall(600, () => {
      if (this.state.tutorial) { this.session.finishTutorial(); this.scene.start('DialogueScene'); }
      else {
        const result = this.state.dungeonRun ? this.session.finishDungeonEncounter() :
          this.enemy.id === 'puffy' && !this.state.rescued.some(x => x.id === 'puffy')
            ? { kind: 'purify' } : { kind: 'cleared', ...this.session.completeStage(this.state.roomIndex) };
        this.session.patch({ result });
        this.scene.start('VictoryScene');
      }
    });
  }
  onCommand(action,payload){
    if(action==='playCard')this.playCard(typeof payload==='object'?payload.id:payload);
    if(action==='selectAttack')this.selectAttack(Number(payload));
    if(action==='dodgeInput')this.dodge.setControl(payload.control,payload.pressed,payload.source);
  }
}
