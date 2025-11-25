# reCAPTCHA Testing Guide

## Current Setup

Your Black Friday payment form uses Google reCAPTCHA v2 with the **test key**:
- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Status**: Test key (always passes) ✅

## Quick Testing Steps

### 1. Visual Testing

1. **Navigate to Payment Form**:
   - Go to `/black-friday/`
   - Click any offer button (e.g., "START MAKING MONEY NOW")
   - You should see the payment form

2. **Test Form Validation**:
   - Fill in First Name, Last Name, Mobile, Email
   - Check the Privacy Policy checkbox
   - **Payment button should be DISABLED** until reCAPTCHA is completed
   - Complete the reCAPTCHA checkbox
   - **Payment button should ENABLE** after reCAPTCHA is checked ✅

3. **Test reCAPTCHA Expiration**:
   - Complete the reCAPTCHA
   - Wait ~2 minutes (reCAPTCHA expires)
   - **Payment button should DISABLE** again
   - Complete reCAPTCHA again to re-enable

### 2. Browser Console Testing

Open browser console (F12) and run:

```javascript
// Check if reCAPTCHA API is loaded
console.log('reCAPTCHA loaded:', typeof grecaptcha !== 'undefined');

// Check if reCAPTCHA is completed
console.log('reCAPTCHA response:', grecaptcha.getResponse());

// If completed, you'll see a token like:
// "03AGdBq24..."
// If not completed, you'll see: ""
```

### 3. Test Validation Function

In browser console:

```javascript
// Manually trigger validation
validatePaymentForm();

// Check button state
console.log('Pay button disabled:', document.getElementById('pay-button').disabled);
```

### 4. Test Callback Functions

```javascript
// Test the callback manually
recaptchaCallback();

// Should trigger form validation
// Check if button state changes
```

## Testing Checklist

- [ ] reCAPTCHA widget appears on payment form
- [ ] Payment button is disabled when reCAPTCHA is not completed
- [ ] Payment button enables after completing reCAPTCHA
- [ ] Payment button disables when reCAPTCHA expires
- [ ] Form submission includes reCAPTCHA token
- [ ] Error message shows if trying to submit without reCAPTCHA

## Production Setup

### Step 1: Get Real reCAPTCHA Keys

1. Go to: https://www.google.com/recaptcha/admin/create
2. Sign in with your Google account
3. Fill in the form:
   - **Label**: "FX Global Black Friday"
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains:
     - `info.fxglobals.co`
     - `www.info.fxglobals.co`
     - `localhost` (for local testing)
     - `127.0.0.1` (for local testing)
4. Accept the reCAPTCHA Terms of Service
5. Click **Submit**

### Step 2: Update Site Key

Update the site key in the template:

**File**: `backend/config/templates/black_friday.html`

```html
<!-- Replace the test key with your real site key -->
<div class="g-recaptcha" 
     data-sitekey="YOUR_REAL_SITE_KEY_HERE" 
     data-callback="recaptchaCallback" 
     data-expired-callback="recaptchaExpiredCallback"></div>
```

### Step 3: (Optional) Backend Verification

If you want to verify reCAPTCHA on the backend, add this to `backend/config/settings.py`:

```python
# reCAPTCHA Settings
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY', '')
RECAPTCHA_SITE_KEY = os.environ.get('RECAPTCHA_SITE_KEY', '')
```

Then in your `.env` file:
```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_SITE_KEY=your_site_key_here
```

And add verification in `backend/config/views.py` in the `initialize_lahza_payment` function:

```python
import requests

# Verify reCAPTCHA token
if recaptcha_token:
    verify_url = 'https://www.google.com/recaptcha/api/siteverify'
    verify_data = {
        'secret': settings.RECAPTCHA_SECRET_KEY,
        'response': recaptcha_token
    }
    verify_response = requests.post(verify_url, data=verify_data)
    verify_result = verify_response.json()
    
    if not verify_result.get('success'):
        return Response({
            'success': False,
            'error': 'reCAPTCHA verification failed'
        }, status=status.HTTP_400_BAD_REQUEST)
```

## Test Key Reference

Google provides test keys that always pass:

- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

These are perfect for development/testing but **should NOT be used in production**.

## Troubleshooting

### reCAPTCHA not showing
- Check browser console for errors
- Verify the script is loaded: `<script src="https://www.google.com/recaptcha/api.js" async defer></script>`
- Check if domain is allowed in reCAPTCHA settings

### Payment button not enabling
- Open browser console and check for JavaScript errors
- Verify `validatePaymentForm()` is being called
- Check if `recaptchaCallback` is defined globally

### reCAPTCHA always fails
- Verify domain is added to reCAPTCHA settings
- Check if using correct site key
- Ensure HTTPS is used in production (reCAPTCHA requires HTTPS)

## Current Implementation

The reCAPTCHA implementation includes:
- ✅ Frontend validation (button enable/disable)
- ✅ Callback on completion
- ✅ Expiration handling
- ✅ Reset on form show
- ✅ Token included in payment submission
- ⚠️ Backend verification (optional - not currently implemented)

## Notes

- The test key always passes, so you can test the full flow
- For production, you MUST use your own keys
- reCAPTCHA requires HTTPS in production
- Each domain must be registered in Google reCAPTCHA admin

