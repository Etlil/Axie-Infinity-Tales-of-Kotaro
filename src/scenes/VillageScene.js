import SceneBase, { floatingText } from './SceneBase';
import {backdrop,fighter,shelterUpgrade} from '../game/world';
export default class VillageScene extends SceneBase{
  constructor(){super('VillageScene');}
  create(){
    backdrop(this);shelterUpgrade(this,this.state.tentStage);
    this.bindScene('village','VILLAGE','One rescue. One repaired roof. One friend at a time.');
    this.hero=fighter(this,630,490,this.state.activeCharacter,1.15);
    if(this.state.activeCharacter!=='buba')fighter(this,278,407,'buba',.8,'left');
    if(this.state.rescued.some(resident=>resident.id==='puffy')){
      const spring=this.add.ellipse(833,638,160,49,0x6cd6cf,.45).setStrokeStyle(3,0xc3ffdf,.65);
      this.tweens.add({targets:spring,alpha:.22,duration:1500,yoyo:true,repeat:-1});
      this.puffy=fighter(this,833,596,'puffy',.62,'left');
      this.add.zone(833,596,160,150).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.session.patch({panel:'healer'}));
    }
    this.add.zone(183,334,275,245).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.session.patch({panel:'rewards'}));
    this.add.zone(971,226,235,260).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('DungeonMapScene'));
  }
  onCommand(action){
    if(action!=='healWithPuffy')return;
    const healed=this.session.healAtVillage();
    if(!healed)return;
    this.puffy?.playAction('greeting');
    floatingText(this,this.hero.x,this.hero.y-85,'+'+healed+' HP','#b4ffdf');
    for(let i=0;i<10;i++){
      const bubble=this.add.circle(833,595,5+i%4*2,0x9dffdf,.7).setStrokeStyle(1,0xf1fffb,.9).setDepth(15);
      this.tweens.add({targets:bubble,x:this.hero.x+(i%3-1)*26,y:this.hero.y-70-i*7,alpha:0,
        duration:750+i*65,delay:i*35,ease:'Sine.easeOut',onComplete:()=>bubble.destroy()});
    }
  }
}
