import { describe, expect, it } from 'vitest'
import { contactSchema } from '../../src/lib/contact-schema'

const valid = {
  name: 'Faris',
  email: 'faris@example.com',
  subject: 'Architecture review',
  message: 'I would like to discuss a project.',
}

describe('contactSchema', () => {
  it('trims fields before validating and returning them', () => {
    const result = contactSchema.parse({
      ...valid,
      name: '  Faris  ',
      email: '  faris@example.com  ',
      subject: '  Scoped review  ',
      message: '  A sufficiently detailed message.  ',
    })

    expect(result).toMatchObject({
      name: 'Faris',
      email: 'faris@example.com',
      subject: 'Scoped review',
      message: 'A sufficiently detailed message.',
    })
  })

  it.each(['name', 'message'] as const)('rejects whitespace-only %s', field => {
    const result = contactSchema.safeParse({ ...valid, [field]: '          ' })
    expect(result.success).toBe(false)
  })

  it('accepts exact field boundaries and rejects the next character', () => {
    const atBoundary = {
      ...valid,
      name: 'n'.repeat(100),
      subject: 's'.repeat(200),
      message: 'm'.repeat(2000),
    }
    expect(contactSchema.safeParse(atBoundary).success).toBe(true)
    expect(
      contactSchema.safeParse({ ...atBoundary, name: 'n'.repeat(101) }).success
    ).toBe(false)
    expect(
      contactSchema.safeParse({ ...atBoundary, subject: 's'.repeat(201) }).success
    ).toBe(false)
    expect(
      contactSchema.safeParse({ ...atBoundary, message: 'm'.repeat(2001) }).success
    ).toBe(false)
  })

  it('retains the messages shared with the form', () => {
    const shortName = contactSchema.safeParse({ ...valid, name: ' ' })
    const badEmail = contactSchema.safeParse({ ...valid, email: 'not-an-email' })
    const longMessage = contactSchema.safeParse({ ...valid, message: 'm'.repeat(2001) })

    expect(shortName.error?.issues[0]?.message).toBe('Name is required')
    expect(badEmail.error?.issues[0]?.message).toBe('A valid email is required')
    expect(longMessage.error?.issues[0]?.message).toBe('Keep it under 2000 characters')
  })

  it('rejects unexpected fields instead of silently accepting mass assignment', () => {
    expect(contactSchema.safeParse({ ...valid, role: 'admin' }).success).toBe(false)
  })
})
