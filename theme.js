/* Kalidad Pharmacy — LIGHT ONLY theme controller
   Dark mode is permanently disabled sitewide.
   This controller also neutralizes legacy dark/mobile header CSS. */
(function () {
  'use strict';

  var STORAGE_KEY = 'kalidad-theme';
  var ABOUT_PAGE = /about\.html$/i.test(window.location.pathname);

  function removeLegacyThemeState() {
    try {
      if (window.localStorage) window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function enforceLightMode() {
    var root = document.documentElement;
    var body = document.body;

    if (root) {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark', 'dark-mode', 'theme-dark');
      root.style.setProperty('color-scheme', 'light', 'important');
    }

    if (body) {
      body.classList.remove('dark', 'dark-mode', 'theme-dark');
      body.style.setProperty('color-scheme', 'light', 'important');
    }
  }

  function removeLegacyToggleControls() {
    [
      '#ktToggleBtn', '#ktToggleBtnMobile', '.kt-toggle',
      '.kt-toggle-desktop', '.kt-toggle-mobile', '[data-theme-toggle]',
      '[aria-label="Switch to dark mode"]',
      '[aria-label="Switch to light mode"]'
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) { el.remove(); });
    });
  }

  function removeAboutConflictingStyles() {
    if (!ABOUT_PAGE) return;

    [
      'about-reference-header-final',
      'about-mobile-final-rework',
      'careers-matched-mobile-header'
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function injectLightGuard() {
    var id = 'kalidad-light-only-guard-v3';
    if (document.getElementById(id)) return;

    var style = document.createElement('style');
    style.id = id;
    style.textContent = [
      ':root{color-scheme:light!important;}',
      'html,html[data-theme="dark"],html[data-theme="light"]{color-scheme:light!important;}',
      'html body{color-scheme:light!important;}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function injectAboutLightHeader() {
    if (!ABOUT_PAGE) return;

    var id = 'kalidad-about-header-light-v3';
    var old = document.getElementById(id);
    if (old) old.remove();

    var style = document.createElement('style');
    style.id = id;
    style.textContent = [
      '/* Final About header: identical light behavior to Careers/mobile reference. */',
      'header,html[data-theme="light"] header,html[data-theme="dark"] header{',
      '  background:rgba(246,244,236,.96)!important;',
      '  color:#1E4F3B!important;',
      '  border:1px solid rgba(223,229,223,.85)!important;',
      '  box-shadow:0 12px 30px rgba(18,41,31,.12)!important;',
      '}',
      'header .header-inner{background:transparent!important;color:#1E4F3B!important;}',
      'header .logo{opacity:1!important;visibility:visible!important;}',
      'header .menu-toggle{',
      '  display:flex!important;align-items:center!important;justify-content:center!important;',
      '  background:rgba(255,255,255,.55)!important;',
      '  color:#1E4F3B!important;',
      '  border:1.5px solid rgba(22,52,39,.35)!important;',
      '  box-shadow:none!important;',
      '}',
      'header .menu-toggle svg{color:#1E4F3B!important;stroke:#1E4F3B!important;}',
      'header .mobile-menu{',
      '  background:rgba(246,244,236,.98)!important;',
      '  color:#1E4F3B!important;',
      '  border-top:1px solid rgba(223,229,223,.85)!important;',
      '  box-shadow:0 14px 38px rgba(18,41,31,.18)!important;',
      '}',
      'header .mobile-menu a{',
      '  color:#1E4F3B!important;background:transparent!important;',
      '}',
      'header .mobile-menu a:hover,header .mobile-menu a:focus-visible,header .mobile-menu a.active{',
      '  background:#E8F4D8!important;color:#006837!important;',
      '}',
      '@media(max-width:900px){',
      '  header{top:9px!important;left:50%!important;right:auto!important;',
      '    transform:translateX(-50%)!important;width:calc(100% - 18px)!important;',
      '    height:66px!important;border-radius:18px!important;overflow:visible!important;',
      '    background:rgba(246,244,236,.96)!important;',
      '    border:1px solid rgba(223,229,223,.85)!important;',
      '  }',
      '  header .header-inner{height:64px!important;padding:0 12px!important;}',
      '  header .menu-toggle{width:46px!important;height:46px!important;min-width:46px!important;',
      '    flex:0 0 46px!important;border-radius:12px!important;',
      '    background:rgba(255,255,255,.55)!important;color:#1E4F3B!important;',
      '    border:1.5px solid rgba(22,52,39,.35)!important;',
      '  }',
      '  header .menu-toggle svg{width:28px!important;height:28px!important;stroke:#1E4F3B!important;}',
      '  header .mobile-menu{top:66px!important;width:100%!important;',
      '    background:rgba(246,244,236,.98)!important;color:#1E4F3B!important;',
      '    border-top:1px solid rgba(223,229,223,.85)!important;',
      '  }',
      '  header.menu-open{background:rgba(246,244,236,.98)!important;border-radius:18px!important;}',
      '}',
      '@media(max-width:430px){',
      '  header .menu-toggle{width:46px!important;height:46px!important;min-width:46px!important;}',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function apply() {
    removeLegacyThemeState();
    enforceLightMode();
    removeLegacyToggleControls();
    removeAboutConflictingStyles();
    injectLightGuard();
    injectAboutLightHeader();
  }

  function start() {
    apply();

    if ('MutationObserver' in window && document.documentElement) {
      var observer = new MutationObserver(function () {
        apply();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();