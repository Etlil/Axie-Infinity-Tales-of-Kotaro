import SceneBase from './SceneBase';
import {backdrop,fighter} from '../game/world';
export default class IntroScene extends SceneBase{
  constructor(){super('IntroScene');}
  create(){
    backdrop(this,'intro',{image:false});this.bindScene('intro','INTRO','Atia has been silent for six months.');
    const step=this.state.introStep;
    const hero=fighter(this,step>=2?505:610,570,'kotaro',1.25);
    if(step>0){hero.playAction('run');this.tweens.add({targets:hero,x:step>=2?535:650,duration:1400,onComplete:()=>hero.playAction('idle')});}
    if(step>=2){const buba=fighter(this,790,535,'buba',1.3,'left');if(step===3)buba.playAction('attack');}
    this.bindKey('keydown-ENTER',()=>this.next());
  }
  next(){
    if(this.state.introStep<3){this.session.patch({introStep:this.state.introStep+1});this.scene.restart();}
    else {this.session.prepareEncounter(0,true);this.scene.start('CombatScene');}
  }
  onCommand(action){if(action==='nextIntro')this.next();}
}
