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

    toggle.innerHTML =
      '<svg class="kalidad-menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="#1E4F3B" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>';

    toggle.style.webkitAppearance = 'none';
    toggle.style.appearance = 'none';
    toggle.style.cursor = 'pointer';
    toggle.style.touchAction = 'manipulation';

    if (toggle.dataset.kalidadMenuRepair === 'true') return;
    toggle.dataset.kalidadMenuRepair = 'true';

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

    bg.innerHTML =
      '<picture>' +
        '<source media="(max-width: 900px)" srcset="Nutritional Supplements & Boosters.webp">' +
        '<img src="Nutritional Supplements & Boosters.webp" alt="Nutritional supplements and boosters">' +
      '</picture>';

    addStyle('kalidad-supplements-hero-fullscreen',
      '.catalog-page-hero{min-height:100svh!important;}' +
      '.catalog-page-hero .hero-bg{position:absolute;inset:0;width:100%;height:100%;}' +
      '.catalog-page-hero .hero-bg picture{display:block;width:100%;height:100%;}' +
      '.catalog-page-hero .hero-bg img{display:block;width:100%;height:100%;object-fit:cover;object-position:center;}');
  }

  function initCatalogHeroes() {
    var path = window.location.pathname;
    var isTarget = /(?:^|\/)(otc-wellness|personal-hygiene-oral-care|skincare-body-care|baby-care)\.html$/i.test(path);
    if (!isTarget) return;

    var hero = document.querySelector('.catalog-page-hero');
    if (!hero) return;

    var isOtc = /(?:^|\/)otc-wellness\.html$/i.test(path);

    addStyle('kalidad-catalog-heroes-fullscreen',
      '.catalog-page-hero{position:relative!important;display:block!important;min-height:100svh!important;height:100svh!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;overflow:hidden!important;}' +
      '.catalog-page-hero .hero-bg{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important;z-index:1!important;margin:0!important;padding:0!important;}' +
      '.catalog-page-hero .hero-bg img{display:block!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;object-fit:cover!important;object-position:center!important;margin:0!important;}' +
      '.catalog-page-hero .hero-copy{position:relative!important;z-index:2!important;width:100%!important;min-height:100svh!important;height:100svh!important;background:transparent!important;}' +
      '.catalog-page-hero::before,.catalog-page-hero::after,.catalog-page-hero .hero-bg::before,.catalog-page-hero .hero-bg::after{background:none!important;background-image:none!important;box-shadow:none!important;opacity:0!important;display:none!important;content:none!important;}' +
      (isOtc ?
        '.catalog-page-hero{height:100dvh!important;min-height:100dvh!important;}' +
        '.catalog-page-hero .hero-copy{height:100dvh!important;min-height:100dvh!important;}' +
        '.catalog-page-hero .hero-bg{height:100dvh!important;}' +
        'body{overflow-x:hidden!important;}' +
        '@media(min-width:901px){.catalog-page-hero{margin-bottom:0!important;}}' : '') +
      '@media(max-width:620px){.catalog-page-hero,.catalog-page-hero .hero-copy{min-height:100svh!important;height:100svh!important;}}');
  }

  function initPersonalHygieneHeroText() {
    if (!/(?:^|\/)personal-hygiene-oral-care\.html$/i.test(window.location.pathname)) return;

    var hero = document.querySelector('.catalog-page-hero') || document.querySelector('.page-banner');
    if (!hero) return;

    var heading = hero.querySelector('.hero-copy h1') || hero.querySelector('h1');
    if (!heading) return;

    heading.innerHTML = 'Personal Hygiene &amp; Oral <span class="accent">Care</span>';

    addStyle('kalidad-personal-hygiene-hero-text',
      '.catalog-page-hero .hero-copy h1,.page-banner h1{color:#1E4F3B!important;}' +
      '.catalog-page-hero .hero-copy h1 .accent,.page-banner h1 .accent{color:#C7EF3E!important;}');
  }

  function initOTCWellnessHero() {
    if (!/(?:^|\/)otc-wellness\.html$/i.test(window.location.pathname)) return;

    var hero = document.querySelector('.page-banner');
    if (!hero) return;

    addStyle('kalidad-otc-wellness-hero-fullscreen',
      'html,body{margin:0!important;padding:0!important;}' +
      'body{overflow-x:hidden!important;}' +
      'header{position:absolute!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:50!important;}' +
      '.page-banner{position:relative!important;display:block!important;width:100%!important;height:100svh!important;min-height:100svh!important;margin:0!important;padding:0!important;overflow:hidden!important;box-sizing:border-box!important;background:transparent!important;}' +
      '.page-banner::before,.page-banner::after{display:none!important;content:none!important;background:none!important;background-image:none!important;}' +
      '.page-banner .container{position:relative!important;width:100%!important;height:100%!important;min-height:100svh!important;max-width:none!important;margin:0!important;box-sizing:border-box!important;}' +
      '.page-banner .hero-bg,.page-banner .page-banner-bg,.page-banner picture{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;}' +
      '.page-banner img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.page-banner .hero-copy{position:relative!important;z-index:2!important;height:100%!important;min-height:100svh!important;}' +
      '@media(max-width:900px){header{position:absolute!important;}.page-banner,.page-banner .container,.page-banner .hero-copy{height:100svh!important;min-height:100svh!important;}}');
  }

  function initPrescriptionHero() {
    if (!/(?:^|\/)prescription-filling\.html$/i.test(window.location.pathname)) return;

    var hero = document.querySelector('.service-detail-hero');
    if (!hero) return;

    addStyle('kalidad-prescription-hero-fullscreen',
      '.service-detail-hero{position:relative!important;display:block!important;min-height:100svh!important;height:100svh!important;background:#12291F!important;overflow:hidden!important;}' +
      '.service-detail-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important;z-index:1!important;}' +
      '.service-detail-image img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.service-detail-copy{position:relative!important;z-index:2!important;width:100%!important;height:100%!important;min-height:100svh!important;padding:clamp(110px,14vh,150px) clamp(24px,7vw,100px) 70px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;background:transparent!important;}' +
      '.service-detail-copy h1{color:#fff!important;text-shadow:0 2px 18px rgba(0,0,0,.32)!important;}' +
      '.service-detail-copy .lead{color:rgba(255,255,255,.94)!important;text-shadow:0 1px 12px rgba(0,0,0,.28)!important;}' +
      '@media(max-width:850px){.service-detail-hero{min-height:100svh!important;height:100svh!important;}.service-detail-copy{height:100svh!important;min-height:100svh!important;padding:105px 24px 55px!important;}.service-detail-image{height:100%!important;min-height:100%!important;}}');
  }

  function initServiceDetailHeroes() {
    var path = window.location.pathname;
    var isTarget = /(?:^|\/)(family-care|pharmacist-consultation|same-day-delivery|health-checks)\.html$/i.test(path);
    if (!isTarget) return;

    addStyle('kalidad-service-detail-heroes-unified',
      '.service-detail-hero{position:relative!important;display:block!important;min-height:100svh!important;height:100svh!important;width:100%!important;overflow:hidden!important;background:#12291F!important;}' +
      '.service-detail-hero .service-detail-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:100%!important;z-index:1!important;overflow:hidden!important;}' +
      '.service-detail-hero .service-detail-image img{display:block!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;object-fit:cover!important;object-position:center!important;}' +
      '.service-detail-hero .service-detail-copy{position:relative!important;z-index:2!important;width:100%!important;height:100%!important;min-height:100svh!important;padding:130px 7vw 90px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;background:transparent!important;}' +
      '.service-detail-hero .service-detail-copy h1{color:#fff!important;text-shadow:0 2px 18px rgba(0,0,0,.34)!important;}' +
      '.service-detail-hero .service-detail-copy .lead{color:rgba(255,255,255,.96)!important;text-shadow:0 1px 12px rgba(0,0,0,.30)!important;}' +
      '.service-detail-hero::before,.service-detail-hero::after{background:none!important;display:none!important;content:none!important;}' +
      '@media(max-width:850px){.service-detail-hero{min-height:100svh!important;height:100svh!important;}.service-detail-hero .service-detail-image{position:absolute!important;inset:0!important;height:100%!important;min-height:100%!important;}.service-detail-hero .service-detail-copy{height:100svh!important;min-height:100svh!important;padding:115px 28px 60px!important;}}' +
      '@media(max-width:560px){.service-detail-hero .service-detail-copy{padding:105px 24px 55px!important;}}');
  }

  function initLastWordHeroAccent() {
    var target = /(?:^|\/)(skincare-body-care|baby-care|nutritional-supplements|prescription-filling|health-checks|same-day-delivery|pharmacist-consultation|family-care)\.html$/i;
    if (!target.test(window.location.pathname)) return;

    var heading = document.querySelector('.catalog-page-hero .hero-copy h1') ||
      document.querySelector('.page-banner .hero-copy h1') ||
      document.querySelector('.page-banner h1') ||
      document.querySelector('.service-detail-hero .service-detail-copy h1') ||
      document.querySelector('.service-detail-hero h1');
    if (!heading) return;

    var text = heading.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;

    var match = text.match(/^(.*?)(\S+)$/);
    if (!match) return;

    var lastWord = match[2];
    var prefix = match[1];
    heading.innerHTML = '';
    heading.appendChild(document.createTextNode(prefix));
    var accent = document.createElement('span');
    accent.className = 'accent';
    accent.textContent = lastWord;
    heading.appendChild(accent);

    addStyle('kalidad-last-word-hero-accent',
      '.accent{color:#C7EF3E!important;}' +
      '.catalog-page-hero .hero-copy h1,.page-banner .hero-copy h1,.page-banner h1,.service-detail-hero .service-detail-copy h1,.service-detail-hero h1{color:#1E4F3B!important;}' +
      '.catalog-page-hero .hero-copy h1 .accent,.page-banner .hero-copy h1 .accent,.page-banner h1 .accent,.service-detail-hero .service-detail-copy h1 .accent,.service-detail-hero h1 .accent{color:#C7EF3E!important;}');
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
    initPersonalHygieneHeroText();
    initOTCWellnessHero();
    initPrescriptionHero();
    initServiceDetailHeroes();
    initLastWordHeroAccent();
    window.addEventListener('resize', init, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
