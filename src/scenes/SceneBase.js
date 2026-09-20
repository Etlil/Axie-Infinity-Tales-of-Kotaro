import Phaser from 'phaser';
export const PALETTE={ink:'#fff4d5',cream:'#fffbea',green:'#50744f',muted:'#adc1af'};
export function label(scene,x,y,text,size=20,color=PALETTE.ink,extra={}){
  return scene.add.text(x,y,text,{fontFamily:'"Changa One", sans-serif',fontSize:size+'px',color,fontStyle:'normal',...extra});
}
export function pill(scene,x,y,text,{width=170,fill=0x223b2e,color='#fff1cd',size=16}={}){
  const root=scene.add.container(x,y),g=scene.add.graphics();
  g.fillStyle(0x493321,.85).fillRoundedRect(-width/2,-16,width,42,12);
  g.fillStyle(fill,.98).fillRoundedRect(-width/2,-21,width,42,12);
  g.lineStyle(3,0x704a2d).strokeRoundedRect(-width/2,-21,width,42,12);
  g.lineStyle(2,0xffefb9,.4).lineBetween(-width/2+13,-16,width/2-13,-16);
  root.add([g,label(scene,0,0,text,size,color).setOrigin(.5)]);return root;
}
export function floatingText(scene,x,y,text,color='#ffe8a7'){
  const t=label(scene,x,y,text,36,color,{stroke:'#21332a',strokeThickness:6}).setOrigin(.5).setDepth(40);
  scene.tweens.add({targets:t,y:y-65,alpha:0,duration:1100,onComplete:()=>t.destroy()});
}
export default class SceneBase extends Phaser.Scene {
  get session(){return this.game.session;}
  get state(){return this.session.state;}
  bindScene(scene,phase,message,extra={}){
    this.session.patch({scene,phase,message,loading:false,panel:null,dangerLane:null,warningActive:false,dodgeActive:false,...extra});
    const handler=(action,payload)=>{
      if(!this.scene.isActive())return;
      if(action==='openPanel' && this.state.scene!=='combat')this.session.patch({panel:payload});
      else if(action==='closePanel')this.session.patch({panel:null});
      else if(action==='claimReward')this.session.claimReward(Number(payload));
      else if(action==='selectCharacter'){
        if(this.session.selectCharacter(payload))this.scene.restart();
      } else if(action==='visitVillage'||action==='returnVillage'){
        if(this.state.prologueComplete){this.session.patch({dungeonRun:null});this.scene.start('VillageScene');}
      } else if(action==='openMap'){
        if(this.state.prologueComplete)this.scene.start('LevelSelectScene');
      } else if(action==='returnMap'){
        if(this.state.prologueComplete)this.scene.start(this.state.result?.kind==='encounter'&&this.state.dungeonRun?'DungeonMapScene':'LevelSelectScene');
      } else if(action==='retry'){
        this.session.prepareEncounter(this.state.roomIndex,this.state.tutorial);this.scene.start('CombatScene');
      } else if(action==='retreat'){
        if(this.state.tutorial){this.session.patch({introStage:'village'});this.scene.start('IntroScene');}
        else {this.session.patch({dungeonRun:null});this.scene.start('VillageScene');}
      } else this.onCommand(action,payload);
    };
    this.session.handler=handler;
    this.events.once('shutdown',()=>{if(this.session.handler===handler)this.session.handler=null;});
  }
  bindKey(event,callback){
    const keyboard=this.input.keyboard;
    const handler=(e)=>{
      const target=e?.target;
      if(target?.isContentEditable||target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
      if(['keydown-ENTER','keydown-SPACE'].includes(event)&&target?.closest?.('button,a,[role="button"]'))return;
      callback(e);
    };
    keyboard.on(event,handler);this.events.once('shutdown',()=>keyboard.off(event,handler));
  }
  onCommand(){}
  enterDungeon(index=this.state.selectedStage){
    if(this.session.prepareEncounter(index,false))this.scene.start('CombatScene');
  }
}
