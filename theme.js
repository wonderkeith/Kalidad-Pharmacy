/* Kalidad Pharmacy — Light-only theme controller
   Dark mode has been permanently removed sitewide.
   This file is intentionally kept as a compatibility layer for pages
   that still include <script src="theme.js" defer></script>.
*/

(function () {
  'use strict';

  var STORAGE_KEY = 'kalidad-theme';

  function removeLegacyThemeState() {
    try {
      if (window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      /* Ignore storage restrictions. */
    }
  }

  function enforceLightMode() {
    var root = document.documentElement;
    var body = document.body;

    if (root) {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark', 'dark-mode', 'theme-dark');
      root.style.colorScheme = 'light';
    }

    if (body) {
      body.classList.remove('dark', 'dark-mode', 'theme-dark');
    }
  }

  function injectLightModeGuard() {
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
    var selectors = [
      '#ktToggleBtn',
      '#ktToggleBtnMobile',
      '.kt-toggle',
      '.kt-toggle-desktop',
      '.kt-toggle-mobile',
      '[data-theme-toggle]',
      '[aria-label="Switch to dark mode"]',
      '[aria-label="Switch to light mode"]'
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.remove();
      });
    });
  }

  function stripThemeUI() {
    removeLegacyThemeState();
    enforceLightMode();
    injectLightModeGuard();
    removeLegacyToggleControls();
  }

  function start() {
    stripThemeUI();

    /* Protect against another legacy script re-applying a dark theme. */
    if ('MutationObserver' in window && document.documentElement) {
      var observer = new MutationObserver(function () {
        var root = document.documentElement;
        if (root.getAttribute('data-theme') !== 'light') {
          enforceLightMode();
        }
        removeLegacyToggleControls();
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class', 'style'],
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
