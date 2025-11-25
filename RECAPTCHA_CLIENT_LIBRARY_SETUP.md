# إعداد reCAPTCHA Enterprise باستخدام Google Cloud Client Library

تم تحديث الكود لاستخدام **Google Cloud Client Library** لـ reCAPTCHA Enterprise، وهو الطريقة الموصى بها والأكثر أماناً.

## المزايا

- ✅ **أكثر أماناً**: لا يحتاج API Key في URL
- ✅ **أسهل في الإعداد**: يستخدم Application Default Credentials
- ✅ **أفضل أداء**: مكتبة محسّنة من Google
- ✅ **Fallback تلقائي**: إذا فشل، يحاول REST API ثم siteverify

## الخطوة 1: تثبيت المكتبة

```bash
pip install google-cloud-recaptcha-enterprise==1.20.0
```

أو إذا كنت تستخدم `requirements.txt`:

```bash
pip install -r requirements.txt
```

## الخطوة 2: إعداد Google Cloud Authentication

### الطريقة 1: Application Default Credentials (مُوصى بها)

1. **تثبيت Google Cloud SDK** (إذا لم يكن مثبتاً):
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # أو اتبع التعليمات من: https://cloud.google.com/sdk/docs/install
   ```

2. **تسجيل الدخول**:
   ```bash
   gcloud auth application-default login
   ```

3. **اختر المشروع**:
   ```bash
   gcloud config set project fxglobals-40199
   ```

### الطريقة 2: Service Account (للإنتاج)

1. **إنشاء Service Account**:
   - اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
   - اختر المشروع: `fxglobals-40199`
   - اذهب إلى **IAM & Admin** > **Service Accounts**
   - اضغط **Create Service Account**
   - أعطه اسم: `recaptcha-enterprise-service`
   - اضغط **Create and Continue**
   - أضف Role: **reCAPTCHA Enterprise Agent**
   - اضغط **Done**

2. **إنشاء Key**:
   - اضغط على Service Account الذي أنشأته
   - اذهب إلى **Keys** tab
   - اضغط **Add Key** > **Create new key**
   - اختر **JSON**
   - احفظ الملف في مكان آمن

3. **إعداد متغير البيئة**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
   ```

   أو في `settings.py`:
   ```python
   import os
   os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/your/service-account-key.json'
   ```

### الطريقة 3: متغيرات البيئة (للإنتاج على الخوادم)

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## الخطوة 3: التأكد من الصلاحيات

تأكد من أن الحساب المستخدم لديه الصلاحيات التالية:
- **reCAPTCHA Enterprise Agent** role

## كيف يعمل الكود الآن

الكود يحاول بالترتيب:

1. **Google Cloud Client Library** (الأفضل)
   - يستخدم Application Default Credentials
   - لا يحتاج API Key في URL
   - أكثر أماناً

2. **Enterprise REST API** (Fallback)
   - إذا فشل Client Library
   - يحتاج API Key

3. **siteverify endpoint** (Fallback نهائي)
   - إذا فشل REST API
   - يحتاج Secret Key

## التحقق من الإعداد

بعد إعداد Authentication، جرّب إرسال النموذج. يجب أن ترى في السجلات:

```
[reCAPTCHA] Verifying Enterprise token via Client Library
[reCAPTCHA] Verification successful via Client Library - score: X, action: payment_submit
```

## استكشاف الأخطاء

### خطأ: "Could not automatically determine credentials"

**الحل**: قم بإعداد Application Default Credentials:
```bash
gcloud auth application-default login
```

### خطأ: "Permission denied"

**الحل**: تأكد من أن الحساب لديه role **reCAPTCHA Enterprise Agent**

### خطأ: "Project not found"

**الحل**: تأكد من أن `RECAPTCHA_PROJECT_ID = 'fxglobals-40199'` في settings

## ملاحظات

- لا حاجة لـ API Key عند استخدام Client Library
- Secret Key لا يزال مفيداً كـ fallback
- تأكد من عدم رفع ملفات Service Account Key إلى Git

