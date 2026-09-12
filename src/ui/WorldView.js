import { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Keep village art and its HTML destinations on one coordinate system. On
// narrow screens the same full-height world can be explored by dragging.
export default function WorldView({ scene, children }) {
  const viewport = useRef(null), gesture = useRef(null);
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [focus, setFocus] = useState(.525);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const measure = () => {
      const bounds = viewport.current?.getBoundingClientRect();
      if (bounds?.width && bounds?.height) setSize({ width: bounds.width, height: bounds.height });
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(viewport.current);
    window.addEventListener('resize', measure);
    measure();
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  useEffect(() => { setFocus(.525); gesture.current = null; setDragging(false); }, [scene]);
  const village = scene === 'village';
  const width = Math.max(size.width, size.height * 1.5);
  const height = width / 1.5;
  const limit = size.width / width / 2;
  const actualFocus = clamp(focus, limit, 1 - limit);
  const pannable = village && width > size.width + 20;
  const style = village ? { width, height, left: size.width / 2 - width * actualFocus, top: (size.height - height) / 2, transform: 'none' } : undefined;
  const release = () => { gesture.current = null; setDragging(false); };
  return <div ref={viewport} className={'world-viewport ' + (dragging ? 'is-dragging' : '')}>
    <div className="world-stage" style={style}>
      {children}
      {pannable && <div className="world-pan-surface" aria-hidden="true"
        onPointerDown={event => {
          if (event.button !== 0) return;
          gesture.current = { x: event.clientX, focus: actualFocus };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={event => {
          if (gesture.current) setFocus(clamp(gesture.current.focus - (event.clientX - gesture.current.x) / width, limit, 1 - limit));
        }} onPointerUp={release} onPointerCancel={release}/>}
    </div>
    {pannable && <nav className="village-camera" aria-label="Village viewpoints">
      <button onClick={() => setFocus(.16)} aria-label="View camp"><span aria-hidden="true">‹</span>Camp</button>
      <button onClick={() => setFocus(.525)} aria-label="View village square">Square</button>
      <button onClick={() => setFocus(.81)} aria-label="View village gate">Gate<span aria-hidden="true">›</span></button>
    </nav>}
  </div>;
}
