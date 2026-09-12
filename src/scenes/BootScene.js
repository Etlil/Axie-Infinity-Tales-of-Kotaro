import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor(){super('BootScene');}
  preload(){
    this.load.image('atia-village','assets/atia/village.png');
    this.load.image('forest-arena','assets/atia/forest-arena.jpg');
    this.load.image('lagoon-arena','assets/atia/lagoon-arena.jpg');
    for(const id of ['kotaro','buba'])this.load.spritesheet(id+'-sheet','assets/atia/'+id+'-sheet.png',{frameWidth:256,frameHeight:256});
    this.load.image('buba-avatar','assets/atia/buba-avatar.png');
    this.load.image('momo-avatar','assets/atia/momo-avatar.png');
    this.load.on('progress',value=>this.game.session.patch({loadProgress:Math.round(value*100)}));
    this.load.on('loaderror',()=>this.game.session.patch({assetError:true}));
  }
  create(){
    if(this.game.session.state.assetError)return;
    for(const id of ['kotaro','buba'])['idle','attack','ultimate','hit','run','greeting'].forEach((action,row)=>{
      this.anims.create({key:id+'-'+action,frames:this.anims.generateFrameNumbers(id+'-sheet',{start:row*12,end:row*12+(action==='hit'?2:action==='greeting'?3:11)}),
        frameRate:action==='idle'?8:action==='ultimate'?18:20,repeat:['idle','run'].includes(action)?-1:0});
    });
    const s=this.game.session.state;
    this.scene.start(s.prologueComplete?'VillageScene':s.tutorialWon?'DialogueScene':'IntroScene');
  }
}
