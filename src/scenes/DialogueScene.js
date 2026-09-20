import SceneBase from './SceneBase';
import {fighter} from '../game/world';
import {overworldKotaro} from '../game/kotaroSprites';
import {addTownArtwork} from '../game/townArt';
import {BUBA_MEETING,townPixel} from '../game/townLayout';
import {bubaDialogue} from '../data/story';
export default class DialogueScene extends SceneBase{
  constructor(){super('DialogueScene');}
  create(){
    this.ending=false;addTownArtwork(this);this.bindScene('dialogue','DIALOGUE','A stranger becomes a friend.');
    const p=townPixel(BUBA_MEETING);overworldKotaro(this,p.x-100,p.y+85,96).walk('up',false);fighter(this,p.x,p.y-35,'buba',.65,'left');
    const cam=this.cameras.main;cam.setZoom(1.25);cam.centerOn(p.x-20,p.y+20);cam.fadeIn(450);
    this.present();
  }
  present(){
    const line=bubaDialogue[this.state.dialogueIndex];
    if(line.type==='tent')this.cameras.main.pan(11.5*48,10.5*48,1500,'Sine.easeInOut');
    if(this.state.dialogueIndex===13){const p=townPixel(BUBA_MEETING);const pendant=this.add.image(p.x-50,p.y-35,'moon-pendant').setDisplaySize(95,95);this.tweens.add({targets:pendant,y:p.y+35,duration:1600,ease:'Sine.easeInOut'});}
  }
  next(){
    if(this.ending||this.state.panel||!this.game.input.enabled)return;
    if(bubaDialogue[this.state.dialogueIndex].type==='name'&&!this.state.nameConfirmed)return;
    if(this.state.dialogueIndex<bubaDialogue.length-1){this.session.patch({dialogueIndex:this.state.dialogueIndex+1});this.present();}
    else{
      this.ending=true;this.session.patch({phase:'DIALOGUE_END'});this.cameras.main.fadeOut(700);
      this.time.delayedCall(720,()=>{this.session.finishPrologue();this.session.patch({townPosition:{x:25,y:16}});this.scene.start('VillageScene');});
    }
  }
  onCommand(action,payload){
    if(action==='nextDialogue')this.next();
    if(action==='namePlayer'&&bubaDialogue[this.state.dialogueIndex].type==='name'&&this.session.setPlayerName(payload))this.next();
  }
}
