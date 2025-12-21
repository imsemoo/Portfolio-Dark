/* ==========================================================================
   Portfolio Core Scripts
   - Clean navbar behaviors (scroll/active/smooth)
   - Projects filter (accessible, fast)
   - Menu icon toggle with Bootstrap events
   - Section reveals with IntersectionObserver
   - Reduced-motion friendly
   Author: Eslam Nasser
   ========================================================================== */

(() => {
  "use strict";

  /* ----------------------------------------
   * Feature flags (safe toggles)
   * -------------------------------------- */
  const FLAGS = {
    enableStickyHeader: false,   // set true if you want .navbar to get .is-fixed after threshold
    debugDemoHover: false        // the old sequential hover demo (kept for debug only)
  };

  /* ----------------------------------------
   * Reduced motion detection
   * -------------------------------------- */
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  /* ----------------------------------------
   * Helpers
   * -------------------------------------- */

  // Throttle using rAF (smooth + minimal CPU)
  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  // Safe element query
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Smooth scroll with reduced-motion fallback
  function smoothScrollTo(targetY, duration = 600) {
    if (prefersReduced) {
      window.scrollTo(0, targetY);
      return;
    }
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();
    const ease = (t) => t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      window.scrollTo(0, startY + distance * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Get Y of an element safely (0 if missing)
  function getTop(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  }

  /* ----------------------------------------
   * Navbar: sticky + active + smooth anchors
   * -------------------------------------- */
  function initNavbar() {
    const navbar = $(".navbar");
    if (!navbar) return;

    const STICKY_THRESHOLD = 80;

    // Sticky toggle (optional)
    const onScroll = rafThrottle(() => {
      if (!FLAGS.enableStickyHeader) return;
      const y = window.pageYOffset || document.documentElement.scrollTop;
      navbar.classList.toggle("is-fixed", y > STICKY_THRESHOLD);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial state

    // Smooth anchor navigation (only same-page hashes)
    $$(".navbar-nav a").forEach((link) => {
      link.addEventListener("click", (ev) => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return; // let normal links work
        ev.preventDefault();

        // Active state on <li>
        $$(".navbar-nav li").forEach((li) => li.classList.remove("active"));
        link.parentElement?.classList.add("active");

        // Scroll to section
        const target = $(href);
        const y = getTop(target);
        smoothScrollTo(y, 700);

        // Update hash without jumping
        history.pushState(null, "", href);
      });
    });
  }

  /* ----------------------------------------
 * Projects filter (accessible, multi-category)
 * -------------------------------------- */
  function initProjectsFilter() {
    const container = document.querySelector("#filter-gallary");
    const cards = Array.from(document.querySelectorAll(".grid-container .card"));
    if (!container || cards.length === 0) return;

    const buttons = Array.from(container.querySelectorAll(".btn"));

    // Normalize any label to a URL-safe, case-insensitive slug
    const slugify = (s) =>
      String(s || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    // Parse card categories once (support multiple, comma-separated)
    const cardMeta = cards.map((card) => {
      const raw = card.getAttribute("data-category") || "all";
      const list = raw
        .split(",")
        .map((x) => slugify(x))
        .filter(Boolean);
      return { el: card, cats: list.length ? list : ["all"] };
    });

    // Apply filter by slug (e.g., "frontend" or "wordpress")
    function applyFilter(rawCategory) {
      const cat = slugify(rawCategory || "all");
      let visibleCount = 0;

      cardMeta.forEach(({ el, cats }) => {
        // Show if "all" OR card has the category in its list
        const show = cat === "all" || cats.includes(cat);
        el.classList.toggle("is-hidden", !show);
        if (show) visibleCount++;
      });

      // Optional empty state (uncomment if you add .projects-empty element)
      // const empty = document.querySelector(".projects-empty");
      // if (empty) empty.classList.toggle("d-none", visibleCount !== 0);
    }

    // Wire buttons (set aria and active state)
    buttons.forEach((btn) => {
      // normalize any existing data-category to slug
      const raw = btn.getAttribute("data-category") || "all";
      const slug = slugify(raw);
      btn.setAttribute("data-category", slug);
      btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");

      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        applyFilter(slug);
      });
    });

    // Initial: "all"
    applyFilter("all");
  }

  /* ----------------------------------------
   * Menu icon toggle (Bootstrap collapse events)
   * -------------------------------------- */
  function initMenuIcon() {
    const menuIcon = $("#menu-icon");
    const menuNav = $("#navbarNav");
    if (!menuIcon || !menuNav) return;

    // Guard if Bootstrap events are present
    ["shown.bs.collapse", "hidden.bs.collapse"].forEach((eventName) => {
      menuNav.addEventListener(eventName, () => {
        const isOpen = eventName === "shown.bs.collapse";
        menuIcon.classList.toggle("fa-bars", !isOpen);
        menuIcon.classList.toggle("fa-times", isOpen);
        menuIcon.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      });
    });
  }

  /* ----------------------------------------
   * Section reveals (skills fade-in as example)
   * -------------------------------------- */
  function initReveals() {
    const skills = $(".skills");
    if (!skills) return;

    if (prefersReduced) {
      // Respect user preference: show immediately without effects
      skills.classList.add("revealed");
      return;
    }

    // Use IntersectionObserver for robust reveal
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in"); // add a CSS class; let CSS animate
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.15 }
    );

    io.observe(skills);
  }

  /* ----------------------------------------
   * (Optional) Old demo: sequential hover add/remove
   * -------------------------------------- */
  function initDemoSequentialHover() {
    if (!FLAGS.debugDemoHover) return;
    const items = $$(".nav-item");
    if (!items.length) return;

    items.forEach((_, i) => {
      setTimeout(() => {
        if (i > 0) items[i - 1].classList.remove("hover");
        items[i].classList.add("hover");
      }, i * 750);
    });
  }

  /* ----------------------------------------
   * Legacy jQuery sticky handler (fixed class)
   *   - Replaced with cleaner onScroll above, but we keep
   *     the API-compatible function in case CSS expects it.
   * -------------------------------------- */
  function initLegacyStickyForCSS() {
    // If someone still toggles .fixed in CSS, mirror via .is-fixed
    if (!FLAGS.enableStickyHeader) return;

    const navbar = $(".navbar");
    if (!navbar) return;

    const syncFixed = () => {
      // mirror .is-fixed to .fixed for backward CSS compatibility
      navbar.classList.toggle("fixed", navbar.classList.contains("is-fixed"));
    };

    const observer = new MutationObserver(syncFixed);
    observer.observe(navbar, { attributes: true, attributeFilter: ["class"] });
    syncFixed();
  }

  /* ----------------------------------------
   * Init on DOM ready
   * -------------------------------------- */
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(() => {
    initNavbar();
    initProjectsFilter();
    initMenuIcon();
    initReveals();
    initDemoSequentialHover();
    initLegacyStickyForCSS();
  });
})();
