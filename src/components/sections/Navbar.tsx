import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll } from 'framer-motion';
import { useScrolled } from '../../lib/hooks';
import { NAV_LINKS } from '../../lib/data';

function useScrollPercent() {
  const { scrollYProgress } = useScroll();
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => setPercent(Math.round(v * 100)));
    return unsub;
  }, [scrollYProgress]);
  return percent;
}

function useActiveSection() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace('#', ''));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

const NavLink = ({ href, label, isActive }: { href: string; label: string; isActive: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { damping: 25, stiffness: 300 });
  const sy = useSpring(my, { damping: 25, stiffness: 300 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (left + width / 2)) * 0.15);
    my.set((e.clientY - (top + height / 2)) * 0.15);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); reset(); }}
      onMouseMove={handleMouse}
      style={{ x: sx, y: sy }}
      className="relative px-4 py-2 group"
    >
      <span className={`relative z-10 text-xs font-mono tracking-widest uppercase transition-colors duration-300 ${isActive ? 'text-[#ccff00]' : 'text-white/70 group-hover:text-[#ccff00]'}`}>
        {label}
      </span>
      <span aria-hidden="true" className="absolute inset-0 text-xs font-mono tracking-widest uppercase text-[#ff00ff] opacity-0 group-hover:opacity-50 transition-opacity duration-100 translate-x-[1px] translate-y-[-1px]">
        {label}
      </span>
      <motion.div
        className="absolute bottom-0 left-0 h-[1px] bg-[#ccff00]"
        initial={{ width: 0 }}
        animate={{ width: hovered || isActive ? '100%' : 0 }}
        transition={{ duration: 0.3 }}
      />
      {isActive && (
        <motion.div
          layoutId="nav-dot"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ccff00]"
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      )}
    </motion.a>
  );
};

export default function Navbar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection();
  const scrollPercent = useScrollPercent();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 sm:py-4' : 'py-4 sm:py-8'}`}
      >
        <div className="container mx-auto px-6">
          <div
            className={`relative backdrop-blur-md border border-white/10 rounded-full flex items-center justify-between px-4 sm:px-8 transition-all duration-500 ${scrolled ? 'bg-black/80 h-14 sm:h-16' : 'bg-white/5 h-16 sm:h-20'}`}
          >
            <a href="#" className="flex items-center gap-2 group">
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ccff00] to-[#00ffff]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ rotate: 360, scale: 1.2 }}
              />
              <span className="font-bold tracking-tighter text-white text-xl group-hover:text-[#ccff00] transition-colors duration-300">LUMINA</span>
            </a>

            <div className="hidden md:flex items-center gap-2">
              {NAV_LINKS.map((link, i) => (
                <NavLink key={i} {...link} isActive={activeSection === link.href} />
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden md:block font-mono text-[10px] text-white/30 tracking-widest tabular-nums">{scrollPercent}%</span>
              <a href="#contact" className="hidden md:block px-6 py-2 border border-white/20 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Initialize
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileOpen}
                className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5"
              >
                <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }} className="w-6 h-0.5 bg-white origin-center" />
                <motion.span animate={{ opacity: mobileOpen ? 0 : 1 }} className="w-6 h-0.5 bg-white" />
                <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }} className="w-6 h-0.5 bg-white origin-center" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center"
          >
            <div className="flex flex-col gap-8 text-center">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={i}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-3xl sm:text-4xl font-black text-white hover:text-[#ccff00] tracking-tighter uppercase"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
