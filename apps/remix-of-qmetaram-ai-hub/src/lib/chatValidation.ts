import { z } from 'zod';

// Patterns to detect potentially malicious content
const SUSPICIOUS_PATTERNS = {
  // Script injection patterns
  scriptTags: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  eventHandlers: /\bon\w+\s*=/gi,
  javascriptUri: /javascript\s*:/gi,
  
  // Control characters (except newlines and tabs)
  controlChars: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
};

// Sanitize input by removing dangerous patterns
export function sanitizeChatInput(input: string): string {
  let sanitized = input;
  
  // Remove control characters (keep newlines \n and tabs \t)
  sanitized = sanitized.replace(SUSPICIOUS_PATTERNS.controlChars, '');
  
  // Normalize excessive whitespace (more than 3 consecutive newlines)
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');
  
  // Trim and limit length
  return sanitized.trim();
}

// Check for suspicious patterns (logging/alerting purposes)
export function detectSuspiciousContent(input: string): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  if (SUSPICIOUS_PATTERNS.scriptTags.test(input)) {
    reasons.push('Script tags detected');
  }
  
  if (SUSPICIOUS_PATTERNS.eventHandlers.test(input)) {
    reasons.push('Event handler attributes detected');
  }
  
  if (SUSPICIOUS_PATTERNS.javascriptUri.test(input)) {
    reasons.push('JavaScript URI detected');
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

// Zod schema for chat message validation
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message is too long (max 10,000 characters)')
    .transform(sanitizeChatInput)
    .refine(
      (val) => val.length >= 1,
      { message: 'Message cannot be empty after sanitization' }
    ),
});

// Validate and sanitize chat input
export function validateChatInput(input: string): {
  success: boolean;
  data?: string;
  error?: string;
} {
  // First detect suspicious content for logging
  const suspiciousCheck = detectSuspiciousContent(input);
  if (suspiciousCheck.isSuspicious) {
    console.warn('[Security] Suspicious content detected:', suspiciousCheck.reasons.join(', '));
  }
  
  // Validate with Zod schema
  const result = chatMessageSchema.safeParse({ content: input });
  
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Invalid input';
    return { success: false, error: errorMessage };
  }
  
  return { success: true, data: result.data.content };
}

// Export schema for edge function use
export type ChatMessage = z.infer<typeof chatMessageSchema>;
