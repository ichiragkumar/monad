/**
 * Metrics Utility
 * Intercepts and stores metrics via backend API
 * Checks database first, then calls external API if needed
 */

import { apiService } from '@/services/api'

export interface Metric {
  metric_name: string
  page_path?: string | null
  value: number
  tags: Record<string, any>
  type: string
}

/**
 * Send metrics to backend (which will check DB first, then external API if needed)
 */
export async function sendMetrics(metrics: Metric[]): Promise<void> {
  if (!metrics || metrics.length === 0) {
    return
  }

  try {
    const response = await apiService.sendMetrics(metrics)
    
    if (response.success && response.data) {
      const data = response.data as any
      console.log(`Metrics sent: ${data.stored || 0} stored, ${data.skipped || 0} skipped`)
    }
  } catch (error) {
    console.error('Error sending metrics:', error)
    // Don't throw - metrics are non-critical
  }
}

/**
 * Intercept fetch calls to Coinbase metrics endpoint
 * Replace with our backend endpoint
 */
export function setupMetricsInterceptor() {
  if (typeof window === 'undefined') return

  const originalFetch = window.fetch

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.href 
        : (input as Request).url

    // Intercept Coinbase metrics endpoint
    if (url.includes('cca-lite.coinbase.com/metrics')) {
      try {
        // Parse the request body
        const body = init?.body
        let metrics: Metric[] = []

        if (body) {
          if (typeof body === 'string') {
            try {
              const data = JSON.parse(body)
              metrics = data.metrics || []
            } catch (e) {
              console.error('Error parsing metrics body:', e)
            }
          } else if (body instanceof FormData) {
            // Handle FormData if needed
            const metricsData = body.get('metrics')
            if (metricsData) {
              try {
                metrics = typeof metricsData === 'string' ? JSON.parse(metricsData) : []
              } catch (e) {
                console.error('Error parsing FormData metrics:', e)
              }
            }
          } else if (body instanceof Blob) {
            // Handle Blob
            try {
              const text = await body.text()
              const data = JSON.parse(text)
              metrics = data.metrics || []
            } catch (e) {
              console.error('Error parsing Blob metrics:', e)
            }
          }
        }

        // Send to our backend instead
        if (metrics.length > 0) {
          await sendMetrics(metrics)
        }

        // Return a mock successful response (matching Coinbase API format)
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } catch (error) {
        console.error('Error intercepting metrics:', error)
        // Fall through to original fetch if interception fails
        return originalFetch(input, init)
      }
    }

    // For all other requests, use original fetch
    return originalFetch(input, init)
  }
}

/**
 * Initialize metrics interceptor
 * Call this in main.tsx or App.tsx
 */
export function initMetrics() {
  if (typeof window === 'undefined') return
  
  try {
    setupMetricsInterceptor()
    console.log('Metrics interceptor initialized')
  } catch (error) {
    console.error('Error initializing metrics interceptor:', error)
  }
}

