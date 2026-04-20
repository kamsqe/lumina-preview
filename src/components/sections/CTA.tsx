import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MagneticButton from '../ui/MagneticButton';
import { useIsTouch } from '../../lib/hooks';

const RING_COUNT = 15;
const COLORS = ['#00ffff', '#ccff00', '#ff00ff'];

const RINGS = Array.from({ length: RING_COUNT }, (_, i) => ({
  id: i,
  color: COLORS[i % 3],
  baseSize: 60 + i * 40,
  borderWidth: i < 5 ? 2 : 1,
}));

export default function CTA() {
  const isTouch = useIsTouch();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });

  const ctaOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.55, 0.7], [40, 0]);

  return (
    <section id="cta" ref={containerRef} className="relative bg-[#030305]" style={{ height: isTouch ? 'auto' : '300vh' }}>
      <div className={`${isTouch ? 'relative min-h-screen' : 'sticky top-0 h-screen'} overflow-hidden flex items-center justify-center`}>
        {/* Radial background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0a0a1a_0%,#030305_60%,#000_100%)]" />

        {/* Star dots */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${(i * 37 + 13) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                width: i % 3 === 0 ? 2 : 1,
                height: i % 3 === 0 ? 2 : 1,
                opacity: 0.1 + (i % 5) * 0.04,
              }}
            />
          ))}
        </div>

        {/* Tunnel rings — skip on touch */}
        {!isTouch && RINGS.map((ring) => {
          const ringProgress = ring.id / RING_COUNT;
          const scaleStart = 0.05 + ringProgress * 0.55;
          const scaleEnd = Math.min(scaleStart + 0.25, 0.85);

          return (
            <TunnelRing
              key={ring.id}
              ring={ring}
              scrollYProgress={scrollYProgress}
              scaleStart={scaleStart}
              scaleEnd={scaleEnd}
            />
          );
        })}

        {/* Center glow — skip on touch */}
        {!isTouch && (
          <motion.div
            className="absolute w-4 h-4 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(204,255,0,0.4) 0%, transparent 70%)',
              opacity: useTransform(scrollYProgress, [0, 0.3, 0.6], [0.8, 0.5, 0]),
              scale: useTransform(scrollYProgress, [0, 0.5], [1, 3]),
            }}
          />
        )}

        {/* CTA Content — appears after tunnel (instant on touch) */}
        <motion.div
          className="relative z-10 text-center max-w-4xl px-6"
          style={isTouch ? undefined : { opacity: ctaOpacity, y: ctaY }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-9xl font-black text-white tracking-tighter mb-8 leading-none">
            <span className="block">ENTER THE</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] via-white to-[#ff00ff]">VOID</span>
          </h2>
          <p className="text-lg md:text-2xl text-white/80 font-light mb-12 max-w-2xl mx-auto">
            The next evolution of digital experience is waiting. Cross the horizon.
          </p>

          <MagneticButton className="relative group inline-block" data-cursor-label="Enter" data-cursor-accent="#ccff00">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ccff00] to-[#00ffff] rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative px-6 sm:px-8 md:px-12 py-4 md:py-6 bg-white rounded-full flex items-center gap-3 sm:gap-4 text-black font-black tracking-wider sm:tracking-widest uppercase text-sm sm:text-base md:text-lg overflow-hidden">
              <span className="relative z-10">Initialize Project</span>
              <span className="text-2xl">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          </MagneticButton>
        </motion.div>

        {!isTouch && <div className="absolute inset-0 lumina-noise opacity-[0.05] pointer-events-none mix-blend-overlay !z-0" />}
      </div>
    </section>
  );
}

function TunnelRing({ ring, scrollYProgress, scaleStart, scaleEnd }: {
  ring: typeof RINGS[number];
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  scaleStart: number;
  scaleEnd: number;
}) {
  const scale = useTransform(scrollYProgress, [scaleStart, scaleEnd], [0.1, 8]);
  const opacity = useTransform(scrollYProgress, [scaleStart, scaleStart + 0.03, scaleEnd - 0.05, scaleEnd], [0, 0.6, 0.3, 0]);
  const blur = useTransform(scrollYProgress, [scaleStart, scaleEnd], [0, 6]);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: ring.baseSize,
        height: ring.baseSize,
        border: `${ring.borderWidth}px solid ${ring.color}`,
        boxShadow: `0 0 15px ${ring.color}25, inset 0 0 15px ${ring.color}10`,
        scale,
        opacity,
        filter: useTransform(blur, (v) => `blur(${v}px)`),
      }}
    />
  );
}
