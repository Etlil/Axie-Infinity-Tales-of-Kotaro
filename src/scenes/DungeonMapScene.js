import SceneBase,{label} from './SceneBase';
import {fighter} from '../game/world';
import {dungeonRooms} from '../data/bosses';
import {overworldKotaro} from '../game/kotaroSprites';
import {overworldBuba} from '../game/bubaSprites';
import {TILE,dungeonFor,isFloor,nextStep,moveExplorer,sameTile,createDungeonRun} from '../game/dungeonLayout';

export default class DungeonMapScene extends SceneBase{
  constructor(){super('DungeonMapScene');}
  get run(){return this.state.dungeonRun;}
  create(){
    if(!this.run){this.scene.start('LevelSelectScene');return;}
    this.dungeon=dungeonFor(this.run);const d=this.dungeon,c=d.colors;
    this.busy=false;this.steps=0;this.held={};this.nextMove=0;
    this.bindScene('dungeon','EXPLORING',d.clue);
    this.cameras.main.setBackgroundColor(c.wall);
    this.cameras.main.setBounds(-600,-400,45*TILE+1200,28*TILE+800);
    const g=this.add.graphics();
    for(let y=0;y<28;y++)for(let x=0;x<45;x++){
      const floor=isFloor(x,y,d),px=x*TILE,py=y*TILE;
      g.fillStyle(floor?((x+y)%2?c.floor:c.alternate):c.wall).fillRect(px,py,TILE-1,TILE-1);
      if(!floor){g.fillStyle(c.brick).fillRect(px+3,py+3,TILE-6,9);g.lineStyle(1,0x0d1721).strokeRect(px,py,TILE,TILE);}
      else if((x*7+y*11)%13===0)g.lineStyle(1,c.accent,.25).lineBetween(px+9,py+28,px+24,py+33);
      // Different silhouettes keep the three placeholder biomes recognizable.
      if(!floor&&(x*3+y*7)%19===0){
        g.fillStyle(c.accent,.3);
        if(d.theme==='grove')g.fillCircle(px+24,py+26,12);
        else if(d.theme==='quarry')g.fillTriangle(px+12,py+36,px+24,py+10,px+37,py+36);
        else g.lineStyle(3,c.accent,.35).lineBetween(px+8,py+24,px+39,py+24);
      }
    }
    d.rooms.forEach((r,i)=>{
      label(this,(r.x+r.w/2)*TILE,(r.y+.45)*TILE,d.names[i],14,'#d6e1d0').setOrigin(.5);
      for(const x of [r.x,r.x+r.w-1]){
        this.add.rectangle((x+.5)*TILE,(r.y+.8)*TILE,14,23,c.brick);
        this.add.circle((x+.5)*TILE,(r.y+.65)*TILE,9,c.accent);
      }
    });
    this.add.rectangle((d.start.x+.5)*TILE,(d.start.y+.5)*TILE,36,36,0x75b890,.6).setStrokeStyle(2,0xc7ffe3);
    label(this,(d.start.x+.5)*TILE,(d.start.y+1.3)*TILE,'ENTRANCE',11,'#c7ffe3').setOrigin(.5);
    this.puzzleArt=this.add.container(0,0);
    this.drawPuzzle();
    this.hero=this.add.container((this.run.x+.5)*TILE,(this.run.y+.5)*TILE).setDepth(3);
    this.hero.add(this.add.ellipse(0,0,32,12,0x000000,.3));
    this.actor=this.state.activeCharacter==='buba'?overworldBuba(this,0,0,76):overworldKotaro(this,0,0,76);
    this.hero.add(this.actor);this.facing='down';
    this.enemyPos=d.spawns[this.run.defeated]?{...d.spawns[this.run.defeated]}:null;
    this.isBoss=d.encounters[this.run.defeated]===2;
    if(this.enemyPos){
      this.foe=this.add.container((this.enemyPos.x+.5)*TILE,(this.enemyPos.y+.5)*TILE).setDepth(2);
      const enemy=dungeonRooms[d.encounters[this.run.defeated]];
      this.foeActor=fighter(this,0,-22,enemy.id,.55);this.foe.add(this.foeActor);
      if(enemy.id==='puff')this.tweens.add({targets:this.foeActor,y:-28,duration:800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      this.foe.add(label(this,0,-70,enemy.name,12,'#bdeef3').setOrigin(.5));
    }
    this.cameras.main.startFollow(this.hero,true,.22,.22);
    this.cameras.main.centerOn(this.hero.x,this.hero.y);
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.bindKey('keydown-E',e=>{if(!e.repeat)this.interact();});
    this.events.on('update',this.tick,this);
    const clear=()=>{this.held={};};this.input.keyboard.on('blur',clear);
    this.events.once('shutdown',()=>{this.events.off('update',this.tick,this);this.input.keyboard.off('blur',clear);});
  }
  drawPuzzle(){
    const d=this.dungeon,state=this.run.puzzle;
    this.puzzleArt.removeAll(true);
    const mark=(p,text,color)=>{
      this.puzzleArt.add(this.add.rectangle((p.x+.5)*TILE,(p.y+.5)*TILE,38,38,color,.85).setStrokeStyle(2,0xe8f5ef));
      this.puzzleArt.add(label(this,(p.x+.5)*TILE,(p.y+.5)*TILE,text,18).setOrigin(.5));
    };
    d.keys.forEach((p,i)=>{if(!state.collected.includes(i))mark(p,'K',0xc39a36);});
    d.locks.forEach((p,i)=>{if(!state.unlocked.includes(i))mark(p,'L',0x975447);});
    if(d.exit)mark(d.exit,'↓',0x287fb3);
  }

  tick(time){
    if(!this.run)return;
    if(this.state.panel||!this.game.input.enabled){this.held={};Object.values(this.keys).forEach(key=>key.reset());return;}
    if(this.busy||time<this.nextMove)return;
    const k=this.keys,h=this.held;
    const dir=h.up||k.W.isDown||k.UP.isDown?'up':h.down||k.S.isDown||k.DOWN.isDown?'down':h.left||k.A.isDown||k.LEFT.isDown?'left':h.right||k.D.isDown||k.RIGHT.isDown?'right':null;
    if(dir){this.nextMove=time+180;this.move(dir);}
    else {this.actor.walk?.(this.facing,false);this.actor.playAction?.('idle');}
  }
  move(direction){
    if(!this.run||this.busy||this.state.panel||!this.game.input.enabled)return;
    const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!delta)return;
    const before=this.run,next=moveExplorer(before,...delta);
    if(next===before)return;
    this.facing=direction;this.actor.walk?.(direction,true);this.actor.playAction?.('run');
    if(!this.actor.walk)this.actor.sprite?.setFlipX(direction==='right');
    const picked=next.puzzle.collected.length>before.puzzle.collected.length;
    const opened=next.puzzle.unlocked.length>before.puzzle.unlocked.length;
    this.session.patch({dungeonRun:next,...(picked?{message:'Key found! Walk into a lock to use it.'}:opened?{message:'Lock opened. The way is clear.'}:{})});
    this.steps++;this.drawPuzzle();
    this.tweens.add({targets:this.hero,x:(next.x+.5)*TILE,y:(next.y+.5)*TILE,duration:140});
    if(this.dungeon.exit&&sameTile(next,this.dungeon.exit)){
      this.busy=true;this.held={};this.cameras.main.fadeOut(220);
      this.time.delayedCall(220,()=>{this.session.patch({dungeonRun:createDungeonRun(0,next.floor+1),message:'You descend deeper into Aqua Cave.'});this.scene.restart();});
      return;
    }
    if(this.contact())return;
    // Preserve the chase: one enemy step for every two player steps, through corridors.
    if(this.enemyPos&&!this.isBoss&&this.steps%2===0){
      const previous=this.enemyPos;
      this.enemyPos=nextStep(this.enemyPos,next,this.run);
      const dx=this.enemyPos.x-previous.x,dy=this.enemyPos.y-previous.y;
      if(dx||dy)this.foeActor.walk?.(dx<0?'left':dx>0?'right':dy<0?'up':'down');
      this.tweens.add({targets:this.foe,x:(this.enemyPos.x+.5)*TILE,y:(this.enemyPos.y+.5)*TILE,duration:140});
      this.contact();
    }
  }
  interact(){
    if(!this.run||this.busy||this.state.panel||!this.game.input.enabled)return;
    this.session.patch({message:this.dungeon.clue});
  }

  contact(){
    if(!this.enemyPos||!sameTile(this.run,this.enemyPos))return false;
    this.busy=true;this.held={};
    this.session.patch({phase:'ENCOUNTER_CONTACT',message:this.isBoss?'Puffy blocks your path!':dungeonRooms[this.dungeon.encounters[this.run.defeated]].name+' approaches!'});
    this.cameras.main.flash(240,160,210,210);
    this.time.delayedCall(260,()=>{if(this.session.prepareEncounter(this.dungeon.encounters[this.run.defeated],false))this.scene.start('CombatScene');else this.scene.restart();});
    return true;
  }
  onCommand(action,payload){
    if(action==='dungeonInput'&&['up','down','left','right'].includes(payload?.direction))this.held[payload.direction]=Boolean(payload.pressed);
    if(action==='dungeonStep')this.move(payload);
    if(action==='interactPuzzle')this.interact();
  }
}
