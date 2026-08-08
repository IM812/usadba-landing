import type { MetadataRoute } from 'next'
import { navigation, secondaryNavigation, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...[...navigation, ...secondaryNavigation].map((n) => ({
      url: `${SITE_URL}${n.href}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: n.href === '/booking' || n.href === '/prices' ? 0.9 : 0.7,
    })),
  ]
}
