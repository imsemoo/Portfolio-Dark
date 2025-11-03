// Media utilities: reduced motion, resize debounce, pixel ratio clamp, WebGL detect, visibility

/** Check if the user prefers reduced motion. */
export function isReducedMotion() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

/** Listen for prefers-reduced-motion changes. */
export function onReducedMotionChange(cb) {
  try {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => cb(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else if (mql.addListener) mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else if (mql.removeListener) mql.removeListener(handler);
    };
  } catch (_) {
    return () => {};
  }
}

/** Clamp device pixel ratio to a sane upper bound. */
export function clampPixelRatio(max = 2) {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.min(Math.max(1, dpr), max);
}

/** Simple debounce helper. */
export function debounce(fn, delay = 150) {
  let t = 0;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** WebGL support detection (webgl2 preferred, fallback to webgl). */
export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2', { powerPreference: 'low-power' });
    if (gl2) return true;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (_) {
    return false;
  }
}

/** Handle page visibility to pause/resume work. */
export function onVisibilityChange(onHide, onShow) {
  const handler = () => (document.hidden ? onHide?.() : onShow?.());
  document.addEventListener('visibilitychange', handler, { passive: true });
  return () => document.removeEventListener('visibilitychange', handler);
}

