import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeading from '../ui/SectionHeading';
import { TEAM_MEMBERS } from '../../lib/data';
import { useIsTouch } from '../../lib/hooks';

const HoloCard = ({ name, role, image, accent }: { name: string; role: string; image: string; accent: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 15 });
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 15 });

  const holoGradient = useMotionTemplate`radial-gradient(circle at ${mouseX}px ${mouseY}px, ${accent}44, #00ffff33, #ff00ff22, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || isTouch) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
    rawRotateX.set((y / rect.height - 0.5) * -12);
    rawRotateY.set((x / rect.width - 0.5) * 12);
  };

  const handleMouseLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-default"
      data-cursor-label="Profile"
    >
    <motion.div
      style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
      className="relative"
    >
      <div className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm group-hover:border-white/20 transition-all duration-500">
        <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
          <motion.div
            className="absolute inset-0 bg-[#ff00ff] origin-top z-20"
            initial={{ scaleY: 1 }}
            whileInView={{ scaleY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${accent}44, transparent 70%)` }}
          />
          {!isTouch && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300 mix-blend-color-dodge pointer-events-none"
              style={{ background: holoGradient }}
            />
          )}
        </div>

        <div className="p-3 sm:p-5 md:p-6">
          <h3 className="text-sm sm:text-lg font-bold text-white tracking-wide uppercase">{name}</h3>
          <p className="font-mono text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase mt-1" style={{ color: accent }}>{role}</p>
        </div>

        <div
          className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
      </div>
    </motion.div>
    </div>
  );
};

export default function Team() {
  return (
    <Section id="team">
      <SectionHeading text="NEURAL" accent="NODES" gradient="from-[#ccff00] to-[#ff00ff]" />
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 perspective-1000"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {TEAM_MEMBERS.map((member) => (
          <motion.div
            key={member.name}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <HoloCard {...member} />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
