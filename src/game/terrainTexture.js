// Shared, cached ground painting. Generated once per layout, never every frame.
// The warm sand and soft meadow verge follow the supplied village art reference.
const hash=(x,y)=>{let n=Math.imul(x+731,374761393)^Math.imul(y+173,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967295;};
const smooth=t=>t*t*(3-2*t);
const mix=(a,b,t)=>a+(b-a)*t;
function noise(x,y,scale){
 const nx=x/scale,ny=y/scale,ix=Math.floor(nx),iy=Math.floor(ny),fx=smooth(nx-ix),fy=smooth(ny-iy);
 return mix(mix(hash(ix,iy),hash(ix+1,iy),fx),mix(hash(ix,iy+1),hash(ix+1,iy+1),fx),fy);
}
function roadDistance(x,y,roads){
 let distance=Infinity;
 for(const r of roads){
  const dx=Math.abs(x-r.x-r.w/2)-r.w/2,dy=Math.abs(y-r.y-r.h/2)-r.h/2;
  distance=Math.min(distance,Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0));
 }
 return distance;
}
function tuft(ctx,x,y,size){
 ctx.fillStyle='#6f9845';ctx.globalAlpha=.32;
 for(let i=0;i<3;i++){
  const lean=(i-1)*size*.45,base=x+(i-1)*size*.2,top=y-size*(i===1?1:.72);
  ctx.beginPath();ctx.moveTo(base-1.5,y);ctx.quadraticCurveTo(base-3+lean,top+size*.3,base+lean,top);
  ctx.quadraticCurveTo(base+3+lean,top+size*.55,base+1.5,y);ctx.fill();
 }
 ctx.globalAlpha=1;
}
function flower(ctx,x,y){
 ctx.fillStyle='#728f49';ctx.globalAlpha=.18;ctx.beginPath();ctx.ellipse(x+2,y+4,7,2.5,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.fillStyle='#fff4cf';
 for(let petal=0;petal<5;petal++){
  const a=petal*Math.PI*2/5;
  ctx.beginPath();ctx.ellipse(x+Math.cos(a)*3,y+Math.sin(a)*2.5,2.8,2,a,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle='#efc452';ctx.beginPath();ctx.ellipse(x,y,2,1.7,0,0,Math.PI*2);ctx.fill();
}
export function addTerrain(scene,width,height,roads){
 const key='atia-meadow-ground-'+width+'-'+height;
 if(!scene.textures.exists(key)){
  const texture=scene.textures.createCanvas(key,width,height),ctx=texture.getContext();
  // Paint a small diffuse ground layer, then scale smoothly to avoid blocky marks.
  // Small edge deviations are visual only; the existing road collision stays intact.
  const paint=document.createElement('canvas'),step=3;
  paint.width=Math.ceil(width/step);paint.height=Math.ceil(height/step);
  const brush=paint.getContext('2d'),pixels=brush.createImageData(paint.width,paint.height);
  for(let py=0;py<paint.height;py++)for(let px=0;px<paint.width;px++){
   const x=px*step,y=py*step,distance=roadDistance(x,y,roads);
   const broad=noise(x,y,135),mottle=noise(x+430,y-170,28),fleck=hash(px,py)-.5;
   const edge=(noise(x+87,y,37)-.5)*17+(noise(x,y+391,11)-.5)*5;
   const grass=smooth(Math.max(0,Math.min(1,(distance-edge+7)/15)));
   const meadow=(broad-.5)*30+(mottle-.5)*15+fleck*4;
   const sand=(broad-.5)*11+(mottle-.5)*6+fleck*4;
   const i=(py*paint.width+px)*4;
   pixels.data[i]=mix(244+sand,178+meadow,grass);
   pixels.data[i+1]=mix(216+sand,195+meadow*.75,grass);
   pixels.data[i+2]=mix(145+sand*.8,85+meadow*.6,grass);
   pixels.data[i+3]=255;
  }
  brush.putImageData(pixels,0,0);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(paint,0,0,width,height);
  // Restrained meadow details leave room for the taller foliage and characters.
  for(let y=20;y<height;y+=48)for(let x=20;x<width;x+=51){
   const seed=hash(x,y),px=x+hash(y,x)*39,py=y+seed*37,distance=roadDistance(px,py,roads);
   if(distance>18&&seed>.85){
    tuft(ctx,px,py,5+seed*5);
    if(seed>.989&&distance>30){flower(ctx,px+9,py-3);flower(ctx,px+17,py+3);}
   }else if(distance<-16&&seed>.975){
    // A few half-buried pebbles, with the same upper-left light as the props.
    ctx.fillStyle='#9b885d';ctx.globalAlpha=.2;ctx.beginPath();ctx.ellipse(px+1,py+2,5,2.6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#c8b58b';ctx.beginPath();ctx.moveTo(px-4,py);ctx.lineTo(px-2,py-3);ctx.lineTo(px+2,py-3);ctx.lineTo(px+5,py);ctx.lineTo(px+2,py+2);ctx.lineTo(px-3,py+2);ctx.closePath();ctx.fill();
    ctx.fillStyle='#dec99c';ctx.beginPath();ctx.moveTo(px-4,py);ctx.lineTo(px-2,py-3);ctx.lineTo(px+2,py-3);ctx.lineTo(px+1,py);ctx.closePath();ctx.fill();
   }
  }
  // Fine warm soil flecks are scattered, never aligned into a repeated tile grid.
  ctx.fillStyle='#aa985e';ctx.globalAlpha=.12;
  for(let y=8;y<height;y+=18)for(let x=8;x<width;x+=19){
   const seed=hash(x+97,y-13),px=x+seed*17,py=y+hash(y,x)*16;
   if(seed>.7&&roadDistance(px,py,roads)<-9){ctx.beginPath();ctx.ellipse(px,py,seed*1.7,.7,seed*2,0,Math.PI*2);ctx.fill();}
  }
  ctx.globalAlpha=1;
  texture.refresh();
 }
 return scene.add.image(0,0,key).setOrigin(0).setDepth(-30);
}
