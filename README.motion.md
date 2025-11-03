Portfolio-Dark — Motion Additions

What’s Included
- Three.js hero gradient + particles (lightweight, transparent overlay)
- Skills background particles (subtle rotation and hover dim)
- GSAP micro-interactions for navbar, sections, and project cards (3D hover + modal)

How It Loads
- ESM from CDNs is loaded once at the end of `index.html` and injected as `window.__LIBS__`.
- Boot file: `js/app.entry.js` orchestrates everything safely.

Reduced Motion
- Respects `prefers-reduced-motion: reduce`. All motion layers are hidden and static fallbacks are used.
- To test: in your OS/browser accessibility settings, enable reduced motion and reload.

Tuning Animations
- Edit `window.__MOTION_CONFIG__` in the console or adjust the object in `js/app.entry.js`.
  - `hero`: `amplitude`, `particles`, `color1`, `color2`, `dotColor`
  - `skills`: `count`, `speed`, `color`

Files Added
- `js/app.entry.js` (boot & safety)
- `js/utils/media.js` (reduced-motion, debounce, WebGL detect)
- `js/utils/splitText.js` (headline word splitter)
- `js/three/hero.scene.js` (hero WebGL)
- `js/three/skills.scene.js` (skills background WebGL)
- `js/anim/nav.anim.js` (navbar micro-interactions)
- `js/anim/sections.anim.js` (scroll-triggered section reveals)
- `js/anim/cards.anim.js` (cards hover + modal)

Notes
- No layout, URLs, or SEO tags changed.
- Rendering pauses in background tabs and on reduced motion.
- No bundlers; all modules load via CDN.

