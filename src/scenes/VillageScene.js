import SceneBase,{label,floatingText} from './SceneBase';
import {TILE} from '../game/dungeonLayout';
import {TOWN_START,TOWN_SIZE,BUILDINGS,TOWN_PLACES,townWalkable,nearbyPlace,townPath} from '../game/townLayout';
export default class VillageScene extends SceneBase{
  constructor(){super('VillageScene');}
  create(){
    const saved=this.state.townPosition;
    this.pos=saved&&townWalkable(saved.x,saved.y)?{...saved}:{...TOWN_START};
    this.held={};this.route=[];this.destination=null;this.nextMove=0;
    this.bindScene('village','VILLAGE','Walk around Atia. Approach a place and press E, or tap a destination to walk there.',{townPosition:this.pos});
    this.cameras.main.setBackgroundColor('#293d34');
    this.cameras.main.setBounds(-600,-400,TOWN_SIZE.width*TILE+1200,TOWN_SIZE.height*TILE+800);
    const g=this.add.graphics();
    for(let y=0;y<TOWN_SIZE.height;y++)for(let x=0;x<TOWN_SIZE.width;x++){
      const edge=x===0||y===0||x===TOWN_SIZE.width-1||y===TOWN_SIZE.height-1;
      const road=(x>=13&&x<=15)||(y>=10&&y<=11&&x>=5&&x<=27)||(x===26&&y>=5&&y<=10)||(x===6&&y>=9&&y<=10)||(x===23&&y>=11&&y<=19);
      g.fillStyle(edge?0x293d34:road?0x9a8968:(x+y)%2?0x577456:0x536f52).fillRect(x*TILE,y*TILE,TILE-1,TILE-1);
      if(edge)g.fillStyle(0x738069).fillRect(x*TILE+6,y*TILE+6,TILE-12,TILE-12);
    }
    // Flat tile footprints and block markers only; replace these with town assets later.
    BUILDINGS.forEach(b=>{
      const fill=b.id==='tent'?[0x9d794b,0xb69258,0xc9a66b][this.state.tentStage]:b.id==='spring'?0x507e92:b.id==='gate'?0x656e64:b.id==='well'?0x4dabb7:0x68705b;
      this.add.rectangle((b.x+b.w/2)*TILE,(b.y+b.h/2)*TILE,b.w*TILE-8,b.h*TILE-8,0x293a34);
      const inset=b.id==='tent'?24-this.state.tentStage*8:12;
      this.add.rectangle((b.x+b.w/2)*TILE,(b.y+b.h/2)*TILE,b.w*TILE-inset*2,b.h*TILE-inset*2,fill);
      label(this,(b.x+b.w/2)*TILE,(b.y+b.h/2)*TILE,b.id==='tent'?['BUBA’S TENT','MENDED SHELTER','BUBA’S LODGE'][this.state.tentStage]:b.name,14,'#f8edc7').setOrigin(.5);
      if(['gate','tent','spring','well'].includes(b.id))this.add.zone((b.x+b.w/2)*TILE,(b.y+b.h/2)*TILE,b.w*TILE,b.h*TILE).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.walkTo(b.id));
    });
    TOWN_PLACES.forEach(p=>{
      this.add.rectangle((p.x+.5)*TILE,(p.y+.5)*TILE,32,32,0xe5d493,.7).setStrokeStyle(2,0xffefb2);
      label(this,(p.x+.5)*TILE,(p.y+1.3)*TILE,p.id==='gate'?'DUNGEONS':p.id==='tent'?'BUBA':p.id==='spring'?(this.state.rescued.length?'PUFFY':'QUIET SPRING'):'SAVE ★',10).setOrigin(.5);
    });
    if(this.state.activeCharacter!=='buba')this.add.rectangle(6.5*TILE,8.6*TILE,24,25,0xe9b54f).setStrokeStyle(2,0x563d2b);
    if(this.state.rescued.some(r=>r.id==='puffy'))this.add.rectangle(23.5*TILE,17.6*TILE,26,24,0x91dfed).setStrokeStyle(2,0x426879);
    this.hero=this.add.container((this.pos.x+.5)*TILE,(this.pos.y+.5)*TILE).setDepth(3);
    this.body=this.add.rectangle(0,0,26,28,this.state.activeCharacter==='buba'?0xe9b54f:0xf3f5f7).setStrokeStyle(3,0x263e47);
    this.hero.add([this.add.rectangle(0,17,30,7,0x20372b,.4),this.body,this.add.rectangle(-5,-2,3,4,0x324152),this.add.rectangle(5,-2,3,4,0x324152)]);
    this.cameras.main.startFollow(this.hero,true,.22,.22);this.cameras.main.centerOn(this.hero.x,this.hero.y);
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.bindKey('keydown-E',e=>{if(!e.repeat)this.interact();});
    this.events.on('update',this.tick,this);
    const clear=()=>{this.held={};this.route=[];this.destination=null;};this.input.keyboard.on('blur',clear);
    this.events.once('shutdown',()=>{this.events.off('update',this.tick,this);this.input.keyboard.off('blur',clear);});
  }
  tick(time){
    if(this.state.panel||!this.game.input.enabled){this.held={};this.route=[];this.destination=null;Object.values(this.keys).forEach(k=>k.reset());return;}
    if(time<this.nextMove)return;
    const k=this.keys,h=this.held;
    const dir=h.up||k.W.isDown||k.UP.isDown?'up':h.down||k.S.isDown||k.DOWN.isDown?'down':h.left||k.A.isDown||k.LEFT.isDown?'left':h.right||k.D.isDown||k.RIGHT.isDown?'right':null;
    if(dir){this.route=[];this.destination=null;this.move(dir);this.nextMove=time+180;}
    else if(this.route.length){
      const next=this.route.shift();this.walk(next);this.nextMove=time+150;
      if(!this.route.length&&this.destination){const id=this.destination;this.destination=null;this.interact(id);}
    }
  }
  walk(p){
    if(!townWalkable(p.x,p.y))return;
    this.pos={...p};this.session.patch({townPosition:this.pos});
    this.tweens.add({targets:this.hero,x:(p.x+.5)*TILE,y:(p.y+.5)*TILE,duration:130});
    this.tweens.add({targets:this.body,scaleY:.88,duration:65,yoyo:true});
  }
  move(direction){
    if(this.state.panel||!this.game.input.enabled)return;
    const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!d)return;
    this.walk({x:this.pos.x+d[0],y:this.pos.y+d[1]});
  }
  walkTo(id){
    if(this.state.panel||!this.game.input.enabled)return;
    const target=TOWN_PLACES.find(p=>p.id===id);if(!target)return;
    this.held={};this.route=townPath(this.pos,target);this.destination=id;
    this.session.patch({message:'Walking to '+target.name+'. Use the movement pad to take over.'});
    if(!this.route.length)this.interact(id);
  }
  interact(id){
    if(this.state.panel||!this.game.input.enabled)return;
    const place=nearbyPlace(this.pos);if(!place||(id&&id!==place.id))return;
    this.route=[];this.destination=null;this.held={};
    if(place.id==='gate')this.scene.start('LevelSelectScene');
    else if(place.id==='tent')this.session.patch({panel:'rewards'});
    else if(place.id==='well')this.session.patch({panel:'fountain'});
    else if(this.state.rescued.some(r=>r.id==='puffy'))this.session.patch({panel:'healer'});
    else this.session.patch({message:'The spring is quiet. Rescue Puffy in the Sunken Sanctuary to bring its healer home.'});
  }
  onCommand(action,payload){
    if(action==='townInput'&&['up','down','left','right'].includes(payload?.direction))this.held[payload.direction]=Boolean(payload.pressed);
    if(action==='townStep'){this.route=[];this.destination=null;this.move(payload);}
    if(action==='townTravel')this.walkTo(payload);
    if(action==='townInteract')this.interact();
    if(action==='saveAtFountain')this.session.saveAtFountain();
    if(action==='healWithPuffy'){
      const healed=this.session.healAtVillage();
      if(healed)floatingText(this,this.hero.x,this.hero.y-35,'+'+healed+' HP','#b4ffdf');
    }
  }
}
