# حل سريع لمشكلة reCAPTCHA

## المشكلة الحالية
```
reCAPTCHA verification is not properly configured. Please contact support.
error_codes: ["missing-credentials"]
```

## الحل السريع (خلال دقائق)

### الخطوة 1: الحصول على Secret Key

1. اذهب إلى [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. اختر موقعك (Site key: `6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY`)
3. انسخ **Secret Key** (المفتاح السري)

### الخطوة 2: إضافة Secret Key

**في `backend/config/settings.py`:**

```python
RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY', 'YOUR_SECRET_KEY_HERE')
```

**أو في متغيرات البيئة:**

```bash
export RECAPTCHA_SECRET_KEY="your_secret_key_here"
```

### الخطوة 3: إعادة تشغيل الخادم

```bash
python manage.py runserver
```

## التحقق

بعد إضافة Secret Key، جرّب إرسال النموذج مرة أخرى. يجب أن يعمل الآن.

## ملاحظة

- Secret Key يعمل كـ **fallback** إذا فشل Client Library أو REST API
- لا ترفع Secret Key إلى Git
- تأكد من إضافته إلى `.gitignore` إذا كنت تستخدمه في settings.py مباشرة

## إذا استمرت المشكلة

تحقق من السجلات في Django لمعرفة الخطأ الفعلي:

```bash
# ابحث عن رسائل reCAPTCHA في السجلات
grep -i "reCAPTCHA" logs/django.log
```

ستجد معلومات مثل:
- هل Client Library متاح؟
- هل API Key موجود؟
- هل Secret Key موجود؟
- ما هو الخطأ الفعلي؟

