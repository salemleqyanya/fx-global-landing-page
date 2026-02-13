// Generate Stars
function generateStars(container, count) {
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
        star.style.opacity = Math.random() * 0.6 + 0.4;
        if (size > 0.7) {
            star.style.boxShadow = '0 0 3px rgba(255,255,255,0.8)';
        } else {
            star.style.boxShadow = '0 0 1px rgba(255,255,255,0.5)';
        }
        container.appendChild(star);
    }
}

// Initialize Stars for Phase 1
const starsContainer1 = document.getElementById('starsContainer1');
if (starsContainer1) {
    generateStars(starsContainer1, 50);
}

// Countdown Timer
class CountdownTimer {
    constructor(targetDate, containerId, size = 'large') {
        this.targetDate = new Date(targetDate);
        this.container = document.getElementById(containerId);
        this.size = size;
        this.interval = null;
        this.init();
    }

    init() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    update() {
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

// Initialize Countdown for Phase 1
const ramadanStartDate = '2026-03-01T00:00:00';
let countdown1 = null;
const countdown1Container = document.getElementById('countdown1');
if (countdown1Container) {
    countdown1 = new CountdownTimer(ramadanStartDate, 'countdown1', 'large');
}

// Form Submission
const registrationForm = document.getElementById('registrationForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoading = document.getElementById('submitLoading');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        submitText.classList.add('hidden');
        submitLoading.classList.remove('hidden');
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Hide form, show success
            registrationForm.classList.add('hidden');
            formSuccess.classList.remove('hidden');
            
            // Reset form
            nameInput.value = '';
            emailInput.value = '';
            phoneInput.value = '';

            // Hide success after 3 seconds
            setTimeout(() => {
                formSuccess.classList.add('hidden');
                registrationForm.classList.remove('hidden');
                submitText.classList.remove('hidden');
                submitLoading.classList.add('hidden');
                submitBtn.disabled = false;
            }, 3000);
        }, 1500);
    });
}
