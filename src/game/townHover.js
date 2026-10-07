import {TOWN_PLACES,nearbyPlace} from './townLayout';

const DETAILS={
  tent:['Buba’s tent','Talk to Buba and collect your rank rewards.'],
  gate:['Village gate','Follow the trail to Aqua Cave.'],
  well:['Save fountain','Save your adventure at the village well.'],
  spring:['Puffy’s spring','Rest and recover with Puffy.'],
  'ruins-north':['Ruined homes','Only the old foundations remain.'],
  'ruins-west':['Abandoned shop','The village’s once-busy shop lies quiet.'],
};
const WIDTH=246,HEIGHT=106;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function createTownHover(scene,landmarks,visit){
  let current=null,fade=null,touchTimer=null;
  const card=scene.add.container(0,0).setDepth(20).setVisible(false).setAlpha(0);
  const plate=scene.add.graphics();
  plate.fillStyle(0x081b17,.25).fillRoundedRect(-WIDTH/2+3,-HEIGHT+5,WIDTH,HEIGHT,12);
  plate.fillStyle(0x18352e,.97).fillRoundedRect(-WIDTH/2,-HEIGHT,WIDTH,HEIGHT,12);
  plate.lineStyle(1.5,0xd5bd80,.85).strokeRoundedRect(-WIDTH/2,-HEIGHT,WIDTH,HEIGHT,12);
  plate.fillStyle(0xd5bd80).fillRoundedRect(-WIDTH/2+15,-HEIGHT+12,23,3,1);
  plate.fillStyle(0x18352e).fillTriangle(-7,-1,7,-1,0,7);
  const title=scene.add.text(-WIDTH/2+15,-HEIGHT+23,'',{
    fontFamily:'"Changa One", sans-serif',fontSize:'21px',color:'#fff0c9'});
  const description=scene.add.text(-WIDTH/2+15,-HEIGHT+49,'',{
    fontFamily:'Nunito, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#c6d8ca',
    wordWrap:{width:WIDTH-30},lineSpacing:2});
  const hint=scene.add.text(-WIDTH/2+15,-17,'',{
    fontFamily:'Nunito, sans-serif',fontSize:'10px',fontStyle:'bold',color:'#e8cb84'});
  card.add([plate,title,description,hint]);

  function hide(){
    touchTimer?.remove(false);touchTimer=null;
    if(!current)return;
    current=null;fade?.stop();
    fade=scene.tweens.add({targets:card,alpha:0,duration:100,
      onComplete:()=>{if(!current)card.setVisible(false);}});
  }
  function update(){
    if(scene.state.panel||!scene.game.input.enabled){hide();return;}
    if(!current)return;
    const view=scene.cameras.main.worldView,{sprite,id}=current;
    card.setPosition(
      clamp(sprite.x,view.x+WIDTH/2+12,view.right-WIDTH/2-12),
      clamp(sprite.y-sprite.displayHeight-14,view.y+HEIGHT+12,view.bottom-14));
    const place=TOWN_PLACES.find(p=>p.id===id);
    const near=nearbyPlace(scene.pos)?.id===id;
    hint.setText(place?(near?'F · Interact':'Click or tap to visit'):'A memory of old Atia');
  }
  function show(landmark){
    if(scene.state.panel||!scene.game.input.enabled)return;
    touchTimer?.remove(false);touchTimer=null;
    const [name,detail]=DETAILS[landmark.id]||[landmark.name,'Explore Atia.'];
    title.setText(name);
    description.setText(landmark.id==='spring'&&!scene.state.rescued.some(r=>r.id==='puffy')
      ?'A quiet spring. Find Puffy in Aqua Cave.':detail);
    current=landmark;fade?.stop();card.setVisible(true);update();
    fade=scene.tweens.add({targets:card,alpha:1,duration:140,ease:'Sine.easeOut'});
  }
  landmarks.forEach(landmark=>{
    const place=TOWN_PLACES.find(p=>p.id===landmark.id);
    landmark.sprite.setInteractive({useHandCursor:Boolean(place)})
      .on('pointerover',()=>show(landmark))
      .on('pointerout',()=>{if(current===landmark)hide();})
      .on('pointerdown',pointer=>{
        show(landmark);
        if(place)visit(place.id);
        if(pointer.wasTouch)touchTimer=scene.time.delayedCall(1800,hide);
      });
  });
  scene.input.on('gameout',hide);
  scene.events.once('shutdown',()=>{
    fade?.stop();touchTimer?.remove(false);scene.input.off('gameout',hide);
  });
  return {update,hide};
}
