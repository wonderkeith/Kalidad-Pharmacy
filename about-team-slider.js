/* Kalidad Pharmacy — About page team image slider
   Controls the existing #meet-team image area only.
   Two empty image slots are intentionally preserved for future images.
   Auto-advance: 5 seconds.
*/
(function () {
  'use strict';

  function init() {
    var section = document.querySelector('#meet-team.team-section, .team-section#meet-team');
    if (!section) return;

    var slider = section.querySelector('.team-image-slider');
    if (!slider) return;

    /* Prevent duplicate execution if this script is included more than once. */
    if (slider.dataset.teamSliderReady === 'true') return;
    slider.dataset.teamSliderReady = 'true';

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.team-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.team-slider-dots button'));
    var prev = slider.querySelector('.team-slider-prev');
    var next = slider.querySelector('.team-slider-next');

    if (slides.length !== 2) return;

    var current = 0;
    var timer = null;
    var duration = 5000;

    function show(index, restartTimer) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      if (restartTimer) restart();
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1, false);
      }, duration);
    }

    if (prev) prev.addEventListener('click', function () { show(current - 1, true); });
    if (next) next.addEventListener('click', function () { show(current + 1, true); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i, true); });
    });

    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);
    slider.addEventListener('focusin', function () { clearInterval(timer); });
    slider.addEventListener('focusout', restart);

    show(0, false);
    restart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
