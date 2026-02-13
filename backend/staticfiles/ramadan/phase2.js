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
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhase2);
} else {
    // DOM is already ready
    initPhase2();
}
