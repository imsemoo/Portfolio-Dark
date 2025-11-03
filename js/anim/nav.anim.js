// Navigation micro-interactions and active state sync

export function initNav({ gsap }) {
  const nav = document.querySelector('nav.navbar');
  if (!nav) return;

  // Toggle aria-expanded on the bootstrap toggler for accessibility
  const toggler = nav.querySelector('.navbar-toggler');
  const collapse = document.getElementById('navbarNav');
  if (toggler && collapse) {
    const syncAria = () => toggler.setAttribute('aria-expanded', collapse.classList.contains('show') ? 'true' : 'false');
    collapse.addEventListener('shown.bs.collapse', syncAria);
    collapse.addEventListener('hidden.bs.collapse', syncAria);
    syncAria();
  }

  // Smooth hover emphasis on links (non-intrusive)
  const links = nav.querySelectorAll('.navbar-nav .nav-link');
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => gsap.to(a, { duration: 0.2, color: '#FFF', backgroundColor: 'var(--primary)', borderRadius: 4, paddingInline: 12 }));
    a.addEventListener('mouseleave', () => gsap.to(a, { duration: 0.25, clearProps: 'backgroundColor,borderRadius,paddingInline,color' }));
  });

  // Active state by section in view
  const sections = Array.from(document.querySelectorAll('section[id], header[id]'));
  function updateActive() {
    const scrollY = window.scrollY + window.innerHeight * 0.3;
    let currentId = sections[0]?.id;
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if (scrollY >= top) currentId = s.id;
    });
    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const match = href.startsWith('#') && href.slice(1) === currentId;
      a.classList.toggle('active', !!match);
    });
  }
  updateActive();
  window.addEventListener('scroll', () => updateActive(), { passive: true });

  // Hide-on-scroll-down, show-on-scroll-up for header
  let lastY = window.scrollY;
  let hidden = false;
  function onScroll() {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;
    if (Math.abs(delta) < 6) return;
    if (y > 30 && delta > 0 && !hidden) {
      hidden = true;
      gsap.to(nav, { y: -80, duration: 0.22, ease: 'power1.out' });
    } else if (delta < 0 && hidden) {
      hidden = false;
      gsap.to(nav, { y: 0, duration: 0.22, ease: 'power1.out' });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}
