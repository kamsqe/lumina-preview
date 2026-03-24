import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);
  const [removed, setRemoved] = useState(false);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    // Fade out smoothly
    setTimeout(() => setHiding(true), 200);
    setTimeout(() => setRemoved(true), 1000);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setRemoved(true); return; }

    // ── Track real assets ──
    let fontsReady = false;
    let docReady = document.readyState === 'complete';
    let imagesLoaded = 0;
    let imagesTotal = 0;

    function calcProgress() {
      if (finishedRef.current) return;
      const fontPct = fontsReady ? 100 : 0;
      const docPct = docReady ? 100 : 0;
      const imgPct = imagesTotal > 0 ? (imagesLoaded / imagesTotal) * 100 : 100;
      // Weighted: fonts 20%, document 20%, images 60%
      const total = Math.round(fontPct * 0.2 + docPct * 0.2 + imgPct * 0.6);
      setProgress(total);
      if (fontsReady && docReady && (imagesTotal === 0 || imagesLoaded >= imagesTotal)) {
        finish();
      }
    }

    // Font tracking
    document.fonts.ready.then(() => {
      fontsReady = true;
      calcProgress();
    });

    // Document ready tracking
    if (!docReady) {
      const onLoad = () => { docReady = true; calcProgress(); };
      window.addEventListener('load', onLoad);
      var cleanupLoad = () => window.removeEventListener('load', onLoad);
    }

    // Image tracking — poll for images since they render progressively via client:visible
    const imgPollInterval = setInterval(() => {
      const imgs = document.querySelectorAll('img');
      imagesTotal = imgs.length || 0;
      imagesLoaded = 0;
      imgs.forEach((img) => {
        if (img.complete && img.naturalWidth > 0) imagesLoaded++;
      });
      calcProgress();
    }, 200);

    // Safety fallback — force complete after 8s
    const safety = setTimeout(() => {
      clearInterval(imgPollInterval);
      finish();
    }, 8000);

    return () => {
      clearInterval(imgPollInterval);
      clearTimeout(safety);
      cleanupLoad?.();
    };
  }, [finish]);

  if (removed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Lumina"
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
      style={{
        opacity: hiding ? 0 : 1,
        transition: hiding ? 'opacity 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
      }}
    >
      {/* Pulsing logo */}
      <div className="relative mb-12 animate-breathe">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ccff00] to-[#00ffff]" />
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#ccff00] to-[#00ffff] blur-xl opacity-50" />
      </div>

      {/* Brand name */}
      <div className="text-2xl font-black tracking-[0.3em] text-white mb-16">
        LUMINA
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ccff00] to-[#00ffff] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-4 font-mono text-xs text-white/40 tracking-widest">
        {progress}%
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/20" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/20" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/20" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/20" />
    </div>
  );
}
