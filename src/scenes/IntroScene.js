import SceneBase,{label} from './SceneBase';
import {fighter} from '../game/world';
import {overworldKotaro} from '../game/kotaroSprites';
import {overworldBuba} from '../game/bubaSprites';
import {addTownArtwork} from '../game/townArt';
import {TOWN_START,BUBA_MEETING,townPixel,townWalkable,TOWN_TILE} from '../game/townLayout';

const SIGN={x:633,y:440};
export default class IntroScene extends SceneBase{
  constructor(){super('IntroScene');}
  create(){
    this.held={};this.direction='up';this.busy=false;this.transitioning=false;
    this.bindScene('intro','INTRO_CINEMATIC','A light stirs in the silence.',{introCanInteract:false});
    if(this.state.introStage==='pendant'){this.pendant();return;}
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.bindKey('keydown-F',e=>{if(!e.repeat)this.interact();});
    this.bindKey('keydown-E',e=>{if(!e.repeat)this.interact();});
    if(this.state.introStage==='village')this.village();else this.approach();
    const clear=()=>{this.held={};Object.values(this.keys).forEach(k=>k.reset());};
    this.input.keyboard.on('blur',clear);this.events.on('pause',clear);this.events.on('update',this.tick,this);
    this.events.once('shutdown',()=>{this.input.keyboard.off('blur',clear);this.events.off('pause',clear);this.events.off('update',this.tick,this);});
  }
  pendant(){
    const cam=this.cameras.main;cam.setBackgroundColor('#081623');
    this.add.image(600,400,'stone-table').setDisplaySize(1200,800);
    const glow=this.add.circle(596,451,70,0x7be5fb,.08);
    const pendant=this.add.image(596,445,'moon-pendant').setDisplaySize(170,170).setAngle(-14);
    const hand=this.add.image(1140,1000,'kotaro-hand').setDisplaySize(930,620);
    this.add.rectangle(600,35,1200,70,0x080e19).setDepth(10);this.add.rectangle(600,765,1200,70,0x080e19).setDepth(10);
    cam.fadeIn(900,0,0,0);
    this.tweens.add({targets:glow,alpha:.55,scale:1.35,duration:1150,yoyo:true,repeat:-1});
    this.tweens.add({targets:pendant,angle:-8,duration:1700,yoyo:true,repeat:1});
    this.time.delayedCall(2500,()=>this.tweens.add({targets:hand,x:890,y:574,duration:1700,ease:'Sine.easeInOut',onComplete:()=>{
      this.tweens.add({targets:glow,alpha:0,duration:450});
      this.tweens.add({targets:[hand,pendant],x:'+=380',y:'+=360',duration:1400,delay:400,ease:'Sine.easeIn'});
      this.time.delayedCall(1550,()=>this.leaveCinematic());
    }}));
  }
  leaveCinematic(){
    if(this.transitioning)return;this.transitioning=true;
    this.cameras.main.fadeOut(600,0,0,0);
    this.time.delayedCall(620,()=>{this.session.patch({introStage:'move'});this.scene.restart();});
  }
  approach(){
    this.area='path';const cam=this.cameras.main;
    this.add.image(0,0,'approach-path').setOrigin(0).setDisplaySize(1200,1091);
    cam.setBounds(0,0,1200,1091);cam.setZoom(1.35);
    this.hero=overworldKotaro(this,563,this.state.signRead?300:this.state.introStage==='sign'?575:880,88).setDepth(3);
    this.add.rectangle(SIGN.x,SIGN.y+14,8,48,0x654b36).setAngle(8);
    const board=this.add.graphics({x:SIGN.x,y:SIGN.y-15});
    board.fillStyle(0x9b7547).lineStyle(3,0x493b2c);
    const points=[{x:-35,y:-17},{x:32,y:-20},{x:26,y:-2},{x:36,y:10},{x:-31,y:16}];
    board.fillPoints(points,true);board.strokePoints(points,true);
    label(this,SIGN.x,SIGN.y-19,'A_/…',15,'#e7d2a0').setOrigin(.5).setAngle(-5);
    this.signMarker=label(this,SIGN.x,SIGN.y-70,'!',30,'#ffe497',{stroke:'#533e2a',strokeThickness:5}).setOrigin(.5).setVisible(!this.state.signRead);
    cam.startFollow(this.hero,true,.12,.12);cam.centerOn(this.hero.x,this.hero.y);cam.fadeIn(600,0,0,0);
    this.session.patch({phase:this.state.signRead?'INTRO_PATH':this.state.tutorialDirections.length===4?'INTRO_SIGN':'INTRO_MOVE',introPosition:{x:this.hero.x,y:this.hero.y},message:this.state.signRead?'Follow the road north to the village.':'Find your footing. Move in all four directions.'});
  }
  village(){
    this.area='town';addTownArtwork(this);const start=townPixel(TOWN_START),meeting=townPixel(BUBA_MEETING),cam=this.cameras.main;
    this.hero=overworldKotaro(this,start.x,start.y,88).setDepth(3);
    this.buba=overworldBuba(this,meeting.x,meeting.y+12,88).setDepth(2);
    cam.setZoom(1.2);cam.centerOn(start.x,start.y);cam.fadeIn(600,0,0,0);this.busy=true;
    this.session.patch({phase:'INTRO_REVEAL',message:'Someone is waiting by the well.'});
    cam.pan(meeting.x,meeting.y,1500,'Sine.easeInOut');
    this.time.delayedCall(2300,()=>{cam.pan(start.x,start.y,1200,'Sine.easeInOut');this.time.delayedCall(1250,()=>{
      cam.startFollow(this.hero,true,.12,.12);this.busy=false;this.session.patch({phase:'INTRO_VILLAGE',message:'Follow the road to the stranger at the well.'});
    });});
  }
  revealSign(){
    this.busy=true;this.held={};this.hero.walk(this.direction,false);const cam=this.cameras.main;
    this.session.patch({introStage:'sign',phase:'INTRO_SIGN_PAN',message:'A ruined sign stands beside the road.'});
    cam.stopFollow();cam.pan(SIGN.x,SIGN.y,1000,'Sine.easeInOut');
    this.time.delayedCall(1800,()=>{cam.pan(this.hero.x,this.hero.y,800,'Sine.easeInOut');this.time.delayedCall(850,()=>{
      cam.startFollow(this.hero,true,.12,.12);this.busy=false;this.session.patch({phase:'INTRO_SIGN',message:'Walk up to the ruined sign. Press F to read it.'});
    });});
  }
  tick(time,delta){
    if(this.busy||this.transitioning||this.state.phase==='INTRO_SIGN_TEXT'||this.state.panel||!this.game.input.enabled){this.held={};this.hero?.walk(this.direction,false);return;}
    const k=this.keys,h=this.held;
    const x=Number(Boolean(h.right||k.D.isDown||k.RIGHT.isDown))-Number(Boolean(h.left||k.A.isDown||k.LEFT.isDown));
    const y=Number(Boolean(h.down||k.S.isDown||k.DOWN.isDown))-Number(Boolean(h.up||k.W.isDown||k.UP.isDown));
    const distance=180*Math.min(delta,40)/1000/(x&&y?Math.SQRT2:1),oldX=this.hero.x,oldY=this.hero.y;
    if(x||y){
      this.direction=y?(y<0?'up':'down'):x<0?'left':'right';
      const nx=oldX+x*distance,ny=oldY+y*distance;
      if(this.area==='path'){
        this.hero.x=Math.max(529,Math.min(597,nx));this.hero.y=Math.max(this.state.signRead?30:400,Math.min(1040,ny));
      }else{
        const clear=(px,py)=>[-12,12].every(dx=>[-5,5].every(dy=>townWalkable(Math.floor((px+dx)/TOWN_TILE),Math.floor((py+dy)/TOWN_TILE))));
        if(clear(nx,oldY))this.hero.x=nx;if(clear(this.hero.x,ny))this.hero.y=ny;
      }
      const moving=this.hero.x!==oldX||this.hero.y!==oldY;this.hero.walk(this.direction,moving);
      if(moving&&this.area==='path'&&this.state.tutorialDirections.length<4){
        const directions=[...new Set([...this.state.tutorialDirections,...(this.hero.x!==oldX?[x<0?'left':'right']:[]),...(this.hero.y!==oldY?[y<0?'up':'down']:[])])];
        if(directions.length!==this.state.tutorialDirections.length){this.session.patch({tutorialDirections:directions});if(directions.length===4)this.revealSign();}
      }
    }else this.hero.walk(this.direction,false);
    const near=this.area==='path'&&this.state.tutorialDirections.length===4&&!this.state.signRead&&Math.hypot(this.hero.x-SIGN.x,this.hero.y-SIGN.y)<115;
    if(this.state.introCanInteract!==near||time>(this.nextSnapshot||0)){this.nextSnapshot=time+120;this.session.patch({introCanInteract:near,introPosition:{x:Math.round(this.hero.x),y:Math.round(this.hero.y)}});}
    if(this.area==='path'&&this.state.signRead&&this.hero.y<65){this.transitioning=true;this.cameras.main.fadeOut(500);this.time.delayedCall(520,()=>{this.session.patch({introStage:'village'});this.scene.restart();});}
    if(this.area==='town'){const p=townPixel(BUBA_MEETING);if(Math.hypot(this.hero.x-p.x,this.hero.y-p.y)<155)this.ambush();}
  }
  interact(){
    if(this.busy||this.state.panel||!this.game.input.enabled)return;
    if(this.state.phase==='INTRO_SIGN_TEXT'){
      this.session.patch({signRead:true,phase:'INTRO_PATH',introCanInteract:false,message:'The letters are almost gone. Follow the road north.'});this.signMarker.setVisible(false);
    }else if(this.state.introCanInteract){this.held={};this.session.patch({phase:'INTRO_SIGN_TEXT'});}
  }
  ambush(){
    if(this.busy)return;this.busy=true;this.held={};this.hero.walk('up',false);
    this.session.patch({phase:'INTRO_AMBUSH',message:'!!!'});
    const alert=label(this,this.buba.x,this.buba.y-80,'!!!',44,'#fff2bb',{stroke:'#542d28',strokeThickness:6}).setOrigin(.5);
    this.time.delayedCall(1000,()=>{alert.destroy();const {x,y}=this.buba;this.buba.destroy();this.buba=fighter(this,x,y-40,'buba',.55,'left').setDepth(2);this.buba.playAction('dash');this.tweens.add({targets:this.buba,x:this.hero.x+25,y:this.hero.y-20,duration:300,ease:'Cubic.easeIn',onComplete:()=>{
      this.cameras.main.flash(160,255,238,203);this.cameras.main.shake(160,.006);
      this.time.delayedCall(220,()=>{this.session.prepareEncounter(0,true);this.scene.start('CombatScene');});
    }});});
  }
  onCommand(action,payload){
    if(action==='skipCinematic'&&this.state.introStage==='pendant')this.leaveCinematic();
    if(action==='introInput'&&['up','down','left','right'].includes(payload?.direction))this.held[payload.direction]=Boolean(payload.pressed);
    if(action==='introInteract')this.interact();
  }
}
