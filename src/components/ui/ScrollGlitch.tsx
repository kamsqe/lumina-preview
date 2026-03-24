import React, { useEffect, useRef, useState } from 'react';
import { useIsTouch } from '../../lib/hooks';

export default function ScrollGlitch() {
  const isTouch = useIsTouch();
  const [slices, setSlices] = useState<{ y: number; h: number; x: number; color: string }[]>([]);
  const lastScrollRef = useRef(0);
  const cooldownRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isTouch) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let lastY = window.scrollY;

    const handleScroll = () => {
      const delta = window.scrollY - lastY;
      const velocity = Math.abs(delta);
      lastY = window.scrollY;

      // Only trigger when scrolling UP (negative delta)
      if (delta < 0 && velocity > 80 && !cooldownRef.current) {
        cooldownRef.current = true;

        const sliceCount = 3 + Math.floor(Math.random() * 3);
        const vh = window.innerHeight;
        const newSlices = Array.from({ length: sliceCount }, () => {
          const y = Math.random() * vh;
          const h = 20 + Math.random() * 60;
          const x = (Math.random() - 0.5) * Math.min(velocity * 0.5, 40);
          const colors = ['rgba(0,255,255,0.15)', 'rgba(255,0,255,0.15)', 'rgba(204,255,0,0.12)'];
          return { y, h, x, color: colors[Math.floor(Math.random() * colors.length)] };
        });

        setSlices(newSlices);

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setSlices([]);
          setTimeout(() => { cooldownRef.current = false; }, 300);
        }, 150);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerRef.current);
    };
  }, [isTouch]);

  if (isTouch || slices.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {slices.map((s, i) => (
        <div
          key={i}
          className="absolute left-0 w-full"
          style={{
            top: s.y,
            height: s.h,
            transform: `translateX(${s.x}px)`,
            background: s.color,
            mixBlendMode: 'screen',
          }}
        />
      ))}
      {/* Chromatic split overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'transparent',
          boxShadow: `inset ${slices[0]?.x || 0}px 0 0 rgba(255,0,255,0.08), inset ${-(slices[0]?.x || 0)}px 0 0 rgba(0,255,255,0.08)`,
        }}
      />
    </div>
  );
}
