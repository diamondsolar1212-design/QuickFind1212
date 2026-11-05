import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { toBusinessData } from '@/lib/business-site'
import { buildEngineSite, isEngineSkin } from '@/lib/site-engine'
import { pageUrl, siteOrigin } from '@/lib/site-engine/seo'

export const dynamic = 'force-dynamic'

/**
 * One entry per real URL the engine publishes for each listing. A business
 * whose site has no catalogue gets no /products entry, so the sitemap can only
 * ever point at pages that answer with a 200.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin()
  const urls: MetadataRoute.Sitemap = [
    { url: `${origin}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 }
  ]

  const businesses = await db.business.findMany().catch(() => [])
  for (const full of businesses) {
    const data = toBusinessData(full)
    const lastmod = full.updatedAt

    if (!isEngineSkin(data.template)) {
      urls.push({ url: `${origin}/business/${full.id}/website`, lastModified: lastmod, changeFrequency: 'weekly', priority: 0.8 })
      continue
    }
    const bundle = buildEngineSite(full.id, data, { origin })
    for (const page of bundle.pages) {
      urls.push({
        url: pageUrl(bundle.base, page),
        lastModified: lastmod,
        changeFrequency: 'weekly',
        priority: page.id === 'home' ? 0.8 : 0.6
      })
    }
  }
  return urls
}
