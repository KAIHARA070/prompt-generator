// =====================================================
// error-handler.js — Secure error logging & reporting
// =====================================================
// SECURITY: Log safely without exposing sensitive data

/**
 * Log error securely (no sensitive data leakage)
 */
export function logSecurityEvent(event, details = {}) {
  // Create log entry with safe fields only
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: sanitizeForLogging(details),
  };

  // Console logging (for debugging)
  console.error('[SECURITY]', logEntry);

  // Optional: Store in sessionStorage for local debugging
  try {
    const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) logs.shift(); // Keep last 100
    sessionStorage.setItem('security_logs', JSON.stringify(logs));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Sanitize details before logging (remove sensitive data)
 */
function sanitizeForLogging(details) {
  if (!details || typeof details !== 'object') {
    return details;
  }

  const sanitized = {};
  const redactKeys = ['password', 'token', 'secret', 'key', 'credit_card', 'api_key'];

  Object.entries(details).forEach(([key, value]) => {
    if (redactKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 200) {
      sanitized[key] = value.substring(0, 100) + '...';
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Safe error handling for async operations
 */
export async function tryCatch(fn, context = 'operation') {
  try {
    return await fn();
  } catch (error) {
    logSecurityEvent('error', {
      context,
      message: error?.message || 'Unknown error',
      type: error?.name || 'Error',
    });

    // Return safe error message (don't expose details)
    const userMessage = 'An error occurred. Please try again.';
    if (typeof showToast === 'function') {
      showToast(userMessage, 'error');
    }
    return null;
  }
}

/**
 * Safe API error response handler
 */
export function handleApiError(error, context = 'api_call') {
  // Log safely
  logSecurityEvent('api_error', {
    context,
    status: error?.status,
    message: error?.message,
  });

  // Determine user-safe message
  let userMessage = 'An error occurred. Please try again.';
  
  if (error?.status === 401) {
    userMessage = 'Session expired. Please login again.';
  } else if (error?.status === 403) {
    userMessage = 'You do not have permission for this action.';
  } else if (error?.status === 404) {
    userMessage = 'Resource not found.';
  } else if (error?.status === 429) {
    userMessage = 'Too many requests. Please wait a moment.';
  } else if (error?.status >= 500) {
    userMessage = 'Server error. Please try again later.';
  }

  return userMessage;
}
