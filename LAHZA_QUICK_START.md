# Lahza Payment Gateway - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get API Keys

1. Sign up at [Lahza Dashboard](https://dashboard.lahza.io)
2. Go to **Settings** > **API Keys**
3. Copy your **Secret Key** and **Public Key**

### 2. Configure Environment Variables

Add to `.env` file:

```bash
LAHZA_SECRET_KEY=sk_test_your_secret_key_here
LAHZA_PUBLIC_KEY=pk_test_your_public_key_here
LAHZA_BASE_URL=https://api.lahza.io
```

### 3. Test Payment Flow

```python
from config.lahza_service import initialize_transaction, verify_transaction

# Initialize payment
transaction = initialize_transaction(
    email="customer@example.com",
    amount_minor=30000,  # $300.00 in cents
    currency="USD"
)

# Get authorization URL
auth_url = transaction['authorization_url']
print(f"Redirect customer to: {auth_url}")

# After payment, verify
result = verify_transaction(transaction['reference'])
print(f"Payment status: {result['status']}")
```

## 📚 Full Documentation

See **[LAHZA_INTEGRATION_DOCS.md](./LAHZA_INTEGRATION_DOCS.md)** for complete documentation including:

- ✅ Complete API reference
- ✅ Detailed examples
- ✅ Error handling guide
- ✅ Troubleshooting
- ✅ Security best practices

## 🔗 API Endpoints

- **Initialize Payment**: `POST /checkout/payment/initialize/`
- **Verify Payment**: `GET /checkout/payment/verify/?reference=REF`

## ⚠️ Important Notes

- Amount must be in **minor units** (cents): $300.00 = 30000
- Always verify transactions **server-side**
- Never expose secret keys to frontend
- Use HTTPS for all API calls

## 🆘 Troubleshooting

**"Network is unreachable"**:
- Check server internet connection
- Verify firewall settings
- Test: `curl -I https://api.lahza.io`

**"Secret key not configured"**:
- Add `LAHZA_SECRET_KEY` to environment variables
- Restart Django server

For more help, see [Full Documentation](./LAHZA_INTEGRATION_DOCS.md#troubleshooting)

