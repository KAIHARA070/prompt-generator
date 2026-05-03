// =====================================================
// rate-limiting.js — Rate limiting to prevent abuse
// =====================================================

/**
 * Rate Limiter Client-side
 * Protects against: brute force, spam, DDoS
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;  // Max requests per window
    this.windowMs = windowMs;         // Time window in ms
    this.requests = new Map();       // user_id/action -> [timestamps]
  }

  /**
   * Check if request is allowed
   * @param {string} key - User ID or action identifier
   * @returns {object} { allowed: bool, remaining: int, retryAfter: int }
   */
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = validRequests[0];
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        retryAfter: retryAfter,
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      retryAfter: 0
    };
  }

  /**
   * Reset rate limit for specific key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit records
   */
  clearAll() {
    this.requests.clear();
  }
}

// =====================================================
// Instantiate rate limiters for various actions
// =====================================================

// Login/Registration: 5 attempts per 15 minutes
const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Prompt generation: 30 requests per minute
const promptGenerationLimiter = new RateLimiter(30, 60 * 1000);

// Prompt save: 20 requests per minute  
const promptSaveLimiter = new RateLimiter(20, 60 * 1000);

// API calls/affiliate: 100 requests per hour
const apiLimiter = new RateLimiter(100, 60 * 60 * 1000);

// Password reset: 3 attempts per 30 minutes
const passwordResetLimiter = new RateLimiter(3, 30 * 60 * 1000);

/**
 * Check login rate limit
 * @param {string} email - User email
 * @returns {object} Rate limit status
 */
function checkLoginLimit(email) {
  return loginLimiter.isAllowed(`login_${email}`);
}

/**
 * Record login attempt (success or fail)
 * @param {string} email
 */
function recordLoginAttempt(email) {
  // Only track if rate limit not exceeded
  const limit = checkLoginLimit(email);
  if (!limit.allowed) return limit;
  return { allowed: true };
}

/**
 * Clear login attempts after successful login
 * @param {string} email
 */
function clearLoginAttempts(email) {
  loginLimiter.reset(`login_${email}`);
}

/**
 * Check prompt generation rate limit
 * @param {string} userId
 * @returns {object} Rate limit status
 */
function checkPromptGenerationLimit(userId) {
  return promptGenerationLimiter.isAllowed(`prompt_gen_${userId}`);
}

/**
 * Check prompt save rate limit
 * @param {string} userId
 * @returns {object} Rate limit status
 */
function checkPromptSaveLimit(userId) {
  return promptSaveLimiter.isAllowed(`prompt_save_${userId}`);
}

/**
 * Check API rate limit
 * @param {string} userId
 * @returns {object} Rate limit status
 */
function checkApiLimit(userId) {
  return apiLimiter.isAllowed(`api_${userId}`);
}

/**
 * Check password reset rate limit
 * @param {string} email
 * @returns {object} Rate limit status
 */
function checkPasswordResetLimit(email) {
  return passwordResetLimiter.isAllowed(`reset_${email}`);
}

/**
 * Clear password reset attempts after successful reset
 * @param {string} email
 */
function clearPasswordResetAttempts(email) {
  passwordResetLimiter.reset(`reset_${email}`);
}

// =====================================================
// IP-based rate limiting (for shared IPs like offices)
// =====================================================
const ipLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute per IP

/**
 * Get client IP from Vercel headers
 * @returns {string} IP address
 */
function getClientIp() {
  // This will be handled in backend; placeholder for frontend
  return 'client_' + sessionStorage.getItem('session_id') || 'anonymous';
}

/**
 * Check IP-based rate limit
 * @returns {object} Rate limit status
 */
function checkIpLimit() {
  const clientId = getClientIp();
  return ipLimiter.isAllowed(`ip_${clientId}`);
}

// =====================================================
// Storage for persisting rate limit across tabs
// =====================================================

/**
 * Save rate limit state to sessionStorage
 */
function saveRateLimitState() {
  const state = {
    loginRequests: Array.from(loginLimiter.requests.entries()),
    promptGenRequests: Array.from(promptGenerationLimiter.requests.entries()),
    promptSaveRequests: Array.from(promptSaveLimiter.requests.entries()),
    timestamp: Date.now()
  };
  sessionStorage.setItem('rate_limit_state', JSON.stringify(state));
}

/**
 * Restore rate limit state from sessionStorage
 */
function restoreRateLimitState() {
  const stored = sessionStorage.getItem('rate_limit_state');
  if (!stored) return;

  try {
    const state = JSON.parse(stored);
    // Only restore if < 5 minutes old
    if (Date.now() - state.timestamp < 5 * 60 * 1000) {
      loginLimiter.requests = new Map(state.loginRequests);
      promptGenerationLimiter.requests = new Map(state.promptGenRequests);
      promptSaveLimiter.requests = new Map(state.promptSaveRequests);
    }
  } catch (e) {
    console.error('Error restoring rate limit state:', e);
  }
}

// Restore on page load
document.addEventListener('DOMContentLoaded', restoreRateLimitState);

// Save on page unload
window.addEventListener('beforeunload', saveRateLimitState);
