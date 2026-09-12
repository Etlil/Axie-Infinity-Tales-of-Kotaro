import SceneBase from './SceneBase';
import {backdrop,fighter,shelterUpgrade} from '../game/world';
export default class VillageScene extends SceneBase{
  constructor(){super('VillageScene');}
  create(){
    backdrop(this);shelterUpgrade(this,this.state.tentStage);
    this.bindScene('village','VILLAGE','One rescue. One repaired roof. One friend at a time.');
    fighter(this,630,550,this.state.activeCharacter,1.15);
    if(this.state.activeCharacter!=='buba')fighter(this,278,407,'buba',.8,'left');
    if(this.state.rescued.length)this.add.image(833,624,'momo-avatar').setDisplaySize(76,76);
    this.add.zone(183,334,275,245).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.session.patch({panel:'rewards'}));
    this.add.zone(971,226,235,260).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('DungeonMapScene'));
  }
}
