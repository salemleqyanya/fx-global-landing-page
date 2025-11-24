// Global state
let currentLanguage = 'en';
let selectedOffer = null;
let orderId = '';
let userEmail = '';

// Offer data
const offers = {
    bundle: {
        type: 'bundle',
        name: 'Live Trading + VIP Signals Bundle',
        nameAr: 'حزمة التداول المباشر + إشارت VIP',
        price: 136,
        originalPrice: 300,
        discount: '55% OFF',
        discountAr: 'خصم 55%'
    },
    yearly: {
        type: 'yearly',
        name: 'Annual VIP Membership',
        nameAr: 'العضوية السنوية VIP',
        price: 300,
        originalPrice: 500,
        discount: '40% OFF',
        discountAr: 'خصم 40%'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeLanguage();
    await initializeCountdown();
    initializePreBlackFridayTimer();
    initializeEventListeners();
    updateLanguageContent();
    initializeScrollAnimations();
    checkPaymentCallback();
});

// Check if returning from Lahza payment callback
function checkPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('ref');
    
    if (reference) {
        // User is returning from Lahza payment
        verifyPaymentAfterCallback(reference);
    }
}

async function verifyPaymentAfterCallback(reference) {
    try {
        // Show payment page with loading state
        showPaymentPage();
        const payButton = document.getElementById('pay-button');
        if (payButton) {
            payButton.disabled = true;
            payButton.innerHTML = `
                <div class="spinner"></div>
                <span>${currentLanguage === 'ar' ? 'جاري التحقق من الدفع...' : 'Verifying payment...'}</span>
            `;
        }
        
        // Verify payment with backend
        const response = await fetch(`/black-friday/payment/verify/?reference=${reference}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Get stored payment info
            const storedPayment = JSON.parse(localStorage.getItem('pending_lahza_payment') || '{}');
            orderId = data.reference || reference;
            userEmail = storedPayment.email || data.email || '';
            
            // Clear pending payment
            localStorage.removeItem('pending_lahza_payment');
            
            // Show success page
            showSuccessPage();
        } else {
            // Payment verification failed
            alert(currentLanguage === 'ar' 
                ? 'فشل التحقق من الدفع. يرجى الاتصال بالدعم.' 
                : 'Payment verification failed. Please contact support.');
            
            // Reset payment button
            if (payButton) {
                payButton.disabled = false;
                payButton.innerHTML = `
                    <span class="lock-icon">🔒</span>
                    <span>${currentLanguage === 'ar' ? 'المتابعة إلى الدفع الآمن' : 'Proceed to Secure Payment'}</span>
                    $<span id="pay-amount">${selectedOffer ? selectedOffer.price : 0}</span>
                `;
            }
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        alert(currentLanguage === 'ar' 
            ? 'حدث خطأ أثناء التحقق من الدفع. يرجى المحاولة مرة أخرى.' 
            : 'An error occurred while verifying payment. Please try again.');
    }
}

// Language Management
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'ar';
    currentLanguage = savedLanguage;
    document.getElementById('html-root').setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('html-root').setAttribute('lang', currentLanguage);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('language', currentLanguage);
    document.getElementById('html-root').setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('html-root').setAttribute('lang', currentLanguage);
    updateLanguageContent();
}

function updateLanguageContent() {
    const elements = document.querySelectorAll('[data-en][data-ar]');
    elements.forEach(el => {
        const text = currentLanguage === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
        if (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') {
            el.placeholder = text;
        } else if (el.tagName === 'LABEL') {
            el.textContent = text;
        } else if (el.tagName === 'A') {
            // Handle anchor tags - update text content but preserve href
            el.textContent = text;
        } else {
            // Check if text contains HTML tags (for elements like terms-note with links)
            if (text && text.includes('<')) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        }
    });
}

// Countdown Timer
let countdownInterval = null;
let timerEndTime = null;

// Pre-Black Friday Timer (counts down to November 26th)
let preBFTimerInterval = null;

async function initializeCountdown() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Show loading state
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (hoursEl && minutesEl && secondsEl) {
        hoursEl.textContent = '--';
        minutesEl.textContent = '--';
        secondsEl.textContent = '--';
    }
    
    // Check if we already have a valid cached end time that hasn't expired
    const cachedTime = localStorage.getItem('black_friday_end_time');
    const cachedTimestamp = cachedTime ? parseInt(cachedTime, 10) : null;
    
    if (cachedTimestamp && cachedTimestamp > Date.now()) {
        // Use cached time if it's still valid (not expired)
        timerEndTime = cachedTimestamp;
        console.log('Using cached end date:', new Date(timerEndTime).toLocaleString());
    } else {
        // Fetch end date from database API
        try {
            const response = await fetch('/api/black-friday/end-date/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.end_date_timestamp) {
                timerEndTime = data.end_date_timestamp;
                // Cache in localStorage for offline/fallback
                localStorage.setItem('black_friday_end_time', timerEndTime.toString());
                localStorage.setItem('black_friday_end_date_fetched', Date.now().toString());
                console.log('Timer initialized with end date from database:', new Date(timerEndTime).toLocaleString());
            } else {
                throw new Error('Invalid response from API: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.warn('Failed to fetch end date from API, using cached value:', error);
            // Fallback to localStorage if API fails
            if (cachedTimestamp) {
                timerEndTime = cachedTimestamp;
                console.log('Using cached end date (fallback):', new Date(timerEndTime).toLocaleString());
            } else {
                // Last resort: set to midnight tomorrow (but don't save to avoid resetting)
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                timerEndTime = tomorrow.getTime();
                console.warn('Using default end date (midnight tomorrow) - please set end date in admin:', tomorrow.toLocaleString());
            }
        }
    }
    
    if (!timerEndTime) {
        console.error('Failed to initialize timer - no end time available');
        return;
    }
    
    function updateCountdown() {
        if (!timerEndTime) return;
        
        const now = Date.now();
        const timeLeft = timerEndTime - now;
        
        if (!hoursEl || !minutesEl || !secondsEl) {
            return;
        }
        
        if (timeLeft <= 0) {
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            // Only refresh from API once when expired, not continuously
            const lastRefresh = localStorage.getItem('black_friday_last_refresh');
            const now = Date.now();
            if (!lastRefresh || (now - parseInt(lastRefresh, 10)) > 60000) { // Refresh max once per minute
                localStorage.setItem('black_friday_last_refresh', now.toString());
                fetch('/api/black-friday/end-date/')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.end_date_timestamp && data.end_date_timestamp > now) {
                            timerEndTime = data.end_date_timestamp;
                            localStorage.setItem('black_friday_end_time', timerEndTime.toString());
                            console.log('Timer refreshed with new end date:', new Date(timerEndTime).toLocaleString());
                        }
                    })
                    .catch(err => console.warn('Failed to refresh end date:', err));
            }
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const oldHours = hoursEl.textContent;
        const oldMinutes = minutesEl.textContent;
        const oldSeconds = secondsEl.textContent;
        
        const newHours = String(hours).padStart(2, '0');
        const newMinutes = String(minutes).padStart(2, '0');
        const newSeconds = String(seconds).padStart(2, '0');
        
        // Always update seconds for real-time feel
        if (oldSeconds !== newSeconds || oldSeconds === '--') {
            secondsEl.textContent = newSeconds;
            if (oldSeconds !== '--') {
                secondsEl.classList.add('updated');
                setTimeout(() => secondsEl.classList.remove('updated'), 500);
            }
        }
        
        // Update minutes when they change
        if (oldMinutes !== newMinutes || oldMinutes === '--') {
            minutesEl.textContent = newMinutes;
            if (oldMinutes !== '--') {
                minutesEl.classList.add('updated');
                setTimeout(() => minutesEl.classList.remove('updated'), 500);
            }
        }
        
        // Update hours when they change
        if (oldHours !== newHours || oldHours === '--') {
            hoursEl.textContent = newHours;
            if (oldHours !== '--') {
                hoursEl.classList.add('updated');
                setTimeout(() => hoursEl.classList.remove('updated'), 500);
            }
        }
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second for real-time countdown
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Pre-Black Friday Timer (counts down to November 26th)
function initializePreBlackFridayTimer() {
    // Clear any existing interval
    if (preBFTimerInterval) {
        clearInterval(preBFTimerInterval);
        preBFTimerInterval = null;
    }
    
    // Get current year and set target date to November 26th
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(currentYear, 10, 26, 0, 0, 0, 0); // November is month 10 (0-indexed)
    
    // If November 26th has already passed this year, set it for next year
    if (targetDate < now) {
        targetDate = new Date(currentYear + 1, 10, 26, 0, 0, 0, 0);
    }
    
    const targetTimestamp = targetDate.getTime();
    
    function updatePreBFTimer() {
        const now = Date.now();
        const timeLeft = targetTimestamp - now;
        
        const daysEl = document.getElementById('pre-bf-days');
        const hoursEl = document.getElementById('pre-bf-hours');
        const minutesEl = document.getElementById('pre-bf-minutes');
        const secondsEl = document.getElementById('pre-bf-seconds');
        
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
            return;
        }
        
        if (timeLeft <= 0) {
            // Timer has expired - hide the banner or show a message
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            
            const banner = document.querySelector('.pre-bf-timer-banner');
            if (banner) {
                banner.style.display = 'none';
            }
            
            if (preBFTimerInterval) {
                clearInterval(preBFTimerInterval);
                preBFTimerInterval = null;
            }
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    // Update immediately
    updatePreBFTimer();
    
    // Update every second
    preBFTimerInterval = setInterval(updatePreBFTimer, 1000);
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Event Listeners
function initializeEventListeners() {
    // Language toggle
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
    
    // Offer cards - handle button clicks to navigate to checkout
    document.querySelectorAll('.offer-card .btn-primary').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = button.closest('.offer-card');
            if (card) {
                const offerType = card.getAttribute('data-offer');
                if (offerType) {
                    selectOffer(offerType);
                }
            }
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Auto-fill contact form
    const autoFillBtn = document.getElementById('auto-fill-btn');
    if (autoFillBtn) {
        autoFillBtn.addEventListener('click', handleAutoFillContact);
    }
    
    // Payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    // Auto-fill payment form
    const paymentAutoFill = document.getElementById('payment-auto-fill');
    if (paymentAutoFill) {
        paymentAutoFill.addEventListener('click', handleAutoFillPayment);
    }
    
    // Back buttons
    const backToOffers = document.getElementById('back-to-offers');
    if (backToOffers) {
        backToOffers.addEventListener('click', () => {
            showPage('landing-page');
        });
    }
    
    const backToHome = document.getElementById('back-to-home');
    if (backToHome) {
        backToHome.addEventListener('click', () => {
            showPage('landing-page');
            selectedOffer = null;
            orderId = '';
            userEmail = '';
        });
    }
    
    // WhatsApp button
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const whatsappNumber = '972598386350';
            const message = encodeURIComponent(
                currentLanguage === 'ar' 
                    ? 'مرحباً! أنا مهتم بعروض الجمعة السوداء لـ FX Globals.' 
                    : 'Hi! I\'m interested in FX Globals Black Friday deals.'
            );
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        });
    }
    
    // Payment form validation on input
    const paymentNameInput = document.getElementById('payment-name');
    const paymentEmailInput = document.getElementById('payment-email');
    
    if (paymentNameInput) {
        paymentNameInput.addEventListener('input', validatePaymentForm);
    }
    if (paymentEmailInput) {
        paymentEmailInput.addEventListener('input', validatePaymentForm);
    }
}

// Offer Selection
function selectOffer(offerType) {
    selectedOffer = offers[offerType];
    // Navigate to checkout page with offer details as URL parameters
    navigateToCheckout(offerType);
}

function navigateToCheckout(offerType) {
    const offer = offers[offerType];
    if (!offer) {
        console.error('Offer not found:', offerType);
        return;
    }
    
    // Build checkout URL with offer parameters
    const params = new URLSearchParams({
        offer: offerType,
        price: offer.price.toString(),
        originalPrice: offer.originalPrice.toString(),
        name: offer.name,
        nameAr: offer.nameAr,
        discount: offer.discount,
        discountAr: offer.discountAr,
    });
    
    // Navigate to checkout page
    window.location.href = `/checkout/?${params.toString()}`;
}

function showPaymentPage() {
    showPage('payment-page');
    updatePaymentPage();
    
    // Reset payment form and disable button initially
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.reset();
        const payButton = document.getElementById('pay-button');
        if (payButton) {
            payButton.disabled = true;
        }
        // Validate form after reset (will keep button disabled since form is empty)
        setTimeout(() => validatePaymentForm(), 100);
    }
}

function updatePaymentPage() {
    if (!selectedOffer) return;
    
    const offerName = currentLanguage === 'ar' ? selectedOffer.nameAr : selectedOffer.name;
    const discount = currentLanguage === 'ar' ? selectedOffer.discountAr : selectedOffer.discount;
    
    document.getElementById('selected-offer-name').textContent = offerName;
    document.getElementById('selected-offer-badge').textContent = discount;
    document.getElementById('original-price').textContent = `$${selectedOffer.originalPrice}`;
    document.getElementById('discount-amount').textContent = `-$${selectedOffer.originalPrice - selectedOffer.price}`;
    document.getElementById('total-price').textContent = `$${selectedOffer.price}`;
    document.getElementById('savings-amount').textContent = selectedOffer.originalPrice - selectedOffer.price;
    document.getElementById('pay-amount').textContent = selectedOffer.price;
    
    // Validate form after updating payment page
    setTimeout(() => validatePaymentForm(), 100);
}

// Contact Form
function handleAutoFillContact() {
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const cityInput = document.getElementById('contact-city');
    const emailInput = document.getElementById('contact-email');
    
    if (currentLanguage === 'ar') {
        nameInput.value = 'أحمد محمد';
        phoneInput.value = '+1 234 567 8900';
        cityInput.value = 'الرياض';
        emailInput.value = 'ahmad@example.com';
    } else {
        nameInput.value = 'John Doe';
        phoneInput.value = '+1 234 567 8900';
        cityInput.value = 'New York';
        emailInput.value = 'john@example.com';
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    
    // Disable button and show loading
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = currentLanguage === 'ar' ? 'جاري الإرسال...' : 'Sending...';
    }
    
    // Get form data - API expects: name, phone, whatsapp, message, city (optional), address (optional)
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const cityInput = document.getElementById('contact-city');
    const emailInput = document.getElementById('contact-email'); // May not be needed by API
    
    const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        whatsapp: phoneInput ? phoneInput.value.trim() : '', // Use phone as whatsapp
        message: 'Contact form submission from Black Friday page',
        city: cityInput ? cityInput.value.trim() : null,
    };
    
    // Validate required fields
    if (!formData.name || formData.name.length < 2) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter your name');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
        return;
    }
    
    if (!formData.phone || formData.phone.length < 8) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
        return;
    }
    
    // Get landing page code from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        formData.landing_code = code.toUpperCase();
    }
    
    try {
        // Get CSRF token
        const csrftoken = getCsrfToken();
        
        const response = await fetch('/api/contacts/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || '',
            },
            body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Show success message
            form.style.display = 'none';
            const successDiv = document.getElementById('form-success');
            if (successDiv) {
                successDiv.style.display = 'block';
            }
            
            // Reset form after 3 seconds
            setTimeout(() => {
                form.style.display = 'flex';
                if (successDiv) {
                    successDiv.style.display = 'none';
                }
                form.reset();
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }, 3000);
        } else {
            // Show error message
            let errorMsg = 'Error occurred';
            if (data.message) {
                errorMsg = data.message;
            } else if (typeof data === 'object') {
                // Get first error message from validation errors
                const firstError = Object.values(data).find(v => Array.isArray(v) && v.length > 0);
                if (firstError) {
                    errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
                } else {
                    errorMsg = Object.values(data)[0] || errorMsg;
                }
            }
            
            alert(currentLanguage === 'ar' ? `خطأ: ${errorMsg}` : `Error: ${errorMsg}`);
            
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        alert(currentLanguage === 'ar' 
            ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' 
            : 'An error occurred. Please try again.');
        
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

// Payment Form Validation
function validatePaymentForm() {
    const nameInput = document.getElementById('payment-name');
    const emailInput = document.getElementById('payment-email');
    const payButton = document.getElementById('pay-button');
    
    if (!nameInput || !emailInput || !payButton) {
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    // Basic validation - only name and email needed for Lahza
    const isNameValid = name.length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    const isValid = isNameValid && isEmailValid;
    
    payButton.disabled = !isValid;
    
    return isValid;
}

function handleAutoFillPayment() {
    const nameInput = document.getElementById('payment-name');
    const emailInput = document.getElementById('payment-email');
    
    if (currentLanguage === 'ar') {
        nameInput.value = 'أحمد محمد السعيد';
        emailInput.value = 'ahmad.test@fxglobals.com';
    } else {
        nameInput.value = 'John Michael Doe';
        emailInput.value = 'john.test@fxglobals.com';
    }
    
    // Validate form after auto-fill
    setTimeout(() => validatePaymentForm(), 100);
}

async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('payment-name').value.trim(),
        email: document.getElementById('payment-email').value.trim(),
    };
    
    if (!selectedOffer) {
        alert(currentLanguage === 'ar' ? 'يرجى اختيار عرض أولاً' : 'Please select an offer first');
        return;
    }
    
    // Validate form data
    if (!formData.fullName || formData.fullName.length < 2) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال اسم صحيح' : 'Please enter a valid name');
        return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
        return;
    }
    
    // Disable button and show processing
    const payButton = document.getElementById('pay-button');
    payButton.disabled = true;
    payButton.innerHTML = `
        <div class="spinner"></div>
        <span>${currentLanguage === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
    `;
    
    try {
        // Initialize Lahza payment
        const response = await fetch('/black-friday/payment/initialize/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                email: formData.email,
                amount: selectedOffer.price,
                fullName: formData.fullName,
                offerType: selectedOffer.type,
                offerName: currentLanguage === 'ar' ? selectedOffer.nameAr : selectedOffer.name,
                source: 'black_friday',
            }),
        });
        
        const data = await response.json();
        
        if (data.success && data.authorization_url) {
            // Store payment reference for verification
            localStorage.setItem('pending_lahza_payment', JSON.stringify({
                reference: data.reference,
                email: formData.email,
                offerType: selectedOffer.type,
                fullName: formData.fullName,
            }));
            
            // Redirect to Lahza payment page
            window.location.href = data.authorization_url;
        } else {
            throw new Error(data.error || 'Failed to initialize payment');
        }
    } catch (error) {
        console.error('Payment initialization error:', error);
        payButton.disabled = false;
        payButton.innerHTML = `
            <span class="lock-icon">🔒</span>
            <span>${currentLanguage === 'ar' ? 'المتابعة إلى الدفع الآمن' : 'Proceed to Secure Payment'}</span>
            $<span id="pay-amount">${selectedOffer.price}</span>
        `;
        alert(currentLanguage === 'ar' 
            ? 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.' 
            : 'An error occurred while processing payment. Please try again.');
    }
}

function getCsrfToken() {
    // Try to get CSRF token from cookie
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

function showSuccessPage() {
    showPage('success-page');
    updateSuccessPage();
}

function updateSuccessPage() {
    if (!selectedOffer) return;
    
    document.getElementById('display-order-id').textContent = orderId;
    document.getElementById('display-email').textContent = userEmail;
    document.getElementById('saved-amount').textContent = `$${selectedOffer.originalPrice - selectedOffer.price}`;
}

