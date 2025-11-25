# حل مشاكل reCAPTCHA Enterprise

## الخطأ الحالي: "reCAPTCHA verification service error"

هذا الخطأ يعني أن الطلب إلى Google API فشل. الأسباب المحتملة:

### 1. reCAPTCHA Enterprise API غير مفعّل

**الحل:**
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر المشروع: `fxglobals-40199`
3. اذهب إلى **APIs & Services** > **Library**
4. ابحث عن **reCAPTCHA Enterprise API**
5. اضغط **Enable** إذا لم يكن مفعّلاً

### 2. API Key غير مفعّل لـ reCAPTCHA Enterprise API

**الحل:**
1. اذهب إلى **APIs & Services** > **Credentials**
2. اضغط على API Key الخاص بك
3. في قسم **API restrictions**:
   - اختر **Restrict key**
   - أضف **reCAPTCHA Enterprise API** إلى القائمة
4. احفظ التغييرات

### 3. API Key غير صحيح أو منتهي الصلاحية

**الحل:**
1. تحقق من أن API Key في `settings.py` صحيح
2. أنشئ API Key جديد إذا لزم الأمر:
   - اذهب إلى **APIs & Services** > **Credentials**
   - اضغط **Create Credentials** > **API Key**
   - قم بتقييده لـ reCAPTCHA Enterprise API

### 4. Project ID غير صحيح

**الحل:**
- تأكد من أن `RECAPTCHA_PROJECT_ID = 'fxglobals-40199'` في `settings.py`

## التحقق من السجلات

للتحقق من الخطأ الفعلي، ابحث في سجلات Django عن:

```
[reCAPTCHA] HTTP error
```

ستجد:
- **Status code**: 400, 401, 403, 404, etc.
- **Error message**: رسالة الخطأ من Google API

### رموز الخطأ الشائعة:

- **400 Bad Request**: الطلب غير صحيح (تحقق من JSON body)
- **401 Unauthorized**: API Key غير صحيح أو غير مفعّل
- **403 Forbidden**: API Key لا يملك صلاحيات لـ reCAPTCHA Enterprise API
- **404 Not Found**: Project ID غير صحيح

## اختبار API Key

يمكنك اختبار API Key باستخدام curl:

```bash
curl -X POST \
  "https://recaptchaenterprise.googleapis.com/v1/projects/fxglobals-40199/assessments?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "token": "test_token",
      "expectedAction": "payment_submit",
      "siteKey": "6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY"
    }
  }'
```

إذا حصلت على **401** أو **403**، فالمشكلة في API Key أو الصلاحيات.

## الحل السريع (للتطوير فقط)

إذا أردت تعطيل التحقق مؤقتاً للاختبار:

في `backend/config/settings.py`:
```python
RECAPTCHA_VERIFY_ENABLED = False
```

⚠️ **لا تعطّل التحقق في الإنتاج!**

