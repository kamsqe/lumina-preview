import React, { useEffect, useRef, useState } from 'react';
import { useIsTouch } from '../../lib/hooks';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let nextRippleId = 0;

export default function ClickExplosion() {
  const isTouch = useIsTouch();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    if (isTouch) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, textarea, select, [role="button"]')) return;

      const id = nextRippleId++;
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 900);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      <svg className="fixed w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="ripple-warp" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" seed="5" result="turb" />
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="30" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="fixed inset-0 z-[65] pointer-events-none overflow-hidden">
        {ripples.map(rip => (
          <div
            key={rip.id}
            className="absolute rounded-full ripple-splash"
            style={{
              left: rip.x,
              top: rip.y,
            }}
          />
        ))}
      </div>
    </>
  );
}
