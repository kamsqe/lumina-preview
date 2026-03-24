import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  text: string;
  accent: string;
  gradient?: string;
  align?: 'left' | 'center' | 'right';
  sub?: string;
}

export default function SectionHeading({
  text,
  accent,
  gradient = 'from-[#00ffff] to-[#ff00ff]',
  align = 'left',
  sub,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';
  const allWords = [...text.split(' '), accent];
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect(); } },
      { rootMargin: '-80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`mb-16 md:mb-24 ${alignClass}`}>
      {sub && (
        <span
          className={`text-[#ccff00] font-mono tracking-widest text-xs uppercase mb-4 block transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-100'}`}
        >
          {sub}
        </span>
      )}
      <h2 className="text-3xl sm:text-5xl md:text-8xl font-black text-white tracking-tighter">
        {allWords.map((word, i) => {
          const isAccent = i === allWords.length - 1;
          return (
            <React.Fragment key={i}>
              <motion.span
                className={`inline-block ${isAccent ? `text-transparent bg-clip-text bg-gradient-to-r ${gradient}` : ''}`}
                initial={false}
                animate={animate ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1], delay: i * 0.08 }}
              >
                {word}
              </motion.span>
              {!isAccent && ' '}
            </React.Fragment>
          );
        })}
      </h2>
    </div>
  );
}
