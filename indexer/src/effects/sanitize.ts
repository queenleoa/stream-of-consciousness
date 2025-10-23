// src/utils/sanitize.ts
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  // Remove null bytes and other control characters
  let sanitized = str
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove other control characters
    .trim();

  // Handle invalid Unicode sequences
  try {
    // Try to encode as UTF-8 - if it fails, we have invalid Unicode
    new TextEncoder().encode(sanitized);
  } catch (error) {
    // If encoding fails, remove non-UTF8 characters
    sanitized = sanitized
      .split('')
      .filter(char => {
        try {
          new TextEncoder().encode(char);
          return true;
        } catch {
          return false;
        }
      })
      .join('');
  }

  // Limit string length to prevent database issues
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}

export function sanitizeTokenURI(tokenURI: string): string {
  if (!tokenURI || typeof tokenURI !== 'string') {
    return '';
  }

  const sanitized = sanitizeString(tokenURI);
  
  // Additional tokenURI-specific sanitization
  return sanitized
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, ''); // Keep common Unicode ranges
}