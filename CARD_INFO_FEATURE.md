# Card Information Feature Documentation

## Overview

This feature automatically saves and emails card information to customers after successful payment through Lahza payment gateway.

## Features

- ✅ **Automatic Card Info Extraction**: Extracts card information from Lahza API response
- ✅ **Database Storage**: Saves card details securely in Payment model
- ✅ **Email Notification**: Sends card information to customer via email
- ✅ **Multiple Format Support**: Handles different card info formats from Lahza API

## Database Fields

The following fields have been added to the `Payment` model:

| Field | Type | Description |
|-------|------|-------------|
| `card_type` | CharField(50) | Card type (e.g., Visa, Mastercard) |
| `card_brand` | CharField(50) | Card brand |
| `last_four_digits` | CharField(4) | Last 4 digits of card number |
| `card_expiry_month` | CharField(2) | Card expiry month (MM) |
| `card_expiry_year` | CharField(4) | Card expiry year (YYYY) |

## How It Works

### 1. Payment Verification Flow

```
Payment Success
    ↓
verify_lahza_payment() called
    ↓
transaction_data received from Lahza
    ↓
payment.mark_as_success(transaction_data)
    ↓
Card info extracted from transaction_data
    ↓
Card info saved to database
    ↓
send_payment_receipt_email() called
    ↓
Email sent with card information
```

### 2. Card Information Extraction

The system extracts card information from multiple possible locations in the Lahza API response:

- `transaction_data['card']`
- `transaction_data['authorization']['card']`
- `transaction_data['payment_method']['card']`

**Supported Fields**:
- `type` / `brand` → `card_type` / `card_brand`
- `last4` / `last_4` / `last_four` → `last_four_digits`
- `exp_month` / `expiry_month` → `card_expiry_month`
- `exp_year` / `expiry_year` → `card_expiry_year`

### 3. Email Template

The email receipt includes:

- Card Type/Brand
- Last 4 Digits (masked as `****1234`)
- Card Expiry Date (if available)

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
python manage.py makemigrations contacts
python manage.py migrate
```

### 2. Verify Email Settings

Ensure email settings are configured in `settings.py`:

```python
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'info@fxglobals.co'
```

### 3. Test the Feature

1. Make a test payment
2. Verify payment is successful
3. Check database for card info fields
4. Verify email is sent with card information

## Email Template

The email template (`emails/payment_receipt.html`) displays:

```html
{% if payment.card_type or payment.card_brand %}
<div class="info-row">
    <span class="info-label">Card Type:</span>
    <span class="info-value">{{ payment.card_brand|default:payment.card_type|upper }}</span>
</div>
{% endif %}

{% if payment.last_four_digits %}
<div class="info-row">
    <span class="info-label">Card Number (Last 4 Digits):</span>
    <span class="info-value">****{{ payment.last_four_digits }}</span>
</div>
{% endif %}

{% if payment.card_expiry_month and payment.card_expiry_year %}
<div class="info-row">
    <span class="info-label">Card Expiry:</span>
    <span class="info-value">{{ payment.card_expiry_month }}/{{ payment.card_expiry_year }}</span>
</div>
{% endif %}
```

## Security Considerations

⚠️ **Important Security Notes**:

1. **PCI Compliance**: Only last 4 digits are stored (PCI compliant)
2. **No Full Card Numbers**: Full card numbers are NEVER stored
3. **Encrypted Storage**: Consider encrypting card info fields in production
4. **Access Control**: Limit access to card information fields
5. **Email Security**: Use HTTPS for email links and secure email providers

## Troubleshooting

### Card Information Not Saved

**Check**:
1. Lahza API response format
2. Logs for extraction errors
3. Database migration status

**Debug**:
```python
# Check transaction_data structure
logger.info(f"[Payment] Transaction data: {transaction_data}")

# Check card extraction
if 'card' in transaction_data:
    logger.info(f"[Payment] Card info found: {transaction_data['card']}")
```

### Email Not Sent

**Check**:
1. Email settings configuration
2. Email server connectivity
3. Logs for email errors

**Debug**:
```python
# Check email sending
logger.info(f"[Email] Attempting to send to {payment.customer_email}")
```

### Card Info Not in Email

**Check**:
1. Card info fields are populated in database
2. Email template is using correct field names
3. Template rendering errors

**Debug**:
```python
# Check payment object
logger.info(f"[Payment] Card info - Type: {payment.card_type}, Last4: {payment.last_four_digits}")
```

## API Response Examples

### Example 1: Card in root level

```json
{
  "status": "success",
  "card": {
    "type": "Visa",
    "brand": "Visa",
    "last4": "1234",
    "exp_month": "12",
    "exp_year": "2025"
  }
}
```

### Example 2: Card in authorization object

```json
{
  "status": "success",
  "authorization": {
    "card": {
      "type": "Mastercard",
      "last4": "5678",
      "exp_month": "06",
      "exp_year": "2026"
    }
  }
}
```

### Example 3: Card in payment_method object

```json
{
  "status": "success",
  "payment_method": {
    "card": {
      "brand": "Visa",
      "last_4": "9012",
      "expiry_month": "03",
      "expiry_year": "2027"
    }
  }
}
```

## Code Changes Summary

### 1. Model Changes (`contacts/models.py`)

Added fields to `Payment` model:
- `card_type`
- `card_brand`
- `last_four_digits`
- `card_expiry_month`
- `card_expiry_year`

### 2. Model Method Updates (`contacts/models.py`)

Updated `mark_as_success()` method to:
- Extract card information from transaction_data
- Handle multiple response formats
- Save card info to database

### 3. View Updates (`config/views.py`)

Updated `verify_lahza_payment()` to:
- Log card information after extraction
- Ensure card info is saved before email sending

### 4. Email Template Updates (`emails/payment_receipt.html`)

Updated template to display:
- Card type/brand
- Last 4 digits (masked)
- Card expiry date

## Testing

### Manual Testing

1. **Test Payment Flow**:
   ```bash
   # Make a test payment
   # Verify payment succeeds
   # Check database for card info
   # Verify email received
   ```

2. **Check Database**:
   ```python
   from contacts.models import Payment
   
   payment = Payment.objects.filter(status='success').latest('paid_at')
   print(f"Card Type: {payment.card_type}")
   print(f"Last 4: {payment.last_four_digits}")
   print(f"Expiry: {payment.card_expiry_month}/{payment.card_expiry_year}")
   ```

3. **Check Email**:
   - Verify email is sent
   - Check email contains card information
   - Verify formatting is correct

## Future Enhancements

- [ ] Add card info to admin panel
- [ ] Add card info export functionality
- [ ] Add encryption for card info fields
- [ ] Add card info to customer dashboard
- [ ] Add card info to payment history API

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0

