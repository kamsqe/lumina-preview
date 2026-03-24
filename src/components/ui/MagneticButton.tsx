import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  as?: 'button' | 'a';
  href?: string;
  [key: `data-${string}`]: string | undefined;
}

export default function MagneticButton({ children, className = '', as: Tag = 'button', href, ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const x = useSpring(motionX, { damping: 20, stiffness: 300 });
  const y = useSpring(motionY, { damping: 20, stiffness: 300 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    motionX.set((e.clientX - (left + width / 2)) * 0.3);
    motionY.set((e.clientY - (top + height / 2)) * 0.3);
  };

  const reset = () => { motionX.set(0); motionY.set(0); };

  const MotionTag = Tag === 'a' ? motion.a : motion.button;

  return (
    <MotionTag
      ref={ref as any}
      href={href}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x, y }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
