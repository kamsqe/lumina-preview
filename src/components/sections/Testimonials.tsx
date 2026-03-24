import React from 'react';
import { motion } from 'framer-motion';
import Section from '../ui/Section';
import { TESTIMONIALS } from '../../lib/data';
import { useIsTouch } from '../../lib/hooks';

const EchoCard = ({ quote, author, role, delay, isTouch }: { quote: string; author: string; role: string; delay: number; isTouch: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.8 }}
    className="group relative p-5 pr-16 sm:p-8 sm:pr-16 border-l-2 border-white/10 hover:border-[#ccff00] transition-colors duration-300 bg-white/5 backdrop-blur-sm animate-breathe"
    style={{ animationDelay: `${delay}s` }}
  >
    {!isTouch && (
      <div className="absolute top-8 right-8 flex gap-1 items-end h-8">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-[#ccff00]"
            animate={{ height: [10, 30, 10] }}
            transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 0.5 }}
          />
        ))}
      </div>
    )}

    <p className="text-xl md:text-2xl text-white/80 font-light italic mb-8 relative z-10 group-hover:text-white transition-colors">
      <motion.span
        className="inline-block text-[#ccff00] not-italic mr-1"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
      >"</motion.span>
      {quote}
      <motion.span
        className="inline-block text-[#ccff00] not-italic ml-1"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 + 0.6 }}
      >"</motion.span>
    </p>

    <div>
      <h4 className="text-[#00ffff] font-bold tracking-widest uppercase text-sm group-hover:text-[#ff00ff] transition-colors">{author}</h4>
      <span className="text-white/40 text-xs font-mono">{role}</span>
    </div>
  </motion.div>
);

export default function Testimonials() {
  const isTouch = useIsTouch();
  return (
    <Section id="testimonials">
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#ff00ff]/10 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
            <span className="block">VOX</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00ffff]">POPULI</span>
          </h2>
          <p className="text-white/60 font-mono text-sm leading-relaxed">
            Incoming transmissions from the void. Decrypted user feedback from the liquid network.
          </p>
        </div>

        <div className="md:w-2/3 grid grid-cols-1 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <EchoCard key={t.author} {...t} delay={i * 0.2} isTouch={isTouch} />
          ))}
        </div>
      </div>
    </Section>
  );
}
