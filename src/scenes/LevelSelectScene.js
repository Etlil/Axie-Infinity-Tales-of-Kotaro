import SceneBase from './SceneBase';
import {DUNGEONS} from '../game/dungeonLayout';
export default class LevelSelectScene extends SceneBase {
  constructor(){super('LevelSelectScene');}
  create(){
    this.bindScene('map','LEVEL_SELECT','Choose a dungeon beyond Atia.',{dungeonRun:null});
    this.bindKey('keydown-ENTER',()=>this.onCommand('enterDungeon'));
  }
  onCommand(action,payload){
    if(this.state.panel)return;
    if(action==='selectStage'&&Number.isInteger(payload)&&DUNGEONS[payload]&&payload<=this.state.unlockedStage)this.session.patch({selectedStage:payload});
    if(action==='enterDungeon'&&this.session.startDungeon(this.state.selectedStage))this.scene.start('DungeonMapScene');
  }
}
