import { useEffect, useRef, useState } from 'react';

function Highlighted({text}){
  return text.split(/(Atia|Buba|nightmare Axies|corruption|amulet|Adventure Rank|restore)/gi)
    .map((part,i)=>i%2?<em key={i}>{part}</em>:part);
}
export default function DialogueBox({speaker='Buba',portrait='buba',title,text,buttonLabel='Continue',onAdvance,paused=false}){
  const [visible,setVisible]=useState(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?text.length:0);
  const ready=visible>=text.length,action=useRef(null);
  action.current=()=>{if(paused)return;if(!ready)setVisible(text.length);else onAdvance();};
  useEffect(()=>{
    if(ready||paused)return;
    const timer=setInterval(()=>setVisible(n=>Math.min(text.length,n+2)),28);
    return()=>clearInterval(timer);
  },[ready,paused,text]);
  useEffect(()=>{
    const key=e=>{
      if(paused||e.repeat||!['x','X','Enter'].includes(e.key)||e.target?.closest?.('input,textarea,select'))return;
      e.preventDefault();e.stopPropagation();action.current();
    };
    document.addEventListener('keydown',key,true);
    return()=>document.removeEventListener('keydown',key,true);
  },[paused]);
  return <section className="dialogue-box" aria-label={speaker+' dialogue'} data-typing={!ready}>
    <svg className="dialogue-ornament" viewBox="0 0 32 32" aria-hidden="true"><path d="M29 4H12L4 12v17M20 4l-6 8-7-2M4 20l8-6-2-7"/></svg>
    <svg className="dialogue-ornament right" viewBox="0 0 32 32" aria-hidden="true"><path d="M29 4H12L4 12v17M20 4l-6 8-7-2M4 20l8-6-2-7"/></svg>
    <div className={'dialogue-face '+portrait} aria-hidden="true">{portrait==='buba'?<img src="/assets/atia/buba-avatar.png" alt=""/>:<span className="portrait kotaro"/>}</div>
    <div className="dialogue-writing"><span className="dialogue-speaker">{speaker}</span><h2 className="sr-only">{title}</h2>
      <p className="sr-only">{text}</p><p className="dialogue-copy" aria-hidden="true"><Highlighted text={text.slice(0,visible)}/><span className="dialogue-caret">{!ready?'▎':''}</span></p>
      <button className="dialogue-advance" onClick={()=>action.current()} aria-label={ready?buttonLabel:'Reveal dialogue'}><kbd>X</kbd><span>{ready?buttonLabel:'Reveal text'}</span><b aria-hidden="true">▾</b></button>
    </div>
  </section>;
}
