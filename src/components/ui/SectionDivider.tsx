import React from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';
import { useIsTouch } from '../../lib/hooks';

interface SectionDividerProps {
  variant?: 'glitch' | 'gradient' | 'dots';
}

function useScrollVelocityScale(skip: boolean) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const absVelocity = useTransform(velocity, (v) => skip ? 0 : Math.min(Math.abs(v) / 1000, 1));
  const smoothed = useSpring(absVelocity, { stiffness: 100, damping: 20 });
  return smoothed;
}

export default function SectionDivider({ variant = 'glitch' }: SectionDividerProps) {
  const isTouch = useIsTouch();
  if (variant === 'dots') {
    return (
      <div aria-hidden="true" className="relative py-8 flex items-center justify-center gap-3 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/20"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div aria-hidden="true" className="relative h-px w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        />
      </div>
    );
  }

  // glitch variant
  const velocityScale = useScrollVelocityScale(isTouch);
  const cyanX = useTransform(velocityScale, [0, 1], [0, 60]);
  const magentaX = useTransform(velocityScale, [0, 1], [0, -40]);
  const glitchOpacity = useTransform(velocityScale, [0, 0.2, 1], [0.3, 0.6, 1]);

  return (
    <div aria-hidden="true" className="relative py-4 overflow-hidden">
      <motion.div
        className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'circOut' }}
      />
      <motion.div
        className="absolute top-4 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#00ffff]/30 to-transparent"
        style={{ x: cyanX, opacity: glitchOpacity }}
      />
      <motion.div
        className="absolute top-4 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#ff00ff]/20 to-transparent"
        style={{ x: magentaX, opacity: glitchOpacity }}
      />
    </div>
  );
}
