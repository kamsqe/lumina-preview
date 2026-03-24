import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useIsTouch } from '../../lib/hooks';

export default function PortalWormhole() {
  const isTouch = useIsTouch();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Portal circle expands from 0 to full viewport
  const clipRadius = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 0, 75, 160]);
  const clipPath = useTransform(clipRadius, (r) => `circle(${r}% at 50% 50%)`);

  // Ring rotation
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const ringScale = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 0, 1.2, 2.5]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 0.95, 1], [0, 0, 0.8, 0.8, 0]);

  // Content behind portal fades in
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, 1]);

  // Vortex particles
  const particleOpacity = useTransform(scrollYProgress, [0, 0.3, 0.85, 1], [0, 0, 1, 0]);

  if (isTouch) {
    return <div ref={ref} className="h-[50vh]" />;
  }

  return (
    <div ref={ref} className="relative h-[150vh]" style={{ zIndex: 5 }}>
      <div className="sticky top-0 h-screen overflow-hidden pointer-events-none">
        {/* Dark backdrop */}
        <div className="absolute inset-0 bg-[#050505] z-0" />

        {/* Swirling ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ opacity: ringOpacity }}
        >
          <motion.div
            className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full"
            style={{
              rotate: ringRotate,
              scale: ringScale,
              background: 'conic-gradient(from 0deg, #ccff00, #00ffff, #ff00ff, transparent, #ccff00)',
              maskImage: 'radial-gradient(circle, transparent 45%, black 47%, black 53%, transparent 55%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 45%, black 47%, black 53%, transparent 55%)',
            }}
          />
        </motion.div>

        {/* Vortex particle dots */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ opacity: particleOpacity }}
        >
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 200 + Math.random() * 150;
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  background: i % 3 === 0 ? '#ccff00' : i % 3 === 1 ? '#00ffff' : '#ff00ff',
                  rotate: ringRotate,
                }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            );
          })}
        </motion.div>

        {/* Portal opening — reveals content below through circular mask */}
        <motion.div
          className="absolute inset-0 z-20 bg-[#050505]"
          style={{ clipPath }}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            style={{ opacity: contentOpacity }}
          >
            <div className="text-center">
              <motion.div
                className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#ccff00]/60 mb-4"
                style={{ opacity: contentOpacity }}
              >
                Entering the void
              </motion.div>
              <motion.div
                className="w-16 h-[1px] mx-auto bg-gradient-to-r from-transparent via-[#ccff00] to-transparent"
                style={{ opacity: contentOpacity, scaleX: contentOpacity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
