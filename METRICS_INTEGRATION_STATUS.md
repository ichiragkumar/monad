# Metrics Integration Status

## ✅ Frontend Integration Complete

### What's Implemented

1. **Metrics Interceptor** (`src/utils/metrics.ts`)
   - ✅ Intercepts all calls to `https://cca-lite.coinbase.com/metrics`
   - ✅ Parses request body (string, FormData, Blob)
   - ✅ Sends metrics to our backend `/api/v1/metrics`
   - ✅ Returns mock success response to prevent errors
   - ✅ Non-blocking (errors don't break the app)

2. **API Service** (`src/services/api.ts`)
   - ✅ `sendMetrics()` method added
   - ✅ Sends to `/api/v1/metrics` endpoint

3. **Initialization** (`src/main.tsx`)
   - ✅ Metrics interceptor initialized on app startup
   - ✅ Runs before any other code

### How It Works

```
Frontend App
    ↓
Coinbase SDK tries to call: https://cca-lite.coinbase.com/metrics
    ↓
Metrics Interceptor catches it
    ↓
Sends to: http://localhost:3000/api/v1/metrics
    ↓
Backend checks database first
    ↓
If new → Store in DB → Call external API
If duplicate → Skip external API
    ↓
Returns success to frontend
```

---

## 🔧 Backend Requirements

### Endpoint: `POST /api/v1/metrics`

**Request Format:**
```json
{
  "metrics": [
    {
      "metric_name": "perf_web_vitals_inp_needs-improvement",
      "page_path": null,
      "value": 1,
      "tags": {
        "authed": "false",
        "platform": "web",
        "is_low_end_device": true,
        "is_low_end_experience": true,
        "page_key": "",
        "save_data": false,
        "service_worker": "supported",
        "is_perf_metric": true,
        "project_name": "base_account_sdk",
        "version_name": "1.0.0"
      },
      "type": "count"
    }
  ]
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "processed": 1,
    "stored": 1,
    "skipped": 0
  }
}
```

### Backend Logic

1. **Receive Request** → Validate metrics array
2. **For Each Metric:**
   - Generate hash: `SHA256(metric_name + page_path + sorted_tags + type + value)`
   - Check DB: Query for existing metric with same hash within last 1 hour
   - **If exists:** Skip (don't call external API)
   - **If new:** Store in DB → Call external API → Update DB with response
3. **Return Response** with counts

### Database Schema

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(255) NOT NULL,
  page_path VARCHAR(500),
  value DECIMAL NOT NULL,
  tags JSONB NOT NULL,
  type VARCHAR(50) NOT NULL,
  tags_hash VARCHAR(64) NOT NULL, -- SHA256 hash
  external_api_called BOOLEAN DEFAULT false,
  external_api_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast deduplication lookup
CREATE INDEX idx_metrics_dedup 
ON metrics (metric_name, page_path, tags_hash, type, value, created_at DESC);

-- Unique constraint (within 1 hour window)
CREATE UNIQUE INDEX idx_metrics_dedup_unique 
ON metrics (metric_name, COALESCE(page_path, ''), tags_hash, type, value, 
  DATE_TRUNC('hour', created_at));
```

---

## 🧪 Testing

### Test Frontend Interceptor

1. **Start frontend:**
   ```bash
   npm run dev
   ```

2. **Open browser console** and look for:
   - "Metrics interceptor initialized"
   - When Coinbase SDK tries to send metrics, you should see:
     - "Metrics sent: X stored, Y skipped"

3. **Check Network tab:**
   - Look for requests to `/api/v1/metrics` (not `cca-lite.coinbase.com`)
   - Should see successful responses

### Test Backend Endpoint

Use the curl commands from `BACKEND_METRICS_API.md`:

```bash
# Test single metric
curl -X POST http://localhost:3000/api/v1/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": [{
      "metric_name": "test_metric",
      "value": 1,
      "tags": {"test": "value"},
      "type": "count"
    }]
  }'
```

---

## 📊 Expected Behavior

| Action | Frontend | Backend | External API |
|--------|----------|---------|--------------|
| First metric | Intercepts → Sends to backend | Stores in DB → Calls external | Called |
| Duplicate (within 1 hour) | Intercepts → Sends to backend | Skips (already in DB) | Not called |
| New metric | Intercepts → Sends to backend | Stores in DB → Calls external | Called |

---

## ✅ Integration Checklist

- [x] Frontend interceptor created
- [x] API service method added
- [x] Interceptor initialized in main.tsx
- [x] Backend API specification created
- [ ] Backend endpoint implemented
- [ ] Database table created
- [ ] Deduplication logic implemented
- [ ] External API integration
- [ ] Testing completed

---

## 🚨 Important Notes

1. **Non-blocking**: Metrics failures don't break the app
2. **Deduplication**: Based on hash + 1-hour time window
3. **External API**: Only called for new metrics
4. **Error Handling**: External API failures don't fail the request

---

## 📝 Next Steps

1. **Implement backend endpoint** using `BACKEND_METRICS_API.md`
2. **Create database table** with schema provided
3. **Test integration** with curl commands
4. **Verify deduplication** works correctly
5. **Monitor metrics** in database

---

**Frontend is ready! Once backend is implemented, metrics will be automatically intercepted and stored.**

