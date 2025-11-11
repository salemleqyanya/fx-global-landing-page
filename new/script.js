document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavigation();
  setupRevealAnimations();
  setupHeroVideoObserver();
  setupVipCounter();
  setupGalleryLightbox();
  setupRegistrationForm();
});

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

function setupRevealAnimations() {
  const animatedElements = document.querySelectorAll('.fade-up, .fade-in, .scale-in');
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

function setupHeroVideoObserver() {
  const iframe = document.querySelector('[data-hero-video]');
  if (!iframe || !('IntersectionObserver' in window)) return;

  const playerOrigin = new URL(iframe.src).origin;

  const postMessage = (command) => {
    iframe.contentWindow?.postMessage(JSON.stringify({ method: command }), playerOrigin);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          postMessage('play');
        } else {
          postMessage('pause');
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(iframe);
}

function setupVipCounter() {
  const counterEl = document.querySelector('[data-counter]');
  const progressFill = document.querySelector('[data-progress-bar]');
  const progressLabel = document.querySelector('[data-progress-label]');
  if (!counterEl || !progressFill || !progressLabel || !('IntersectionObserver' in window)) return;

  const target = parseInt(counterEl.dataset.target || '0', 10);
  if (!target) return;

  let animated = false;

  const animate = () => {
    if (animated) return;
    animated = true;

    const duration = 2200;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = Math.min(now - startTime, duration);
      const progress = elapsed / duration;
      const eased = easeOutCubic(progress);
      const currentValue = Math.round(target * eased);

      counterEl.textContent = `+${currentValue.toLocaleString('en-US')}`;

      const percent = Math.min(100, Math.round((currentValue / target) * 100));
      progressFill.style.width = `${percent}%`;
      progressLabel.textContent = `${percent}% مكتمل`;

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(counterEl);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function setupGalleryLightbox() {
  const cards = document.querySelectorAll('[data-gallery-card]');
  const overlayRoot = document.getElementById('gallery-overlay-root');
  if (!cards.length || !overlayRoot) return;

  const createOverlay = (src, title) => {
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay fade-in';
    overlay.innerHTML = `
      <div class="gallery-overlay__content scale-in">
        <button type="button" class="gallery-overlay__close" data-close>
          <span>إغلاق</span>
          <span aria-hidden="true">✕</span>
        </button>
        <img src="${src}" alt="${title}" class="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/20 shadow-2xl" />
        <div class="gallery-overlay__title">${title}</div>
      </div>
    `;

    const closeOverlay = () => {
      overlay.classList.remove('is-visible');
      overlay.querySelector('.gallery-overlay__content')?.classList.remove('is-visible');
      overlay.addEventListener(
        'transitionend',
        () => {
          overlay.remove();
        },
        { once: true }
      );
      document.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeOverlay();
      }
    };

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-close]')) {
        closeOverlay();
      }
    });

    document.addEventListener('keydown', onKeyDown);

    overlayRoot.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
      overlay.querySelector('.gallery-overlay__content')?.classList.add('is-visible');
    });
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const src = card.dataset.galleryImage;
      const title = card.dataset.galleryTitle || '';
      if (!src) return;
      createOverlay(src, title);
    });
  });
}

function setupRegistrationForm() {
  const form = document.querySelector('[data-registration-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    console.log('Form submitted:', payload);

    form.reset();
    alert('شكراً لتواصلك! سيتصل بك فريق FX Global خلال 24 ساعة القادمة.');
  });
}

