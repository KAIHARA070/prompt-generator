// =====================================================
// validators.js — Input validation schemas & functions
// =====================================================
// SECURITY: Centralized validation using Zod schemas

import { z } from 'https://cdn.jsdelivr.net/npm/zod@3.22.4/+esm';

// ─── VALIDATION SCHEMAS ───────────────────────────
export const ValidationSchemas = {
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(v => v.toLowerCase()),

  password: z.string()
    .min(8, 'Password must be 8+ characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, special char'
    ),

  name: z.string()
    .min(2, 'Name must be 2+ characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]{2,100}$/, 'Name contains invalid characters')
    .trim(),

  businessName: z.string()
    .min(2, 'Business name required')
    .max(100, 'Business name too long')
    .regex(/^[a-zA-Z0-9\s\-_.&(),']{2,100}$/, 'Invalid characters in business name')
    .trim(),

  businessDescription: z.string()
    .max(1000, 'Description too long')
    .optional(),

  promptTitle: z.string()
    .min(2, 'Title required')
    .max(200, 'Title too long')
    .trim(),

  generatedPrompt: z.string()
    .min(10, 'Prompt too short')
    .max(10000, 'Prompt too long'),

  phone: z.string()
    .max(20, 'Phone too long')
    .regex(/^[\d\s\-+()]*$/, 'Invalid phone format')
    .optional(),

  businessType: z.enum([
    'restaurant', 'cafe', 'bakery', 'foodtruck',
    'fashion', 'hijab', 'kids', 'salon', 'spa', 'skincare', 'gym',
    'tuition', 'onlineCourse', 'kindergarten',
    'contractor', 'accounting', 'legal', 'real_estate', 'property', 'propDev',
    'itService', 'webDesign', 'app',
    'event', 'photography', 'logistics', 'ecommerce',
    'weddingCard', 'businessCard', 'homestay', 'rumahSewa'
  ]).nullable(),

  tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional(),
};

// ─── VALIDATION FUNCTIONS ─────────────────────────

/**
 * Validate single field
 * @param {string} fieldName - Schema key
 * @param {any} value - Value to validate
 * @returns {object} {valid: bool, value?: any, error?: string}
 */
export function validateField(fieldName, value) {
  const schema = ValidationSchemas[fieldName];
  if (!schema) return { valid: true, value }; // No schema = no validation

  try {
    const validated = schema.parse(value);
    return { valid: true, value: validated };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { 
        valid: false, 
        error: err.errors[0]?.message || 'Validation failed'
      };
    }
    return { valid: false, error: String(err) };
  }
}

/**
 * Validate entire form
 * @param {object} data - Form data
 * @param {array} fieldsToCheck - Field names to validate
 * @returns {object} {valid: bool, errors: {}, values: {}}
 */
export function validateForm(data, fieldsToCheck = []) {
  const fields = fieldsToCheck.length > 0 ? fieldsToCheck : Object.keys(data);
  const errors = {};
  const values = {};
  let isValid = true;

  fields.forEach(field => {
    const result = validateField(field, data[field]);
    if (!result.valid) {
      errors[field] = result.error;
      isValid = false;
    } else {
      values[field] = result.value;
    }
  });

  return { valid: isValid, errors, values };
}

// ─── SANITIZATION FUNCTIONS ──────────────────────

/**
 * Escape HTML special characters (XSS prevention)
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize plain text input (trim, no HTML)
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeText(text, maxLength = 1000) {
  if (!text) return '';
  return String(text)
    .trim()
    .substring(0, maxLength)
    .replace(/[<>\"']/g, ''); // Remove dangerous chars
}

/**
 * Safe render to DOM (no innerHTML)
 * @param {HTMLElement} element
 * @param {string} text
 */
export function safeSetText(element, text) {
  if (!element) return;
  element.textContent = text; // Safe: no HTML parsing
}
