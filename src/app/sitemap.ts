import type { MetadataRoute } from 'next'
import { CASE_STUDIES } from '@/lib/constants'
import { LAST_CONTENT_UPDATE, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(LAST_CONTENT_UPDATE)
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    ...CASE_STUDIES.map(study => ({ url: `${SITE_URL}/work/${study.id}`, lastModified, changeFrequency: 'yearly' as const, priority: 0.8 })),
  ]
}
