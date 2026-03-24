import React, { useEffect, useRef } from 'react';
import { useIsTouch } from '../../lib/hooks';

interface Point {
  x: number;
  y: number;
  age: number;
  speed: number;
}

export default function NeonTrail() {
  const isTouch = useIsTouch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const mouseRef = useRef({ x: -999, y: -999, px: -999, py: -999 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (isTouch) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      const dx = e.clientX - m.px;
      const dy = e.clientY - m.py;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Only paint trail when cursor is within the hero section
      const heroEl = document.getElementById('hero');
      if (!heroEl) { m.px = m.x; m.py = m.y; m.x = e.clientX; m.y = e.clientY; return; }
      const heroRect = heroEl.getBoundingClientRect();
      const inHero = e.clientY >= heroRect.top && e.clientY <= heroRect.bottom;

      if (speed > 2 && inHero) {
        pointsRef.current.push({
          x: e.clientX,
          y: e.clientY,
          age: 0,
          speed: Math.min(speed, 60),
        });
      }

      m.px = m.x;
      m.py = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMove);

    const maxAge = 120; // frames (~2s at 60fps)

    function draw() {
      if (!ctx || !canvas) return;

      const pts = pointsRef.current;

      // Skip all work when no points to draw
      if (pts.length === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        p.age++;

        if (p.age > maxAge) {
          pts.splice(i, 1);
          continue;
        }

        const life = 1 - p.age / maxAge;
        const width = Math.max(0.5, (p.speed / 60) * 6 * life);

        // Color cycles: lime → cyan → magenta based on speed
        const hue = (p.speed * 3 + p.age * 2) % 360;
        const alpha = life * Math.min(p.speed / 20, 1) * 0.7;

        // Glow layer
        ctx.beginPath();
        ctx.arc(p.x, p.y, width * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.15})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, width, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${alpha})`;
        ctx.fill();
      }

      // Draw connecting lines between recent points for smooth strokes
      if (pts.length > 1) {
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const curr = pts[i];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 50) continue; // Skip if points are too far apart

          const life = 1 - curr.age / maxAge;
          const alpha = life * 0.3;
          const hue = (curr.speed * 3 + curr.age * 2) % 360;

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${alpha})`;
          ctx.lineWidth = Math.max(0.3, (curr.speed / 60) * 3 * life);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[55] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
