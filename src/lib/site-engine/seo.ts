// SEO + structured-data layer for generated sites.
//
// Metadata is assembled from supplied facts only. Ratings appear in JSON-LD
// solely when genuine review rows exist, and an address block is emitted only
// when the provider saved one — the spec's ban on fabricated claims.
// siteOrigin() is the single source of truth for absolute URLs.

import type { CategoryProfile } from './categories'
import type { PageDescriptor } from './types'
import type { BusinessData } from '../templates/shared'
import type { FactSheet } from './sections'
import { escapeHtml, truncate } from '../templates/shared'

export interface PageMeta {
  title: string
  description: string
  canonical: string
  ogImage: string
  /** Robots directive — unpublished sites stay out of search. */
  robots: string
}

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  return configured.replace(/\/$/, '') || 'http://localhost:3000'
}

export function siteBaseUrl(businessId: string): string {
  return `${siteOrigin()}/business/${businessId}/website`
}

export function pageUrl(base: string, page: PageDescriptor): string {
  return page.slug ? `${base}/${page.slug}` : `${base}`
}

/** Home gets the broad title; inner pages get a page-shaped one. */
export function metaForPage(
  page: PageDescriptor,
  base: string,
  b: BusinessData,
  profile: CategoryProfile,
  facts: FactSheet,
  seoTitle: string,
  seoDescription: string,
  published: boolean
): PageMeta {
  const url = pageUrl(base, page)
  const place = [b.city, b.state].filter(Boolean).join(', ')
  let title = seoTitle
  let description = seoDescription
  if (page.id === 'products') {
    title = `${profile.offeringsNoun.plural} — ${b.name}`.slice(0, 60)
    description = `${profile.offeringsNoun.plural} from ${b.name}${place ? ` in ${place}` : ''}. ${facts.products.length} listed. Call ${b.phone || 'us'} for current availability.`.slice(0, 158)
  } else if (page.id === 'about') {
    title = `About us — ${b.name}`.slice(0, 60)
    description = `${truncate(String(b.description || `${b.name} is a ${profile.id.toLowerCase()} business${place ? ` in ${place}` : ''}.`), 140)}`
  } else if (page.id === 'contact') {
    title = `Contact — ${b.name}`.slice(0, 60)
    description = `Contact ${b.name}${b.phone ? ` on ${b.phone}` : ''}${b.email ? ` or ${b.email}` : ''}${place ? `. ${place}` : ''}.`.slice(0, 158)
  } else if (page.id !== 'home') {
    title = `${page.label} — ${b.name}`.slice(0, 60)
  }
  return {
    title,
    description: description.slice(0, 158),
    canonical: url,
    ogImage: facts.images[0] || String(b.profileImage || ''),
    robots: published ? 'index,follow' : 'noindex,nofollow'
  }
}

/** Head document — replaces the bare documentHead for engine-generated sites. */
export function renderHead(meta: PageMeta, fonts: string, css: string, jsonLd: string[]): string {
  const og = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}">`
  ]
  if (meta.ogImage) og.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}">`)
  return `<!DOCTYPE html><html lang="en"><head>` +
    `<meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>${escapeHtml(meta.title)}</title>` +
    `<meta name="description" content="${escapeHtml(meta.description)}">` +
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}">` +
    `<meta name="robots" content="${meta.robots}">` +
    og.join('') +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">` +
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">` +
    (meta.ogImage ? `<meta name="twitter:image" content="${escapeHtml(meta.ogImage)}">` : '') +
    `<link rel="preconnect" href="https://fonts.googleapis.com">` +
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
    `<link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet">` +
    jsonLd.map((blob) => `<script type="application/ld+json">${blob}</script>`).join('') +
    `<style>${css}</style>` +
    `</head>`
}

/**
 * Builds schema.org markup. Every optional block is guarded by the data that
 * would have to exist for it to be truthful.
 */
export function structuredData(
  b: BusinessData,
  profile: CategoryProfile,
  facts: FactSheet,
  base: string
): string[] {
  const entity: Record<string, unknown> = {
    '@type': profile.schemaType,
    '@id': `${base}#business`,
    name: b.name,
    url: base,
    description: String(b.description || '').slice(0, 300) || undefined,
    slogan: b.subcategory || undefined
  }

  if (facts.images.length) entity.image = facts.images.slice(0, 5)
  if (b.phone) entity.telephone = b.phone
  if (b.email) entity.email = b.email

  const addressParts = [b.address, b.city, b.state].filter(Boolean)
  if (addressParts.length) {
    entity.address = {
      '@type': 'PostalAddress',
      streetAddress: b.address || undefined,
      addressLocality: b.city || undefined,
      addressRegion: b.state || undefined,
      addressCountry: 'IN'
    }
  }

  const lat = Number((b as unknown as { lat?: unknown }).lat)
  const lng = Number((b as unknown as { lng?: unknown }).lng)
  if (Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng)) {
    entity.geo = { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
  }

  if (facts.hours.length) {
    entity.openingHours = facts.hours.map((h) => `${h.day} ${h.value}`).join(', ')
  }

  // Ratings only when real review rows back them up.
  if (facts.reviews > 0 && facts.rating > 0) {
    entity.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: facts.rating,
      reviewCount: facts.reviews,
      bestRating: 5
    }
  }

  if (facts.products.length) {
    entity.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: profile.offeringsNoun.plural,
      itemListElement: facts.products.slice(0, 12).map((p) => ({
        '@type': 'ListItem',
        item: {
          '@type': profile.serviceBusiness ? 'Service' : 'Product',
          name: String((p as { name?: unknown }).name || ''),
          description: String((p as { details?: unknown; description?: unknown }).details || (p as { description?: unknown }).description || '') || undefined,
          image: undefined
        }
      })).filter((row) => row.item.name)
    }
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [entity]
  }

  // renderHead wraps each entry in its own <script type="application/ld+json">.
  // "<" is escaped so a provider string can never break out of the tag.
  return [JSON.stringify(graph).replace(/</g, '\\u003c')]
}
