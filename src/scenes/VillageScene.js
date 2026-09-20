import SceneBase,{label,floatingText} from './SceneBase';
import {TOWN_TILE as TILE,TOWN_START,BUILDINGS,TOWN_PLACES,townWalkable,nearbyPlace,townPath,townPixel} from '../game/townLayout';
import {addTownArtwork} from '../game/townArt';
import {overworldKotaro} from '../game/kotaroSprites';
import {overworldBuba} from '../game/bubaSprites';
import {fighter} from '../game/world';

export default class VillageScene extends SceneBase{
  constructor(){super('VillageScene');}
  create(){
    const saved=this.state.townPosition;
    this.pos=saved&&townWalkable(saved.x,saved.y)?{...saved}:{...TOWN_START};
    this.held={};this.route=[];this.destination=null;this.nextMove=0;this.moving=false;this.facing='up';
    this.bindScene('village','VILLAGE','Welcome to Atia. Walk with WASD or the movement pad. Press F or the right button to interact.',{townPosition:this.pos});
    addTownArtwork(this);
    // Interaction zones sit over the painted landmarks, while their destinations
    // remain on the open road. The map art itself supplies every building.
    BUILDINGS.filter(b=>TOWN_PLACES.some(p=>p.id===b.id)).forEach(b=>{
      this.add.zone((b.x+b.w/2)*TILE,(b.y+b.h/2)*TILE,b.w*TILE,b.h*TILE)
        .setInteractive({useHandCursor:true}).on('pointerdown',()=>this.walkTo(b.id));
    });
    this.placeLabels=TOWN_PLACES.map(p=>{
      const at=townPixel(p);
      const text=p.id==='gate'?'DUNGEONS':p.id==='tent'?'BUBA':p.id==='spring'?'PUFFY’S SPRING':'SAVE ★';
      const marker=label(this,at.x,at.y+30,text,12,'#fff4d5',{backgroundColor:'#24362ec9',padding:{x:8,y:5}}).setOrigin(.5).setDepth(4);
      return {place:p,marker};
    });
    if(this.state.activeCharacter!=='buba'){
      const at=townPixel(TOWN_PLACES.find(p=>p.id==='tent'));
      overworldBuba(this,at.x+32,at.y,76).setDepth(2);
    }
    if(this.state.rescued.some(r=>r.id==='puffy')){
      const at=townPixel(TOWN_PLACES.find(p=>p.id==='spring'));
      fighter(this,at.x+38,at.y-24,'puffy',.34,'left').setDepth(2);
    }
    const at=townPixel(this.pos);
    this.hero=this.add.container(at.x,at.y).setDepth(3);
    this.hero.add(this.add.ellipse(0,0,35,11,0x233525,.28));
    this.body=this.state.activeCharacter==='buba'?overworldBuba(this,0,0,76):overworldKotaro(this,0,0,76);
    this.hero.add(this.body);
    this.body.walk?.(this.facing,false);
    this.cameras.main.startFollow(this.hero,true,.18,.18);
    this.cameras.main.centerOn(at.x,at.y);
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    ['F','E'].forEach(key=>this.bindKey('keydown-'+key,e=>{if(!e.repeat)this.interact();}));
    this.events.on('update',this.tick,this);
    const clear=()=>{this.held={};this.route=[];this.destination=null;this.stopWalking();};
    this.input.keyboard.on('blur',clear);
    this.events.once('shutdown',()=>{this.events.off('update',this.tick,this);this.input.keyboard.off('blur',clear);});
  }
  stopWalking(){
    if(!this.moving){this.body.walk?.(this.facing,false);this.body.playAction?.('idle');}
  }
  tick(time){
    if(this.state.panel||!this.game.input.enabled){
      this.held={};this.route=[];this.destination=null;Object.values(this.keys).forEach(k=>k.reset());this.stopWalking();return;
    }
    if(time<this.nextMove)return;
    const k=this.keys,h=this.held;
    const dir=h.up||k.W.isDown||k.UP.isDown?'up':h.down||k.S.isDown||k.DOWN.isDown?'down':h.left||k.A.isDown||k.LEFT.isDown?'left':h.right||k.D.isDown||k.RIGHT.isDown?'right':null;
    if(dir){this.route=[];this.destination=null;this.move(dir);this.nextMove=time+180;}
    else if(this.route.length){
      const next=this.route.shift();this.walk(next);this.nextMove=time+180;
      if(!this.route.length&&this.destination){
        const id=this.destination,arrival={...this.pos};this.destination=null;
        this.time.delayedCall(175,()=>{
          if(this.pos.x===arrival.x&&this.pos.y===arrival.y&&!this.route.length&&!Object.values(this.held).some(Boolean))this.interact(id);
        });
      }
    } else this.stopWalking();
  }
  walk(p){
    if(!townWalkable(p.x,p.y))return false;
    const dx=p.x-this.pos.x,dy=p.y-this.pos.y;
    if(!dx&&!dy)return false;
    this.facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';
    this.body.walk?.(this.facing,true);
    this.body.playAction?.('run');
    if(!this.body.walk)this.body.sprite?.setFlipX(this.facing==='right');
    this.pos={...p};this.moving=true;this.session.patch({townPosition:this.pos});
    this.tweens.killTweensOf(this.hero);
    this.tweens.add({targets:this.hero,...townPixel(p),duration:175,onComplete:()=>{this.moving=false;}});
    return true;
  }
  move(direction){
    if(this.state.panel||!this.game.input.enabled)return;
    const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!d)return;
    if(!this.walk({x:this.pos.x+d[0],y:this.pos.y+d[1]}))this.stopWalking();
  }
  walkTo(id){
    if(this.state.panel||!this.game.input.enabled)return;
    const target=TOWN_PLACES.find(p=>p.id===id);if(!target)return;
    this.held={};this.route=townPath(this.pos,target);this.destination=id;
    this.session.patch({message:'Walking to '+target.name+'. Use WASD or the movement pad to take over.'});
    if(!this.route.length){this.destination=null;this.interact(id);}
  }
  interact(id){
    if(this.state.panel||!this.game.input.enabled)return;
    const place=nearbyPlace(this.pos);if(!place||(id&&id!==place.id))return;
    this.route=[];this.destination=null;this.held={};this.stopWalking();
    if(place.id==='gate')this.scene.start('LevelSelectScene');
    else if(place.id==='tent')this.session.patch({panel:'rewards'});
    else if(place.id==='well')this.session.patch({panel:'fountain'});
    else if(this.state.rescued.some(r=>r.id==='puffy'))this.session.patch({panel:'healer'});
    else this.session.patch({message:'The spring is quiet. Buba says the nearest Aqua Cave is the first place to look for his friends.'});
  }
  onCommand(action,payload){
    if(action==='townInput'&&['up','down','left','right'].includes(payload?.direction))this.held[payload.direction]=Boolean(payload.pressed);
    if(action==='townStep'){this.route=[];this.destination=null;this.move(payload);}
    if(action==='townTravel')this.walkTo(payload);
    if(action==='townInteract')this.interact();
    if(action==='saveAtFountain')this.session.saveAtFountain();
    if(action==='healWithPuffy'){
      const healed=this.session.healAtVillage();
      if(healed)floatingText(this,this.hero.x,this.hero.y-75,'+'+healed+' HP','#b4ffdf');
    }
  }
}
