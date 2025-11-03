// Tiny word splitter that wraps words in spans for staggered animations.
// Keeps content short and accessible; consumers should set role/aria if needed.

export function splitWords(el) {
  if (!el || !el.textContent) return [];
  const original = el.textContent.trim();
  const words = original.split(/\s+/);
  el.setAttribute('aria-label', original);
  el.innerHTML = words
    .map((w) => `<span class="split-word" style="display:inline-block; will-change:transform,opacity;">${w}</span>`) 
    .join(' ');
  return Array.from(el.querySelectorAll('.split-word'));
}

