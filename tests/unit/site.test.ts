import { describe, expect, it } from 'vitest'
import { getSiteUrl } from '../../src/lib/site'

describe('getSiteUrl', () => {
  it('uses the production default for missing and blank values', () => {
    expect(getSiteUrl('')).toBe('https://faris-portfolio-red.vercel.app')
    expect(getSiteUrl('   ')).toBe('https://faris-portfolio-red.vercel.app')
    expect(getSiteUrl(undefined)).toBe('https://faris-portfolio-red.vercel.app')
  })

  it('normalises a valid trailing slash and removes the default port', () => {
    expect(getSiteUrl('https://example.com:443/')).toBe('https://example.com')
  })

  it('rejects malformed and non-origin values', () => {
    expect(() => getSiteUrl('not-a-url')).toThrow()
    expect(() => getSiteUrl('ftp://example.com')).toThrow(/absolute site origin/)
    expect(() => getSiteUrl('https://example.com/private')).toThrow(/absolute site origin/)
  })
})
