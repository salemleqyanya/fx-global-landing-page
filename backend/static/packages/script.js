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
      
      // Store plan data for later use
      window.currentPlanData = planData;
      
      // Open popup with user info form
      openLahzaPopupWithForm();
    });
  });
}

// Open popup with user info form
function openLahzaPopupWithForm() {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const userForm = document.getElementById('payment-user-form');
  const iframeContainer = document.getElementById('payment-iframe-container');
  
  if (!popupOverlay || !userForm) {
    console.error('Popup elements not found');
    return;
  }
  
  // Reset form
  const form = document.getElementById('user-info-form');
  if (form) {
    form.reset();
  }
  
  // Show form, hide iframe
  userForm.style.display = 'block';
  if (iframeContainer) {
    iframeContainer.style.display = 'none';
  }
  
  // Show popup
  popupOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Setup form handler
  setupPaymentForm();
}

// Setup payment form submission
function setupPaymentForm() {
  const form = document.getElementById('user-info-form');
  if (!form) return;
  
  // Remove existing listeners
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  newForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = newForm.querySelector('.form-submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const firstName = document.getElementById('payment-first-name').value.trim();
    const lastName = document.getElementById('payment-last-name').value.trim();
    const mobile = document.getElementById('payment-mobile').value.trim();
    const email = document.getElementById('payment-email').value.trim();
    const address = document.getElementById('payment-address').value.trim();
    
    // Validate
    if (!firstName || firstName.length < 2) {
      alert('يرجى إدخال اسم أول صحيح');
      return;
    }
    
    if (!lastName || lastName.length < 2) {
      alert('يرجى إدخال اسم عائلة صحيح');
      return;
    }
    
    const mobileDigits = mobile.replace(/[^\d]/g, '');
    if (!mobile || mobileDigits.length < 8) {
      alert('يرجى إدخال رقم جوال صحيح');
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>جاري التحميل...</span>';
    
    try {
      // Get reCAPTCHA token
      let recaptchaToken = '';
      const siteKey = '6Lf3vxcsAAAAAI03JSOmUJ67-DbZLh43CvnM6SAs';
      
      if (typeof grecaptcha !== 'undefined') {
        try {
          recaptchaToken = await grecaptcha.execute(siteKey, {
            action: 'payment_submit'
          });
        } catch (error) {
          console.warn('reCAPTCHA error:', error);
        }
      }
      
      // Initialize payment with backend
      const planData = window.currentPlanData || {
        name: 'VIP Channel',
        amount: 100,
        currency: 'USD'
      };
      
      const response = await fetch('/packages/payment/initialize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({
          email: email, // User's actual email
          amount: planData.amount,
          currency: planData.currency,
          firstName: firstName,
          lastName: lastName,
          mobile: mobile,
          address: address || '',
          offerType: 'packages',
          offerName: planData.name,
          source: 'packages', // Ensure source is set to 'packages'
          recaptchaToken: recaptchaToken || '',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.authorization_url && data.reference) {
        // Store reference for later use
        window.currentPaymentReference = data.reference;
        console.log('Payment record created with reference:', data.reference);
        
        // Hide form, show iframe
        const userForm = document.getElementById('payment-user-form');
        const iframeContainer = document.getElementById('payment-iframe-container');
        const iframe = document.getElementById('lahza-checkout-iframe');
        
        if (userForm) userForm.style.display = 'none';
        if (iframeContainer) iframeContainer.style.display = 'block';
        if (iframe) {
          iframe.src = data.authorization_url;
          startIframeMonitoring(iframe);
        }
      } else {
        throw new Error(data.error || data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('حدث خطأ أثناء تهيئة الدفع. يرجى المحاولة مرة أخرى.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
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

// Open Lahza Popup with payment URL (used after form submission)
function openLahzaPopup(paymentUrl) {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const iframe = document.getElementById('lahza-checkout-iframe');
  const userForm = document.getElementById('payment-user-form');
  const iframeContainer = document.getElementById('payment-iframe-container');
  
  if (!popupOverlay || !iframe) {
    console.error('Popup elements not found');
    return;
  }
  
  // Hide form, show iframe
  if (userForm) userForm.style.display = 'none';
  if (iframeContainer) iframeContainer.style.display = 'block';
  
  // Show popup
  popupOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Load payment URL in iframe
  requestAnimationFrame(() => {
    iframe.src = paymentUrl;
    startIframeMonitoring(iframe);
  });
}

// Close Lahza Popup
function closeLahzaPopup() {
  const popupOverlay = document.getElementById('lahza-popup-overlay');
  const iframe = document.getElementById('lahza-checkout-iframe');
  const userForm = document.getElementById('payment-user-form');
  const iframeContainer = document.getElementById('payment-iframe-container');
  const form = document.getElementById('user-info-form');
  
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (iframe) {
    // Clear iframe src when closing
    iframe.src = '';
  }
  
  // Reset form state
  if (userForm) {
    userForm.style.display = 'block';
  }
  if (iframeContainer) {
    iframeContainer.style.display = 'none';
  }
  if (form) {
    form.reset();
  }
}

// Monitor iframe for payment completion
function startIframeMonitoring(iframe) {
  const reference = window.currentPaymentReference;
  if (!reference) {
    console.warn('No payment reference available for monitoring');
    return;
  }
  
  console.log('Starting payment monitoring for reference:', reference);
  
  // Poll payment status every 3 seconds
  let pollCount = 0;
  const maxPolls = 60; // 3 minutes max (60 * 3 seconds)
  const pollInterval = setInterval(async () => {
    pollCount++;
    
    try {
      // Check payment status via backend
      const response = await fetch(`/packages/payment/verify/?reference=${reference}`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // If payment is successful or failed, stop polling
        if (data.success && data.status === 'success') {
          clearInterval(pollInterval);
          console.log('Payment successful!');
          closeLahzaPopup();
          // Redirect to success page
          if (reference) {
            window.location.href = `/packages/payment/success/${reference}/`;
          } else {
            window.location.href = '/packages/payment/success/';
          }
          return;
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          clearInterval(pollInterval);
          console.log('Payment failed or cancelled');
          closeLahzaPopup();
          alert('تم إلغاء الدفع أو فشل المعاملة.');
          return;
        }
      }
    } catch (error) {
      console.warn('Payment status check error:', error);
    }
    
    // Stop polling after max attempts
    if (pollCount >= maxPolls) {
      clearInterval(pollInterval);
      console.log('Payment monitoring timeout');
      // Don't close popup, let user handle it manually
    }
  }, 3000); // Check every 3 seconds
  
  // Clear interval when popup closes
  const overlay = document.getElementById('lahza-popup-overlay');
  if (overlay) {
    const observer = new MutationObserver(() => {
      if (!overlay.classList.contains('active')) {
        clearInterval(pollInterval);
        observer.disconnect();
      }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }
  
  // Also try to listen for postMessage from iframe (if Lahza supports it)
  const messageHandler = (event) => {
    // Only accept messages from Lahza domain
    if (event.origin.includes('lahza.io') || event.origin.includes('pay.lahza.io')) {
      console.log('Message from Lahza iframe:', event.data);
      
      // Handle payment completion
      if (event.data && (
        event.data.type === 'payment_success' || 
        event.data.type === 'payment_complete' ||
        event.data.status === 'success'
      )) {
        const msgReference = event.data.reference || event.data.ref || reference;
        if (msgReference) {
          clearInterval(pollInterval);
          window.removeEventListener('message', messageHandler);
          closeLahzaPopup();
          setTimeout(() => {
            verifyPayment(msgReference);
          }, 300);
        }
      }
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Clean up message listener when popup closes
  if (overlay) {
    const cleanupObserver = new MutationObserver(() => {
      if (!overlay.classList.contains('active')) {
        window.removeEventListener('message', messageHandler);
        cleanupObserver.disconnect();
      }
    });
    cleanupObserver.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }
}

// Verify Payment
async function verifyPayment(reference) {
  try {
    const response = await fetch(`/packages/payment/verify/?reference=${reference}`, {
      method: 'GET',
      headers: {
        'X-CSRFToken': getCsrfToken(),
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.status === 'success') {
      // Close popup
      closeLahzaPopup();
      // Redirect to success page
      window.location.href = `/packages/payment/success/${reference}/`;
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
