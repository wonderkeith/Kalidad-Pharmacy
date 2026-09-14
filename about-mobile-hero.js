/* Kalidad Pharmacy — About hero mobile positioning
   Keeps desktop unchanged. On phones, centers the existing About hero copy
   vertically at the midpoint of the hero image. */
(function () {
  'use strict';

  function init() {
    if (!window.matchMedia || !window.matchMedia('(max-width: 800px)').matches) return;
    if (document.getElementById('kalidad-about-mobile-hero-style')) return;

    var cta = document.querySelector('a[href="#meet-team"], a[href$="#meet-team"]');
    if (!cta) return;

    var hero = cta.closest('section, header, .hero, .page-banner, .banner, .hero-section');
    if (!hero) return;

    var copy = hero.querySelector('.hero-copy, .hero-content, .hero-text, .hero-inner, .banner-content, .container');
    if (!copy) return;

    var style = document.createElement('style');
    style.id = 'kalidad-about-mobile-hero-style';
    style.textContent =
      '@media (max-width:800px){' +
        'body .about-hero .hero-copy,' +
        'body .about-hero .hero-content,' +
        'body .about-hero .hero-text,' +
        'body .about-hero .hero-inner,' +
        'body .about-hero .banner-content,' +
        'body .about-page-hero .hero-copy,' +
        'body .about-page-hero .hero-content,' +
        'body .about-page-hero .hero-text,' +
        'body .about-page-hero .hero-inner,' +
        'body .about-page-hero .banner-content,' +
        'body .hero .hero-copy,' +
        'body .hero .hero-content,' +
        'body .hero .hero-text,' +
        'body .hero .hero-inner,' +
        'body .hero .banner-content,' +
        'body .page-banner .hero-copy,' +
        'body .page-banner .hero-content,' +
        'body .page-banner .hero-text,' +
        'body .page-banner .hero-inner,' +
        'body .page-banner .banner-content{' +
          'position:absolute!important;' +
          'top:50%!important;' +
          'left:0!important;' +
          'right:0!important;' +
          'transform:translateY(-50%)!important;' +
          'margin-top:0!important;' +
          'padding-top:0!important;' +
          'padding-bottom:0!important;' +
          'z-index:5!important;' +
        '}' +
        'body .hero,body .about-hero,body .about-page-hero,body .page-banner{' +
          'position:relative!important;' +
        '}' +
      '}';
    document.head.appendChild(style);

    /* If the hero uses a container as its text wrapper, only make the
       wrapper itself the centered layer; its internal text stays intact. */
    copy.classList.add('kalidad-mobile-hero-copy');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
