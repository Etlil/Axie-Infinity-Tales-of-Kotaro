import SceneBase from './SceneBase';
export default class MainMenuScene extends SceneBase{
  constructor(){super('MainMenuScene');}
  create(){this.bindScene('menu','MENU','A new adventure, or a familiar road home.');}
  onCommand(action){
    if(this.state.panel)return;
    const pages={showSlots:'slots',showCredits:'credits',quitGame:'quit',menuHome:'home'};
    if(pages[action])this.session.patch({menuPage:pages[action]});
  }
}
