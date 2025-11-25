// Standalone Lahza Checkout Page Script
// Global state
let currentLanguage = 'en';
let selectedOffer = null;
let orderId = '';
let userEmail = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    initializeEventListeners();
    updateLanguageContent();
    loadOfferFromURL();
    loadCheckoutURL();
    checkPaymentCallback();
    checkRecaptchaEnterprise(); // Check if reCAPTCHA Enterprise is loaded
    
    // Initial form validation
    setTimeout(() => {
        validatePaymentForm();
    }, 200);
});

// Check reCAPTCHA Enterprise loading status
function checkRecaptchaEnterprise() {
    // Check multiple times as script loads asynchronously
    let attempts = 0;
    const maxAttempts = 5;
    
    const checkInterval = setInterval(() => {
        attempts++;
        const recaptchaIndicator = document.querySelector('.recaptcha-status');
        
        if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.enterprise !== 'undefined') {
            // reCAPTCHA Enterprise is loaded
            if (recaptchaIndicator) {
                const isArabic = currentLanguage === 'ar';
                recaptchaIndicator.innerHTML = `
                    <span style="color: #10b981;">✓</span> 
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 13px;">
                        ${isArabic ? 'reCAPTCHA Enterprise نشط' : 'reCAPTCHA Enterprise Active'}
                    </span>
                `;
            }
            console.log('reCAPTCHA Enterprise loaded successfully');
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
            console.error('reCAPTCHA Enterprise failed to load after', maxAttempts, 'attempts');
            clearInterval(checkInterval);
        }
    }, 500);
}

// Load checkout URL from URL parameters or use default
function loadCheckoutURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutURL = urlParams.get('checkoutUrl') || 'https://checkout.lahza.io/AvD2PbUQGy';
    
    // Store checkout URL globally - will be loaded when popup opens
    window.lahzaCheckoutURL = checkoutURL;
}

// Load offer details from URL parameters
function loadOfferFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get offer details from URL
    const offerType = urlParams.get('offer') || 'bundle';
    const price = parseFloat(urlParams.get('price')) || 136;
    const originalPrice = parseFloat(urlParams.get('originalPrice')) || 300;
    const name = urlParams.get('name') || 'Design Package + VIP Tips';
    const nameAr = urlParams.get('nameAr') || 'حزمة التداول المباشر + إشارت VIP';
    const discount = urlParams.get('discount') || '55% OFF';
    const discountAr = urlParams.get('discountAr') || 'خصم 55%';
    
    // Set selected offer
    selectedOffer = {
        type: offerType,
        name: name,
        nameAr: nameAr,
        price: price,
        originalPrice: originalPrice,
        discount: discount,
        discountAr: discountAr
    };
    
    updatePaymentPage();
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
        // Close popup if it's still open
        closeLahzaPopup();
        
        // Show payment page with loading state
        showPage('payment-page');
        const payButton = document.getElementById('pay-button');
        if (payButton) {
            payButton.disabled = true;
            payButton.innerHTML = `
                <div class="spinner"></div>
                <span>${currentLanguage === 'ar' ? 'جاري التحقق من الدفع...' : 'Verifying payment...'}</span>
            `;
        }
        
        // Verify payment with backend
        const response = await fetch(`/checkout/payment/verify/?reference=${reference}`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Get stored payment info
            const storedPayment = JSON.parse(localStorage.getItem('pending_lahza_payment') || '{}');
            orderId = data.reference || reference;
            userEmail = storedPayment.email || data.email || '';
            
            // Clear pending payment
            localStorage.removeItem('pending_lahza_payment');
            
            // Remove reference from URL to prevent re-verification on refresh
            if (window.history && window.history.replaceState) {
                const url = new URL(window.location);
                url.searchParams.delete('reference');
                url.searchParams.delete('ref');
                window.history.replaceState({}, '', url);
            }
            
            // Show success page
            showSuccessPage();
            
            // Update language content on success page
            updateLanguageContent();
        } else {
            // Payment verification failed - show declined page
            const errorMessage = data.error || data.message || (currentLanguage === 'ar' 
                ? 'فشل التحقق من الدفع' 
                : 'Payment verification failed');
            
            // Show declined page
            showDeclinedPage(reference, errorMessage);
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        const errorMessage = error.message || (currentLanguage === 'ar' 
            ? 'حدث خطأ أثناء التحقق من الدفع' 
            : 'An error occurred while verifying payment');
        
        // Show declined page on error
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference') || urlParams.get('ref') || 'Unknown';
        showDeclinedPage(reference, errorMessage);
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

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.add('active');
    }
}

// Event Listeners
function initializeEventListeners() {
    // Language toggle
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', toggleLanguage);
    }
    
    // Popup open/close handlers
    const btnOpenPopup = document.getElementById('btn-open-lahza-popup');
    const popupOverlay = document.getElementById('lahza-popup-overlay');
    const popupClose = document.getElementById('lahza-popup-close');
    
    if (btnOpenPopup) {
        btnOpenPopup.addEventListener('click', openLahzaPopup);
    }
    
    if (popupClose) {
        popupClose.addEventListener('click', closeLahzaPopup);
    }
    
    if (popupOverlay) {
        // Close popup when clicking on overlay (but not on the popup container itself)
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
    
    // reCAPTCHA Enterprise doesn't use callbacks (it's invisible and executed on submit)
    // No callbacks needed for Enterprise
    
    // Listen for messages from iframe (for payment completion)
    window.addEventListener('message', handleIframeMessage);
}


// Handle messages from iframe (if Lahza sends payment status)
function handleIframeMessage(event) {
    // Only accept messages from Lahza domain
    if (event.origin !== 'https://checkout.lahza.io' && event.origin !== 'https://lahza.io') {
        return;
    }
    
    console.log('Message from Lahza iframe:', event.data);
    
    // Handle payment completion
    if (event.data && event.data.type === 'payment_success') {
        const reference = event.data.reference || event.data.ref;
        if (reference) {
            // Close popup first
            closeLahzaPopup();
            // Small delay to ensure popup is closed
            setTimeout(() => {
                verifyPaymentAfterCallback(reference);
            }, 300);
        }
    }
    
    // Handle iframe navigation/redirect after payment
    if (event.data && (event.data.type === 'payment_complete' || event.data.status === 'success')) {
        const reference = event.data.reference || event.data.ref;
        if (reference) {
            closeLahzaPopup();
            setTimeout(() => {
                verifyPaymentAfterCallback(reference);
            }, 300);
        }
    }
}

function updatePaymentPage() {
    if (!selectedOffer) return;
    
    const offerName = currentLanguage === 'ar' ? selectedOffer.nameAr : selectedOffer.name;
    const discount = currentLanguage === 'ar' ? selectedOffer.discountAr : selectedOffer.discount;
    
    const nameEl = document.getElementById('selected-offer-name');
    const badgeEl = document.getElementById('selected-offer-badge');
    const originalPriceEl = document.getElementById('original-price');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalPriceEl = document.getElementById('total-price');
    const savingsAmountEl = document.getElementById('savings-amount');
    const payAmountEl = document.getElementById('pay-amount');
    const popupPayAmountEl = document.getElementById('popup-pay-amount');
    
    if (nameEl) nameEl.textContent = offerName;
    if (badgeEl) badgeEl.textContent = discount;
    if (originalPriceEl) originalPriceEl.textContent = `$${selectedOffer.originalPrice}`;
    if (discountAmountEl) discountAmountEl.textContent = `-$${selectedOffer.originalPrice - selectedOffer.price}`;
    if (totalPriceEl) totalPriceEl.textContent = `$${selectedOffer.price}`;
    if (savingsAmountEl) savingsAmountEl.textContent = selectedOffer.originalPrice - selectedOffer.price;
    if (payAmountEl) payAmountEl.textContent = selectedOffer.price;
    if (popupPayAmountEl) popupPayAmountEl.textContent = selectedOffer.price;
    
    // Validate form after updating payment page
    setTimeout(() => validatePaymentForm(), 100);
}

// Popup Modal Functions
function openLahzaPopup() {
    const popupOverlay = document.getElementById('lahza-popup-overlay');
    const iframe = document.getElementById('lahza-checkout-iframe');
    
    if (!popupOverlay || !iframe) {
        console.error('Popup elements not found');
        return;
    }
    
    // Load iframe URL (always reload to ensure fresh checkout)
    if (window.lahzaCheckoutURL) {
        iframe.src = window.lahzaCheckoutURL;
    }
    
    // Show popup
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
    
    // Monitor iframe for navigation changes (payment completion redirects)
    startIframeMonitoring(iframe);
    
    console.log('Lahza popup opened');
}

// Monitor iframe for URL changes (to detect payment completion)
function startIframeMonitoring(iframe) {
    try {
        // Check iframe URL periodically to detect redirects
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
                        setTimeout(() => {
                            verifyPaymentAfterCallback(reference);
                        }, 300);
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

function closeLahzaPopup() {
    const popupOverlay = document.getElementById('lahza-popup-overlay');
    
    if (!popupOverlay) {
        return;
    }
    
    // Hide popup
    popupOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
    
    console.log('Lahza popup closed');
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
        console.log('Form elements not found:', { 
            firstNameInput: !!firstNameInput, 
            lastNameInput: !!lastNameInput,
            mobileInput: !!mobileInput,
            emailInput: !!emailInput, 
            payButton: !!payButton 
        });
        return false;
    }
    
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const email = emailInput.value.trim();
    
    // Basic validation
    const isFirstNameValid = firstName.length >= 2;
    const isLastNameValid = lastName.length >= 2;
    // Mobile should have at least 8 digits (excluding country code characters like +, -, spaces)
    const mobileDigits = mobile.replace(/[^\d]/g, '');
    const isMobileValid = mobileDigits.length >= 8;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    // Check policy acceptance checkbox
    const isPoliciesAccepted = acceptPolicies ? acceptPolicies.checked : false;
    
    // Check reCAPTCHA Enterprise (invisible - always valid if API is loaded)
    let isRecaptchaValid = true;
    // reCAPTCHA Enterprise doesn't have a visible widget, just check if API is loaded
    if (typeof grecaptcha === 'undefined' || typeof grecaptcha.enterprise === 'undefined') {
        isRecaptchaValid = false;
    }
    
    const isValid = isFirstNameValid && isLastNameValid && isMobileValid && isEmailValid && 
                    isPoliciesAccepted && isRecaptchaValid;
    
    payButton.disabled = !isValid;
    
    // Update button appearance based on validation
    if (isValid) {
        payButton.classList.remove('disabled');
    } else {
        payButton.classList.add('disabled');
    }
    
    console.log('Form validation:', { firstName, lastName, mobile, email, isFirstNameValid, isLastNameValid, isMobileValid, isEmailValid, isPoliciesAccepted, isRecaptchaValid, isValid });
    
    return isValid;
}

function handleAutoFillPayment() {
    const firstNameInput = document.getElementById('payment-first-name');
    const lastNameInput = document.getElementById('payment-last-name');
    const mobileInput = document.getElementById('payment-mobile');
    const emailInput = document.getElementById('payment-email');
    const acceptPolicies = document.getElementById('accept-policies');
    
    if (currentLanguage === 'ar') {
        if (firstNameInput) firstNameInput.value = 'أحمد';
        if (lastNameInput) lastNameInput.value = 'السعيد';
        if (mobileInput) mobileInput.value = '+962791234567';
        if (emailInput) emailInput.value = 'ahmad.test@fxglobals.com';
    } else {
        if (firstNameInput) firstNameInput.value = 'John';
        if (lastNameInput) lastNameInput.value = 'Doe';
        if (mobileInput) mobileInput.value = '+962791234567';
        if (emailInput) emailInput.value = 'john.test@fxglobals.com';
    }
    
    // Auto-check policy checkbox for testing
    if (acceptPolicies) acceptPolicies.checked = true;
    
    // Validate form after auto-fill
    setTimeout(() => validatePaymentForm(), 100);
}

async function handlePaymentSubmit(e) {
    e.preventDefault();
    console.log('Payment form submitted');
    
    const firstNameInput = document.getElementById('payment-first-name');
    const lastNameInput = document.getElementById('payment-last-name');
    const mobileInput = document.getElementById('payment-mobile');
    const emailInput = document.getElementById('payment-email');
    
    if (!firstNameInput || !lastNameInput || !mobileInput || !emailInput) {
        console.error('Form inputs not found');
        return;
    }
    
    const formData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        mobile: mobileInput.value.trim(),
        email: emailInput.value.trim(),
    };
    
    console.log('Form data:', formData);
    console.log('Selected offer:', selectedOffer);
    
    if (!selectedOffer) {
        // If no offer is selected, try to load default offer
        console.warn('No offer selected, loading default offer');
        loadOfferFromURL();
        
        // If still no offer after loading, show error
        if (!selectedOffer) {
            alert(currentLanguage === 'ar' 
                ? 'يرجى اختيار عرض أولاً. يرجى التأكد من أنك قمت بزيارة صفحة الخصم أولاً.' 
                : 'Please select an offer first. Make sure you visited the offer page first.');
            return;
        }
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
    
    const mobileDigits = formData.mobile.replace(/[^\d]/g, '');
    if (!formData.mobile || mobileDigits.length < 8) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال رقم جوال صحيح' : 'Please enter a valid mobile number');
        return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert(currentLanguage === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
        return;
    }
    
    // Validate checkbox
    const acceptPolicies = document.getElementById('accept-policies');
    
    if (!acceptPolicies || !acceptPolicies.checked) {
        alert(currentLanguage === 'ar' ? 'يرجى الموافقة على سياسة الخصوصية وسياسة الإرجاع والاستبدال' : 'Please accept the Privacy Policy and Return and Exchange Policy');
        return;
    }
    
    // Disable button and show processing
    const payButton = document.getElementById('pay-button');
    if (!payButton) {
        console.error('Pay button not found');
        return;
    }
    
    payButton.disabled = true;
    const originalButtonHTML = payButton.innerHTML;
    payButton.innerHTML = `
        <div class="spinner"></div>
        <span>${currentLanguage === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
    `;
    
    try {
        // Get reCAPTCHA Enterprise token
        let recaptchaToken = '';
        const siteKey = '6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY';
        
        if (typeof grecaptcha === 'undefined') {
            console.error('grecaptcha is not defined');
            alert(currentLanguage === 'ar' ? 'جارٍ تحميل reCAPTCHA. يرجى تحديث الصفحة والمحاولة مرة أخرى.' : 'reCAPTCHA is loading. Please refresh the page and try again.');
            payButton.disabled = false;
            payButton.innerHTML = originalButtonHTML;
            return;
        }
        
        if (typeof grecaptcha.enterprise === 'undefined') {
            console.error('grecaptcha.enterprise is not defined');
            alert(currentLanguage === 'ar' ? 'خطأ في تحميل reCAPTCHA Enterprise. يرجى التحقق من اتصال الإنترنت.' : 'reCAPTCHA Enterprise failed to load. Please check your internet connection.');
            payButton.disabled = false;
            payButton.innerHTML = originalButtonHTML;
            return;
        }
        
        try {
            // Wait for Enterprise to be ready
            await grecaptcha.enterprise.ready();
            console.log('reCAPTCHA Enterprise ready, executing...');
            
            // Execute with timeout
            const executePromise = grecaptcha.enterprise.execute(siteKey, {
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
            
            console.log('reCAPTCHA token generated successfully');
        } catch (error) {
            console.error('reCAPTCHA Enterprise error:', error);
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
            payButton.innerHTML = originalButtonHTML;
            return;
        }
        
        console.log('Initializing payment with:', {
            email: formData.email,
            amount: selectedOffer.price,
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobile: formData.mobile,
            offerType: selectedOffer.type,
            source: 'checkout',
        });
        
        // Initialize Lahza payment
        const response = await fetch('/checkout/payment/initialize/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                email: formData.email,
                amount: selectedOffer.price,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobile: formData.mobile,
                offerType: selectedOffer.type,
                offerName: currentLanguage === 'ar' ? selectedOffer.nameAr : selectedOffer.name,
                source: 'checkout',
                recaptchaToken: recaptchaToken,
            }),
        });
        
        console.log('Response status:', response.status);
        
        // Check if response is ok
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Payment initialization failed:', errorText);
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: errorText || 'Failed to initialize payment' };
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.authorization_url) {
            // Store payment reference for verification
            localStorage.setItem('pending_lahza_payment', JSON.stringify({
                reference: data.reference,
                email: formData.email,
                offerType: selectedOffer.type,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobile: formData.mobile,
            }));
            
            console.log('Payment initialized successfully. Reference:', data.reference);
            console.log('Redirecting to:', data.authorization_url);
            
            // Redirect to Lahza payment page
            window.location.href = data.authorization_url;
        } else {
            const errorMessage = data.error || data.message || 'Failed to initialize payment';
            console.error('Payment initialization failed:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Payment initialization error:', error);
        payButton.disabled = false;
        payButton.innerHTML = originalButtonHTML;
        
        // Show user-friendly error message
        const errorMessage = error.message || (currentLanguage === 'ar' 
            ? 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.' 
            : 'An error occurred while processing payment. Please try again.');
        
        alert(errorMessage);
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
    // Ensure popup is closed
    closeLahzaPopup();
    
    // Show success page
    showPage('success-page');
    updateSuccessPage();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSuccessPage() {
    if (!selectedOffer) return;
    
    const orderIdEl = document.getElementById('display-order-id');
    const emailEl = document.getElementById('display-email');
    const savedAmountEl = document.getElementById('saved-amount');
    
    if (orderIdEl) orderIdEl.textContent = orderId;
    if (emailEl) emailEl.textContent = userEmail;
    if (savedAmountEl) savedAmountEl.textContent = `$${selectedOffer.originalPrice - selectedOffer.price}`;
}

function showDeclinedPage(reference, errorMessage) {
    // Ensure popup is closed
    closeLahzaPopup();
    
    // Show declined page
    showPage('declined-page');
    updateDeclinedPage(reference, errorMessage);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update language content
    updateLanguageContent();
}

function updateDeclinedPage(reference, errorMessage) {
    const referenceEl = document.getElementById('declined-reference');
    const errorMessageEl = document.getElementById('declined-error-message');
    
    if (referenceEl) referenceEl.textContent = reference;
    if (errorMessageEl) {
        // Make error message more user-friendly
        let friendlyMessage = errorMessage;
        
        // Translate common error messages
        if (currentLanguage === 'ar') {
            if (errorMessage.toLowerCase().includes('declined') || errorMessage.toLowerCase().includes('failed')) {
                friendlyMessage = 'تم رفض الدفع من قبل البنك أو مصدر البطاقة';
            } else if (errorMessage.toLowerCase().includes('insufficient')) {
                friendlyMessage = 'الرصيد غير كافٍ لإتمام المعاملة';
            } else if (errorMessage.toLowerCase().includes('expired')) {
                friendlyMessage = 'انتهت صلاحية البطاقة';
            } else if (errorMessage.toLowerCase().includes('invalid')) {
                friendlyMessage = 'تفاصيل البطاقة غير صحيحة';
            }
        } else {
            if (errorMessage.toLowerCase().includes('declined') || errorMessage.toLowerCase().includes('failed')) {
                friendlyMessage = 'Payment was declined by your bank or card issuer';
            } else if (errorMessage.toLowerCase().includes('insufficient')) {
                friendlyMessage = 'Insufficient funds to complete the transaction';
            } else if (errorMessage.toLowerCase().includes('expired')) {
                friendlyMessage = 'Card has expired';
            } else if (errorMessage.toLowerCase().includes('invalid')) {
                friendlyMessage = 'Invalid card details';
            }
        }
        
        errorMessageEl.textContent = friendlyMessage;
    }
}

