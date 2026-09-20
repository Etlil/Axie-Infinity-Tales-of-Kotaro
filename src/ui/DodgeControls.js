import { useEffect, useRef } from 'react';

function HoldButton({control,label,symbol,command,children}){
  const pointers=useRef(new Set()),send=useRef(command);send.current=command;
  const release=e=>{
    pointers.current.delete(e.pointerId);
    send.current('dodgeInput',{control,pressed:false,source:'touch-'+control+'-'+e.pointerId});
  };
  useEffect(()=>{const active=pointers.current;return()=>{
    active.forEach(id=>send.current('dodgeInput',{control,pressed:false,source:'touch-'+control+'-'+id}));
  };},[control]);
  return <button className={'movement-button movement-'+control} aria-label={label}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointers.current.add(e.pointerId);
      command('dodgeInput',{control,pressed:true,source:'touch-'+control+'-'+e.pointerId});}}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
    <b aria-hidden="true">{symbol}</b><span>{children||label}</span>
  </button>;
}
export default function DodgeControls({game,command}){
  return <div className="dodge-controls" data-player-x={game.dodgeX} data-player-y={game.dodgeY} data-grounded={game.grounded}>
    <div className="movement-pad"><HoldButton control="left" label="Move left" symbol="←" command={command}>LEFT</HoldButton><HoldButton control="right" label="Move right" symbol="→" command={command}>RIGHT</HoldButton></div>
    <div className="dodge-readout">{game.jumpTutorial?<div className="jump-lesson" role="status"><b>JUMP OVER BUBA!</b><span>Time is paused. Press Space / W / ↑ or tap JUMP to leap over his sword.</span><small>You can also use Shift / DASH to dodge later attacks.</small></div>:<><b className="dodge-timer">{game.dodgeRemaining.toFixed(1)}s</b><span>SURVIVE THE ATTACK</span><div className="dodge-track"><span style={{width:game.dodgeRemaining/(game.dodgeDuration||6.5)*100+'%'}}/></div></>}</div>
    <div className="action-pad"><HoldButton control="dash" label="Dash" symbol="»" command={command}>{game.dashReady?'DASH':Math.max(0,game.dashCooldown||0).toFixed(1)+'s'}</HoldButton><HoldButton control="jump" label="Jump" symbol="↑" command={command}>JUMP</HoldButton></div>
  </div>;
}
