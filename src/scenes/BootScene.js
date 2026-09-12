import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor(){super('BootScene');}
  preload(){
    this.load.image('atia-village','assets/atia/village.png');
    this.load.image('forest-arena','assets/atia/forest-arena.jpg');
    this.load.image('lagoon-arena','assets/atia/lagoon-arena.jpg');
    for(const id of ['kotaro','buba','puffy'])this.load.spritesheet(id+'-sheet','assets/atia/'+id+'-sheet.png',{frameWidth:256,frameHeight:256});
    this.load.image('buba-avatar','assets/atia/buba-avatar.png');
    this.load.image('puffy-avatar','assets/atia/puffy-avatar.png');
    this.load.on('progress',value=>this.game.session.patch({loadProgress:Math.round(value*100)}));
    this.load.on('loaderror',()=>this.game.session.patch({assetError:true}));
  }
  async create(){
    if(this.game.session.state.assetError)return;
    // Canvas text must be drawn after the same local display font as the HUD.
    if(document.fonts)await Promise.allSettled([
      document.fonts.load('20px "Changa One"'),
      document.fonts.load('700 14px Nunito'),
    ]);
    if(!this.sys.isActive())return;
    for(const id of ['kotaro','buba','puffy'])['idle','attack','ultimate','hit','run','greeting'].forEach((action,row)=>{
      this.anims.create({key:id+'-'+action,frames:this.anims.generateFrameNumbers(id+'-sheet',{start:row*12,end:row*12+(id==='puffy'?11:action==='hit'?2:action==='greeting'?3:11)}),
        frameRate:action==='idle'?8:action==='ultimate'?18:20,repeat:['idle','run'].includes(action)?-1:0});
    });
    const s=this.game.session.state;
    this.scene.start(s.prologueComplete?'VillageScene':s.tutorialWon?'DialogueScene':'IntroScene');
  }
}
