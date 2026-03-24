import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../ui/Section';
import SectionHeading from '../ui/SectionHeading';
import { FAQS } from '../../lib/data';

function TypedText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [count, setCount] = useState(0);
  const done = count >= text.length;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCount(i);
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {text.slice(0, count)}
      {!done && <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-[#ccff00] animate-pulse" />}
    </span>
  );
}

const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border-b border-white/10 last:border-0"
    >
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-8 flex justify-between items-center text-left group">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[#ff00ff] text-xs opacity-50">0{index + 1} //</span>
          <span className="text-base sm:text-xl md:text-2xl font-bold text-white group-hover:text-[#00ffff] transition-colors">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0, scale: isOpen ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3 }}
          className="text-[#ccff00] text-2xl font-mono"
        >
          +
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-8 pl-4 sm:pl-12 text-white/60 font-mono text-sm leading-relaxed max-w-3xl">
              {'>'} <TypedText text={answer} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQ() {
  return (
    <Section containerClass="max-w-5xl">
      <SectionHeading text="FAQ" accent="DATABASE" gradient="from-[#ff00ff] to-[#ccff00]" align="center" sub="System Protocol" />
      <div className="border-t border-white/10">
        {FAQS.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
        ))}
      </div>
    </Section>
  );
}
