// Global state
let currentLanguage = 'en';
let selectedOffer = null;
let orderId = '';
let userEmail = '';

// Helper function to get currency symbol
function getCurrencySymbol(currency) {
    const symbols = {
        'ILS': '₪',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    return symbols[currency] || '$';
}

// Offer data
const offers = {
    bundle: {
        type: 'bundle',
        name: 'Design Package + VIP Tips',
        nameAr: 'حزمة التصميم + نصائح VIP',
        price: 136,
        originalPrice: 300,
        currency: 'USD',
        discount: '55% OFF',
        discountAr: 'خصم 55%'
    },
    yearly: {
        type: 'yearly',
        name: 'Annual Membership',
        nameAr: 'العضوية السنوية',
        price: 1300,
        originalPrice: 1850,
        currency: 'ILS',
        discount: '30% OFF',
        discountAr: 'خصم 30%'
    },
    recommendations: {
        type: 'recommendations',
        name: 'Recommendations Offer',
        nameAr: 'عرض التوصيات',
        price: 75,
        originalPrice: 150,
        currency: 'USD',
        discount: '50% OFF',
        discountAr: 'خصم 50%'
    },
    livestream: {
        type: 'livestream',
        name: 'Live Streaming Offer',
        nameAr: 'عرض البث المباشر',
        price: 75,
        originalPrice: 150,
        currency: 'USD',
        discount: '50% OFF',
        discountAr: 'خصم 50%'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeLanguage();
    
    // Initialize pre-BF timer check first (this will initialize the countdown if Black Friday has started)
    await initializePreBlackFridayTimer();
    
    // Additional check: if Black Friday content is visible but timer wasn't initialized, initialize it now
    const heroSection = document.querySelector('.hero-section');
    const countdownContainer = document.querySelector('.countdown-container');
    const hoursEl = document.getElementById('hours');
    
    if (heroSection && countdownContainer && hoursEl) {
        // Check if timer is still showing loading state
        if (hoursEl.textContent === '--' || hoursEl.textContent === '23') {
            console.log('Timer appears not initialized, initializing now...');
            // Clear cache to ensure fresh data
            localStorage.removeItem('black_friday_end_time');
            localStorage.removeItem('black_friday_end_date_fetched');
            await initializeCountdown();
        }
    }
    
    initializePreBFContactForm(); // Initialize pre-BF contact form
    initializeEventListeners();
    updateLanguageContent();
    initializeScrollAnimations();
    checkPaymentCallback();
    checkRecaptchaV3(); // Check if reCAPTCHA v3 is loaded
});

// Check reCAPTCHA v3 loading status
function checkRecaptchaV3() {
    // Check multiple times as script loads asynchronously
    let attempts = 0;
    const maxAttempts = 5;
    
    const checkInterval = setInterval(() => {
        attempts++;
        const recaptchaIndicator = document.querySelector('.recaptcha-status');
        
        if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
            // reCAPTCHA v3 is loaded
            if (recaptchaIndicator) {
                const isArabic = currentLanguage === 'ar';
                recaptchaIndicator.innerHTML = `
                    <span style="color: #10b981;">✓</span> 
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px;">
                        ${isArabic ? 'reCAPTCHA v3 نشط' : 'reCAPTCHA v3 Active'}
                    </span>
                `;
            }
            console.log('reCAPTCHA v3 loaded successfully');
            clearInterval(checkInterval);
        } else if (attempts >= maxAttempts) {
            // Give up after max attempts
            if (recaptchaIndicator) {
                const isArabic = currentLanguage === 'ar';
                recaptchaIndicator.innerHTML = `
                    <span style="color: #ef4444;">⚠</span> 
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px;">
                        ${isArabic ? 'reCAPTCHA غير محمل' : 'reCAPTCHA not loaded'}
                    </span>
                `;
            }
            console.error('reCAPTCHA v3 failed to load after', maxAttempts, 'attempts');
            clearInterval(checkInterval);
        }
    }, 500);
}

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
                const currency = selectedOffer ? (selectedOffer.currency || 'USD') : 'USD';
                const currencySymbol = getCurrencySymbol(currency);
                payButton.innerHTML = `
                    <span class="lock-icon">🔒</span>
                    <span>${currentLanguage === 'ar' ? 'المتابعة إلى الدفع الآمن' : 'Proceed to Secure Payment'}</span>
                    ${currencySymbol}<span id="pay-amount">${selectedOffer ? selectedOffer.price : 0}</span>
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
        // Skip hero-title words - keep "BLACK FRIDAY" in English always
        if (el.classList.contains('hero-word')) {
            return;
        }
        
        const text = currentLanguage === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
        if (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') {
            el.placeholder = text;
        } else if (el.tagName === 'LABEL') {
            el.textContent = text;
        } else if (el.tagName === 'A') {
            // Handle anchor tags - update text content but preserve href
            el.textContent = text;
        } else if (el.tagName === 'SELECT') {
            // Handle select elements - update options
            const currentValue = el.value;
            const options = el.querySelectorAll('option[data-en][data-ar]');
            options.forEach(option => {
                const optionText = currentLanguage === 'ar' ? option.getAttribute('data-ar') : option.getAttribute('data-en');
                option.textContent = optionText;
            });
            // Restore selected value
            el.value = currentValue;
            // Update select color based on validity
            if (el.id === 'contact-type') {
                if (el.value && el.value !== '') {
                    el.style.color = 'var(--white)';
                    el.classList.remove('invalid');
                    el.classList.add('valid');
                } else {
                    el.style.color = 'rgba(255, 255, 255, 0.4)';
                    el.classList.remove('valid');
                    el.classList.add('invalid');
                }
            }
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

// Pre-Black Friday Timer - shows timer until configured date, then shows Black Friday content
async function initializePreBlackFridayTimer() {
    // Clear any existing interval
    if (preBFTimerInterval) {
        clearInterval(preBFTimerInterval);
        preBFTimerInterval = null;
    }
    
    // Fetch pre-BF start date from backend
    let targetDate = null;
    try {
        const response = await fetch('/api/black-friday/pre-bf-date/');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.pre_black_friday_start_timestamp) {
                targetDate = new Date(data.pre_black_friday_start_timestamp);
                console.log('Pre-BF timer initialized with date from backend:', targetDate.toLocaleString());
            }
        }
    } catch (error) {
        console.warn('Failed to fetch pre-BF date from API:', error);
    }
    
    // Fallback to default (November 26th) if API fails
    if (!targetDate) {
        const now = new Date();
        const currentYear = now.getFullYear();
        // November is month 10 (0-indexed), set to November 26th at 00:00:00
        targetDate = new Date(currentYear, 10, 26, 0, 0, 0, 0);
        // If November 26th has already passed this year, set it to next year
        if (targetDate <= now) {
            targetDate = new Date(currentYear + 1, 10, 26, 0, 0, 0, 0);
        }
        console.log('Using default pre-BF date (November 26th):', targetDate.toLocaleString());
    }
    
    const now = new Date();
    // Check if target date has already passed
    const hasPassed = targetDate <= now;
    
    // Get references to elements
    const preBFTimerBanner = document.querySelector('.pre-bf-timer-banner');
    const landingPage = document.getElementById('landing-page');
    const heroSection = document.querySelector('.hero-section');
    const offersSection = document.querySelector('.offers-section');
    const timerBanner = document.querySelector('.timer-banner');
    const statsGrid = document.querySelector('.stats-grid');
    const contactSection = document.querySelector('.contact-section');
    const footer = document.querySelector('footer');
    
    // If November 26th has already passed, hide pre-BF timer and show Black Friday content
    if (hasPassed) {
        if (preBFTimerBanner) {
            preBFTimerBanner.style.display = 'none';
        }
        // Show Black Friday content
        if (landingPage) landingPage.style.display = '';
        if (heroSection) heroSection.style.display = '';
        if (offersSection) offersSection.style.display = '';
        if (timerBanner) timerBanner.style.display = '';
        if (statsGrid) statsGrid.style.display = '';
        if (contactSection) contactSection.style.display = '';
        if (footer) footer.style.display = '';
        // Clear cached timer data to ensure fresh 24-hour countdown from backend
        localStorage.removeItem('black_friday_end_time');
        localStorage.removeItem('black_friday_end_date_fetched');
        
        // Initialize the main Black Friday countdown timer
        initializeCountdown();
        console.log('Black Friday has started! Showing Black Friday content.');
        return;
    }
    
    // If November 26th hasn't passed, show pre-BF timer and hide Black Friday content
    const targetTimestamp = targetDate.getTime();
    
    // Hide ALL Black Friday content - hide all children of landing-page except pre-BF timer
    if (landingPage) {
        const landingChildren = landingPage.children;
        for (let i = 0; i < landingChildren.length; i++) {
            const child = landingChildren[i];
            if (!child.classList.contains('pre-bf-timer-banner')) {
                child.style.display = 'none';
            }
        }
    }
    if (heroSection) heroSection.style.display = 'none';
    if (offersSection) offersSection.style.display = 'none';
    if (timerBanner) timerBanner.style.display = 'none';
    if (statsGrid) statsGrid.style.display = 'none';
    if (contactSection) contactSection.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Show pre-BF timer banner (full screen with black background)
    if (preBFTimerBanner) {
        preBFTimerBanner.style.display = 'flex';
    }
    
    console.log('Pre-Black Friday Timer initialized. Target date:', targetDate.toLocaleString());
    
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
            // Timer has expired - hide the pre-BF banner and show Black Friday content
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            
            const landingPage = document.getElementById('landing-page');
            const footer = document.querySelector('footer');
            
            if (preBFTimerBanner) {
                preBFTimerBanner.style.display = 'none';
            }
            
            // Show Black Friday content - show all children of landing-page
            if (landingPage) {
                const landingChildren = landingPage.children;
                for (let i = 0; i < landingChildren.length; i++) {
                    const child = landingChildren[i];
                    if (!child.classList.contains('pre-bf-timer-banner')) {
                        child.style.display = '';
                    }
                }
            }
            if (heroSection) heroSection.style.display = '';
            if (offersSection) offersSection.style.display = '';
            if (timerBanner) timerBanner.style.display = '';
            if (statsGrid) statsGrid.style.display = '';
            if (contactSection) contactSection.style.display = '';
            if (footer) footer.style.display = '';
            
            // Clear cached timer data to ensure fresh 24-hour countdown from backend
            localStorage.removeItem('black_friday_end_time');
            localStorage.removeItem('black_friday_end_date_fetched');
            
            // Initialize the main Black Friday countdown timer
            initializeCountdown();
            
            if (preBFTimerInterval) {
                clearInterval(preBFTimerInterval);
                preBFTimerInterval = null;
            }
            
            console.log('Pre-Black Friday timer expired! Black Friday content is now visible.');
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

// Pre-BF Contact Form Handler
function initializePreBFContactForm() {
    const form = document.getElementById('pre-bf-contact-form');
    if (!form) return;
    
    form.addEventListener('submit', handlePreBFContactSubmit);
}

async function handlePreBFContactSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('pre-bf-contact-form');
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';
    
    // Disable button and show loading
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
    }
    
    // Get form data
    const formData = {
        name: document.getElementById('pre-bf-name').value.trim(),
        phone: document.getElementById('pre-bf-mobile').value.trim(),
        whatsapp: document.getElementById('pre-bf-mobile').value.trim(),
        city: document.getElementById('pre-bf-city').value.trim(),
        email: document.getElementById('pre-bf-email').value.trim(),
        message: document.getElementById('pre-bf-message').value.trim(),
    };
    
    // Validate required fields
    if (!formData.name || formData.name.length < 2) {
        alert('Please enter your name');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
        return;
    }
    
    if (!formData.phone || formData.phone.length < 8) {
        alert('Please enter a valid phone number');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
        return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert('Please enter a valid email address');
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
        // Save to Black Friday contact model
        const bfFormData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            city: formData.city,
            message: formData.message,
            form_type: 'pre_bf',
        };
        
            const bfResponse = await fetch('/api/contacts/black-friday/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bfFormData),
            });
            
                const bfData = await bfResponse.json();
        
        if (bfResponse.ok && bfData.success) {
            // Show success message
            form.style.display = 'none';
            const successDiv = document.getElementById('pre-bf-form-success');
            if (successDiv) {
                successDiv.style.display = 'block';
            }
            
            // Reset form after 5 seconds
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
            }, 5000);
        } else {
            // Show error message
            let errorMsg = 'Error occurred';
            if (bfData.message) {
                errorMsg = bfData.message;
            } else if (typeof bfData === 'object') {
                const firstError = Object.values(bfData).find(v => Array.isArray(v) && v.length > 0);
                if (firstError) {
                    errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
                } else {
                    errorMsg = Object.values(bfData)[0] || errorMsg;
                }
            }
            
            alert(`Error: ${errorMsg}`);
            
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    } catch (error) {
        console.error('Error submitting pre-BF contact form:', error);
        alert('An error occurred. Please try again.');
        
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }
}

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
    
    if (!hoursEl || !minutesEl || !secondsEl) {
        console.error('Timer elements not found in DOM');
        return;
    }
    
    hoursEl.textContent = '--';
    minutesEl.textContent = '--';
    secondsEl.textContent = '--';
    
    // Always fetch 24-hour countdown from backend API to ensure accuracy
    // Check cache only as a fallback if API fails
    const cachedTime = localStorage.getItem('black_friday_end_time');
    const cachedTimestamp = cachedTime ? parseInt(cachedTime, 10) : null;
    
    // Fetch end date from database API (backend calculates 24 hours from start date)
    try {
        console.log('Fetching 24-hour countdown from backend...');
        const response = await fetch('/api/black-friday/end-date/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Backend API response:', data);
        
        if (data.success && data.end_date_timestamp) {
            const endTimestamp = data.end_date_timestamp;
            const now = Date.now();
            
            // Check if the end time is in the future
            if (endTimestamp > now) {
                timerEndTime = endTimestamp;
                // Cache in localStorage for offline/fallback
                localStorage.setItem('black_friday_end_time', timerEndTime.toString());
                localStorage.setItem('black_friday_end_date_fetched', Date.now().toString());
                console.log('✓ Timer initialized with 24-hour countdown from backend');
                console.log('  Start date:', new Date(data.start_date_timestamp).toLocaleString());
                console.log('  End date (start + 24h):', new Date(timerEndTime).toLocaleString());
                console.log('  Time remaining:', Math.floor((timerEndTime - now) / (1000 * 60 * 60)) + ' hours');
            } else {
                // End time has passed, calculate new 24 hours from start
                console.warn('End time has passed, calculating new 24-hour period from start date');
                const startTimestamp = data.start_date_timestamp || now;
                timerEndTime = startTimestamp + (24 * 60 * 60 * 1000);
                
                // If that also passed, set it to 24 hours from now
                if (timerEndTime <= now) {
                    timerEndTime = now + (24 * 60 * 60 * 1000);
                    console.warn('Start date also passed, setting timer to 24 hours from now');
                }
                
                localStorage.setItem('black_friday_end_time', timerEndTime.toString());
            }
        } else {
            throw new Error('Invalid response from API: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Failed to fetch end date from API:', error);
        // Fallback to localStorage if API fails
        if (cachedTimestamp && cachedTimestamp > Date.now()) {
            timerEndTime = cachedTimestamp;
            console.log('Using cached end date (fallback):', new Date(timerEndTime).toLocaleString());
        } else {
            // Last resort: set to 24 hours from now
            const now = Date.now();
            timerEndTime = now + (24 * 60 * 60 * 1000); // 24 hours from now
            console.warn('Using default 24-hour countdown (from now) - please check backend connection:', new Date(timerEndTime).toLocaleString());
            // Don't cache this fallback value
        }
    }
    
    if (!timerEndTime) {
        console.error('Failed to initialize timer - no end time available');
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
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
    
    // Update immediately and force first update
    updateCountdown();
    
    // Also update after a small delay to ensure DOM is ready
    setTimeout(updateCountdown, 100);
    
    // Update every second for real-time countdown
    countdownInterval = setInterval(updateCountdown, 1000);
    
    console.log('✓ Timer countdown started, updating every second');
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
    // Skip buttons that have onclick handlers (these are contact form buttons when show_pay_button is false)
    document.querySelectorAll('.offer-card .btn-primary').forEach(button => {
        // Check if button has onclick attribute, contact-form-btn class, or if it's a contact button
        const buttonText = button.textContent.trim();
        const isContactButton = button.hasAttribute('onclick') || 
                                button.classList.contains('contact-form-btn') ||
                                buttonText.includes('Contact Us') || 
                                buttonText.includes('تواصل معنا');
        
        if (isContactButton) {
            // This is a contact form button, don't override it - let onclick handler work
            console.log('Skipping checkout redirect for contact button:', buttonText);
            return;
        }
        
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
    
    // Contact type select field - update color when valid option is selected
    const contactTypeSelect = document.getElementById('contact-type');
    if (contactTypeSelect) {
        function updateSelectColor() {
            if (contactTypeSelect.value && contactTypeSelect.value !== '') {
                contactTypeSelect.style.color = 'var(--white)';
                contactTypeSelect.style.opacity = '1';
                contactTypeSelect.classList.remove('invalid');
                contactTypeSelect.classList.add('valid');
            } else {
                contactTypeSelect.style.color = 'rgba(255, 255, 255, 0.4)';
                contactTypeSelect.style.opacity = '1';
                contactTypeSelect.classList.remove('valid');
                contactTypeSelect.classList.add('invalid');
            }
        }
        
        contactTypeSelect.addEventListener('change', updateSelectColor);
        contactTypeSelect.addEventListener('input', updateSelectColor);
        
        // Initialize color on page load
        updateSelectColor();
        
        // Also update after language change (if language update happens)
        setTimeout(updateSelectColor, 100);
    }
    
    // Auto-fill contact form
    // Auto-fill button removed for contact form
    // const autoFillBtn = document.getElementById('auto-fill-btn');
    // if (autoFillBtn) {
    //     autoFillBtn.addEventListener('click', handleAutoFillContact);
    // }
    
    // Payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
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
            const whatsappNumber = '972593700806';
            const message = encodeURIComponent(
                currentLanguage === 'ar' 
                    ? 'مرحباً! أنا مهتم بعروض الجمعة السوداء لـ FX Globals.' 
                    : 'Hi! I\'m interested in FX Globals Black Friday deals.'
            );
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        });
    }
    
    // Payment form validation on input
    const paymentFirstNameInput = document.getElementById('payment-first-name');
    const paymentLastNameInput = document.getElementById('payment-last-name');
    const paymentMobileInput = document.getElementById('payment-mobile');
    const paymentEmailInput = document.getElementById('payment-email');
    const acceptPoliciesCheckbox = document.getElementById('accept-policies');
    
    if (paymentFirstNameInput) {
        paymentFirstNameInput.addEventListener('input', validatePaymentForm);
    }
    if (paymentLastNameInput) {
        paymentLastNameInput.addEventListener('input', validatePaymentForm);
    }
    if (paymentMobileInput) {
        paymentMobileInput.addEventListener('input', validatePaymentForm);
    }
    if (paymentEmailInput) {
        paymentEmailInput.addEventListener('input', validatePaymentForm);
    }
    if (acceptPoliciesCheckbox) {
        acceptPoliciesCheckbox.addEventListener('change', validatePaymentForm);
    }
    
    // reCAPTCHA v3 doesn't use callbacks (it's invisible and executed on submit)
    // No callbacks needed for Enterprise
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
        currency: offer.currency || 'USD',
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
        
        // Reset reCAPTCHA if it exists
        // Wait a bit for reCAPTCHA to load if it hasn't already
        setTimeout(() => {
            const recaptchaWidget = document.querySelector('.g-recaptcha');
            if (recaptchaWidget && typeof grecaptcha !== 'undefined') {
                try {
                    // Find the widget ID by checking the widget container
                    const widgetIdAttr = recaptchaWidget.getAttribute('data-widget-id');
                    if (widgetIdAttr) {
                        grecaptcha.reset(parseInt(widgetIdAttr));
                    } else {
                        // If no widget ID, try to get it from the iframe
                        const iframe = recaptchaWidget.querySelector('iframe');
                        if (iframe && grecaptcha.reset) {
                            // Try resetting without ID (works for single widget)
                            grecaptcha.reset();
                        }
                    }
                } catch (e) {
                    console.warn('Could not reset reCAPTCHA:', e);
                }
            }
        }, 500);
        
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
    const currency = selectedOffer.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);
    
    document.getElementById('selected-offer-name').textContent = offerName;
    document.getElementById('selected-offer-badge').textContent = discount;
    document.getElementById('original-price').textContent = `${currencySymbol}${selectedOffer.originalPrice}`;
    document.getElementById('discount-amount').textContent = `-${currencySymbol}${selectedOffer.originalPrice - selectedOffer.price}`;
    document.getElementById('total-price').textContent = `${currencySymbol}${selectedOffer.price}`;
    const savingsAmount = selectedOffer.originalPrice - selectedOffer.price;
    const savingsAmountEl = document.getElementById('savings-amount');
    if (savingsAmountEl) {
        // Update the parent paragraph to include currency symbol
        const savingsParagraph = savingsAmountEl.closest('p');
        if (savingsParagraph) {
            savingsParagraph.innerHTML = `💰 <span data-en="You Save" data-ar="توفر">You Save</span> ${currencySymbol}<span id="savings-amount">${savingsAmount}</span>!`;
        } else {
            savingsAmountEl.textContent = savingsAmount;
        }
    }
    document.getElementById('pay-amount').textContent = selectedOffer.price;
    
    // Update pay button with currency
    const payButton = document.getElementById('pay-button');
    if (payButton && !payButton.disabled) {
        const payButtonText = payButton.innerHTML;
        // Update currency in pay button if it exists
        payButton.innerHTML = payButtonText.replace(/\$|₪|€|£/, currencySymbol);
    }
    
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
    
    // Get form data - API expects: name, phone, whatsapp, message, city (optional), contact_type
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const cityInput = document.getElementById('contact-city');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const contactTypeInput = document.getElementById('contact-type');
    
    const formData = {
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        whatsapp: phoneInput ? phoneInput.value.trim() : '', // Use phone as whatsapp
        message: messageInput ? messageInput.value.trim() : 'Contact form submission from Black Friday page',
        city: cityInput ? cityInput.value.trim() : null,
        contact_type: contactTypeInput ? (contactTypeInput.value || '') : '',
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
    
    // Validate contact type
    if (!formData.contact_type || formData.contact_type === '') {
        alert(currentLanguage === 'ar' ? 'يرجى اختيار نوع الاستفسار' : 'Please select a contact type');
        if (contactTypeInput) {
            contactTypeInput.focus();
        }
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
        // Save to Black Friday contact model
        const bfFormData = {
            name: formData.name,
            email: emailInput ? emailInput.value.trim() : '',
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            city: formData.city,
            message: formData.message,
            contact_type: formData.contact_type || 'general',
            form_type: 'main_contact',
        };
        
            const bfResponse = await fetch('/api/contacts/black-friday/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bfFormData),
            });
            
                const bfData = await bfResponse.json();
        
        if (bfResponse.ok && bfData.success) {
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
            if (bfData.message) {
                errorMsg = bfData.message;
            } else if (typeof bfData === 'object') {
                // Get first error message from validation errors
                const firstError = Object.values(bfData).find(v => Array.isArray(v) && v.length > 0);
                if (firstError) {
                    errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
                } else {
                    errorMsg = Object.values(bfData)[0] || errorMsg;
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
    const firstNameInput = document.getElementById('payment-first-name');
    const lastNameInput = document.getElementById('payment-last-name');
    const mobileInput = document.getElementById('payment-mobile');
    const emailInput = document.getElementById('payment-email');
    const acceptPolicies = document.getElementById('accept-policies');
    const payButton = document.getElementById('pay-button');
    
    if (!firstNameInput || !lastNameInput || !mobileInput || !emailInput || !payButton) {
        return;
    }
    
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const email = emailInput.value.trim();
    
    // Basic validation
    const isFirstNameValid = firstName.length >= 2;
    const isLastNameValid = lastName.length >= 2;
    const isMobileValid = mobile.length >= 8;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    // Check policy acceptance checkbox
    const isPoliciesAccepted = acceptPolicies ? acceptPolicies.checked : false;
    
    // Check reCAPTCHA v3 (invisible - always valid if API is loaded)
    let isRecaptchaValid = true;
    // reCAPTCHA v3 doesn't have a visible widget, just check if API is loaded
    if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') {
            isRecaptchaValid = false;
    }
    
    const isValid = isFirstNameValid && isLastNameValid && isMobileValid && isEmailValid && 
                    isPoliciesAccepted && isRecaptchaValid;
    
    payButton.disabled = !isValid;
    
    return isValid;
}

async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    const firstNameInput = document.getElementById('payment-first-name');
    const lastNameInput = document.getElementById('payment-last-name');
    const mobileInput = document.getElementById('payment-mobile');
    const emailInput = document.getElementById('payment-email');
    const acceptPolicies = document.getElementById('accept-policies');
    
    const formData = {
        firstName: firstNameInput ? firstNameInput.value.trim() : '',
        lastName: lastNameInput ? lastNameInput.value.trim() : '',
        mobile: mobileInput ? mobileInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
    };
    
    if (!selectedOffer) {
        alert(currentLanguage === 'ar' ? 'يرجى اختيار عرض أولاً' : 'Please select an offer first');
        return;
    }
    
    // Validate form data
    if (!formData.firstName || formData.firstName.length < 2) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال الاسم الأول صحيح' : 'Please enter a valid first name');
        return;
    }
    
    if (!formData.lastName || formData.lastName.length < 2) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال اسم العائلة صحيح' : 'Please enter a valid last name');
        return;
    }
    
    if (!formData.mobile || formData.mobile.length < 8) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال رقم جوال صحيح' : 'Please enter a valid mobile number');
        return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
        return;
    }
    
    // Validate checkbox
    if (!acceptPolicies || !acceptPolicies.checked) {
        alert(currentLanguage === 'ar' ? 'يرجى الموافقة على سياسة الخصوصية وسياسة الإرجاع والاستبدال' : 'Please accept the Privacy Policy and Return and Exchange Policy');
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
        // Get reCAPTCHA v3 token
        let recaptchaToken = '';
        const siteKey = '6Lf3vxcsAAAAAI03JSOmUJ67-DbZLh43CvnM6SAs';
        
        if (typeof grecaptcha === 'undefined') {
            console.error('grecaptcha is not defined');
            alert(currentLanguage === 'ar' ? 'جارٍ تحميل reCAPTCHA. يرجى تحديث الصفحة والمحاولة مرة أخرى.' : 'reCAPTCHA is loading. Please refresh the page and try again.');
            payButton.disabled = false;
            const currency = selectedOffer.currency || 'USD';
            const currencySymbol = getCurrencySymbol(currency);
            payButton.innerHTML = `
                <span class="lock-icon">🔒</span>
                <span>${currentLanguage === 'ar' ? 'المتابعة إلى الدفع الآمن' : 'Proceed to Secure Payment'}</span>
                ${currencySymbol}<span id="pay-amount">${selectedOffer.price}</span>
            `;
            return;
        }
        
        try {
            // Execute reCAPTCHA v3
            console.log('Executing reCAPTCHA v3...');
            
            // Execute with timeout
            const executePromise = grecaptcha.execute(siteKey, {
                action: 'payment_submit'
            });
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('reCAPTCHA execution timeout')), 10000);
            });
            
            recaptchaToken = await Promise.race([executePromise, timeoutPromise]);
            
            if (!recaptchaToken || recaptchaToken.length === 0) {
                throw new Error('Empty token received from reCAPTCHA');
            }
            
            console.log('reCAPTCHA token generated successfully:', recaptchaToken.substring(0, 20) + '...');
        } catch (error) {
            console.error('reCAPTCHA v3 error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                grecaptcha: typeof grecaptcha,
                enterprise: typeof grecaptcha?.enterprise
            });
            
            // More specific error messages
            let errorMsg = currentLanguage === 'ar' 
                ? 'خطأ في التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى.' 
                : 'reCAPTCHA verification error. Please try again.';
            
            if (error.message && error.message.includes('timeout')) {
                errorMsg = currentLanguage === 'ar'
                    ? 'انتهت مهلة reCAPTCHA. يرجى تحديث الصفحة والمحاولة مرة أخرى.'
                    : 'reCAPTCHA timeout. Please refresh the page and try again.';
            } else if (error.message && error.message.includes('Invalid site key')) {
                errorMsg = currentLanguage === 'ar'
                    ? 'مفتاح reCAPTCHA غير صحيح. يرجى الاتصال بالدعم.'
                    : 'Invalid reCAPTCHA site key. Please contact support.';
            }
            
            alert(errorMsg);
            payButton.disabled = false;
            const currency = selectedOffer.currency || 'USD';
            const currencySymbol = getCurrencySymbol(currency);
            payButton.innerHTML = `
                <span class="lock-icon">🔒</span>
                <span>${currentLanguage === 'ar' ? 'المتابعة إلى الدفع الآمن' : 'Proceed to Secure Payment'}</span>
                ${currencySymbol}<span id="pay-amount">${selectedOffer.price}</span>
            `;
            return;
        }
        
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
                currency: selectedOffer.currency || 'USD',
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobile: formData.mobile,
                offerType: selectedOffer.type,
                offerName: currentLanguage === 'ar' ? selectedOffer.nameAr : selectedOffer.name,
                source: 'black_friday',
                recaptchaToken: recaptchaToken,
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
            ₪<span id="pay-amount">${selectedOffer.price}</span>
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
    
    // Show Discord button only for annual membership
    const discordButton = document.getElementById('discord-button');
    if (discordButton && selectedOffer && selectedOffer.type === 'yearly') {
        discordButton.style.display = 'inline-block';
        discordButton.addEventListener('click', function() {
            // Discord invite link - to be configured by Abdullah Al-Nubani
            window.open('https://discord.gg/fxglobal', '_blank');
        });
    } else if (discordButton) {
        discordButton.style.display = 'none';
    }
    updateSuccessPage();
}

function updateSuccessPage() {
    if (!selectedOffer) return;
    
    document.getElementById('display-order-id').textContent = orderId;
    document.getElementById('display-email').textContent = userEmail;
    
    // Set download instructions button link
    const downloadBtn = document.getElementById('download-instructions-btn');
    if (downloadBtn && orderId) {
        downloadBtn.href = `/instructions/${orderId}/download/`;
    }
    const currency = selectedOffer.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);
    document.getElementById('saved-amount').textContent = `${currencySymbol}${selectedOffer.originalPrice - selectedOffer.price}`;
}

