/**
 * FX Globals – Vanilla JS
 * Mobile menu toggle and smooth scroll
 */

(function () {
  'use strict';

  var navToggle = document.querySelector('.nav-toggle');
  var navMobile = document.querySelector('.nav-mobile');
  var navLinks = document.querySelectorAll('.nav-mobile a');

  // Mobile menu
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navMobile.setAttribute('aria-hidden', !isOpen);
    });

    // Close on link click (nav item) or tap outside
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navMobile.setAttribute('aria-hidden', 'true');
      });
    });

    document.addEventListener('click', function (e) {
      if (navMobile.classList.contains('is-open') &&
          !navMobile.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navMobile.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navMobile.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Smooth scroll for anchor links (complements CSS scroll-behavior)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (target) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
})();
