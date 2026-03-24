import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function Cursor() {
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [accent, setAccent] = useState('');

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springCfg = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springCfg);
  const cursorY = useSpring(mouseY, springCfg);

  const trailCfg = { damping: 40, stiffness: 150, mass: 1 };
  const trailX = useSpring(mouseX, trailCfg);
  const trailY = useSpring(mouseY, trailCfg);

  const hasLabel = label.length > 0;

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const down = () => setClicking(true);
    const up = () => setClicking(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    const bound = new WeakSet<Element>();

    function enterHandler(this: Element) {
      setHovering(true);
      const el = this.closest('[data-cursor-label]') || this;
      const lbl = el.getAttribute('data-cursor-label');
      if (lbl) setLabel(lbl);
      const accent = el.getAttribute('data-cursor-accent') || this.closest('[data-cursor-accent]')?.getAttribute('data-cursor-accent');
      if (accent) setAccent(accent);
    }

    function leaveHandler() {
      setHovering(false);
      setLabel('');
      setAccent('');
    }

    function bindInteractives() {
      document.querySelectorAll('a, button, [role="button"], input, textarea, select, [data-cursor-label], [data-cursor-accent]').forEach((el) => {
        if (bound.has(el)) return;
        bound.add(el);
        el.addEventListener('mouseenter', enterHandler as EventListener);
        el.addEventListener('mouseleave', leaveHandler);
      });
    }

    const observer = new MutationObserver(() => bindInteractives());
    observer.observe(document.body, { childList: true, subtree: true });
    bindInteractives();

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      observer.disconnect();
    };
  }, [mouseX, mouseY, visible]);

  if (!visible) return null;

  const ringSize = clicking ? 24 : hasLabel ? 100 : hovering ? 80 : 40;

  return (
    <>
      {/* Spotlight */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[90]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Trailing dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[101] rounded-full bg-white"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
        }}
        animate={{ opacity: hasLabel ? 0 : 0.5 }}
      />

      {/* Main cursor ring */}
      <motion.div
        className="lumina-cursor flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          backgroundColor: hasLabel ? (accent || 'rgba(204,255,0,0.9)') : hovering && accent ? `${accent}20` : hovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
          borderColor: accent || (hasLabel ? '#ccff00' : clicking ? '#ccff00' : 'rgba(255,255,255,1)'),
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {hasLabel && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-mono font-bold tracking-widest uppercase text-black pointer-events-none select-none"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
