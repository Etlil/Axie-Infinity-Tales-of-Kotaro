import { ARENA } from '../entities/DodgeSystem';
export function drawArena(g,platforms=false){
  g.clear();
  const ledge=(x,y,width)=>{
    g.fillStyle(0x263a3d,.95).fillRoundedRect(x,y,width,18,7);
    g.fillStyle(0x83b4a2).fillRoundedRect(x,y,width,6,3);
    g.lineStyle(2,0xe7e4af,.8).lineBetween(x+5,y,x+width-5,y);
    for(let i=12;i<width-12;i+=28)g.lineStyle(2,0x496a65).lineBetween(x+i,y+8,x+i+8,y+14);
  };
  ledge(ARENA.left-30,ARENA.floor,ARENA.right-ARENA.left+75);
  if(platforms)ARENA.platforms.forEach(p=>ledge(p.x,p.y,p.width));
}
export function drawHazards(g,view,enemyId){
  g.clear();
  for(const warning of view.warnings){
    if(warning.kind==='buba-dash'){
      const right=warning.direction>0,y=ARENA.floor-38;
      g.fillStyle(0xffcf81,.12).fillRect(ARENA.left,y-35,ARENA.right-ARENA.left,70);
      g.lineStyle(2,0xffdb97,.8).lineBetween(ARENA.left,y+32,ARENA.right,y+32);
      for(let x=ARENA.left+60;x<ARENA.right;x+=150){
        const point=x+(right?12:-12),tail=x+(right?-8:8);
        g.fillStyle(0xffdf9b,.75).fillTriangle(point,y,tail,y-11,tail,y+11);
      }
    }else if(warning.kind==='mushroom-return'){
      g.lineStyle(3,0xffe7a2,.85).strokeCircle(warning.target.x,warning.target.y,41);
      g.fillStyle(0xffe7a2,.9).fillTriangle(220,530,201,520,201,540);
    }else if(warning.kind==='rain')[-125,0,125].forEach(offset=>{
      const x=Math.max(ARENA.left,Math.min(ARENA.right,warning.target.x+offset));
      g.fillStyle(0xffcf81,.13).fillRect(x-24,245,48,355);
      g.lineStyle(3,0xffdc9a,.9).strokeEllipse(x,ARENA.floor-2,52,15);
      g.fillStyle(0xffdc9a).fillTriangle(x-8,270,x+8,270,x,282);
    });
    else{
      const y=warning.kind.startsWith('high-')||warning.kind==='bubble'?445:566;
      g.lineStyle(3,0xffd482,.5).lineBetween(870,y,1010,y);
      g.fillStyle(0xffd482,.9).fillTriangle(865,y,883,y-9,883,y+9);
    }
  }
  for(const shot of view.shots){
    const {x,y,radius:r,kind}=shot;
    const color=kind==='rain'?(enemyId==='buba'?0xff96c8:0xc193f6):enemyId==='puffy'?0x83e9ff:kind.includes('thorn')?0xc2ea7c:0xfad18b;
    g.fillStyle(color,.13).fillCircle(x,y,r+12);
    if(kind==='buba-dash'){
      const facing=Math.sign(shot.vx),tip=x+facing*38;
      // Buba's actual fighter is positioned over this collision body by CombatScene.
      g.lineStyle(7,0xffebac,.85).lineBetween(tip-facing*18,y+18,tip+facing*13,y-28);
      g.lineStyle(2,0xffffff,.95).lineBetween(tip-facing*16,y+15,tip+facing*13,y-28);
      for(let i=1;i<=3;i++)g.fillStyle(0xffd987,.25/i).fillEllipse(x-facing*i*26,ARENA.floor-6,30,12);
    }else if(kind==='mushroom'){
      // The supplied spinning mushroom sprite follows this collision body.
      if(shot.stage==='return')g.lineStyle(2,0xffe4a2,.7).beginPath().arc(x,y,38,shot.age/180,shot.age/180+4).strokePath();
    }else if(kind.includes('blade')){
      g.lineStyle(9,color).beginPath().arc(x,y,r,-2,2).strokePath();
      g.lineStyle(2,0xfff8df).beginPath().arc(x,y,r-6,-2,2).strokePath();
    }else if(kind.includes('thorn')){
      g.fillStyle(color).fillTriangle(x-r,y,x+r,y-r*.65,x+r,y+r*.65);
      g.lineStyle(2,0xf3ffd8).lineBetween(x-r+5,y,x+r-7,y);
    }else if(kind==='shield'){
      g.fillStyle(0x9c784b).fillCircle(x,y,r);g.lineStyle(5,color).strokeCircle(x,y,r);
      g.lineStyle(3,0xeddca8).lineBetween(x,y-r+5,x,y+r-5);g.fillStyle(0xffebaf).fillCircle(x,y,7);
    }else if(kind==='wave'){
      g.fillStyle(color,.85).fillCircle(x,y,r);g.lineStyle(4,0xe7ffff).beginPath().arc(x+5,y-3,r*.6,0,5).strokePath();
    }else{
      g.fillStyle(color,.92).fillCircle(x,y,r);g.lineStyle(2,0xffffff,.8).strokeCircle(x,y,r-4);
      g.fillStyle(0xffffff,.85).fillCircle(x-6,y-7,5);
    }
    g.lineStyle(4,color,.25).lineBetween(x,y,x-shot.vx*.06,y-shot.vy*.06);
  }
  if(view.player.dash>0){const p=view.player;for(let i=1;i<=3;i++)g.fillStyle(0xbffbff,.22/i).fillEllipse(p.x-p.facing*i*28,p.y-35,40,60);}
}
