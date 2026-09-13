import SceneBase,{label} from './SceneBase';
import {TILE,ROOMS,SPAWNS,START,walkable,nextStep} from '../game/dungeonLayout';

export default class DungeonMapScene extends SceneBase{
  constructor(){super('DungeonMapScene');}
  create(){
    const run=this.state.dungeonRun||{...START,defeated:0};
    this.pos={x:run.x,y:run.y};this.defeated=run.defeated;
    this.busy=false;this.steps=0;this.held={};this.nextMove=0;
    this.bindScene('dungeon','EXPLORING','Explore the chambers. Touch a slime to battle.',{dungeonRun:run});
    this.cameras.main.setBackgroundColor('#111a26');
    this.cameras.main.setBounds(-600,-400,45*TILE+1200,20*TILE+800);
    const g=this.add.graphics();
    for(let y=0;y<20;y++)for(let x=0;x<45;x++){
      const floor=walkable(x,y,2),px=x*TILE,py=y*TILE;
      g.fillStyle(floor?((x+y)%2?0x35444d:0x3b4c55):0x182531).fillRect(px,py,TILE-1,TILE-1);
      if(!floor){g.fillStyle(0x283844).fillRect(px+3,py+3,TILE-6,9);g.lineStyle(1,0x0d1721).strokeRect(px,py,TILE,TILE);}
      else if((x*7+y*11)%13===0)g.lineStyle(1,0x54636a,.45).lineBetween(px+9,py+28,px+24,py+33);
    }
    ROOMS.forEach((r,i)=>{
      label(this,(r.x+r.w/2)*TILE,(r.y+1)*TILE,['MOSSY HALL','THE SUNKEN PASSAGE','PUFFY’S CHAMBER'][i],15,'#a4c1c8').setOrigin(.5);
      for(const x of [r.x,r.x+r.w-1]){
        this.add.rectangle((x+.5)*TILE,(r.y+.5)*TILE,14,23,0x68513e);
        this.add.circle((x+.5)*TILE,(r.y+.35)*TILE,9,0xffce80);
      }
    });
    this.add.rectangle((START.x+.5)*TILE,(START.y+.5)*TILE,36,36,0x75b890,.6).setStrokeStyle(2,0xc7ffe3);
    label(this,(START.x+.5)*TILE,(START.y+1.3)*TILE,'EXIT',11,'#c7ffe3').setOrigin(.5);
    this.gate=this.add.rectangle(30*TILE,10.5*TILE,12,TILE,0xd4b06d).setVisible(this.defeated<2);
    this.hero=this.add.container((run.x+.5)*TILE,(run.y+.5)*TILE);
    this.hero.add([this.add.ellipse(0,15,32,12,0x000000,.3),this.add.circle(0,0,17,this.state.activeCharacter==='buba'?0xffc34d:0xf1f4fc).setStrokeStyle(3,0x81aaca),this.add.triangle(0,-21,-7,6,0,-6,7,6,0x92d6e9)]);
    this.enemyPos=this.defeated<3?{...SPAWNS[this.defeated]}:null;
    if(this.enemyPos){
      const boss=this.defeated===2;
      this.foe=this.add.container((this.enemyPos.x+.5)*TILE,(this.enemyPos.y+.5)*TILE);
      this.foe.add([this.add.ellipse(0,14,40,13,0x000000,.35),this.add.ellipse(0,0,boss?48:36,boss?44:29,boss?0x53c7df:0x83cb86).setStrokeStyle(3,boss?0xb689e6:0x39764d),this.add.circle(-7,-3,3,0x152b33),this.add.circle(7,-3,3,0x152b33)]);
      label(this,this.foe.x,this.foe.y-40,boss?'PUFFY':'SLIME '+(this.defeated+1),12,boss?'#d9b6ff':'#baedb4').setOrigin(.5).setName('enemyLabel');
    }
    this.cameras.main.startFollow(this.hero,true,.22,.22);
    this.cameras.main.centerOn(this.hero.x,this.hero.y);
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.events.on('update',this.tick,this);
    const clear=()=>{this.held={};};
    this.input.keyboard.on('blur',clear);
    this.events.once('shutdown',()=>{this.events.off('update',this.tick,this);this.input.keyboard.off('blur',clear);});
  }
  tick(time){
    if(this.state.panel||!this.game.input.enabled){this.held={};Object.values(this.keys).forEach(key=>key.reset());return;}
    if(this.busy)return;
    if(time<this.nextMove)return;
    const k=this.keys,h=this.held;
    const dir=h.up||k.W.isDown||k.UP.isDown?'up':h.down||k.S.isDown||k.DOWN.isDown?'down':h.left||k.A.isDown||k.LEFT.isDown?'left':h.right||k.D.isDown||k.RIGHT.isDown?'right':null;
    if(dir){this.nextMove=time+180;this.move(dir);}
  }
  move(direction){
    if(this.busy||this.state.panel)return;
    const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!delta)return;
    const p={x:this.pos.x+delta[0],y:this.pos.y+delta[1]};
    if(!walkable(p.x,p.y,this.defeated))return;
    this.pos=p;this.steps++;
    this.tweens.add({targets:this.hero,x:(p.x+.5)*TILE,y:(p.y+.5)*TILE,duration:140});
    this.session.patch({dungeonRun:{...p,defeated:this.defeated}});
    if(this.contact())return;
    // Slimes take one step for every two player steps. Puffy guards his chamber.
    if(this.enemyPos&&this.defeated<2&&this.steps%2===0){
      this.enemyPos=nextStep(this.enemyPos,p,this.defeated);
      this.tweens.add({targets:this.foe,x:(this.enemyPos.x+.5)*TILE,y:(this.enemyPos.y+.5)*TILE,duration:140});
      this.children.getByName('enemyLabel')?.setPosition((this.enemyPos.x+.5)*TILE,(this.enemyPos.y+.5)*TILE-40);
      this.contact();
    }
  }
  contact(){
    if(!this.enemyPos||this.pos.x!==this.enemyPos.x||this.pos.y!==this.enemyPos.y)return false;
    this.busy=true;this.held={};
    this.session.patch({phase:'ENCOUNTER_CONTACT',message:this.defeated===2?'Puffy blocks your path!':'A slime approaches!'});
    this.cameras.main.flash(240,160,210,210);
    this.time.delayedCall(260,()=>{if(this.session.prepareEncounter(this.defeated,false))this.scene.start('CombatScene');else this.scene.restart();});
    return true;
  }
  onCommand(action,payload){
    if(action==='dungeonInput'&&['up','down','left','right'].includes(payload?.direction))this.held[payload.direction]=Boolean(payload.pressed);
    if(action==='dungeonStep')this.move(payload);
  }
}
