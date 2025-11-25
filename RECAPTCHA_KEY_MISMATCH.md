# مشكلة: Secret Key لا يطابق Site Key

## المشكلة الحالية

```
error: "reCAPTCHA token is invalid or expired"
error_codes: ["invalid-keys"]
```

## السبب

Secret Key الذي أضفته (`6Lf3vxcsAAAAAArHmGwwTpnr5A6_ANF1JTsSZabX`) **لا يطابق** Site Key المستخدم (`6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY`).

## الحل

### الخطوة 1: اذهب إلى Google reCAPTCHA Admin

افتح: **[https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)**

### الخطوة 2: ابحث عن الموقع الصحيح

ابحث عن الموقع الذي يحتوي على **Site Key** التالي:
```
6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY
```

⚠️ **مهم**: يجب أن يكون Secret Key من **نفس الموقع** الذي يحتوي على هذا Site Key!

### الخطوة 3: انسخ Secret Key الصحيح

- اضغط على الموقع الذي يحتوي على Site Key: `6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY`
- انسخ **Secret Key** من هذا الموقع بالذات
- **لا تستخدم** Secret Key من موقع آخر!

### الخطوة 4: أضف Secret Key الصحيح

في `backend/config/settings.py`:

```python
RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY', 'SECRET_KEY_FROM_SAME_SITE')
```

استبدل `SECRET_KEY_FROM_SAME_SITE` بالـ Secret Key الذي نسخته من **نفس الموقع**.

## كيف تعرف أن المفاتيح متطابقة؟

- **Site Key**: يبدأ بـ `6LfluhcsAAAAA...`
- **Secret Key**: يجب أن يكون من **نفس الموقع** في Google reCAPTCHA Admin

إذا كان Site Key و Secret Key من مواقع مختلفة، ستحصل على خطأ `invalid-keys`.

## ملاحظة

Secret Key الذي أضفته (`6Lf3vxcsAAAAAArHmGwwTpnr5A6_ANF1JTsSZabX`) يبدو أنه من موقع مختلف (يبدأ بـ `6Lf3vxcs` بينما Site Key يبدأ بـ `6Lfluhcs`).

## التحقق

بعد إضافة Secret Key الصحيح:
1. أعد تشغيل الخادم
2. جرّب إرسال النموذج مرة أخرى
3. يجب أن يعمل التحقق الآن

