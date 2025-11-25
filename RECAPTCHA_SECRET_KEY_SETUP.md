# إعداد reCAPTCHA Enterprise API Key

## المشكلة الحالية
التحقق من reCAPTCHA يفشل مع رسالة "reCAPTCHA token is invalid" لأن API Key (`RECAPTCHA_API_KEY`) غير مُعدّ.

## الحل

### الخطوة 1: الحصول على API Key من Google Cloud

reCAPTCHA Enterprise يستخدم **API Key** وليس Secret Key. للحصول عليه:

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر المشروع: `fxglobals-40199`
3. اذهب إلى **APIs & Services** > **Credentials**
4. ابحث عن **API Key** لـ reCAPTCHA Enterprise أو أنشئ واحداً جديداً
5. انسخ **API Key**

### الخطوة 2: إضافة API Key

#### الطريقة 1: متغيرات البيئة (مُوصى بها للإنتاج)

أضف API Key إلى ملف `.env` أو متغيرات البيئة:

```bash
RECAPTCHA_API_KEY=your_api_key_here
RECAPTCHA_PROJECT_ID=fxglobals-40199
```

#### الطريقة 2: إضافة مباشرة في settings.py (للتطوير فقط)

في `backend/config/settings.py`:

```python
RECAPTCHA_API_KEY = os.getenv('RECAPTCHA_API_KEY', 'YOUR_API_KEY_HERE')
RECAPTCHA_PROJECT_ID = os.getenv('RECAPTCHA_PROJECT_ID', 'fxglobals-40199')
```

⚠️ **تحذير**: لا ترفع API Key إلى Git! تأكد من إضافته إلى `.gitignore`.

### الخطوة 3: إعادة تشغيل الخادم

بعد إضافة API Key، أعد تشغيل خادم Django:

```bash
python manage.py runserver
```

## التحقق من الإعداد

بعد إضافة API Key، جرّب إرسال النموذج مرة أخرى. يجب أن يعمل التحقق من reCAPTCHA Enterprise بشكل صحيح.

## ملاحظات مهمة

- **API Key vs Secret Key**: reCAPTCHA Enterprise يستخدم **API Key** في URL، وليس Secret Key في body
- **Project ID**: يجب أن يكون `fxglobals-40199` (موجود في settings)
- **Endpoint**: يستخدم `https://recaptchaenterprise.googleapis.com/v1/projects/{project_id}/assessments`
- **JSON Body**: يجب إرسال JSON body مع `event` object يحتوي على `token`, `expectedAction`, و `siteKey`

## تعطيل التحقق مؤقتاً (للتطوير فقط)

إذا أردت تعطيل التحقق من reCAPTCHA مؤقتاً للاختبار:

في `backend/config/settings.py`:

```python
RECAPTCHA_VERIFY_ENABLED = False
```

⚠️ **تحذير**: لا تعطّل التحقق في الإنتاج!

## ملاحظات إضافية

- API Key يجب أن يكون مفعّل لـ reCAPTCHA Enterprise API في Google Cloud
- تأكد من أن النطاق (`info.fxglobals.co` و `localhost`) مسجل في Google reCAPTCHA Admin
- API Key حساس - لا تشاركه أبداً
- Project ID: `fxglobals-40199` (موجود افتراضياً في settings)

