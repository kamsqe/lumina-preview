import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { PROJECTS } from '../../lib/data';
import { useIsTouch } from '../../lib/hooks';

const SHARD_POLYGONS = [
  'polygon(10% 0%, 90% 10%, 100% 90%, 80% 100%, 0% 80%)',
  'polygon(0% 10%, 80% 0%, 100% 80%, 20% 100%)',
  'polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%)',
];
const HEALED_SHAPE = 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)';

const Shard = ({ image, title, category, index, onTap }: {
  image: string; title: string; category: string; index: number;
  onTap?: () => void;
}) => {
  const isTouch = useIsTouch();
  const initialShape = SHARD_POLYGONS[index % SHARD_POLYGONS.length];

  return (
    <motion.div
      className="relative h-[400px] w-full group cursor-pointer will-change-transform"
      initial={isTouch ? 'healed' : 'broken'}
      whileHover={!isTouch ? 'healed' : undefined}
      viewport={{ once: false, margin: '-100px' }}
      data-cursor-label="View"
      style={{ transform: 'translateZ(0)' }}
      onClick={isTouch ? onTap : undefined}
    >
      <motion.div
        className="w-full h-full relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-500"
        variants={{
          broken: { clipPath: initialShape, filter: 'grayscale(100%) brightness(0.7)' },
          healed: { clipPath: HEALED_SHAPE, filter: 'grayscale(0%) brightness(1)' },
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <img src={image} alt={title} className={`w-full h-full object-cover transition-transform duration-700 ${isTouch ? 'scale-100' : 'scale-125 group-hover:scale-100'}`} />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isTouch ? 'opacity-70' : 'opacity-0 group-hover:opacity-100'}`} />
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-8 z-20"
        variants={{
          broken: { opacity: 0, y: 20 },
          healed: { opacity: 1, y: 0 },
        }}
      >
        <span className="text-[#ccff00] font-mono text-xs tracking-widest uppercase mb-2 block">{category}</span>
        <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">{title}</h3>
      </motion.div>

      {!isTouch && (
        <motion.div
          className="absolute inset-0 border-2 border-[#00ffff] opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
          variants={{
            broken: { clipPath: initialShape },
            healed: { clipPath: HEALED_SHAPE },
          }}
        />
      )}
    </motion.div>
  );
};

export default function Portfolio() {
  const container = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, isTouch ? 0 : -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, isTouch ? 0 : 100]);

  return (
    <section ref={container} id="portfolio" className="py-14 md:py-32 relative bg-[#050505] overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccff00] rounded-full mix-blend-difference blur-[120px] opacity-20 pointer-events-none animate-pulse" />

      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-16 sm:mb-24 tracking-tighter text-right">
          DIMENSIONAL <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#ccff00] to-[#00ffff]">SHARDS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          <motion.div style={{ y: y1 }} className="flex flex-col gap-12">
            {PROJECTS.filter((_, i) => i % 2 === 0).map((p, i) => (
              <Shard key={p.title} index={i * 2} {...p} onTap={() => setLightbox({ image: p.image, title: p.title })} />
            ))}
          </motion.div>

          <motion.div style={{ y: y2 }} className="flex flex-col gap-12 mt-0 md:mt-24">
            {PROJECTS.filter((_, i) => i % 2 !== 0).map((p, i) => (
              <Shard key={p.title} index={i * 2 + 1} {...p} onTap={() => setLightbox({ image: p.image, title: p.title })} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox.image}
              alt={lightbox.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
              onClick={() => setLightbox(null)}
              aria-label="Close lightbox"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <span className="font-mono text-xs tracking-widest uppercase text-white/40">{lightbox.title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
