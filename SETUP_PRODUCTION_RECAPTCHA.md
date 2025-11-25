# Setup Production reCAPTCHA Keys

## Current Status

I've temporarily switched you to **Google's test keys** so you can verify your code works. These keys:
- ✅ Always work (no domain registration needed)
- ✅ Perfect for testing
- ❌ Should NOT be used in production

## Step-by-Step: Get Your Production Keys

### Step 1: Create reCAPTCHA v2 Site

1. Go to: https://www.google.com/recaptcha/admin/create
2. Sign in with your Google account
3. Fill in the form:
   - **Label**: "FX Global Payment Forms"
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"**
   - **Sub-option**: Select **"I'm not a robot" Checkbox** (NOT v3!)
   - **Domains**: Add these domains (one per line):
     ```
     info.fxglobals.co
     www.info.fxglobals.co
     localhost
     127.0.0.1
     ```
   - Accept the reCAPTCHA Terms of Service
4. Click **Submit**

### Step 2: Copy Your Keys

After creating the site, you'll see:
- **Site Key** (starts with `6L...`)
- **Secret Key** (starts with `6L...`)

**IMPORTANT**: Copy BOTH keys from the SAME site!

### Step 3: Update Your Code

#### Update Site Keys (Frontend)

**File 1**: `backend/config/templates/black_friday.html`
- Line 520: Replace test key with your site key
- Change: `data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"`
- To: `data-sitekey="YOUR_SITE_KEY_HERE"`

**File 2**: `backend/config/templates/lahza_checkout.html`
- Line 406: Replace test key with your site key
- Change: `data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"`
- To: `data-sitekey="YOUR_SITE_KEY_HERE"`

#### Update Secret Key (Backend)

**File**: `backend/config/settings.py`
- Line 207: Replace test secret key with your secret key
- Change: `RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY', '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe')`
- To: `RECAPTCHA_SECRET_KEY = os.getenv('RECAPTCHA_SECRET_KEY', 'YOUR_SECRET_KEY_HERE')`

### Step 4: Verify Keys Match

Both keys MUST be from the SAME reCAPTCHA site:
- ✅ Site Key: `6Lf3vxcsAAAAA...` (from Site A)
- ✅ Secret Key: `6Lf3vxcsAAAAA...` (from Site A)
- ❌ Site Key: `6Lf3vxcsAAAAA...` (from Site A)
- ❌ Secret Key: `6LxxxxxAAAAA...` (from Site B) ← WRONG!

### Step 5: Test

1. Restart your Django server
2. Clear browser cache
3. Test the payment form
4. The reCAPTCHA should work without errors

## Common Mistakes

### ❌ Wrong: Using reCAPTCHA v3 Keys
- v3 uses score-based verification (no checkbox)
- Your code expects v2 (checkbox)
- **Solution**: Create v2 site, not v3

### ❌ Wrong: Keys from Different Sites
- Site key from Site A
- Secret key from Site B
- **Solution**: Use both keys from the same site

### ❌ Wrong: Domain Not Registered
- Error: "This reCAPTCHA is for testing purposes only"
- **Solution**: Add your domain in reCAPTCHA admin

### ❌ Wrong: Wrong Domain Format
- Adding `http://info.fxglobals.co` (with protocol)
- **Solution**: Add just `info.fxglobals.co` (no http://)

## Quick Reference

### Test Keys (Current - for testing only)
- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

### Your Production Keys (to be added)
- Site Key: `YOUR_SITE_KEY_HERE`
- Secret Key: `YOUR_SECRET_KEY_HERE`

## Files to Update

1. ✅ `backend/config/templates/black_friday.html` (line 520)
2. ✅ `backend/config/templates/lahza_checkout.html` (line 406)
3. ✅ `backend/config/settings.py` (line 207)

## After Updating

1. Restart Django server
2. Clear browser cache
3. Test payment form
4. Check Django logs for any errors

## Need Help?

If you still get "Invalid key type" error:
1. Verify you created **reCAPTCHA v2** (checkbox), NOT v3
2. Verify both keys are from the **same site**
3. Verify your **domain is registered**
4. Try creating a **new reCAPTCHA site** if keys still don't work

