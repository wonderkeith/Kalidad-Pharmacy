/* Kalidad Pharmacy — About page team slider
   Loaded only by about.html. The first slide preserves the existing team section;
   following slides show the named team members. Auto-advance: 6 seconds. */
(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function init() {
    if (document.getElementById('kalidad-about-team-slider')) return;

    var section = document.querySelector('.team-section');
    if (!section) return;

    var originalImage = section.querySelector('.team-image-wrap img');
    var firstImage = originalImage ? originalImage.getAttribute('src') : 'team-pharmacists.jpg';

    var members = [
      { name: 'Dr. Abimanya Willbrod', role: 'Supervising Pharmacist · Managing Director', description: 'Provides professional and clinical leadership for Kalidad Pharmacy while guiding safe, responsible and patient-centred pharmacy care.', image: '20260724_143031(1)(1).jpg' },
      { name: 'Kato Julius', role: 'Operations Manager', description: 'Coordinates day-to-day pharmacy operations and helps the team deliver efficient, organised and dependable service.', image: '20260724_144840(1).jpg' },
      { name: 'Kalule Briton', role: 'Assistant Operations Manager', description: 'Supports operational coordination and team performance, helping maintain smooth workflows and consistent customer service.', image: '20260724_145355(1).jpg' },
      { name: 'Kafuuma Keith Paul', role: 'Pharmacy IT Technician · Salesman', description: 'Supports pharmacy technology and digital systems while assisting customers with product information and sales.', image: '20260724_145446(1).jpg' },
      { name: 'Katusiime Shallom Flavia', role: 'Quality Assurance Officer · Salesman', description: 'Supports quality-focused pharmacy processes while helping customers find appropriate products and receive attentive service.', image: '20260724_151100(1)_HD.webp' },
      { name: 'Murungi Kenneth Godfrey', role: 'Salesman', description: 'Helps customers navigate the pharmacy range, understand available products and receive friendly, professional service.', image: '20260724_151800_HD.webp' },
      { name: 'Tuhaise Justine', role: 'Salesman', description: 'Supports customers with product selection and day-to-day pharmacy service with a welcoming and helpful approach.', image: '20260724_152030(1)_HD.webp' },
      { name: 'Atuhaire Chris', role: 'Salesman', description: 'Assists customers with product enquiries and sales while contributing to a smooth and positive pharmacy experience.', image: '20260724_152439(1)_HD.webp' },
      { name: 'Namara Victoria', role: 'Salesman', description: 'Supports customers with product enquiries, selection and everyday pharmacy service.', image: '20260724_155052(1)(1)_HD.webp' },
      { name: 'Kato Reagan', role: 'Salesman', description: 'Helps customers identify suitable products and provides attentive support throughout their pharmacy visit.', image: 'pharmacist_green_scrubs.webp' },
      { name: 'Kenyange Rhita', role: 'Salesman', description: 'Supports customers with product information and sales while helping create a respectful, welcoming pharmacy experience.', image: 'team-pharmacists.jpg' }
    ];

    var slides = [{
      name: 'People who put care into every prescription',
      role: 'Meet our team',
      description: 'Behind every prescription, recommendation, and conversation is a team committed to doing pharmacy care properly. Our pharmacists bring professional knowledge, attention to detail, and a genuine desire to help the people we serve. From dispensing medicines to answering questions and supporting everyday wellness, our team works together to make every visit feel personal, respectful, and reassuring.',
      image: firstImage,
      intro: true
    }].concat(members);

    var root = document.createElement('section');
    root.id = 'kalidad-about-team-slider';
    root.className = 'kalidad-about-team-slider';
    root.setAttribute('aria-label', 'Meet the Kalidad Pharmacy team');
    root.setAttribute('data-scroll-anchor', 'meet-team');

    root.innerHTML =
      '<div class="kats-track">' +
        slides.map(function (slide, index) {
          return '<article class="kats-slide' + (index === 0 ? ' is-active' : '') + '" data-index="' + index + '">' +
            '<div class="kats-copy">' +
              '<div class="kats-kicker">' + esc(slide.intro ? 'MEET OUR TEAM' : 'KALIDAD PHARMACY TEAM') + '</div>' +
              '<h2>' + esc(slide.name) + '</h2>' +
              '<div class="kats-role">' + esc(slide.role) + '</div>' +
              '<p>' + esc(slide.description) + '</p>' +
            '</div>' +
            '<div class="kats-image"><img src="' + esc(slide.image) + '" alt="' + esc(slide.intro ? 'Kalidad Pharmacy team' : slide.name) + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '"></div>' +
          '</article>';
        }).join('') +
      '</div>' +
      '<button class="kats-arrow kats-prev" type="button" aria-label="Previous team member">&#8592;</button>' +
      '<button class="kats-arrow kats-next" type="button" aria-label="Next team member">&#8594;</button>' +
      '<div class="kats-dots" role="tablist" aria-label="Team slides">' +
        slides.map(function (_, index) {
          return '<button type="button" role="tab" data-go="' + index + '" aria-label="Go to slide ' + (index + 1) + '"' + (index === 0 ? ' aria-selected="true" class="active"' : ' aria-selected="false"') + '></button>';
        }).join('') +
      '</div>';

    section.replaceWith(root);

    var style = document.createElement('style');
    style.id = 'kats-style';
    style.textContent =
      '#kalidad-about-team-slider{position:relative;width:100%;height:clamp(560px,76vh,820px);min-height:560px;background:#fff;overflow:hidden;isolation:isolate;scroll-margin-top:96px;}' +
      '#kalidad-about-team-slider .kats-track{position:relative;width:100%;height:100%;}' +
      '#kalidad-about-team-slider .kats-slide{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;opacity:0;visibility:hidden;transform:translateX(28px);transition:opacity .55s ease,transform .65s cubic-bezier(.22,.61,.36,1),visibility .55s;}' +
      '#kalidad-about-team-slider .kats-slide.is-active{opacity:1;visibility:visible;transform:translateX(0);z-index:2;}' +
      '#kalidad-about-team-slider .kats-copy{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:70px clamp(30px,7vw,110px);background:#fff;}' +
      '#kalidad-about-team-slider .kats-kicker{font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#1E4F3B;margin-bottom:18px;}' +
      '#kalidad-about-team-slider .kats-copy h2{font-family:Lora,serif;font-size:clamp(2.15rem,4.4vw,4.15rem);line-height:1.03;font-weight:800;color:#12291F;margin:0;max-width:650px;}' +
      '#kalidad-about-team-slider .kats-role{margin-top:20px;color:#1E4F3B;font-size:clamp(1rem,1.45vw,1.2rem);font-weight:800;line-height:1.4;max-width:620px;}' +
      '#kalidad-about-team-slider .kats-copy p{margin:20px 0 0;max-width:650px;color:#52645A;font-size:clamp(.95rem,1.28vw,1.08rem);line-height:1.8;}' +
      '#kalidad-about-team-slider .kats-image{position:relative;width:100%;height:100%;min-height:100%;overflow:hidden;background:#eef2ec;}' +
      '#kalidad-about-team-slider .kats-image img{display:block;width:100%;height:100%;min-height:100%;object-fit:cover;object-position:center;}' +
      '#kalidad-about-team-slider .kats-arrow{position:absolute;z-index:10;top:50%;width:52px;height:52px;margin:0;border:1px solid rgba(18,41,31,.13);border-radius:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.94);color:#12291F;font-size:1.35rem;line-height:1;box-shadow:0 12px 30px rgba(18,41,31,.18);cursor:pointer;transition:background .2s ease,transform .2s ease,box-shadow .2s ease;}' +
      '#kalidad-about-team-slider .kats-arrow:hover{background:#C7EF3E;box-shadow:0 15px 34px rgba(18,41,31,.23);}' +
      '#kalidad-about-team-slider .kats-arrow:active{transform:translateY(-50%) scale(.96);}' +
      '#kalidad-about-team-slider .kats-prev{left:20px;}' +
      '#kalidad-about-team-slider .kats-next{right:20px;}' +
      '#kalidad-about-team-slider .kats-dots{position:absolute;z-index:11;left:50%;bottom:20px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:8px 11px;border-radius:999px;background:rgba(18,41,31,.78);backdrop-filter:blur(9px);}' +
      '#kalidad-about-team-slider .kats-dots button{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.52);cursor:pointer;transition:width .25s ease,background .25s ease;}' +
      '#kalidad-about-team-slider .kats-dots button.active{width:24px;border-radius:99px;background:#C7EF3E;}' +
      '@media(max-width:800px){' +
        '#kalidad-about-team-slider{height:780px;min-height:780px;scroll-margin-top:76px;}' +
        '#kalidad-about-team-slider .kats-slide{grid-template-columns:1fr;grid-template-rows:46% 54%;transform:translateY(18px);overflow:hidden;}' +
        '#kalidad-about-team-slider .kats-slide.is-active{transform:translateY(0);}' +
        '#kalidad-about-team-slider .kats-image{grid-row:1;min-height:0;}' +
        '#kalidad-about-team-slider .kats-copy{grid-row:2;padding:38px 27px 72px;justify-content:flex-start;overflow:auto;}' +
        '#kalidad-about-team-slider .kats-copy h2{font-size:clamp(2rem,9vw,3rem);}' +
        '#kalidad-about-team-slider .kats-role{margin-top:14px;font-size:.98rem;}' +
        '#kalidad-about-team-slider .kats-copy p{font-size:.93rem;line-height:1.65;margin-top:15px;}' +
        '#kalidad-about-team-slider .kats-arrow{width:44px;height:44px;top:43%;}' +
        '#kalidad-about-team-slider .kats-prev{left:11px;}' +
        '#kalidad-about-team-slider .kats-next{right:11px;}' +
        '#kalidad-about-team-slider .kats-dots{bottom:13px;max-width:calc(100% - 84px);overflow:hidden;}' +
      '}' +
      '@media(prefers-reduced-motion:reduce){#kalidad-about-team-slider .kats-slide{transition:none;}}';
    document.head.appendChild(style);

    var slideEls = Array.prototype.slice.call(root.querySelectorAll('.kats-slide'));
    var dotEls = Array.prototype.slice.call(root.querySelectorAll('.kats-dots button'));
    var current = 0;
    var timer = null;
    var duration = 6000;

    function show(index, restartTimer) {
      current = (index + slideEls.length) % slideEls.length;
      slideEls.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      dotEls.forEach(function (el, i) {
        var active = i === current;
        el.classList.toggle('active', active);
        el.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (restartTimer) restart();
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1, false); }, duration);
    }

    /* Robustly handle the mobile hero "Meet Our Team" CTA even after the
       original #meet-team section has been replaced by the slider. */
    document.addEventListener('click', function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest('a[href="#meet-team"], a[href$="#meet-team"]') : null;
      if (!link) return;

      var teamSlider = document.getElementById('kalidad-about-team-slider');
      if (!teamSlider) return;

      event.preventDefault();
      var header = document.querySelector('header');
      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var targetTop = teamSlider.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      try {
        history.replaceState(null, '', '#meet-team');
      } catch (ignore) {}
    }, false);

    root.querySelector('.kats-prev').addEventListener('click', function () { show(current - 1, true); });
    root.querySelector('.kats-next').addEventListener('click', function () { show(current + 1, true); });
    dotEls.forEach(function (dot, i) { dot.addEventListener('click', function () { show(i, true); }); });

    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', function () { clearInterval(timer); });
    root.addEventListener('focusout', function () { restart(); });

    restart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
