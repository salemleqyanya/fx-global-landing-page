// JavaScript for FX Global Packages Landing Page

document.addEventListener('DOMContentLoaded', function() {
  setupMobileNavigation();
  setupRevealAnimations();
  setupPricingButtons();
  setupSmoothScroll();
});

// Mobile Navigation
function setupMobileNavigation() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !mobileNav) return;

  const iconOpen = toggle.querySelector('[data-icon-open]');
  const iconClose = toggle.querySelector('[data-icon-close]');

  const setState = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    mobileNav.classList.toggle('is-open', isOpen);
    if (iconOpen && iconClose) {
      iconOpen.classList.toggle('hidden', isOpen);
      iconClose.classList.toggle('hidden', !isOpen);
    }
    document.body.classList.toggle('overflow-hidden', isOpen);
  };

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    setState(!isOpen);
  });

  mobileNav.querySelectorAll('[data-close-mobile]').forEach((link) => {
    link.addEventListener('click', () => setState(false));
  });
}

// Reveal Animations
function setupRevealAnimations() {
  const animatedElements = document.querySelectorAll('.fade-up');
  if (!animatedElements.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((el) => observer.observe(el));
}

// Pricing Buttons
function setupPricingButtons() {
  const pricingButtons = document.querySelectorAll('.pricing-btn');
  
  pricingButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Open payment link in new tab
      window.open('https://pay.lahza.io/CIQFe-0dtI', '_blank');
    });
  });
}

// Smooth Scroll
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Optional: Add scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-delay, .fade-in-delay-2, .fade-in-scale');
  animatedElements.forEach(el => {
    observer.observe(el);
  });
});
