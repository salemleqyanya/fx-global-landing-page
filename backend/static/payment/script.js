// Payment Page JavaScript with Lahza Integration

document.addEventListener('DOMContentLoaded', function() {
    setupLahzaPopup();
    setupPaymentButtons();
    setupSmoothScroll();
    setupAnimations();
    
    // Auto-open contact form if there's a success or error message
    // Check for messages that are visible (not hidden)
    const successMessage = document.querySelector('.contact-success-message');
    const errorMessage = document.querySelector('.contact-error-message');
    if ((successMessage && successMessage.style.display !== 'none') || 
        (errorMessage && errorMessage.style.display !== 'none')) {
        openContactForm();
    }
});

// Setup Lahza Popup Event Listeners
function setupLahzaPopup() {
    const popupOverlay = document.getElementById('lahza-popup-overlay');
    const popupClose = document.getElementById('lahza-popup-close');
    
    if (popupClose) {
        popupClose.addEventListener('click', closeLahzaPopup);
    }
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                closeLahzaPopup();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
                closeLahzaPopup();
            }
        });
    }
    
    window.addEventListener('message', handleIframeMessage);
}

// Handle messages from iframe
function handleIframeMessage(event) {
    if (event.origin !== 'https://checkout.lahza.io' && event.origin !== 'https://lahza.io') {
        return;
    }
    
    console.log('Message from Lahza iframe:', event.data);
    
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

// Setup Payment Buttons
function setupPaymentButtons() {
    // Hero CTA button
    const heroButton = document.querySelector('.cta-button');
    if (heroButton) {
        heroButton.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToPricing();
        });
    }

    // Pricing card buttons
    const cardButtons = document.querySelectorAll('.card-button');
    cardButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.pricing-card');
            const planData = getPlanDataFromCard(card);
            if (planData) {
                window.currentPlanData = planData;
                openLahzaPopupWithForm();
            }
        });
    });

    // Membership button
    const membershipButton = document.querySelector('.membership-button');
    if (membershipButton) {
        membershipButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.currentPlanData = {
                name: 'العضوية التعليمية (3 أشهر)',
                amount: 1850,
                currency: 'ILS',
                offerType: 'educational_membership'
            };
            openLahzaPopupWithForm();
        });
    }

    // VIP Learning button
    const vipButton = document.querySelector('.vip-button');
    if (vipButton) {
        vipButton.addEventListener('click', function(e) {
            e.preventDefault();
            openContactForm();
        });
    }
    
    // Setup contact form popup
    setupContactFormPopup();
}

// Get plan data from card
function getPlanDataFromCard(card) {
    if (!card) return null;
    
    const title = card.querySelector('.card-title')?.textContent?.trim() || '';
    const priceText = card.querySelector('.price')?.textContent || '';
    const priceMatch = priceText.match(/(\d+)/);
    const price = priceMatch ? parseInt(priceMatch[1]) : null;
    
    if (title.includes('جلسات تداول مباشر') || title.includes('تداول مباشر')) {
        return {
            name: 'جلسات تداول مباشر',
            amount: price || 330,
            currency: 'ILS',
            offerType: 'live_trading'
        };
    } else if (title.includes('الباندل') || title.includes('Bundle')) {
        return {
            name: 'الباندل',
            amount: price || 550,
            currency: 'ILS',
            offerType: 'bundle'
        };
    } else if (title.includes('إشارات VIP') || title.includes('VIP')) {
        return {
            name: 'إشارات VIP',
            amount: price || 370,
            currency: 'ILS',
            offerType: 'vip_signals'
        };
    }
    
    return null;
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
    
    const form = document.getElementById('user-info-form');
    if (form) {
        form.reset();
    }
    
    userForm.style.display = 'block';
    if (iframeContainer) {
        iframeContainer.style.display = 'none';
    }
    
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setupPaymentForm();
}

// Setup payment form submission
function setupPaymentForm() {
    const form = document.getElementById('user-info-form');
    if (!form) return;
    
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = newForm.querySelector('.form-submit-btn');
        const originalText = submitBtn.innerHTML;
        
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
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            alert('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>جاري التحميل...</span>';
        
        try {
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
            
            const planData = window.currentPlanData || {
                name: 'جلسات تداول مباشر',
                amount: 330,
                currency: 'ILS'
            };
            
            const response = await fetch('/payment/payment/initialize/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                body: JSON.stringify({
                    email: email,
                    amount: planData.amount,
                    currency: planData.currency,
                    firstName: firstName,
                    lastName: lastName,
                    mobile: mobile,
                    address: address || '',
                    offerType: planData.offerType || 'payment_page',
                    offerName: planData.name,
                    source: 'payment',
                    recaptchaToken: recaptchaToken || '',
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.authorization_url && data.reference) {
                window.currentPaymentReference = data.reference;
                console.log('Payment record created with reference:', data.reference);
                
                const userForm = document.getElementById('payment-user-form');
                const iframeContainer = document.getElementById('payment-iframe-container');
                const iframe = document.getElementById('lahza-checkout-iframe');
                const loadingIndicator = document.getElementById('payment-loading');
                
                if (userForm) userForm.style.display = 'none';
                if (iframeContainer) iframeContainer.style.display = 'block';
                
                // Show loading indicator
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'flex';
                }
                if (iframe) {
                    iframe.style.display = 'none';
                }
                
                // Load iframe and show it when ready
                if (iframe) {
                    iframe.src = data.authorization_url;
                    
                    // Show iframe when it loads
                    iframe.onload = function() {
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                        iframe.style.display = 'block';
                    };
                    
                    // Fallback: hide loading after 5 seconds even if iframe doesn't load
                    setTimeout(() => {
                        if (loadingIndicator && loadingIndicator.style.display !== 'none') {
                            loadingIndicator.style.display = 'none';
                            if (iframe) {
                                iframe.style.display = 'block';
                            }
                        }
                    }, 5000);
                    
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

// Close Lahza Popup
function closeLahzaPopup() {
    const popupOverlay = document.getElementById('lahza-popup-overlay');
    const iframe = document.getElementById('lahza-checkout-iframe');
    const userForm = document.getElementById('payment-user-form');
    const iframeContainer = document.getElementById('payment-iframe-container');
    const form = document.getElementById('user-info-form');
    const loadingIndicator = document.getElementById('payment-loading');
    
    if (popupOverlay) {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (iframe) {
        iframe.src = '';
        iframe.style.display = 'none';
    }
    
    if (userForm) {
        userForm.style.display = 'block';
    }
    if (iframeContainer) {
        iframeContainer.style.display = 'none';
    }
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
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
    
    let pollCount = 0;
    const maxPolls = 60;
    const pollInterval = setInterval(async () => {
        pollCount++;
        
        try {
            const response = await fetch(`/payment/payment/verify/?reference=${reference}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.status === 'success') {
                    clearInterval(pollInterval);
                    console.log('Payment successful! Redirecting to success page...');
                    closeLahzaPopup();
                    if (reference) {
                        window.location.href = `/payment/payment/success/${reference}/`;
                    } else {
                        window.location.href = '/payment/payment/success/';
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
            console.warn('[Payment Poll] Network error:', error);
        }
        
        if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            console.log('Payment monitoring timeout');
        }
    }, 3000);
    
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
}

// Verify Payment
async function verifyPayment(reference) {
    try {
        const response = await fetch(`/payment/payment/verify/?reference=${reference}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        const data = await response.json();
        
        if (data.success && data.status === 'success') {
            closeLahzaPopup();
            window.location.href = `/payment/payment/success/${reference}/`;
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

// Scroll to pricing section
function scrollToPricing() {
    const pricingSection = document.querySelector('.pricing-section');
    if (pricingSection) {
        pricingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Setup Animations
function setupAnimations() {
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

    const animatedElements = document.querySelectorAll('.pricing-card, .membership-card, .vip-learning-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

// Setup Contact Form Popup
function setupContactFormPopup() {
    const popupOverlay = document.getElementById('contact-popup-overlay');
    const popupClose = document.getElementById('contact-popup-close');
    
    if (popupClose) {
        popupClose.addEventListener('click', closeContactForm);
    }
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                closeContactForm();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
                closeContactForm();
            }
        });
    }
    
    // Form submission is now handled by Django view (POST to /payment/vip-learning/submit/)
    // No JavaScript submission handler needed
}

// Open Contact Form
function openContactForm() {
    const popupOverlay = document.getElementById('contact-popup-overlay');
    const form = document.getElementById('vip-contact-form');
    
    if (!popupOverlay) {
        console.error('Contact popup not found');
        return;
    }
    
    // Form submission is now handled by Django view (POST)
    // Don't reset form if there are error messages to preserve user input
    
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Contact Form
function closeContactForm() {
    const popupOverlay = document.getElementById('contact-popup-overlay');
    const form = document.getElementById('vip-contact-form');
    const successMessage = document.getElementById('contact-success-message');
    
    if (popupOverlay) {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Reset form after a delay to allow animation
    setTimeout(() => {
        if (form) {
            form.reset();
            form.style.display = 'block';
        }
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }, 300);
}

// Form submission is now handled by Django view (POST to /payment/vip-learning/submit/)
// No JavaScript submission handler needed - form uses traditional POST method

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .cta-button, .card-button, .membership-button, .vip-button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);