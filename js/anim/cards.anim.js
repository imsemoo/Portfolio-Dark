// Project cards: subtle 3D hover and FLIP-like open animation to modal

export function initCards({ gsap }) {
  const cards = document.querySelectorAll('.grid-container .card');
  if (!cards.length) return;

  // Hover tilt
  cards.forEach((card) => {
    const inner = card;
    let hovering = false;
    function onMove(e) {
      if (!hovering) return;
      const r = inner.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(inner, { duration: 0.25, rotateY: px * 8, rotateX: -py * 8, transformPerspective: 800, transformOrigin: 'center' });
    }
    inner.addEventListener('mouseenter', () => { hovering = true; gsap.to(inner, { duration: 0.3, translateZ: 8, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }); });
    inner.addEventListener('mousemove', onMove);
    inner.addEventListener('mouseleave', () => { hovering = false; gsap.to(inner, { duration: 0.35, rotateX: 0, rotateY: 0, translateZ: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' }); });

    // Open FLIP-like modal on click
    inner.addEventListener('click', (evt) => {
      // Only open when clicking within card not buttons/links
      if ((evt.target.closest('a') || evt.target.tagName === 'A')) return;
      openCardModal(inner, gsap);
    });
  });
}

function openCardModal(card, gsap) {
  const body = document.body;
  const rect = card.getBoundingClientRect();

  const overlay = document.createElement('div');
  overlay.className = 'cards-modal-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.6)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  const clone = card.cloneNode(true);
  clone.style.margin = '0';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.willChange = 'transform, width, height';
  clone.style.transformOrigin = 'top left';

  overlay.appendChild(clone);
  body.appendChild(overlay);
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  body.dataset.prevOverflow = body.style.overflow || '';
  body.style.overflow = 'hidden';

  const startX = rect.left;
  const startY = rect.top;
  const toW = Math.min(window.innerWidth - 40, rect.width * 1.15);
  const toH = Math.min(window.innerHeight - 60, rect.height * 1.15);
  const toX = (window.innerWidth - toW) / 2;
  const toY = (window.innerHeight - toH) / 2;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.4 } });
  tl.set(clone, { position: 'fixed', left: 0, top: 0, x: startX, y: startY })
    .to(clone, { x: toX, y: toY, width: toW, height: toH, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }, 0)
    .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0);

  // Focus trap inside modal
  const focusable = clone.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0] || clone;
  const last = focusable[focusable.length - 1] || clone;
  let prevFocus = document.activeElement;
  setTimeout(() => first.focus(), 0);

  function onTrap(e) {
    if (e.key !== 'Tab') return;
    if (focusable.length === 0) { e.preventDefault(); return; }
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  overlay.addEventListener('keydown', onTrap);

  function close() {
    document.removeEventListener('keydown', onKey);
    const back = gsap.timeline({ defaults: { ease: 'power3.inOut', duration: 0.35 }, onComplete: cleanup });
    back.to(clone, { x: startX, y: startY, width: rect.width, height: rect.height })
        .to(overlay, { opacity: 0, duration: 0.25 }, 0);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  function cleanup() {
    overlay.removeEventListener('keydown', onTrap);
    body.style.overflow = body.dataset.prevOverflow || '';
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
  }
}
