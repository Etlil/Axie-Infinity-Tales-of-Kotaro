import SceneBase,{label} from './SceneBase';
import {TILE,dungeonFor,isFloor,gateOpen,nextStep,moveExplorer,sameTile,freshPuzzle,turnValve} from '../game/dungeonLayout';

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
    this.gate=this.add.rectangle((d.gate.x+.5)*TILE,(d.gate.y+.5)*TILE,16,TILE,0xd4b06d);
    this.gateLabel=label(this,(d.gate.x+.5)*TILE,(d.gate.y-.2)*TILE,'SEALED',11,'#ffe5ad').setOrigin(.5);
    this.puzzleArt=this.add.container(0,0);
    this.drawPuzzle();
    this.hero=this.add.container((this.run.x+.5)*TILE,(this.run.y+.5)*TILE).setDepth(3);
    this.hero.add([this.add.ellipse(0,15,32,12,0x000000,.3),this.add.circle(0,0,17,this.state.activeCharacter==='buba'?0xffc34d:0xf1f4fc).setStrokeStyle(3,0x81aaca),this.add.triangle(0,-21,-7,6,0,-6,7,6,0x92d6e9)]);
    this.enemyPos=d.spawns[this.run.defeated]?{...d.spawns[this.run.defeated]}:null;
    this.isBoss=d.encounters[this.run.defeated]===2;
    if(this.enemyPos){
      this.foe=this.add.container((this.enemyPos.x+.5)*TILE,(this.enemyPos.y+.5)*TILE).setDepth(2);
      this.foe.add([this.add.ellipse(0,14,40,13,0x000000,.35),this.add.ellipse(0,0,this.isBoss?48:36,this.isBoss?44:29,this.isBoss?0x53c7df:d.theme==='quarry'?0xe0ad60:0x83cb86).setStrokeStyle(3,this.isBoss?0xb689e6:0x39764d),this.add.circle(-7,-3,3,0x152b33),this.add.circle(7,-3,3,0x152b33)]);
      this.foe.add(label(this,0,-40,this.isBoss?'PUFFY':'SLIME '+(this.run.defeated+1),12,this.isBoss?'#d9b6ff':'#baedb4').setOrigin(.5));
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
    const p=this.dungeon.puzzle,state=this.run.puzzle;
    this.puzzleArt.removeAll(true);
    const add=object=>this.puzzleArt.add(object);
    if(p.type==='crate'){
      add(this.add.rectangle((p.plate.x+.5)*TILE,(p.plate.y+.5)*TILE,38,38,0xc3a148,.7).setStrokeStyle(3,0xffe8a4));
      add(label(this,(p.plate.x+.5)*TILE,(p.plate.y+1.2)*TILE,'PLATE',10).setOrigin(.5));
      add(this.add.rectangle((state.crate.x+.5)*TILE,(state.crate.y+.5)*TILE,32,32,0xca9146).setStrokeStyle(4,0x583c2c));
    }else p.tiles.forEach((tile,i)=>{
      const lit=p.type==='runes'?state.progress>i:!!(state.lamps&(1<<i));
      add(this.add.rectangle((tile.x+.5)*TILE,(tile.y+.5)*TILE,38,38,lit?0xd9c980:0x293e4f).setStrokeStyle(3,lit?0xfff2bc:0x8bb4bd));
      add(label(this,(tile.x+.5)*TILE,(tile.y+.5)*TILE,tile.name,12,lit?'#3e4027':'#def3ef').setOrigin(.5));
      if(p.type==='valves')add(label(this,(tile.x+.5)*TILE,(tile.y+1.2)*TILE,['1+2','2+3','2'][i],10).setOrigin(.5));
    });
    const open=gateOpen(this.run);this.gate.setVisible(!open);this.gateLabel.setText(open?'OPEN':'SEALED');
  }
  tick(time){
    if(!this.run)return;
    if(this.state.panel||!this.game.input.enabled){this.held={};Object.values(this.keys).forEach(key=>key.reset());return;}
    if(this.busy||time<this.nextMove)return;
    const k=this.keys,h=this.held;
    const dir=h.up||k.W.isDown||k.UP.isDown?'up':h.down||k.S.isDown||k.DOWN.isDown?'down':h.left||k.A.isDown||k.LEFT.isDown?'left':h.right||k.D.isDown||k.RIGHT.isDown?'right':null;
    if(dir){this.nextMove=time+180;this.move(dir);}
  }
  move(direction){
    if(!this.run||this.busy||this.state.panel||!this.game.input.enabled)return;
    const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!delta)return;
    const before=this.run,next=moveExplorer(before,...delta);
    if(next===before)return;
    const solved=!before.puzzle.solved&&next.puzzle.solved;
    this.session.patch({dungeonRun:next,...(solved?{message:'Puzzle solved! The seal opens once the nearby slimes are cleared.'}:{})});
    this.steps++;this.drawPuzzle();
    this.tweens.add({targets:this.hero,x:(next.x+.5)*TILE,y:(next.y+.5)*TILE,duration:140});
    if(this.contact())return;
    // Preserve the chase: one slime step for every two player steps, through corridors.
    if(this.enemyPos&&!this.isBoss&&this.steps%2===0){
      this.enemyPos=nextStep(this.enemyPos,next,this.run);
      this.tweens.add({targets:this.foe,x:(this.enemyPos.x+.5)*TILE,y:(this.enemyPos.y+.5)*TILE,duration:140});
      this.contact();
    }
  }
  interact(){
    if(!this.run||this.busy||this.state.panel||!this.game.input.enabled)return;
    const p=this.dungeon.puzzle;
    if(p.type!=='valves')return;
    const index=p.tiles.findIndex(t=>Math.abs(t.x-this.run.x)+Math.abs(t.y-this.run.y)<=1);
    if(index<0)return;
    const puzzle=turnValve(this.run,index);
    this.session.patch({dungeonRun:{...this.run,puzzle},message:puzzle.solved?'All tidal lamps are lit. The engine awakens!':'Valve '+p.tiles[index].name+' turned. Light all three lamps.'});
    this.drawPuzzle();
  }
  contact(){
    if(!this.enemyPos||!sameTile(this.run,this.enemyPos))return false;
    this.busy=true;this.held={};
    this.session.patch({phase:'ENCOUNTER_CONTACT',message:this.isBoss?'Puffy blocks your path!':'A slime approaches!'});
    this.cameras.main.flash(240,160,210,210);
    this.time.delayedCall(260,()=>{if(this.session.prepareEncounter(this.dungeon.encounters[this.run.defeated],false))this.scene.start('CombatScene');else this.scene.restart();});
    return true;
  }
  onCommand(action,payload){
    if(action==='dungeonInput'&&['up','down','left','right'].includes(payload?.direction))this.held[payload.direction]=Boolean(payload.pressed);
    if(action==='dungeonStep')this.move(payload);
    if(action==='interactPuzzle')this.interact();
    if(action==='resetPuzzle'&&!this.busy&&!this.state.panel&&!this.run.puzzle.solved){
      const puzzle=freshPuzzle(this.run.level);
      // Resetting a block must never place it underneath the player or a slime.
      const pos=puzzle.crate&&sameTile(this.run,puzzle.crate)?this.dungeon.start:{x:this.run.x,y:this.run.y};
      this.session.patch({dungeonRun:{...this.run,...pos,puzzle},message:'Puzzle reset. '+this.dungeon.clue});
      this.tweens.killTweensOf(this.hero);this.hero.setPosition((pos.x+.5)*TILE,(pos.y+.5)*TILE);this.drawPuzzle();
    }
  }
}
