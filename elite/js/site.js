// Smooth scroll to registration form
(function () {
  var btn = document.getElementById('join-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      var formSection = document.getElementById('registration-form');
      if (formSection && formSection.scrollIntoView) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();

// Vimeo autoplay/pause based on visibility (50% threshold)
(function () {
  var iframe = document.getElementById('hero-video');
  var container = document.getElementById('video-container');
  if (!iframe || !container || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        try {
          var win = iframe.contentWindow;
          if (!win) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            win.postMessage(JSON.stringify({ method: 'play' }), '*');
          } else {
            win.postMessage(JSON.stringify({ method: 'pause' }), '*');
          }
        } catch (e) {
          // ignore
        }
      });
    },
    { threshold: [0, 0.5, 1] }
  );

  observer.observe(container);
})();


