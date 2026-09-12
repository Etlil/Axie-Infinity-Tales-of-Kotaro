import { useEffect, useRef } from 'react';
import { routeNodes } from '../data/bosses';

const positions = [[27, 87], [72, 68], [35, 46], [74, 26], [43, 7]];

export default function JourneyMap({ game, command }) {
  const scroll = useRef(null), selectedNode = useRef(null);
  useEffect(() => {
    const center = () => {
      const element = scroll.current, node = selectedNode.current;
      if (element?.clientHeight && node) element.scrollTop = node.offsetTop - element.clientHeight * .62;
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(center);
    observer?.observe(scroll.current);
    center();
    return () => observer?.disconnect();
  }, [game.selectedStage]);
  return <div ref={scroll} className="journey-scroll" aria-label="Forest trail map">
    <div className="journey-route">
      <svg viewBox="0 0 360 600" preserveAspectRatio="none" aria-hidden="true">
        <path className="route-shadow" d="M97 522C-5 457 300 471 259 408S64 344 126 276S329 219 266 156S109 122 155 42"/>
        <path className="route-ground" d="M97 522C-5 457 300 471 259 408S64 344 126 276S329 219 266 156S109 122 155 42"/>
        <path className="route-dashes" d="M97 522C-5 457 300 471 259 408S64 344 126 276S329 219 266 156S109 122 155 42"/>
      </svg>
      {routeNodes.map((node, index) => {
        const locked = node.type === 'locked' || index > game.unlockedStage;
        const completed = game.completedStages.includes(index), selected = game.selectedStage === index;
        return <button key={node.id} ref={selected ? selectedNode : null}
          className={'journey-node ' + (selected ? 'selected ' : '') + (completed ? 'completed ' : '') + (locked ? 'locked' : '')}
          style={{ left: positions[index][0] + '%', top: positions[index][1] + '%' }}
          disabled={locked} aria-label={'Stage ' + (index + 1) + ': ' + node.title} aria-pressed={selected}
          onClick={() => command('selectStage', index)}>
          {selected && <span className={'route-companion portrait ' + game.activeCharacter} aria-hidden="true"/>}
          <span className="journey-medal">{locked ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/></svg> : completed ? '✓' : index + 1}</span>
          <strong>{node.title}</strong><small>{locked ? 'LOCKED' : completed ? 'CLEARED' : node.type === 'boss' ? 'RESCUE PUFFY' : selected ? 'NEXT ENCOUNTER' : 'EXPLORE'}</small>
        </button>;
      })}
    </div>
  </div>;
}
