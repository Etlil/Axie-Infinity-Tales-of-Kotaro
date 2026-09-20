import {useEffect,useRef,useState} from 'react';
const directions=['up','down','left','right'];
export default function Joystick({command,prefix='intro',disabled=false}){
  const send=useRef(command),held=useRef({}),pointer=useRef(null);send.current=command;
  const [offset,setOffset]=useState({x:0,y:0});
  const release=()=>{directions.forEach(direction=>send.current(prefix+'Input',{direction,pressed:false}));held.current={};pointer.current=null;setOffset({x:0,y:0});};
  useEffect(()=>{if(disabled)release();return()=>{directions.forEach(direction=>send.current(prefix+'Input',{direction,pressed:false}));};},[disabled,prefix]); // eslint-disable-line react-hooks/exhaustive-deps
  const move=e=>{
    if(disabled||pointer.current!==e.pointerId)return;
    const r=e.currentTarget.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
    const radius=r.width*.33,length=Math.hypot(dx,dy),scale=length>radius?radius/length:1;
    setOffset({x:dx*scale,y:dy*scale});
    const next={left:dx< -10,right:dx>10,up:dy< -10,down:dy>10};
    directions.forEach(direction=>{if(Boolean(held.current[direction])!==next[direction])send.current(prefix+'Input',{direction,pressed:next[direction]});});held.current=next;
  };
  return <div className="navigation-joystick" role="group" aria-label="Movement joystick" tabIndex={0}
    onPointerDown={e=>{if(disabled)return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}}
    onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
    onKeyDown={e=>{const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(direction&&!disabled){e.preventDefault();send.current(prefix+'Input',{direction,pressed:true});}}}
    onKeyUp={release} onBlur={release} aria-disabled={disabled}>
    <span className="joystick-ring" aria-hidden="true">＋</span><span className="joystick-thumb" style={{transform:`translate(${offset.x}px,${offset.y}px)`}} aria-hidden="true"/><small>MOVE</small>
  </div>;
}
