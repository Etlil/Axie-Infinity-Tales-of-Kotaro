import SceneBase from './SceneBase';
import {backdrop,fighter} from '../game/world';
export default class DefeatScene extends SceneBase{
  constructor(){super('DefeatScene');}
  create(){
    backdrop(this,this.state.tutorial?'village':'battle',{image:false});
    this.bindScene('defeat','DEFEATED','Rest, then try this encounter again.');
    const hero=fighter(this,600,455,this.state.activeCharacter,1.8);hero.setAngle(-12).setAlpha(.8);
  }
}
