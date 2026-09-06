/* Kalidad Pharmacy — Light-only theme controller
   Dark mode has been permanently removed sitewide.
   Kept as a compatibility layer for pages that still include theme.js.
*/

(function () {
  'use strict';

  var STORAGE_KEY = 'kalidad-theme';

  function removeLegacyThemeState() {
    try {
      if (window.localStorage) window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function enforceLightMode() {
    var root = document.documentElement;
    var body = document.body;

    if (root) {
      if (root.getAttribute('data-theme') !== 'light') {
        root.setAttribute('data-theme', 'light');
      }
      root.classList.remove('dark', 'dark-mode', 'theme-dark');
      root.style.colorScheme = 'light';
    }

    if (body) {
      body.classList.remove('dark', 'dark-mode', 'theme-dark');
    }
  }

  function injectLightOnlyGuard() {
    if (document.getElementById('kalidad-light-only-guard')) return;

    var style = document.createElement('style');
    style.id = 'kalidad-light-only-guard';
    style.textContent = [
      ':root{color-scheme:light!important;}',
      'html,html[data-theme="dark"]{color-scheme:light!important;}',
      'html[data-theme="dark"] body{color-scheme:light!important;}',
      'html body header{color-scheme:light!important;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function injectAboutHeaderLightOverride() {
    if (!/about\.html$/i.test(window.location.pathname)) return;
    if (document.getElementById('kalidad-about-light-header-guard')) return;

    var style = document.createElement('style');
    style.id = 'kalidad-about-light-header-guard';
    style.textContent = [
      'html[data-theme="light"] header,',
      'html[data-theme="dark"] header{',
      '  background:rgba(246,244,236,.96)!important;',
      '  color:#163427!important;',
      '  border-color:rgba(223,229,223,.85)!important;',
      '  box-shadow:0 10px 28px rgba(18,41,31,.12)!important;',
      '}',
      'html[data-theme="light"] header .header-inner,',
      'html[data-theme="dark"] header .header-inner{',
      '  background:transparent!important;',
      '}',
      'html[data-theme="light"] header .menu-toggle,',
      'html[data-theme="dark"] header .menu-toggle{',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  background:rgba(255,255,255,.72)!important;',
      '  color:#163427!important;',
      '  border:1.5px solid rgba(22,52,39,.35)!important;',
      '  box-shadow:none!important;',
      '}',
      'html[data-theme="light"] header .mobile-menu,',
      'html[data-theme="dark"] header .mobile-menu{',
      '  background:rgba(246,244,236,.98)!important;',
      '  color:#163427!important;',
      '  border-top-color:rgba(223,229,223,.85)!important;',
      '  box-shadow:0 14px 36px rgba(18,41,31,.16)!important;',
      '}',
      'html[data-theme="light"] header .mobile-menu a,',
      'html[data-theme="dark"] header .mobile-menu a{',
      '  color:#163427!important;',
      '}',
      'html[data-theme="light"] header .mobile-menu a:hover,',
      'html[data-theme="light"] header .mobile-menu a:focus-visible,',
      'html[data-theme="light"] header .mobile-menu a.active,',
      'html[data-theme="dark"] header .mobile-menu a:hover,',
      'html[data-theme="dark"] header .mobile-menu a:focus-visible,',
      'html[data-theme="dark"] header .mobile-menu a.active{',
      '  background:#e8f4d8!important;',
      '  color:#006837!important;',
      '}',
      'html[data-theme="light"] header nav.main-nav a.nav-link,',
      'html[data-theme="dark"] header nav.main-nav a.nav-link{',
      '  color:#17372a!important;',
      '}',
      'html[data-theme="light"] header nav.main-nav a.nav-link:hover,',
      'html[data-theme="dark"] header nav.main-nav a.nav-link:hover,',
      'html[data-theme="light"] header nav.main-nav a.nav-link.active,',
      'html[data-theme="dark"] header nav.main-nav a.nav-link.active{',
      '  color:#17372a!important;',
      '  background:rgba(239,247,233,.92)!important;',
      '}',
      '@media(max-width:900px){',
      '  html[data-theme="light"] header,html[data-theme="dark"] header{',
      '    background:rgba(246,244,236,.96)!important;',
      '  }',
      '  html[data-theme="light"] header .mobile-menu,html[data-theme="dark"] header .mobile-menu{',
      '    background:rgba(246,244,236,.98)!important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function removeLegacyToggleControls() {
    [
      '#ktToggleBtn',
      '#ktToggleBtnMobile',
      '.kt-toggle',
      '.kt-toggle-desktop',
      '.kt-toggle-mobile',
      '[data-theme-toggle]',
      '[aria-label="Switch to dark mode"]',
      '[aria-label="Switch to light mode"]'
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.remove();
      });
    });
  }

  function stripThemeUI() {
    removeLegacyThemeState();
    enforceLightMode();
    injectLightOnlyGuard();
    injectAboutHeaderLightOverride();
    removeLegacyToggleControls();
  }

  function start() {
    stripThemeUI();

    if ('MutationObserver' in window && document.documentElement) {
      var observer = new MutationObserver(function (mutations) {
        var needsLightEnforcement = false;

        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            needsLightEnforcement = true;
          }
        });

        if (needsLightEnforcement) enforceLightMode();
        removeLegacyToggleControls();
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
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