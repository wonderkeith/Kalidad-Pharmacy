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
      'html[data-theme="dark"] body{color-scheme:light!important;}'
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
