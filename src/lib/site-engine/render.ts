// The engine's renderer: one document per site, real page URLs, five families.
//
// Markup deliberately keeps the class/id contract the existing click-to-edit
// layer reads (.hero h1, .hero-tag, #products .product > h3 + .price,
// #about h2, #gallery h2, #reviews h2, #contact h2, footer p,
// .navlinks .nav-cta, .btn-primary/.btn-ghost, .announce, a[data-page]).
// That is what lets the provider's editing experience stay exactly as it is
// while everything behind it changes.

import type { CategoryProfile } from './categories'
import type { DesignFamily, PageDescriptor, PageId, SectionId } from './types'
import type { BusinessData, HourEntry, TemplateProduct } from '../templates/shared'
import {
  anchorAttrs,
  customLinks,
  escapeHtml,
  heroImage,
  heroPicks,
  initials,
  listText,
  mapHref,
  NAV_INTERCEPTOR_SCRIPT,
  paragraphs,
  primaryCta,
  productMediaHtml,
  ratingOf,
  readableOn,
  reviewCountOf,
  secondaryCta,
  siteLinkHtml,
  starsHtml,
  telHref,
  truncate,
  UI_SCRIPT,
  waHref
} from '../templates/shared'
import { productImage } from '../products'
import { defaultHeroImages } from '../templates/samples'
import { profileFor } from './categories'
import {
  aboutParagraphs,
  altFor,
  buildContext,
  faqItems,
  heroHeadline,
  heroSubtitle,
  sectionHeading,
  seoDescription,
  seoTitle,
  strengths,
  type ContentContext
} from './content-library'
import { composePages, composeSections, readFacts, type CompositionResult, type FactSheet } from './sections'
import { FAMILY_TOKENS, familyFor, type FamilyTokens } from './families'
import { metaForPage, pageUrl, renderHead, siteBaseUrl, structuredData, type PageMeta } from './seo'

export interface BuildOptions {
  /** Skin the provider chose by hand; otherwise the category's default family. */
  family?: string | null
  /** Treat the site as published so search engines may index it. */
  published?: boolean
  /** Absolute origin override for canonical URLs. */
  origin?: string
  /** Called with each build stage and the milliseconds that stage took. */
  onStage?: (stage: string, ms: number) => void
}

export interface SiteBundle {
  profile: CategoryProfile
  facts: FactSheet
  composition: CompositionResult
  pages: PageDescriptor[]
  family: FamilyTokens
  base: string
  /** Full HTML document opened on the given page. */
  document: (page?: PageId) => string
  /** Styled 404 document carrying the same design family. */
  notFound: () => string
  /** Home document — the historic /website URL. */
  html: string
}

// --- small builders ----------------------------------------------------------

function kicker(ctx: ContentContext, section: string): string {
  const { eyebrow } = sectionHeading(ctx, section)
  return `<span class="eyebrow">${escapeHtml(eyebrow)}</span>`
}

function heading(ctx: ContentContext, section: string, id: string): string {
  const { title } = sectionHeading(ctx, section)
  return `<h2 id="${id}-h">${escapeHtml(title)}</h2>`
}

function sectionShell(id: string, pageGroup: PageId | null, body: string, extraClass = ''): string {
  return `<section class="block ${extraClass}" id="${id}"${pageGroup ? ` data-page-group="${pageGroup}"` : ''}>${body}</section>`
}

// --- sections ----------------------------------------------------------------

function heroHtml(ctx: ContentContext, f: FactSheet, b: BusinessData, t: FamilyTokens): string {
  const hero = heroImage(b, f.images)
  const primary = primaryCta(b, ctx.profile.cta.primary)
  const secondary = secondaryCta(b, ctx.profile.cta.secondary, '#products')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const place = listText([ctx.city, ctx.state], ' · ')
  return `
  <section class="hero" id="top">
    <div class="hero-copy">
      <span class="eyebrow">${escapeHtml(listText([ctx.profile.id, ctx.city], ' · '))}</span>
      <h1>${escapeHtml(heroHeadline(ctx))}</h1>
      <p class="hero-tag">${escapeHtml(truncate(heroSubtitle(ctx), 180))}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)} <span aria-hidden="true">&#8599;</span></a>
        <a class="btn btn-ghost" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
      </div>
      <p class="hero-note">${escapeHtml(listText([
        reviews > 0 && rating > 0 ? `${rating.toFixed(1)} rated by ${reviews}` : '',
        f.products.length ? `${f.products.length} ${ctx.profile.offeringsNoun.plural.toLowerCase()}` : '',
        place
      ]))}</p>
    </div>
    <div class="hero-media">
      ${hero
        ? `<img src="${escapeHtml(hero)}" alt="${escapeHtml(altFor(ctx, 0, 'hero'))}">`
        : `<div class="hero-fallback"><span>${escapeHtml(initials(b.name))}</span></div>`}
    </div>
  </section>`
}

function stripHtml(ctx: ContentContext, b: BusinessData): string {
  const words = [
    ...ctx.profile.imageKeywords.slice(0, 2).map((k) => k.toUpperCase()),
    ctx.profile.id.toUpperCase(),
    (ctx.city || '').toUpperCase(),
    'QUALITY FIRST',
    'TRUSTED SERVICE',
    'FAST RESPONSE'
  ].filter(Boolean)
  const line = [...words, ...words].map((w) => `<span>${escapeHtml(w)}</span>`).join('')
  return `<div class="strip announce" aria-hidden="true"><div class="strip-track">${line}</div></div>`
}

function proseHtml(
  ctx: ContentContext,
  id: string,
  section: SectionId,
  pageGroup: PageId | null,
  opts: { lede?: boolean; image?: string; dropcap?: boolean } = {}
): string {
  const paras = aboutParagraphs(ctx)
  const image = opts.image || ''
  return sectionShell(id, pageGroup, `
    <div class="split">
      <div class="split-media">${image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(altFor(ctx, 0, 'gallery'))}" loading="lazy">`
        : `<div class="placeholder"><span>${escapeHtml(initials(ctx.b.name))}</span></div>`}</div>
      <div class="split-copy">
        ${kicker(ctx, section)}
        <h2>${escapeHtml(sectionHeading(ctx, section).title)}</h2>
        ${paras.map((p, i) => `<p class="about-p${opts.dropcap && i === 0 ? ' dropcap' : ''}">${escapeHtml(p)}</p>`).join('')}
      </div>
    </div>`)
}

function chipsHtml(
  ctx: ContentContext,
  id: string,
  section: SectionId,
  pageGroup: PageId | null,
  items: string[],
  note?: string
): string {
  if (items.length < 2) return ''
  return sectionShell(id, pageGroup, `
    ${kicker(ctx, section)}
    ${heading(ctx, section, id)}
    ${note ? `<p class="section-note">${escapeHtml(note)}</p>` : ''}
    <ul class="chips">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`)
}

function gridHtml(
  ctx: ContentContext,
  f: FactSheet,
  id: string,
  section: SectionId,
  pageGroup: PageId | null,
  items: TemplateProduct[],
  limit = 12
): string {
  const cards = items.slice(0, limit).map((p, i) => {
    const photo = productImage(p) || f.images[i % Math.max(1, f.images.length)] || ''
    const detail = String((p as { details?: unknown; description?: unknown }).details || (p as { description?: unknown }).description || '')
    return `
      <article class="product" style="transition-delay:${(i % 4) * 60}ms">
        <div class="product-media">${productMediaHtml({ ...p, image: photo }, t_line(ctx))}</div>
        <div class="product-body">
          <div class="product-line">
            <h3>${escapeHtml(String(p.name ?? ctx.profile.offeringsNoun.singular))}</h3>
            ${p.price ? `<span class="price">${escapeHtml(String(p.price))}</span>` : ''}
          </div>
          ${detail ? `<p>${escapeHtml(detail)}</p>` : ''}
        </div>
      </article>`
  }).join('')
  if (!cards) return ''
  return sectionShell(id, pageGroup, `
    <div class="section-head">
      <div>${kicker(ctx, section)}${heading(ctx, section, id)}</div>
      <a class="btn btn-ghost small" href="${escapeHtml(telHref(ctx.b.phone) || '#contact')}"${anchorAttrs(telHref(ctx.b.phone) || '#contact')}>Enquire <span aria-hidden="true">&#8599;</span></a>
    </div>
    <div class="grid">${cards}</div>`)
}

// The grid keeps one hairline colour across a family; resolved from tokens.
let LINE_COLOUR = '#ddd'
function t_line(_ctx: ContentContext): string {
  return LINE_COLOUR
}

function listHtml(
  ctx: ContentContext,
  id: string,
  section: SectionId,
  pageGroup: PageId | null,
  items: TemplateProduct[]
): string {
  const rows = items.slice(0, 20).map((p, i) => `
    <li class="menu-row">
      <div>
        <h3>${escapeHtml(String(p.name ?? ''))}</h3>
        ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
      </div>
      ${p.price ? `<span class="price">${escapeHtml(String(p.price))}</span>` : ''}
    </li>`).join('')
  if (!rows) return ''
  return sectionShell(id, pageGroup, `
    ${kicker(ctx, section)}
    ${heading(ctx, section, id)}
    <ul class="menu-list">${rows}</ul>`)
}

function stepsHtml(ctx: ContentContext, id: string, section: SectionId, pageGroup: PageId | null): string {
  const paras = aboutParagraphs(ctx).slice(0, 4)
  if (paras.length < 2) return ''
  const steps = paras.map((p, i) => `
    <li>
      <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
      <p>${escapeHtml(p)}</p>
    </li>`).join('')
  return sectionShell(id, pageGroup, `
    ${kicker(ctx, section)}
    ${heading(ctx, section, id)}
    <ol class="steps">${steps}</ol>`)
}

function strengthsHtml(ctx: ContentContext, f: FactSheet): string {
  const items = strengths(ctx)
  return sectionShell('why-us', null, `
    ${kicker(ctx, 'why-us')}
    ${heading(ctx, 'why-us', 'why-us')}
    <div class="feature-band">
      ${items.map((s) => `<div class="feature"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.note)}</p></div>`).join('')}
    </div>`)
}

function galleryHtml(ctx: ContentContext, f: FactSheet, t: FamilyTokens): string {
  const shots = Array.from(new Set([...heroPicks(ctx.b), ...f.images])).filter(Boolean).slice(0, 8)
  if (!shots.length) return ''
  return sectionShell('gallery', 'about', `
    <div class="section-head">
      <div>${kicker(ctx, 'gallery')}${heading(ctx, 'gallery', 'gallery')}</div>
      <span class="count-badge">${shots.length} photos</span>
    </div>
    <div class="shots shape-${t.galleryShape}">
      ${shots.map((src, i) => `
        <figure class="shot">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(altFor(ctx, i, 'gallery'))}" loading="lazy">
          <figcaption><span>${String(i + 1).padStart(2, '0')}</span>${escapeHtml(ctx.city || ctx.profile.id)}</figcaption>
        </figure>`).join('')}
    </div>`)
}

function reviewsHtml(ctx: ContentContext): string {
  const rating = ratingOf(ctx.b)
  const reviews = reviewCountOf(ctx.b)
  if (reviews <= 0) return ''
  const city = ctx.city
  return sectionShell('reviews', 'home', `
    <div class="rating-row">
      <div>${kicker(ctx, 'reviews')}${heading(ctx, 'reviews', 'reviews')}</div>
      <div class="rating-score">
        <strong>${rating.toFixed(1)}<small>/5</small></strong>
        <span class="stars">${starsHtml(rating)}</span>
        <span class="rating-note">${reviews} review${reviews === 1 ? '' : 's'}</span>
      </div>
    </div>
    <div class="quotes">
      <blockquote class="quote"><p>&ldquo;Quality matched what they promised, and the service was quick and courteous.&rdquo;</p><span>Verified customer${city ? ` · ${escapeHtml(city)}` : ''}</span></blockquote>
      <blockquote class="quote"><p>&ldquo;Well priced, clearly described and delivered on time. Rare to find this dependable.&rdquo;</p><span>Repeat buyer${city ? ` · ${escapeHtml(city)}` : ''}</span></blockquote>
    </div>`, 'review-wrap')
}

function faqHtml(ctx: ContentContext): string {
  const items = faqItems(ctx)
  if (items.length < 2) return ''
  return sectionShell('faq', null, `
    ${kicker(ctx, 'faq')}
    ${heading(ctx, 'faq', 'faq')}
    <div class="faq">
      ${items.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')}
    </div>`)
}

function hoursHtml(ctx: ContentContext, f: FactSheet, pageGroup: PageId | null): string {
  if (!f.hours.length) return ''
  return sectionShell('hours', pageGroup, `
    <div class="info-card">
      ${kicker(ctx, 'hours')}
      ${heading(ctx, 'hours', 'hours')}
      <ul class="hours">${f.hours.map((h: HourEntry) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>
    </div>`)
}

function ctaBandHtml(ctx: ContentContext, f: FactSheet, id: string, section: SectionId, pageGroup: PageId | null): string {
  const b = ctx.b
  const actions = [
    b.phone ? `<a class="btn btn-primary" href="${escapeHtml(telHref(b.phone))}"${anchorAttrs(telHref(b.phone))}>Call ${escapeHtml(b.phone)}</a>` : '',
    b.whatsapp ? `<a class="btn btn-ghost" href="${escapeHtml(waHref(b.whatsapp))}"${anchorAttrs(waHref(b.whatsapp))}>WhatsApp us</a>` : '',
    b.email ? `<a class="btn btn-ghost" href="mailto:${escapeHtml(b.email)}">Email</a>` : ''
  ].filter(Boolean).join('')
  if (!actions) return ''
  const copy = sectionHeading(ctx, section)
  return sectionShell(id, pageGroup, `
    <div class="cta-band">
      <div>
        <span class="eyebrow">${escapeHtml(copy.eyebrow)}</span>
        <h2>${escapeHtml(copy.title)}</h2>
        <p>${escapeHtml(ctaNote(ctx, section, f))}</p>
      </div>
      <div class="cta-actions">${actions}</div>
    </div>`)
}

function ctaNote(ctx: ContentContext, section: SectionId, f: FactSheet): string {
  if (section === 'delivery') return f.delivery || 'Ask us how delivery works in your area.'
  if (section === 'ordering') return 'Call or message us with what you need and we will confirm availability and price.'
  if (section === 'booking') return 'Tell us a day that suits and we will confirm the slot.'
  if (section === 'custom-order') return 'Share the piece you have in mind — size, finish and quantity — and we will quote it.'
  if (section === 'enquiry') return 'Send the details and we will come back with a quote.'
  return 'Get in touch and we will answer properly.'
}

function storeInfoHtml(ctx: ContentContext, f: FactSheet, pageGroup: PageId | null): string {
  const b = ctx.b
  const rows = [
    b.address ? { label: 'Address', value: [b.address, ctx.city, ctx.state].filter(Boolean).join(', ') } : null,
    b.phone ? { label: 'Phone', value: b.phone } : null,
    b.whatsapp ? { label: 'WhatsApp', value: b.whatsapp } : null,
    b.email ? { label: 'Email', value: b.email } : null,
    b.website ? { label: 'Website', value: String(b.website) } : null
  ].filter(Boolean) as { label: string; value: string }[]
  if (!rows.length) return ''
  return sectionShell('store-info', pageGroup, `
    <div class="info-card">
      ${kicker(ctx, 'store-info')}
      ${heading(ctx, 'store-info', 'store-info')}
      <dl class="detail-list">${rows.map((r) => `<div><dt>${escapeHtml(r.label)}</dt><dd>${escapeHtml(r.value)}</dd></div>`).join('')}</dl>
    </div>`)
}

function contactHtml(ctx: ContentContext, f: FactSheet, b: BusinessData, t: FamilyTokens): string {
  const place = listText([b.address, ctx.city, ctx.state], ', ')
  const links = customLinks(b)
  return sectionShell('contact', 'contact', `
    <div class="contact-grid">
      <div>
        ${kicker(ctx, 'contact')}
        <h2>${escapeHtml(sectionHeading(ctx, 'contact').title)}</h2>
        ${place ? `<p class="contact-address">${escapeHtml(place)}</p>` : ''}
        <dl class="detail-list">
          ${b.phone ? `<div><dt>Phone</dt><dd><a href="${escapeHtml(telHref(b.phone))}"${anchorAttrs(telHref(b.phone))}>${escapeHtml(b.phone)}</a></dd></div>` : ''}
          ${b.whatsapp ? `<div><dt>WhatsApp</dt><dd><a href="${escapeHtml(waHref(b.whatsapp))}"${anchorAttrs(waHref(b.whatsapp))}>${escapeHtml(b.whatsapp)}</a></dd></div>` : ''}
          ${b.email ? `<div><dt>Email</dt><dd><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></dd></div>` : ''}
          ${links.slice(0, 3).map((l) => `<div><dt>${escapeHtml(l.label)}</dt><dd>${siteLinkHtml(l)}</dd></div>`).join('')}
        </dl>
      </div>
      <div class="map-card">
        ${ctx.city ? `<span class="badge">${escapeHtml(ctx.city)}</span>` : ''}
        ${f.hours.length ? `<h3>Opening hours</h3><ul class="hours">${f.hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>` : '<h3>Visit us</h3>'}
        <a class="btn btn-primary small" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Open in Maps <span aria-hidden="true">&#8599;</span></a>
      </div>
    </div>`, 'contact-block')
}

// --- composition of one section ---------------------------------------------

function renderSection(
  section: SectionId,
  ctx: ContentContext,
  f: FactSheet,
  b: BusinessData,
  t: FamilyTokens
): string {
  switch (section) {
    case 'hero':
      return heroHtml(ctx, f, b, t)
    case 'strip':
      return stripHtml(ctx, b)
    case 'intro':
      return proseHtml(ctx, 'intro', 'intro', 'about', { image: f.images[1] || '', dropcap: true })
    case 'story':
      return proseHtml(ctx, 'about', 'story', 'about', { image: f.images[1] || f.images[0] || '' })
    case 'qualifications':
      return proseHtml(ctx, 'qualifications', 'qualifications', 'about', { image: f.images[2] || '' })
    case 'offerings':
      return gridHtml(ctx, f, 'products', 'offerings', 'products', f.products)
    case 'daily-essentials':
      return gridHtml(ctx, f, 'daily-essentials', 'daily-essentials', 'products', f.products.slice(4))
    case 'offers':
      return gridHtml(ctx, f, 'offers', 'offers', 'products', f.offers)
    case 'menu':
      return listHtml(ctx, 'menu', 'menu', 'products', f.products)
    case 'specs':
      return listHtml(ctx, 'specs', 'specs', 'products', f.products)
    case 'packages':
      return gridHtml(ctx, f, 'packages', 'packages', 'products', f.packages)
    case 'destinations':
      return gridHtml(ctx, f, 'destinations', 'destinations', 'products', f.products)
    case 'faculty':
      return gridHtml(ctx, f, 'faculty', 'faculty', 'about', f.faculty)
    case 'categories':
      return chipsHtml(ctx, 'categories', 'categories', 'products', f.groups)
    case 'industries':
      return chipsHtml(ctx, 'industries', 'industries', 'about', f.groups)
    case 'brands':
      return chipsHtml(ctx, 'brands', 'brands', 'products', f.brands)
    case 'amenities':
      return chipsHtml(ctx, 'amenities', 'amenities', 'products', f.amenities)
    case 'facilities':
      return chipsHtml(ctx, 'facilities', 'facilities', 'about', f.groups)
    case 'service-areas':
      return chipsHtml(ctx, 'service-areas', 'service-areas', null, [ctx.city, ctx.state].filter(Boolean).concat(f.groups.slice(0, 4)), 'Based locally and travelling to the surrounding area.')
    case 'why-us':
      return strengthsHtml(ctx, f)
    case 'process':
      return stepsHtml(ctx, 'process', 'process', 'about')
    case 'location-info':
      return proseHtml(ctx, 'location-info', 'location-info', 'about', { image: f.images[3] || '' })
    case 'gallery':
      return galleryHtml(ctx, f, t)
    case 'reviews':
      return reviewsHtml(ctx)
    case 'faq':
      return faqHtml(ctx)
    case 'hours':
      return hoursHtml(ctx, f, 'contact')
    case 'store-info':
      return storeInfoHtml(ctx, f, 'contact')
    case 'delivery':
    case 'ordering':
    case 'booking':
    case 'enquiry':
    case 'custom-order':
      return ctaBandHtml(ctx, f, section, section, 'contact')
    case 'contact':
      return contactHtml(ctx, f, b, t)
    default:
      return ''
  }
}

// --- stylesheet --------------------------------------------------------------

function stylesheet(t: FamilyTokens): string {
  const onAccent = readableOn(t.accent)
  return `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:${t.bg};--surface:${t.surface};--raised:${t.raised};--ink:${t.ink};--muted:${t.muted};--accent:${t.accent};--on-accent:${onAccent};--line:${t.line};--display:${t.headingFont};--body:${t.bodyFont};--radius:${t.radius};--card:${t.cardRadius};--shadow:${t.shadow};--tracking:${t.tracking}}
  html{scroll-behavior:smooth}
  body{font-family:var(--body);background:var(--bg);color:var(--ink);line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%;height:auto}
  ::selection{background:var(--accent);color:var(--on-accent)}
  h1,h2,h3{font-family:var(--display);font-weight:600;line-height:1.08;letter-spacing:-.015em}
  .eyebrow{display:inline-block;font-size:11px;letter-spacing:var(--tracking);text-transform:uppercase;color:var(--accent);margin-bottom:14px;font-weight:500}
  .topline{background:var(--ink);color:var(--bg);font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-align:center;padding:9px 16px}
  .nav{position:sticky;top:0;z-index:90;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
  .nav-inner{max-width:1180px;margin:0 auto;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:22px}
  .brand{display:flex;align-items:center;gap:11px;min-width:0}
  .brand-mark{width:34px;height:34px;flex:none;border-radius:50%;border:1px solid var(--accent);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:.8rem}
  .brand-text{min-width:0}
  .brand-name{font-family:var(--display);font-size:1.05rem;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .brand-sub{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
  .navlinks{display:flex;align-items:center;gap:26px}
  .navlinks a{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);position:relative;padding:4px 0;transition:color .2s}
  .navlinks a::after{content:'';position:absolute;left:0;right:100%;bottom:-2px;height:1px;background:var(--accent);transition:right .25s}
  .navlinks a:hover,.navlinks a.site-nav-current{color:var(--ink)}
  .navlinks a:hover::after,.navlinks a.site-nav-current::after{right:0}
  .nav-cta{border:1px solid var(--accent);border-radius:var(--radius);padding:9px 17px!important;color:var(--accent)!important}
  .nav-cta::after{display:none}
  .nav-cta:hover{background:var(--accent);color:var(--on-accent)!important}
  .burger{display:none;background:none;border:0;cursor:pointer;flex-direction:column;gap:5px;padding:8px}
  .burger span{width:22px;height:1.5px;background:var(--ink);display:block}
  main{display:block}
  .hero{max-width:1180px;margin:0 auto;padding:76px 28px 66px;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;scroll-margin-top:84px}
  .hero h1{font-size:clamp(2.6rem,6.4vw,4.9rem);margin-bottom:18px}
  .hero-tag{font-size:1.02rem;color:var(--muted);max-width:52ch;margin-bottom:28px}
  .hero-actions{display:flex;flex-wrap:wrap;gap:12px}
  .hero-note{margin-top:26px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .hero-media{position:relative;border-radius:var(--card);overflow:hidden;box-shadow:var(--shadow);aspect-ratio:4/5;background:var(--raised)}
  .hero-media img{width:100%;height:100%;object-fit:cover}
  .hero-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(140deg,var(--raised),var(--line))}
  .hero-fallback span{font-family:var(--display);font-size:5rem;color:var(--muted);opacity:.4}
  .strip{overflow:hidden;white-space:nowrap;border-block:1px solid var(--line);background:var(--raised)}
  .strip-track{display:inline-flex;animation:slide 32s linear infinite;padding:13px 0}
  .strip-track span{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);padding:0 22px;position:relative}
  .strip-track span::after{content:'\\2726';color:var(--accent);margin-left:22px;font-size:8px;vertical-align:middle}
  @keyframes slide{to{transform:translateX(-50%)}}
  .block{max-width:1180px;margin:0 auto;padding:74px 28px;scroll-margin-top:84px}
  .section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:26px;flex-wrap:wrap;margin-bottom:34px}
  .block>h2,.section-head h2{font-size:clamp(1.9rem,4vw,3rem);margin-bottom:8px}
  .section-note{color:var(--muted);max-width:60ch;margin-bottom:22px}
  .count-badge{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:7px 14px;white-space:nowrap}
  .btn{display:inline-flex;align-items:center;gap:9px;padding:14px 26px;border-radius:var(--radius);font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;transition:transform .22s,background .22s,color .22s,border-color .22s;border:1px solid transparent;cursor:pointer}
  .btn:hover{transform:translateY(-2px)}
  .btn.small{padding:11px 18px;font-size:10px}
  .btn-primary{background:${t.buttonStyle === 'outline' ? 'transparent' : 'var(--accent)'};color:var(--on-accent);border-color:var(--accent)}
  .btn-primary:hover{background:var(--ink);border-color:var(--ink);color:var(--bg)}
  .btn-ghost{border-color:var(--line);color:var(--ink)}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:22px}
  .product{background:var(--surface);border:1px solid var(--line);border-radius:var(--card);overflow:hidden;transition:transform .35s cubic-bezier(.2,.7,.2,1),box-shadow .35s}
  .product:hover{transform:translateY(-6px);box-shadow:var(--shadow)}
  .product-media{aspect-ratio:1/1;overflow:hidden;background:var(--raised)}
  .product-media img{width:100%;height:100%;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
  .product:hover .product-media img{transform:scale(1.05)}
  .product-body{padding:17px 19px 21px}
  .product-line{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
  .product h3{font-size:1.06rem;line-height:1.3}
  .product .price{font-size:.86rem;color:var(--accent);white-space:nowrap;font-weight:500}
  .product-body p{font-size:.83rem;color:var(--muted);margin-top:7px;line-height:1.6}
  .menu-list{list-style:none;display:grid;gap:1px;background:var(--line);border-block:1px solid var(--line)}
  .menu-row{background:var(--surface);padding:18px 4px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
  .menu-row h3{font-size:1.05rem}
  .menu-row p{font-size:.84rem;color:var(--muted);margin-top:4px}
  .menu-row .price{color:var(--accent);font-weight:500;white-space:nowrap}
  .chips{list-style:none;display:flex;flex-wrap:wrap;gap:10px}
  .chips li{border:1px solid var(--line);border-radius:999px;padding:9px 17px;font-size:12px;letter-spacing:.05em;background:var(--surface);transition:border-color .2s,color .2s}
  .chips li:hover{border-color:var(--accent);color:var(--accent)}
  .split{display:grid;grid-template-columns:.85fr 1.15fr;gap:54px;align-items:center}
  .split-media{border-radius:var(--card);overflow:hidden;background:var(--raised);aspect-ratio:4/5}
  .split-media img{width:100%;height:100%;object-fit:cover}
  .placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(140deg,var(--raised),var(--line))}
  .placeholder span{font-family:var(--display);font-size:3.4rem;color:var(--muted);opacity:.35}
  .split-copy h2{font-size:clamp(1.8rem,3.6vw,2.8rem);margin-bottom:16px}
  .split-copy p{color:var(--muted);margin-bottom:14px;max-width:58ch}
  .dropcap::first-letter{font-family:var(--display);font-size:3.4rem;line-height:.85;float:left;padding:6px 10px 0 0;color:var(--accent)}
  .feature-band{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--card);overflow:hidden}
  .feature{background:var(--surface);padding:26px 24px}
  .feature h3{font-size:1.08rem;margin-bottom:8px}
  .feature p{font-size:.86rem;color:var(--muted)}
  .steps{list-style:none;display:grid;gap:18px;counter-reset:s}
  .steps li{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;border-top:1px solid var(--line);padding-top:18px}
  .step-num{font-family:var(--display);font-size:1.5rem;color:var(--accent);line-height:1}
  .shots{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .shot{position:relative;overflow:hidden;border-radius:var(--card);background:var(--raised);aspect-ratio:1/1}
  .shot img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1)}
  .shot:hover img{transform:scale(1.06)}
  .shot figcaption{position:absolute;inset:auto 0 0 0;padding:14px 16px;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.66));opacity:0;transform:translateY(6px);transition:.3s}
  .shot:hover figcaption{opacity:1;transform:none}
  .shape-mosaic .shot:nth-child(1){grid-column:span 2;grid-row:span 2;aspect-ratio:auto}
  .shape-strip{grid-template-columns:repeat(6,1fr)}
  .shape-strip .shot{aspect-ratio:3/4}
  .rating-row{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap;margin-bottom:32px}
  .rating-score{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .rating-score strong{font-family:var(--display);font-size:3.2rem;line-height:1}
  .rating-score strong small{font-size:.3em;color:var(--muted)}
  .stars{color:var(--accent);letter-spacing:.1em;font-size:.95rem}
  .rating-note{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
  .quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .quote{background:var(--surface);border:1px solid var(--line);border-radius:var(--card);padding:28px}
  .quote p{font-family:var(--display);font-size:1.06rem;line-height:1.5}
  .quote span{display:block;margin-top:16px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
  .faq{display:grid;gap:1px;background:var(--line);border-block:1px solid var(--line)}
  .faq details{background:var(--surface);padding:0}
  .faq summary{cursor:pointer;padding:18px 4px;font-weight:500;list-style:none;display:flex;justify-content:space-between;gap:16px;align-items:center}
  .faq summary::-webkit-details-marker{display:none}
  .faq summary::after{content:'+';color:var(--accent);font-size:1.2rem;line-height:1}
  .faq details[open] summary::after{content:'\\2212'}
  .faq p{padding:0 4px 18px;color:var(--muted);font-size:.9rem;max-width:70ch}
  .info-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--card);padding:32px}
  .info-card h2{font-size:clamp(1.5rem,3vw,2.2rem);margin-bottom:16px}
  .hours{list-style:none;display:grid;gap:2px;font-size:.88rem}
  .hours li{display:flex;justify-content:space-between;gap:18px;padding:5px 0;border-bottom:1px dashed var(--line)}
  .hours li:last-child{border-bottom:0}
  .detail-list{display:grid;gap:14px;margin-top:20px}
  .detail-list dt{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
  .detail-list dd{font-size:.98rem;word-break:break-word}
  .detail-list a:hover{color:var(--accent)}
  .cta-band{display:flex;align-items:center;justify-content:space-between;gap:34px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--line);border-radius:var(--card);padding:36px}
  .cta-band h2{font-size:clamp(1.5rem,3vw,2.2rem);margin-bottom:8px}
  .cta-band p{color:var(--muted);max-width:48ch}
  .cta-actions{display:flex;flex-wrap:wrap;gap:12px}
  .contact-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:start}
  .contact-grid h2{font-size:clamp(1.9rem,4vw,3rem);margin-bottom:14px}
  .contact-address{color:var(--muted);max-width:34ch}
  .map-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--card);padding:30px;display:grid;gap:14px}
  .map-card h3{font-size:1.2rem}
  .badge{justify-self:start;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:6px 13px}
  .map-card .btn{justify-self:start;margin-top:6px}
  .foot{background:var(--ink);color:color-mix(in srgb,var(--bg) 72%,transparent);margin-top:20px}
  .foot-inner{max-width:1180px;margin:0 auto;padding:52px 28px 26px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px}
  .foot h3{font-family:var(--display);color:var(--bg);font-size:1.2rem;margin-bottom:10px}
  .foot p{font-size:.86rem;max-width:44ch}
  .foot-col h4{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:color-mix(in srgb,var(--bg) 55%,transparent);margin-bottom:14px;font-weight:500}
  .foot-col ul{list-style:none;display:grid;gap:9px;font-size:.88rem}
  .foot-col a:hover{color:var(--bg)}
  .copyright{max-width:1180px;margin:0 auto;padding:18px 28px 30px;border-top:1px solid color-mix(in srgb,var(--bg) 18%,transparent);display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;font-size:11px;letter-spacing:.06em}
  .site-page-hidden{display:none!important}
  .reveal{opacity:0;transform:translateY(22px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  @media(max-width:980px){
    .hero{grid-template-columns:1fr;padding:52px 22px 44px;gap:34px}
    .hero-media{aspect-ratio:16/11}
    .split{grid-template-columns:1fr;gap:30px}
    .contact-grid{grid-template-columns:1fr;gap:32px}
    .shots,.shape-strip{grid-template-columns:repeat(2,1fr)}
    .shape-mosaic .shot:nth-child(1){grid-column:span 2;grid-row:span 1;aspect-ratio:16/10}
    .foot-inner{grid-template-columns:1fr 1fr}
  }
  @media(max-width:820px){
    .burger{display:flex}
    .navlinks{position:fixed;top:70px;left:14px;right:14px;flex-direction:column;align-items:stretch;gap:2px;background:var(--surface);border:1px solid var(--line);border-radius:var(--card);padding:14px 18px;box-shadow:var(--shadow);opacity:0;transform:translateY(-8px);pointer-events:none;transition:.25s}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{padding:11px 0;color:var(--muted)}
    .nav-cta{margin-top:8px;text-align:center;justify-content:center}
    .block{padding:54px 22px}
  }
  @media(max-width:560px){
    .grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px}
    .cta-band{padding:26px}
    .foot-inner{grid-template-columns:1fr}
    .nav-inner{padding:14px 18px}
  }
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}.reveal{opacity:1;transform:none}}
  `
}

// --- assembly ----------------------------------------------------------------

function navHtml(pages: PageDescriptor[], base: string, b: BusinessData, t: FamilyTokens, ctx: ContentContext): string {
  const primary = primaryCta(b, ctx.profile.cta.primary)
  const links = pages
    .filter((p) => ['home', 'products', 'about', 'contact'].includes(p.id) || p.id === pages[1]?.id)
    .slice(0, 5)
  return `
  <header class="nav">
    <div class="nav-inner">
      <a class="brand" href="${escapeHtml(base)}" data-page="home">
        <span class="brand-mark">${escapeHtml(initials(b.name))}</span>
        <span class="brand-text">
          <span class="brand-name">${escapeHtml(b.name || 'Your Business')}</span>
          <span class="brand-sub">${escapeHtml(String(b.subcategory || ctx.profile.id))}</span>
        </span>
      </a>
      <nav class="navlinks">
        ${links.map((p) => `<a href="${escapeHtml(pageUrl(base, p))}" data-page="${p.id}">${escapeHtml(p.id === 'products' ? ctx.profile.offeringsNoun.plural : p.label)}</a>`).join('')}
        ${customLinks(b).slice(0, 1).map((l) => siteLinkHtml(l)).join('')}
        <a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>`
}

function footerHtml(ctx: ContentContext, pages: PageDescriptor[], base: string, b: BusinessData, f: FactSheet): string {
  const place = listText([ctx.city, ctx.state], ', ')
  const reviews = reviewCountOf(b)
  return `
  <footer class="foot">
    <div class="foot-inner">
      <div>
        <h3>${escapeHtml(b.name || 'Your Business')}</h3>
        <p class="foot-note">${escapeHtml(truncate(String(b.description || `${ctx.profile.id}${place ? ` in ${place}` : ''}.`), 150))}</p>
      </div>
      <div class="foot-col">
        <h4>Explore</h4>
        <ul>${pages.map((p) => `<li><a href="${escapeHtml(pageUrl(base, p))}" data-page="${p.id}">${escapeHtml(p.id === 'products' ? ctx.profile.offeringsNoun.plural : p.label)}</a></li>`).join('')}</ul>
      </div>
      <div class="foot-col">
        <h4>Visit / Connect</h4>
        <ul>
          ${b.phone ? `<li><a href="${escapeHtml(telHref(b.phone))}"${anchorAttrs(telHref(b.phone))}>${escapeHtml(b.phone)}</a></li>` : ''}
          ${b.whatsapp ? `<li><a href="${escapeHtml(waHref(b.whatsapp))}"${anchorAttrs(waHref(b.whatsapp))}>WhatsApp</a></li>` : ''}
          ${b.email ? `<li><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></li>` : ''}
          ${place ? `<li><a href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">${escapeHtml(place)}</a></li>` : ''}
        </ul>
      </div>
    </div>
    <div class="copyright">
      <p>&copy; <span data-year>${new Date().getFullYear()}</span> ${escapeHtml(b.name || 'Business')}. All rights reserved.</p>
      <span>${escapeHtml(listText([place, reviews > 0 ? `${reviews} customer reviews` : '']))}</span>
    </div>
  </footer>`
}

/**
 * Builds the site once, then hands back a document(page) factory so each real
 * URL can serve the same body with its own title, canonical and start page.
 */
export function buildSite(businessId: string, b: BusinessData, opts: BuildOptions = {}): SiteBundle {
  // Each stage reports the time its own work actually took, so a caller can
  // show real progress instead of a countdown.
  let mark = Date.now()
  const stage = (name: string) => {
    if (!opts.onStage) return
    const now = Date.now()
    opts.onStage(name, now - mark)
    mark = now
  }

  const profile = profileFor(b.category)
  const products = parseProducts(b)
  const hours = parseHours(b.hours)
  stage('analysing')

  // The provider's own pick wins over the category default; 'auto' and legacy
  // skin names are not families, so they fall through to the profile.
  const picked = b.template as DesignFamily
  const familyId: DesignFamily = (opts.family && FAMILY_TOKENS[opts.family as DesignFamily])
    ? (opts.family as DesignFamily)
    : FAMILY_TOKENS[picked]
      ? picked
      : profile.family
  const tokens = familyFor(familyId, profile.family)
  const css = stylesheet(tokens)
  // Shared helpers read the theme colour from the record; keep the family's
  // accent consistent with whatever the provider picked.
  LINE_COLOUR = tokens.line
  stage('design')

  const ctx = buildContext(b, profile, businessId)
  stage('content')

  const collected = Array.from(new Set([...heroPicks(b), ...splitImages(b)])).filter(Boolean)
  // A listing with no photos still needs a hero and a gallery: fall back to
  // the curated local library for this category rather than shipping a hole.
  const images = collected.length ? collected : defaultHeroImages(b.category)
  const facts = readFacts({ ...b, tags: b.tags || '' }, images, products, hours)
  stage('images')

  const composition = composeSections(profile, facts, b)
  const pages = composePages(profile, composition)
  // Skin-picker previews build from a seed row with no id, so give the
  // canonical URL a stable placeholder instead of an empty path segment.
  const pathId = businessId || 'preview'
  const base = opts.origin
    ? `${opts.origin.replace(/\/$/, '')}/business/${pathId}/website`
    : siteBaseUrl(pathId)
  // Canonical URLs must be absolute, but navigation only works from a real
  // origin. Previews build against a placeholder host, so their links stay
  // site-relative and still resolve inside the app.
  const navBase = opts.origin ? base : `/business/${pathId}/website`

  const body = composition.home
    .map((section) => renderSection(section, ctx, facts, b, tokens))
    .filter(Boolean)
    .join('\n')
  stage('pages')

  const jsonLd = structuredData(b, profile, facts, base)
  const title = seoTitle(ctx)
  const description = seoDescription(ctx)

  const metaFor: Record<string, PageMeta> = {}
  for (const page of pages) {
    metaFor[page.id] = metaForPage(page, base, b, profile, facts, title, description, opts.published !== false)
  }
  stage('seo')

  const document = (page: PageId = 'home'): string => {
    const meta = metaFor[page] || metaFor.home
    const startAttr = page && page !== 'home' ? ` data-start-page="${escapeHtml(page)}"` : ''
    return `${renderHead(meta, tokens.fonts, css, jsonLd)}
  <body${startAttr}>
  <div class="topline announce">${escapeHtml(listText([profile.id, ctx.city, 'Quality first', 'Get in touch']))}</div>
  ${navHtml(pages, navBase, b, tokens, ctx)}
  <main>
${body}
  </main>
  ${footerHtml(ctx, pages, navBase, b, facts)}
  ${UI_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
  }

  const notFound = (): string => {
    const meta: PageMeta = {
      title: `Page not found — ${b.name || 'Business'}`.slice(0, 60),
      description: `The page you were looking for is not part of ${b.name || 'this site'}.`,
      canonical: base,
      ogImage: facts.images[0] || String(b.profileImage || ''),
      robots: 'noindex,nofollow'
    }
    const shortcuts = pages
      .filter((p) => p.id !== 'home')
      .map(
        (p) =>
          `<a class="btn btn-ghost" href="${escapeHtml(pageUrl(navBase, p))}">${escapeHtml(p.id === 'products' ? ctx.profile.offeringsNoun.plural : p.label)}</a>`
      )
      .join('')
    // The 404 is a standalone document: no page pager, so its links navigate
    // for real instead of being intercepted and redrawn as home.
    return `${renderHead(meta, tokens.fonts, css, [])}
  <body>
  ${navHtml(pages, navBase, b, tokens, ctx)}
  <main>
    <section class="block" id="not-found">
      <span class="eyebrow">404</span>
      <h2>That page is not here</h2>
      <p class="section-note">The link you followed points to something this site does not publish. Everything ${escapeHtml(b.name || 'this business')} does have is one click away.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${escapeHtml(navBase)}">Back to home</a>
        ${shortcuts}
      </div>
    </section>
  </main>
  ${footerHtml(ctx, pages, navBase, b, facts)}
  ${UI_SCRIPT}
  </body></html>`
  }

  const html = document('home')
  stage('ready')

  return {
    profile,
    facts,
    composition,
    pages,
    family: tokens,
    base,
    document,
    notFound,
    html
  }
}

function splitImages(b: BusinessData): string[] {
  const out: string[] = []
  if (b.profileImage) out.push(String(b.profileImage))
  for (const value of String(b.imageUrls || '').split(',')) {
    const url = value.trim()
    if (url) out.push(url)
  }
  return Array.from(new Set(out))
}

function parseProducts(b: BusinessData): TemplateProduct[] {
  try {
    const parsed = JSON.parse(String(b.products || '[]'))
    return Array.isArray(parsed) ? (parsed as TemplateProduct[]) : []
  } catch {
    return []
  }
}

function parseHours(raw: unknown): HourEntry[] {
  try {
    const parsed = JSON.parse(String(raw || '[]'))
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row: { day?: unknown; value?: unknown }) => ({ day: String(row?.day || ''), value: String(row?.value || '') }))
      .filter((row) => row.day && row.value)
  } catch {
    return []
  }
}
