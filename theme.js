/* Kalidad Pharmacy shared theme/menu helper.
   Mobile-only menu repair for the primary navigation pages. */
(function () {
  'use strict';

  var pages = /(?:^|\/)(index|services|news|about)\.html$/i;

  function init() {
    if (window.innerWidth > 900) return;
    if (!pages.test(window.location.pathname)) return;

    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    var header = document.querySelector('header');
    if (!toggle || !menu || !header) return;

    /* Make the hamburger unmistakably visible on mobile, including Safari/WebKit. */
    toggle.innerHTML =
      '<svg class="kalidad-menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="#1E4F3B" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>';

    toggle.style.webkitAppearance = 'none';
    toggle.style.appearance = 'none';
    toggle.style.cursor = 'pointer';
    toggle.style.touchAction = 'manipulation';

    if (toggle.dataset.kalidadMenuRepair === 'true') return;
    toggle.dataset.kalidadMenuRepair = 'true';

    /* The page's existing controller is the source of truth. Only install a
       fallback if that controller did not initialize. */
    if (toggle.dataset.careersMenuReady === 'true') return;

    function setOpen(open) {
      menu.classList.toggle('open', open);
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function (event) {
      if (toggle.dataset.careersMenuReady === 'true') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(!menu.classList.contains('open'));
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (toggle.dataset.careersMenuReady !== 'true') setOpen(false);
      });
    });
  }

  function start() {
    init();
    window.addEventListener('resize', init, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
