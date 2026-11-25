import { z } from 'zod'

// Avoid Zod's Function constructor probe in the browser. Even when caught, it
// violates an enforced CSP that intentionally omits 'unsafe-eval'.
z.config({ jitless: true })

/**
 * Shared by the contact form and its route. Trimming happens before validation
 * so values containing only whitespace cannot pass the minimum lengths.
 */
export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name is required')
      .max(100, 'Keep it under 100 characters'),
    email: z
      .string()
      .trim()
      .max(200, 'Keep it under 200 characters')
      .email('A valid email is required'),
    subject: z
      .string()
      .trim()
      .max(200, 'Keep it under 200 characters')
      .optional(),
    message: z
      .string()
      .trim()
      .min(10, 'Tell me at least a sentence or two')
      .max(2000, 'Keep it under 2000 characters'),
    // Keep bot failures indistinguishable from a successful submission where
    // possible. The route silently accepts a filled honeypot.
    honeypot: z.string().max(200).optional(),
  })
  .strict()

export type ContactFormData = z.infer<typeof contactSchema>
