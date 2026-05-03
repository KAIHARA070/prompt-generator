// =====================================================
// prompt-filter.js — AI prompt injection prevention
// =====================================================
// SECURITY: Filter dangerous patterns in user prompts

/**
 * Filter dangerous prompt injection patterns
 * @param {string} text - User prompt input
 * @returns {object} {filtered: string, detected: boolean, patterns: []}
 */
export function filterPromptInjection(text) {
  if (!text || typeof text !== 'string') {
    return { filtered: '', detected: false, patterns: [] };
  }

  // Patterns indicating jailbreak/injection attempts
  const dangerousPatterns = [
    // Ignore previous instructions
    { name: 'ignore_instructions', regex: /ignore[:\s]*(?:all|previous|the)[:\s]*instruction/gi },
    { name: 'forget_instructions', regex: /forget[:\s]*(?:all|previous|the)[:\s]*instruction/gi },
    { name: 'disregard_instructions', regex: /disregard[:\s]*(?:all|previous|the)[:\s]*instruction/gi },

    // System prompt exposure attempts
    { name: 'system_prompt_exposure', regex: /(?:show|display|reveal|print)[:\s]*(?:system|hidden)[:\s]*prompt/gi },
    { name: 'system_prompt_question', regex: /what[:\s]*(?:is|are)[:\s]*your[:\s]*(?:system|initial)[:\s]*prompt/gi },

    // Role-playing escapes
    { name: 'roleplay_unrestricted', regex: /(?:you are|pretend|act|behave)[\s:]*(?:as|like)[:\s]*unrestricted/gi },
    { name: 'from_now_on', regex: /from now on[:\s]*you[:\s]*are/gi },

    // Jailbreak attempts
    { name: 'jailbreak_keyword', regex: /jailbreak|breakout|escape/gi },

    // Direct instruction injection
    { name: 'direct_injection', regex: /^(?:system|instruction|command|rule)[\s:]/mi },

    // Output format manipulation
    { name: 'output_manipulation', regex: /ignore.*output|bypass.*filter|remove.*limit/gi },
  ];

  let filtered = text;
  const detectedPatterns = [];

  // Check and filter each pattern
  dangerousPatterns.forEach(({ name, regex }) => {
    if (regex.test(filtered)) {
      detectedPatterns.push(name);
      filtered = filtered.replace(regex, '[FILTERED]');
    }
  });

  // Log if patterns detected
  if (detectedPatterns.length > 0) {
    if (typeof logSecurityEvent === 'function') {
      logSecurityEvent('prompt_injection_attempt', {
        detectedPatterns,
        originalLength: text.length,
        filteredLength: filtered.length,
      });
    }
  }

  return {
    filtered,
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
  };
}

/**
 * Validate prompt before saving
 * @param {string} text
 * @param {number} maxLength
 * @returns {object} {valid, text, warnings}
 */
export function validatePrompt(text, maxLength = 10000) {
  const warnings = [];

  if (!text) {
    return { valid: false, text: '', warnings: ['Prompt is empty'] };
  }

  if (text.length > maxLength) {
    warnings.push(`Prompt truncated to ${maxLength} characters`);
    text = text.substring(0, maxLength);
  }

  // Check for suspicious code/markup
  if (text.includes('<?php') || text.includes('<?') || text.includes('<%')) {
    warnings.push('Removed potential code injection');
    text = text.replace(/<\?[\s\S]*?\?>/g, '[REMOVED]');
  }

  if (text.match(/script|eval|exec|system|shell_exec/gi)) {
    warnings.push('Prompt contains suspicious keywords');
  }

  // Filter injection attempts
  const injection = filterPromptInjection(text);

  if (injection.detected) {
    warnings.push(`Filtered ${injection.patterns.length} injection pattern(s)`);
  }

  return {
    valid: true,
    text: injection.filtered,
    warnings: warnings.length > 0 ? warnings : null,
  };
}

/**
 * Safe prompt generation from form data
 */
export function generateSafePrompt(formData = {}) {
  try {
    // Build prompt from form data safely
    const parts = [];

    if (formData.businessName) {
      parts.push(`Business: ${String(formData.businessName).substring(0, 200)}`);
    }
    if (formData.businessType) {
      parts.push(`Type: ${String(formData.businessType).substring(0, 100)}`);
    }
    if (formData.businessDescription) {
      parts.push(`Description: ${String(formData.businessDescription).substring(0, 500)}`);
    }

    let rawPrompt = parts.join('\n');

    // Validate and filter
    const validated = validatePrompt(rawPrompt, 10000);

    if (!validated.valid) {
      return { success: false, error: 'Invalid prompt' };
    }

    // Log validation warnings if any
    if (validated.warnings && validated.warnings.length > 0) {
      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('prompt_validation', {
          warnings: validated.warnings,
          resultLength: validated.text.length,
        });
      }
    }

    return {
      success: true,
      prompt: validated.text,
      warnings: validated.warnings,
    };
  } catch (error) {
    if (typeof logSecurityEvent === 'function') {
      logSecurityEvent('prompt_generation_error', {
        error: error.message,
      });
    }
    return { success: false, error: 'Failed to generate prompt' };
  }
}
