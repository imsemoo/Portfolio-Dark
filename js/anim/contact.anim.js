// Contact form micro-interactions: floating labels, fake submit with progress and success

export function initContact({ gsap }) {
  const form = document.querySelector('.contacts .box-form form');
  if (!form) return;

  // Floating labels: already using .form-floating; ensure labels stay lifted when field has value
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((el) => {
    const wrapper = el.closest('.form-floating');
    function sync() {
      if (!wrapper) return;
      wrapper.classList.toggle('has-value', !!el.value.trim());
    }
    el.addEventListener('input', sync);
    el.addEventListener('blur', sync);
    sync();
  });

  // Status live region for a11y
  let live = form.querySelector('[aria-live]');
  if (!live) {
    live = document.createElement('div');
    live.setAttribute('aria-live', 'polite');
    live.style.position = 'absolute';
    live.style.clip = 'rect(0 0 0 0)';
    live.style.clipPath = 'inset(50%)';
    live.style.width = '1px';
    live.style.height = '1px';
    form.appendChild(live);
  }

  form.addEventListener('submit', (e) => {
    const act = (form.getAttribute('action') || '').trim();
    const isMailto = act.startsWith('mailto:');
    if (isMailto) {
      // Let the browser handle mailto submit (opens default mail client)
      return;
    }
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    const prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    live.textContent = 'Sending your message';
    // Simulate 1.2s progress
    setTimeout(() => {
      btn.textContent = 'Sent ✓';
      live.textContent = 'Message sent successfully';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = prev;
        form.reset();
        // Keep labels lifted logic consistent
        inputs.forEach((i) => i.dispatchEvent(new Event('blur')));
      }, 700);
    }, 1200);
  });
}
