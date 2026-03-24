# Lumina — Project Context for AI Assistants

## Overview

Lumina is a high-intensity Astro template with WebGL fluid backgrounds, neon aesthetics, and interactive animations. It's a single-page landing page template targeting creative agencies and tech products.

## Tech Stack

- **Framework**: Astro 6 (static site generation with islands architecture)
- **UI**: React 19 (interactive islands)
- **Styling**: Tailwind CSS v4 via Vite plugin (no config file — uses CSS-first approach)
- **Animations**: Framer Motion 12
- **3D**: Three.js + React Three Fiber (WebGL background shader)
- **Scroll**: Lenis (smooth scroll engine)
- **Font**: Space Grotesk Variable (via @fontsource)
- **Language**: TypeScript (strict mode)

## Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run check    # Astro TypeScript check
```

## Architecture

### Astro Islands

Each section is a React component rendered as an Astro island with specific hydration directives:
- `client:load` — Navbar, Preloader, SmoothScroll, ScrollProgress, Cursor (above-fold / always needed)
- `client:visible` — All content sections (hydrate when scrolled into view)
- `client:idle` — Footer (hydrate during idle time)
- `client:only="react"` — Hero (client-side only, needs WebGL detection)

### File Structure

```
src/
├── components/
│   ├── sections/    # 11 page sections (Hero, About, Features, Portfolio, Pricing, Testimonials, FAQ, CTA, Contact, Navbar, Footer)
│   └── ui/          # Reusable primitives (Cursor, GlitchText, MagneticButton, Section, SectionHeading, SectionDivider, WebGLBackground, LiquidFilters, Preloader, SmoothScroll, ScrollProgress)
├── layouts/
│   └── Layout.astro # HTML shell with meta tags, fonts, structured data
├── lib/
│   ├── data.ts      # ALL content data — nav links, features, projects, pricing, testimonials, FAQs, social links, about content
│   └── hooks.ts     # useIsTouch(), useScrolled() custom hooks
├── pages/
│   ├── index.astro  # Main page — imports and composes all sections with SectionDividers
│   └── 404.astro    # Custom 404 page
└── styles/
    └── global.css   # Design tokens (CSS vars), base styles, animations, cursor, a11y
```

### Key Patterns

1. **Section wrapper**: All content sections use `<Section>` component which provides consistent `py-20 md:py-32` padding, `container mx-auto px-6`, `overflow-hidden`, and `relative z-10`.

2. **Section headings**: Use `<SectionHeading text="WORD" accent="ACCENT" gradient="from-[#color] to-[#color]" />` for consistent gradient-accented headings.

3. **Data-driven content**: Components import arrays from `src/lib/data.ts` and `.map()` over them. To change content, edit data.ts — never hardcode text in components.

4. **Touch detection**: Components use `useIsTouch()` hook or `window.matchMedia('(pointer: coarse)')` to disable heavy effects (WebGL, cursor, magnetic buttons) on touch devices.

5. **Reduced motion**: CSS `@media (prefers-reduced-motion: reduce)` in global.css kills all animations. Preloader and SmoothScroll also check this media query in JS.

6. **WebGL with fallback**: Hero detects WebGL support → renders Three.js shader plane if available, CSS blob background if not. Touch devices skip both.

## Design System

### CSS Variables (src/styles/global.css)

```css
--lumina-bg: #050505       /* Background */
--lumina-magenta: #ff00ff  /* Primary accent */
--lumina-cyan: #00ffff     /* Secondary accent */
--lumina-lime: #ccff00     /* Tertiary accent / CTA color */
--lumina-orange: #ff3300   /* Error / warning */
```

### Color Usage Convention
- **Lime (#ccff00)**: CTAs, active states, primary interactions
- **Magenta (#ff00ff)**: Decorative accents, glitch effects, gradient endpoints
- **Cyan (#00ffff)**: Secondary accents, info highlights, gradient endpoints
- **Orange (#ff3300)**: Errors only

### Typography
- Font: Space Grotesk Variable
- Hero: `text-[16vw] md:text-[12vw]` with character-split animation
- Section headings: `text-5xl md:text-8xl` via SectionHeading component
- Body: Default Tailwind sizes, `text-white/60` for secondary text
- Mono: `font-mono` for labels, status text, technical UI elements

## Important Notes

- The contact form simulates submission — see Contact.tsx `handleSubmit` to connect a real backend
- Demo images load from Unsplash URLs in data.ts — replace with local images for production
- Social links in data.ts use `href: '#'` as placeholders
- The site URL in astro.config.mjs is a placeholder — update for deployment
- `LiquidFilters` component renders hidden SVG filters used by the melt text effect — it must be in the DOM for the filters to work
