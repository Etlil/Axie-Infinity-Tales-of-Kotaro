import Phaser from 'phaser';
import {preloadCaveEnemies,registerCaveEnemies} from '../game/caveEnemies';
import {preloadKotaro,registerKotaro} from '../game/kotaroSprites';
import {preloadBuba,registerBuba} from '../game/bubaSprites';
export default class BootScene extends Phaser.Scene {
  constructor(){super('BootScene');}
  preload(){
    preloadCaveEnemies(this);
    preloadKotaro(this);
    preloadBuba(this);
    this.load.image('atia-official','assets/town/atia-official.png');
    for(const asset of ['stone-table','moon-pendant','kotaro-hand','approach-path'])this.load.image(asset,'assets/prologue/'+asset+'.png');
    this.load.image('atia-village','assets/atia/village.png');
    this.load.image('forest-arena','assets/atia/forest-arena.jpg');
    this.load.image('buba-arena','assets/atia/buba-arena.png');
    this.load.image('lagoon-arena','assets/atia/lagoon-arena.jpg');
    for(const id of ['kotaro','puffy'])this.load.spritesheet(id+'-sheet','assets/atia/'+id+'-sheet.png',{frameWidth:256,frameHeight:256});
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
    try{await registerKotaro(this);await registerBuba(this);await registerCaveEnemies(this);}catch(error){console.error('Could not prepare character sprites',error);this.game.session.patch({assetError:true});return;}
    if(!this.sys.isActive())return;
    for(const id of ['kotaro','puffy'])['idle','attack','ultimate','hit','run','greeting'].forEach((action,row)=>{
      this.anims.create({key:id+'-'+action,frames:this.anims.generateFrameNumbers(id+'-sheet',{start:row*12,end:row*12+(id==='puffy'?11:action==='hit'?2:action==='greeting'?3:11)}),
        frameRate:action==='idle'?8:action==='ultimate'?18:20,repeat:['idle','run'].includes(action)?-1:0});
    });
    this.scene.start('MainMenuScene');
  }
}
