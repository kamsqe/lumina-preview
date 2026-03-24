import React, { useEffect, useRef, useCallback } from 'react';
import { useIsTouch } from '../../lib/hooks';

export default function GravityWell() {
  const isTouch = useIsTouch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const prevRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y, vx, vy } = mouseRef.current;
    const speed = Math.sqrt(vx * vx + vy * vy);
    const intensity = Math.min(speed / 8, 1);
    const shouldDraw = intensity > 0.02 && scrollingRef.current;

    // Skip work when idle — only clear if we were previously active
    if (!shouldDraw) {
      if (activeRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeRef.current = false;
      }
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    activeRef.current = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const radius = 120 + intensity * 80;
    const rings = 5;

    for (let r = 0; r < rings; r++) {
      const ringRadius = radius * ((r + 1) / rings);
      const alpha = (1 - r / rings) * intensity * 0.35;
      const hue = (r * 60 + performance.now() * 0.1) % 360;

      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
      ctx.lineWidth = 1.5 - r * 0.2;
      ctx.stroke();
    }

    // Radial distortion lines
    const lineCount = 12;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2 + performance.now() * 0.002;
      const innerR = 20 + intensity * 10;
      const outerR = radius * 0.8;
      const alpha = intensity * 0.3;

      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR);
      ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR);
      ctx.strokeStyle = `rgba(204, 255, 0, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMove = (e: MouseEvent) => {
      const prev = prevRef.current;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        vx: e.clientX - prev.x,
        vy: e.clientY - prev.y,
      };
      prevRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, vx: 0, vy: 0 };
    };

    const handleScroll = () => {
      scrollingRef.current = true;
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        scrollingRef.current = false;
      }, 300);
    };

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, draw]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
