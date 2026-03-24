import React from 'react';
import { SOCIAL_LINKS } from '../../lib/data';

const SocialIcon = ({ label }: { label: string }) => {
  const cls = "w-5 h-5 fill-current";
  switch (label) {
    case 'Twitter':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case 'GitHub':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
    case 'LinkedIn':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case 'Instagram':
      return <svg className={cls} viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z"/></svg>;
    default:
      return <span>{label[0]}</span>;
  }
};

const SocialLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    aria-label={label}
    className="group relative flex items-center justify-center w-12 h-12 border border-white/10 hover:border-[#ccff00] transition-all duration-300 hover:shadow-[0_0_20px_rgba(204,255,0,0.3),0_0_40px_rgba(204,255,0,0.1)]"
    data-cursor-accent="#ccff00"
  >
    <span className="relative z-10 text-white group-hover:text-[#ccff00] transition-colors" aria-hidden="true"><SocialIcon label={label} /></span>
    <div className="absolute inset-0 bg-[#ccff00] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-[#ccff00] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
      {label}
    </span>
  </a>
);

export default function Footer() {
  return (
    <footer className="relative bg-black pt-20 md:pt-32 pb-12 border-t border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">
              LUMINA <span className="text-[#ff00ff]">///</span>
            </h2>
            <p className="text-white/50 font-mono text-sm max-w-md">
              Advanced digital experiences for the next generation of the web. Terminate the mundane. Initiate the void.
            </p>
          </div>

          <div className="flex gap-4">
            {SOCIAL_LINKS.map((link) => (
              <SocialLink key={link.label} {...link} />
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs font-mono text-white/50 uppercase tracking-wider sm:tracking-widest text-center md:text-left">
          <div className="flex flex-wrap gap-4 sm:gap-8 mb-4 md:mb-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">System Status</a>
          </div>
          <div className="group cursor-default">
            &copy; 2026 LUMINA SYSTEMS. ALL RIGHTS RESERVED.
            <span className="inline-block w-2 h-2 ml-2 bg-[#00ffff] rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]/50 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase">System_Online — Latency 0.02ms</span>
        </div>
      </div>
    </footer>
  );
}
