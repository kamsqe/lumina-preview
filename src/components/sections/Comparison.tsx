import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeading from '../ui/SectionHeading';
import { COMPARISON_FEATURES } from '../../lib/data';
import { useIsTouch } from '../../lib/hooks';

const CheckMark = ({ active }: { active: boolean }) => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block">
    <path
      d="M5 12l5 5L19 7"
      stroke="#ccff00"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="24"
      strokeDashoffset={active ? 0 : 24}
      style={{
        transition: 'stroke-dashoffset 0.6s ease-out',
      }}
    />
  </svg>
);

const XMark = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block opacity-40">
    <path d="M8 8l8 8M16 8l-8 8" stroke="#ff3300" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PartialMark = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block opacity-40">
    <path d="M6 12h12" stroke="#ff9900" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ComparisonRow = ({ feature, standard, lumina, index, progress }: {
  feature: string;
  standard: boolean | 'partial';
  lumina: boolean;
  index: number;
  progress: number;
}) => {
  const threshold = (index + 1) / (COMPARISON_FEATURES.length + 1);
  const isActive = progress > threshold;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="grid grid-cols-[1fr_56px_56px] sm:grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_120px_120px] items-center py-3 sm:py-4 md:py-5 border-b border-white/5"
    >
      <div className={`contents transition-opacity duration-500 ${isActive ? '[&>*]:opacity-100' : '[&>*]:opacity-30'}`}>
      <div className="flex items-center gap-3 md:gap-4 transition-opacity duration-500">
        <span className="font-mono text-[#ff00ff] text-xs opacity-40 hidden sm:inline">0{index + 1} //</span>
        <span className={`text-xs sm:text-sm md:text-base font-medium transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/30'}`}>
          {feature}
        </span>
      </div>

      <div className="flex justify-center transition-opacity duration-500">
        {standard === 'partial' ? <PartialMark /> : standard ? (
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block opacity-30">
            <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : <XMark />}
      </div>

      <div className="flex justify-center transition-opacity duration-500">
        {lumina ? (
          <div className="relative">
            <CheckMark active={isActive} />
            {isActive && (
              <div className="absolute inset-0 animate-pulse" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block blur-sm">
                  <path d="M5 12l5 5L19 7" stroke="#ccff00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ) : <XMark />}
      </div>
      </div>
    </motion.div>
  );
};

export default function Comparison() {
  const isTouch = useIsTouch();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.6'],
  });

  const scanY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const scanOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <Section id="comparison" containerClass="max-w-4xl">
      <SectionHeading text="SYSTEM" accent="OVERRIDE" gradient="from-[#ccff00] to-[#00ffff]" align="center" sub="Capability Scan" />

      <div ref={containerRef} className="relative">
        <div className="grid grid-cols-[1fr_56px_56px] sm:grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_120px_120px] items-center pb-4 border-b border-white/10 mb-2">
          <div />
          <div className="text-center font-mono text-[10px] sm:text-xs tracking-wider sm:tracking-widest text-white/30 uppercase">Std</div>
          <div className="text-center font-mono text-[10px] sm:text-xs tracking-wider sm:tracking-widest text-[#ccff00] uppercase">Lumina</div>
        </div>

        {COMPARISON_FEATURES.map((item, i) => (
          <ComparisonRowWrapper key={item.feature} item={item} index={i} scrollProgress={scrollYProgress} isTouch={isTouch} />
        ))}

        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent pointer-events-none z-10 blur-[0.5px]"
          style={{ top: scanY, opacity: scanOpacity, mixBlendMode: 'soft-light' }}
        />
      </div>
    </Section>
  );
}

function ComparisonRowWrapper({ item, index, scrollProgress, isTouch }: {
  item: typeof COMPARISON_FEATURES[number];
  index: number;
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  isTouch: boolean;
}) {
  const [currentProgress, setCurrentProgress] = React.useState(isTouch ? 1 : 0);

  React.useEffect(() => {
    if (isTouch) return;
    const unsubscribe = scrollProgress.on('change', (v) => setCurrentProgress(v));
    return unsubscribe;
  }, [scrollProgress, isTouch]);

  return (
    <ComparisonRow
      feature={item.feature}
      standard={item.standard}
      lumina={item.lumina}
      index={index}
      progress={currentProgress}
    />
  );
}
