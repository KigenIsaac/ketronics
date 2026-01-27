# Ketronics Callbacks Documentation

This document outlines all the callback endpoints available in the Ketronics e-commerce platform for handling various external integrations and notifications.

## 📋 Callback Categories

### 🔐 Authentication Callbacks
- **Email Verification**: Handle user email verification from Supabase
- **Password Reset**: Process password reset requests
- **OAuth/Social Login**: Handle third-party authentication callbacks

### 💳 Payment Callbacks
- **M-Pesa Integration**: Handle STK Push payments and C2B callbacks
- **Stripe Webhooks**: Process Stripe payment events
- **Payment Status**: Handle payment success/failure redirects

### 📦 Order Callbacks
- **Order Status Updates**: Receive order status changes from external systems
- **Shipping Updates**: Handle delivery status from courier services
- **Order Tracking**: Provide real-time shipping information

### 📧 Notification Callbacks
- **Email Delivery Status**: Track email delivery, bounces, and complaints
- **SMS Delivery Status**: Monitor SMS delivery success/failure
- **Webhook Verification**: General webhook handling with signature verification

## 🔗 Callback Endpoints

### Authentication Callbacks

#### Email Verification
```
GET/POST /api/callbacks/auth/email-verification
```
Handles email verification when users click verification links.

**Query Parameters (GET):**
- `token` - Verification token from email
- `type` - Verification type (email_confirmation, signup)
- `error` - Error message if verification failed

**Response:**
- Success: Redirects to login with success message
- Failure: Redirects to login with error message

#### Password Reset
```
GET/POST /api/callbacks/auth/password-reset
```
Processes password reset requests.

**Query Parameters (GET):**
- `token` - Password reset token
- `type` - Should be 'recovery'

**Request Body (POST):**
```json
{
  "token": "reset_token_here",
  "newPassword": "new_password_here"
}
```

#### OAuth Callback
```
GET/POST /api/callbacks/auth/oauth
```
Handles social login callbacks (Google, Facebook, GitHub).

**Query Parameters:**
- `code` - Authorization code
- `state` - State parameter for security
- `provider` - OAuth provider (google, facebook, github)

### Payment Callbacks

#### M-Pesa Callback
```
POST /api/callbacks/payments/mpesa
```
Handles M-Pesa payment notifications.

**Request Body:**
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345",
      "CheckoutRequestID": "67890",
      "ResultCode": 0,
      "ResultDesc": "Success",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 1000 },
          { "Name": "MpesaReceiptNumber", "Value": "ABC123XYZ" },
          { "Name": "TransactionDate", "Value": "20240127120000" },
          { "Name": "PhoneNumber", "Value": "254700000000" }
        ]
      }
    }
  }
}
```

#### Stripe Webhook
```
POST /api/callbacks/payments/stripe
```
Processes Stripe payment events.

**Supported Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

### Order Callbacks

#### Order Status Update
```
POST /api/callbacks/orders/status
```
Updates order status from external systems.

**Request Body:**
```json
{
  "orderId": "order_123",
  "status": "shipped",
  "trackingNumber": "TR123456789",
  "carrier": "DHL",
  "estimatedDelivery": "2024-01-30",
  "notes": "Package is on the way"
}
```

**Valid Statuses:**
- `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`, `returned`

#### Shipping Update
```
POST /api/callbacks/orders/shipping
```
Handles shipping status updates from courier services.

**Request Body:**
```json
{
  "trackingNumber": "TR123456789",
  "status": "delivered",
  "location": "Nairobi, Kenya",
  "timestamp": "2024-01-27T10:00:00Z",
  "orderId": "order_123",
  "carrier": "DHL",
  "estimatedDelivery": "2024-01-30",
  "signature": "base64_encoded_signature",
  "photos": ["photo1.jpg", "photo2.jpg"]
}
```

### Notification Callbacks

#### Email Status
```
POST /api/callbacks/notifications/email
```
Tracks email delivery status from providers like SendGrid, Mailgun.

**SendGrid Format:**
```json
[
  {
    "email": "user@example.com",
    "event": "delivered",
    "sg_event_id": "123",
    "sg_message_id": "456",
    "timestamp": 1640995200
  }
]
```

**Mailgun Format:**
```json
{
  "event": "delivered",
  "recipient": "user@example.com",
  "message-id": "123@mg.example.com",
  "timestamp": 1640995200
}
```

#### SMS Status
```
POST /api/callbacks/notifications/sms
```
Monitors SMS delivery status from Twilio, Africa's Talking, etc.

**Twilio Format:**
```json
{
  "MessageSid": "SM123456789",
  "MessageStatus": "delivered",
  "To": "+254700000000",
  "From": "+1234567890"
}
```

**Africa's Talking Format:**
```json
{
  "id": "AT123456789",
  "status": "Delivered",
  "phoneNumber": "+254700000000",
  "networkCode": "63902"
}
```

### General Webhooks

#### Universal Webhook
```
POST /api/callbacks/webhooks
```
Handles any custom webhook integrations.

**Headers:**
- `x-event-type` - Type of event
- `x-signature` - Webhook signature for verification
- `user-agent` - Provider identifier

## 🛠️ Setup Instructions

### 1. Supabase Configuration
Configure your Supabase project with the required tables:

```sql
-- Authentication and user management tables
CREATE TABLE profiles (...)
CREATE TABLE email_events (...)
CREATE TABLE sms_events (...)

-- Payment and order tables
CREATE TABLE payments (...)
CREATE TABLE orders (...)
CREATE TABLE shipping_updates (...)
CREATE TABLE order_status_history (...)

-- Webhook logging
CREATE TABLE webhook_events (...)
CREATE TABLE generic_webhooks (...)
```

### 2. Environment Variables
Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Providers
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
STRIPE_WEBHOOK_SECRET=your_stripe_secret

# Email Providers
SENDGRID_WEBHOOK_SECRET=your_sendgrid_secret
MAILGUN_WEBHOOK_SECRET=your_mailgun_secret

# SMS Providers
TWILIO_AUTH_TOKEN=your_twilio_token
AFRICAS_TALKING_API_KEY=your_at_api_key
```

### 3. Webhook URLs
Configure these URLs in your external service dashboards:

```
Email Verification: https://yourdomain.com/api/callbacks/auth/email-verification
Password Reset: https://yourdomain.com/api/callbacks/auth/password-reset
OAuth Callback: https://yourdomain.com/api/callbacks/auth/oauth
M-Pesa Callback: https://yourdomain.com/api/callbacks/payments/mpesa
Stripe Webhook: https://yourdomain.com/api/callbacks/payments/stripe
Order Status: https://yourdomain.com/api/callbacks/orders/status
Shipping Updates: https://yourdomain.com/api/callbacks/orders/shipping
Email Status: https://yourdomain.com/api/callbacks/notifications/email
SMS Status: https://yourdomain.com/api/callbacks/notifications/sms
General Webhooks: https://yourdomain.com/api/callbacks/webhooks
```

## 🔒 Security Considerations

### Webhook Verification
- Implement proper signature verification for production
- Use webhook secrets to validate request authenticity
- Log all webhook attempts for audit trails

### Rate Limiting
- Implement rate limiting to prevent abuse
- Use Redis or similar for distributed rate limiting
- Monitor webhook usage patterns

### Data Validation
- Validate all incoming webhook data
- Sanitize inputs to prevent injection attacks
- Use Zod schemas for type validation

## 📊 Monitoring & Logging

### Database Tables for Tracking
- `email_events` - Email delivery tracking
- `sms_events` - SMS delivery tracking
- `webhook_events` - General webhook logging
- `order_status_history` - Order status changes
- `shipping_updates` - Shipping status updates

### Error Handling
- All callbacks include comprehensive error logging
- Failed callbacks are logged for manual review
- Automatic retry mechanisms for transient failures

## 🧪 Testing Callbacks

### Local Testing
Use tools like ngrok or localtunnel for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in your webhook configurations
```

### Test Data
Use the following test payloads for development:

```bash
# Test email verification
curl "http://localhost:3000/api/callbacks/auth/email-verification?token=test_token&type=email_confirmation"

# Test payment callback
curl -X POST http://localhost:3000/api/callbacks/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{"Body":{"stkCallback":{"MerchantRequestID":"test","ResultCode":0}}}'
```

## 🚀 Production Deployment

### Environment Setup
- Use production webhook URLs
- Enable webhook signature verification
- Set up proper error monitoring
- Configure rate limiting

### Monitoring
- Set up alerts for failed webhooks
- Monitor callback processing times
- Track success/failure rates
- Log all security events

## 📞 Support

For callback integration support:
- **Technical Documentation**: Check Supabase, Stripe, M-Pesa docs
- **Ketronics Support**: support@ketronics.co.ke
- **Development Team**: dev@ketronics.co.ke

---

**Last Updated**: January 27, 2026
**Version**: 1.0.0