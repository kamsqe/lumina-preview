import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsTouch } from '../../lib/hooks';

const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

class SynthEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  droneOsc: OscillatorNode | null = null;
  droneGain: GainNode | null = null;
  noiseNode: AudioBufferSourceNode | null = null;
  noiseFilter: BiquadFilterNode | null = null;
  noiseGain: GainNode | null = null;
  running = false;

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.15;
    this.masterGain.connect(this.ctx.destination);
  }

  startDrone() {
    if (!this.ctx || !this.masterGain || this.running) return;
    this.running = true;

    // Sub drone
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneGain.connect(this.masterGain);

    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.value = 55;
    this.droneOsc.connect(this.droneGain);
    this.droneOsc.start();

    // Fade in over 3s
    this.droneGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 3);

    // Filtered noise bed
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'lowpass';
    this.noiseFilter.frequency.value = 200;
    this.noiseFilter.Q.value = 1;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.08;

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    this.noiseNode.start();
  }

  stopDrone() {
    if (!this.ctx) return;
    this.running = false;
    const t = this.ctx.currentTime;
    this.droneGain?.gain.linearRampToValueAtTime(0, t + 0.5);
    this.noiseGain?.gain.linearRampToValueAtTime(0, t + 0.5);
    setTimeout(() => {
      try {
        this.droneOsc?.stop();
        this.noiseNode?.stop();
      } catch {}
      this.droneOsc = null;
      this.noiseNode = null;
    }, 600);
  }

  playHoverTone(index: number) {
    if (!this.ctx || !this.masterGain || !this.running) return;
    const freq = PENTATONIC[index % PENTATONIC.length];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playClick() {
    if (!this.ctx || !this.masterGain || !this.running) return;
    // Metallic ping — two detuned oscillators with quick decay
    const t = this.ctx.currentTime;
    const g1 = this.ctx.createGain();
    g1.gain.setValueAtTime(0.1, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    g1.connect(this.masterGain);

    const o1 = this.ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(1200, t);
    o1.frequency.exponentialRampToValueAtTime(600, t + 0.12);
    o1.connect(g1);
    o1.start(t);
    o1.stop(t + 0.15);

    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    g2.connect(this.masterGain);

    const o2 = this.ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(2400, t);
    o2.frequency.exponentialRampToValueAtTime(800, t + 0.18);
    o2.connect(g2);
    o2.start(t);
    o2.stop(t + 0.2);
  }

  setScrollVelocity(velocity: number) {
    if (!this.noiseFilter || !this.ctx || !this.running) return;
    const cutoff = 200 + Math.min(Math.abs(velocity), 3000) * 2;
    this.noiseFilter.frequency.linearRampToValueAtTime(cutoff, this.ctx.currentTime + 0.05);
  }

  destroy() {
    this.stopDrone();
    setTimeout(() => {
      this.ctx?.close();
      this.ctx = null;
    }, 700);
  }
}

export default function SoundEngine() {
  const isTouch = useIsTouch();
  const [enabled, setEnabled] = useState(false);
  const engineRef = useRef<SynthEngine | null>(null);

  const toggle = useCallback(() => {
    if (!engineRef.current) engineRef.current = new SynthEngine();
    const engine = engineRef.current;

    if (!enabled) {
      engine.init();
      engine.startDrone();
      setEnabled(true);
      document.documentElement.dataset.sound = 'on';
    } else {
      engine.stopDrone();
      setEnabled(false);
      delete document.documentElement.dataset.sound;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const engine = engineRef.current;
    if (!engine) return;

    let hoverIndex = 0;
    const bound = new WeakSet<Element>();

    function bindHoverSounds() {
      document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        if (bound.has(el)) return;
        bound.add(el);
        const idx = hoverIndex++;
        el.addEventListener('mouseenter', () => engine?.playHoverTone(idx));
      });
    }

    const handleClick = () => engine?.playClick();
    window.addEventListener('click', handleClick);


    const observer = new MutationObserver(bindHoverSounds);
    observer.observe(document.body, { childList: true, subtree: true });
    bindHoverSounds();

    return () => {
      window.removeEventListener('click', handleClick);
      observer.disconnect();
    };
  }, [enabled]);

  useEffect(() => {
    return () => engineRef.current?.destroy();
  }, []);

  if (isTouch) return null;

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? 'Disable sound' : 'Enable sound'}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full border border-white/20 bg-black/60 backdrop-blur-sm flex items-center justify-center hover:border-[#ccff00] transition-colors group"
    >
      <AnimatePresence mode="wait">
        {enabled ? (
          <motion.svg
            key="on"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            className="text-[#ccff00]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </motion.svg>
        ) : (
          <motion.svg
            key="off"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            className="text-white/50 group-hover:text-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
