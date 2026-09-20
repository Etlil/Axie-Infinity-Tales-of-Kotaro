export function preloadKotaro(scene){
 // HTML images stay out of WebGL until cropped into a small runtime atlas.
 // This keeps the 4815px source compatible with mobile GPUs with 4096px limits.
 for(const kind of ['walk','run','idle'])scene.load.binary('kotaro-source-'+kind,'assets/kotaro/'+kind+'-original.png');
}
async function atlas(scene,kind,cols,rows,count){
 const source=await createImageBitmap(new Blob([scene.cache.binary.get('kotaro-source-'+kind)],{type:'image/png'}));
 const scratch=document.createElement('canvas');scratch.width=source.width;scratch.height=source.height;
 const ctx=scratch.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,source.width,source.height).data;
 const texture=scene.textures.createCanvas('kotaro-'+kind+'-drawn',256*4,256*Math.ceil(count/4));
 const out=texture.getContext();
 // Every pose uses the same scale. Tight-fitting each pose separately made
 // the actor grow/shrink during a stride and made the wider run poses tiny.
 const scale=238/(source.height/rows);
 for(let i=0;i<count;i++){
  const x0=Math.round((i%cols)*source.width/cols),y0=Math.round(Math.floor(i/cols)*source.height/rows);
  const x1=Math.round((i%cols+1)*source.width/cols),y1=Math.round((Math.floor(i/cols)+1)*source.height/rows);
  let left=x1,right=x0,top=y1,bottom=y0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*source.width+x)*4+3]>40){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  const dx=(i%4)*256,dy=Math.floor(i/4)*256;
  if(left<=right&&top<=bottom){
   left=Math.max(x0,left-2);right=Math.min(x1-1,right+2);top=Math.max(y0,top-2);bottom=Math.min(y1-1,bottom+2);
   const w=right-left+1,h=bottom-top+1;
   // Keep the artist's horizontal registration; align the bottom of every
   // pose at the same baseline so switching directions cannot sink the feet.
   out.drawImage(source,left,top,w,h,dx+128+(left-x0-(x1-x0)/2)*scale,dy+246-h*scale,w*scale,h*scale);
  }
  texture.add(i,0,dx,dy,256,256);
 }
 texture.refresh();source.close();scene.cache.binary.remove('kotaro-source-'+kind);scratch.width=1;scratch.height=1;
}
export async function registerKotaro(scene){
 await atlas(scene,'walk',4,3,10);await atlas(scene,'run',3,2,6);await atlas(scene,'idle',4,3,12);
 const anim=(key,kind,frames,rate)=>scene.anims.create({key,frames:frames.map(frame=>({key:'kotaro-'+kind+'-drawn',frame})),frameRate:rate,repeat:-1});
 anim('kotaro-drawn-idle','idle',Array.from({length:12},(_,i)=>i),7);
 anim('kotaro-drawn-run','run',[0,1,2,3,4,5],12);
 for(const [direction,frames] of Object.entries({right:[0,1],up:[2,3,4],left:[5,6],down:[7,8,9]}))anim('kotaro-walk-'+direction,'walk',frames,8);
}
export function overworldKotaro(scene,x,y,height=72){
 const sprite=scene.add.sprite(x,y,'kotaro-walk-drawn',9).setOrigin(.5,246/256).setDisplaySize(height*1.2,height*1.2);
 sprite.walk=(direction,moving=true)=>{
  if(moving)sprite.play('kotaro-walk-'+direction,true);
  else {sprite.anims.stop();sprite.setFrame({right:1,up:4,left:6,down:9}[direction]??9);}
 };
 return sprite;
}
