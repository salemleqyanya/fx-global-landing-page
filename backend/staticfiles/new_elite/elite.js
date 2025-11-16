// Elite form submission handler (staticfiles copy)
(function () {
  const form = document.getElementById('elite-form');
  const statusEl = document.getElementById('elite-status');
  if (!form) return;

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }
  const csrftoken = getCookie('csrftoken');

  async function submitForm(event) {
    if (!csrftoken) return; // fallback to native form POST if no cookie
    event.preventDefault();
    if (statusEl) statusEl.textContent = 'يتم الإرسال...';

    const data = {
      name: (form.name?.value || '').trim(),
      phone: (form.phone?.value || '').trim(),
      whatsapp: (form.whatsapp?.value || '').trim(),
      message: (form.message?.value || '').trim(),
      city: (form.city?.value || '').trim(),
      landing_code: (form.landing_code?.value || '').trim(),
    };

    try {
      const res = await fetch('/api/contacts/register/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = payload?.detail || payload?.message;
        throw new Error(detail || 'تعذر إرسال الطلب، تأكد من البيانات');
      }
      if (statusEl) statusEl.textContent = 'تم التسجيل بنجاح! سنتواصل معك قريباً.';
      form.reset();
    } catch (err) {
      if (statusEl) statusEl.textContent = err?.message || 'حدث خطأ غير متوقع.';
    }
  }

  form.addEventListener('submit', submitForm);
})();

// Elite form submission handler
(function () {
  const form = document.getElementById('elite-form');
  const statusEl = document.getElementById('elite-status');
  if (!form) return;

  // Extract csrftoken from cookies (Django standard)
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }
  const csrftoken = getCookie('csrftoken');

  async function submitForm(event) {
    // If we don't have a csrftoken cookie, let the native form post happen
    if (!csrftoken) return;
    event.preventDefault(); // we have csrftoken; use AJAX
    if (statusEl) statusEl.textContent = 'يتم الإرسال...';

    const data = {
      name: (form.name?.value || '').trim(),
      phone: (form.phone?.value || '').trim(),
      whatsapp: (form.whatsapp?.value || '').trim(),
      message: (form.message?.value || '').trim(),
      city: (form.city?.value || '').trim(),
      landing_code: (form.landing_code?.value || '').trim(),
    };

    try {
      const res = await fetch('/api/contacts/register/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken || '',
        },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = payload?.detail || payload?.message;
        throw new Error(detail || 'تعذر إرسال الطلب، تأكد من البيانات');
      }
      if (statusEl) statusEl.textContent = 'تم التسجيل بنجاح! سنتواصل معك قريباً.';
      form.reset();
    } catch (err) {
      if (statusEl) statusEl.textContent = err?.message || 'حدث خطأ غير متوقع.';
    }
  }

  form.addEventListener('submit', submitForm);
})();


