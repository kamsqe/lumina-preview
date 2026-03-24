import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeading from '../ui/SectionHeading';
import { FEATURES } from '../../lib/data';

/* ── Typewriter hook ── */
function useTypewriter(text: string, active: boolean, speed = 20) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!active) { setOut(''); return; }
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [active, text, speed]);
  return out;
}

/* ── Decorative backgrounds per card ── */
const RippleDecor = ({ hex }: { hex: string }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="absolute rounded-full border takeover-ripple"
        style={{
          width: i * 160,
          height: i * 160,
          borderColor: `${hex}${Math.round((0.15 - i * 0.02) * 255).toString(16).padStart(2, '0')}`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}
  </div>
);

const ScanlineDecor = ({ hex }: { hex: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => (
      <div
        key={i}
        className="absolute left-0 right-0 h-[1px] takeover-scanline"
        style={{
          top: `${10 + i * 11}%`,
          background: `linear-gradient(90deg, transparent, ${hex}20, ${hex}40, ${hex}20, transparent)`,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

const GridDecor = ({ hex }: { hex: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-4 p-12 opacity-30">
      {Array.from({ length: 96 }, (_, i) => (
        <div
          key={i}
          className="rounded-full takeover-dot"
          style={{
            width: 4,
            height: 4,
            background: hex,
            animationDelay: `${(i % 12) * 0.08 + Math.floor(i / 12) * 0.1}s`,
          }}
        />
      ))}
    </div>
  </div>
);

const DECOR = [RippleDecor, ScanlineDecor, GridDecor];

/* ── Slide variants for directional transitions ── */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
};

/* ── Single Strip / Expanded Card ── */
const TakeoverStrip = ({ title, description, rune, hex, index, expanded, onExpand, onCollapse, direction, onSwipeStart, onSwipeEnd, activeIndex, total }: {
  title: string; description: string; rune: string; hex: string; index: number;
  expanded: boolean; onExpand: () => void; onCollapse: () => void;
  direction: number; onSwipeStart: (x: number) => void; onSwipeEnd: (x: number) => void;
  activeIndex: number | null; total: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const typed = useTypewriter(description, contentReady, 15);
  const Decor = DECOR[index] || DECOR[0];

  useEffect(() => {
    if (expanded) {
      const t = setTimeout(() => setContentReady(true), 500);
      return () => clearTimeout(t);
    }
    setContentReady(false);
  }, [expanded]);

  return (
    <motion.div
      layout
      onClick={() => { if (!expanded) onExpand(); }}
      className={`relative overflow-hidden cursor-pointer ${expanded ? 'fixed inset-0 z-[80]' : ''}`}
      style={{
        borderRadius: expanded ? 0 : 8,
      }}
      initial={false}
      animate={{
        height: expanded ? '100vh' : hovered ? 120 : 100,
        backgroundColor: expanded ? '#050505' : hovered ? `${hex}08` : '#080808',
      }}
      transition={{
        layout: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
        height: { duration: expanded ? 0.6 : 0.3, ease: [0.76, 0, 0.24, 1] },
        backgroundColor: { duration: 0.3 },
      }}
      onMouseEnter={() => !expanded && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent line — left edge */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        animate={{
          background: `linear-gradient(to bottom, transparent, ${hex}, transparent)`,
          opacity: hovered || expanded ? 1 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* ── COLLAPSED STATE ── */}
      {!expanded && (
        <div className="relative h-full flex items-center px-6 sm:px-10 md:px-16">
          <span className="font-mono text-xs tracking-widest mr-6 sm:mr-8 transition-colors duration-300" style={{ color: hovered ? hex : `${hex}50` }}>
            {rune}
          </span>
          <motion.h3
            className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-wider sm:tracking-widest transition-all duration-300"
            animate={{ x: hovered ? 12 : 0, color: hovered ? hex : 'rgba(255,255,255,0.7)' }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          <motion.div
            className="ml-auto"
            animate={{ x: hovered ? -4 : 0, opacity: hovered ? 1 : 0.2 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={hex} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          {/* Bottom border */}
          <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-white/5" />
        </div>
      )}

      {/* ── EXPANDED STATE ── */}
      <AnimatePresence mode="wait" custom={direction}>
        {expanded && (
          <motion.div
            key={`expanded-${index}`}
            className="absolute inset-0"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            onTouchStart={(e) => onSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => onSwipeEnd(e.changedTouches[0].clientX)}
          >
            {/* Color flood overlay */}
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 30% 40%, ${hex}12 0%, transparent 60%)` }}
            />

            {/* Decorative animation */}
            <Decor hex={hex} />

            {/* Watermark rune */}
            <div
              className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 font-black text-[30vw] leading-none pointer-events-none select-none"
              style={{ color: `${hex}06` }}
            >
              {rune}
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-28 max-w-4xl">
              <span className="font-mono text-xs tracking-widest mb-4 block" style={{ color: hex }}>
                MODULE {rune} //
              </span>
              <h3
                className="text-[10vw] sm:text-[8vw] md:text-[6vw] font-black uppercase tracking-tighter leading-[0.9] mb-8"
                style={{ color: hex, textShadow: `0 0 60px ${hex}40` }}
              >
                {title}
              </h3>
              <div className="font-mono text-sm sm:text-base text-white/60 leading-relaxed max-w-lg">
                <span className="text-white/20 select-none">{'>'} </span>
                {typed}
                {contentReady && typed.length < description.length && (
                  <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse" style={{ background: hex }} />
                )}
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-3 mt-10">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: hex }} />
                <span className="font-mono text-[10px] tracking-widest uppercase hidden sm:inline" style={{ color: `${hex}80` }}>
                  ← → NAVIGATE — ESC TO CLOSE
                </span>
                <span className="font-mono text-[10px] tracking-widest uppercase sm:hidden" style={{ color: `${hex}80` }}>
                  SWIPE TO NAVIGATE — TAP × TO CLOSE
                </span>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
              {Array.from({ length: total }, (_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i === activeIndex ? hex : 'rgba(255,255,255,0.15)',
                    boxShadow: i === activeIndex ? `0 0 8px ${hex}80` : 'none',
                    transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <motion.button
              className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20 w-12 h-12 flex items-center justify-center rounded-full border transition-colors duration-300"
              style={{ borderColor: `${hex}40` }}
              onClick={(e) => { e.stopPropagation(); onCollapse(); }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              whileHover={{ borderColor: hex, scale: 1.1 }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke={hex} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Features() {
  const [active, setActive] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef<number | null>(null);
  const total = FEATURES.length;

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setActive((prev) => prev === null ? null : (prev + dir + total) % total);
  }, [total]);

  useEffect(() => {
    if (active !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [active]);

  useEffect(() => {
    if (active === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setActive(null); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); navigate(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); navigate(-1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, navigate]);

  return (
    <Section id="features">
      <SectionHeading text="SYSTEM" accent="MODULES" gradient="from-[#00ffff] to-[#ff00ff]" />
      <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent -mt-12 mb-16" />
      <div className="space-y-2">
        {FEATURES.map((f, i) => (
          <AnimatePresence key={f.title} mode="wait">
            {(active === null || active === i) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <TakeoverStrip
                  {...f}
                  index={i}
                  expanded={active === i}
                  onExpand={() => { setDirection(0); setActive(i); }}
                  onCollapse={() => setActive(null)}
                  direction={direction}
                  onSwipeStart={(x) => { touchStart.current = x; }}
                  onSwipeEnd={(x) => {
                    if (touchStart.current === null) return;
                    const dx = x - touchStart.current;
                    touchStart.current = null;
                    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
                  }}
                  activeIndex={active}
                  total={total}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </Section>
  );
}
