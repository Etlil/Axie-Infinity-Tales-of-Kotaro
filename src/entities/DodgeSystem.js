export const ARENA = { left:150, right:1020, floor:600,
  platforms:[{x:405,y:475,width:155},{x:700,y:435,width:145}] };
const KEYS=[['A',65,'left'],['LEFT',37,'left'],['D',68,'right'],['RIGHT',39,'right'],
  ['SPACE',32,'jump'],['W',87,'jump'],['UP',38,'jump'],['SHIFT',16,'dash']];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const projectileDamage=damage=>Math.max(1,Math.round((Number.isFinite(damage)?damage:14)*.45));
export function getDodgeTiming(bonus=0){
  const benefit=1+clamp(Number.isFinite(bonus)?bonus:0,0,1);
  return {duration:6500,warningDuration:650*benefit,speedMultiplier:1/benefit};
}
export function overlapsPlayer(p,shot){
  const x=clamp(shot.x,p.x-22,p.x+22),y=clamp(shot.y,p.y-64,p.y-8);
  return (shot.x-x)**2+(shot.y-y)**2<shot.radius**2;
}
export function attackPlan(pattern='thorns'){
  if(pattern==='buba-dash')return [{kind:'buba-dash',direction:-1,at:900},{kind:'buba-dash',direction:1,at:3700}]
    .map(event=>({...event,warned:false,launched:false}));
  if(pattern==='buba-mushroom')return [{kind:'mushroom',at:900,warned:false,launched:false}];
  const kinds={thorns:['thorn','high-thorn','thorn'],sweep:['blade','high-blade','blade'],
    shield:['shield','shield','shield'],wave:['wave','bubble','wave'],aimed:['orb','orb','orb'],
    rain:['rain','rain','rain'],tide:['wave','rain','wave']};
  return (kinds[pattern]||kinds.thorns).map((kind,i)=>({kind,at:900+i*1700,warned:false,launched:false}));
}
/** Fixed-step movement and collisions; all time belongs to the Phaser scene. */
export default class DodgeSystem {
  constructor(scene,{onUpdate=()=>{},onHit=()=>{},onResolve=()=>{},onLaunch=()=>{},bonus=0}={}){
    Object.assign(this,{scene,onUpdate,onHit,onResolve,onLaunch,bonus,active:false,destroyed:false});
    this.inputs=new Map();this.captures=[];this.keyboard=scene.input?.keyboard;
    this.updateHandler=(_time,delta)=>this.update(delta);
    this.clearControls=()=>{this.inputs.clear();this.jumpBuffer=0;};
    this.shutdown=()=>this.destroy();this.keyHandlers=[];
    KEYS.forEach(([key,,control])=>{for(const down of [true,false]){
      const event=(down?'keydown-':'keyup-')+key;
      const handler=e=>{
        if(e?.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
        if(down&&e?.repeat)return;
        this.setControl(control,down,'key-'+key);
      };
      this.keyboard?.on(event,handler);this.keyHandlers.push([event,handler]);
    }});
    scene.events.on('pause',this.clearControls);scene.events.once('shutdown',this.shutdown);
  }
  start({pattern='thorns',damage=14}={}){
    if(this.destroyed)return false;
    this.stop();this.timing=getDodgeTiming(this.bonus);this.elapsed=0;this.hits=0;this.totalDamage=0;
    this.damage=projectileDamage(damage);
    this.player={x:330,y:ARENA.floor,vx:0,vy:0,facing:1,grounded:true,dash:0,cooldown:0,invulnerable:0};
    this.shots=[];this.plan=attackPlan(pattern);this.jumpBuffer=0;this.coyote=100;this.active=true;
    const owned=this.keyboard?.getCaptures?.()||[];
    this.captures=KEYS.map(([,code])=>code).filter(code=>!owned.includes(code));
    this.keyboard?.addCapture?.(this.captures);
    this.scene.events.on('update',this.updateHandler);this.emit();return true;
  }
  setControl(control,pressed,source='touch-'+control){
    if(!pressed){this.inputs.delete(source);return true;}
    if(!this.active||!['left','right','jump','dash'].includes(control)||this.inputs.has(source))return false;
    this.inputs.set(source,control);
    if(control==='jump')this.jumpBuffer=140;
    if(control==='dash'&&this.player.cooldown<=0){
      this.player.facing=this.axis()||this.player.facing;this.player.dash=180;this.player.cooldown=950;
      this.player.invulnerable=Math.max(this.player.invulnerable,210);this.player.vy=0;
    }
    return true;
  }
  axis(){const held=[...this.inputs.values()];return Number(held.includes('right'))-Number(held.includes('left'));}
  update(delta=16.667){
    if(!this.active)return;
    let remaining=clamp(Number.isFinite(delta)?delta:0,0,100);
    // Substeps stop fast dashes and projectiles from tunneling through bodies.
    while(remaining>0&&this.active){const step=Math.min(1000/120,remaining);this.step(step);remaining-=step;}
    if(this.active)this.emit();
  }
  step(ms){
    const p=this.player,dt=ms/1000;this.elapsed+=ms;
    p.cooldown=Math.max(0,p.cooldown-ms);p.invulnerable=Math.max(0,p.invulnerable-ms);
    this.jumpBuffer=Math.max(0,this.jumpBuffer-ms);this.coyote=p.grounded?100:Math.max(0,this.coyote-ms);
    if(this.jumpBuffer>0&&this.coyote>0&&p.dash<=0){p.vy=-780;p.grounded=false;this.coyote=0;this.jumpBuffer=0;}
    const axis=this.axis();if(axis)p.facing=axis;
    if(p.dash>0){p.dash=Math.max(0,p.dash-ms);p.vx=p.facing*760;}
    else{p.vx+=(axis*360-p.vx)*Math.min(1,dt*20);p.vy+=2100*dt;}
    const oldY=p.y;p.x=clamp(p.x+p.vx*dt,ARENA.left,ARENA.right-65);p.y+=p.vy*dt;p.grounded=false;
    if(p.vy>=0)for(const surface of [...ARENA.platforms,{x:ARENA.left-50,y:ARENA.floor,width:1100}]){
      if(p.x+18>surface.x&&p.x-18<surface.x+surface.width&&oldY<=surface.y+1&&p.y>=surface.y){p.y=surface.y;p.vy=0;p.grounded=true;break;}
    }
    for(const event of this.plan){
      if(!event.warned&&this.elapsed>=event.at-this.timing.warningDuration){event.warned=true;event.target={x:p.x,y:p.y-35};}
      if(!event.launched&&this.elapsed>=event.at){event.launched=true;this.launch(event);}
    }
    for(const shot of this.shots){
      if(shot.dead)continue;
      shot.age+=ms;
      if(shot.kind==='mushroom')this.moveMushroom(shot,dt);
      else{shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;}
      if(shot.kind==='shield'){shot.vy+=320*dt;if(shot.y+shot.radius>ARENA.floor){shot.y=ARENA.floor-shot.radius;shot.vy=-230;}}
      if(shot.kind==='buba-dash'&&shot.age>=shot.travelDuration)shot.dead=true;
      if(shot.x<ARENA.left-120||shot.x>ARENA.right+150||shot.y>ARENA.floor+80||shot.age>6000)shot.dead=true;
      const solidAttack=shot.kind==='buba-dash'||shot.kind==='mushroom';
      const canHit=shot.stage!=='turn'&&(!solidAttack||shot.hitLeg!==shot.stage);
      if(!shot.dead&&canHit&&p.invulnerable<=0&&overlapsPlayer(p,shot)){
        if(solidAttack)shot.hitLeg=shot.stage;else shot.dead=true;
        p.invulnerable=760;this.hits++;this.totalDamage+=this.damage;
        this.onHit({damage:this.damage,x:p.x,y:p.y-45});if(!this.active)return;
      }
    }
    this.shots=this.shots.filter(shot=>!shot.dead);
    if(this.elapsed>=this.timing.duration)this.resolve();
  }
  launch(event){
    const speed=this.timing.speedMultiplier;
    const shot={kind:event.kind,x:1030,y:ARENA.floor-34,vx:-450*speed,vy:0,radius:24,age:0};
    if(event.kind==='buba-dash'){
      shot.x=event.direction<0?1040:110;shot.y=ARENA.floor-38;
      shot.travelDuration=1250/speed;shot.vx=event.direction*930/(shot.travelDuration/1000);
      shot.radius=36;shot.stage='dash';
    }
    if(event.kind==='mushroom'){
      shot.x=1073;shot.y=517;shot.vx=0;shot.radius=25;shot.stage='outbound';
      shot.legDuration=Math.min(2200,1700/speed);shot.turnDuration=Math.min(1000,this.timing.warningDuration);
    }
    if(event.kind.startsWith('high-')||event.kind==='bubble')shot.y=ARENA.floor-155;
    if(event.kind.includes('blade')){shot.radius=30;shot.vx=-520*speed;}
    if(event.kind==='wave'){shot.radius=32;shot.vx=-425*speed;}
    if(event.kind==='shield'){shot.radius=28;shot.y=ARENA.floor-145;shot.vx=-400*speed;shot.vy=60;}
    if(event.kind==='orb'){
      shot.y=460;shot.radius=20;
      const angle=Math.atan2(event.target.y-shot.y,event.target.x-shot.x);
      shot.vx=Math.cos(angle)*410*speed;shot.vy=Math.sin(angle)*410*speed;
    }
    if(event.kind==='rain')[-125,0,125].forEach(offset=>this.shots.push({...shot,x:clamp(event.target.x+offset,ARENA.left,ARENA.right),y:245,vx:0,vy:380*speed,radius:21}));
    else this.shots.push(shot);
    this.onLaunch(event.kind);
  }
  moveMushroom(shot,dt){
    const previous={x:shot.x,y:shot.y},leg=shot.legDuration;
    if(shot.age<leg){
      const progress=shot.age/leg;shot.stage='outbound';shot.x=1073-923*progress;shot.y=517+49*progress;
    }else if(shot.age<leg+shot.turnDuration){shot.stage='turn';shot.x=150;shot.y=566;}
    else{
      const progress=Math.min(1,(shot.age-leg-shot.turnDuration)/leg);shot.stage='return';
      shot.x=150+923*progress;shot.y=566-110*Math.sin(progress*Math.PI)-49*progress;
      if(progress>=1)shot.dead=true;
    }
    shot.vx=(shot.x-previous.x)/dt;shot.vy=(shot.y-previous.y)/dt;
  }
  emit(){
    const crossing=this.shots.find(shot=>shot.kind==='buba-dash');
    const lastCrossing=[...this.plan].reverse().find(event=>event.kind==='buba-dash'&&event.launched);
    const opponent=crossing?{x:crossing.x,y:ARENA.floor-57,facing:Math.sign(crossing.vx),charging:true}
      :lastCrossing?{x:lastCrossing.direction<0?110:1040,y:ARENA.floor-57,facing:-lastCrossing.direction,charging:false}:null;
    const warnings=this.plan.filter(e=>e.warned&&!e.launched);
    this.shots.filter(shot=>shot.kind==='mushroom'&&shot.stage==='turn')
      .forEach(shot=>warnings.push({kind:'mushroom-return',target:{x:shot.x,y:shot.y},direction:1}));
    this.onUpdate({player:{...this.player},shots:this.shots,warnings,opponent,
    dodgeRemaining:Math.max(0,(this.timing.duration-this.elapsed)/1000),duration:this.timing.duration/1000,hits:this.hits});}
  resolve(){if(!this.active)return;const result={hits:this.hits,damage:this.totalDamage,player:{...this.player}};this.stop();this.onResolve(result);}
  stop(){this.active=false;this.clearControls();this.shots=[];this.scene.events.off('update',this.updateHandler);
    if(this.captures.length)this.keyboard?.removeCapture?.(this.captures);this.captures=[];}
  destroy(){if(this.destroyed)return;this.stop();this.destroyed=true;
    this.keyHandlers.forEach(([event,handler])=>this.keyboard?.off(event,handler));
    this.scene.events.off('pause',this.clearControls);this.scene.events.off('shutdown',this.shutdown);}
}
