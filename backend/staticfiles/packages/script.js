// JavaScript for FX Global Packages Landing Page

document.addEventListener('DOMContentLoaded', function() {
  setupMobileNavigation();
  setupRevealAnimations();
  setupPricingButtons();
  setupSmoothScroll();
  setupContactForm();
  setupLahzaPopup();
});

// Setup Lahza Popup Event Listeners
function setupLahzaPopup() {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const popupClose = document.getElementById('lahza-popup-close');
  
  if (popupClose) {
    popupClose.addEventListener('click', closeLahzaPopup);
  }
  
  if (popupOverlay) {
    // Close popup when clicking on overlay
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        closeLahzaPopup();
      }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
        closeLahzaPopup();
      }
    });
  }
  
  // Listen for messages from iframe
  window.addEventListener('message', handleIframeMessage);
}

// Handle messages from iframe
function handleIframeMessage(event) {
  // Only accept messages from Lahza domain
  if (event.origin !== 'https://checkout.lahza.io' && event.origin !== 'https://lahza.io') {
    return;
  }
  
  console.log('Message from Lahza iframe:', event.data);
  
  // Handle payment completion
  if (event.data && (event.data.type === 'payment_success' || event.data.type === 'payment_complete')) {
    const reference = event.data.reference || event.data.ref;
    if (reference) {
      closeLahzaPopup();
      setTimeout(() => {
        verifyPayment(reference);
      }, 300);
    }
  }
}

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
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const clickedButton = e.currentTarget;
      
      // Get the plan name from the card
      const card = clickedButton.closest('.pricing-card');
      const planTitle = card.querySelector('h3')?.textContent?.trim() || '';
      
      // Determine plan details based on title
      let planData = {
        name: 'VIP Channel',
        amount: 100,
        currency: 'USD'
      };
      
      if (planTitle.includes('الباقة الأقوى') || planTitle.includes('الأقوى')) {
        planData = {
          name: 'الباقة الأقوى',
          amount: 180,
          currency: 'USD'
        };
      } else if (planTitle.includes('LIVE TRADING') || planTitle.includes('LIVE')) {
        planData = {
          name: 'LIVE TRADING',
          amount: 150,
          currency: 'USD'
        };
      } else if (planTitle.includes('VIP')) {
        planData = {
          name: 'VIP CHANNEL',
          amount: 100,
          currency: 'USD'
        };
      }
      
      // Open popup immediately with loading state
      openLahzaPopupWithLoading(planData, clickedButton);
    });
  });
}

// Open popup immediately and load payment in background
async function openLahzaPopupWithLoading(planData, button) {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const iframe = document.getElementById('lahza-checkout-iframe');
  
  if (!popupOverlay || !iframe) {
    console.error('Popup elements not found');
    return;
  }
  
  // Show popup immediately with loading state
  iframe.src = 'about:blank';
  iframe.style.background = 'linear-gradient(135deg, #1a0d2e 0%, #2d1b3d 100%)';
  popupOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Show loading indicator in iframe
  const loadingHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #1a0d2e 0%, #2d1b3d 100%);
          font-family: 'Cairo', sans-serif;
        }
        .loader {
          text-align: center;
          color: #fff;
        }
        .spinner {
          border: 4px solid rgba(223, 46, 136, 0.3);
          border-top: 4px solid #DF2E88;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-text {
          font-size: 18px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <div class="loading-text">جاري تحميل صفحة الدفع...</div>
      </div>
    </body>
    </html>
  `;
  
  // Create blob URL for loading page
  const blob = new Blob([loadingHTML], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  iframe.src = blobUrl;
  
  // Initialize payment in background
  try {
    // Get reCAPTCHA token (with shorter timeout for faster response)
    let recaptchaToken = '';
    const siteKey = '6Lf3vxcsAAAAAI03JSOmUJ67-DbZLh43CvnM6SAs';
    
    if (typeof grecaptcha !== 'undefined') {
      try {
        // Execute reCAPTCHA v3 with shorter timeout
        const executePromise = grecaptcha.execute(siteKey, {
          action: 'payment_submit'
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('reCAPTCHA execution timeout')), 5000);
        });
        
        recaptchaToken = await Promise.race([executePromise, timeoutPromise]);
      } catch (error) {
        console.warn('reCAPTCHA error, proceeding without token:', error);
        // Continue without token if reCAPTCHA fails (backend will handle)
      }
    }
    
    // Initialize payment with backend
    const response = await fetch('/checkout/payment/initialize/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        amount: planData.amount,
        currency: planData.currency,
        firstName: '',
        lastName: '',
        mobile: '',
        offerType: 'packages',
        offerName: planData.name,
        source: 'packages',
        recaptchaToken: recaptchaToken || '',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.authorization_url) {
      // Load payment URL in iframe
      iframe.src = data.authorization_url;
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      // Start monitoring
      startIframeMonitoring(iframe);
    } else {
      throw new Error(data.error || data.message || 'Failed to initialize payment');
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    // Close popup and show error
    closeLahzaPopup();
    alert('حدث خطأ أثناء تهيئة الدفع. يرجى المحاولة مرة أخرى.');
    // Clean up blob URL
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}

// Get CSRF Token
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue || '';
}

// Open Lahza Popup
function openLahzaPopup(paymentUrl) {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const iframe = document.getElementById('lahza-checkout-iframe');
  
  if (!popupOverlay || !iframe) {
    console.error('Popup elements not found');
    return;
  }
  
  // Load payment URL in iframe
  iframe.src = paymentUrl;
  
  // Show popup
  popupOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Monitor iframe for payment completion
  startIframeMonitoring(iframe);
}

// Close Lahza Popup
function closeLahzaPopup() {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const iframe = document.getElementById('lahza-checkout-iframe');
  
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (iframe) {
    // Clear iframe src when closing
    iframe.src = '';
  }
}

// Monitor iframe for payment completion
function startIframeMonitoring(iframe) {
  try {
    let lastUrl = iframe.src;
    const checkInterval = setInterval(() => {
      try {
        const currentUrl = iframe.contentWindow.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          console.log('Iframe URL changed:', currentUrl);
          
          // Check if URL contains callback/reference parameters
          const url = new URL(currentUrl);
          const reference = url.searchParams.get('reference') || url.searchParams.get('ref');
          
          if (reference) {
            clearInterval(checkInterval);
            closeLahzaPopup();
            // Verify payment
            verifyPayment(reference);
          }
        }
      } catch (e) {
        // Cross-origin error is expected, ignore
      }
    }, 500);
    
    // Clear interval when popup closes
    const overlay = document.getElementById('lahza-popup-overlay');
    if (overlay) {
      const observer = new MutationObserver(() => {
        if (!overlay.classList.contains('active')) {
          clearInterval(checkInterval);
          observer.disconnect();
        }
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
  } catch (e) {
    console.warn('Could not monitor iframe:', e);
  }
}

// Verify Payment
async function verifyPayment(reference) {
  try {
    const response = await fetch(`/checkout/payment/verify/?reference=${reference}`, {
      method: 'GET',
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('تم الدفع بنجاح! شكراً لك.');
      // Optionally redirect or show success message
    } else {
      alert('فشل التحقق من الدفع. يرجى الاتصال بالدعم.');
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    alert('حدث خطأ أثناء التحقق من الدفع. يرجى الاتصال بالدعم.');
  }
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

// Contact Form Handler
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');
  
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>جاري الإرسال...</span>';
    
    // Get form data
    const formData = {
      name: document.getElementById('contact-name').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      whatsapp: document.getElementById('contact-whatsapp').value.trim(),
      city: document.getElementById('contact-city').value.trim() || '',
      message: document.getElementById('contact-message').value.trim(),
    };
    
    try {
      const response = await fetch('/api/contacts/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Show success message
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Reset form
        form.reset();
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Show error
        alert('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.\n' + (data.message || JSON.stringify(data)));
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ أثناء الإرسال. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}
