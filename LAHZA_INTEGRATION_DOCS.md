# Lahza Payment Gateway Integration Documentation

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [API Endpoints](#api-endpoints)
4. [Service Functions](#service-functions)
5. [Payment Flow](#payment-flow)
6. [Error Handling](#error-handling)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## Overview

Lahza is a payment gateway service that enables secure online payments. This integration provides a complete solution for processing payments through Lahza API.

### Features

- ✅ Initialize payment transactions
- ✅ Verify transaction status
- ✅ Support for multiple currencies (USD by default)
- ✅ Customer information handling
- ✅ Metadata support for custom data
- ✅ Callback URL support
- ✅ Comprehensive error handling
- ✅ Transaction logging

### Architecture

```
Frontend (JavaScript)
    ↓
Django Backend (views.py)
    ↓
Lahza Service (lahza_service.py)
    ↓
Lahza API (api.lahza.io)
```

---

## Setup & Configuration

### 1. Environment Variables

Add the following to your `.env` file or environment variables:

```bash
# Lahza API Configuration
LAHZA_SECRET_KEY=sk_test_your_secret_key_here
LAHZA_PUBLIC_KEY=pk_test_your_public_key_here
LAHZA_BASE_URL=https://api.lahza.io
LAHZA_CALLBACK_URL=https://yourdomain.com/checkout/
```

### 2. Django Settings

In `backend/config/settings.py`:

```python
# Lahza Payment Gateway Settings
LAHZA_SECRET_KEY = os.getenv('LAHZA_SECRET_KEY', 'sk_test_ppMyMbmAtVKU8Z2iuHUsuxG46LV6EdlSC')
LAHZA_PUBLIC_KEY = os.getenv('LAHZA_PUBLIC_KEY', 'pk_test_I4yPfCO5DHBtNApOgmjxobn55fGqFCJhk')
LAHZA_BASE_URL = os.getenv('LAHZA_BASE_URL', 'https://api.lahza.io')
LAHZA_CALLBACK_URL = os.getenv(
    'LAHZA_CALLBACK_URL',
    'https://yourdomain.com/checkout/'
)
```

### 3. Get Your API Keys

1. Sign up at [Lahza Dashboard](https://dashboard.lahza.io)
2. Navigate to **Settings** > **API Keys**
3. Copy your **Secret Key** and **Public Key**
4. Add them to your environment variables

⚠️ **Important**: 
- Never commit API keys to version control
- Use different keys for development and production
- Secret Key should be kept secure and never exposed to frontend

---

## API Endpoints

### 1. Initialize Payment

**Endpoint**: `POST /checkout/payment/initialize/`

**Purpose**: Initialize a new payment transaction with Lahza.

**Request Body**:

```json
{
  "email": "customer@example.com",
  "amount": 300.00,
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "+962791234567",
  "offerType": "yearly",
  "source": "checkout",
  "offerName": "Annual VIP Membership",
  "recaptchaToken": "03AGdBq27..."
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Customer email address |
| `amount` | float | Yes | Payment amount in major currency units (e.g., 300.00 for $300) |
| `firstName` | string | No | Customer first name |
| `lastName` | string | No | Customer last name |
| `mobile` | string | No | Customer mobile number (with country code) |
| `offerType` | string | No | Type of offer (e.g., "yearly", "monthly") |
| `source` | string | No | Source of payment (e.g., "checkout", "black_friday") |
| `offerName` | string | No | Name of the offer |
| `recaptchaToken` | string | No | reCAPTCHA verification token |

**Success Response** (200 OK):

```json
{
  "success": true,
  "reference": "CK-A1B2C3D4E5F6",
  "authorization_url": "https://checkout.lahza.io/authorize/...",
  "access_code": "abc123xyz"
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Email and amount are required"
}
```

### 2. Verify Payment

**Endpoint**: `GET /checkout/payment/verify/?reference=REFERENCE`

**Purpose**: Verify the status of a payment transaction.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reference` | string | Yes | Payment reference ID |

**Success Response** (200 OK):

```json
{
  "success": true,
  "reference": "CK-A1B2C3D4E5F6",
  "status": "success",
  "amount": 30000,
  "currency": "USD",
  "customer": {
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Payment reference is required"
}
```

---

## Service Functions

### `initialize_transaction()`

Initialize a new payment transaction with Lahza.

**Function Signature**:

```python
def initialize_transaction(
    *,
    email: str,
    amount_minor: int,
    currency: str = "USD",
    reference: Optional[str] = None,
    mobile: Optional[str] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    callback_url: Optional[str] = None,
) -> Dict[str, Any]
```

**Parameters**:

- `email` (str, required): Customer email address
- `amount_minor` (int, required): Amount in minor currency units (cents for USD)
  - Example: $300.00 = 30000 cents
- `currency` (str, optional): Currency code (default: "USD")
- `reference` (str, optional): Custom transaction reference
- `mobile` (str, optional): Customer mobile number
- `first_name` (str, optional): Customer first name
- `last_name` (str, optional): Customer last name
- `metadata` (dict, optional): Additional metadata
- `callback_url` (str, optional): URL to call after payment completion

**Returns**:

```python
{
    "reference": "CK-A1B2C3D4E5F6",
    "authorization_url": "https://checkout.lahza.io/authorize/...",
    "access_code": "abc123xyz",
    "status": "pending"
}
```

**Raises**:

- `LahzaAPIError`: If API call fails or returns error

**Example**:

```python
from config.lahza_service import initialize_transaction

try:
    transaction = initialize_transaction(
        email="customer@example.com",
        amount_minor=30000,  # $300.00
        currency="USD",
        reference="CK-A1B2C3D4E5F6",
        first_name="John",
        last_name="Doe",
        mobile="+962791234567",
        metadata={
            "offer_type": "yearly",
            "source": "checkout"
        },
        callback_url="https://yourdomain.com/checkout/?reference=CK-A1B2C3D4E5F6"
    )
    
    print(f"Transaction initialized: {transaction['reference']}")
    print(f"Authorization URL: {transaction['authorization_url']}")
except LahzaAPIError as e:
    print(f"Error: {e}")
```

### `verify_transaction()`

Verify the status of a payment transaction.

**Function Signature**:

```python
def verify_transaction(reference: str) -> Dict[str, Any]
```

**Parameters**:

- `reference` (str, required): Transaction reference ID

**Returns**:

```python
{
    "reference": "CK-A1B2C3D4E5F6",
    "status": "success",
    "amount": 30000,
    "currency": "USD",
    "customer": {
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

**Raises**:

- `LahzaAPIError`: If API call fails or returns error

**Example**:

```python
from config.lahza_service import verify_transaction

try:
    transaction = verify_transaction("CK-A1B2C3D4E5F6")
    
    if transaction['status'] == 'success':
        print("Payment successful!")
    else:
        print(f"Payment status: {transaction['status']}")
except LahzaAPIError as e:
    print(f"Error: {e}")
```

---

## Payment Flow

### Complete Payment Flow

```
1. Customer fills payment form
   ↓
2. Frontend sends POST to /checkout/payment/initialize/
   ↓
3. Backend validates data and reCAPTCHA
   ↓
4. Backend calls initialize_transaction()
   ↓
5. Lahza API returns authorization_url
   ↓
6. Frontend redirects customer to authorization_url
   ↓
7. Customer completes payment on Lahza
   ↓
8. Lahza redirects to callback_url
   ↓
9. Backend calls verify_transaction()
   ↓
10. Payment status updated in database
```

### Reference Generation

References are automatically generated with format:
- Checkout: `CK-{12_CHAR_HEX}`
- Black Friday: `BF-{12_CHAR_HEX}`

Example: `CK-A1B2C3D4E5F6`

### Amount Conversion

Amounts are converted from major units to minor units:
- Frontend sends: `300.00` (USD)
- Backend converts: `30000` (cents)
- Lahza receives: `30000` (minor units)

---

## Error Handling

### Exception Types

#### `LahzaAPIError`

Raised when Lahza API returns an error or network issues occur.

**Common Error Scenarios**:

1. **Network Errors**:
   - `Network is unreachable`
   - `Failed to establish connection`
   - `Connection timeout`

2. **API Errors**:
   - Invalid API key
   - Missing required parameters
   - Invalid amount or currency

3. **Transaction Errors**:
   - Transaction not found
   - Transaction already processed
   - Insufficient funds

### Error Response Format

All errors return a consistent format:

```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

### User-Friendly Error Messages

The system automatically converts technical errors to user-friendly messages:

| Technical Error | User Message |
|----------------|--------------|
| `Network is unreachable` | "Unable to connect to payment service. Please check your internet connection and try again." |
| `timeout` | "Payment service request timed out. Please try again." |
| `Connection` errors | "Unable to connect to payment service. Please try again later." |
| Other errors | "Unable to initialize payment. Please try again or contact support if the problem persists." |

### Error Handling Example

```python
from config.lahza_service import initialize_transaction, LahzaAPIError

try:
    transaction = initialize_transaction(
        email="customer@example.com",
        amount_minor=30000
    )
except LahzaAPIError as e:
    error_message = str(e)
    
    if "Network is unreachable" in error_message:
        # Handle network error
        print("Network connection issue")
    elif "timeout" in error_message.lower():
        # Handle timeout
        print("Request timed out")
    else:
        # Handle other errors
        print(f"Payment error: {error_message}")
```

---

## Examples

### Example 1: Basic Payment Initialization

```python
from config.lahza_service import initialize_transaction, LahzaAPIError

# Initialize payment
try:
    transaction = initialize_transaction(
        email="customer@example.com",
        amount_minor=30000,  # $300.00
        currency="USD",
        first_name="John",
        last_name="Doe",
        mobile="+962791234567"
    )
    
    # Redirect customer to authorization URL
    authorization_url = transaction['authorization_url']
    print(f"Redirect to: {authorization_url}")
    
except LahzaAPIError as e:
    print(f"Error initializing payment: {e}")
```

### Example 2: Payment with Metadata

```python
from config.lahza_service import initialize_transaction

transaction = initialize_transaction(
    email="customer@example.com",
    amount_minor=50000,  # $500.00
    currency="USD",
    reference="CUSTOM-REF-123",
    metadata={
        "offer_type": "yearly",
        "source": "black_friday",
        "offer_name": "Annual VIP Membership",
        "discount": "55%"
    },
    callback_url="https://yourdomain.com/checkout/?reference=CUSTOM-REF-123"
)
```

### Example 3: Verify Payment

```python
from config.lahza_service import verify_transaction, LahzaAPIError

try:
    transaction = verify_transaction("CK-A1B2C3D4E5F6")
    
    status = transaction.get('status')
    
    if status == 'success':
        print("Payment successful!")
        print(f"Amount: ${transaction.get('amount', 0) / 100}")
    elif status == 'pending':
        print("Payment is still pending")
    else:
        print(f"Payment status: {status}")
        
except LahzaAPIError as e:
    print(f"Error verifying payment: {e}")
```

### Example 4: Frontend Integration

```javascript
// Initialize payment
async function initializePayment(formData) {
    try {
        const response = await fetch('/checkout/payment/initialize/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                amount: formData.amount,
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobile: formData.mobile,
                recaptchaToken: recaptchaToken
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to Lahza payment page
            window.location.href = data.authorization_url;
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Payment initialization error:', error);
        alert('An error occurred. Please try again.');
    }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Network is unreachable" Error

**Problem**: Server cannot connect to `api.lahza.io`

**Solutions**:
- Check server internet connection
- Verify firewall settings
- Check if server is behind proxy (configure proxy if needed)
- Test connection: `curl -I https://api.lahza.io`

#### 2. "Lahza secret key is not configured" Error

**Problem**: `LAHZA_SECRET_KEY` is missing or empty

**Solutions**:
- Add `LAHZA_SECRET_KEY` to environment variables
- Check `.env` file exists and contains the key
- Restart Django server after adding environment variables

#### 3. "Invalid response from Lahza" Error

**Problem**: Lahza API returned non-JSON response

**Solutions**:
- Check Lahza API status
- Verify API endpoint is correct
- Check network connectivity
- Review server logs for detailed error

#### 4. Transaction Not Found

**Problem**: Reference doesn't exist in Lahza

**Solutions**:
- Verify reference format is correct
- Check if transaction was actually initialized
- Ensure reference matches between initialize and verify calls

#### 5. Amount Mismatch

**Problem**: Amount sent doesn't match expected

**Solutions**:
- Ensure amount is converted to minor units (cents)
- Example: $300.00 = 30000 cents
- Check currency code matches (USD, JOD, etc.)

### Debugging

#### Enable Detailed Logging

Add to `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'config.lahza_service': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

#### Check Logs

Look for log entries prefixed with `[Lahza]`:

```bash
# View Django logs
tail -f logs/django.log | grep Lahza

# Or in console
python manage.py runserver
# Look for [Lahza] log entries
```

#### Test API Connection

```python
# Test script
import requests
from django.conf import settings

url = f"{settings.LAHZA_BASE_URL}/transaction/initialize"
headers = {
    "Authorization": f"Bearer {settings.LAHZA_SECRET_KEY}",
    "Content-Type": "application/json"
}
payload = {
    "email": "test@example.com",
    "amount": 10000,  # $100.00
    "currency": "USD"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

---

## Security Best Practices

### 1. API Key Security

- ✅ Never commit API keys to version control
- ✅ Use environment variables for all keys
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly
- ✅ Never expose secret keys to frontend

### 2. Data Validation

- ✅ Validate all input data
- ✅ Sanitize user inputs
- ✅ Verify email format
- ✅ Validate amount ranges
- ✅ Check currency codes

### 3. Error Handling

- ✅ Don't expose technical error details to users
- ✅ Log detailed errors server-side
- ✅ Use generic error messages for users
- ✅ Implement rate limiting

### 4. Transaction Security

- ✅ Always verify transactions server-side
- ✅ Use HTTPS for all API calls
- ✅ Validate callback URLs
- ✅ Implement idempotency for transactions
- ✅ Store transaction references securely

### 5. reCAPTCHA Integration

- ✅ Verify reCAPTCHA tokens server-side
- ✅ Don't skip verification in production
- ✅ Use appropriate reCAPTCHA version (v3 recommended)

---

## Additional Resources

- [Lahza Official Documentation](https://docs.lahza.io)
- [Lahza Dashboard](https://dashboard.lahza.io)
- [Payment Gateway Best Practices](https://docs.lahza.io/guides/best-practices)

---

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check Lahza API status
4. Contact Lahza support: support@lahza.io

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0

