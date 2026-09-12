import SceneBase,{label,pill} from './SceneBase';
import {backdrop,routePath,fighter} from '../game/world';
import {routeNodes} from '../data/bosses';
export default class DungeonMapScene extends SceneBase{
  constructor(){super('DungeonMapScene');}
  create(){
    backdrop(this,'map');this.bindScene('map','MAP','Choose a trail. Find who the nightmare left behind.',{selectedStage:Math.min(this.state.unlockedStage,this.state.selectedStage)});
    routePath(this,routeNodes);
    for(const node of routeNodes){
      const locked=node.id>this.state.unlockedStage||node.type==='locked',done=this.state.completedStages.includes(node.id),selected=this.state.selectedStage===node.id;
      this.add.ellipse(node.x,node.y+14,84,38,0x102718,.38);
      this.add.circle(node.x,node.y,40,locked?0x5f6b5d:done?0x6ca080:0xd8ae5a).setStrokeStyle(5,selected?0xffefd0:0xab945d);
      label(this,node.x,node.y,locked?'•':done?'✓':String(node.id+1),28,locked?'#a0ad96':'#fff4d6').setOrigin(.5);
      if(selected){const ring=this.add.circle(node.x,node.y,49).setStrokeStyle(2,0xffe4a0);this.tweens.add({targets:ring,scale:1.13,alpha:.2,duration:1100,yoyo:true,repeat:-1});}
      pill(this,node.x,node.y+66,node.title,{width:node.type==='boss'?220:210,size:16,fill:locked?0x344338:0x233d30});
      if(node.type==='boss')label(this,node.x,node.y-66,'✦ GUARDIAN ✦',12,'#ffe0a0').setOrigin(.5);
      if(!locked)this.add.zone(node.x,node.y+20,215,140).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.session.patch({selectedStage:node.id});this.scene.restart();});
    }
    fighter(this,routeNodes[this.state.selectedStage].x-81,routeNodes[this.state.selectedStage].y-35,this.state.activeCharacter,.52);
    this.bindKey('keydown-ENTER',()=>this.enterDungeon());
  }
  onCommand(action,payload){
    if(action==='selectStage'){if(Number.isInteger(payload)&&payload>=0&&payload<=this.state.unlockedStage){this.session.patch({selectedStage:payload});this.scene.restart();}}
    if(action==='enterDungeon')this.enterDungeon();
  }
}
