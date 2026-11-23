const DEFAULT_SITE_URL = 'https://faris-portfolio-red.vercel.app'

/** One canonical origin for metadata, sitemaps and provider headers. */
export function getSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  const candidate = value?.trim().replace(/\/$/, '')
  if (!candidate) return DEFAULT_SITE_URL

  const url = new URL(candidate)
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute site origin')
  }
  return url.origin
}

export const SITE_URL = getSiteUrl()
export const LAST_CONTENT_UPDATE = '2026-11-23'
