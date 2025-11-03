// Section scroll animations powered by GSAP + ScrollTrigger
import { splitWords } from '../utils/splitText.js';

export function initSections({ gsap, ScrollTrigger }) {
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // About section headline split + stagger
  const aboutTitle = document.querySelector('.about-me-title');
  if (aboutTitle) {
    const words = splitWords(aboutTitle);
    gsap.from(words, {
      opacity: 0,
      y: 18,
      stagger: 0.06,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: aboutTitle,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Generic section fades
  const sections = [
    '.projects .grid-container',
    '.skills .grid-skills',
    '.resume .grid-col2',
    '.contacts .box-form'
  ];
  sections.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Cards stagger-in on projects grid
  const cards = document.querySelectorAll('.projects .grid-container .card');
  if (cards.length) {
    gsap.from(cards, {
      opacity: 0,
      y: 18,
      duration: 0.55,
      stagger: { each: 0.08, from: 'start' },
      ease: 'power2.out',
      scrollTrigger: {
        trigger: document.querySelector('.projects .grid-container'),
        start: 'top 80%'
      }
    });
  }
}
