(function () {
  'use strict';

  var header = document.querySelector('body > header, header:not(.top)');
  if (!header || header.dataset.standardHeaderReady === 'true') return;

  var toggle = header.querySelector('#menuToggle, .menu');
  var menu = header.querySelector('#mobileNav') || header.querySelector('#mobileMenu');
  var hero = document.querySelector('.hero, .page-banner, .catalog-page-hero, .service-detail-hero, main > section:first-child');
  if (!toggle) return;

  header.dataset.standardHeaderReady = 'true';

  function setOpen(open) {
    if (menu) menu.classList.toggle('open', open);
    if (menu && menu.id === 'mobileNav') menu.style.display = open ? 'block' : 'none';
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }

  toggle.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    setOpen(!header.classList.contains('nav-open'));
  }, true);

  if (menu) {
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
  }

  document.addEventListener('click', function (event) {
    if (header.classList.contains('nav-open') && !header.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });

  function syncHeader() {
    var scrolled = window.scrollY > 24;
    header.classList.toggle('is-scrolled', scrolled);
    if (hero) {
      header.classList.toggle('logo-hidden', hero.getBoundingClientRect().bottom <= 90);
    }
  }

  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', syncHeader, { passive: true });
  syncHeader();
}());