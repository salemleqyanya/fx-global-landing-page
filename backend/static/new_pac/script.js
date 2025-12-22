// Countdown Timer
function initCountdown() {
    const targetDate = new Date("2026-01-01T00:00:00").getTime();
    let prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
    
    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            const daysBox = daysEl.closest('.timer-box');
            const hoursBox = hoursEl.closest('.timer-box');
            const minutesBox = minutesEl.closest('.timer-box');
            const secondsBox = secondsEl.closest('.timer-box');
            
            if (days !== prevValues.days) {
                daysEl.textContent = days.toString().padStart(2, '0');
                if (daysBox) {
                    daysBox.classList.add('updating');
                    setTimeout(() => daysBox.classList.remove('updating'), 500);
                }
            }
            if (hours !== prevValues.hours) {
                hoursEl.textContent = hours.toString().padStart(2, '0');
                if (hoursBox) {
                    hoursBox.classList.add('updating');
                    setTimeout(() => hoursBox.classList.remove('updating'), 500);
                }
            }
            if (minutes !== prevValues.minutes) {
                minutesEl.textContent = minutes.toString().padStart(2, '0');
                if (minutesBox) {
                    minutesBox.classList.add('updating');
                    setTimeout(() => minutesBox.classList.remove('updating'), 500);
                }
            }
            if (seconds !== prevValues.seconds) {
                secondsEl.textContent = seconds.toString().padStart(2, '0');
                if (secondsBox) {
                    secondsBox.classList.add('updating');
                    setTimeout(() => secondsBox.classList.remove('updating'), 500);
                }
            }
            
            prevValues = { days, hours, minutes, seconds };
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Scroll to Pricing
function scrollToPricing() {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Payment state
let selectedPlan = {
    type: null,
    amount: null,
    name: null
};

// Open Payment Modal
function openPayment(planType = 'bundle', amount = 666, planName = 'الباقة الأقوى') {
    selectedPlan = {
        type: planType,
        amount: amount,
        name: planName
    };
    
    // Update modal with plan info
    document.getElementById('selected-plan-name').textContent = planName;
    document.getElementById('selected-plan-price').textContent = amount + '₪';
    document.getElementById('payment-btn-amount').textContent = amount + '₪';
    
    // Reset form
    document.getElementById('paymentForm').reset();
    
    // Show modal
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Payment Modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    selectedPlan = { type: null, amount: null, name: null };
}

// Get CSRF Token
function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}

// Handle Payment Form Submission
async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    if (!selectedPlan.type || !selectedPlan.amount) {
        alert('يرجى اختيار خطة أولاً');
        return;
    }
    
    const formData = {
        fullName: document.getElementById('payment-name').value.trim(),
        email: document.getElementById('payment-email').value.trim(),
        phone: document.getElementById('payment-phone').value.trim() || null,
    };
    
    // Validate form
    if (!formData.fullName || formData.fullName.length < 2) {
        alert('يرجى إدخال اسم صحيح');
        return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return;
    }
    
    // Disable button and show processing
    const submitBtn = document.getElementById('submit-payment-btn');
    const btnText = document.getElementById('payment-btn-text');
    submitBtn.disabled = true;
    btnText.textContent = 'جاري المعالجة...';
    
    try {
        // Initialize Lahza payment
        const response = await fetch('/pricing/payment/initialize/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                email: formData.email,
                amount: selectedPlan.amount,
                fullName: formData.fullName,
                mobile: formData.phone,
                offerType: selectedPlan.type,
                offerName: selectedPlan.name,
                source: 'pricing',
                currency: 'ILS',
            }),
        });
        
        const data = await response.json();
        
        if (data.success && data.authorization_url) {
            // Store payment reference for verification
            localStorage.setItem('pending_lahza_payment', JSON.stringify({
                reference: data.reference,
                email: formData.email,
                offerType: selectedPlan.type,
                fullName: formData.fullName,
            }));
            
            // Redirect to Lahza payment page
            window.location.href = data.authorization_url;
        } else {
            throw new Error(data.error || 'Failed to initialize payment');
        }
    } catch (error) {
        console.error('Payment initialization error:', error);
        submitBtn.disabled = false;
        btnText.textContent = '🔒 ادفع الآن';
        alert('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.');
    }
}

// Check payment callback on page load
function checkPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference) {
        // User is returning from Lahza payment
        verifyPaymentAfterCallback(reference);
    }
}

// Verify payment after callback
async function verifyPaymentAfterCallback(reference) {
    try {
        const response = await fetch(`/pricing/payment/verify/?reference=${reference}`);
        const data = await response.json();
        
        if (data.success) {
            // Get stored payment info
            const storedPayment = JSON.parse(localStorage.getItem('pending_lahza_payment') || '{}');
            
            // Clear pending payment
            localStorage.removeItem('pending_lahza_payment');
            
            // Redirect to success page
            window.location.href = `/pricing/payment/success/${reference}/`;
        } else {
            alert('فشل التحقق من الدفع. يرجى التواصل مع الدعم.');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        alert('حدث خطأ أثناء التحقق من الدفع. يرجى المحاولة مرة أخرى.');
    }
}

// Membership Modal
let currentSlide = 0;
const totalSlides = 3;

function openMembershipModal() {
    const modal = document.getElementById('membershipModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentSlide = 0;
        updateCarousel();
    }
}

function closeMembershipModal() {
    const modal = document.getElementById('membershipModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Carousel state management - separate for each carousel
const carouselStates = new Map();

function getCarouselState(container) {
    if (!carouselStates.has(container)) {
        const slides = container.querySelectorAll('.carousel-slide');
        carouselStates.set(container, {
            currentSlide: 0,
            totalSlides: slides.length
        });
    }
    return carouselStates.get(container);
}

function nextSlide(event) {
    let container = null;
    
    if (event && event.target) {
        // Find the carousel container from the clicked button
        const carousel = event.target.closest('.educational-carousel, .modal-carousel');
        if (carousel) {
            container = carousel.querySelector('.carousel-container');
        } else {
            // Try finding by going up to find carousel wrapper
            const nav = event.target.closest('.carousel-nav');
            if (nav) {
                const parent = nav.parentElement;
                container = parent.querySelector('.carousel-container');
            }
        }
    }
    
    if (!container) {
        // Fallback to global carousel
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        return;
    }
    
    const state = getCarouselState(container);
    state.currentSlide = (state.currentSlide + 1) % state.totalSlides;
    updateCarouselForContainer(container);
}

function prevSlide(event) {
    let container = null;
    
    if (event && event.target) {
        // Find the carousel container from the clicked button
        const carousel = event.target.closest('.educational-carousel, .modal-carousel');
        if (carousel) {
            container = carousel.querySelector('.carousel-container');
        } else {
            // Try finding by going up to find carousel wrapper
            const nav = event.target.closest('.carousel-nav');
            if (nav) {
                const parent = nav.parentElement;
                container = parent.querySelector('.carousel-container');
            }
        }
    }
    
    if (!container) {
        // Fallback to global carousel
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
        return;
    }
    
    const state = getCarouselState(container);
    state.currentSlide = (state.currentSlide - 1 + state.totalSlides) % state.totalSlides;
    updateCarouselForContainer(container);
}

function goToSlide(index, event) {
    let container = null;
    
    if (event && event.target) {
        // Find the carousel container from the clicked dot
        const carousel = event.target.closest('.educational-carousel, .modal-carousel');
        if (carousel) {
            container = carousel.querySelector('.carousel-container');
        } else {
            // Try finding by going up to find carousel wrapper
            const dot = event.target.closest('.dot');
            if (dot) {
                const carouselWrapper = dot.closest('.educational-carousel, .modal-carousel');
                if (carouselWrapper) {
                    container = carouselWrapper.querySelector('.carousel-container');
                }
            }
        }
    }
    
    if (!container) {
        // Fallback to global carousel
        currentSlide = index;
        updateCarousel();
        return;
    }
    
    const state = getCarouselState(container);
    state.currentSlide = index;
    updateCarouselForContainer(container);
}

function updateCarouselForContainer(container) {
    const state = getCarouselState(container);
    const slides = container.querySelectorAll('.carousel-slide');
    const carousel = container.closest('.educational-carousel, .modal-carousel');
    const dots = carousel ? carousel.querySelectorAll('.dot') : [];
    
    slides.forEach((slide, index) => {
        if (index === state.currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    dots.forEach((dot, index) => {
        if (index === state.currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateCarousel() {
    // Update all carousels
    document.querySelectorAll('.carousel-container').forEach(container => {
        updateCarouselForContainer(container);
    });
    
    // Also update global carousel for backward compatibility
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Touch swipe for carousel
let touchStartX = 0;
let touchEndX = 0;

const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    if (touchStartX - touchEndX > 75) {
        nextSlide();
    }
    if (touchStartX - touchEndX < -75) {
        prevSlide();
    }
}

// Keyboard navigation for modal
document.addEventListener('keydown', (e) => {
    const membershipModal = document.getElementById('membershipModal');
    const paymentModal = document.getElementById('paymentModal');
    
    if (membershipModal && membershipModal.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
            prevSlide();
        }
        if (e.key === 'ArrowLeft') {
            nextSlide();
        }
        if (e.key === 'Escape') {
            closeMembershipModal();
        }
    }
    
    if (paymentModal && paymentModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closePaymentModal();
        }
    }
});

// Close modal when clicking outside
const modalOverlay = document.getElementById('membershipModal');
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeMembershipModal();
        }
    });
}

// Image Lightbox - Using assets from assets-config.js
// Get images from educational carousel slides ONLY (to avoid duplicates from modal)
function getCarouselImages() {
    // Only get images from the educational carousel section, specifically those with the clickable class
    const educationalCarousel = document.querySelector('.educational-content-section .educational-carousel');
    if (educationalCarousel) {
        const slides = educationalCarousel.querySelectorAll('.carousel-slide img.carousel-image-clickable');
        if (slides.length > 0) {
            // Get exactly 3 images in order
            const images = Array.from(slides).slice(0, 3).map(img => img.src);
            // Remove any duplicates
            const uniqueImages = [...new Set(images)];
            return uniqueImages.length === 3 ? uniqueImages : images.slice(0, 3);
        }
    }
    // Fallback: return empty array or default paths
    return [];
}

let currentImageIndex = 0;

function openLightbox(index) {
    // Refresh images array in case DOM has changed - only from educational carousel
    const carouselImages = getCarouselImages();
    if (carouselImages.length > 0 && index >= 0 && index < carouselImages.length) {
        currentImageIndex = index;
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCounter = document.getElementById('lightboxCounter');

        if (lightbox && lightboxImage && lightboxCounter) {
            lightboxImage.src = carouselImages[index];
            lightboxCounter.textContent = `${index + 1} / ${carouselImages.length}`;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function lightboxNext() {
    const carouselImages = getCarouselImages();
    if (carouselImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
        updateLightbox();
    }
}

function lightboxPrev() {
    const carouselImages = getCarouselImages();
    if (carouselImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + carouselImages.length) % carouselImages.length;
        updateLightbox();
    }
}

function updateLightbox() {
    const carouselImages = getCarouselImages();
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCounter = document.getElementById('lightboxCounter');
    
    if (lightboxImage && lightboxCounter && carouselImages.length > 0) {
        // Ensure index is within bounds
        if (currentImageIndex >= carouselImages.length) {
            currentImageIndex = 0;
        }
        if (currentImageIndex < 0) {
            currentImageIndex = carouselImages.length - 1;
        }
        lightboxImage.src = carouselImages[currentImageIndex];
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${carouselImages.length}`;
    }
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
            lightboxPrev();
        }
        if (e.key === 'ArrowLeft') {
            lightboxNext();
        }
        if (e.key === 'Escape') {
            closeLightbox();
        }
    }
});

// Touch swipe for lightbox
let lightboxTouchStartX = 0;
let lightboxTouchEndX = 0;

const lightboxImageContainer = document.querySelector('.lightbox-image-container');
if (lightboxImageContainer) {
    lightboxImageContainer.addEventListener('touchstart', (e) => {
        lightboxTouchStartX = e.changedTouches[0].screenX;
    });
    
    lightboxImageContainer.addEventListener('touchend', (e) => {
        lightboxTouchEndX = e.changedTouches[0].screenX;
        handleLightboxSwipe();
    });
}

function handleLightboxSwipe() {
    if (lightboxTouchStartX - lightboxTouchEndX > 75) {
        lightboxNext();
    }
    if (lightboxTouchStartX - lightboxTouchEndX < -75) {
        lightboxPrev();
    }
}

// Close lightbox when clicking outside
const lightboxOverlay = document.getElementById('lightbox');
if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) {
            closeLightbox();
        }
    });
}

// Prevent image click from closing lightbox
const lightboxImage = document.getElementById('lightboxImage');
if (lightboxImage) {
    lightboxImage.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Background Effects
function initBackgroundEffects() {
    // Only on desktop
    if (window.innerWidth < 768) {
        console.log('Background effects: Mobile detected, skipping animations');
        return;
    }
    
    console.log('Initializing background effects...');
    
    try {
        initSnowfall();
        initChristmasLights();
        initFallingGifts();
        initChristmasStars();
        initFloatingMoney();
        initTradingCandles();
        console.log('Background effects initialized successfully');
    } catch (error) {
        console.error('Error initializing background effects:', error);
    }
}

// Snowfall Animation
function initSnowfall() {
    const container = document.getElementById('snowfall');
    if (!container) {
        console.warn('Snowfall container not found');
        return;
    }
    
    // Clear existing snowflakes
    container.innerHTML = '';
    
    const snowflakeCount = 30;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        const size = 3 + Math.random() * 5;
        const x = Math.random() * 100;
        const duration = 10 + Math.random() * 8;
        const delay = Math.random() * 3;
        
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        snowflake.style.left = x + '%';
        snowflake.style.top = '-20px';
        snowflake.style.animationDuration = duration + 's';
        snowflake.style.animationDelay = delay + 's';
        
        container.appendChild(snowflake);
    }
}

// Floating Money Animation
function initFloatingMoney() {
    const container = document.getElementById('floatingMoney');
    if (!container) {
        console.warn('Floating money container not found');
        return;
    }
    
    // Clear existing money symbols
    container.innerHTML = '';
    
    const symbols = ['$', '$', '$', '$', '$', '$', '$'];
    
    symbols.forEach((symbol, i) => {
        const money = document.createElement('div');
        money.className = 'floating-money';
        money.textContent = symbol;
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const color = i % 2 === 0 ? '#694393' : '#DF2E88';
        const duration = 7 + i;
        const delay = i * 1.2;
        
        money.style.left = x + '%';
        money.style.top = y + '%';
        money.style.color = color;
        money.style.animationDuration = duration + 's';
        money.style.animationDelay = delay + 's';
        
        container.appendChild(money);
    });
}

// Christmas Lights Animation
function initChristmasLights() {
    const container = document.getElementById('christmasLights');
    if (!container) {
        console.warn('Christmas lights container not found');
        return;
    }
    
    // Clear existing lights
    container.innerHTML = '';
    
    // Create SVG for lights
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    
    // Wire
    const wire = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    wire.setAttribute('x1', '0');
    wire.setAttribute('y1', '20');
    wire.setAttribute('x2', '100%');
    wire.setAttribute('y2', '20');
    wire.setAttribute('stroke', 'rgba(255,255,255,0.1)');
    wire.setAttribute('stroke-width', '2');
    svg.appendChild(wire);
    
    const colors = ['#FFD700', '#FFF8DC', '#F0E68C'];
    
    for (let i = 0; i < 20; i++) {
        const x = (i * 5) + 2;
        const color = colors[i % 3];
        const delay = i * 0.15;
        
        // Wire connection
        const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        connection.setAttribute('x1', x + '%');
        connection.setAttribute('y1', '20');
        connection.setAttribute('x2', x + '%');
        connection.setAttribute('y2', '30');
        connection.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        connection.setAttribute('stroke-width', '2');
        svg.appendChild(connection);
        
        // Light bulb
        const light = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        light.setAttribute('cx', x + '%');
        light.setAttribute('cy', '35');
        light.setAttribute('r', '3');
        light.setAttribute('fill', color);
        light.style.animation = `lightBlink 2s ease-in-out ${delay}s infinite`;
        svg.appendChild(light);
        
        // Reflection
        const reflection = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        reflection.setAttribute('cx', x + '%');
        reflection.setAttribute('cy', '35');
        reflection.setAttribute('r', '1');
        reflection.setAttribute('fill', 'white');
        reflection.setAttribute('opacity', '0.6');
        svg.appendChild(reflection);
    }
    
    container.appendChild(svg);
}

// Falling Gifts Animation
function initFallingGifts() {
    const container = document.getElementById('fallingGifts');
    if (!container) {
        console.warn('Falling gifts container not found');
        return;
    }
    
    // Clear existing gifts
    container.innerHTML = '';
    
    const giftCount = 8;
    
    for (let i = 0; i < giftCount; i++) {
        const gift = document.createElement('div');
        gift.className = 'falling-gift';
        
        const x = Math.random() * 100;
        const duration = 15 + Math.random() * 10;
        const delay = Math.random() * 10;
        const size = 20 + Math.random() * 10;
        const initialRotation = Math.random() * 360;
        
        gift.style.left = x + '%';
        gift.style.top = '-100px';
        gift.style.width = size + 'px';
        gift.style.height = size + 'px';
        gift.style.color = 'rgba(255, 255, 255, 0.4)';
        gift.style.filter = `drop-shadow(0 0 ${size / 3}px rgba(255, 215, 0, 0.3))`;
        
        // Create SVG gift icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '3');
        rect.setAttribute('y', '8');
        rect.setAttribute('width', '18');
        rect.setAttribute('height', '12');
        rect.setAttribute('rx', '2');
        svg.appendChild(rect);
        
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path1.setAttribute('d', 'M12 8v12');
        svg.appendChild(path1);
        
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M3 14h18');
        svg.appendChild(path2);
        
        const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path3.setAttribute('d', 'M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2');
        svg.appendChild(path3);
        
        gift.appendChild(svg);
        
        // Combined animation for fall and rotation
        gift.style.animation = `giftFallRotate ${duration}s linear ${delay}s infinite, giftScale 2.5s ease-in-out ${delay}s infinite`;
        gift.style.setProperty('--initial-rotation', initialRotation + 'deg');
        
        container.appendChild(gift);
    }
}

// Add gift fall with rotation animation
const giftStyle = document.createElement('style');
giftStyle.textContent += `
@keyframes giftFallRotate {
    0% {
        transform: translateY(-100px) rotate(var(--initial-rotation, 0deg));
    }
    100% {
        transform: translateY(110vh) rotate(calc(var(--initial-rotation, 0deg) + 360deg));
    }
}
`;
document.head.appendChild(giftStyle);

// Add gift scale animation
const style = document.createElement('style');
style.textContent += `
@keyframes giftScale {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
`;
document.head.appendChild(style);

// Christmas Stars Animation
function initChristmasStars() {
    const container = document.getElementById('christmasStars');
    if (!container) {
        console.warn('Christmas stars container not found');
        return;
    }
    
    // Clear existing stars
    container.innerHTML = '';
    
    const starCount = 15;
    const starSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'christmas-star';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        const size = 14 + Math.random() * 16;
        
        star.style.left = x + '%';
        star.style.top = y + '%';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.color = 'rgba(255, 255, 255, 0.7)';
        star.style.animationDelay = delay + 's';
        star.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))';
        star.innerHTML = starSVG;
        
        container.appendChild(star);
    }
}


// Trading Candles Animation
function initTradingCandles() {
    const container = document.getElementById('tradingCandles');
    if (!container) {
        console.warn('Trading candles container not found');
        return;
    }
    
    // Clear existing candles
    container.innerHTML = '';
    
    const candleCount = 20;
    
    for (let i = 0; i < candleCount; i++) {
        const candle = document.createElement('div');
        candle.className = 'trading-candle';
        
        const x = (i * 6) + Math.random() * 3;
        const height = 25 + Math.random() * 50;
        const isGreen = Math.random() > 0.5;
        const delay = Math.random() * 3;
        const color = isGreen ? '#694393' : '#DF2E88';
        
        candle.style.left = x + '%';
        candle.style.bottom = '50%';
        candle.style.animationDelay = delay + 's';
        
        const body = document.createElement('div');
        body.className = 'candle-body';
        body.style.height = height + 'px';
        body.style.background = color;
        body.style.animationDelay = delay + 's';
        
        const wick = document.createElement('div');
        wick.className = 'candle-wick';
        wick.style.background = color;
        wick.style.animationDelay = delay + 's';
        
        candle.appendChild(wick);
        candle.appendChild(body);
        container.appendChild(candle);
    }
}

// Banner Snowflakes
function initBannerSnowflakes() {
    const container = document.getElementById('bannerSnowflakes');
    if (!container || window.innerWidth < 768) return;
    
    const snowflakeSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
    
    // Top left corner
    const snowflake1 = document.createElement('div');
    snowflake1.className = 'banner-snowflake';
    snowflake1.style.left = '5%';
    snowflake1.style.top = '10%';
    snowflake1.style.animationDelay = '0s';
    snowflake1.innerHTML = snowflakeSVG;
    container.appendChild(snowflake1);
    
    // Top right corner
    const snowflake2 = document.createElement('div');
    snowflake2.className = 'banner-snowflake';
    snowflake2.style.left = '95%';
    snowflake2.style.top = '10%';
    snowflake2.style.animationDelay = '1s';
    snowflake2.innerHTML = snowflakeSVG;
    container.appendChild(snowflake2);
    
    // Additional snowflakes across the top
    for (let i = 0; i < 4; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'banner-snowflake';
        snowflake.style.left = `${20 + (i * 20)}%`;
        snowflake.style.top = '20%';
        snowflake.style.animationDelay = (i * 0.6 + 2) + 's';
        snowflake.innerHTML = snowflakeSVG;
        container.appendChild(snowflake);
    }
}

// Test function to verify animations
function testAnimations() {
    const containers = {
        snowfall: document.getElementById('snowfall'),
        christmasLights: document.getElementById('christmasLights'),
        fallingGifts: document.getElementById('fallingGifts'),
        christmasStars: document.getElementById('christmasStars'),
        floatingMoney: document.getElementById('floatingMoney'),
        tradingCandles: document.getElementById('tradingCandles')
    };
    
    console.log('Animation containers check:');
    Object.keys(containers).forEach(key => {
        const container = containers[key];
        if (container) {
            console.log(`✓ ${key}: found, children: ${container.children.length}, visible: ${window.getComputedStyle(container).display !== 'none'}`);
        } else {
            console.error(`✗ ${key}: NOT FOUND`);
        }
    });
    
    const bgEffects = document.querySelector('.background-effects');
    if (bgEffects) {
        const style = window.getComputedStyle(bgEffects);
        console.log(`Background effects container: display=${style.display}, visibility=${style.visibility}, width=${window.innerWidth}px`);
    } else {
        console.error('Background effects container NOT FOUND');
    }
}

// Initialize payment form
function initPaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    // Close modal when clicking outside
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                closePaymentModal();
            }
        });
    }
}

// Contact Form Handler
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.contact-submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ جاري الإرسال...</span>';
    
    // Get form data
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        address: formData.get('address'),
        message: formData.get('message')
    };
    
    try {
        // Send to backend
        const response = await fetch('/pricing/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success
            submitBtn.innerHTML = '<span>✅ تم الإرسال بنجاح!</span>';
            form.reset();
            
            // Show success message inline
            showContactMessage('success', 'شكراً لك! فريقنا رح يتواصل معك خلال أقل من 24 ساعة.');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 3000);
        } else {
            throw new Error(result.error || 'حدث خطأ أثناء الإرسال');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showContactMessage('error', 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.');
    }
}

function showContactMessage(type, message) {
    const messageEl = document.getElementById('contactMessage');
    if (!messageEl) return;
    
    const messageIcon = messageEl.querySelector('.message-icon');
    const messageText = messageEl.querySelector('.message-text');
    
    if (!messageIcon || !messageText) return;
    
    // Clear any previous show class
    messageEl.classList.remove('show');
    
    // Set message content
    messageText.textContent = message;
    
    // Set icon and styling based on type
    if (type === 'success') {
        messageIcon.textContent = '✅';
        messageEl.className = 'contact-message contact-message-success';
    } else {
        messageIcon.textContent = '⚠️';
        messageEl.className = 'contact-message contact-message-error';
    }
    
    // Show message with animation
    messageEl.style.display = 'block';
    
    // Force reflow for animation
    messageEl.offsetHeight;
    
    setTimeout(() => {
        messageEl.classList.add('show');
        
        // Scroll message into view smoothly
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 10);
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideContactMessage();
        }, 5000);
    }
}

function hideContactMessage() {
    const messageEl = document.getElementById('contactMessage');
    if (messageEl) {
        messageEl.classList.remove('show');
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 300);
    }
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Helper function to get CSRF token
function getCookie(name) {
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
    return cookieValue;
}

// Initialize on page load
function initializeApp() {
    console.log('Initializing app...');
    console.log('Window width:', window.innerWidth);
    
    // Check payment callback first
    checkPaymentCallback();
    
    initCountdown();
    initBackgroundEffects();
    initBannerSnowflakes();
    initPaymentForm();
    initContactForm();
    updateCarousel(); // Initialize educational carousel
    
    // Test after a short delay
    setTimeout(() => {
        testAnimations();
    }, 500);
}

// Try multiple initialization methods to ensure it runs
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

// Also try window.onload as fallback
window.addEventListener('load', () => {
    console.log('Window loaded, checking animations...');
    // Double-check if animations were initialized
    const snowfall = document.getElementById('snowfall');
    if (snowfall && snowfall.children.length === 0 && window.innerWidth >= 768) {
        console.log('Re-initializing background effects on window load...');
        initBackgroundEffects();
        setTimeout(testAnimations, 500);
    }
});

// Reinitialize on resize (for responsive)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Clear existing effects
        const snowfall = document.getElementById('snowfall');
        const floatingMoney = document.getElementById('floatingMoney');
        const tradingCandles = document.getElementById('tradingCandles');
        
        if (snowfall) snowfall.innerHTML = '';
        const christmasLights = document.getElementById('christmasLights');
        const fallingGifts = document.getElementById('fallingGifts');
        const christmasStars = document.getElementById('christmasStars');
        if (floatingMoney) floatingMoney.innerHTML = '';
        if (tradingCandles) tradingCandles.innerHTML = '';
        if (christmasLights) christmasLights.innerHTML = '';
        if (fallingGifts) fallingGifts.innerHTML = '';
        if (christmasStars) christmasStars.innerHTML = '';
        
        // Reinitialize
        initBackgroundEffects();
    }, 250);
});

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all carousels
    document.querySelectorAll('.carousel-container').forEach(container => {
        updateCarouselForContainer(container);
    });
    
    // Also initialize global carousel for backward compatibility
    updateCarousel();
});

