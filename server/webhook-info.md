# Webhook Information for External Services

## Paydisini Webhook Configuration

**Callback URL**: `https://your-domain.replit.app/api/webhook/paydisini`

### Setup Instructions:
1. Login to your Paydisini dashboard
2. Go to Settings > Webhook Configuration  
3. Set the callback URL to: `https://your-domain.replit.app/api/webhook/paydisini`
4. Save the configuration

### Webhook Payload Structure:
```json
{
  "unique_code": "transaction_id",
  "status": "Success|Pending|Canceled|Expired",
  "amount": 100000,
  "fee": 2500,
  "service": "11",
  "created_at": "2024-01-01 12:00:00",
  "updated_at": "2024-01-01 12:05:00"
}
```

### Status Mapping:
- `Success` → Transaction completed, process with Digiflazz
- `Pending` → Payment still processing
- `Canceled` → Payment canceled by user
- `Expired` → Payment link expired

## Digiflazz Integration

The system automatically processes transactions with Digiflazz once payment is confirmed via Paydisini webhook.

### Flow:
1. User creates transaction via AI chat
2. Payment link generated via Paydisini
3. User completes payment
4. Paydisini sends webhook notification
5. System processes order with Digiflazz
6. Transaction status updated to 'success'