// Links Tree: premium micro-interactions (rope sway + magnetic icons)
// No layout shifts; transforms only; respects reduced motion.

export function initLinksTree({ gsap, reduced }) {
  const root = document.querySelector('.links-tree');
  if (!root || !gsap) return;
  if (reduced) return; // respect reduced motion

  const list = root.querySelector('ul');
  const items = Array.from(root.querySelectorAll('li'));
  const lineImg = root.querySelector('li img');

  // Prep transform origins for a rope-like feel
  if (list) list.style.transformOrigin = 'top center';
  if (lineImg) lineImg.style.transformOrigin = 'top center';
  items.forEach((li) => (li.style.willChange = 'transform'));

  // Idle gentle sway (very subtle, premium feel)
  gsap.to(list, { rotationZ: 1.2, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // Scroll-based nudge (simulate a tug on the rope)
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY; const d = y - lastY; lastY = y;
    if (Math.abs(d) < 2) return;
    const rot = Math.max(-3, Math.min(3, d * 0.12));
    const shift = Math.max(-10, Math.min(10, d * 0.2));
    gsap.to(list, { rotationZ: `+=${rot}`, x: `+=${-shift}`, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
    if (lineImg) gsap.to(lineImg, { rotationZ: `+=${rot*0.7}`, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
    // settle back
    gsap.to([list, lineImg], { rotationZ: 0, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.05 });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Magnetic hover: icons are gently attracted to pointer within radius
  function onPointerMove(e) {
    const rList = list.getBoundingClientRect();
    const cx = e.clientX; const cy = e.clientY;
    items.forEach((li, idx) => {
      const r = li.getBoundingClientRect();
      const ix = r.left + r.width / 2; const iy = r.top + r.height / 2;
      const dx = cx - ix; const dy = cy - iy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const radius = 140;
      if (dist < radius) {
        const t = 1 - dist / radius; // 0..1
        const strength = 10 + idx * 1.5; // deeper for lower icons
        const ox = (dx / radius) * strength * t;
        const oy = (dy / radius) * strength * t;
        const rot = (dx / radius) * 3 * t;
        gsap.to(li, { x: ox, y: oy, rotate: rot, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      } else {
        gsap.to(li, { x: 0, y: 0, rotate: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      }
    });
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Cleanup (not used now but ready for future routing)
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pointermove', onPointerMove);
  };
}

