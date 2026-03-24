import React, { useEffect, useRef, useCallback } from 'react';
import { useIsTouch } from '../../lib/hooks';

const ACCENT_MAP: Record<string, string> = {
  about: '#00ffff',
  features: '#ff00ff',
  process: '#00ffff',
  portfolio: '#ccff00',
  team: '#ff00ff',
  pricing: '#ccff00',
  testimonials: '#ccff00',
  faq: '#ff00ff',
  cta: '#ccff00',
  contact: '#00ffff',
};

export default function CursorLight() {
  const isTouch = useIsTouch();
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const prevMouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const frameRef = useRef(0);
  const headingsRef = useRef<HTMLElement[]>([]);

  const cacheHeadings = useCallback(() => {
    headingsRef.current = Array.from(document.querySelectorAll('h2, h3')) as HTMLElement[];
  }, []);

  const update = useCallback(() => {
    frameRef.current++;
    const { x, y } = mouseRef.current;

    // Only compute every 6th frame
    if (frameRef.current % 6 === 0 && x > -1000) {
      // Skip if cursor hasn't moved
      const prev = prevMouseRef.current;
      if (x !== prev.x || y !== prev.y) {
        prevMouseRef.current = { x, y };
        const vh = window.innerHeight;

        headingsRef.current.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // Viewport cull — skip headings far off-screen
          if (rect.bottom < -200 || rect.top > vh + 200) {
            el.style.textShadow = 'none';
            return;
          }

          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - x;
          const dy = cy - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 800;

          if (dist > maxDist) {
            el.style.textShadow = 'none';
            return;
          }

          const intensity = 1 - dist / maxDist;
          const shadowX = (dx / dist) * intensity * 20;
          const shadowY = (dy / dist) * intensity * 20;
          const blur = 8 + intensity * 15;
          const alpha = intensity * 0.5;

          let color = '#ccff00';
          const section = el.closest('section');
          if (section) {
            const id = section.id || '';
            color = ACCENT_MAP[id] || '#ccff00';
          }

          el.style.textShadow =
            `${shadowX}px ${shadowY}px ${blur}px ${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        });
      }
    }

    rafRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Cache headings on mount + watch for new ones
    cacheHeadings();
    const observer = new MutationObserver(cacheHeadings);
    observer.observe(document.body, { childList: true, subtree: true });

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      headingsRef.current.forEach((el) => { el.style.textShadow = 'none'; });
    };

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    rafRef.current = requestAnimationFrame(update);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, update, cacheHeadings]);

  return null;
}
