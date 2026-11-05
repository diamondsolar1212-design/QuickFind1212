// Shared vocabulary for the rule-based website engine.

/** The five visual families. Each maps onto one storefront skin. */
export type DesignFamily =
  | 'luxury-editorial'
  | 'modern-dark'
  | 'minimal-contemporary'
  | 'organic-lifestyle'
  | 'bold-creative'

/** Sections a category profile may compose. */
export type SectionId =
  | 'hero'
  | 'strip'
  | 'intro'
  | 'offerings'
  | 'categories'
  | 'daily-essentials'
  | 'offers'
  | 'store-info'
  | 'delivery'
  | 'ordering'
  | 'menu'
  | 'specs'
  | 'brands'
  | 'amenities'
  | 'location-info'
  | 'qualifications'
  | 'faculty'
  | 'industries'
  | 'destinations'
  | 'packages'
  | 'process'
  | 'service-areas'
  | 'why-us'
  | 'facilities'
  | 'story'
  | 'custom-order'
  | 'booking'
  | 'enquiry'
  | 'hours'
  | 'gallery'
  | 'reviews'
  | 'faq'
  | 'contact'

/** Pages a site can expose. home/products/about/contact always exist. */
export type PageId =
  | 'home'
  | 'products'
  | 'about'
  | 'contact'
  | 'menu'
  | 'services'
  | 'catalogue'
  | 'properties'
  | 'courses'
  | 'destinations'
  | 'portfolio'
  | 'lookbook'

export interface PageDescriptor {
  id: PageId
  /** URL slug under /business/[id]/website. Home is the bare path. */
  slug: string
  /** Nav label. */
  label: string
  /** Sections rendered on this page, in order. */
  sections: SectionId[]
}

/** Which facts a section needs before it is allowed to render. */
export type DataRequirement =
  | 'products'
  | 'categories'
  | 'description'
  | 'images'
  | 'hours'
  | 'reviews'
  | 'phone'
  | 'address'
  | 'amenities'
  | 'brands'
  | 'faculty'
  | 'packages'
  | 'offers'
  | 'delivery'

export interface SectionDefinition {
  id: SectionId
  /** Section is dropped when any required fact is missing. */
  requires: DataRequirement[]
  /** Only meaningful on these pages. */
  pages: PageId[]
  /** Editorial weight: lower comes earlier when a profile omits order. */
  weight: number
}
