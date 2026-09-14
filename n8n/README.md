# n8n Automation Engine for Real Estate Multi-Portal Ingestion

This directory contains the production-ready **n8n automation workflow** for crawling, normalizing, and ingesting live rental and residential properties across portals (Zillow, Redfin, Realtor.com, Apartments.com, and Trulia).

---

## Architecture Overview

```
[User Search Query] ➔ [/api/crawl]
                         │
                         ├── (If N8N_WEBHOOK_URL set)
                         │         ▼
                         │   [n8n Webhook: POST /webhook/scrape-rentals]
                         │         │
                         │         ├─ Extract Search Criteria (City, Beds, Budget)
                         │         ├─ Multi-Portal Discovery Dispatcher (Zillow, Redfin, etc.)
                         │         ├─ Normalize Schema to Canonical Shikaak Format
                         │         └─ Deduplication & Institutional Underwriting
                         │         │
                         │         ▼
                         └── [Unified Properties Payload] ➔ Render on Map
```

---

## 1. Quick Start with n8n

### Option A: Using Docker (Recommended)
You can launch n8n alongside the platform using Docker Compose:
```bash
docker compose up n8n -d
```
n8n will be running at: **`http://localhost:5678`**

### Option B: Using npm / npx
Alternatively, run n8n directly with Node:
```bash
npx n8n
```

---

## 2. Importing the Workflow into n8n

1. Open **`http://localhost:5678`** in your browser.
2. In the left navigation, click **Workflows** ➔ **Add Workflow** (or `+`).
3. Click the **`...`** (Options menu) in the top-right corner.
4. Select **Import from File**.
5. Choose [`multi-portal-rental-scraper.json`](./workflows/multi-portal-rental-scraper.json).
6. Click **Save** and toggle the workflow to **Active**.

---

## 3. Connecting n8n to the Platform

In your platform `.env` file, configure:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/scrape-rentals
N8N_INGEST_SECRET=rental_n8n_secret_token_2026
```

Whenever a user searches (e.g. `"3bhk in denver"`), `/api/crawl` dispatches the query payload to `N8N_WEBHOOK_URL`, executes the workflow, and returns the normalized listings.

---

## 4. Background Push Ingestion Endpoint

n8n can also run scheduled cron crawls (e.g., every 6 hours) and push newly discovered properties directly into the platform:

* **Endpoint**: `POST http://localhost:3000/api/n8n/ingest`
* **Headers**: `Content-Type: application/json`
* **Body**:
```json
{
  "secret": "rental_n8n_secret_token_2026",
  "listings": [
    {
      "id": "prop_custom_101",
      "title": "1240 E 3rd Ave • Cherry Creek",
      "sourcePortal": "ZILLOW",
      "listingStatus": "FOR_RENT",
      "propertyAddress": {
        "street": "1240 E 3rd Ave",
        "city": "Denver",
        "state": "CO",
        "zipCode": "80206",
        "location": { "latitude": 39.7170, "longitude": -104.9530 }
      },
      "specs": {
        "beds": 3,
        "baths": 2.5,
        "finishedSqFt": 2100,
        "propertyType": "CONDO"
      },
      "financials": {
        "inputs": {
          "monthlyGrossRent": 3200,
          "purchasePrice": 496000
        }
      }
    }
  ]
}
```

---

## 5. Health & Connectivity Check

Check whether n8n integration is online:
```bash
curl http://localhost:3000/api/n8n/status
```
Response:
```json
{
  "status": "operational",
  "n8nConfigured": true,
  "webhookUrl": "http://localhost:5678/webhook/scrape-rentals",
  "lastIngestedAt": "2026-09-14T05:30:00.000Z",
  "totalIngestedCount": 25
}
```
