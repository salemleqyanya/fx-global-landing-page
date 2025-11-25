# reCAPTCHA Key Verification Guide

## Error: "Invalid key type"

This error occurs when your **Site Key** and **Secret Key** don't match or are from different reCAPTCHA sites.

## How to Fix

### Step 1: Verify Keys in Google reCAPTCHA Admin

1. Go to: https://www.google.com/recaptcha/admin
2. Sign in with your Google account
3. Find your reCAPTCHA site (the one with key starting with `6Lf3vxcsAAAAA`)
4. Click on it to view details

### Step 2: Verify Key Pair

Make sure both keys are from the **SAME** reCAPTCHA site:

- **Site Key**: `6Lf3vxcsAAAAAI03JSOmUJ67-DbZLh43CvnM6SAs`
- **Secret Key**: `6Lf3vxcsAAAAAArHmGwwTpnr5A6_ANF1JTsSZabX`

Both should be listed under the **same site** in the admin panel.

### Step 3: Check reCAPTCHA Version

Make sure you're using **reCAPTCHA v2** (the "I'm not a robot" checkbox version), NOT v3.

- ✅ **Correct**: reCAPTCHA v2 → "I'm not a robot" Checkbox
- ❌ **Wrong**: reCAPTCHA v3 → Score-based (no checkbox)

### Step 4: Verify Domain Registration

Make sure your domain is registered in the reCAPTCHA admin:

1. In the reCAPTCHA admin, click on your site
2. Scroll to "Domains"
3. Make sure your domain is listed:
   - `info.fxglobals.co`
   - `www.info.fxglobals.co`
   - `localhost` (for testing)
   - `127.0.0.1` (for testing)

### Step 5: Get Fresh Keys (If Needed)

If the keys don't match:

1. **Option A**: Use the correct secret key from the same site
   - Go to reCAPTCHA admin
   - Find the site with your site key
   - Copy the matching secret key
   - Update `RECAPTCHA_SECRET_KEY` in `backend/config/settings.py`

2. **Option B**: Create a new reCAPTCHA site
   - Go to: https://www.google.com/recaptcha/admin/create
   - Select **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - Add your domains
   - Copy BOTH keys (site key and secret key)
   - Update both in your code

## Current Configuration

### Site Key (Frontend)
- **Black Friday**: `backend/config/templates/black_friday.html` (line 520)
- **Checkout**: `backend/config/templates/lahza_checkout.html` (line 406)
- Current: `6Lf3vxcsAAAAAI03JSOmUJ67-DbZLh43CvnM6SAs`

### Secret Key (Backend)
- **Settings**: `backend/config/settings.py` (line 207)
- Current: `6Lf3vxcsAAAAAArHmGwwTpnr5A6_ANF1JTsSZabX`

## Quick Test

To verify your keys match, you can test the verification API directly:

```bash
# Replace YOUR_SECRET_KEY and YOUR_TOKEN
curl -X POST https://www.google.com/recaptcha/api/siteverify \
  -d "secret=YOUR_SECRET_KEY" \
  -d "response=YOUR_TOKEN"
```

If you get `"success": true`, the keys match. If you get an error, the keys don't match.

## Common Issues

### Issue 1: Keys from Different Sites
- **Symptom**: "Invalid key type" error
- **Solution**: Make sure both keys are from the same reCAPTCHA site

### Issue 2: Wrong reCAPTCHA Version
- **Symptom**: Widget doesn't work or shows errors
- **Solution**: Use reCAPTCHA v2 (checkbox), not v3

### Issue 3: Domain Not Registered
- **Symptom**: "This reCAPTCHA is for testing purposes only"
- **Solution**: Add your domain to the reCAPTCHA admin

### Issue 4: Keys Copied Incorrectly
- **Symptom**: Various errors
- **Solution**: Double-check you copied the full keys without spaces

## After Fixing

1. Update the secret key in `backend/config/settings.py`
2. Restart your Django server
3. Clear browser cache
4. Test the payment form again

## Need Help?

If you're still getting errors:
1. Check the Django logs for detailed error messages
2. Verify both keys in Google reCAPTCHA admin
3. Make sure you're using reCAPTCHA v2 (checkbox version)
4. Ensure your domain is registered

