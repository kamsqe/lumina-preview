import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import Section from '../ui/Section';
import { STATS, ABOUT_CAPABILITIES, ABOUT_IMAGES } from '../../lib/data';
import { useIsTouch } from '../../lib/hooks';

const MagneticImage = ({ src, alt }: { src: string; alt: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const imgX = useMotionValue(0);
  const imgY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 15 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 15 });
  const springImgX = useSpring(imgX, { stiffness: 150, damping: 20 });
  const springImgY = useSpring(imgY, { stiffness: 150, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || isTouch) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px * 8);
    y.set(py * 8);
    rotateX.set(py * -12);
    rotateY.set(px * 12);
    imgX.set(px * -15);
    imgY.set(py * -15);
  };

  const reset = () => {
    x.set(0); y.set(0);
    rotateX.set(0); rotateY.set(0);
    imgX.set(0); imgY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ x, y, rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d' }}
      className="relative overflow-hidden group"
      data-cursor-label="Explore"
    >
      <div className="absolute inset-0 bg-transparent z-10" />
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
        style={{ x: springImgX, y: springImgY }}
      />
      <div className="absolute inset-0 bg-[#00ffff] mix-blend-overlay opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      <motion.div
        className="absolute inset-0 bg-[#00ffff] origin-left z-20"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />
    </motion.div>
  );
};

function useCountUp(target: number, isInView: boolean, duration = 2000, isFloat = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(isFloat ? parseFloat((eased * target).toFixed(1)) : Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration, isFloat]);
  return value;
}

function parseStatValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { numeric: 0, suffix: value, isNumeric: false, isFloat: false };
  const num = parseFloat(match[1]);
  return { numeric: num, suffix: match[2], isNumeric: true, isFloat: match[1].includes('.') };
}

const StatItem = ({ label, value, delay }: { label: string; value: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const parsed = parseStatValue(value);
  const count = useCountUp(parsed.numeric, inView, 2000, parsed.isFloat);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className="text-center"
    >
      <div className="text-4xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent lumina-melt-text tracking-tighter">
        {parsed.isNumeric ? (
          <>{parsed.isFloat ? count.toFixed(1) : count}{parsed.suffix}</>
        ) : (
          <motion.span
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.5, duration: 1, type: 'spring' }}
            className="inline-block"
          >
            {value}
          </motion.span>
        )}
      </div>
      <div className="text-[#ff00ff] font-mono uppercase tracking-widest mt-2 text-sm">{label}</div>
    </motion.div>
  );
};

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 0.5, 1], [200, 0, -200]);
  const x2 = useTransform(scrollYProgress, [0, 0.5, 1], [-200, 0, 200]);
  const isTouch = useIsTouch();

  return (
    <Section ref={containerRef} id="about">
      <div className="relative z-10">
        <div className="mb-24 md:mb-32 w-[100vw] relative left-[50%] -translate-x-1/2 overflow-hidden" aria-hidden="true">
          <div className="select-none">
            <motion.div
              style={{ x: isTouch ? 0 : x1 }}
              className="text-[14vw] md:text-[15vw] leading-none font-black tracking-tighter text-white whitespace-nowrap"
            >
              WE ARE THE VOID
            </motion.div>
            <motion.div
              style={{ x: isTouch ? 0 : x2 }}
              className="text-[14vw] md:text-[15vw] leading-none font-black tracking-tighter text-[#ccff00] whitespace-nowrap -mt-4 md:-mt-12"
            >
              WE ARE LIQUID
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-24 md:mb-32">
          <div className="space-y-8 order-2 md:order-1">
            <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Redefining Digital <br />
              <span className="text-[#ff00ff]">Existence.</span>
            </h3>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed">
              We don't build websites. We construct digital hallucinations. Using advanced WebGL fluids and kinetic typography, we break the barrier between user and interface.
            </p>
            <ul className="space-y-4 font-mono text-sm text-[#00ffff]">
              {ABOUT_CAPABILITIES.map((cap) => (
                <li key={cap.label} className="flex items-center gap-4">
                  <span className={`w-2 h-2 ${cap.color} rounded-full`} />
                  {cap.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 order-1 md:order-2">
            <div className="aspect-[3/4]">
              <MagneticImage {...ABOUT_IMAGES[0]} />
            </div>
            <div className="mt-12 aspect-[3/4]">
              <MagneticImage {...ABOUT_IMAGES[1]} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-white/10 pt-12 md:pt-20">
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} delay={i * 0.2} />
          ))}
        </div>
      </div>
    </Section>
  );
}
