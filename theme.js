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
    '  --accent-bg:#1c3327;',
    '  --accent-fg:#bfe8a0;',
    '  --ink:#eef3ee;',
    '  --muted:#9db3a8;',
    '  --line:#28402f;',
    '  --shadow-soft:0 12px 30px -14px rgba(0,0,0,.55);',
    '  --shadow-card:0 22px 50px -20px rgba(0,0,0,.65);',
    '  color-scheme: dark;',
    '}',
    /* Headings on this site use var(--forest-deep) for color — on dark
       backgrounds that needs to stay light, not near-black. Re-fix the
       common heading/selector patterns explicitly. */
    'html[data-theme="dark"] h1,',
    'html[data-theme="dark"] h2,',
    'html[data-theme="dark"] h3,',
    'html[data-theme="dark"] .font-display{ color:#f2f7f3; }',
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
    'html[data-theme="dark"] .btn-outline{ border-color:var(--line)!important; color:var(--ink)!important; }',
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
    + '@media(max-width:600px){.kt-toggle{width:36px;height:36px;font-size:16px;}}';
  var btnStyle = document.createElement('style');
  btnStyle.textContent = btnCSS;
  document.head.appendChild(btnStyle);

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    var btn = document.getElementById('ktToggleBtn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function initialTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(initialTheme());

  function insertButton() {
    if (document.getElementById('ktToggleBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'ktToggleBtn';
    btn.type = 'button';
    btn.className = 'kt-toggle';
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertButton);
  } else {
    insertButton();
  }
})();
