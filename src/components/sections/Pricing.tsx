import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeading from '../ui/SectionHeading';
import MagneticButton from '../ui/MagneticButton';
import { PRICING_PLANS } from '../../lib/data';
import { useIsTouch } from '../../lib/hooks';

const CrystalCard = ({ plan, price, features, color, popular }: { plan: string; price: string; features: string[]; color: string; popular?: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glowBg = useMotionTemplate`radial-gradient(circle 250px at ${mx}px ${my}px, ${color.includes('ccff00') ? '#ccff0030' : color.includes('00ffff') ? '#00ffff30' : '#ff00ff30'}, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || isTouch) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      className="relative h-auto min-h-[450px] sm:min-h-[500px] md:h-[600px] flex-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-md border border-white/10 ${popular ? 'border-t-4 border-t-white' : ''} clip-path-crystal transition-all duration-500 overflow-hidden`}>
        {!isTouch && hovered && (
          <motion.div className="absolute inset-0 pointer-events-none" style={{ background: glowBg }} />
        )}
        <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-0 transition-opacity duration-500 ${hovered ? 'opacity-10' : ''}`} />
        {hovered && (
          <motion.div
            className={`absolute bottom-0 left-0 w-full h-2 bg-gradient-to-b ${color}`}
            animate={{ y: [600, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <div className="relative z-10 p-8 md:p-10 h-full flex flex-col items-center text-center">
        <h3 className="text-xl md:text-2xl font-bold tracking-widest uppercase mb-4">{plan}</h3>
        <div className="text-4xl md:text-5xl font-black mb-8 lumina-melt-text">{price}</div>

        <ul className="space-y-4 mb-8 md:mb-auto text-sm font-mono text-white/60">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 justify-center">
              <span className={`w-1 h-1 ${color.replace('from-', 'bg-').split(' ')[0]} rounded-full`} />
              {f}
            </li>
          ))}
        </ul>

        <MagneticButton className={`w-full py-4 px-6 border border-white/20 hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest font-bold text-xs ${popular ? 'bg-white text-black' : 'bg-transparent text-white'} mt-auto`}>
          Initialize
        </MagneticButton>
      </div>

      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 px-4 py-1 bg-white text-black text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.5)]">
          Recommended
        </div>
      )}
    </motion.div>
  );
};

export default function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading text="CRYSTAL" accent="ACCESS" gradient="from-[#ff00ff] to-[#ccff00]" align="center" />
      <motion.div
        className="flex flex-col md:flex-row gap-8 justify-center items-stretch perspective-1000"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {PRICING_PLANS.map((p) => (
          <motion.div
            key={p.plan}
            className="flex-1 min-w-0"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
            }}
          >
            <CrystalCard {...p} />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
