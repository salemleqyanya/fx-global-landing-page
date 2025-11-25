# Fix "Invalid key type" Error

## The Problem

The error "ERROR for site owner: Invalid key type" appears in the reCAPTCHA widget itself. This means your **site key** is incorrect or doesn't match your setup.

## Most Common Causes

1. **Wrong reCAPTCHA Version**: Site key is for v3 but you're using v2 (or vice versa)
2. **Domain Not Registered**: Your domain isn't added to the reCAPTCHA site
3. **Wrong Site Key**: The key doesn't match your reCAPTCHA site

## Quick Fix Steps

### Step 1: Verify reCAPTCHA Type

You MUST use **reCAPTCHA v2** with the **"I'm not a robot" Checkbox** option.

1. Go to: https://www.google.com/recaptcha/admin
2. Find your site (or create a new one)
3. Make sure it says: **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
4. NOT reCAPTCHA v3 (score-based)

### Step 2: Verify Domain Registration

1. In reCAPTCHA admin, click on your site
2. Scroll to "Domains" section
3. Add ALL domains you're using:
   - `info.fxglobals.co`
   - `www.info.fxglobals.co`
   - `localhost` (for local testing)
   - `127.0.0.1` (for local testing)
   - Your server IP if accessing by IP

### Step 3: Get Fresh Keys

If the keys still don't work:

1. **Option A: Use Existing Site**
   - Go to reCAPTCHA admin
   - Find the site with your site key
   - Copy BOTH keys (site key AND secret key) from the SAME site
   - Make sure they're both listed under the same site

2. **Option B: Create New Site**
   - Go to: https://www.google.com/recaptcha/admin/create
   - Label: "FX Global Payment"
   - Type: **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - Domains: Add all your domains
   - Click Submit
   - Copy BOTH keys immediately

### Step 4: Update Your Code

Update these files with the NEW keys:

**1. Site Key (Frontend):**
- `backend/config/templates/black_friday.html` (line 520)
- `backend/config/templates/lahza_checkout.html` (line 406)

**2. Secret Key (Backend):**
- `backend/config/settings.py` (line 207)

### Step 5: Test with Test Keys (Temporary)

To verify your code works, you can temporarily use Google's test keys:

**Test Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`  
**Test Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

These always work and don't require domain registration.

## Current Keys in Your Code

- **Site Key**: `6Lf3vxcsAAAAAI03JSOmUJ67-DbZLh43CvnM6SAs`
- **Secret Key**: `6Lf3vxcsAAAAAArHmGwwTpnr5A6_ANF1JTsSZabX`

## Verification Checklist

- [ ] Both keys are from the SAME reCAPTCHA site
- [ ] reCAPTCHA type is v2 (checkbox), NOT v3
- [ ] Your domain is registered in reCAPTCHA admin
- [ ] Site key matches the one in reCAPTCHA admin
- [ ] Secret key matches the one in reCAPTCHA admin

## Temporary Workaround

If you need to test while fixing the keys, you can disable backend verification:

In `backend/config/settings.py`, you can set:
```python
RECAPTCHA_VERIFY_ENABLED = False  # Temporarily disable
```

This will allow payments to go through without backend verification (frontend validation still works).

## Still Not Working?

1. **Check Browser Console**: Look for specific error messages
2. **Check Django Logs**: Look for reCAPTCHA verification errors
3. **Verify in Google Admin**: Make sure both keys are from the same site
4. **Try Test Keys**: Use Google's test keys to verify your code works
5. **Create New Site**: Sometimes it's easier to create a fresh reCAPTCHA site

## Need Help?

The error message from Google will tell you exactly what's wrong:
- "Invalid key type" → Wrong reCAPTCHA version or keys don't match
- "This reCAPTCHA is for testing" → Domain not registered
- Other errors → Check the specific error code

