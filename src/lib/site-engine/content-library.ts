// Rule-based content library. Deterministic, no AI, no invented facts.
//
// Every generator reads only what the provider actually supplied (name,
// category, subcategory, city/state, description, catalogue, hours, genuine
// review rows). When a fact is missing the pattern falls back to a neutral
// line rather than making one up — the spec's hard rule against fabricated
// experience, awards, prices, guarantees and medical claims.

import type { CategoryProfile } from './categories'
import type { BusinessData } from '../templates/shared'

/** Small stable string hash so the same listing always picks the same variant. */
export function seedFrom(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function pick<T>(seed: number, list: T[]): T {
  return list[seed % list.length]
}

export interface ContentContext {
  b: BusinessData
  profile: CategoryProfile
  seed: number
  /** e.g. 'Jaipur' or '' — never guessed. */
  city: string
  state: string
  /** Lowercased category without the ampersand noise, for sentence flow. */
  trade: string
  /** Singular/plural nouns for this trade. */
  noun: { singular: string; plural: string }
  /** Product/service names the provider actually listed. */
  itemNames: string[]
  /** Full address from supplied fields, or '' when nothing was given. */
  addressLine(): string
}

export function buildContext(b: BusinessData, profile: CategoryProfile, idSeed: string): ContentContext {
  const city = String(b.city || '').trim()
  const state = String(b.state || '').trim()
  const raw = String(b.category || profile.id || 'business')
  const trade = raw.toLowerCase().replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ').trim()
  let itemNames: string[] = []
  try {
    const parsed = JSON.parse(String(b.products || '[]'))
    if (Array.isArray(parsed)) {
      itemNames = parsed
        .map((p: { name?: unknown }) => String(p?.name || '').trim())
        .filter(Boolean)
        .slice(0, 8)
    }
  } catch {
    itemNames = []
  }
  return {
    b,
    profile,
    seed: seedFrom(`${idSeed}|${raw}|${city}`),
    city,
    state,
    trade,
    noun: profile.offeringsNoun,
    itemNames,
    addressLine() {
      return [String(b.address || '').trim(), city, state].filter(Boolean).join(', ')
    }
  }
}

/** "in Jaipur" / "in Jaipur, Rajasthan" / "" — only from supplied location. */
function where(ctx: ContentContext): string {
  if (ctx.city && ctx.state && ctx.city.toLowerCase() !== ctx.state.toLowerCase()) return `in ${ctx.city}, ${ctx.state}`
  if (ctx.city) return `in ${ctx.city}`
  return ''
}

/** First clause of the provider's own description, trimmed to a sentence. */
function ownWords(ctx: ContentContext, max = 150): string {
  const text = String(ctx.b.description || '').trim()
  if (!text) return ''
  const sentence = text.split(/(?<=[.!?])\s/)[0] || text
  return sentence.length > max ? `${sentence.slice(0, max).replace(/\s+\S*$/, '')}…` : sentence
}

// --- Hero -------------------------------------------------------------------

const HEADLINES: Record<string, ((c: ContentContext) => string)[]> = {
  retail: [
    (c) => `Quality ${c.trade}, ${where(c) || 'worth keeping'}`.trim(),
    (c) => `${titleCase(c.noun.plural)} you can trust`,
    (c) => `Good ${c.noun.plural.toLowerCase()}, honest prices`
  ],
  hospitality: [
    (c) => `A table worth coming back to`,
    (c) => `${titleCase(c.trade)} done properly`,
    (c) => `Come hungry, leave happy`
  ],
  service: [
    (c) => `Reliable ${c.trade}, when you need it`,
    (c) => `Sorted in one visit`,
    (c) => `${titleCase(c.noun.plural)} without the run-around`
  ],
  food: [
    (c) => `Made fresh, packed with care`,
    (c) => `${titleCase(c.noun.plural)} people ask for by name`,
    (c) => `Tastes like it should`
  ],
  care: [
    (c) => `Care that takes its time`,
    (c) => `A calm space for ${c.trade}`,
    (c) => `Attentive ${c.noun.plural.toLowerCase()}, every visit`
  ],
  craft: [
    (c) => `Made by hand, made to last`,
    (c) => `${titleCase(c.noun.plural)} with a maker behind each one`,
    (c) => `Honest work in ${c.city ? titleCase(c.city) : 'real materials'}`
  ],
  property: [
    (c) => `Find the address that fits`,
    (c) => `${titleCase(c.noun.plural)} worth a second look`,
    (c) => `Sensible advice, no pressure`
  ],
  education: [
    (c) => `Learning that sticks`,
    (c) => `${titleCase(c.noun.plural)} built around the student`,
    (c) => `Small groups, real progress`
  ],
  event: [
    (c) => `One day, nothing left to chance`,
    (c) => `${titleCase(c.noun.plural)} that run quietly well`,
    (c) => `Plan once, relax after`
  ],
  industrial: [
    (c) => `Supply you can schedule around`,
    (c) => `${titleCase(c.noun.plural)}, quoted properly`,
    (c) => `Consistent output, clear lead times`
  ],
  neutral: [
    (c) => `${titleCase(String(c.b.name || 'Our business'))}`,
    (c) => `${titleCase(c.trade)}${where(c) ? `, ${where(c)}` : ''}`,
    (c) => `Glad you stopped by`
  ]
}

export function heroHeadline(ctx: ContentContext): string {
  const patterns = HEADLINES[ctx.profile.voice] || HEADLINES.neutral
  return pick(ctx.seed, patterns)(ctx)
}

export function heroSubtitle(ctx: ContentContext): string {
  const own = ownWords(ctx, 170)
  if (own) return own
  const place = where(ctx)
  const fallbacks = [
    `${titleCase(ctx.noun.plural)} from ${ctx.b.name || 'our team'}${place ? ` ${place}` : ''}.`,
    `${titleCase(ctx.trade)}${place ? ` ${place}` : ''} — get in touch for current availability.`,
    `Everything we offer, in one place. Ask us for the details.`
  ]
  return pick(ctx.seed, fallbacks)
}

// --- Section copy -----------------------------------------------------------

export function sectionHeading(ctx: ContentContext, section: string): { eyebrow: string; title: string } {
  const label = ctx.profile.labels?.[section as keyof CategoryProfile['labels']] as
    | { eyebrow?: string; title?: string }
    | undefined
  if (label?.title) return { eyebrow: label.eyebrow || defaultEyebrow(section), title: label.title }
  const defaults: Record<string, { eyebrow: string; title: string }> = {
    intro: { eyebrow: 'Welcome', title: `About ${ctx.b.name || 'us'}` },
    offerings: { eyebrow: 'What we offer', title: titleCase(ctx.noun.plural) },
    story: { eyebrow: 'Our story', title: 'How we work' },
    gallery: { eyebrow: 'A closer look', title: 'Gallery' },
    reviews: { eyebrow: 'In their words', title: 'Customer reviews' },
    hours: { eyebrow: 'When we are open', title: 'Opening hours' },
    faq: { eyebrow: 'Good to know', title: 'Frequently asked' },
    contact: { eyebrow: 'Visit / Connect', title: 'Get in touch' }
  }
  return defaults[section] || { eyebrow: defaultEyebrow(section), title: titleCase(section.replace(/-/g, ' ')) }
}

function defaultEyebrow(section: string): string {
  return section.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

/** About/story body: the provider's own paragraphs, else a neutral note. */
export function aboutParagraphs(ctx: ContentContext): string[] {
  const text = String(ctx.b.description || '').trim()
  if (!text) {
    return [
      `${ctx.b.name || 'We'} provide ${ctx.noun.plural.toLowerCase()}${where(ctx) ? ` ${where(ctx)}` : ''}. Contact us for current availability and pricing.`
    ]
  }
  return text.split(/\n{2,}|(?<=[.!?])\s{2,}/).map((p) => p.trim()).filter(Boolean)
}

/** Three fact-based strengths. Anything we cannot verify is left out. */
export function strengths(ctx: ContentContext): { title: string; note: string }[] {
  const out: { title: string; note: string }[] = []
  if (ctx.itemNames.length >= 3) {
    out.push({
      title: `${ctx.itemNames.length > 4 ? 'A wide' : 'A focused'} range`,
      note: `Including ${ctx.itemNames.slice(0, 3).join(', ')}.`
    })
  }
  if (ctx.city) {
    out.push({
      title: `Known locally`,
      note: `Serving ${ctx.city}${ctx.state ? `, ${ctx.state}` : ''} from our ${ctx.profile.serviceBusiness ? 'team base' : 'shop'}.`
    })
  }
  if (ctx.b.rating && ctx.b.reviewCount) {
    out.push({
      title: `Rated by customers`,
      note: `${Number(ctx.b.rating).toFixed(1)} from ${ctx.b.reviewCount} review${Number(ctx.b.reviewCount) === 1 ? '' : 's'}.`
    })
  }
  if (ctx.b.hours && String(ctx.b.hours).trim()) {
    out.push({ title: 'Set hours', note: 'Open on a regular schedule — see the timings below.' })
  }
  if (!out.length) {
    out.push({ title: 'Direct contact', note: 'Call or message us and we will answer properly.' })
  }
  return out.slice(0, 3)
}

// --- FAQ (only questions the data can answer) --------------------------------

export interface FaqItem {
  q: string
  a: string
}

export function faqItems(ctx: ContentContext): FaqItem[] {
  const out: FaqItem[] = []
  const place = ctx.addressLine()
  if (place) out.push({ q: `Where are you located?`, a: `${place}.` })
  if (ctx.b.phone) out.push({ q: `How do I reach you?`, a: `Call ${ctx.b.phone}${ctx.b.whatsapp ? ` or message us on WhatsApp at ${ctx.b.whatsapp}` : ''}.` })
  if (ctx.b.hours && String(ctx.b.hours).trim()) out.push({ q: 'What are your opening hours?', a: 'See the opening hours section for the current schedule.' })
  if (ctx.itemNames.length) out.push({
    q: `What ${ctx.noun.plural.toLowerCase()} do you have?`,
    a: `Recent listings include ${ctx.itemNames.slice(0, 4).join(', ')}. Availability changes, so do ask.`
  })
  if (ctx.b.email) out.push({ q: 'Can I email an enquiry?', a: `Yes — write to ${ctx.b.email} and we will reply with details.` })
  return out.slice(0, 5)
}

// --- SEO ---------------------------------------------------------------------

export function seoTitle(ctx: ContentContext): string {
  const base = String(ctx.b.name || 'Business').trim()
  const place = ctx.city || ctx.state
  const parts = [base, titleCase(ctx.profile.id === 'Other' ? 'Business' : ctx.profile.id)]
  if (place) parts.push(place)
  return parts.join(' | ').slice(0, 60)
}

export function seoDescription(ctx: ContentContext): string {
  const own = ownWords(ctx, 120)
  const tail = `${ctx.noun.plural}${ctx.city ? ` in ${ctx.city}` : ''}. ${ctx.b.phone ? `Call ${ctx.b.phone}.` : ''}`
  const text = own ? `${own} ${tail}` : tail
  return text.replace(/\s+/g, ' ').trim().slice(0, 158)
}

/** Alt text for imagery — descriptive, never a fabricated caption. */
export function altFor(ctx: ContentContext, index: number, kind: 'hero' | 'product' | 'gallery', label?: string): string {
  if (kind === 'product' && label) return `${label}${ctx.city ? `, ${ctx.city}` : ''}`
  if (kind === 'hero') return `${ctx.b.name || ctx.profile.id} — ${ctx.trade}`
  return `${ctx.b.name || 'Business'} ${ctx.noun.plural.toLowerCase()} photo ${index + 1}`
}

function titleCase(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/\b[a-z]/g, (m) => m.toUpperCase())
}
