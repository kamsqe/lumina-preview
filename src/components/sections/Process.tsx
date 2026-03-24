import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeading from '../ui/SectionHeading';
import { PROCESS_STEPS } from '../../lib/data';

const COMMANDS: Record<string, string> = {
  DISCOVERY: 'lumina scan --deep --target=brand_dna',
  ARCHITECT: 'lumina blueprint --mode=interactive --precision=sub-pixel',
  CONSTRUCT: 'lumina build --shaders --physics --typography',
  DEPLOY: 'lumina deploy --optimize --a11y --all-dimensions',
};

function useTypewriter(text: string, active: boolean, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed('');
      setDone(false);
      return;
    }
    let i = 0;
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [active, text, speed]);

  return { displayed, done };
}

function ProgressBar({ active, accent, onComplete }: { active: boolean; accent: string; onComplete: () => void }) {
  const [width, setWidth] = useState(0);
  const called = useRef(false);

  useEffect(() => {
    if (!active) { setWidth(0); called.current = false; return; }
    let frame = 0;
    const total = 18;
    called.current = false;
    const interval = setInterval(() => {
      frame++;
      const jitter = Math.random() * 8;
      setWidth(Math.min(100, (frame / total) * 100 + jitter));
      if (frame >= total) {
        setWidth(100);
        clearInterval(interval);
        if (!called.current) { called.current = true; onComplete(); }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="h-1.5 w-full bg-white/5 overflow-hidden mt-2 mb-3">
      <div
        className="h-full transition-[width] duration-75"
        style={{ width: `${width}%`, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }}
      />
    </div>
  );
}

const TerminalStep = ({ number, title, description, accent, index }: {
  number: string; title: string; description: string; accent: string; index: number;
}) => {
  const [phase, setPhase] = useState<'idle' | 'typing' | 'loading' | 'done'>('idle');
  const command = COMMANDS[title] || `lumina run --step=${number}`;
  const { displayed: typedCmd, done: typingDone } = useTypewriter(command, phase === 'typing', 25);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (typingDone && phase === 'typing') setPhase('loading');
  }, [typingDone, phase]);

  const handleInView = () => {
    if (phase === 'idle') setPhase('typing');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onViewportEnter={handleInView}
      className="relative"
    >
      <div className="border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3300]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ffff]/60" />
          </div>
          <span className="font-mono text-[10px] text-white/30 ml-2 tracking-wider uppercase">
            phase_{number} — {title}
          </span>
          <span
            className="ml-auto font-mono text-[10px] tracking-wider uppercase transition-colors duration-300"
            style={{ color: phase === 'done' ? accent : 'rgba(255,255,255,0.15)' }}
          >
            {phase === 'done' ? '● COMPLETE' : phase === 'loading' ? '◌ RUNNING' : '○ WAITING'}
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-4 sm:p-5 font-mono text-sm leading-relaxed">
          {/* Prompt + command */}
          <div className="flex flex-wrap items-start gap-x-2">
            <span style={{ color: accent }} className="select-none shrink-0">lumina@void:~$</span>
            <span className="text-white/90 break-all">
              {phase === 'idle' ? '' : typedCmd}
              {phase === 'typing' && (
                <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse" style={{ background: accent }} />
              )}
            </span>
          </div>

          {/* Progress bar */}
          {(phase === 'loading' || phase === 'done') && (
            <ProgressBar
              active={phase === 'loading'}
              accent={accent}
              onComplete={() => { setPhase('done'); setShowOutput(true); }}
            />
          )}

          {/* Output */}
          <AnimatePresence>
            {showOutput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="text-white/50 text-xs sm:text-sm leading-relaxed space-y-1 pt-1">
                  <span className="text-white/20 select-none">{'>'} </span>
                  <span>{description}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                  <span className="text-[10px] tracking-widest uppercase" style={{ color: accent }}>
                    Process {number}/0{PROCESS_STEPS.length} — EXIT_CODE: 0
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function Process() {
  return (
    <Section id="process">
      <SectionHeading text="PROTOCOL" accent="SEQUENCE" gradient="from-[#00ffff] to-[#ccff00]" align="center" sub="How We Build" />
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {PROCESS_STEPS.map((step, i) => (
          <TerminalStep key={step.number} {...step} index={i} />
        ))}
      </div>
    </Section>
  );
}
