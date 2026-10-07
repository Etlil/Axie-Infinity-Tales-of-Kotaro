// Keep gameplay on the grid, but carry movement time across tile boundaries.
// A held direction never waits for another timer/tween before the next step.
export default class GridWalk{
  constructor(sprite,{tileSize,stepMs=180,position,canEnter=()=>true,onStart=()=>{},onArrive=()=>{}}){
    Object.assign(this,{sprite,tileSize,stepMs,canEnter,onStart,onArrive});
    this.position={x:position.x,y:position.y};this.target=null;this.elapsed=0;this.revision=0;
  }
  get moving(){return this.target!==null;}
  place(position){
    this.sprite.x=(position.x+.5)*this.tileSize;
    this.sprite.y=(position.y+.5)*this.tileSize;
  }
  stop(){
    this.revision++;this.target=null;this.elapsed=0;this.place(this.position);
  }
  update(delta,chooseNext){
    // Avoid a large jump after returning from a suspended browser tab.
    let remaining=Math.min(Math.max(delta||0,0),80);
    const revision=this.revision;
    while(remaining>0||!this.target){
      if(!this.target){
        const next=chooseNext(this.position);
        if(!next||Math.abs(next.x-this.position.x)+Math.abs(next.y-this.position.y)!==1||!this.canEnter(next))break;
        this.target={x:next.x,y:next.y};this.elapsed=0;
        this.onStart(this.position,this.target);
        if(this.revision!==revision)break;
      }
      const spent=Math.min(remaining,this.stepMs-this.elapsed);
      this.elapsed+=spent;remaining-=spent;
      const progress=this.elapsed/this.stepMs;
      this.place({x:this.position.x+(this.target.x-this.position.x)*progress,y:this.position.y+(this.target.y-this.position.y)*progress});
      if(this.elapsed>=this.stepMs){
        this.position=this.target;this.target=null;this.elapsed=0;
        this.onArrive(this.position);
        if(this.revision!==revision)break;
      }
    }
  }
}
