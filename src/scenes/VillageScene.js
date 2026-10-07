import SceneBase,{floatingText} from './SceneBase';
import {TOWN_TILE as TILE,TOWN_START,TOWN_PLACES,townWalkable,nearbyPlace,townPath,townPixel} from '../game/townLayout';
import {addTownArtwork} from '../game/townArt';
import {createTownHover} from '../game/townHover';
import {overworldKotaro} from '../game/kotaroSprites';
import {overworldBuba} from '../game/bubaSprites';
import {fighter} from '../game/world';
import GridWalk from '../game/gridWalk';

export default class VillageScene extends SceneBase{
  constructor(){super('VillageScene');}
  create(){
    const saved=this.state.townPosition;
    this.pos=saved&&townWalkable(saved.x,saved.y)?{...saved}:{...TOWN_START};
    this.held={};this.route=[];this.destination=null;this.queuedDirection=null;this.pendingInteraction=null;this.facing='up';
    this.bindScene('village','VILLAGE','Welcome to Atia. Walk with WASD or the movement pad. Press F or the right button to interact.',{townPosition:this.pos});
    this.placeHover=createTownHover(this,addTownArtwork(this),id=>this.walkTo(id));
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
    this.walker=new GridWalk(this.hero,{tileSize:TILE,position:this.pos,canEnter:p=>townWalkable(p.x,p.y),
      onStart:(from,to)=>{
        const dx=to.x-from.x,dy=to.y-from.y;
        this.facing=dx<0?'left':dx>0?'right':dy<0?'up':'down';
        this.body.walk?.(this.facing,true);this.body.playAction?.('run');
        if(!this.body.walk)this.body.sprite?.setFlipX(this.facing==='right');
      },
      onArrive:p=>{
        this.pos={...p};this.session.patch({townPosition:this.pos});
        if(this.pendingInteraction){const id=this.pendingInteraction;this.pendingInteraction=null;this.interact(id===true?undefined:id);}
        else if(!this.route.length&&this.destination){const id=this.destination;this.destination=null;this.interact(id);}
      }});
    this.cameras.main.startFollow(this.hero,false,.18,.18);
    this.cameras.main.centerOn(at.x,at.y);
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    ['F','E'].forEach(key=>this.bindKey('keydown-'+key,e=>{if(!e.repeat)this.interact();}));
    this.events.on('update',this.tick,this);
    const clear=()=>{this.held={};this.route=[];this.destination=null;this.queuedDirection=null;this.pendingInteraction=null;Object.values(this.keys).forEach(k=>k.reset());this.stopWalking();this.placeHover.hide();};
    this.input.keyboard.on('blur',clear);
    this.events.once('shutdown',()=>{this.events.off('update',this.tick,this);this.input.keyboard.off('blur',clear);});
  }
  stopWalking(){
    if(!this.walker.moving){this.body.walk?.(this.facing,false);this.body.playAction?.('idle');}
  }
  tick(time,delta){
    this.placeHover.update();
    if(this.state.panel||!this.game.input.enabled){
      this.held={};this.route=[];this.destination=null;this.queuedDirection=null;this.pendingInteraction=null;Object.values(this.keys).forEach(k=>k.reset());
      this.body.walk?.(this.facing,false);this.body.playAction?.('idle');return;
    }
    const k=this.keys,h=this.held;
    const dir=h.up||k.W.isDown||k.UP.isDown?'up':h.down||k.S.isDown||k.DOWN.isDown?'down':h.left||k.A.isDown||k.LEFT.isDown?'left':h.right||k.D.isDown||k.RIGHT.isDown?'right':null;
    if(dir){this.route=[];this.destination=null;this.queuedDirection=null;}
    this.walker.update(delta,p=>{
      if(this.state.panel||!this.game.input.enabled||!this.scene.isActive())return null;
      const direction=dir||this.queuedDirection;this.queuedDirection=null;
      const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];
      return d?{x:p.x+d[0],y:p.y+d[1]}:this.route.shift();
    });
    if(this.walker.moving){this.body.walk?.(this.facing,true);this.body.playAction?.('run');}
    else this.stopWalking();
  }
  move(direction){
    if(this.state.panel||!this.game.input.enabled)return;
    if(['up','down','left','right'].includes(direction))this.queuedDirection=direction;
  }
  walkTo(id){
    if(this.state.panel||!this.game.input.enabled)return;
    const target=TOWN_PLACES.find(p=>p.id===id);if(!target)return;
    this.held={};this.queuedDirection=null;this.pendingInteraction=null;
    this.route=townPath(this.walker.target||this.pos,target);this.destination=id;
    this.session.patch({message:'Walking to '+target.name+'. Use WASD or the movement pad to take over.'});
    if(!this.route.length&&!this.walker.moving){this.destination=null;this.interact(id);}
  }
  interact(id){
    if(this.state.panel||!this.game.input.enabled)return;
    if(this.walker.moving){this.route=[];this.destination=null;this.held={};this.queuedDirection=null;this.pendingInteraction=id||true;return;}
    const place=nearbyPlace(this.pos);if(!place||(id&&id!==place.id))return;
    this.route=[];this.destination=null;this.held={};this.queuedDirection=null;this.stopWalking();
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
