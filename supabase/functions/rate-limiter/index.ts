/**
 * Supabase Edge Function — Rate Limiting
 * 
 * Deploy to Supabase using:
 * supabase functions deploy rate-limiter
 * 
 * Endpoint: /functions/v1/rate-limiter
 * 
 * This function provides server-side rate limiting for:
 * - API calls
 * - Prompt generation
 * - Prompt saves
 * - Login attempts
 * - Password resets
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 },        // 5 per 15 min
  register: { maxRequests: 5, windowMs: 15 * 60 * 1000 },      // 5 per 15 min
  promptGeneration: { maxRequests: 30, windowMs: 60 * 1000 },  // 30 per min
  promptSave: { maxRequests: 20, windowMs: 60 * 1000 },        // 20 per min
  passwordReset: { maxRequests: 3, windowMs: 30 * 60 * 1000 }, // 3 per 30 min
  api: { maxRequests: 100, windowMs: 60 * 60 * 1000 }          // 100 per hour
}

interface RateLimitRequest {
  userId?: string
  email?: string
  ip?: string
  action: 'login' | 'register' | 'promptGeneration' | 'promptSave' | 'passwordReset' | 'api'
}

interface RateLimitResponse {
  allowed: boolean
  remaining: number
  retryAfter?: number
  message: string
}

/**
 * Check rate limit for a given action
 */
async function checkRateLimit(
  req: RateLimitRequest,
  supabaseClient: any
): Promise<RateLimitResponse> {
  const limit = RATE_LIMITS[req.action]
  const key = req.userId || req.email || req.ip || 'anonymous'
  const tableKey = `${req.action}_${key}`

  try {
    // Get rate limit record from Supabase
    const { data: records, error: fetchError } = await supabaseClient
      .from('rate_limit_log')
      .select('*')
      .eq('key', tableKey)
      .gte('timestamp', new Date(Date.now() - limit.windowMs).toISOString())
      .order('timestamp', { ascending: true })

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      // On error, allow request (fail open)
      return { allowed: true, remaining: limit.maxRequests, message: 'OK' }
    }

    const requestCount = records?.length || 0

    if (requestCount >= limit.maxRequests) {
      const oldestRequest = records[0]
      const retryAfter = Math.ceil(
        (new Date(oldestRequest.timestamp).getTime() + limit.windowMs - Date.now()) / 1000
      )

      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        message: `Rate limit exceeded for ${req.action}. Retry after ${retryAfter}s.`
      }
    }

    // Log this request
    await supabaseClient.from('rate_limit_log').insert({
      key: tableKey,
      action: req.action,
      user_id: req.userId || null,
      email: req.email || null,
      ip: req.ip || null,
      timestamp: new Date().toISOString()
    })

    return {
      allowed: true,
      remaining: limit.maxRequests - requestCount - 1,
      message: 'OK'
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Fail open on error
    return { allowed: true, remaining: limit.maxRequests, message: 'OK' }
  }
}

/**
 * Clean old rate limit records
 */
async function cleanupOldRecords(supabaseClient: any) {
  const maxAge = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  await supabaseClient
    .from('rate_limit_log')
    .delete()
    .lt('timestamp', maxAge)
    .catch((err: any) => console.error('Cleanup error:', err))
}

/**
 * Main Edge Function Handler
 */
Deno.serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const body = await req.json()
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'

    const rateLimitReq: RateLimitRequest = {
      userId: body.userId,
      email: body.email,
      ip: clientIp,
      action: body.action
    }

    // Check rate limit
    const result = await checkRateLimit(rateLimitReq, supabaseClient)

    // Cleanup old records periodically
    if (Math.random() < 0.01) {
      // 1% chance to run cleanup
      await cleanupOldRecords(supabaseClient)
    }

    // Return response
    return new Response(JSON.stringify(result), {
      status: result.allowed ? 200 : 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': result.remaining.toString(),
        ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
      }
    })
  } catch (error) {
    console.error('Handler error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
