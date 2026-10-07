// Original sheet: 1448x1086, twelve poses. Its gutters are uneven, so use
// measured rectangles and boot pivots rather than a uniform grid or hair bounds.
const POSES=[
  {rect:[74,15,274,353],foot:[182,367]},
  {rect:[403,19,309,349],foot:[521,367]},
  {rect:[761,38,314,330],foot:[901,367]},
  {rect:[1121,32,287,336],foot:[1252,367]},
  {rect:[49,400,329,311],foot:[210,710]},
  {rect:[407,436,327,274],foot:[578,709]},
  {rect:[776,409,312,302],foot:[937,710],moon:[800,660]},
  {rect:[1133,387,288,325],foot:[1261,711],moon:[1155,633]},
  {rect:[88,728,281,337],foot:[207,1064],moon:[109,957]},
  {rect:[445,738,273,327],foot:[553,1064],moon:[468,976]},
  {rect:[776,731,336,336],foot:[910,1066],moon:[797,973]},
  {rect:[1143,730,288,337],foot:[1259,1066],moon:[1166,971]},
];
const SHEET='intro-girl-pickup';
const SIZE=1.22;
const MOTION_DURATION=1.6; // Slower poses and matching approach movement.
const REACH={x:690,y:416};

function registerPickup(scene){
  const texture=scene.textures.get(SHEET);
  POSES.forEach(({rect,foot},i)=>{
    if(texture.has(i))return;
    const [rx,ry,rw,rh]=rect,x=rx-3,y=ry-3;
    const frame=texture.add(i,0,x,y,rw+6,rh+6);
    frame.customPivot=true;
    frame.pivotX=(foot[0]-x)/frame.width;
    frame.pivotY=(foot[1]-y)/frame.height;
  });
  const animation=(key,poses)=>{
    if(!scene.anims.exists(key))scene.anims.create({key,frameRate:10,
      frames:poses.map(([frame,ms])=>({key:SHEET,frame,duration:ms*MOTION_DURATION-100}))});
  };
  animation('intro-girl-step',[[0,120],[1,150],[0,120],[1,150],[2,200]]);
  // The lowest crouch anticipates the reach. Playing it before the extended
  // hand keeps the later contact pose level with the actual stone tabletop.
  animation('intro-girl-pick-up',[[3,220],[5,120],[4,200],[6,220],[7,180],
    [8,160],[9,140],[10,160],[11,650]]);
}

export function playPendantCinematic(scene,onComplete){
  registerPickup(scene);
  const timers=[],tweens=[];
  let stopped=false,girl;
  const animate=options=>{
    const tween=scene.tweens.add({...options,onComplete:()=>{if(!stopped)options.onComplete?.();}});
    tweens.push(tween);return tween;
  };
  const later=(delay,callback)=>timers.push(scene.time.delayedCall(delay,()=>{if(!stopped)callback();}));
  const stop=()=>{
    if(stopped)return;
    stopped=true;
    timers.forEach(timer=>timer.remove(false));
    tweens.forEach(tween=>tween.stop());
    girl?.anims?.stop();
    girl?.off('animationupdate',updatePose);
    girl?.off('animationcomplete',finishPose);
  };
  scene.events.once('shutdown',stop);

  const camera=scene.cameras.main;
  camera.setBackgroundColor('#050913');
  const room=scene.add.image(600,400,'intro-room');
  room.setScale(1200/room.width);

  const glow=scene.add.container(REACH.x+14,REACH.y+16).setAlpha(.4);
  [[142,58,.025],[102,40,.055],[64,24,.13]].forEach(([w,h,alpha])=>{
    glow.add(scene.add.ellipse(0,0,w,h,0xffd879,alpha));
  });
  const amulet=scene.add.image(REACH.x,REACH.y,'moon-pendant').setOrigin(.5,.08).setDisplaySize(80,30);
  const pulse=animate({targets:glow,alpha:1,scale:1.18,duration:850,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  const motes=[];
  for(let i=0;i<4;i++){
    const mote=scene.add.circle(REACH.x-16+i*17,REACH.y+8,1.5,0xffedb2).setAlpha(0);
    motes.push(mote);
    animate({targets:mote,y:REACH.y-23-i*5,alpha:.55,duration:1000+i*170,delay:i*240,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }

  // Frame 6's pinching fingers are at (798,584) in the source sheet.
  const rest={x:REACH.x+(937-798)*SIZE,y:REACH.y+(710-584)*SIZE};
  const shadow=scene.add.ellipse(rest.x+92,rest.y+1,100,13,0x020510,.32).setAlpha(0);
  const heldLight=scene.add.circle(0,0,38,0xffd879,.08).setVisible(false);
  girl=scene.add.sprite(rest.x+92,rest.y,SHEET,0).setScale(SIZE).setAlpha(0);
  let hasPendant=false;
  function updatePose(_animation,animationFrame){
    const index=Number(animationFrame.textureFrame),pose=POSES[index];
    if(!pose?.moon||stopped)return;
    if(!hasPendant){
      hasPendant=true;
      // The held necklace is drawn into the sheet: remove the tabletop prop
      // exactly at the grasp pose, avoiding a second floating necklace.
      amulet.setVisible(false);pulse.stop();
      motes.forEach(mote=>mote.setVisible(false));
      animate({targets:glow,alpha:0,duration:220});
      heldLight.setVisible(true);
    }
    heldLight.setPosition(girl.x+(pose.moon[0]-pose.foot[0])*SIZE,
      girl.y+(pose.moon[1]-pose.foot[1])*SIZE);
  }
  function finishPose(animation){
    if(stopped)return;
    if(animation.key==='intro-girl-step')later(450,()=>girl.play('intro-girl-pick-up'));
    // Together with the last pose, hold the pendant shot for about two seconds.
    else if(animation.key==='intro-girl-pick-up')later(1000,onComplete);
  }
  girl.on('animationupdate',updatePose);
  girl.on('animationcomplete',finishPose);

  scene.add.rectangle(600,31,1200,62,0x050913).setDepth(10);
  scene.add.rectangle(600,769,1200,62,0x050913).setDepth(10);
  camera.fadeIn(1100,0,0,0);
  later(1700,()=>{
    animate({targets:[girl,shadow],alpha:1,duration:650,ease:'Sine.easeOut'});
    girl.play('intro-girl-step');
    animate({targets:[girl,shadow],x:rest.x,duration:740*MOTION_DURATION,ease:'Sine.easeInOut'});
  });
  return {stop};
}
