// Phase Toggle
let isPhase2 = false;

const phaseToggleBtn = document.getElementById('phaseToggleBtn');
const phaseToggleIcon = document.getElementById('phaseToggleIcon');
const phaseToggleText = document.getElementById('phaseToggleText');
const phaseToggleTextMobile = document.getElementById('phaseToggleTextMobile');
const phase1 = document.getElementById('phase1');
const phase2 = document.getElementById('phase2');

if (phaseToggleBtn) {
    phaseToggleBtn.addEventListener('click', () => {
        isPhase2 = !isPhase2;
        updatePhaseToggle();
        switchPhase();
    });
}

function updatePhaseToggle() {
    if (isPhase2) {
        phaseToggleIcon.textContent = '►';
        phaseToggleIcon.style.color = '#a78bfa';
        phaseToggleText.textContent = 'Phase 2: Main Campaign';
        phaseToggleTextMobile.textContent = 'P2';
    } else {
        phaseToggleIcon.textContent = '◄';
        phaseToggleIcon.style.color = '#9ca3af';
        phaseToggleText.textContent = 'Phase 1: Teasing';
        phaseToggleTextMobile.textContent = 'P1';
    }
}

function switchPhase() {
    if (isPhase2) {
        phase1.classList.remove('active');
        phase2.classList.add('active');
        if (!phase2.innerHTML.trim()) {
            generatePhase2();
        }
    } else {
        phase1.classList.add('active');
        phase2.classList.remove('active');
    }
}

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

// Generate Phase 2 Content
function generatePhase2() {
    const drawDate = '2026-03-25T00:00:00';
    
    phase2.innerHTML = `
        <!-- Night Sky Background -->
        <div class="night-sky-bg"></div>
        
        <!-- Stars -->
        <div class="stars-container" id="starsContainer2"></div>

        <!-- Gold Dust Particles -->
        <div class="dust-container" id="dustContainer"></div>

        <!-- Mist Effect -->
        <div class="mist-effect"></div>

        <!-- Islamic Pattern Overlay -->
        <div class="islamic-pattern"></div>

        <!-- Mosque Silhouette -->
        <div class="mosque-silhouette phase2-mosque">
            <svg viewBox="0 0 1200 200" class="w-full h-full" preserveAspectRatio="xMidYMax slice">
                <defs>
                    <linearGradient id="mosqueGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color: #8b5cf6; stop-opacity: 0.4" />
                        <stop offset="100%" style="stop-color: #000000; stop-opacity: 0.9" />
                    </linearGradient>
                </defs>
                <ellipse cx="600" cy="120" rx="90" ry="70" fill="url(#mosqueGrad2)" />
                <rect x="380" y="70" width="35" height="130" fill="url(#mosqueGrad2)" />
                <circle cx="397.5" cy="65" r="18" fill="url(#mosqueGrad2)" />
                <polygon points="397.5,47 385,65 410,65" fill="#fbbf24" opacity="0.7" />
                <rect x="785" y="70" width="35" height="130" fill="url(#mosqueGrad2)" />
                <circle cx="802.5" cy="65" r="18" fill="url(#mosqueGrad2)" />
                <polygon points="802.5,47 790,65 815,65" fill="#fbbf24" opacity="0.7" />
                <rect x="430" y="135" width="340" height="65" fill="url(#mosqueGrad2)" />
            </svg>
        </div>

        <!-- Light Rays -->
        <div class="light-rays"></div>

        <!-- SVG Lanterns -->
        <div class="phase2-lanterns">
            <svg class="lantern-svg lantern-1" viewBox="0 0 40 60">
                <defs>
                    <linearGradient id="lanternGradP2_1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color: #fbbf24; stop-opacity: 1" />
                        <stop offset="100%" style="stop-color: #f59e0b; stop-opacity: 0.8" />
                    </linearGradient>
                </defs>
                <rect x="10" y="5" width="20" height="3" fill="#fbbf24" opacity="0.8"/>
                <path d="M 12 8 L 12 35 Q 12 40 20 40 Q 28 40 28 35 L 28 8 Z" fill="url(#lanternGradP2_1)" opacity="0.9"/>
                <rect x="10" y="8" width="20" height="2" fill="#fbbf24"/>
                <rect x="10" y="15" width="20" height="1" fill="#fbbf24" opacity="0.6"/>
                <rect x="10" y="25" width="20" height="1" fill="#fbbf24" opacity="0.6"/>
                <path d="M 20 40 L 20 45" stroke="#fbbf24" stroke-width="1"/>
                <circle cx="20" cy="46" r="2" fill="#fbbf24" opacity="0.8"/>
            </svg>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Logo -->
            <div class="logo-section">
                <div class="logo-container">
                    <div class="logo-star logo-star-left">✦</div>
                    <div class="logo-star logo-star-right">✦</div>
                    <div class="logo-chain"></div>
                    <div class="logo-ornament">
                        <div class="ornament-glow"></div>
                        <div class="ornament-circle"></div>
                    </div>
                    <div class="logo-text-container">
                        <div class="logo-text">FX GLOBAL</div>
                        <div class="logo-line">
                            <div class="logo-dots">
                                <div class="dot"></div>
                                <div class="dot dot-large"></div>
                                <div class="dot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hero Section -->
            <div class="hero-section phase2-hero">
                <div class="hero-content">
                    <h1 class="main-title phase2-title">
                        <div class="title-line1">
                            اشترك مع <span class="title-gradient">FX GLOBAL</span>
                        </div>
                        <div class="title-line1">
                            وادخل السحب على جوائز رمضان
                        </div>
                    </h1>

                    <!-- Dual Prizes -->
                    <div class="prizes-grid">
                        <!-- iPhone Prize -->
                        <div class="prize-card prize-iphone">
                            <div class="prize-glow prize-glow-purple"></div>
                            <div class="prize-content">
                                <div class="prize-icon">🏆</div>
                                <span class="prize-title">iPhone 17 Pro Max</span>
                                <div class="prize-line"></div>
                                <p class="prize-winners">
                                    <span class="prize-winners-highlight">3 فائزين</span>
                                </p>
                                <div class="prize-note">
                                    <p>للمشتركين في العضوية او الباقة</p>
                                </div>
                            </div>
                        </div>

                        <!-- Funded Account Prize -->
                        <div class="prize-card prize-funded">
                            <div class="prize-glow prize-glow-emerald"></div>
                            <div class="prize-content">
                                <div class="prize-icon">⚡</div>
                                <span class="prize-title">$100K Funded Account</span>
                                <div class="prize-line"></div>
                                <p class="prize-winners">
                                    <span class="prize-winners-highlight-emerald">2 فائزين</span>
                                </p>
                                <div class="prize-note prize-note-emerald">
                                    <span>📱</span>
                                    <p>للمشتركين في قناة VIP Telegram</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Text -->
                    <div class="summary-text">
                        <div class="summary-line"></div>
                        <p class="summary-text-purple">رمضان هذا العام… له مكافأة.</p>
                        <p class="summary-text-amber">5 فائزين × جوائز قيمة</p>
                    </div>

                    <!-- Countdown -->
                    <div class="countdown-section">
                        <div class="countdown-corners">
                            <div class="corner corner-tl"></div>
                            <div class="corner corner-tr"></div>
                            <div class="corner corner-bl"></div>
                            <div class="corner corner-br"></div>
                        </div>
                        <div class="countdown-box countdown-box-amber">
                            <div class="countdown-header">
                                <span class="countdown-icon">⚡</span>
                                <span class="countdown-text">السحب بعد العيد</span>
                                <span class="countdown-icon">⚡</span>
                            </div>
                            <div id="countdown2" class="countdown-timer"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- How It Works -->
            <div class="how-it-works">
                <div class="how-it-works-container">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="section-title-gradient">كيف تدخل السحب؟</span>
                        </h2>
                        <div class="section-line"></div>
                    </div>

                    <div class="steps-grid">
                        <div class="step-card">
                            <div class="step-number">1</div>
                            <div class="step-icon">✓</div>
                            <p class="step-text">اشترك في أحد برامج FX GLOBAL</p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">2</div>
                            <div class="step-icon">✓</div>
                            <p class="step-text">تدخل السحب تلقائيًا</p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">3</div>
                            <div class="step-icon">👥</div>
                            <p class="step-text">تابع البث المباشر على السوشال ميديا وقت السحب</p>
                        </div>
                        <div class="step-card">
                            <div class="step-number">4</div>
                            <div class="step-icon">🏆</div>
                            <p class="step-text">ممكن تكون واحد من 5 فائزين</p>
                        </div>
                    </div>

                    <!-- Important Note -->
                    <div class="important-note">
                        <div class="note-emoji">📱</div>
                        <div class="note-content">
                            <p class="note-title">السحب مباشر على السوشال ميديا</p>
                            <p class="note-text">تابع البث المباشر للسحب على حسابات FX GLOBAL الرسمية لمشاهدة إعلان الفائزين بشفافية كاملة</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Plans -->
            <div class="plans-section">
                <div class="plans-container">
                    <div class="section-header">
                        <h2 class="section-title">
                            <span class="section-title-white">اختار </span>
                            <span class="section-title-gradient">طريقك</span>
                        </h2>
                        <div class="section-line"></div>
                        <p class="section-subtitle">والفرصة بتيجي معها.</p>
                    </div>

                    <div class="plans-grid">
                        <!-- Membership -->
                        <div class="plan-card plan-membership" data-plan="membership">
                            <div class="plan-header">
                                <div class="plan-label">
                                    <span class="plan-label-dot"></span>
                                    OPTION 1
                                </div>
                                <h3 class="plan-title">Membership</h3>
                                <p class="plan-subtitle">مجتمع المتداولين</p>
                            </div>

                            <div class="plan-features">
                                <div class="plan-feature">
                                    <span class="feature-icon">✓</span>
                                    <span>دخول مجتمع FX GLOBAL</span>
                                </div>
                                <div class="plan-feature">
                                    <span class="feature-icon">✓</span>
                                    <span>بث مباشر يومي مع المدربين</span>
                                </div>
                                <div class="plan-feature">
                                    <span class="feature-icon">✓</span>
                                    <span>تعليم منظم + متابعة</span>
                                </div>
                                <div class="plan-feature">
                                    <span class="feature-icon">✓</span>
                                    <span>دعم مستمر</span>
                                </div>
                            </div>

                            <div class="plan-note plan-note-purple">
                                <p>تعليم حقيقي، وفرصة ربح iPhone.</p>
                            </div>

                            <button class="plan-button plan-button-purple">
                                اشترك بالـ Membership
                            </button>
                        </div>

                        <!-- Bundle -->
                        <div class="plan-card plan-bundle" data-plan="bundle">
                            <div class="plan-badge">⭐ الأفضل</div>
                            <div class="plan-header">
                                <div class="plan-label plan-label-amber">
                                    <span class="plan-label-dot"></span>
                                    OPTION 2
                                </div>
                                <h3 class="plan-title">The Bundle</h3>
                                <p class="plan-subtitle">التجربة الكاملة</p>
                            </div>

                            <div class="plan-features">
                                <div class="plan-feature">
                                    <span class="feature-icon feature-icon-amber">⚡</span>
                                    <span>Membership كامل</span>
                                </div>
                                <div class="plan-feature">
                                    <span class="feature-icon feature-icon-amber">⚡</span>
                                    <span>Live Trading Sessions</span>
                                </div>
                                <div class="plan-feature">
                                    <span class="feature-icon feature-icon-amber">⚡</span>
                                    <span>VIP Signals</span>
                                </div>
                                <div class="plan-feature">
                                    <span class="feature-icon feature-icon-amber">⚡</span>
                                    <span>متابعة أعمق + أدوات أكثر</span>
                                </div>
                            </div>

                            <div class="plan-note plan-note-amber">
                                <p>أقوى باقة. وأقوى فرصة.</p>
                            </div>

                            <button class="plan-button plan-button-amber">
                                اشترِ الـ Bundle الآن
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- VIP Telegram Section -->
            <div class="vip-section">
                <div class="vip-container">
                    <div class="vip-header">
                        <div class="vip-badge">
                            <span>📱</span>
                            <span>كبر فرصك في الفوز</span>
                        </div>
                        <h2 class="vip-title">
                            <span class="vip-title-gradient">قناة VIP Telegram</span>
                        </h2>
                        <div class="vip-line"></div>
                    </div>

                    <div class="vip-content">
                        <div class="vip-left">
                            <h3 class="vip-left-title">ماذا تحصل؟</h3>
                            <div class="vip-features">
                                <div class="vip-feature">
                                    <span class="vip-feature-icon">✓</span>
                                    <span>إشارات تداول VIP يومية</span>
                                </div>
                                <div class="vip-feature">
                                    <span class="vip-feature-icon">✓</span>
                                    <span>تحليلات حصرية للسوق</span>
                                </div>
                                <div class="vip-feature">
                                    <span class="vip-feature-icon">✓</span>
                                    <span>فرص استثمارية مميزة</span>
                                </div>
                                <div class="vip-feature">
                                    <span class="vip-feature-icon">✓</span>
                                    <span>دعم مباشر من الخبراء</span>
                                </div>
                            </div>
                        </div>

                        <div class="vip-right">
                            <div class="vip-image-container">
                                <img src="assets/90e10170a836780cc6ab498dd71e1cac5994a7ef.png" alt="FTMO $100,000 Challenge" class="vip-image" onerror="this.style.display='none'">
                            </div>
                            <div class="vip-line-small"></div>
                            <div class="vip-winners">
                                <p>2 فائزين</p>
                            </div>
                            <p class="vip-description">فرصة حقيقية لتداول برأس مال كبير</p>
                        </div>
                    </div>

                    <div class="vip-cta">
                        <p class="vip-cta-text">اشترك في القناة، وادخل السحب تلقائيًا!</p>
                        <button class="vip-button">
                            <span>📱</span>
                            <span>انضم لقناة VIP الآن</span>
                        </button>
                        <p class="vip-cta-note">* الاشتراك في القناة يدخلك تلقائياً في السحب على Funded Account</p>
                    </div>
                </div>
            </div>

            <!-- Trust Section -->
            <div class="trust-section">
                <div class="trust-container">
                    <div class="trust-icon">👥</div>
                    <h2 class="trust-title">
                        <span class="trust-title-gradient">ليش السحب على السوشال ميديا؟</span>
                    </h2>
                    <p class="trust-text">
                        لأن الثقة أهم من أي إعلان.<br>
                        السحب رح يكون مباشر على حساباتنا الرسمية،<br>
                        وإعلان الفائزين بشفافية كاملة من FX GLOBAL.
                    </p>

                    <div class="trust-details">
                        <div class="trust-detail">
                            <div class="trust-detail-icon">📅</div>
                            <div class="trust-detail-content">
                                <h4>موعد السحب</h4>
                                <p>25 مارس 2026</p>
                            </div>
                        </div>
                        <div class="trust-detail">
                            <div class="trust-detail-icon">📍</div>
                            <div class="trust-detail-content">
                                <h4>طريقة اسحب</h4>
                                <p>بث مباشر على السوشال ميديا</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Final CTA -->
            <div class="final-cta">
                <h2 class="final-cta-title">
                    <div class="final-cta-line1">رمضان فرصة…</div>
                    <div class="final-cta-line2">
                        <span class="final-cta-gradient">والفرص ما بتتكرر.</span>
                    </div>
                </h2>

                <div class="final-cta-buttons">
                    <button class="final-cta-button final-cta-button-purple">
                        <div>
                            <div>اشترك بالـ Membership</div>
                            <div class="final-cta-button-subtitle">🏆 فرصة iPhone 17 Pro Max</div>
                        </div>
                    </button>
                    <button class="final-cta-button final-cta-button-amber">
                        <div>
                            <div>اشترِ الـ Bundle الآن</div>
                            <div class="final-cta-button-subtitle">⭐ فرصة iPhone 17 Pro Max</div>
                        </div>
                    </button>
                    <button class="final-cta-button final-cta-button-emerald">
                        <div>
                            <div>📱 انضم لقناة VIP</div>
                            <div class="final-cta-button-subtitle">💰 فرصة $100K Account</div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-emojis">
                    <span>🏮</span>
                    <span>✨</span>
                    <span>🏮</span>
                </div>
                <div class="footer-content">
                    <div class="footer-line"></div>
                    <p class="footer-copyright">© 2026 FX GLOBAL. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </div>
    `;

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
    const countdown2Container = document.getElementById('countdown2');
    if (countdown2Container) {
        new CountdownTimer(drawDate, 'countdown2', 'large');
    }

    // Plan selection
    const planCards = phase2.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// Add Phase 2 specific styles dynamically
const phase2Styles = `
<style>
.dust-container {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
}

.dust-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #fbbf24;
    border-radius: 50%;
    opacity: 0.4;
    animation: float-dust 5s ease-in-out infinite;
}

@keyframes float-dust {
    0% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(-10px); opacity: 0.6; }
    100% { transform: translateY(0); opacity: 0.4; }
}

.mist-effect {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 16rem;
    pointer-events: none;
    background: linear-gradient(to top, rgba(88, 28, 135, 0.1), transparent);
    opacity: 0.6;
    animation: mist 5s ease-in-out infinite;
}

@keyframes mist {
    0% { bottom: 0; opacity: 0.6; }
    50% { bottom: 10px; opacity: 0.8; }
    100% { bottom: 0; opacity: 0.6; }
}

.phase2-mosque {
    opacity: 0.2;
}

@media (min-width: 640px) {
    .phase2-mosque {
        opacity: 0.25;
    }
}

.light-rays {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 24rem;
    pointer-events: none;
    background: linear-gradient(to bottom, rgba(147, 51, 234, 0.15), rgba(168, 85, 247, 0.05), transparent);
    filter: blur(3rem);
}

@media (min-width: 640px) {
    .light-rays {
        height: 24rem;
    }
}

.phase2-lanterns {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    opacity: 0.3;
}

@media (min-width: 640px) {
    .phase2-lanterns {
        opacity: 0.4;
    }
}

.lantern-svg {
    position: absolute;
    filter: drop-shadow(0 25px 50px -12px rgba(0, 0, 0, 0.25));
    animation: lanternSwing 4.5s ease-in-out infinite;
    transform-origin: top center;
}

.lantern-1 {
    top: 5rem;
    right: 1rem;
    width: 3.5rem;
    height: 4.5rem;
}

@media (min-width: 640px) {
    .lantern-1 {
        top: 5rem;
        right: 4rem;
        width: 5rem;
        height: 6rem;
    }
}

@keyframes lanternSwing {
    0%, 100% { transform: rotate(-4deg); }
    50% { transform: rotate(4deg); }
}

.prizes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 48rem;
    margin: 0 auto;
}

@media (min-width: 768px) {
    .prizes-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
}

.prize-card {
    position: relative;
    padding: 1.5rem 0;
}

.prize-glow {
    position: absolute;
    inset: 0;
    filter: blur(2rem);
}

@media (min-width: 640px) {
    .prize-glow {
        filter: blur(3rem);
    }
}

.prize-glow-purple {
    background: linear-gradient(to right, transparent, rgba(147, 51, 234, 0.3), transparent);
}

.prize-glow-emerald {
    background: linear-gradient(to right, transparent, rgba(16, 185, 129, 0.3), transparent);
}

.prize-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    border-radius: 1rem;
    border: 2px solid;
    height: 100%;
}

@media (min-width: 640px) {
    .prize-content {
        gap: 1.25rem;
        padding: 2.5rem 2rem;
        border-radius: 1.5rem;
    }
}

.prize-iphone .prize-content {
    background: linear-gradient(to bottom right, rgba(88, 28, 135, 0.4), rgba(107, 33, 168, 0.5), rgba(88, 28, 135, 0.4));
    backdrop-filter: blur(24px);
    border-color: rgba(251, 191, 36, 0.4);
}

.prize-funded .prize-content {
    background: linear-gradient(to bottom right, rgba(6, 95, 70, 0.4), rgba(5, 150, 105, 0.5), rgba(6, 95, 70, 0.4));
    backdrop-filter: blur(24px);
    border-color: rgba(16, 185, 129, 0.4);
}

.prize-icon {
    font-size: 2.5rem;
}

@media (min-width: 640px) {
    .prize-icon {
        font-size: 3rem;
    }
}

.prize-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    background: linear-gradient(to right, #fcd34d, #fbbf24, #fcd34d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 640px) {
    .prize-title {
        font-size: 2.25rem;
    }
}

@media (min-width: 768px) {
    .prize-title {
        font-size: 3rem;
    }
}

.prize-funded .prize-title {
    background: linear-gradient(to right, #6ee7b7, #10b981, #6ee7b7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.prize-line {
    width: 5rem;
    height: 2px;
    background: linear-gradient(to right, transparent, #fbbf24, transparent);
}

@media (min-width: 640px) {
    .prize-line {
        width: 6rem;
    }
}

.prize-funded .prize-line {
    background: linear-gradient(to right, transparent, #10b981, transparent);
}

.prize-winners {
    font-size: 1rem;
    color: white;
}

@media (min-width: 640px) {
    .prize-winners {
        font-size: 1.25rem;
    }
}

.prize-winners-highlight {
    font-weight: 700;
    color: #fbbf24;
}

.prize-winners-highlight-emerald {
    font-weight: 700;
    color: #10b981;
}

.prize-note {
    background: rgba(147, 51, 234, 0.1);
    border-radius: 0.75rem;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(147, 51, 234, 0.3);
    margin-top: 0.5rem;
}

.prize-note p {
    color: #c4b5fd;
    font-size: 0.875rem;
    text-align: center;
}

@media (min-width: 640px) {
    .prize-note p {
        font-size: 1rem;
    }
}

.prize-note-emerald {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.prize-note-emerald p {
    color: #6ee7b7;
}

.summary-text {
    font-size: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem;
}

@media (min-width: 640px) {
    .summary-text {
        font-size: 1.5rem;
        gap: 0.75rem;
    }
}

@media (min-width: 768px) {
    .summary-text {
        font-size: 1.875rem;
    }
}

.summary-line {
    width: 6rem;
    height: 2px;
    background: linear-gradient(to right, transparent, #fbbf24, transparent);
    margin: 0 auto;
}

@media (min-width: 640px) {
    .summary-line {
        width: 8rem;
    }
}

.summary-text-purple {
    color: #c4b5fd;
    font-size: 1.125rem;
}

@media (min-width: 640px) {
    .summary-text-purple {
        font-size: 1.5rem;
    }
}

.summary-text-amber {
    color: #fcd34d;
    font-size: 1rem;
}

@media (min-width: 640px) {
    .summary-text-amber {
        font-size: 1.25rem;
    }
}

.countdown-box-amber {
    background: linear-gradient(to right, rgba(146, 64, 14, 0.2), rgba(154, 52, 18, 0.3), rgba(146, 64, 14, 0.2));
    border-color: rgba(251, 191, 36, 0.4);
}

.countdown-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #fbbf24;
}

@media (min-width: 640px) {
    .countdown-icon {
        width: 1.5rem;
        height: 1.5rem;
    }
}

.how-it-works {
    padding: 4rem 1rem;
}

@media (min-width: 640px) {
    .how-it-works {
        padding: 6rem 1rem;
    }
}

.how-it-works-container {
    max-width: 64rem;
    margin: 0 auto;
}

.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

@media (min-width: 640px) {
    .section-header {
        margin-bottom: 5rem;
    }
}

.section-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

@media (min-width: 640px) {
    .section-title {
        font-size: 3rem;
        margin-bottom: 1.5rem;
    }
}

@media (min-width: 768px) {
    .section-title {
        font-size: 3.75rem;
    }
}

.section-title-gradient {
    background: linear-gradient(to right, #c4b5fd, #a78bfa, #fcd34d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-title-white {
    color: white;
}

.section-line {
    width: 6rem;
    height: 2px;
    background: linear-gradient(to right, transparent, #fbbf24, transparent);
    margin: 0 auto;
}

@media (min-width: 640px) {
    .section-line {
        width: 8rem;
    }
}

.section-subtitle {
    font-size: 1.25rem;
    color: #c4b5fd;
    padding: 0 1rem;
    margin-top: 0.75rem;
}

@media (min-width: 640px) {
    .section-subtitle {
        font-size: 1.875rem;
        margin-top: 1rem;
    }
}

.steps-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 640px) {
    .steps-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }
}

@media (min-width: 1024px) {
    .steps-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.step-card {
    background: rgba(17, 24, 39, 0.4);
    backdrop-filter: blur(24px);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid rgba(168, 85, 247, 0.2);
    text-align: center;
}

@media (min-width: 640px) {
    .step-card {
        border-radius: 1rem;
        padding: 2rem;
    }
}

.step-number {
    font-size: 3rem;
    font-weight: 700;
    color: rgba(147, 51, 234, 0.2);
    margin-bottom: 0.75rem;
}

@media (min-width: 640px) {
    .step-number {
        font-size: 4.375rem;
        margin-bottom: 1.25rem;
    }
}

.step-icon {
    width: 3rem;
    height: 3rem;
    margin: 0 auto 0.75rem;
    background: rgba(147, 51, 234, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(168, 85, 247, 0.2);
    font-size: 1.5rem;
    color: #a78bfa;
}

@media (min-width: 640px) {
    .step-icon {
        width: 3.5rem;
        height: 3.5rem;
        font-size: 1.75rem;
    }
}

.step-text {
    color: white;
    line-height: 1.75;
    font-size: 0.875rem;
}

@media (min-width: 640px) {
    .step-text {
        font-size: 1rem;
    }
}

.important-note {
    margin-top: 2.5rem;
    background: linear-gradient(to bottom right, rgba(147, 51, 234, 0.1), rgba(124, 58, 237, 0.1));
    border: 2px solid rgba(168, 85, 247, 0.4);
    border-radius: 0.75rem;
    padding: 1.25rem;
    backdrop-filter: blur(24px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

@media (min-width: 640px) {
    .important-note {
        margin-top: 4rem;
        border-radius: 1rem;
        padding: 2rem;
        flex-direction: row;
        gap: 1.25rem;
    }
}

.note-emoji {
    font-size: 1.875rem;
    flex-shrink: 0;
}

@media (min-width: 640px) {
    .note-emoji {
        font-size: 2.25rem;
    }
}

.note-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

@media (min-width: 640px) {
    .note-content {
        gap: 0.75rem;
    }
}

.note-title {
    color: #c4b5fd;
    font-weight: 700;
    font-size: 1.25rem;
}

@media (min-width: 640px) {
    .note-title {
        font-size: 1.5rem;
    }
}

.note-text {
    color: rgba(196, 181, 253, 0.9);
    font-size: 1rem;
    line-height: 1.75;
}

@media (min-width: 640px) {
    .note-text {
        font-size: 1.125rem;
    }
}

.plans-section {
    padding: 4rem 1rem;
}

@media (min-width: 640px) {
    .plans-section {
        padding: 7rem 1rem;
    }
}

.plans-container {
    max-width: 80rem;
    margin: 0 auto;
}

.plans-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 48rem;
    margin: 0 auto;
}

@media (min-width: 1024px) {
    .plans-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
    }
}

.plan-card {
    background: linear-gradient(to bottom right, rgba(17, 24, 39, 0.6), rgba(31, 41, 55, 0.6));
    backdrop-filter: blur(32px);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 2px solid;
    cursor: pointer;
    transition: all 0.5s;
    position: relative;
}

@media (min-width: 640px) {
    .plan-card {
        border-radius: 1.5rem;
        padding: 2.5rem;
    }
}

.plan-card:hover {
    transform: scale(1.02);
}

.plan-card:active {
    transform: scale(0.98);
}

.plan-card.selected {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    transform: scale(1.02);
}

.plan-membership {
    border-color: rgba(168, 85, 247, 0.3);
}

.plan-membership.selected {
    border-color: rgba(168, 85, 247, 1);
    box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.3);
}

.plan-bundle {
    background: linear-gradient(to bottom right, rgba(88, 28, 135, 0.4), rgba(17, 24, 39, 0.6));
    border-color: rgba(251, 191, 36, 0.4);
}

.plan-bundle.selected {
    border-color: rgba(251, 191, 36, 1);
    box-shadow: 0 25px 50px -12px rgba(251, 191, 36, 0.3);
}

.plan-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(to right, #fbbf24, #fb923c);
    color: black;
    padding: 0.375rem 1.25rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: 0 10px 15px -3px rgba(251, 191, 36, 0.5);
}

@media (min-width: 640px) {
    .plan-badge {
        top: 1.5rem;
        right: 1.5rem;
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
    }
}

.plan-header {
    margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
    .plan-header {
        margin-bottom: 2.5rem;
    }
}

.plan-label {
    font-size: 0.75rem;
    color: #a78bfa;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

@media (min-width: 640px) {
    .plan-label {
        font-size: 0.875rem;
        margin-bottom: 0.75rem;
    }
}

.plan-label-amber {
    color: #fbbf24;
}

.plan-label-dot {
    width: 0.375rem;
    height: 0.375rem;
    background: #a78bfa;
    border-radius: 50%;
}

.plan-label-amber .plan-label-dot {
    background: #fbbf24;
}

.plan-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
    .plan-title {
        font-size: 3rem;
        margin-bottom: 0.75rem;
    }
}

.plan-subtitle {
    font-size: 1.125rem;
    color: #9ca3af;
}

@media (min-width: 640px) {
    .plan-subtitle {
        font-size: 1.25rem;
    }
}

.plan-features {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
}

@media (min-width: 640px) {
    .plan-features {
        gap: 1.25rem;
        margin-bottom: 3rem;
    }
}

.plan-feature {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.feature-icon {
    width: 1rem;
    height: 1rem;
    color: #a78bfa;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

@media (min-width: 640px) {
    .feature-icon {
        width: 1.25rem;
        height: 1.25rem;
    }
}

.feature-icon-amber {
    color: #fbbf24;
}

.plan-feature span:last-child {
    color: white;
    font-size: 0.875rem;
}

@media (min-width: 640px) {
    .plan-feature span:last-child {
        font-size: 1.125rem;
    }
}

.plan-note {
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    border: 1px solid;
}

@media (min-width: 640px) {
    .plan-note {
        padding: 1.25rem;
        margin-bottom: 2.5rem;
    }
}

.plan-note p {
    text-align: center;
    font-size: 1rem;
}

@media (min-width: 640px) {
    .plan-note p {
        font-size: 1.125rem;
    }
}

.plan-note-purple {
    background: rgba(147, 51, 234, 0.1);
    border-color: rgba(168, 85, 247, 0.2);
}

.plan-note-purple p {
    color: #c4b5fd;
}

.plan-note-amber {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.3);
}

.plan-note-amber p {
    color: #fcd34d;
    font-weight: 700;
}

.plan-button {
    width: 100%;
    padding: 1rem 1.5rem;
    font-weight: 700;
    font-size: 1.125rem;
    border-radius: 0.75rem;
    transition: all 0.3s;
    border: 1px solid;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
    .plan-button {
        padding: 1.5rem;
        font-size: 1.25rem;
        border-radius: 0.75rem;
    }
}

.plan-button:active {
    transform: scale(0.98);
}

.plan-button-purple {
    background: linear-gradient(to right, #9333ea, #7e22ce);
    color: white;
    border-color: rgba(196, 181, 253, 0.2);
    box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.2);
}

.plan-button-purple:hover {
    background: linear-gradient(to right, #7e22ce, #6d28d9);
}

.plan-button-amber {
    background: linear-gradient(to right, #d97706, #ea580c);
    color: white;
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 0 10px 15px -3px rgba(251, 191, 36, 0.2);
}

.plan-button-amber:hover {
    background: linear-gradient(to right, #f59e0b, #f97316);
}

.vip-section {
    padding: 4rem 1rem;
}

@media (min-width: 640px) {
    .vip-section {
        padding: 6rem 1rem;
    }
}

.vip-container {
    max-width: 64rem;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    background: linear-gradient(to bottom right, rgba(6, 78, 59, 0.8), rgba(5, 150, 105, 0.6), rgba(17, 24, 39, 0.8));
    backdrop-filter: blur(32px);
    border-radius: 1.5rem;
    padding: 2rem;
    border: 2px solid rgba(16, 185, 129, 0.3);
}

@media (min-width: 640px) {
    .vip-container {
        border-radius: 2.5rem;
        padding: 4rem;
    }
}

.vip-container::before,
.vip-container::after {
    content: '';
    position: absolute;
    width: 16rem;
    height: 16rem;
    border-radius: 50%;
    filter: blur(3rem);
}

.vip-container::before {
    top: 0;
    right: 0;
    background: rgba(16, 185, 129, 0.2);
}

.vip-container::after {
    bottom: 0;
    left: 0;
    background: rgba(5, 150, 105, 0.2);
}

.vip-header {
    position: relative;
    z-index: 10;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

@media (min-width: 640px) {
    .vip-header {
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
}

.vip-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1.25rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 9999px;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.vip-badge span:first-child {
    font-size: 1.5rem;
}

@media (min-width: 640px) {
    .vip-badge span:first-child {
        font-size: 1.875rem;
    }
}

.vip-badge span:last-child {
    color: #6ee7b7;
    font-weight: 700;
    font-size: 1rem;
}

@media (min-width: 640px) {
    .vip-badge span:last-child {
        font-size: 1.125rem;
    }
}

.vip-title {
    font-size: 1.875rem;
    font-weight: 700;
}

@media (min-width: 640px) {
    .vip-title {
        font-size: 3rem;
    }
}

@media (min-width: 768px) {
    .vip-title {
        font-size: 3.75rem;
    }
}

.vip-title-gradient {
    background: linear-gradient(to right, #6ee7b7, #10b981, #6ee7b7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.vip-line {
    width: 6rem;
    height: 2px;
    background: linear-gradient(to right, transparent, #10b981, transparent);
    margin: 0 auto;
}

@media (min-width: 640px) {
    .vip-line {
        width: 8rem;
    }
}

.vip-content {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1rem;
}

@media (min-width: 768px) {
    .vip-content {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
    }
}

.vip-left {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

@media (min-width: 640px) {
    .vip-left {
        gap: 1.5rem;
    }
}

.vip-left-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
}

@media (min-width: 640px) {
    .vip-left-title {
        font-size: 1.875rem;
    }
}

.vip-features {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

@media (min-width: 640px) {
    .vip-features {
        gap: 1rem;
    }
}

.vip-feature {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: rgba(16, 185, 129, 0.05);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

@media (min-width: 640px) {
    .vip-feature {
        padding: 1rem;
    }
}

.vip-feature-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #10b981;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

@media (min-width: 640px) {
    .vip-feature-icon {
        width: 1.5rem;
        height: 1.5rem;
    }
}

.vip-feature span:last-child {
    color: white;
    font-size: 0.875rem;
}

@media (min-width: 640px) {
    .vip-feature span:last-child {
        font-size: 1.125rem;
    }
}

.vip-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(6, 78, 59, 0.6);
    backdrop-filter: blur(24px);
    border-radius: 1rem;
    padding: 1.5rem 2.5rem;
    border: 2px solid rgba(16, 185, 129, 0.4);
}

@media (min-width: 640px) {
    .vip-right {
        padding: 2.5rem;
    }
}

.vip-image-container {
    margin-bottom: 1.5rem;
    width: 100%;
    max-width: 24rem;
}

@media (min-width: 640px) {
    .vip-image-container {
        margin-bottom: 2rem;
    }
}

.vip-image {
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3);
}

.vip-line-small {
    width: 5rem;
    height: 2px;
    background: linear-gradient(to right, transparent, #10b981, transparent);
    margin-bottom: 1rem;
}

@media (min-width: 640px) {
    .vip-line-small {
        width: 6rem;
        margin-bottom: 1.5rem;
    }
}

.vip-winners {
    background: rgba(16, 185, 129, 0.1);
    border-radius: 0.75rem;
    padding: 0.5rem 1.5rem;
    border: 1px solid rgba(16, 185, 129, 0.3);
    margin-bottom: 1rem;
}

@media (min-width: 640px) {
    .vip-winners {
        padding: 0.75rem 1.5rem;
        margin-bottom: 1.5rem;
    }
}

.vip-winners p {
    color: #6ee7b7;
    font-weight: 700;
    font-size: 1rem;
    text-align: center;
}

@media (min-width: 640px) {
    .vip-winners p {
        font-size: 1.25rem;
    }
}

.vip-description {
    color: rgba(110, 231, 183, 0.8);
    font-size: 0.875rem;
    text-align: center;
}

@media (min-width: 640px) {
    .vip-description {
        font-size: 1rem;
    }
}

.vip-cta {
    position: relative;
    z-index: 10;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
}

@media (min-width: 640px) {
    .vip-cta {
        gap: 1.5rem;
        padding-top: 1.5rem;
    }
}

.vip-cta-text {
    font-size: 1.25rem;
    color: #d1fae5;
}

@media (min-width: 640px) {
    .vip-cta-text {
        font-size: 1.5rem;
    }
}

@media (min-width: 768px) {
    .vip-cta-text {
        font-size: 1.875rem;
    }
}

.vip-button {
    position: relative;
    padding: 1.25rem 4rem;
    background: linear-gradient(to right, #10b981, #059669);
    color: white;
    font-weight: 700;
    font-size: 1.125rem;
    border-radius: 0.75rem;
    transition: all 0.3s;
    border: 2px solid rgba(16, 185, 129, 0.4);
    cursor: pointer;
    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3);
    overflow: hidden;
}

@media (min-width: 640px) {
    .vip-button {
        padding: 1.75rem 4rem;
        font-size: 1.5rem;
    }
}

.vip-button:hover {
    background: linear-gradient(to right, #059669, #047857);
}

.vip-button:active {
    transform: scale(0.98);
}

.vip-button span {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-content: center;
}

.vip-button span:first-child {
    font-size: 1.5rem;
}

@media (min-width: 640px) {
    .vip-button span:first-child {
        font-size: 1.875rem;
    }
}

.vip-cta-note {
    font-size: 0.875rem;
    color: rgba(110, 231, 183, 0.7);
}

@media (min-width: 640px) {
    .vip-cta-note {
        font-size: 1rem;
    }
}

.trust-section {
    padding: 4rem 1rem;
}

@media (min-width: 640px) {
    .trust-section {
        padding: 6rem 1rem;
    }
}

.trust-container {
    max-width: 40rem;
    margin: 0 auto;
    background: rgba(17, 24, 39, 0.5);
    backdrop-filter: blur(32px);
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid rgba(168, 85, 247, 0.3);
}

@media (min-width: 640px) {
    .trust-container {
        border-radius: 1.5rem;
        padding: 4rem;
    }
}

.trust-icon {
    width: 4rem;
    height: 4rem;
    background: rgba(147, 51, 234, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 1px solid rgba(168, 85, 247, 0.3);
    font-size: 2rem;
}

@media (min-width: 640px) {
    .trust-icon {
        width: 6rem;
        height: 6rem;
        font-size: 3rem;
    }
}

.trust-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
    .trust-title {
        font-size: 2.25rem;
        margin-top: 2.5rem;
        margin-bottom: 2.5rem;
    }
}

@media (min-width: 768px) {
    .trust-title {
        font-size: 3rem;
    }
}

.trust-title-gradient {
    background: linear-gradient(to right, #a78bfa, #9333ea, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.trust-text {
    font-size: 1.125rem;
    color: white;
    line-height: 1.75;
    max-width: 48rem;
    margin: 0 auto;
}

@media (min-width: 640px) {
    .trust-text {
        font-size: 1.5rem;
    }
}

@media (min-width: 768px) {
    .trust-text {
        font-size: 1.875rem;
    }
}

.trust-details {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding-top: 1.5rem;
    max-width: 48rem;
    margin: 0 auto;
}

@media (min-width: 640px) {
    .trust-details {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding-top: 2rem;
    }
}

.trust-detail {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: rgba(31, 41, 55, 0.3);
    border-radius: 0.75rem;
    padding: 1rem;
    border: 1px solid rgba(168, 85, 247, 0.2);
}

@media (min-width: 640px) {
    .trust-detail {
        border-radius: 1rem;
        padding: 1.5rem;
        gap: 1.25rem;
    }
}

.trust-detail-icon {
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(147, 51, 234, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(168, 85, 247, 0.2);
    font-size: 1.25rem;
    color: #a78bfa;
}

@media (min-width: 640px) {
    .trust-detail-icon {
        width: 3.5rem;
        height: 3.5rem;
        font-size: 1.75rem;
    }
}

.trust-detail-content {
    text-align: right;
}

.trust-detail-content h4 {
    color: white;
    font-weight: 700;
    margin-bottom: 0.25rem;
    font-size: 1rem;
}

@media (min-width: 640px) {
    .trust-detail-content h4 {
        margin-bottom: 0.5rem;
        font-size: 1.125rem;
    }
}

.trust-detail-content p {
    color: #9ca3af;
    font-size: 0.875rem;
}

@media (min-width: 640px) {
    .trust-detail-content p {
        font-size: 1.125rem;
    }
}

.final-cta {
    padding: 4rem 1rem;
}

@media (min-width: 640px) {
    .final-cta {
        padding: 7rem 1rem;
    }
}

.final-cta-title {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    margin-bottom: 2.5rem;
}

@media (min-width: 640px) {
    .final-cta-title {
        font-size: 3rem;
        margin-bottom: 4rem;
    }
}

@media (min-width: 768px) {
    .final-cta-title {
        font-size: 3.75rem;
    }
}

@media (min-width: 1024px) {
    .final-cta-title {
        font-size: 4.5rem;
    }
}

.final-cta-line1 {
    color: white;
    margin-bottom: 1rem;
}

@media (min-width: 640px) {
    .final-cta-line1 {
        margin-bottom: 1.5rem;
    }
}

.final-cta-line2 {
    position: relative;
    display: inline-block;
}

.final-cta-gradient {
    background: linear-gradient(to right, #a78bfa, #9333ea, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.final-cta-line2::after {
    content: '';
    position: absolute;
    bottom: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 8rem;
    height: 2px;
    background: linear-gradient(to right, transparent, #fbbf24, transparent);
}

@media (min-width: 640px) {
    .final-cta-line2::after {
        bottom: -1rem;
        width: 12rem;
        height: 4px;
    }
}

.final-cta-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    max-width: 80rem;
    margin: 0 auto;
}

@media (min-width: 640px) {
    .final-cta-buttons {
        gap: 1.5rem;
    }
}

@media (min-width: 1024px) {
    .final-cta-buttons {
        flex-direction: row;
    }
}

.final-cta-button {
    flex: 1;
    padding: 1.25rem 1.5rem;
    font-weight: 700;
    font-size: 1.125rem;
    border-radius: 0.75rem;
    transition: all 0.3s;
    border: 1px solid;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
    .final-cta-button {
        padding: 1.75rem 2.5rem;
        font-size: 1.25rem;
    }
}

.final-cta-button:active {
    transform: scale(0.98);
}

.final-cta-button > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.final-cta-button-subtitle {
    font-size: 0.875rem;
    opacity: 0.8;
}

.final-cta-button-purple {
    background: linear-gradient(to right, #9333ea, #7e22ce);
    color: white;
    border-color: rgba(196, 181, 253, 0.2);
    box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.2);
}

.final-cta-button-purple:hover {
    background: linear-gradient(to right, #7e22ce, #6d28d9);
}

.final-cta-button-amber {
    background: linear-gradient(to right, #d97706, #ea580c);
    color: white;
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 0 10px 15px -3px rgba(251, 191, 36, 0.2);
}

.final-cta-button-amber:hover {
    background: linear-gradient(to right, #f59e0b, #f97316);
}

.final-cta-button-emerald {
    background: linear-gradient(to right, #10b981, #059669);
    color: white;
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
}

.final-cta-button-emerald:hover {
    background: linear-gradient(to right, #059669, #047857);
}

.phase2-hero {
    padding: 3rem 1rem;
}

@media (min-width: 640px) {
    .phase2-hero {
        padding: 4rem 1rem;
    }
}

.phase2-title {
    font-size: 1.75rem;
}

@media (min-width: 640px) {
    .phase2-title {
        font-size: 2rem;
    }
}
</style>
`;

// Inject Phase 2 styles
document.head.insertAdjacentHTML('beforeend', phase2Styles);
