# Smoke tests

## Webhook test (with server running)

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d @scripts/smoke_test_payload.json
```

Replace `YOUR_PHONE_NUMBER_ID` in the payload with the ID configured in Settings.

## Urdu / English scripts

| Message | Check |
|---------|-------|
| `DHA 5 marla plot price?` | RAG answer from uploaded PDF |
| `Send details` | Brochure or details in reply |
| `Site visit kal 11 baje` | Appointment in dashboard |
| `Bahria unknown phase 99` | No hallucination; handover or honest reply |
| `/agent` | `human_mode=true` in conversation |

## Meta webhook verify

```bash
curl "http://localhost:8000/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=alf_webhook_verify&hub.challenge=test123"
```

Expected: `test123`
