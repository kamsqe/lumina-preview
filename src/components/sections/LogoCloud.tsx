import React from 'react';
import { motion } from 'framer-motion';
import { CLIENTS } from '../../lib/data';

const LogoItem = ({ name }: { name: string }) => (
  <div className="flex-shrink-0 px-5 sm:px-8 md:px-12 py-3 sm:py-4 group cursor-default select-none">
    <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.15em] sm:tracking-[0.2em] text-white/15 group-hover:text-[#ccff00] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(204,255,0,0.4)]">
      {name}
    </span>
  </div>
);

const MarqueeRow = ({ reverse = false }: { reverse?: boolean }) => {
  const items = [...CLIENTS, ...CLIENTS];
  return (
    <div className="relative overflow-hidden group/marquee" aria-hidden="true">
      <div className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'} style={{ display: 'flex', width: 'max-content', animationPlayState: 'running' }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; }}>
        {items.map((client, i) => (
          <LogoItem key={`${client.name}-${i}`} name={client.name} />
        ))}
      </div>
    </div>
  );
};

export default function LogoCloud() {
  return (
    <section id="clients" className="relative py-16 md:py-24 overflow-hidden bg-[#050505]">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[#ccff00] font-mono tracking-widest text-xs uppercase">Signal Network</span>
          <h2 className="text-lg md:text-xl font-bold text-white/30 tracking-widest uppercase mt-2">Trusted by the Void</h2>
          <p className="sr-only">Our clients include {CLIENTS.map(c => c.name).join(', ')}.</p>
        </div>

        <div className="space-y-4 md:space-y-6 relative">
          <MarqueeRow />
          <MarqueeRow reverse />

          <div aria-hidden="true" className="absolute top-0 h-full w-32 bg-gradient-to-r from-transparent via-[#ccff00]/10 to-transparent pointer-events-none z-10 animate-scan-line" />
        </div>
      </motion.div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
