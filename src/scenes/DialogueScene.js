import SceneBase from './SceneBase';
import {backdrop,fighter} from '../game/world';
export default class DialogueScene extends SceneBase{
  constructor(){super('DialogueScene');}
  create(){
    backdrop(this,'village',{image:false});this.bindScene('dialogue','DIALOGUE','The first step toward rebuilding Atia.');
    fighter(this,490,550,'kotaro',1.15);fighter(this,720,535,'buba',1.25,'left');
    if(this.state.dialogueIndex>=4){
      const glow=this.add.circle(609,418,34,0xe4dcac,.24);
      this.add.star(609,418,4,9,24,0xffe1a0).setStrokeStyle(2,0xfff4d6);
      this.tweens.add({targets:glow,alpha:.7,scale:1.3,duration:1100,yoyo:true,repeat:-1});
    }
    this.bindKey('keydown-ENTER',()=>this.next());
  }
  next(){if(this.state.dialogueIndex<5){this.session.patch({dialogueIndex:this.state.dialogueIndex+1});this.scene.restart();}
    else{this.session.finishPrologue();this.scene.start('VillageScene');}}
  onCommand(action){if(action==='nextDialogue')this.next();}
}
