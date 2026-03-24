import React from 'react';

export default function GlitchText({ text }: { text: string }) {
  return (
    <span className="relative group inline-block">
      <span className="relative z-10">{text}</span>
      <span aria-hidden="true" className="absolute top-0 left-0 -z-10 w-full h-full text-[#ff00ff] opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] group-hover:translate-y-[-2px] transition-all duration-100 select-none">
        {text}
      </span>
      <span aria-hidden="true" className="absolute top-0 left-0 -z-10 w-full h-full text-[#00ffff] opacity-0 group-hover:opacity-70 group-hover:translate-x-[-2px] group-hover:translate-y-[2px] transition-all duration-100 select-none">
        {text}
      </span>
    </span>
  );
}
