/**
 * Prompt injection sanitizer.
 * Defends against hostile user input being injected into AI prompts.
 *
 * Strategy:
 * 1. Strip null bytes and control characters (except standard whitespace)
 * 2. Remove common prompt-injection patterns
 * 3. Truncate to a safe maximum length
 * 4. Wrap in delimiters when embedding in prompts (done in prompts.ts)
 */

/** Maximum length for any single user-supplied field before embedding in a prompt. */
const MAX_FIELD_LENGTH = 500;

/**
 * Patterns that indicate prompt injection attempts.
 * These are stripped (not just flagged) before embedding user input.
 */
const INJECTION_PATTERNS = [
  // Common jailbreak/override attempts
  /ignore\s+(previous|all|prior|above|everything)\s+(instructions?|prompts?|context|rules?)/gi,
  /disregard\s+(previous|all|prior|above|everything)\s+(instructions?|prompts?|context|rules?)/gi,
  /forget\s+(everything|all|prior|previous)/gi,
  /you\s+are\s+now\s+(?:a|an)\s+/gi,
  /act\s+as\s+(?:if|though|a|an)\s+/gi,
  /roleplay\s+as/gi,
  /pretend\s+(you\s+are|to\s+be)/gi,
  /system\s+prompt/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /###\s*instruction/gi,
  /\bDAN\b/g, // "Do Anything Now" jailbreak
  // HTML/script injection (defense-in-depth; should never reach HTML rendering anyway)
  /<script\b[^>]*>/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // event handlers like onclick=
];

/**
 * Sanitizes a user-supplied text field before embedding it in an AI prompt.
 *
 * @param input - Raw user input
 * @param maxLength - Maximum characters to allow (default: MAX_FIELD_LENGTH)
 * @returns Sanitized string safe for prompt embedding
 */
export function sanitizePromptField(input: string, maxLength = MAX_FIELD_LENGTH): string {
  let result = input;

  // 1. Strip null bytes and non-printable control characters (keep \t, \n, \r)
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, '[removed]');
  }

  // 3. Truncate
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  // 4. Trim whitespace
  return result.trim();
}

/**
 * Wraps a sanitized user field in XML-style delimiters for prompt embedding.
 * This prevents the model from mistaking user content for instructions.
 *
 * @param fieldName - Semantic name of the field (e.g., "style", "culturalNeeds")
 * @param value - Pre-sanitized value
 */
export function delimitField(fieldName: string, value: string): string {
  return `<user_${fieldName}>${value}</user_${fieldName}>`;
}

/**
 * Checks if a string appears to contain a prompt injection attempt.
 * Used for logging only — we sanitize regardless; this is for observability.
 */
export function detectsInjectionAttempt(input: string): boolean {
  return INJECTION_PATTERNS.some((p) => {
    const clone = new RegExp(p.source, p.flags);
    return clone.test(input);
  });
}

