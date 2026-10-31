import type { BusinessData } from './templates/shared'

/** Maps a Prisma Business row to the normalized shape the templates expect. */
export function toBusinessData(business: any): BusinessData {
  return {
    name: business.name || 'Business',
    description: business.description || '',
    category: business.category || '',
    subcategory: business.subcategory || null,
    city: business.city || '',
    state: business.state || '',
    address: business.address || '',
    phone: business.phone || '',
    whatsapp: business.whatsapp || null,
    email: business.email || null,
    website: business.website || null,
    rating: Number(business.rating) || 0,
    reviewCount: Number(business.reviewCount) || 0,
    profileImage: business.profileImage || '',
    imageUrls: business.imageUrls || '',
    products: business.products || '',
    hours: business.hours || '',
    themeColor: business.themeColor || '#0d9488',
    template: business.template || 'retail',
    ctaLabel: business.ctaLabel || '',
    ctaUrl: business.ctaUrl || '',
    cta2Label: business.cta2Label || '',
    cta2Url: business.cta2Url || '',
    links: business.links || '',
    heroImages: business.heroImages || '',
    heroAutoScroll: business.heroAutoScroll !== false,
    siteMode: business.siteMode || 'scroll',
    siteContent: business.siteContent || '',
    fontChoice: business.fontChoice || 'sans',
    layoutStyle: business.layoutStyle || 'standard',
    showGallery: business.showGallery !== false,
    showHours: business.showHours !== false,
    showReviews: business.showReviews !== false,
    showMap: business.showMap !== false,
    showProducts: business.showProducts !== false
  }
}
