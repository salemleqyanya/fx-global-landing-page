document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavigation();
  setupRevealAnimations();
  setupHeroVideoObserver();
  setupVipCounter();
  setupGalleryLightbox();
  setupRegistrationForm();
  setupProfitCalculator();
  populateVideos();
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
    setState(!mobileNav.classList.contains('is-open'));
  });

  mobileNav.querySelectorAll('[data-close-mobile]').forEach((link) => {
    link.addEventListener('click', () => setState(false));
  });
}

function setupRevealAnimations() {
  const animatedElements = document.querySelectorAll('.fade-up, .fade-in, .scale-in');
  if (!animatedElements.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  animatedElements.forEach((el) => observer.observe(el));
}

function setupHeroVideoObserver() {
  const iframe = document.querySelector('[data-hero-video]');
  if (!iframe || !('IntersectionObserver' in window)) return;

  let playerOrigin = '*';
  try {
    playerOrigin = new URL(iframe.src).origin;
  } catch (error) {
    console.warn('Unable to parse hero video origin', error);
  }

  const postMessage = (command) => {
    try {
      iframe.contentWindow?.postMessage(JSON.stringify({ method: command }), playerOrigin);
    } catch (error) {
      console.warn('Unable to communicate with hero video', error);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        postMessage('play');
      } else {
        postMessage('pause');
      }
    });
  }, { threshold: 0.5 });

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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate();
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

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
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
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
  const successMessage = document.querySelector('[data-form-success]');
  const errorMessage = document.querySelector('[data-form-error]');
  if (!form) return;

  const showStatus = (element, message) => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('hidden');
  };

  const hideStatus = (element) => {
    if (!element) return;
    element.classList.add('hidden');
    element.textContent = '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const formData = new FormData(form);
    const userName = formData.get('fullName')?.toString().trim() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const selectedPlan = formData.get('plan')?.toString().trim() || '';
    const notes = formData.get('notes')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const composedMessageParts = [
      notes,
      selectedPlan ? `الخطة المختارة: ${selectedPlan}` : '',
      email ? `البريد الإلكتروني: ${email}` : '',
    ].filter(Boolean);
    const composedMessage = composedMessageParts.join('\n');

    const landingCode =
      typeof window !== 'undefined' && typeof window.LANDING_PAGE_CODE === 'string'
        ? window.LANDING_PAGE_CODE.trim()
        : '';

    const payload = {
      name: userName,
      phone,
      whatsapp: phone,
      message: composedMessage || 'مهتم بالاشتراك في خدمات FX Global',
      goal: null,
      address: null,
      city: null,
      landing_code: landingCode,
    };

    if (!payload.name || !payload.phone) {
      showStatus(errorMessage, 'الرجاء إدخال الاسم ورقم الهاتف.');
      return;
    }

    hideStatus(successMessage);
    hideStatus(errorMessage);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'جارٍ الإرسال...';
    }

    try {
      await submitRegistration(payload);
      form.reset();
      showStatus(successMessage, 'تم استلام طلبك! سيتواصل معك فريق FX Global خلال 24 ساعة.');
    } catch (error) {
      showStatus(errorMessage, error.message || 'حدث خطأ أثناء الإرسال، حاول مرة أخرى.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'إرسال';
      }
    }
  });
}

async function submitRegistration(payload) {
  const csrftoken = getCookie('csrftoken');
  const response = await fetch('/api/contacts/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'فشل إرسال الطلب، حاول مرة أخرى.';
    try {
      const data = await response.json();
      errorMessage = data.detail || data.message || errorMessage;
    } catch (error) {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json().catch(() => ({}));
}

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}

// Profit Calculator Functions
let lotSize = 0.1;

function getTotalPips() {
  const totalPipsInput = document.getElementById('total-pips');
  if (totalPipsInput) {
    // Remove commas and parse the value
    const value = totalPipsInput.value.replace(/,/g, '');
    return parseFloat(value) || 17782;
  }
  return 17782; // fallback
}

function calculateProfit() {
  const totalPips = getTotalPips();
  const lot = parseFloat(lotSize) || 0;
  const profit = totalPips * (lot * 10);
  const profitElement = document.getElementById('profit-amount');
  
  if (profitElement) {
    // Animate the number change - start from 0 like html-version
    animateValue(profitElement, 0, profit, 500);
  }
}

// Define setLotSize and make it available globally immediately
window.setLotSize = function setLotSize(size) {
  lotSize = parseFloat(size);
  const lotInput = document.getElementById('lot-size');
  if (lotInput) {
    lotInput.value = size;
    calculateProfit();
  }
};

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateValue(element, start, end, duration) {
  const startTime = performance.now();
  const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Use cubic bezier easing matching React: [0.25, 0.1, 0.25, 1]
    const current = startValue + (end - startValue) * easeOutCubic(progress);
    
    element.textContent = '$' + Math.floor(current).toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = '$' + Math.floor(end).toLocaleString();
    }
  }
  
  requestAnimationFrame(update);
}

function setupProfitCalculator() {
  const lotInput = document.getElementById('lot-size');
  if (lotInput) {
    lotInput.addEventListener('input', function() {
      lotSize = parseFloat(this.value) || 0;
      calculateProfit();
    });
    // Initialize with current value
    lotSize = parseFloat(lotInput.value) || 0.1;
    calculateProfit();
  }
}

// Live Videos
const videos = [
  { id: '1144929057', title: 'إدارة المخاطر - درس عملي' },
  { id: '1144928950', title: 'تداول مباشر - جلسة لندن' },
  { id: '1144928883', title: 'استراتيجية الاختراق - EUR/USD' },
  { id: '1144928735', title: 'جلسة تداول مباشرة - الذهب' },
  { id: '1145244454', title: 'جلسة تداول مباشرة' },
  { id: '1145244416', title: 'جلسة تداول مباشرة' },
  { id: '1145244362', title: 'جلسة تداول مباشرة' },
  { id: '1145244298', title: 'جلسة تداول مباشرة' },
  { id: '1145244272', title: 'جلسة تداول مباشرة' },
  { id: '1145244242', title: 'جلسة تداول مباشرة' },
  { id: '1145243920', title: 'جلسة تداول مباشرة' },
  { id: '1145243900', title: 'جلسة تداول مباشرة' }
];

function populateVideos() {
  try {
    // Check if inline script already populated videos
    const videosGrid = document.getElementById('videos-grid');
    if (!videosGrid) {
      console.warn('Videos grid element not found');
      return;
    }
    
    // If videos are already populated by inline script, skip
    if (videosGrid.children.length > 0 && videosGrid.querySelector('.video-item')) {
      console.log('Videos already populated by inline script');
      return;
    }
    
    // Hide loading message if it exists
    const loadingMsg = document.getElementById('videos-loading');
    if (loadingMsg) {
      loadingMsg.style.display = 'none';
    }
    
    // Clear any existing content (but keep loading message structure)
    const loadingElement = videosGrid.querySelector('#videos-loading');
    videosGrid.innerHTML = '';
    if (loadingElement) {
      videosGrid.appendChild(loadingElement);
    }
    
    if (!videos || videos.length === 0) {
      console.warn('No videos to display');
      if (loadingMsg) {
        loadingMsg.style.display = 'block';
        loadingMsg.innerHTML = '<p>لا توجد فيديوهات متاحة حالياً</p>';
        videosGrid.appendChild(loadingMsg);
      }
      return;
    }
    
    videos.forEach((video, index) => {
      try {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
          <iframe
            src="https://player.vimeo.com/video/${video.id}?title=0&byline=0&portrait=0&loop=1"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        `;
        videosGrid.appendChild(videoItem);
      } catch (error) {
        console.error(`Error creating video item ${index}:`, error);
      }
    });
    
    console.log('Videos populated by main script:', videos.length);
    
    // Ensure the section is visible
    const videosSection = videosGrid.closest('section');
    if (videosSection) {
      videosSection.style.display = '';
      videosSection.style.visibility = '';
    }
  } catch (error) {
    console.error('Error populating videos:', error);
    // Fallback to inline script if available
    if (typeof window.populateVideosInline === 'function') {
      console.log('Falling back to inline script');
      window.populateVideosInline();
    }
  }
}
