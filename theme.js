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
    if (!hero) return;
    var bg = hero.querySelector('.hero-bg');
    if (!bg) return;

    bg.innerHTML =
      '<picture>' +
        '<source media="(max-width: 900px)" srcset="Supplements Mobile Hero.webp">' +
        '<img src="Supplements PC Hero.webp" alt="Vitamins and nutritional supplements">' +
      '</picture>';

    var style = document.getElementById('kalidad-supplements-hero-fullscreen');
    if (!style) {
      style = document.createElement('style');
      style.id = 'kalidad-supplements-hero-fullscreen';
      style.textContent =
        '.catalog-page-hero{min-height:100svh!important;}' +
        '.catalog-page-hero .hero-bg{position:absolute;inset:0;width:100%;height:100%;}' +
        '.catalog-page-hero .hero-bg picture{display:block;width:100%;height:100%;}' +
        '.catalog-page-hero .hero-bg img{display:block;width:100%;height:100%;object-fit:cover;object-position:center;}' +
        '.catalog-page-hero .hero-copy{min-height:100svh!important;}';
      document.head.appendChild(style);
    }
  }

  function initSupplementProductImages() {
    if (!/nutritional-supplements\.html$/i.test(window.location.pathname)) return;

    /* The uploaded product photos are matched to the existing product cards
       by their descriptions/titles. The files can be added to the repository
       root later without changing this page again. */
    var images = {
      'Pregnacare Supplements': '1000561597.webp',
      'Multivitamin and neurological supplements': '1000561610.webp',
      'Sexual wellness': '1000561598.webp',
      "Men's health": '1000561595.webp',
      "Women's Health": '1000561598.webp',
      "Children's wellness": '1000561610.webp'
    };

    document.querySelectorAll('.product-card').forEach(function (card) {
      var title = card.querySelector('.product-body h3');
      var image = card.querySelector('.product-image img');
      if (!title || !image) return;

      var src = images[title.textContent.trim()];
      if (src) {
        image.src = src;
        image.removeAttribute('srcset');
        image.loading = 'lazy';
      }
    });
  }

  function start() {
    init();
    initSupplementsHero();
    initSupplementProductImages();
    window.addEventListener('resize', init, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
