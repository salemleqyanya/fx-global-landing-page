// Generate Stars
function generateStars(container, count) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        const size = Math.random();
        star.className = 'star';
        star.style.width = size > 0.7 ? '2px' : '1px';
        star.style.height = size > 0.7 ? '2px' : '1px';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.opacity = Math.random() * 0.8 + 0.2;
        if (size > 0.7) {
            star.style.boxShadow = '0 0 3px rgba(255,255,255,0.8)';
        } else {
            star.style.boxShadow = '0 0 1px rgba(255,255,255,0.5)';
        }
        container.appendChild(star);
    }
}

// Countdown Timer
class CountdownTimer {
    constructor(targetDate, containerId, size = 'large') {
        this.targetDate = new Date(targetDate);
        this.container = document.getElementById(containerId);
        this.size = size;
        this.interval = null;
        if (this.container) {
            this.init();
        }
    }

    init() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    update() {
        if (!this.container) return;
        const now = new Date();
        const difference = this.targetDate.getTime() - now.getTime();

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            if (this.size === 'large') {
                this.renderLarge(days, hours, minutes, seconds);
            } else {
                this.renderSmall(days, hours, minutes, seconds);
            }
        } else {
            if (this.interval) {
                clearInterval(this.interval);
            }
            this.container.innerHTML = '<div class="countdown-expired">انتهى الوقت</div>';
        }
    }

    renderLarge(days, hours, minutes, seconds) {
        // Display order: days, hours, minutes, seconds (RTL: right to left)
        this.container.innerHTML = `
            <div class="countdown-item">
                <div class="countdown-box-large">
                    <span class="countdown-number">${String(days).padStart(2, '0')}</span>
                </div>
                <span class="countdown-label">يوم</span>
            </div>
            <div class="countdown-item">
                <div class="countdown-box-large">
                    <span class="countdown-number">${String(hours).padStart(2, '0')}</span>
                </div>
                <span class="countdown-label">ساعة</span>
            </div>
            <div class="countdown-item">
                <div class="countdown-box-large">
                    <span class="countdown-number">${String(minutes).padStart(2, '0')}</span>
                </div>
                <span class="countdown-label">دقيقة</span>
            </div>
            <div class="countdown-item">
                <div class="countdown-box-large">
                    <span class="countdown-number">${String(seconds).padStart(2, '0')}</span>
                </div>
                <span class="countdown-label">ثانية</span>
            </div>
        `;
    }

    renderSmall(days, hours, minutes, seconds) {
        this.container.innerHTML = `
            <span class="countdown-number-small">${String(days).padStart(2, '0')}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-number-small">${String(hours).padStart(2, '0')}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-number-small">${String(minutes).padStart(2, '0')}</span>
            <span class="countdown-separator">:</span>
            <span class="countdown-number-small">${String(seconds).padStart(2, '0')}</span>
        `;
    }

    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// Initialize function
function initPhase2() {
    // Ensure hero section is visible on load
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Initialize Phase 2 elements
    const starsContainer2 = document.getElementById('starsContainer2');
    if (starsContainer2) {
        generateStars(starsContainer2, 50);
    }

    // Generate dust particles
    const dustContainer = document.getElementById('dustContainer');
    if (dustContainer) {
        for (let i = 0; i < 25; i++) {
            const dust = document.createElement('div');
            dust.className = 'dust-particle';
            dust.style.top = Math.random() * 100 + '%';
            dust.style.left = Math.random() * 100 + '%';
            dust.style.animationDelay = Math.random() * 5 + 's';
            dust.style.animationDuration = (8 + Math.random() * 4) + 's';
            dustContainer.appendChild(dust);
        }
    }

    // Initialize countdown for Phase 2
    const drawDate = '2025-03-25T00:00:00';
    const countdown2Container = document.getElementById('countdown2');
    if (countdown2Container) {
        new CountdownTimer(drawDate, 'countdown2', 'large');
    }

    // Plan selection
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // Payment buttons
    initPaymentButtons();
}

// Payment functionality
function initPaymentButtons() {
    const paymentButtons = document.querySelectorAll('[data-payment-type]');
    const paymentModal = document.getElementById('paymentModal');
    const closeModal = document.getElementById('closePaymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const paymentOfferName = document.getElementById('paymentOfferName');
    const paymentAmount = document.getElementById('paymentAmount');
    const paymentSubmitBtn = document.getElementById('paymentSubmitBtn');
    const paymentSubmitText = document.getElementById('paymentSubmitText');
    const paymentSubmitLoading = document.getElementById('paymentSubmitLoading');

    let selectedPayment = null;

    // Open payment modal when button is clicked
    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedPayment = {
                type: button.dataset.paymentType,
                amount: parseFloat(button.dataset.amount),
                offerName: button.dataset.offerName
            };
            
            paymentOfferName.textContent = selectedPayment.offerName;
            paymentAmount.textContent = selectedPayment.amount;
            
            paymentModal.classList.remove('hidden');
        });
    });

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            paymentForm.reset();
            selectedPayment = null;
        });
    }

    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal || e.target.classList.contains('payment-modal-overlay')) {
                paymentModal.classList.add('hidden');
                paymentForm.reset();
                selectedPayment = null;
            }
        });
    }

    // Handle form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!selectedPayment) {
                alert('يرجى اختيار خدمة للدفع');
                return;
            }

            const name = document.getElementById('paymentName').value.trim();
            const email = document.getElementById('paymentEmail').value.trim();
            const phone = document.getElementById('paymentPhone').value.trim();

            if (!name || !email || !phone) {
                alert('يرجى ملء جميع الحقول');
                return;
            }

            // Show loading state
            paymentSubmitText.classList.add('hidden');
            paymentSubmitLoading.classList.remove('hidden');
            paymentSubmitBtn.disabled = true;

            try {
                // Initialize payment
                const response = await fetch('/ramadan/payment/initialize/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        amount: selectedPayment.amount,
                        currency: 'ILS',
                        firstName: name.split(' ')[0] || name,
                        lastName: name.split(' ').slice(1).join(' ') || '',
                        mobile: phone.startsWith('+') ? phone : (phone.startsWith('0') ? '+970' + phone.substring(1) : '+970' + phone),
                        offerType: selectedPayment.type,
                        offerName: selectedPayment.offerName,
                        source: 'ramadan'
                    })
                });

                console.log('Payment response status:', response.status);

                // Check if response is ok
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Payment error response:', errorText);
                    let errorMessage = 'فشل في تهيئة الدفع';
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.error || errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                console.log('Payment response data:', data);

                if (data.success && data.authorization_url) {
                    // Store payment reference
                    localStorage.setItem('pending_ramadan_payment', JSON.stringify({
                        reference: data.reference,
                        email: email,
                        offerType: selectedPayment.type,
                        offerName: selectedPayment.offerName
                    }));

                    // Redirect to Lahza payment page
                    window.location.href = data.authorization_url;
                } else {
                    const errorMsg = data.error || data.message || 'فشل في تهيئة الدفع';
                    console.error('Payment initialization failed:', data);
                    throw new Error(errorMsg);
                }
            } catch (error) {
                console.error('Payment initialization error:', error);
                const errorMessage = error.message || 'حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.';
                alert(errorMessage);
                
                // Reset loading state
                paymentSubmitText.classList.remove('hidden');
                paymentSubmitLoading.classList.add('hidden');
                paymentSubmitBtn.disabled = false;
            }
        });
    }

    // Check for payment callback
    checkPaymentCallback();
}

// Check payment callback on page load
function checkPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference) {
        // Verify payment
        fetch(`/ramadan/payment/verify/?reference=${reference}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Payment successful
                const pendingPayment = JSON.parse(localStorage.getItem('pending_ramadan_payment') || '{}');
                if (pendingPayment.reference === reference) {
                    localStorage.removeItem('pending_ramadan_payment');
                    alert('تم الدفع بنجاح! شكراً لك.');
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                alert('فشل التحقق من الدفع. يرجى التواصل مع الدعم.');
            }
        })
        .catch(error => {
            console.error('Payment verification error:', error);
        });
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhase2);
} else {
    // DOM is already ready
    initPhase2();
}
