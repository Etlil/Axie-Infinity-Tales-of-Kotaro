import { paintBurst, slash } from './world';

// An attack starts at an actual attachment point on the moving fighter.
// The 240 ms flight ends at the same instant as CombatScene applies damage.
export function bodyPartAttack(scene, actor, card, target) {
  const origin = actor.partPosition(card.part);
  const beast = actor.kind === 'buba';
  const color = card.part === 'horn' ? (beast ? 0xb8eb70 : 0xa3eaff)
    : card.part === 'mouth' ? (beast ? 0xffd071 : 0xe2caff)
    : card.part === 'back' ? 0xffe0a0 : (beast ? 0x75efcc : 0xd9caff);
  const halo = scene.add.circle(origin.x, origin.y, 16, color, .5).setDepth(29);
  scene.tweens.add({ targets: halo, scale: 2.4, alpha: 0, duration: 240, onComplete: () => halo.destroy() });
  const missile = scene.add.graphics({ x: origin.x, y: origin.y }).setDepth(30);
  missile.setData('attackPart', card.part);
  if (card.kind === 'ultimate') missile.setScale(1.6);
  if (card.part === 'horn') {
    missile.fillStyle(color).fillTriangle(-30,-12,-30,12,35,0);
    missile.lineStyle(3,0xffffff,.95).lineBetween(-22,0,29,0);
    if (beast) missile.lineStyle(2,0x5c9b43).lineBetween(-15,-8,0,0).lineBetween(-15,8,0,0);
  } else if (card.part === 'mouth') {
    missile.lineStyle(6,color).beginPath().arc(0,0,25,Math.PI*.12,Math.PI*.88).strokePath();
    missile.beginPath().arc(0,0,25,Math.PI*1.12,Math.PI*1.88).strokePath();
    [-13,13].forEach(x => {
      missile.fillStyle(0xfff8df).fillTriangle(x-6,-21,x+6,-21,x,-5);
      missile.fillTriangle(x-6,21,x+6,21,x,5);
    });
  } else if (card.part === 'back') {
    if (beast) {
      missile.fillStyle(0x987047).fillEllipse(0,0,42,57);
      missile.lineStyle(5,color).strokeEllipse(0,0,42,57);
      missile.fillStyle(color).fillCircle(0,0,7);
    } else {
      missile.lineStyle(7,color).lineBetween(-20,24,22,-24).lineBetween(-8,29,34,-19);
      missile.lineStyle(2,0xffffff).lineBetween(-20,24,22,-24).lineBetween(-8,29,34,-19);
    }
  } else {
    [color,beast ? 0xffc775 : 0xffffff,beast ? 0xec91cf : 0xb4cfff].forEach((tint,i) => {
      missile.lineStyle(9-i*2,tint,.9).beginPath().arc(-7,0,23+i*9,-1.5,1.5).strokePath();
    });
  }
  // A tail flick first curls behind the Axie; the other parts strike straight ahead.
  const control = card.part === 'tail'
    ? { x: origin.x - 110, y: origin.y - 220 }
    : { x: (origin.x + target.x) / 2, y: Math.min(origin.y,target.y) - 22 };
  const flight = { progress: 0 };
  const trail = scene.add.graphics().setDepth(28);
  let previous = origin;
  scene.tweens.add({ targets: flight, progress: 1, duration: 240, ease: 'Sine.easeIn',
    onUpdate: () => {
      const t = flight.progress, s = 1-t;
      const point = { x: s*s*origin.x + 2*s*t*control.x + t*t*target.x,
        y: s*s*origin.y + 2*s*t*control.y + t*t*target.y };
      missile.setPosition(point.x,point.y).setRotation(Math.atan2(point.y-previous.y,point.x-previous.x));
      trail.lineStyle(card.part === 'tail' ? 9 : 4,color,.45).lineBetween(previous.x,previous.y,point.x,point.y);
      previous = point;
    },
    onComplete: () => {
      missile.destroy();
      scene.tweens.add({ targets: trail, alpha: 0, duration: 220, onComplete: () => trail.destroy() });
      if (card.part === 'tail' && beast) {
        paintBurst(scene,target.x,target.y);
        if (card.kind === 'ultimate') {
          paintBurst(scene,target.x-65,target.y-50);
          paintBurst(scene,target.x+65,target.y+25);
        }
      }
      else if (card.part === 'back' || card.part === 'tail') slash(scene,target.x,target.y,color);
      else {
        const impact = scene.add.circle(target.x,target.y,25).setStrokeStyle(6,color).setDepth(31);
        scene.tweens.add({ targets: impact, scale: 2.4, alpha: 0, duration: 220, onComplete: () => impact.destroy() });
      }
    }
  });
}
