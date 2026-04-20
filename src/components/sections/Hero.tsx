import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useIsTouch } from '../../lib/hooks';


/* ── Caustic Light Shader (single-pass, no FBOs) ── */
const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0,1);}`;
const FRAG = `precision mediump float;
uniform float uTime;uniform vec2 uResolution;uniform float uScroll;
vec3 caustic(vec2 uv,float t){float s=0.0;
for(int i=0;i<3;i++){float fi=float(i);
vec2 p=uv*(1.5+fi*0.8);
p+=vec2(sin(t*(0.4+fi*0.15)+fi*1.3),cos(t*(0.28+fi*0.1)+fi*0.9))*0.5;
s+=sin(p.x*3.14159+sin(p.y*2.7+t*(0.4+fi*0.15)))*0.5+0.5;}
s/=3.0;s=pow(s,2.5);
vec3 col=mix(vec3(0.0,1.0,1.0),mix(vec3(0.8,1.0,0.0),vec3(1.0,0.0,1.0),sin(t*0.4)*0.5+0.5),s);
return col*s;}
void main(){vec2 uv=gl_FragCoord.xy/uResolution;uv.y=1.0-uv.y;float t=uTime*0.5;
vec3 c=caustic(uv*2.0,t)*0.6+caustic(uv*3.0-0.5,t*1.3)*0.3;
c*=1.0-smoothstep(0.3,0.8,uScroll);
c+=mix(0.015,0.0,uv.y);
float v=1.0-smoothstep(0.4,1.0,length(uv-0.5)*1.4);
c*=0.7+v*0.3;
gl_FragColor=vec4(c,1.0);}`;

function CausticCanvas({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const glMaybe = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!glMaybe) return;
    const gl = glMaybe;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT); gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAG); gl.compileShader(fs);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      uTime: gl.getUniformLocation(prog, 'uTime'),
      uResolution: gl.getUniformLocation(prog, 'uResolution'),
      uScroll: gl.getUniformLocation(prog, 'uScroll'),
    };

    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    function draw() {
      if (scrollRef.current > 0.85) { rafRef.current = requestAnimationFrame(draw); return; }
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(u.uTime, t);
      gl.uniform2f(u.uResolution, canvas!.width, canvas!.height);
      gl.uniform1f(u.uScroll, scrollRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [scrollRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" aria-hidden="true" />;
}

/* ── Drips ── */
const DRIPS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: (i / 6) * 100 + Math.random() * 8 - 4,
  width: Math.random() * 3 + 1,
  height: Math.random() * 20 + 15,
  delay: Math.random() * 3,
  duration: Math.random() * 2 + 2,
}));

/* ── Bubbles ── */
const BUBBLES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: Math.random() * 6 + 2,
  opacity: Math.random() * 0.3 + 0.15,
  drift: (Math.random() - 0.5) * 60,
  duration: Math.random() * 8 + 8,
  delay: Math.random() * 10,
  glow: Math.random() > 0.7,
}));

/* ── Floating Debris ── */
const DEBRIS = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  width: Math.random() * 15 + 5,
  height: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.2 + 0.1,
  duration: Math.random() * 12 + 10,
  delay: Math.random() * 8,
}));

/* ── Hero ── */
export default function Hero() {
  const isTouch = useIsTouch();
  const outerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: outerRef, offset: ['start start', 'end start'] });
  // Scroll-driven transforms — simplified on touch
  const causticOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 0.6, 0]);
  const waterSurfaceY = useTransform(scrollYProgress, [0, 0.4, 0.8], ['-5%', '40%', '110%']);
  const textY = useTransform(scrollYProgress, isTouch ? [0, 0.6] : [0, 0.2, 0.6], isTouch ? ['0vh', '-40vh'] : ['0vh', '-20vh', '-70vh']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.55], [1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.05, 0.12], [1, 1, 0]);
  const dripsOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.75], [0, 1, 0]);

  // Track scroll value for canvas (desktop only)
  const scrollVal = useRef(0);
  useEffect(() => {
    if (isTouch) return;
    return scrollYProgress.on('change', (v: number) => { scrollVal.current = v; });
  }, [scrollYProgress, isTouch]);

  return (
    <div ref={outerRef} id="hero" className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#050505] selection:bg-[#ccff00] selection:text-black" style={{ willChange: 'transform' }}>


        {/* ── Deep Abyss Background ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#080818] to-[#050505] z-0" />

        {/* ── Caustic Light Canvas (desktop) / CSS gradient (mobile) ── */}
        <motion.div className="absolute inset-0 z-[1]" style={{ opacity: causticOpacity, willChange: 'opacity' }}>
          {isTouch ? (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff]/15 via-[#050510] to-[#ff00ff]/10" aria-hidden="true" />
          ) : (
            <CausticCanvas scrollRef={scrollVal} />
          )}
        </motion.div>


        {/* ── Water Surface: merged dark mask + wavy line ── */}
        <motion.div
          className="absolute left-0 right-0 z-[7] pointer-events-none"
          style={{ top: waterSurfaceY, willChange: 'top' }}
          aria-hidden="true"
        >
          {/* Solid dark fill extending upward — clipped by parent overflow:hidden */}
          <div
            className="absolute left-0 right-0 bg-[#050505]"
            style={{ bottom: 30, height: '200vh' }}
          />
          {/* Wavy SVG: top half filled dark (seamless join), bottom half = wavy edge + stroke */}
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="relative w-full h-[60px] -mb-[1px]">
            <path
              d="M0,0 L1440,0 L1440,30 C1320,50 1200,10 1080,30 C960,50 840,10 720,30 C600,50 480,10 360,30 C240,50 120,10 0,30 Z"
              fill="#050505"
            />
            <path
              d="M0,30 C120,10 240,50 360,30 C480,10 600,50 720,30 C840,10 960,50 1080,30 C1200,10 1320,50 1440,30"
              fill="none"
              stroke="rgba(0,255,255,0.25)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Drips hanging from surface */}
          <motion.div className="relative" style={{ opacity: dripsOpacity }}>
            {DRIPS.map((drip) => (
              <div
                key={drip.id}
                className="absolute rounded-full bg-gradient-to-b from-[#00ffff]/40 to-transparent"
                style={{
                  left: `${drip.left}%`,
                  top: 0,
                  width: drip.width,
                  height: drip.height,
                  animation: `drip-fall ${drip.duration}s ease-in infinite ${drip.delay}s`,
                  transformOrigin: 'top center',
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* ── Bubbles (desktop only) ── */}
        {!isTouch && (
          <motion.div className="absolute inset-0 z-[3] pointer-events-none" style={{ opacity: causticOpacity }} aria-hidden="true">
            {BUBBLES.map((b) => (
              <div
                key={b.id}
                className={`absolute rounded-full ${b.glow ? 'bg-[#00ffff]/30 shadow-[0_0_6px_rgba(0,255,255,0.3)]' : 'bg-white/20'} border border-white/10`}
                style={{
                  left: `${b.left}%`,
                  bottom: '-5%',
                  width: b.size,
                  height: b.size,
                  '--bubble-scale': 1,
                  '--bubble-opacity': b.opacity,
                  '--bubble-drift': b.drift,
                  animation: `bubble-rise ${b.duration}s ease-in-out infinite ${b.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </motion.div>
        )}

        {/* ── Floating Debris (desktop only) ── */}
        {!isTouch && (
          <motion.div className="absolute inset-0 z-[3] pointer-events-none" style={{ opacity: causticOpacity }} aria-hidden="true">
            {DEBRIS.map((d) => (
              <div
                key={d.id}
                className="absolute bg-white/10 rounded-full"
                style={{
                  left: `${d.left}%`,
                  top: `${d.top}%`,
                  width: d.width,
                  height: d.height,
                  '--debris-opacity': d.opacity,
                  animation: `debris-drift ${d.duration}s ease-in-out infinite ${d.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </motion.div>
        )}

        {/* ── Fog / Depth-of-Field Layer ── */}
        <motion.div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{ opacity: causticOpacity }}
          aria-hidden="true"
        >
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(5,5,10,0.4) 70%, rgba(5,5,10,0.8) 100%)',
          }} />
        </motion.div>

        {/* ── Submerged Text ── */}
        <motion.div
          className="absolute inset-0 z-[4] flex flex-col items-center justify-center pointer-events-none"
          style={{
            opacity: textOpacity,
            y: textY,
            willChange: 'transform, opacity',
          }}
        >
          <h1 className="sr-only">Liquid Neon Chaos</h1>
          {['LIQUID', 'NEON', 'CHAOS'].map((word, i) => (
            <div
              key={word}
              className={`text-[18vw] md:text-[14vw] font-black leading-[0.85] tracking-tighter select-none pointer-events-auto ${
                i === 0
                  ? 'text-transparent [-webkit-text-stroke:2px_rgba(0,255,255,0.7)]'
                  : i === 1
                  ? 'text-transparent [-webkit-text-stroke:2px_rgba(204,255,0,0.7)]'
                  : 'text-transparent [-webkit-text-stroke:2px_rgba(255,0,255,0.7)]'
              }`}
              aria-hidden="true"
              style={{
                textShadow: i === 0
                  ? '0 0 40px rgba(0,255,255,0.3), 0 0 80px rgba(0,255,255,0.1)'
                  : i === 1
                  ? '0 0 40px rgba(204,255,0,0.3), 0 0 80px rgba(204,255,0,0.1)'
                  : '0 0 40px rgba(255,0,255,0.3), 0 0 80px rgba(255,0,255,0.1)',
              }}
            >
              {word}
            </div>
          ))}
        </motion.div>

        {/* ── Scroll Indicator ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-[8] flex flex-col items-center pb-12"
          style={{ opacity: ctaOpacity }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40">
              Scroll to surface
            </span>
            <svg
              width="16" height="24" viewBox="0 0 16 24" fill="none"
              className="text-white/30"
              style={{ animation: 'pulse-down 2s ease-in-out infinite' }}
            >
              <path d="M8 0v20M1 14l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
