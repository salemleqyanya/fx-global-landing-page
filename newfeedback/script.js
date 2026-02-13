// Feedback Videos Data
const feedbackVideos = [
  {
    id: 1,
    name: 'أحمد محمد',
    title: 'مستثمر منذ 3 سنوات',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23694393" width="400" height="300"/%3E%3Ctext fill="%23fff" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eأحمد محمد%3C/text%3E%3C/svg%3E',
    videoUrl: 'https://player.vimeo.com/video/1144929057',
    quote: 'الباندل غير طريقة تفكيري بالتداول تمامًا'
  },
  {
    id: 2,
    name: 'سارة أحمد',
    title: 'متداولة مبتدئة',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23DF2E91" width="400" height="300"/%3E%3Ctext fill="%23fff" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eسارة أحمد%3C/text%3E%3C/svg%3E',
    videoUrl: 'https://player.vimeo.com/video/1144929057',
    quote: 'جلسات اللايف ساعدتني أفهم السوق بشكل عملي'
  },
  {
    id: 3,
    name: 'محمد علي',
    title: 'رجل أعمال',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23694393" width="400" height="300"/%3E%3Ctext fill="%23fff" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eمحمد علي%3C/text%3E%3C/svg%3E',
    videoUrl: 'https://player.vimeo.com/video/1144929057',
    quote: 'التوصيات VIP دقيقة وواضحة، النتائج ممتازة'
  },
  {
    id: 4,
    name: 'ليلى حسن',
    title: 'متداولة محترفة',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23DF2E91" width="400" height="300"/%3E%3Ctext fill="%23fff" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eليلى حسن%3C/text%3E%3C/svg%3E',
    videoUrl: 'https://player.vimeo.com/video/1144929057',
    quote: 'إدارة المخاطر اللي علموني إياها كانت مفتاح النجاح'
  },
  {
    id: 5,
    name: 'خالد عبدالله',
    title: 'مهندس ومستثمر',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23694393" width="400" height="300"/%3E%3Ctext fill="%23fff" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eخالد عبدالله%3C/text%3E%3C/svg%3E',
    videoUrl: 'https://player.vimeo.com/video/1144929057',
    quote: 'أفضل استثمار عملته في تعليم التداول'
  },
  {
    id: 6,
    name: 'نور الدين',
    title: 'متداول بدوام جزئي',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23DF2E91" width="400" height="300"/%3E%3Ctext fill="%23fff" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Eنور الدين%3C/text%3E%3C/svg%3E',
    videoUrl: 'https://player.vimeo.com/video/1144929057',
    quote: 'الشفافية والمصداقية واضحة في كل شيء'
  }
];

// Home Page Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Video Play/Pause functionality
  const heroVideo = document.getElementById('heroVideo');
  const playButton = document.getElementById('playButton');
  
  if (heroVideo && playButton) {
    let isPlaying = false;
    
    playButton.addEventListener('click', function() {
      if (isPlaying) {
        heroVideo.pause();
        isPlaying = false;
        playButton.setAttribute('aria-label', 'تشغيل الفيديو');
      } else {
        heroVideo.play();
        isPlaying = true;
        playButton.setAttribute('aria-label', 'إيقاف الفيديو');
      }
    });
    
    // Update play button state based on video state
    heroVideo.addEventListener('play', function() {
      isPlaying = true;
      playButton.setAttribute('aria-label', 'إيقاف الفيديو');
    });
    
    heroVideo.addEventListener('pause', function() {
      isPlaying = false;
      playButton.setAttribute('aria-label', 'تشغيل الفيديو');
    });
  }
  
  // Smooth scroll to checkout
  const scrollToCheckout = document.getElementById('scrollToCheckout');
  if (scrollToCheckout) {
    scrollToCheckout.addEventListener('click', function() {
      const checkoutSection = document.getElementById('checkout');
      if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  // Initialize feedback videos page if on that page
  if (document.getElementById('videosGrid')) {
    initializeFeedbackVideos();
  }
});

// Feedback Videos Page Functionality
function initializeFeedbackVideos() {
  const videosGrid = document.getElementById('videosGrid');
  const videoModal = document.getElementById('videoModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalVideo = document.getElementById('modalVideo');
  const modalName = document.getElementById('modalName');
  const modalTitle = document.getElementById('modalTitle');
  const modalQuote = document.getElementById('modalQuote');
  
  if (!videosGrid) return;
  
  // Render video cards
  feedbackVideos.forEach(video => {
    const videoCard = createVideoCard(video);
    videosGrid.appendChild(videoCard);
  });
  
  // Open modal function
  function openModal(video) {
    if (!videoModal || !modalVideo || !modalName || !modalTitle || !modalQuote) return;
    
    modalVideo.src = `${video.videoUrl}?autoplay=1`;
    modalName.textContent = video.name;
    modalTitle.textContent = video.title;
    modalQuote.textContent = video.quote;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Close modal function
  function closeModal() {
    if (!videoModal || !modalVideo) return;
    
    videoModal.classList.remove('active');
    modalVideo.src = '';
    document.body.style.overflow = '';
  }
  
  // Event listeners
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Create video card element
  function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.addEventListener('click', () => openModal(video));
    
    card.innerHTML = `
      <div class="video-thumbnail-wrapper">
        <img src="${video.thumbnail}" alt="${video.name}" class="video-thumbnail" />
        <div class="video-play-overlay">
          <div class="video-play-button">
            <svg class="video-play-icon" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="video-info">
        <h3 class="video-name">${video.name}</h3>
        <p class="video-title">${video.title}</p>
        <div class="video-quote">
          <svg class="quote-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
          <p class="quote-text-small">${video.quote}</p>
        </div>
      </div>
    `;
    
    return card;
  }
}
