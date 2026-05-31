/* ============================================================
   TRANSITIONS.JS — Fade-in de seções e transições de página
   Portfólio Isabela Teodoro · 2026
   ============================================================ */

(function () {
  'use strict';

  /* ── Page Entry Fade ── */
  // Adds a short fade-in when the page loads
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.45s ease';

  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.documentElement.style.opacity = '1';
    });
  });

  /* ── Page Exit Fade (on internal link clicks) ── */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external links, anchors, and mailto/tel
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.getAttribute('target') === '_blank'
    ) return;

    e.preventDefault();

    document.documentElement.style.opacity = '0';

    setTimeout(() => {
      window.location.href = href;
    }, 380);
  });

  /* ── Section Background Transition Observer ── */
  // Smoothly transitions the body background as sections scroll into view.
  // Each section can declare data-bg="#color" to trigger a body bg shift.
  const bgSections = document.querySelectorAll('[data-bg]');
  if (bgSections.length) {
    const bgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bg = entry.target.getAttribute('data-bg');
            if (bg) {
              document.body.style.transition = 'background 0.6s ease';
              // background is handled via CSS on the sections themselves;
              // this observer is here if you ever want dynamic body bg.
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    bgSections.forEach(section => bgObserver.observe(section));
  }

  /* ── Lazy Image Loading helper ── */
  // Adds a subtle fade-in when lazy-loaded images finish loading
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });

})();
