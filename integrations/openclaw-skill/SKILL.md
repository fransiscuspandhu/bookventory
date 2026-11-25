---
name: bookventory
description: Record expenses, import Shopee/TikTok Excel reports, and query financial reports (Neraca, Laba Rugi, HPP, PPh 22) in Bookventory from WhatsApp or Telegram.
---

# Bookventory Accounting & Tax Skill (OpenClaw / Hermes Agent)

Use this skill whenever the user sends a message or file in WhatsApp or Telegram related to:
- Recording an expense or transaction (e.g., "bayar iklan Meta 1.500.000", "gaji staff gudang 7,6 juta", "beli kemasan botol")
- Uploading an Excel/CSV sales or settlement report from Shopee, TikTok Shop, or Tokopedia
- Asking for financial reports, net profit, HPP (COGS), PPh 22 tax credits, or critical inventory stock alerts

## Endpoints (`http://localhost:3000/api/agent`)

### 1. Query Financial Summary (Neraca, Laba Rugi, HPP, Pajak PPh 22)
```bash
curl -s http://localhost:3000/api/agent | jq .
```

### 2. Create a Double-Entry Draft Journal from Chat
```bash
curl -s -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_journal_draft",
    "prompt": "bayar iklan Meta satu juta lima ratus",
    "debitAccount": "5301 - By Pemasaran META ADS",
    "creditAccount": "1102 - BCA PT",
    "amount": 1500000
  }'
```
