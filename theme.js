/* Kalidad Pharmacy — Theme Toggle (light/dark)
   Include on every page: <script src="theme.js" defer></script>
   Persists the selected theme in localStorage and respects OS preference
   when no saved theme exists.
*/

(function () {
  var STORAGE_KEY = 'kalidad-theme';

  /* ============================================================
     DARK MODE
     ============================================================ */

  var darkCSS = [
    'html[data-theme="dark"]{',
    '  --forest-deep:#0b1a14;',
    '  --forest:#e8f3ec;',
    '  --forest-mid:#3a7a5a;',
    '  --lime:#c7ef3e;',
    '  --lime-deep:#8fb824;',
    '  --cream:#11201a;',
    '  --card:#182b23;',
    '  --accent-bg:#000000;',
    '  --accent-fg:#ffffff;',
    '  --ink:#eef3ee;',
    '  --muted:#9db3a8;',
    '  --line:#28402f;',
    '  --shadow-soft:0 12px 30px -14px rgba(0,0,0,.55);',
    '  --shadow-card:0 22px 50px -20px rgba(0,0,0,.65);',
    '  color-scheme:dark;',
    '}',

    /* Dark headings */
    'html[data-theme="dark"] h1,',
    'html[data-theme="dark"] h2,',
    'html[data-theme="dark"] h3,',
    'html[data-theme="dark"] .font-display{color:#c7ef3e;}',

    /* Inline forest colors */
    'html[data-theme="dark"] [style*="color:var(--forest-deep)"],',
    'html[data-theme="dark"] [style*="color:var(--forest-mid)"],',
    'html[data-theme="dark"] [style*="color:var(--forest)"],',
    'html[data-theme="dark"] [style*="color: var(--forest-deep)"],',
    'html[data-theme="dark"] [style*="color: var(--forest-mid)"],',
    'html[data-theme="dark"] [style*="color: var(--forest)"],',
    'html[data-theme="dark"] [style*="color:#fff"],',
    'html[data-theme="dark"] [style*="color: #fff"],',
    'html[data-theme="dark"] [style*="color:white"]{color:#c7ef3e!important;}',

    /* Common dark text */
    'html[data-theme="dark"] .faq-item summary,',
    'html[data-theme="dark"] .info-row .value,',
    'html[data-theme="dark"] .section-head .kicker,',
    'html[data-theme="dark"] .about-copy .kicker,',
    'html[data-theme="dark"] .about-list svg,',
    'html[data-theme="dark"] .timeline-item .year,',
    'html[data-theme="dark"] .timeline-item h4,',
    'html[data-theme="dark"] .contact-form label,',
    'html[data-theme="dark"] .menu,',
    'html[data-theme="dark"] .accent{color:#c7ef3e!important;}',

    'html[data-theme="dark"] .btn-outline{border-color:#c7ef3e!important;color:#c7ef3e!important;}',

    'html[data-theme="dark"] .detailed .service-icon,',
    'html[data-theme="dark"] .feature-icon{color:#c7ef3e!important;}',

    'html[data-theme="dark"] .faq-item p{color:var(--muted)!important;}',

    /* ============================================================
       DESKTOP HEADER — DARK
       ============================================================ */

    'html[data-theme="dark"] nav.main-nav a.nav-link{color:#fff!important;}',

    'html[data-theme="dark"] nav.main-nav a.nav-link:hover,',
    'html[data-theme="dark"] nav.main-nav a.nav-link.active,',
    'html[data-theme="dark"] nav.main-nav a.nav-link:focus-visible{color:#12291f!important;}',

    'html[data-theme="dark"] header .pulse-dot{background:#fff!important;}',

    'html[data-theme="dark"] header .kt-toggle{color:#12291f!important;}',

    /* ============================================================
       MOBILE HEADER — SAME VISUAL LANGUAGE AS CAREERS
       ============================================================ */

    /* Light-mode menu button */
    'html:not([data-theme="dark"]) header .menu-toggle{',
    '  background:rgba(255,255,255,.55)!important;',
    '  color:var(--forest)!important;',
    '  border-color:rgba(22,52,39,.35)!important;',
    '}',

    /* Light-mode mobile menu */
    'html:not([data-theme="dark"]) header .mobile-menu{',
    '  background:rgba(246,244,236,.96)!important;',
    '  color:var(--forest)!important;',
    '  border-top-color:rgba(223,229,223,.75)!important;',
    '}',

    'html:not([data-theme="dark"]) header .mobile-menu a{',
    '  color:var(--forest)!important;',
    '}',

    'html:not([data-theme="dark"]) header .mobile-menu a:hover,',
    'html:not([data-theme="dark"]) header .mobile-menu a:focus-visible,',
    'html:not([data-theme="dark"]) header .mobile-menu a.active{',
    '  background:#e8f4d8!important;',
    '  color:#006837!important;',
    '}',

    /* Dark-mode menu button */
    'html[data-theme="dark"] header .menu-toggle{',
    '  background:var(--forest)!important;',
    '  color:#fff!important;',
    '  border-color:rgba(255,255,255,.28)!important;',
    '}',

    /* Dark-mode mobile menu */
    'html[data-theme="dark"] header .mobile-menu{',
    '  background:rgba(11,26,20,.96)!important;',
    '  color:#fff!important;',
    '  border-top-color:rgba(255,255,255,.14)!important;',
    '  box-shadow:0 14px 38px rgba(0,0,0,.45)!important;',
    '}',

    'html[data-theme="dark"] header .mobile-menu a{',
    '  color:#fff!important;',
    '}',

    'html[data-theme="dark"] header .mobile-menu a:hover,',
    'html[data-theme="dark"] header .mobile-menu a:focus-visible,',
    'html[data-theme="dark"] header .mobile-menu a.active{',
    '  background:rgba(232,244,216,.14)!important;',
    '  color:var(--lime)!important;',
    '}',

    /* Hero */
    'html[data-theme="dark"] .hero h1,',
    'html[data-theme="dark"] .hero-reference-copy h1,',
    'html[data-theme="dark"] .hero-copy h1,',
    'html[data-theme="dark"] .hero p,',
    'html[data-theme="dark"] .hero-reference-copy p,',
    'html[data-theme="dark"] .hero-copy p,',
    'html[data-theme="dark"] .eyebrow{color:#12291f!important;}',

    /* Services */
    'html[data-theme="dark"] .service-actions .btn.btn-primary,',
    'html[data-theme="dark"] .explore-wrap .btn.btn-primary{background:#c7ef3e!important;color:#12291f!important;box-shadow:none!important;}',

    'html[data-theme="dark"] .btn-lime{color:#12291f!important;}',

    'html[data-theme="dark"] .service-panel .service-content h3,',
    'html[data-theme="dark"] .service-panel .service-lead{color:#fff!important;}',

    'html[data-theme="dark"] .service-panel:nth-child(even){background:#182b23!important;}',

    'html[data-theme="dark"] .service-content > p:not(.service-lead),',
    'html[data-theme="dark"] .service-content li{color:#fff!important;}',

    'html[data-theme="dark"] .service-nav-item,',
    'html[data-theme="dark"] .service-nav-item:hover,',
    'html[data-theme="dark"] .service-nav-item:focus-visible,',
    'html[data-theme="dark"] .service-nav-item.is-active{color:#c7ef3e!important;}',

    /* Stats */
    'html[data-theme="dark"] .stats-band{background:linear-gradient(155deg,#1e4f3b 0%,#12291f 100%)!important;}',

    /* Feature section */
    'html[data-theme="dark"] .features-reference{background:#1e4f3b!important;}',
    'html[data-theme="dark"] .features-reference-card{border-color:rgba(255,255,255,.14)!important;}',
    'html[data-theme="dark"] .features-reference-icon{color:#c7ef3e!important;}',

    'html[data-theme="dark"] .features-reference-card h3,',
    'html[data-theme="dark"] .features-reference-card p{color:#fff!important;}',

    /* Customer voices */
    'html[data-theme="dark"] .customer-voices{background:linear-gradient(155deg,#1e4f3b 0%,#12291f 100%)!important;}',

    'html[data-theme="dark"] .customer-voice-card cite{color:#c7ef3e!important;}',
    'html[data-theme="dark"] .customer-voice-card .voice-source{color:#fff!important;}',

    'html[data-theme="dark"] .customer-voice-card{',
    '  background:rgba(255,255,255,.07);',
    '  border:1px solid rgba(255,255,255,.16);',
    '  border-radius:20px;',
    '  padding:24px 18px 20px;',
    '  -webkit-backdrop-filter:blur(10px);',
    '  backdrop-filter:blur(10px);',
    '}',

    /* Contact */
    'html[data-theme="dark"] .nav-chat{background:#1e4f3b!important;color:#fff!important;}',

    /* About */
    'html[data-theme="dark"] .mission-section{background:var(--cream)!important;}',

    'html[data-theme="dark"] .mission-stats{background:#182b23!important;border-color:#28402f!important;}',
    'html[data-theme="dark"] .mission-stats strong{color:#c7ef3e!important;}',
    'html[data-theme="dark"] .mission-stats span{color:#fff!important;}',
    'html[data-theme="dark"] .mission-stats small{color:#fff!important;}',

    /* Services order button */
    'html[data-theme="dark"] nav.main-nav > a.nav-cta{background:#1e4f3b!important;color:#fff!important;}',

    /* News */
    'html[data-theme="dark"] .news-feature,',
    'html[data-theme="dark"] .news-card{background:#182b23!important;border-color:#28402f!important;}',

    'html[data-theme="dark"] .news-feature h2,',
    'html[data-theme="dark"] .news-feature p,',
    'html[data-theme="dark"] .article-meta,',
    'html[data-theme="dark"] .article-meta .category,',
    'html[data-theme="dark"] .read-more,',
    'html[data-theme="dark"] .news-card h3,',
    'html[data-theme="dark"] .news-card p{color:#fff!important;}',

    /* Contact information */
    'html[data-theme="dark"] .contact-info,',
    'html[data-theme="dark"] .branch-copy{background:linear-gradient(155deg,#1e4f3b 0%,#12291f 100%)!important;}',

    'html[data-theme="dark"] .branch-copy p,',
    'html[data-theme="dark"] .branch-copy .branch-note{color:#fff!important;}',

    'html[data-theme="dark"] .branch-copy .kicker{color:#c7ef3e!important;}',

    'html[data-theme="dark"] .contact-info > a.btn{color:#12291f!important;}',

    'html[data-theme="dark"] .contact-form button.btn-primary{background:#c7ef3e!important;color:#12291f!important;}',

    'html[data-theme="dark"] .customer-voices-head p,',
    'html[data-theme="dark"] .customer-voice-card blockquote{color:#fff!important;}',

    /* Body / header */
    'html[data-theme="dark"] body{background:var(--cream);color:var(--ink);}',
    'html[data-theme="dark"] header{background:rgba(11,26,20,.9)!important;}',
    'html[data-theme="dark"] header.is-scrolled{background:rgba(11,26,20,.92)!important;box-shadow:0 14px 40px rgba(0,0,0,.45)!important;}',

    /* Cards */
    'html[data-theme="dark"] .card,',
    'html[data-theme="dark"] footer,',
    'html[data-theme="dark"] .service-card,',
    'html[data-theme="dark"] .feature-card,',
    'html[data-theme="dark"] .customer-voice-card,',
    'html[data-theme="dark"] .privacy,',
    'html[data-theme="dark"] .kc-panel,',
    'html[data-theme="dark"] .kc-form{background:var(--card)!important;color:var(--ink)!important;border-color:var(--line)!important;}',

    /* Chatbot */
    'html[data-theme="dark"] .kc-messages,',
    'html[data-theme="dark"] .kc-quick,',
    'html[data-theme="dark"] .kc-links{background:var(--accent-bg)!important;}',

    'html[data-theme="dark"] .kc-msg.bot{background:var(--card)!important;color:var(--ink)!important;}',

    'html[data-theme="dark"] .kc-quick button,',
    'html[data-theme="dark"] .kc-form input{background:var(--card)!important;color:var(--ink)!important;border-color:var(--line)!important;}',

    /* Images */
    'html[data-theme="dark"] img{filter:brightness(.92) contrast(1.03);}',

    /* Inline white backgrounds */
    'html[data-theme="dark"] [style*="background:#fff"],',
    'html[data-theme="dark"] [style*="background: #fff"],',
    'html[data-theme="dark"] [style*="background:white"]{background:var(--card)!important;}',

    /* Inline black text */
    'html[data-theme="dark"] [style*="color:#000"],',
    'html[data-theme="dark"] [style*="color: #000"]{color:var(--ink)!important;}'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'kalidad-theme-dark-overrides';
  style.textContent = darkCSS;
  document.head.appendChild(style);

  /* ============================================================
     THEME TOGGLE BUTTONS
     ============================================================ */

  var btnCSS = ''
    + '.kt-toggle{display:inline-flex;align-items:center;justify-content:center;'
    + 'width:40px;height:40px;border-radius:50%;border:1px solid var(--line);'
    + 'background:var(--card);color:var(--ink);cursor:pointer;margin-left:10px;'
    + 'font-size:18px;line-height:1;transition:background .2s ease,transform .2s ease;flex:none;}'

    + '.kt-toggle:hover{transform:translateY(-1px);}'

    + '@media(max-width:900px){.kt-toggle-desktop{display:none!important;}}'

    + '.kt-toggle-mobile{display:flex;align-items:center;gap:10px;width:100%;'
    + 'padding:12px 8px;border-radius:10px;font-weight:600;border:none;background:none;'
    + 'color:var(--ink);cursor:pointer;font:inherit;text-align:left;font-size:16px;}'

    + '.kt-toggle-mobile:hover{background:var(--accent-bg);}'

    + 'html[data-theme="dark"] .kt-toggle-mobile{color:#fff!important;background:transparent!important;}'

    + '@media(min-width:901px){.kt-toggle-mobile{display:none!important;}}'

    + '.kt-toggle-mobile .kt-icon{font-size:18px;}';

  var btnStyle = document.createElement('style');
  btnStyle.textContent = btnCSS;
  document.head.appendChild(btnStyle);

  /* ============================================================
     HELPERS
     ============================================================ */

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }

  function safeGetStorage(key) {
    try {
      return window.localStorage
        ? window.localStorage.getItem(key)
        : null;
    } catch (e) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      /* Theme still works for this page view. */
    }
  }

  /* ============================================================
     APPLY THEME
     ============================================================ */

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    safeSetStorage(STORAGE_KEY, theme);

    var desktopBtn = document.getElementById('ktToggleBtn');

    if (desktopBtn) {
      desktopBtn.textContent = theme === 'dark' ? '☀️' : '🌙';

      desktopBtn.setAttribute(
        'aria-label',
        theme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      );
    }

    var mobileBtn = document.getElementById('ktToggleBtnMobile');

    if (mobileBtn) {
      var icon = mobileBtn.querySelector('.kt-icon');
      var label = mobileBtn.querySelector('.kt-label');

      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }

      if (label) {
        label.textContent =
          theme === 'dark'
            ? 'Light mode'
            : 'Dark mode';
      }
    }
  }

  /* ============================================================
     INITIAL THEME
     ============================================================ */

  function initialTheme() {
    var saved = safeGetStorage(STORAGE_KEY);

    if (saved === 'dark' || saved === 'light') {
      return saved;
    }

    try {
      return window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (e) {
      return 'light';
    }
  }

  applyTheme(initialTheme());

  /* ============================================================
     INSERT THEME BUTTONS
     ============================================================ */

  function insertButton() {

    /* ---------------- Desktop toggle ---------------- */

    if (!document.getElementById('ktToggleBtn')) {

      var btn = document.createElement('button');

      btn.id = 'ktToggleBtn';
      btn.type = 'button';
      btn.className = 'kt-toggle kt-toggle-desktop';

      btn.textContent =
        currentTheme() === 'dark'
          ? '☀️'
          : '🌙';

      btn.setAttribute(
        'aria-label',
        currentTheme() === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      );

      btn.addEventListener('click', function () {
        applyTheme(
          currentTheme() === 'dark'
            ? 'light'
            : 'dark'
        );
      });

      var host =
        document.querySelector('.header-inner') ||
        document.querySelector('nav.main-nav') ||
        document.querySelector('header');

      if (host) {
        host.appendChild(btn);
      } else {
        btn.style.position = 'fixed';
        btn.style.top = '16px';
        btn.style.right = '16px';
        btn.style.zIndex = '1001';

        document.body.appendChild(btn);
      }
    }

    /* ---------------- Mobile toggle ---------------- */

    var mobileMenu =
      document.getElementById('mobileMenu') ||
      document.querySelector('.mobile-menu');

    if (
      mobileMenu &&
      !document.getElementById('ktToggleBtnMobile')
    ) {

      var mbtn = document.createElement('button');

      mbtn.id = 'ktToggleBtnMobile';
      mbtn.type = 'button';
      mbtn.className = 'kt-toggle-mobile';

      mbtn.innerHTML =
        '<span class="kt-icon">' +
        (currentTheme() === 'dark' ? '☀️' : '🌙') +
        '</span>' +

        '<span class="kt-label">' +
        (currentTheme() === 'dark'
          ? 'Light mode'
          : 'Dark mode') +
        '</span>';

      mbtn.addEventListener('click', function () {
        applyTheme(
          currentTheme() === 'dark'
            ? 'light'
            : 'dark'
        );
      });

      mobileMenu.appendChild(mbtn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      insertButton
    );
  } else {
    insertButton();
  }

})();
