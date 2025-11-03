// Boot orchestration for motion. Keeps page safe and degrades gracefully.
import { isReducedMotion, onReducedMotionChange, hasWebGL, debounce, onVisibilityChange } from './utils/media.js';
import { createHeroScene } from './three/hero.scene.js';
import { createSkillsScene } from './three/skills.scene.js';
import { initNav } from './anim/nav.anim.js';
import { initSections } from './anim/sections.anim.js';
import { initCards } from './anim/cards.anim.js';
import { initContact } from './anim/contact.anim.js';
import { initLinksTree } from './anim/linksTree.anim.js';

const libs = (window.__LIBS__ || {});
const { gsap, ScrollTrigger } = libs;

// Central config object to tweak speeds/densities.
export const MOTION_CONFIG = {
  enabled: true,
  hero: {
    amplitude: 0.04,
    particles: 180,
    color1: '#1b1b1b',
    color2: '#0b0b0b',
    dotColor: '#C778DD'
  },
  skills: {
    count: 320,
    speed: 0.05,
    color: '#666A73'
  }
};

function main() {
  const reduced = isReducedMotion();
  const webgl = hasWebGL();
  if (reduced || !webgl) MOTION_CONFIG.enabled = false;

  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // 1) Nav/UI micro-interactions
  initNav({ gsap });
  // Links-tree premium interactions
  initLinksTree({ gsap, reduced });

  const scenes = [];

  // 2) Hero scene (with fallback)
  const heroHost = document.querySelector('.hero__canvas');
  if (heroHost) {
    if (MOTION_CONFIG.enabled) {
      const hero = createHeroScene(heroHost, libs, MOTION_CONFIG);
      scenes.push(hero);
    } else {
      // Fallback: static gradient image if available
      heroHost.style.background = 'radial-gradient(80% 80% at 50% 0%, rgba(199,120,221,0.18), rgba(0,0,0,0))';
    }
  }

  // 3) Sections scroll anims
  initSections({ gsap, ScrollTrigger });

  // 4) Skills background (with fallback)
  const skillsHost = document.querySelector('.skills__bg');
  if (skillsHost) {
    if (MOTION_CONFIG.enabled) {
      const skills = createSkillsScene(skillsHost, libs, MOTION_CONFIG);
      scenes.push(skills);
    } else {
      skillsHost.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))';
    }
  }

  // 5) Cards hover + open transition
  initCards({ gsap });
  // Contact micro-interactions
  initContact({ gsap });

  // 6) Ticker: unify rendering via GSAP
  if (gsap) {
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      for (const s of scenes) s.update?.(dt);
    };
    gsap.ticker.add(tick);

    // Pause rendering in background tabs
    const stop = () => gsap.ticker.sleep();
    const start = () => gsap.ticker.wake();
    onVisibilityChange(stop, start);
  }

  // Resize handling (debounced)
  const onResize = debounce(() => scenes.forEach((s) => s.resize?.()), 120);
  window.addEventListener('resize', onResize, { passive: true });

  // React to reduced motion preference changes at runtime
  onReducedMotionChange((prefersReduce) => {
    if (prefersReduce) window.location.reload();
  });

  // Expose config for quick tuning in console
  window.__MOTION_CONFIG__ = MOTION_CONFIG;
}

try {
  main();
} catch (e) {
  // Never break the page because of motion failures
  console.error('[motion] init error', e);
}
