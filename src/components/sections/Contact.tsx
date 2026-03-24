import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import * as v from 'valibot';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../ui/Section';
import MagneticButton from '../ui/MagneticButton';

const PACKET_TYPES = ['SYNC_PACKET', 'AUTH_HANDSHAKE', 'DATA_STREAM', 'HEARTBEAT', 'SIGNAL_RELAY', 'MESH_PING'];
const STATUSES = ['[OK]', '[OK]', '[OK]', '[OK]', '[ACK]', '[RELAY]'];

function LiveTerminal() {
  const [lines, setLines] = useState<string[]>(() =>
    Array.from({ length: 12 }, (_, i) => `> ${PACKET_TYPES[i % PACKET_TYPES.length]}_${String(1000 + i * 37).padStart(4, '0')} ${STATUSES[i % STATUSES.length]}`)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const counter = useRef(12);

  useEffect(() => {
    const interval = setInterval(() => {
      const type = PACKET_TYPES[Math.floor(Math.random() * PACKET_TYPES.length)];
      const code = String(1000 + counter.current * 37).padStart(4, '0');
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      counter.current++;
      setLines((prev) => [...prev.slice(-30), `> ${type}_${code} ${status}`]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="p-4 sm:p-8 border border-white/10 bg-white/5 font-mono text-xs text-[#ccff00]/80 h-64 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] z-10 pointer-events-none" />
      <div ref={scrollRef} className="h-full overflow-hidden flex flex-col justify-end">
        {lines.map((line, i) => (
          <motion.div
            key={`${i}-${line}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-2 whitespace-nowrap"
          >
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const ContactSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('REQUIRED::IDENTITY_CODE')),
  email: v.pipe(v.string(), v.trim(), v.nonEmpty('REQUIRED::SIGNAL_FREQUENCY'), v.email('INVALID::FORMAT')),
  message: v.pipe(v.string(), v.trim(), v.nonEmpty('REQUIRED::TRANSMISSION_DATA')),
});

function playTransmitBeep() {
  if (document.documentElement.dataset.sound !== 'on') return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => ctx.close();
  } catch {}
}

const VoidInput = ({ label, name, type = 'text', placeholder, required, value, onChange, error }: {
  label: string; name: string; type?: string; placeholder: string; required?: boolean;
  value: string; onChange: (v: string) => void; error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const active = focused || value.length > 0;

  const shared = 'w-full bg-transparent border-b border-white/20 py-4 text-white focus:outline-none focus:border-transparent transition-all';

  return (
    <div className="relative group mb-10">
      <label
        htmlFor={id}
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-mono text-xs uppercase tracking-wider sm:tracking-widest ${active ? '-top-6 text-[#ccff00]' : 'top-4 text-white/40'}`}
      >
        {label}{required && <span className="text-[#ff00ff] ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          className={`${shared} min-h-[100px] resize-none`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? placeholder : ''}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          className={shared}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? placeholder : ''}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
        />
      )}

      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[#1a1a1a]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#ccff00] to-[#00ffff]"
          initial={{ width: '0%' }}
          animate={{ width: focused ? '100%' : '0%' }}
          transition={{ duration: 0.5, ease: 'circOut' }}
        />
      </div>

      <AnimatePresence>
        {focused && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 text-[#ff00ff] font-mono text-[10px] animate-pulse"
          >
            INPUT_ACTIVE
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p id={errorId} className="absolute -bottom-5 left-0 text-[#ff3300] font-mono text-[10px] tracking-wider" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const validate = useCallback(() => {
    const result = v.safeParse(ContactSchema, form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const e: Record<string, string> = {};
    for (const issue of result.issues) {
      const key = issue.path?.[0]?.key as string | undefined;
      if (key && !e[key]) e[key] = issue.message;
    }
    setErrors(e);
    return false;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    playTransmitBeep();
    setStatus('sending');
    // TODO: Replace this simulated submission with a real backend endpoint.
    // Options: Formspree (fetch to https://formspree.io/f/YOUR_ID),
    //          Cloudflare Workers, or Netlify Forms (add `netlify` attr to <form>).
    //          See README.md "Contact Form" section for details.
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <Section id="contact" className="bg-[#0a0a0a]" containerClass="max-w-6xl flex flex-col md:flex-row gap-12 md:gap-24">
      <div className="md:w-1/2">
        <h2 className="text-4xl sm:text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
          <span className="block">START</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff]">SEQUENCE</span>
        </h2>
        <p className="text-white/60 font-mono text-sm leading-relaxed mb-12">
          Initialize communication protocol. Our liquid network is listening. Transmission latency: 0.00ms.
        </p>

        <LiveTerminal />
      </div>

      <div className="md:w-1/2 lumina-gradient-border p-5 sm:p-8 md:p-12 backdrop-blur-md relative">

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
            >
              <div className="w-16 h-16 rounded-full border-2 border-[#ccff00] flex items-center justify-center mb-6">
                <span className="text-[#ccff00] text-2xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">TRANSMISSION SENT</h3>
              <p className="text-white/60 font-mono text-sm mb-8">Signal received. Expect a response within 24 cycles.</p>
              <button
                onClick={() => setStatus('idle')}
                className="text-[#ccff00] font-mono text-xs tracking-widest uppercase hover:text-white transition-colors"
              >
                [NEW TRANSMISSION]
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} noValidate>
              <VoidInput label="Identity Code / Name" name="name" placeholder="John Doe" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
              <VoidInput label="Signal Frequency / Email" name="email" type="email" placeholder="john@example.com" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
              <VoidInput label="Transmission Data / Message" name="message" type="textarea" placeholder="Tell us about your project..." required value={form.message} onChange={(v) => setForm({ ...form, message: v })} error={errors.message} />

              <MagneticButton className="w-full py-6 mt-8 bg-white/10 hover:bg-[#ccff00] hover:text-black border border-white/20 hover:border-transparent text-white font-bold tracking-[0.2em] uppercase transition-all duration-300">
                {status === 'sending' ? (
                  <span className="animate-pulse">Transmitting...</span>
                ) : (
                  'Transmit Data'
                )}
              </MagneticButton>

              {status === 'error' && (
                <p className="mt-4 text-[#ff3300] font-mono text-xs text-center" role="alert" aria-live="polite">
                  ERROR::TRANSMISSION_FAILED — Please retry.
                </p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
