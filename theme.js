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

  function initSupplementsHero() {
    var hero = document.querySelector('.catalog-page-hero');
    if (!hero || !/nutritional-supplements\.html$/i.test(window.location.pathname)) return;

    var bg = hero.querySelector('.hero-bg');
    if (!bg) return;

    /* Dedicated desktop/mobile hero assets for the nutritional supplements page. */
    bg.innerHTML =
      '<picture>' +
        '<source media="(max-width: 900px)" srcset="Supplements Mobile Hero.webp">' +
        '<img src="Supplements PC Hero.webp" alt="Vitamins and nutritional supplements">' +
      '</picture>';

    addStyle('kalidad-supplements-hero-fullscreen',
      '.catalog-page-hero{min-height:100svh!important;}' +
      '.catalog-page-hero .hero-bg{position:absolute;inset:0;width:100%;height:100%;}' +
      '.catalog-page-hero .hero-bg picture{display:block;width:100%;height:100%;}' +
      '.catalog-page-hero .hero-bg img{display:block;width:100%;height:100%;object-fit:cover;object-position:center;}' +
      '.catalog-page-hero .hero-copy{min-height:100svh!important;}');
  }

  function initCatalogHeroes() {
    var path = window.location.pathname;
    var isTarget = /(?:^|\/)(otc-wellness|personal-hygiene-oral-care|skincare-body-care|baby-care)\.html$/i.test(path);
    if (!isTarget) return;

    var hero = document.querySelector('.catalog-page-hero');
    if (!hero) return;

    /* Same full-viewport treatment on desktop and mobile. Keep each page's
       existing hero image and overlay/content; only change sizing/cropping. */
    addStyle('kalidad-catalog-heroes-fullscreen',
      '.catalog-page-hero{min-height:100svh!important;height:100svh!important;}' +
      '.catalog-page-hero .hero-bg{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;}' +
      '.catalog-page-hero .hero-bg img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.catalog-page-hero .hero-copy{min-height:100svh!important;height:100svh!important;}' +
      '@media(max-width:620px){.catalog-page-hero,.catalog-page-hero .hero-copy{min-height:100svh!important;height:100svh!important;}}');
  }

  function initPrescriptionHero() {
    if (!/(?:^|\/)prescription-filling\.html$/i.test(window.location.pathname)) return;

    var hero = document.querySelector('.service-detail-hero');
    if (!hero) return;

    /* Convert the prescription hero to the same edge-to-edge, full-viewport
       treatment. Remove the existing white gradient completely; the original
       hero photograph remains and fills the entire hero on desktop/mobile. */
    addStyle('kalidad-prescription-hero-fullscreen',
      '.service-detail-hero{position:relative!important;display:block!important;min-height:100svh!important;height:100svh!important;background:#12291F!important;overflow:hidden!important;}' +
      '.service-detail-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important;z-index:1!important;}' +
      '.service-detail-image img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.service-detail-copy{position:relative!important;z-index:2!important;width:100%!important;height:100%!important;min-height:100svh!important;padding:clamp(110px,14vh,150px) clamp(24px,7vw,100px) 70px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;background:transparent!important;}' +
      '.service-detail-copy h1{color:#fff!important;text-shadow:0 2px 18px rgba(0,0,0,.32)!important;}' +
      '.service-detail-copy .lead{color:rgba(255,255,255,.94)!important;text-shadow:0 1px 12px rgba(0,0,0,.28)!important;}' +
      '@media(max-width:850px){.service-detail-hero{min-height:100svh!important;height:100svh!important;}.service-detail-copy{height:100svh!important;min-height:100svh!important;padding:105px 24px 55px!important;}.service-detail-image{height:100%!important;min-height:100%!important;}}');
  }

  function addStyle(id, css) {
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function start() {
    init();
    initSupplementsHero();
    initCatalogHeroes();
    initPrescriptionHero();
    window.addEventListener('resize', init, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
