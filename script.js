(function(){
  /* mobile menu */
  var toggle = document.getElementById('menuToggle');
  var menu = document.getElementById('mobileMenu');
  if(toggle && menu){
    toggle.addEventListener('click', function(){
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* hero slider (home page only) */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var dotsWrap = document.getElementById('sliderDots');
  if(slides.length && dotsWrap){
    var current = 0, timer;
    slides.forEach(function(_, i){
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to slide ' + (i+1));
      if(i===0) b.classList.add('active');
      b.addEventListener('click', function(){ goTo(i); resetTimer(); });
      dotsWrap.appendChild(b);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(i){
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    function next(){ goTo(current+1); }
    function prev(){ goTo(current-1); }
    function resetTimer(){ clearInterval(timer); timer = setInterval(next, 5000); }

    var nextBtn = document.getElementById('nextBtn');
    var prevBtn = document.getElementById('prevBtn');
    if(nextBtn) nextBtn.addEventListener('click', function(){ next(); resetTimer(); });
    if(prevBtn) prevBtn.addEventListener('click', function(){ prev(); resetTimer(); });
    resetTimer();
  }

  /* scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, {threshold:.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* contact form (no backend — hands off to WhatsApp) */
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Message ready — opening WhatsApp…';
      var name = document.getElementById('name').value;
      var message = document.getElementById('message').value;
      var text = encodeURIComponent('Hello Kalidad Pharmacy, my name is ' + name + '. ' + message);
      setTimeout(function(){
        window.open('https://wa.me/256764201229?text=' + text, '_blank');
        btn.textContent = original;
        form.reset();
      }, 500);
    });
  }
})();
