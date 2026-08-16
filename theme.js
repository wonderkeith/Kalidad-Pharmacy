/* Kalidad Pharmacy — Theme Toggle (light/dark)
   Include on every page: <script src="theme.js" defer></script>
   Works by overriding the same CSS custom properties (--forest, --cream,
   --card, --ink, etc.) that every page already uses, so no per-page CSS
   edits are needed. Persists choice in localStorage and respects the
   visitor's OS preference on first visit.
*/
(function () {
  var STORAGE_KEY = 'kalidad-theme';

  // ---- Dark palette --------------------------------------------------
  // Same variable names every page defines in :root, swapped to dark
  // equivalents that keep contrast/legibility in mind.
  var darkCSS = [
    'html[data-theme="dark"]{',
    '  --forest-deep:#0b1a14;',
    '  --forest:#e8f3ec;', /* used as heading/on-dark ink in several places */
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
    '  color-scheme: dark;',
    '}',
    /* Headings and any text that was previously forced to plain white in
       dark mode now use the brand lime-green as the accent/readable color
       instead, per updated design direction. */
    'html[data-theme="dark"] h1,',
    'html[data-theme="dark"] h2,',
    'html[data-theme="dark"] h3,',
    'html[data-theme="dark"] .font-display{ color:#c7ef3e; }',
    /* Any element whose inline style sets forest-green as the text color
       (color:var(--forest-deep)/--forest-mid/--forest) becomes lime green —
       this is the fix for FAQ questions, labels, timeline text, etc. that
       were showing as near-invisible dark-green-on-dark-green. */
    'html[data-theme="dark"] [style*="color:var(--forest-deep)"],',
    'html[data-theme="dark"] [style*="color:var(--forest-mid)"],',
    'html[data-theme="dark"] [style*="color:var(--forest)"],',
    'html[data-theme="dark"] [style*="color: var(--forest-deep)"],',
    'html[data-theme="dark"] [style*="color: var(--forest-mid)"],',
    'html[data-theme="dark"] [style*="color: var(--forest)"],',
    'html[data-theme="dark"] [style*="color:#fff"],',
    'html[data-theme="dark"] [style*="color: #fff"],',
    'html[data-theme="dark"] [style*="color:white"]{ color:#c7ef3e!important; }',
    /* Same fix for the equivalent rules defined in each page\'s own
       stylesheet (class-based, not inline) — FAQ accordions, timeline
       items, section kickers, form labels, outline buttons, icon badges. */
    'html[data-theme="dark"] .faq-item summary,',
    'html[data-theme="dark"] .info-row .value,',
    'html[data-theme="dark"] .section-head .kicker,',
    'html[data-theme="dark"] .about-copy .kicker,',
    'html[data-theme="dark"] .about-list svg,',
    'html[data-theme="dark"] .timeline-item .year,',
    'html[data-theme="dark"] .timeline-item h4,',
    'html[data-theme="dark"] .contact-form label,',
    'html[data-theme="dark"] .menu,',
    'html[data-theme="dark"] .accent{ color:#c7ef3e!important; }',
    'html[data-theme="dark"] .btn-outline{ border-color:#c7ef3e!important; color:#c7ef3e!important; }',
    'html[data-theme="dark"] .detailed .service-icon,',
    'html[data-theme="dark"] .feature-icon{ color:#c7ef3e!important; }',
    'html[data-theme="dark"] .faq-item p{ color:var(--muted)!important; }',
    /* The active/hovered header nav pill (e.g. "Careers" when selected) has
       a hardcoded light cream background regardless of theme — so its text
       must stay forest-green here, not lime/white, to stay readable. This
       selector is identical on every page, so one rule covers the header
       everywhere. */
    'html[data-theme="dark"] nav.main-nav a.nav-link:hover,',
    'html[data-theme="dark"] nav.main-nav a.nav-link.active,',
    'html[data-theme="dark"] nav.main-nav a.nav-link:focus-visible{ color:#12291F!important; }',
    /* Hero section text (headline, eyebrow, lede paragraph) reads as forest
       green in dark mode rather than lime/white — this overrides the
       general heading-to-lime rule specifically inside hero sections. */
    'html[data-theme="dark"] .hero h1,',
    'html[data-theme="dark"] .hero-reference-copy h1,',
    'html[data-theme="dark"] .hero-copy h1,',
    'html[data-theme="dark"] .hero p,',
    'html[data-theme="dark"] .hero-reference-copy p,',
    'html[data-theme="dark"] .hero-copy p,',
    'html[data-theme="dark"] .eyebrow{ color:#12291F!important; }',
    /* Services page "Explore this service" buttons — lime pill with dark
       text, matching the reference button style, instead of the default
       solid-forest/white-text look. */
    'html[data-theme="dark"] .service-actions .btn.btn-primary{ background:#c7ef3e!important; color:#12291F!important; box-shadow:none!important; }',
    /* Home page "Customer voices" section keeps a light background band
       even in dark mode (by design), so its text needs to stay white
       rather than following the usual dark-mode text colors. */
    'html[data-theme="dark"] .customer-voices-head p,',
    'html[data-theme="dark"] .customer-voice-card blockquote{ color:#ffffff!important; }',
    'html[data-theme="dark"] body{ background:var(--cream); color:var(--ink); }',
    'html[data-theme="dark"] header{ background:rgba(11,26,20,.9)!important; }',
    'html[data-theme="dark"] header.is-scrolled{ background:rgba(11,26,20,.92)!important; box-shadow:0 14px 40px rgba(0,0,0,.45)!important; }',
    /* Cards, panels, footers and other white/near-white surfaces that are
       hardcoded rather than using --card, plus common inline patterns. */
    'html[data-theme="dark"] .card,',
    'html[data-theme="dark"] footer,',
    'html[data-theme="dark"] .service-card,',
    'html[data-theme="dark"] .feature-card,',
    'html[data-theme="dark"] .customer-voice-card,',
    'html[data-theme="dark"] .privacy,',
    'html[data-theme="dark"] .kc-panel,',
    'html[data-theme="dark"] .kc-form{ background:var(--card)!important; color:var(--ink)!important; border-color:var(--line)!important; }',
    'html[data-theme="dark"] .kc-messages,',
    'html[data-theme="dark"] .kc-quick,',
    'html[data-theme="dark"] .kc-links{ background:var(--accent-bg)!important; }',
    'html[data-theme="dark"] .kc-msg.bot{ background:var(--card)!important; color:var(--ink)!important; }',
    'html[data-theme="dark"] .kc-quick button,',
    'html[data-theme="dark"] .kc-form input{ background:var(--card)!important; color:var(--ink)!important; border-color:var(--line)!important; }',
    'html[data-theme="dark"] img{ filter:brightness(.92) contrast(1.03); }',
    /* Elements that explicitly set background:#fff / color:#000 inline or
       via utility classes commonly used on this site. */
    'html[data-theme="dark"] [style*="background:#fff"],',
    'html[data-theme="dark"] [style*="background: #fff"],',
    'html[data-theme="dark"] [style*="background:white"]{ background:var(--card)!important; }',
    'html[data-theme="dark"] [style*="color:#000"],',
    'html[data-theme="dark"] [style*="color: #000"]{ color:var(--ink)!important; }'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'kalidad-theme-dark-overrides';
  style.textContent = darkCSS;
  document.head.appendChild(style);

  // ---- Toggle button ---------------------------------------------------
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
    + '@media(min-width:901px){.kt-toggle-mobile{display:none!important;}}'
    + '.kt-toggle-mobile .kt-icon{font-size:18px;}';
  var btnStyle = document.createElement('style');
  btnStyle.textContent = btnCSS;
  document.head.appendChild(btnStyle);

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    var desktopBtn = document.getElementById('ktToggleBtn');
    if (desktopBtn) {
      desktopBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      desktopBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    var mobileBtn = document.getElementById('ktToggleBtnMobile');
    if (mobileBtn) {
      var icon = mobileBtn.querySelector('.kt-icon');
      var label = mobileBtn.querySelector('.kt-label');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  }

  function initialTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(initialTheme());

  function insertButton() {
    // Desktop / header toggle — hidden below 900px via CSS, since that's
    // where this site swaps the nav for the hamburger menu.
    if (!document.getElementById('ktToggleBtn')) {
      var btn = document.createElement('button');
      btn.id = 'ktToggleBtn';
      btn.type = 'button';
      btn.className = 'kt-toggle kt-toggle-desktop';
      btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
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

    // Mobile toggle — lives inside the hamburger dropdown itself, as a row
    // alongside the nav links, so it doesn't compete for space in the header.
    var mobileMenu = document.getElementById('mobileMenu') || document.querySelector('.mobile-menu');
    if (mobileMenu && !document.getElementById('ktToggleBtnMobile')) {
      var mbtn = document.createElement('button');
      mbtn.id = 'ktToggleBtnMobile';
      mbtn.type = 'button';
      mbtn.className = 'kt-toggle-mobile';
      mbtn.innerHTML = '<span class="kt-icon">' + (currentTheme() === 'dark' ? '☀️' : '🌙') + '</span>' +
        '<span class="kt-label">' + (currentTheme() === 'dark' ? 'Light mode' : 'Dark mode') + '</span>';
      mbtn.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
      mobileMenu.appendChild(mbtn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertButton);
  } else {
    insertButton();
  }
})();
