# reCAPTCHA Enterprise Setup Complete

## What Changed

I've converted your code from **reCAPTCHA v2** (checkbox) to **reCAPTCHA Enterprise** to match your Google admin setup.

## Key Differences

### reCAPTCHA Enterprise vs v2

| Feature | v2 (Old) | Enterprise (New) |
|---------|----------|------------------|
| **Visibility** | Visible checkbox | Invisible (automatic) |
| **User Interaction** | User clicks checkbox | No user interaction needed |
| **API** | `grecaptcha.getResponse()` | `grecaptcha.enterprise.execute()` |
| **Script** | `api.js` | `enterprise.js` |
| **Token** | From widget | Generated on submit |

## Current Configuration

### Site Key
- **Value**: `6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY`
- **Location**: 
  - `backend/config/templates/black_friday.html` (line 10)
  - `backend/config/templates/lahza_checkout.html` (line 10)
  - Used in JavaScript: `grecaptcha.enterprise.execute()`

### Secret Key
- **Location**: `backend/config/settings.py` (line 207)
- **Status**: ⚠️ **NEEDS TO BE SET** - Currently empty
- **How to get**: From Google reCAPTCHA Enterprise admin panel

## Next Step: Get Your Secret Key

1. Go to: https://www.google.com/recaptcha/admin
2. Find your site with key: `6LfluhcsAAAAAP4Yj4C2orUWz75nFaC5XkDWivPY`
3. Click on it to view details
4. Copy the **Secret Key**
5. Update `backend/config/settings.py` line 207:
   ```python
   RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY', 'YOUR_SECRET_KEY_HERE')
   ```

Or set it via environment variable:
```bash
export RECAPTCHA_SECRET_KEY="your_secret_key_here"
```

## How It Works Now

1. **User fills form** → No visible reCAPTCHA widget
2. **User clicks submit** → reCAPTCHA Enterprise token is generated automatically
3. **Token sent to backend** → Backend verifies with Google
4. **Payment proceeds** → If verification succeeds

## Benefits of Enterprise

- ✅ **Better UX**: No checkbox to click
- ✅ **Automatic**: Works in background
- ✅ **More secure**: Advanced bot detection
- ✅ **No user friction**: Seamless experience

## Testing

1. Restart your Django server
2. Clear browser cache
3. Test payment form - reCAPTCHA should work invisibly
4. Check browser console for any errors
5. Check Django logs for verification results

## Files Updated

- ✅ `backend/config/templates/black_friday.html` - Enterprise script + removed widget
- ✅ `backend/config/templates/lahza_checkout.html` - Enterprise script + removed widget
- ✅ `backend/static/black_friday/script.js` - Enterprise API calls
- ✅ `backend/static/black_friday/lahza_checkout.js` - Enterprise API calls
- ✅ `backend/staticfiles/black_friday/script.js` - Enterprise API calls
- ✅ `backend/staticfiles/black_friday/lahza_checkout.js` - Enterprise API calls
- ✅ `backend/config/settings.py` - Enterprise site key (secret key needs to be added)

## Important Notes

- **No visible widget**: Users won't see a checkbox anymore
- **Automatic execution**: Token is generated when form is submitted
- **Secret key required**: Backend verification won't work without it
- **Same verification endpoint**: Enterprise uses the same `/api/siteverify` endpoint

## Troubleshooting

### "reCAPTCHA is loading" error
- Check if Enterprise script is loaded
- Verify site key is correct
- Check browser console for errors

### Backend verification fails
- Make sure secret key is set in settings
- Verify secret key matches the site key
- Check Django logs for specific error codes

### Token generation fails
- Verify Enterprise script is loaded: `typeof grecaptcha.enterprise !== 'undefined'`
- Check site key is correct
- Verify domain is registered in Google admin

