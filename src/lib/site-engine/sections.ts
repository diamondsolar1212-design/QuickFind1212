// Section registry + composition engine.
//
// A section is a contract: it declares which facts it needs, and the composer
// drops it when the provider never supplied them. That is what keeps the
// generated site from ever showing an empty "Offers" band or an invented
// "Amenities" list — the spec's rule that missing data hides the section.

import type { CategoryProfile } from './categories'
import type { DataRequirement, PageDescriptor, PageId, SectionId } from './types'
import type { BusinessData, HourEntry, TemplateProduct } from '../templates/shared'
import { productImage } from '../products'

/** Facts read out of the listing, never inferred from the category. */
export interface FactSheet {
  products: TemplateProduct[]
  /** Products that carry a real photograph or an emoji fallback. */
  photographed: TemplateProduct[]
  /** Grouping labels from tags + subcategory + per-product `category`. */
  groups: string[]
  /** Per-product `brand` values, de-duplicated. */
  brands: string[]
  /** Per-product `amenities` values, de-duplicated. */
  amenities: string[]
  /** Products explicitly marked as packages/programmes by the provider. */
  packages: TemplateProduct[]
  /** Products marked as faculty/team members. */
  faculty: TemplateProduct[]
  /** Products carrying an offer/discount the provider actually wrote. */
  offers: TemplateProduct[]
  /** Delivery or pickup wording, only when the provider wrote it. */
  delivery: string
  images: string[]
  hours: HourEntry[]
  reviews: number
  rating: number
  hasPhone: boolean
  hasWhatsapp: boolean
  hasEmail: boolean
  hasAddress: boolean
  hasCoordinates: boolean
  hasDescription: boolean
  hasWebsite: boolean
}

function splitList(value: unknown): string[] {
  return String(value ?? '')
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Reads a product field that providers may store under a few aliases. */
function field(p: TemplateProduct, ...keys: string[]): unknown {
  const rec = p as Record<string, unknown>
  for (const key of keys) {
    const value = rec[key]
    if (value !== undefined && value !== null && String(value).trim()) return value
  }
  return undefined
}

const KIND_ALIASES: Record<string, string[]> = {
  package: ['package', 'packages', 'programme', 'plan', 'tier'],
  faculty: ['faculty', 'teacher', 'trainer', 'team', 'staff', 'doctor'],
  offer: ['offer', 'deal', 'discount', 'sale']
}

function kindOf(p: TemplateProduct): string {
  return String(field(p, 'kind', 'type', 'role') || '').toLowerCase().trim()
}

function matchesKind(p: TemplateProduct, bucket: keyof typeof KIND_ALIASES): boolean {
  const kind = kindOf(p)
  if (!kind) return false
  return KIND_ALIASES[bucket].some((alias) => kind === alias || kind.includes(alias))
}

export function readFacts(
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): FactSheet {
  const groupSet = new Set<string>()
  for (const tag of splitList(b.tags)) groupSet.add(tag)
  const sub = String(b.subcategory || '').trim()
  if (sub) groupSet.add(sub)
  for (const p of products) {
    const cat = field(p, 'category', 'group', 'section')
    if (cat) splitList(cat).forEach((g) => groupSet.add(g))
  }

  const brands = new Set<string>()
  const amenities = new Set<string>()
  for (const p of products) {
    const brand = field(p, 'brand')
    if (brand) splitList(brand).forEach((x) => brands.add(x))
    const am = field(p, 'amenities', 'features', 'includes')
    if (am) splitList(am).forEach((x) => amenities.add(x))
  }

  const deliveryText = [
    ...splitList(b.tags).filter((t) => /deliver|pickup|home service|door/i.test(t)),
    ...products
      .map((p) => String(field(p, 'delivery') || ''))
      .filter(Boolean)
  ]

  const lat = Number((b as unknown as { lat?: unknown }).lat)
  const lng = Number((b as unknown as { lng?: unknown }).lng)

  return {
    products,
    photographed: products.filter((p) => !!productImage(p)),
    groups: [...groupSet].slice(0, 12),
    brands: [...brands].slice(0, 12),
    amenities: [...amenities].slice(0, 12),
    packages: products.filter((p) => matchesKind(p, 'package')).slice(0, 8),
    faculty: products.filter((p) => matchesKind(p, 'faculty')).slice(0, 8),
    offers: products.filter((p) => matchesKind(p, 'offer') || /offer|deal|discount/i.test(String(field(p, 'details') || ''))).slice(0, 6),
    delivery: deliveryText[0] || '',
    images,
    hours,
    reviews: Number(b.reviewCount) || 0,
    rating: Number(b.rating) || 0,
    hasPhone: !!String(b.phone || '').trim(),
    hasWhatsapp: !!String(b.whatsapp || '').trim(),
    hasEmail: !!String(b.email || '').trim(),
    hasAddress: !!String(b.address || b.city || '').trim(),
    hasCoordinates: Number.isFinite(lat) && Number.isFinite(lng) && !!(lat || lng),
    hasDescription: String(b.description || '').trim().length > 24,
    hasWebsite: !!String(b.website || '').trim()
  }
}

/** What each section refuses to render without. */
const REQUIRES: Record<SectionId, DataRequirement[]> = {
  hero: [],
  strip: [],
  intro: ['description'],
  offerings: ['products'],
  categories: ['categories'],
  'daily-essentials': ['products'],
  offers: ['offers'],
  'store-info': ['address'],
  delivery: ['delivery'],
  ordering: ['phone'],
  menu: ['products'],
  specs: ['products'],
  brands: ['brands'],
  amenities: ['amenities'],
  'location-info': ['address'],
  qualifications: ['description'],
  faculty: ['faculty'],
  industries: ['categories'],
  destinations: ['products'],
  packages: ['packages'],
  process: ['description'],
  'service-areas': ['address'],
  'why-us': [],
  facilities: ['categories'],
  story: ['description'],
  'custom-order': ['phone'],
  booking: ['phone'],
  enquiry: ['phone'],
  hours: ['hours'],
  gallery: ['images'],
  reviews: ['reviews'],
  faq: [],
  contact: []
}

/** Sections that live on an inner page rather than the home page. */
const PAGE_ONLY: Partial<Record<SectionId, PageId>> = {
  menu: 'products',
  specs: 'products',
  destinations: 'products',
  packages: 'products',
  faculty: 'about',
  qualifications: 'about',
  amenities: 'products',
  industries: 'about',
  'location-info': 'about'
}

function satisfied(need: DataRequirement, f: FactSheet, b: BusinessData): boolean {
  switch (need) {
    case 'products':
      return f.products.length > 0 && b.showProducts !== false
    case 'categories':
      return f.groups.length >= 2
    case 'description':
      return f.hasDescription
    case 'images':
      return f.images.length >= (b.showGallery === false ? 99 : 2)
    case 'hours':
      return f.hours.length > 0 && b.showHours !== false
    case 'reviews':
      return f.reviews > 0 && b.showReviews !== false
    case 'phone':
      return f.hasPhone
    case 'address':
      return f.hasAddress
    case 'amenities':
      return f.amenities.length > 0
    case 'brands':
      return f.brands.length > 0
    case 'faculty':
      return f.faculty.length > 0
    case 'packages':
      return f.packages.length > 0
    case 'offers':
      return f.offers.length > 0
    case 'delivery':
      return !!f.delivery
    default:
      return false
  }
}

export interface CompositionResult {
  /** Sections allowed on the home page, in the profile's order. */
  home: SectionId[]
  /** Every section that survived the data check, across all pages. */
  included: SectionId[]
  /** Sections the profile asked for but the data could not support. */
  dropped: SectionId[]
}

/**
 * Filters a profile's candidate sections down to what the listing can prove,
 * then guarantees the four structural sections stay present.
 */
export function composeSections(profile: CategoryProfile, f: FactSheet, b: BusinessData): CompositionResult {
  const included: SectionId[] = []
  const dropped: SectionId[] = []

  for (const id of profile.sections) {
    const needs = REQUIRES[id] || []
    const ok = needs.every((need) => satisfied(need, f, b))
    if (ok) included.push(id)
    else dropped.push(id)
  }

  // A site with no offerings at all still needs a body: fall back to the
  // provider's own description, and only then to contact.
  if (!included.includes('offerings')) {
    if (f.hasDescription && !included.includes('intro')) included.push('intro')
  }
  for (const anchor of ['hero', 'contact'] as SectionId[]) {
    if (!included.includes(anchor)) included.push(anchor)
  }

  const home = included.filter((id) => !PAGE_ONLY[id])
  return { home, included, dropped }
}

const CORE_PAGES: { id: PageId; slug: string; label: string }[] = [
  { id: 'home', slug: '', label: 'Home' },
  { id: 'products', slug: 'products', label: 'Products' },
  { id: 'about', slug: 'about', label: 'About us' },
  { id: 'contact', slug: 'contact', label: 'Contact' }
]

/** Extra inner-page labels per category page id. */
const PAGE_LABELS: Partial<Record<PageId, { slug: string; label: string }>> = {
  menu: { slug: 'menu', label: 'Menu' },
  services: { slug: 'services', label: 'Services' },
  catalogue: { slug: 'catalogue', label: 'Catalogue' },
  properties: { slug: 'properties', label: 'Properties' },
  courses: { slug: 'courses', label: 'Courses' },
  destinations: { slug: 'destinations', label: 'Destinations' },
  portfolio: { slug: 'portfolio', label: 'Portfolio' },
  lookbook: { slug: 'lookbook', label: 'Lookbook' }
}

/**
 * Resolves the page list. A category's extra page only appears when it maps to
 * sections that survived composition — no empty inner pages.
 */
export function composePages(
  profile: CategoryProfile,
  composition: CompositionResult
): PageDescriptor[] {
  const has = (id: SectionId) => composition.included.includes(id)
  const offeringSections = (['offerings', 'menu', 'specs', 'packages', 'destinations', 'amenities'] as SectionId[]).filter(has)
  const aboutSections = (['intro', 'story', 'qualifications', 'faculty', 'industries', 'location-info', 'gallery', 'why-us'] as SectionId[]).filter(has)
  const contactSections = (['contact', 'hours', 'enquiry', 'booking', 'store-info', 'delivery', 'ordering', 'custom-order'] as SectionId[]).filter(has)

  const pages: PageDescriptor[] = [
    { id: 'home', slug: '', label: 'Home', sections: composition.home },
    { id: 'products', slug: 'products', label: profile.offeringsNoun.plural, sections: offeringSections },
    { id: 'about', slug: 'about', label: 'About us', sections: aboutSections },
    { id: 'contact', slug: 'contact', label: 'Contact', sections: contactSections }
  ]

  for (const extra of profile.pages) {
    const meta = PAGE_LABELS[extra]
    if (!meta) continue
    if (extra === 'portfolio' || extra === 'lookbook') {
      if (!has('gallery')) continue
    } else if (!offeringSections.length) {
      continue
    }
    if (!pages.some((p) => p.id === extra)) {
      pages.push({ id: extra, slug: meta.slug, label: meta.label, sections: offeringSections })
    }
  }

  return pages
}
