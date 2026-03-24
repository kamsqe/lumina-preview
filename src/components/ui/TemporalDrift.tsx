import { useEffect } from 'react';
import { useIsTouch } from '../../lib/hooks';

const PHASES = [
  // 0-20s: Normal
  { lime: '#ccff00', cyan: '#00ffff', magenta: '#ff00ff', bg: '#050505' },
  // 20-40s: Warmer
  { lime: '#e6d400', cyan: '#00ccaa', magenta: '#ff33aa', bg: '#080604' },
  // 40-60s: Deep
  { lime: '#ffaa00', cyan: '#0099aa', magenta: '#cc00ff', bg: '#0a0508' },
  // 60s+: Void mode
  { lime: '#ff6600', cyan: '#006688', magenta: '#9900cc', bg: '#08020a' },
];

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

export default function TemporalDrift() {
  const isTouch = useIsTouch();

  useEffect(() => {
    if (isTouch) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const startTime = Date.now();
    const phaseDuration = 20000; // 20s per phase

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const totalPhases = PHASES.length - 1;
      const rawPhase = elapsed / phaseDuration;
      const phaseIndex = Math.min(Math.floor(rawPhase), totalPhases - 1);
      const t = Math.min(rawPhase - phaseIndex, 1);

      const from = PHASES[phaseIndex];
      const to = PHASES[Math.min(phaseIndex + 1, totalPhases)];

      const root = document.documentElement;
      root.style.setProperty('--lumina-lime', lerpColor(from.lime, to.lime, t));
      root.style.setProperty('--lumina-cyan', lerpColor(from.cyan, to.cyan, t));
      root.style.setProperty('--lumina-magenta', lerpColor(from.magenta, to.magenta, t));
      root.style.setProperty('--lumina-bg', lerpColor(from.bg, to.bg, t));
    }, 500);

    return () => {
      clearInterval(interval);
      // Reset to defaults
      const root = document.documentElement;
      root.style.removeProperty('--lumina-lime');
      root.style.removeProperty('--lumina-cyan');
      root.style.removeProperty('--lumina-magenta');
      root.style.removeProperty('--lumina-bg');
    };
  }, [isTouch]);

  return null;
}
