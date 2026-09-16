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
      '.catalog-page-hero::before,.catalog-page-hero::after,.catalog-page-hero .hero-bg::before{background:none!important;background-image:none!important;box-shadow:none!important;opacity:0!important;display:none!important;content:none!important;}' +
      '.catalog-page-hero .hero-bg::after{content:""!important;position:absolute!important;inset:0!important;display:block!important;background:linear-gradient(90deg,rgba(18,41,31,.68) 0%,rgba(18,41,31,.45) 28%,rgba(18,41,31,.12) 58%,rgba(18,41,31,.02) 100%)!important;z-index:1!important;pointer-events:none!important;}' +
      '@media(max-width:850px){.catalog-page-hero .hero-bg::after{background:linear-gradient(90deg,rgba(18,41,31,.66) 0%,rgba(18,41,31,.36) 55%,rgba(18,41,31,.12) 100%)!important;}}' +
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
      '.catalog-page-hero .hero-copy h1{color:#fff!important;}' +
      '.catalog-page-hero .hero-copy h1 .accent{color:#C7EF3E!important;}' +
      '.page-banner h1{color:#1E4F3B!important;}' +
      '.page-banner h1 .accent{color:#C7EF3E!important;}');
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
      '.catalog-page-hero .hero-copy h1{color:#fff!important;}' +
      '.catalog-page-hero .hero-copy h1 .accent{color:#C7EF3E!important;}' +
      '.page-banner .hero-copy h1,.page-banner h1,.service-detail-hero .service-detail-copy h1,.service-detail-hero h1{color:#1E4F3B!important;}' +
      '.page-banner .hero-copy h1 .accent,.page-banner h1 .accent,.service-detail-hero .service-detail-copy h1 .accent,.service-detail-hero h1 .accent{color:#C7EF3E!important;}');
  }

  function initAboutTeamSlider() {
    if (!/(?:^|\/)about\.html$/i.test(window.location.pathname)) return;
    if (document.getElementById('kalidad-about-team-slider')) return;

    var headings = Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3'));
    var heading = headings.find(function (el) {
      return /People who put care into every prescription/i.test(el.textContent || '');
    });
    if (!heading) return;

    var section = heading.closest('section') || heading.parentElement;
    if (!section) return;

    var firstImage = section.querySelector('img')?.getAttribute('src') || 'kalidad_pharmacy_team_hero.webp';
    var slides = [
      {
        name: 'People who put care into every prescription',
        role: 'Meet our team',
        description: 'Behind every prescription, recommendation, and conversation is a team committed to doing pharmacy care properly. Our pharmacists bring professional knowledge, attention to detail, and a genuine desire to help the people we serve. From dispensing medicines to answering questions and supporting everyday wellness, our team works together to make every visit feel personal, respectful, and reassuring.',
        image: firstImage,
        intro: true
      },
      { name: 'Dr. Abimanya Willbrod', role: 'Supervising Pharmacist · Managing Director', description: 'Provides clinical leadership, professional oversight and strategic direction for Kalidad Pharmacy, helping ensure safe, responsible and patient-centred pharmacy care.', image: '20260724_143031(1)(1).jpg' },
      { name: 'Kato Julius', role: 'Operations Manager', description: 'Coordinates day-to-day pharmacy operations, helping the team deliver efficient, organised and dependable service to every customer.', image: '20260724_144840(1).jpg' },
      { name: 'Kalule Briton', role: 'Assistant Operations Manager', description: 'Supports operational coordination and team performance, helping maintain smooth workflows and consistent customer service.', image: '20260724_145355(1).jpg' },
      { name: 'Kafuuma Keith Paul', role: 'Pharmacy IT Technician · Salesman', description: 'Supports pharmacy technology and digital systems while also assisting customers with product information and sales.', image: '20260724_145446(1).jpg' },
      { name: 'Katusiime Shallom Flavia', role: 'Quality Assurance Officer · Salesman', description: 'Supports quality-focused pharmacy processes while helping customers find appropriate products and receive attentive service.', image: '20260724_151100(1)_HD.webp' },
      { name: 'Murungi Kenneth Godfrey', role: 'Salesman', description: 'Helps customers navigate the pharmacy range, understand available products and receive friendly, professional service.', image: '20260724_151800_HD.webp' },
      { name: 'Tuhaise Justine', role: 'Salesman', description: 'Supports customers with product selection and day-to-day pharmacy service with a welcoming and helpful approach.', image: '20260724_152030(1)_HD.webp' },
      { name: 'Atuhaire Chris', role: 'Salesman', description: 'Assists customers with product enquiries and sales while contributing to a smooth and positive pharmacy experience.', image: '20260724_152439(1)_HD.webp' },
      { name: 'Namara Victoria', role: 'Salesman', description: 'Supports customers with product enquiries, selection and everyday pharmacy service.', image: '20260724_155052(1)(1)_HD.webp' },
      { name: 'Kato Reagan', role: 'Salesman', description: 'Helps customers identify suitable products and provides attentive support throughout their pharmacy visit.', image: 'pharmacist_green_scrubs.webp' },
      { name: 'Kenyange Rhita', role: 'Salesman', description: 'Supports customers with product information and sales while helping create a respectful, welcoming pharmacy experience.', image: 'team-pharmacists.jpg' }
    ];

    var root = document.createElement('section');
    root.id = 'kalidad-about-team-slider';
    root.className = 'kalidad-about-team-slider';
    root.setAttribute('aria-label', 'Meet the Kalidad Pharmacy team');
    root.innerHTML =
      '<div class="kalidad-team-track">' +
      slides.map(function (s, i) {
        return '<article class="kalidad-team-slide' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '">' +
          '<div class="kalidad-team-copy">' +
            '<div class="kalidad-team-kicker">' + (s.intro ? 'MEET OUR TEAM' : 'KALIDAD PHARMACY TEAM') + '</div>' +
            '<h2>' + escapeHtml(s.name) + '</h2>' +
            '<div class="kalidad-team-role">' + escapeHtml(s.role) + '</div>' +
            '<p>' + escapeHtml(s.description) + '</p>' +
          '</div>' +
          '<div class="kalidad-team-image"><img src="' + escapeAttr(s.image) + '" alt="' + escapeAttr(s.intro ? 'Kalidad Pharmacy team' : s.name) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '"></div>' +
        '</article>';
      }).join('') +
      '</div>' +
      '<button class="kalidad-team-arrow prev" type="button" aria-label="Previous team member">&#8592;</button>' +
      '<button class="kalidad-team-arrow next" type="button" aria-label="Next team member">&#8594;</button>' +
      '<div class="kalidad-team-progress" aria-label="Team slider navigation">' +
        slides.map(function (_, i) { return '<button type="button" data-go="' + i + '" aria-label="Go to slide ' + (i + 1) + '" class="' + (i === 0 ? 'active' : '') + '"></button>'; }).join('') +
      '</div>';

    section.replaceWith(root);

    addStyle('kalidad-about-team-slider-style',
      '#kalidad-about-team-slider{position:relative;width:100%;min-height:clamp(620px,76vh,820px);background:#fff;overflow:hidden;isolation:isolate;}' +
      '#kalidad-about-team-slider .kalidad-team-track{position:relative;width:100%;height:100%;min-height:inherit;}' +
      '#kalidad-about-team-slider .kalidad-team-slide{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;opacity:0;visibility:hidden;transform:translateX(3%);transition:opacity .55s ease,transform .65s cubic-bezier(.22,.61,.36,1),visibility .55s;}' +
      '#kalidad-about-team-slider .kalidad-team-slide.is-active{opacity:1;visibility:visible;transform:translateX(0);z-index:2;}' +
      '#kalidad-about-team-slider .kalidad-team-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(70px,8vw,120px) clamp(32px,7vw,128px);background:#fff;}' +
      '#kalidad-about-team-slider .kalidad-team-kicker{font-size:.74rem;font-weight:800;letter-spacing:.18em;color:#1E4F3B;margin-bottom:18px;}' +
      '#kalidad-about-team-slider .kalidad-team-copy h2{font-family:Lora,serif;font-weight:800;color:#12291F;font-size:clamp(2.25rem,4.6vw,4.25rem);line-height:1.03;margin:0;max-width:680px;}' +
      '#kalidad-about-team-slider .kalidad-team-role{margin-top:20px;color:#1E4F3B;font-weight:800;font-size:clamp(1rem,1.5vw,1.22rem);line-height:1.35;max-width:600px;}' +
      '#kalidad-about-team-slider .kalidad-team-copy p{margin-top:22px;max-width:640px;color:#284136;font-size:clamp(.98rem,1.35vw,1.16rem);line-height:1.85;}' +
      '#kalidad-about-team-slider .kalidad-team-image{position:relative;min-height:100%;overflow:hidden;background:#eef3ea;}' +
      '#kalidad-about-team-slider .kalidad-team-image img{width:100%;height:100%;min-height:100%;display:block;object-fit:cover;object-position:center;}' +
      '#kalidad-about-team-slider .kalidad-team-arrow{position:absolute;z-index:8;top:50%;transform:translateY(-50%);width:52px;height:52px;border:1px solid rgba(18,41,31,.12);border-radius:50%;background:rgba(255,255,255,.92);color:#12291F;display:flex;align-items:center;justify-content:center;font-size:1.45rem;line-height:1;box-shadow:0 12px 30px rgba(18,41,31,.16);cursor:pointer;transition:transform .2s ease,background .2s ease,box-shadow .2s ease;}' +
      '#kalidad-about-team-slider .kalidad-team-arrow:hover{background:#C7EF3E;box-shadow:0 14px 32px rgba(18,41,31,.22);}' +
      '#kalidad-about-team-slider .kalidad-team-arrow.prev{left:22px;}' +
      '#kalidad-about-team-slider .kalidad-team-arrow.next{right:22px;}' +
      '#kalidad-about-team-slider .kalidad-team-progress{position:absolute;z-index:9;left:50%;bottom:22px;transform:translateX(-50%);display:flex;gap:6px;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(18,41,31,.72);backdrop-filter:blur(8px);}' +
      '#kalidad-about-team-slider .kalidad-team-progress button{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.5);cursor:pointer;transition:width .25s ease,background .25s ease;}' +
      '#kalidad-about-team-slider .kalidad-team-progress button.active{width:24px;border-radius:999px;background:#C7EF3E;}' +
      '@media(max-width:800px){' +
        '#kalidad-about-team-slider{min-height:780px;height:auto;}' +
        '#kalidad-about-team-slider .kalidad-team-slide{grid-template-columns:1fr;grid-template-rows:minmax(360px,48vh) auto;overflow:auto;}' +
        '#kalidad-about-team-slider .kalidad-team-copy{order:2;padding:48px 28px 82px;justify-content:flex-start;}' +
        '#kalidad-about-team-slider .kalidad-team-image{order:1;min-height:360px;}' +
        '#kalidad-about-team-slider .kalidad-team-copy h2{font-size:clamp(2rem,9vw,3.1rem);}' +
        '#kalidad-about-team-slider .kalidad-team-copy p{font-size:.95rem;line-height:1.7;}' +
        '#kalidad-about-team-slider .kalidad-team-arrow{width:44px;height:44px;top:44%;}' +
        '#kalidad-about-team-slider .kalidad-team-arrow.prev{left:12px;}' +
        '#kalidad-about-team-slider .kalidad-team-arrow.next{right:12px;}' +
        '#kalidad-about-team-slider .kalidad-team-progress{bottom:16px;max-width:calc(100% - 90px);overflow:hidden;}' +
      '}' +
      '@media(prefers-reduced-motion:reduce){#kalidad-about-team-slider .kalidad-team-slide{transition:none;}}');

    var current = 0;
    var timer = null;
    var duration = 3000;
    var slideEls = Array.prototype.slice.call(root.querySelectorAll('.kalidad-team-slide'));
    var dotEls = Array.prototype.slice.call(root.querySelectorAll('.kalidad-team-progress button'));

    function goTo(index, userAction) {
      current = (index + slideEls.length) % slideEls.length;
      slideEls.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      dotEls.forEach(function (el, i) { el.classList.toggle('active', i === current); });
      if (userAction) restart();
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1, false); }, duration);
    }

    root.querySelector('.kalidad-team-arrow.prev').addEventListener('click', function () { goTo(current - 1, true); });
    root.querySelector('.kalidad-team-arrow.next').addEventListener('click', function () { goTo(current + 1, true); });
    dotEls.forEach(function (dot, i) { dot.addEventListener('click', function () { goTo(i, true); }); });

    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', function () { clearInterval(timer); });
    root.addEventListener('focusout', function () { restart(); });

    restart();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
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
    initAboutTeamSlider();
    window.addEventListener('resize', init, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
