# Backend Metrics API Specification

## Overview

This API handles metrics collection from the frontend. It checks the database first before calling external APIs, and stores metrics to avoid duplicates.

---

## Endpoint

### POST `/api/v1/metrics`

**Description**: Receive metrics from frontend, check DB first, then call external API if needed

**Request Body**:
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

**Response**:
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

---

## Backend Logic Flow

### 1. Receive Metrics Request

```typescript
POST /api/v1/metrics
Body: { metrics: Metric[] }
```

### 2. Check Database First

For each metric:
- Create a unique identifier from:
  - `metric_name`
  - `page_path` (or null)
  - `tags` (serialized as JSON string)
  - `type`
  - `value`
  - Timestamp (rounded to nearest minute/hour for deduplication)

- Query database:
  ```sql
  SELECT * FROM metrics 
  WHERE metric_name = ? 
    AND page_path = ? 
    AND tags_hash = ? 
    AND type = ?
    AND value = ?
    AND created_at >= ? -- Within last hour (or your dedup window)
  ```

### 3. Process Metrics

**If metric exists in DB:**
- Skip external API call
- Return success (metric already stored)

**If metric NOT in DB:**
- Store in database first
- Then call external API: `POST https://cca-lite.coinbase.com/metrics`
- Store external API response (if needed)
- Return success

### 4. Deduplication Rules

- **Time Window**: Check for duplicates within last 1 hour (configurable)
- **Hash Key**: Create hash from `metric_name + page_path + JSON.stringify(tags) + type + value`
- **Unique Constraint**: Use database unique constraint on hash + timestamp window

---

## Database Schema

### Metrics Table

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(255) NOT NULL,
  page_path VARCHAR(500),
  value DECIMAL NOT NULL,
  tags JSONB NOT NULL,
  type VARCHAR(50) NOT NULL,
  tags_hash VARCHAR(64) NOT NULL, -- SHA256 hash of tags JSON
  external_api_called BOOLEAN DEFAULT false,
  external_api_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for fast lookups
  INDEX idx_metrics_lookup (metric_name, page_path, tags_hash, type, value, created_at),
  INDEX idx_metrics_created_at (created_at)
);

-- Unique constraint for deduplication (within 1 hour window)
CREATE UNIQUE INDEX idx_metrics_dedup 
ON metrics (metric_name, page_path, tags_hash, type, value, 
  DATE_TRUNC('hour', created_at));
```

---

## Implementation Example (Node.js/Express)

```typescript
import crypto from 'crypto'
import axios from 'axios'

interface Metric {
  metric_name: string
  page_path?: string | null
  value: number
  tags: Record<string, any>
  type: string
}

// Generate hash for deduplication
function generateMetricHash(metric: Metric): string {
  const data = JSON.stringify({
    metric_name: metric.metric_name,
    page_path: metric.page_path,
    tags: metric.tags,
    type: metric.type,
    value: metric.value,
  })
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Check if metric exists in DB (within last hour)
async function metricExistsInDB(
  metric: Metric,
  tagsHash: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const existing = await db.metrics.findFirst({
    where: {
      metric_name: metric.metric_name,
      page_path: metric.page_path,
      tags_hash: tagsHash,
      type: metric.type,
      value: metric.value,
      created_at: {
        gte: oneHourAgo,
      },
    },
  })
  
  return !!existing
}

// Store metric in DB
async function storeMetric(
  metric: Metric,
  tagsHash: string
): Promise<void> {
  await db.metrics.create({
    data: {
      metric_name: metric.metric_name,
      page_path: metric.page_path,
      value: metric.value,
      tags: metric.tags,
      type: metric.type,
      tags_hash: tagsHash,
      external_api_called: false,
    },
  })
}

// Call external API
async function callExternalMetricsAPI(metrics: Metric[]): Promise<any> {
  try {
    const response = await axios.post(
      'https://cca-lite.coinbase.com/metrics',
      { metrics },
      {
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('External metrics API error:', error)
    throw error
  }
}

// Main endpoint handler
app.post('/api/v1/metrics', async (req, res) => {
  try {
    const { metrics } = req.body
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Metrics array is required',
        },
      })
    }

    let processed = 0
    let stored = 0
    let skipped = 0
    const metricsToSend: Metric[] = []

    // Process each metric
    for (const metric of metrics) {
      processed++
      
      // Generate hash for deduplication
      const tagsHash = generateMetricHash(metric)
      
      // Check if metric already exists in DB
      const exists = await metricExistsInDB(metric, tagsHash)
      
      if (exists) {
        skipped++
        continue // Skip - already in DB
      }
      
      // Store in database
      await storeMetric(metric, tagsHash)
      stored++
      
      // Add to list for external API call
      metricsToSend.push(metric)
    }

    // Call external API only for new metrics
    if (metricsToSend.length > 0) {
      try {
        const externalResponse = await callExternalMetricsAPI(metricsToSend)
        
        // Update stored metrics with external API response
        for (const metric of metricsToSend) {
          const tagsHash = generateMetricHash(metric)
          await db.metrics.updateMany({
            where: {
              metric_name: metric.metric_name,
              page_path: metric.page_path,
              tags_hash: tagsHash,
              type: metric.type,
              value: metric.value,
              external_api_called: false,
            },
            data: {
              external_api_called: true,
              external_api_response: externalResponse,
            },
          })
        }
      } catch (error) {
        // Log error but don't fail the request
        console.error('External API call failed:', error)
      }
    }

    res.json({
      success: true,
      data: {
        processed,
        stored,
        skipped,
      },
    })
  } catch (error: any) {
    console.error('Metrics endpoint error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to process metrics',
      },
    })
  }
})
```

---

## Deduplication Strategy

### Hash Generation

```typescript
function generateMetricHash(metric: Metric): string {
  // Normalize tags (sort keys for consistent hashing)
  const normalizedTags = Object.keys(metric.tags)
    .sort()
    .reduce((acc, key) => {
      acc[key] = metric.tags[key]
      return acc
    }, {} as Record<string, any>)

  const data = JSON.stringify({
    metric_name: metric.metric_name,
    page_path: metric.page_path || null,
    tags: normalizedTags,
    type: metric.type,
    value: metric.value,
  })

  return crypto.createHash('sha256').update(data).digest('hex')
}
```

### Time Window

- **Default**: 1 hour
- **Configurable**: Via environment variable `METRICS_DEDUP_WINDOW_HOURS`
- **Logic**: Only check for duplicates within the time window

---

## Environment Variables

```env
# Metrics configuration
METRICS_DEDUP_WINDOW_HOURS=1
METRICS_EXTERNAL_API_URL=https://cca-lite.coinbase.com/metrics
METRICS_EXTERNAL_API_ENABLED=true
```

---

## Error Handling

### If External API Fails

- **Still store metric in DB** (mark as `external_api_called: false`)
- **Return success** to frontend (metrics are non-critical)
- **Log error** for monitoring
- **Retry logic**: Optional background job to retry failed external API calls

---

## Response Format

### Success
```json
{
  "success": true,
  "data": {
    "processed": 5,
    "stored": 3,
    "skipped": 2
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Metrics array is required"
  }
}
```

---

## Database Indexes

```sql
-- Fast lookup for deduplication
CREATE INDEX idx_metrics_dedup_lookup 
ON metrics (metric_name, page_path, tags_hash, type, value, created_at DESC);

-- Time-based queries
CREATE INDEX idx_metrics_created_at 
ON metrics (created_at DESC);

-- External API status
CREATE INDEX idx_metrics_external_api 
ON metrics (external_api_called, created_at) 
WHERE external_api_called = false;
```

---

## Testing

### Test Case 1: New Metric
```bash
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

**Expected**: Metric stored in DB, external API called

### Test Case 2: Duplicate Metric (within 1 hour)
```bash
# Call same metric again within 1 hour
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

**Expected**: Metric skipped, external API NOT called

### Test Case 3: Multiple Metrics
```bash
curl -X POST http://localhost:3000/api/v1/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": [
      {"metric_name": "metric1", "value": 1, "tags": {}, "type": "count"},
      {"metric_name": "metric2", "value": 2, "tags": {}, "type": "count"},
      {"metric_name": "metric1", "value": 1, "tags": {}, "type": "count"}
    ]
  }'
```

**Expected**: 
- `processed: 3`
- `stored: 2` (metric1 and metric2)
- `skipped: 1` (duplicate metric1)

---

## Summary

1. **Check DB first** - Query for existing metrics within time window
2. **Store new metrics** - Insert into database
3. **Call external API** - Only for new metrics
4. **Deduplication** - Based on hash + time window
5. **Error handling** - Don't fail if external API fails

---

**This API ensures metrics are stored in your database first, avoiding duplicate external API calls.**

