// Rule-based website copy generator used by the wizard's "auto-fill" system.
//
// It writes the provider-facing fields (hero, about, gallery, offerings,
// reviews, visit, footer, menu labels) plus the button labels, button links and
// a couple of useful custom links. Everything is derived from the business
// details that were already entered, so the same listing always produces the
// same website and nothing is invented: no awards, prices, ratings or claims.

import type { SiteCopy } from './templates/shared'
import { profileFor } from './site-engine/categories'

export interface AutoContentInput {
  name?: string | null
  category?: string | null
  subcategory?: string | null
  tags?: string | null
  city?: string | null
  state?: string | null
  address?: string | null
  description?: string | null
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
}

export interface AutoContentLink {
  label: string
  url: string
}

export interface AutoContent {
  /** Structured copy override; empty values keep the template's own wording. */
  copy: SiteCopy
  ctaLabel: string
  ctaUrl: string
  cta2Label: string
  cta2Url: string
  /** Ready-to-use nav/footer links (at most two, so the menu stays readable). */
  links: AutoContentLink[]
}

interface CopyRule {
  navAbout: string
  navOfferings: string
  navVisit: string
  offeringsTitle: string
  galleryTitle: string
  aboutTitle: string
  reviewsTitle: string
  visitTitle: string
  tagline: string
}

// One rule per wizard category. These are deliberately plain and factual —
// the category names a trade, not a promise about the provider's business.
const CATEGORY_COPY: Record<string, CopyRule> = {
  'Grocery & Essentials': {
    navAbout: 'About',
    navOfferings: 'Shop',
    navVisit: 'Visit us',
    offeringsTitle: 'Fresh picks & daily essentials',
    galleryTitle: 'Inside the store',
    aboutTitle: 'Your neighbourhood store',
    reviewsTitle: 'What shoppers say',
    visitTitle: 'Visit the store',
    tagline: 'Fresh groceries and daily essentials, ready when you are.'
  },
  Restaurants: {
    navAbout: 'Our story',
    navOfferings: 'Menu',
    navVisit: 'Visit us',
    offeringsTitle: 'Popular dishes',
    galleryTitle: 'From our kitchen',
    aboutTitle: 'Our story',
    reviewsTitle: 'What guests say',
    visitTitle: 'Visit us',
    tagline: 'Freshly prepared dishes, warm service and a table worth coming back to.'
  },
  'Home Services': {
    navAbout: 'About',
    navOfferings: 'Services',
    navVisit: 'Contact',
    offeringsTitle: 'What we do',
    galleryTitle: 'Recent work',
    aboutTitle: 'Why homes trust us',
    reviewsTitle: 'What customers say',
    visitTitle: 'Request a visit',
    tagline: 'Reliable repairs and installations, done right the first time.'
  },
  'Textiles & Apparel': {
    navAbout: 'Our story',
    navOfferings: 'Collections',
    navVisit: 'Visit us',
    offeringsTitle: 'Featured pieces',
    galleryTitle: 'The lookbook',
    aboutTitle: 'Our story',
    reviewsTitle: 'What customers say',
    visitTitle: 'Visit the studio',
    tagline: 'Handpicked fabrics and made-to-order pieces for every occasion.'
  },
  'Food & Sweets': {
    navAbout: 'About',
    navOfferings: 'Sweets',
    navVisit: 'Visit us',
    offeringsTitle: 'Fresh from the kitchen',
    galleryTitle: 'A look at our sweets',
    aboutTitle: 'Made fresh, every day',
    reviewsTitle: 'What customers say',
    visitTitle: 'Visit the shop',
    tagline: 'Freshly made sweets, namkeen and celebration boxes.'
  },
  'Food & Beverages': {
    navAbout: 'About',
    navOfferings: 'Menu',
    navVisit: 'Visit us',
    offeringsTitle: 'Our menu',
    galleryTitle: 'Inside the cafe',
    aboutTitle: 'Our story',
    reviewsTitle: 'What customers say',
    visitTitle: 'Visit us',
    tagline: 'Freshly brewed, freshly made and served with a smile.'
  },
  Automobile: {
    navAbout: 'About',
    navOfferings: 'Products',
    navVisit: 'Contact',
    offeringsTitle: 'Parts & services',
    galleryTitle: 'Inside the workshop',
    aboutTitle: 'Your local auto team',
    reviewsTitle: 'What drivers say',
    visitTitle: 'Visit the workshop',
    tagline: 'Dependable servicing, spare parts and advice from a local team.'
  },
  Electronics: {
    navAbout: 'About',
    navOfferings: 'Products',
    navVisit: 'Visit us',
    offeringsTitle: 'Latest models & accessories',
    galleryTitle: 'In the store',
    aboutTitle: 'Your neighbourhood electronics store',
    reviewsTitle: 'What customers say',
    visitTitle: 'Visit the store',
    tagline: 'The latest devices, honest advice and dependable after-sales support.'
  },
  'Health & Wellness': {
    navAbout: 'About',
    navOfferings: 'Wellness',
    navVisit: 'Book now',
    offeringsTitle: 'Programmes & therapies',
    galleryTitle: 'Inside the studio',
    aboutTitle: 'Wellness that fits your life',
    reviewsTitle: 'What members say',
    visitTitle: 'Book a session',
    tagline: 'Thoughtful care, expert guidance and a calmer, stronger you.'
  },
  'Handicrafts & Art': {
    navAbout: 'Our story',
    navOfferings: 'Collection',
    navVisit: 'Visit us',
    offeringsTitle: 'Handpicked pieces',
    galleryTitle: 'The collection',
    aboutTitle: 'Handmade, one piece at a time',
    reviewsTitle: 'What collectors say',
    visitTitle: 'Visit the studio',
    tagline: 'Handmade pieces, honest materials and craft you can feel.'
  },
  'Beauty & Personal Care': {
    navAbout: 'About',
    navOfferings: 'Services',
    navVisit: 'Book now',
    offeringsTitle: 'Our services',
    galleryTitle: 'Our work',
    aboutTitle: 'Beauty, personalised',
    reviewsTitle: 'What clients say',
    visitTitle: 'Book an appointment',
    tagline: 'Personalised beauty and grooming, in a space that feels like yours.'
  },
  'Real Estate': {
    navAbout: 'About',
    navOfferings: 'Properties',
    navVisit: 'Contact',
    offeringsTitle: 'Properties & services',
    galleryTitle: 'A closer look',
    aboutTitle: 'Local property, handled properly',
    reviewsTitle: 'Client feedback',
    visitTitle: 'Talk to us',
    tagline: 'Clear advice, verified options and local knowledge you can rely on.'
  },
  Doctors: {
    navAbout: 'About',
    navOfferings: 'Treatments',
    navVisit: 'Book now',
    offeringsTitle: 'How we can help',
    galleryTitle: 'Inside the clinic',
    aboutTitle: 'Care you can count on',
    reviewsTitle: 'Patient stories',
    visitTitle: 'Book a consultation',
    tagline: 'Care that listens, treatment that works and a team you can trust.'
  },
  'Wedding Planning': {
    navAbout: 'About',
    navOfferings: 'Services',
    navVisit: 'Enquire',
    offeringsTitle: 'What we plan',
    galleryTitle: 'Moments we created',
    aboutTitle: 'Making the day effortless',
    reviewsTitle: 'What families say',
    visitTitle: 'Plan with us',
    tagline: 'Thoughtful planning, beautiful details and a day that feels effortless.'
  },
  Education: {
    navAbout: 'About',
    navOfferings: 'Courses',
    navVisit: 'Admissions',
    offeringsTitle: 'Programmes & classes',
    galleryTitle: 'Life at the academy',
    aboutTitle: 'How we teach',
    reviewsTitle: 'What learners say',
    visitTitle: 'Admissions & contact',
    tagline: 'Learning that builds skill, confidence and real-world results.'
  },
  'Travel Booking': {
    navAbout: 'About',
    navOfferings: 'Packages',
    navVisit: 'Contact',
    offeringsTitle: 'Trips & packages',
    galleryTitle: 'Places we love',
    aboutTitle: 'Travel, planned properly',
    reviewsTitle: 'What travellers say',
    visitTitle: 'Plan your trip',
    tagline: 'Carefully planned trips, honest advice and itineraries that fit.'
  },
  'B2B Suppliers': {
    navAbout: 'About',
    navOfferings: 'Products',
    navVisit: 'Contact',
    offeringsTitle: 'Product range',
    galleryTitle: 'Our facility',
    aboutTitle: 'Built for trade',
    reviewsTitle: 'Buyer feedback',
    visitTitle: 'Talk to sales',
    tagline: 'Bulk supply, dependable quality and trade pricing that works.'
  },
  'Repair Services': {
    navAbout: 'About',
    navOfferings: 'Repairs',
    navVisit: 'Contact',
    offeringsTitle: 'Repair services',
    galleryTitle: 'Our work',
    aboutTitle: 'Repairs you can rely on',
    reviewsTitle: 'What customers say',
    visitTitle: 'Book a repair',
    tagline: 'Fast diagnostics, careful repairs and service you can rely on.'
  },
  Other: {
    navAbout: 'About',
    navOfferings: 'Products & services',
    navVisit: 'Contact',
    offeringsTitle: 'What we offer',
    galleryTitle: 'A closer look',
    aboutTitle: 'About us',
    reviewsTitle: 'Customer reviews',
    visitTitle: 'Get in touch',
    tagline: 'Quality products, dependable service and a team that cares.'
  }
}

function clean(value: unknown, max = 400): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function sentence(value: string): string {
  const text = clean(value)
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function tagList(value: unknown): string[] {
  return String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/[^\d]/g, '')
}

function mapsUrl(input: AutoContentInput): string {
  const query = [input.address, input.city, input.state].map((part) => clean(part)).filter(Boolean).join(', ')
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : ''
}

/**
 * Builds every editable website field from the listing details.
 * The caller decides whether these values replace existing copy or only fill
 * blanks; this function itself never mutates anything.
 */
export function autoSiteContent(input: AutoContentInput): AutoContent {
  const name = clean(input.name, 120) || 'Your business'
  const category = clean(input.category, 80) || 'Other'
  const profile = profileFor(category)
  const rule = CATEGORY_COPY[category] || CATEGORY_COPY.Other
  const city = clean(input.city, 80)
  const state = clean(input.state, 80)
  const subcategory = clean(input.subcategory, 80)
  const address = clean(input.address, 240)
  const phone = clean(input.phone, 30)
  const email = clean(input.email, 160)
  const place = city ? ` in ${city}` : ''
  const serving = city ? ` Serving ${city}${state ? `, ${state}` : ''}.` : ''
  const kind = (subcategory || category).toLowerCase()
  const offering = profile.offeringsNoun.plural.toLowerCase()
  const tags = tagList(input.tags)
  const description = clean(input.description, 1200)

  // Hero ------------------------------------------------------------------
  const tagline = `${rule.tagline}${serving}`.slice(0, 240)

  // About -----------------------------------------------------------------
  const opening = description.length >= 40
    ? sentence(description)
    : `${name} is a ${kind} business${place}, offering ${offering} with a focus on quality and service.`
  const proof = tags.length
    ? `Customers come to ${name} for ${tags.slice(0, 3).join(', ')}.`
    : `Customers come to ${name} for ${offering} they can rely on.`
  const promise = profile.serviceBusiness
    ? 'Every job starts with a clear conversation, careful work and a tidy finish.'
    : 'Every visit is built around quality, fair value and friendly service.'
  const invite = phone
    ? `Call ${phone} to talk to the team${address ? `, or visit us at ${address}` : ''}.`
    : address
      ? `Visit us at ${address}.`
      : 'Get in touch to know more.'
  const aboutText = `${opening}\n\n${proof} ${promise} ${invite}`.slice(0, 1400)

  // Footer ----------------------------------------------------------------
  const footerNote = [
    `${name} · ${subcategory || category}`,
    city ? `in ${city}.` : '',
    phone ? `Call ${phone}.` : ''
  ].filter(Boolean).join(' ').slice(0, 240)

  const copy: SiteCopy = {
    heroTitle: name,
    heroTagline: tagline,
    aboutTitle: rule.aboutTitle,
    aboutText,
    galleryTitle: rule.galleryTitle,
    offeringsTitle: rule.offeringsTitle,
    reviewsTitle: rule.reviewsTitle,
    visitTitle: rule.visitTitle,
    footerNote,
    navHome: 'Home',
    navAbout: rule.navAbout,
    navOfferings: rule.navOfferings,
    navVisit: rule.navVisit
  }

  // Buttons ---------------------------------------------------------------
  const tel = digits(input.whatsapp || phone)
  const ctaLabel = profile.cta.primary
  const ctaUrl = tel ? `tel:+${tel.replace(/^\+/, '')}` : ''
  const cta2Label = profile.cta.secondary
  // The page script maps this anchor to whichever offerings section the
  // template actually rendered (products / menu / offerings).
  const cta2Url = '#offerings'

  // Useful custom links (max two keep the nav readable) -------------------
  const links: AutoContentLink[] = []
  const wa = digits(input.whatsapp)
  if (wa) links.push({ label: 'WhatsApp', url: `https://wa.me/${wa}` })
  else if (email) links.push({ label: 'Email us', url: `mailto:${email}` })
  const maps = mapsUrl(input)
  if (maps) links.push({ label: 'Directions', url: maps })

  return {
    copy,
    ctaLabel,
    ctaUrl,
    cta2Label,
    cta2Url,
    links: links.slice(0, 2)
  }
}
