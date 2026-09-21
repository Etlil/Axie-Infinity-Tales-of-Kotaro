import SceneBase from './SceneBase';
import {backdrop,fighter} from '../game/world';
import {bosses} from '../data/bosses';
export default class VictoryScene extends SceneBase{
  constructor(){super('VictoryScene');}
  create(){
    backdrop(this,this.state.roomIndex===2?'lagoon':'battle',{image:false});
    this.bindScene('victory','VICTORY',this.state.result?.kind==='purify'?'The nightmare has weakened. Use Buba’s amulet.':'Another path is clear.');
    fighter(this,450,480,this.state.activeCharacter,1.7);
    if(this.state.roomIndex===2){
      const puffy=fighter(this,780,460,'puffy',1.3,'left');
      if(this.state.result?.kind==='purify')puffy.setCorrupted(true);
      else{puffy.playAction('greeting');const light=this.add.circle(780,432,100,0xffe8aa,.22);this.tweens.add({targets:light,scale:1.3,alpha:.05,duration:1800,yoyo:true,repeat:-1});}
    }
  }
  onCommand(action){
    if(action==='purify'&&this.state.result?.kind==='purify'&&this.state.amulet){
      this.session.rescue(bosses.puffy);const rewards=this.session.completeStage(0);
      this.session.patch({result:{kind:'rescued',...rewards},message:'The amulet shines. Puffy is coming home.'});this.scene.restart();
    }
  }
}
