// Rule-based category profiles for the premium website engine.
// No AI: every value here is a hand-authored rule that maps a business
// category onto a design family, a section order, a page list, image
// keywords, CTA wording and the structured-data type it may claim.
//
// A profile never asserts a fact the provider did not supply — sections that
// need data (offers, delivery, qualifications, packages) are listed here as
// candidates and the composition engine drops them when the data is absent.

import type { DesignFamily, PageId, SectionId } from './types'

export interface CategoryProfile {
  /** Exact wizard category string. */
  id: string
  /** Design family the engine opens with; the provider may still switch skins. */
  family: DesignFamily
  /** Alternate families worth offering as seeded variants, best first. */
  alternates: DesignFamily[]
  /** Heading/body pairing from the family's font stack. */
  typography: { heading: string; body: string }
  /** Section candidates in display order. */
  sections: SectionId[]
  /** Extra copy per section, e.g. a restaurant's offerings heading is 'Popular dishes'. */
  labels: Partial<Record<SectionId, { eyebrow?: string; title?: string; note?: string }>>
  /** Inner pages beyond home/products/about/contact. */
  pages: PageId[]
  /** What the products grid actually holds for this trade. */
  offeringsNoun: { singular: string; plural: string }
  /** True when the category sells services rather than goods. */
  serviceBusiness: boolean
  cta: { primary: string; secondary: string }
  /** Keywords used to pick stock/library imagery and to write alt text. */
  imageKeywords: string[]
  /** schema.org type the data supports. */
  schemaType: string
  /** Content-library key: which sentence patterns this category uses. */
  voice: string
  /** Sections that must never render fabricated claims. */
  guardrails: string[]
}

export const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  'Grocery & Essentials': {
    id: 'Grocery & Essentials',
    family: 'minimal-contemporary',
    alternates: ['organic-lifestyle', 'bold-creative'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'categories', 'offerings', 'daily-essentials', 'offers', 'store-info', 'delivery', 'gallery', 'reviews', 'faq', 'contact'],
    labels: {
      categories: { eyebrow: 'Shop by aisle', title: 'Everything you need, sorted' },
      offerings: { eyebrow: 'On the shelves', title: 'Featured products' },
      'daily-essentials': { eyebrow: 'Every day', title: 'Daily essentials' },
      offers: { eyebrow: 'This week', title: 'Offers and deals' },
      'store-info': { eyebrow: 'The store', title: 'Store information' },
      delivery: { eyebrow: 'At your door', title: 'Delivery information' }
    },
    pages: ['menu'],
    offeringsNoun: { singular: 'Item', plural: 'Products' },
    serviceBusiness: false,
    cta: { primary: 'Call the store', secondary: 'Browse products' },
    imageKeywords: ['fresh fruit', 'vegetables', 'grocery shelves', 'packed staples', 'store counter'],
    schemaType: 'GroceryStore',
    voice: 'retail',
    guardrails: ['No invented discounts — the offers section only renders from supplied data.']
  },

  Restaurants: {
    id: 'Restaurants',
    family: 'luxury-editorial',
    alternates: ['organic-lifestyle', 'modern-dark'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'intro', 'offerings', 'categories', 'gallery', 'story', 'hours', 'booking', 'reviews', 'faq', 'contact'],
    labels: {
      intro: { eyebrow: 'Welcome', title: 'A table worth coming back to' },
      offerings: { eyebrow: 'From the kitchen', title: 'Popular dishes' },
      categories: { eyebrow: 'The menu', title: 'Menu categories' },
      gallery: { eyebrow: 'In the room', title: 'Food gallery' },
      story: { eyebrow: 'Behind the pass', title: 'Our story' },
      hours: { eyebrow: 'When we serve', title: 'Opening hours' },
      booking: { eyebrow: 'Reserve', title: 'Book a table' }
    },
    pages: ['menu'],
    offeringsNoun: { singular: 'Dish', plural: 'Dishes' },
    serviceBusiness: false,
    cta: { primary: 'Book a table', secondary: 'See the menu' },
    imageKeywords: ['plated dish', 'restaurant interior', 'dining table', 'chef at work', 'dessert'],
    schemaType: 'Restaurant',
    voice: 'hospitality',
    guardrails: ['No fabricated Michelin-style awards or chef credentials.']
  },

  'Home Services': {
    id: 'Home Services',
    family: 'modern-dark',
    alternates: ['minimal-contemporary', 'bold-creative'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'process', 'service-areas', 'why-us', 'gallery', 'enquiry', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'What we do', title: 'Services offered' },
      process: { eyebrow: 'How it works', title: 'Our work process' },
      'service-areas': { eyebrow: 'Where we work', title: 'Service areas' },
      'why-us': { eyebrow: 'Why choose us', title: 'Built on getting it right' },
      gallery: { eyebrow: 'Recent work', title: 'Project gallery' },
      enquiry: { eyebrow: 'Get started', title: 'Request a visit' }
    },
    pages: ['services'],
    offeringsNoun: { singular: 'Service', plural: 'Services' },
    serviceBusiness: true,
    cta: { primary: 'Request a call', secondary: 'See our services' },
    imageKeywords: ['technician at work', 'home repair', 'tools', 'maintained interior', 'service van'],
    schemaType: 'HomeAndConstructionBusiness',
    voice: 'service',
    guardrails: ['No guaranteed turnaround times or fixed quotes unless supplied.']
  },

  'Textiles & Apparel': {
    id: 'Textiles & Apparel',
    family: 'luxury-editorial',
    alternates: ['bold-creative', 'organic-lifestyle'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'categories', 'offerings', 'gallery', 'story', 'why-us', 'reviews', 'faq', 'contact'],
    labels: {
      categories: { eyebrow: 'The ranges', title: 'Collections' },
      offerings: { eyebrow: 'Handpicked', title: 'Featured pieces' },
      gallery: { eyebrow: 'Lookbook', title: 'The lookbook' },
      story: { eyebrow: 'Our house', title: 'Brand story' }
    },
    pages: ['lookbook'],
    offeringsNoun: { singular: 'Piece', plural: 'Collections' },
    serviceBusiness: false,
    cta: { primary: 'Enquire to order', secondary: 'View the lookbook' },
    imageKeywords: ['folded fabric', 'boutique rail', 'handloom detail', 'fashion editorial', 'textile swatch'],
    schemaType: 'ClothingStore',
    voice: 'retail',
    guardrails: ['No invented fabric certifications or price claims.']
  },

  'Food & Sweets': {
    id: 'Food & Sweets',
    family: 'organic-lifestyle',
    alternates: ['luxury-editorial', 'bold-creative'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'gallery', 'story', 'ordering', 'hours', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'Counter favourites', title: 'Popular sweets and snacks' },
      categories: { eyebrow: 'Boxes and hampers', title: 'Product collections' },
      gallery: { eyebrow: 'Fresh made', title: 'Product gallery' },
      story: { eyebrow: 'Our kitchen', title: 'About the brand' },
      ordering: { eyebrow: 'To order', title: 'Ordering information' }
    },
    pages: ['menu'],
    offeringsNoun: { singular: 'Sweet', plural: 'Sweets and snacks' },
    serviceBusiness: false,
    cta: { primary: 'Order by phone', secondary: 'See the range' },
    imageKeywords: ['indian sweets', 'mithai tray', 'dessert close-up', 'gift hamper', 'kitchen preparation'],
    schemaType: 'Bakery',
    voice: 'food',
    guardrails: ['No health or purity claims beyond what the provider states.']
  },

  'Food & Beverages': {
    id: 'Food & Beverages',
    family: 'bold-creative',
    alternates: ['modern-dark', 'organic-lifestyle'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'menu', 'story', 'gallery', 'ordering', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'On the board', title: 'Featured offerings' },
      categories: { eyebrow: 'Browse', title: 'Product categories' },
      menu: { eyebrow: 'Full list', title: 'Menu and catalogue' },
      story: { eyebrow: 'Our story', title: 'How it started' },
      ordering: { eyebrow: 'Get it', title: 'Ordering and contact' }
    },
    pages: ['menu'],
    offeringsNoun: { singular: 'Offering', plural: 'Offerings' },
    serviceBusiness: false,
    cta: { primary: 'Order now', secondary: 'See the menu' },
    imageKeywords: ['coffee pour', 'fresh juice', 'cafe counter', 'packaged beverage', 'food lifestyle'],
    schemaType: 'FoodEstablishment',
    voice: 'food',
    guardrails: ['No nutritional or dietary claims unless supplied.']
  },

  Automobile: {
    id: 'Automobile',
    family: 'modern-dark',
    alternates: ['bold-creative', 'minimal-contemporary'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'brands', 'facilities', 'gallery', 'story', 'enquiry', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'In the showroom', title: 'Vehicles and automobile services' },
      brands: { eyebrow: 'We work with', title: 'Brands handled' },
      facilities: { eyebrow: 'The workshop', title: 'Services and facilities' },
      gallery: { eyebrow: 'On the floor', title: 'Gallery' },
      story: { eyebrow: 'About us', title: 'The business' }
    },
    pages: ['catalogue'],
    offeringsNoun: { singular: 'Vehicle', plural: 'Vehicles and services' },
    serviceBusiness: false,
    cta: { primary: 'Enquire now', secondary: 'See what we have' },
    imageKeywords: ['car showroom', 'vehicle detail', 'workshop bay', 'tyre and wheel', 'automobile service'],
    schemaType: 'AutomotiveBusiness',
    voice: 'service',
    guardrails: ['No authorisation or dealership claims unless supplied.']
  },

  Electronics: {
    id: 'Electronics',
    family: 'modern-dark',
    alternates: ['minimal-contemporary', 'bold-creative'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'brands', 'specs', 'offers', 'store-info', 'enquiry', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'In stock', title: 'Featured products' },
      categories: { eyebrow: 'Shop by type', title: 'Product categories' },
      brands: { eyebrow: 'Brands we carry', title: 'Brands available' },
      specs: { eyebrow: 'The detail', title: 'Product specifications' },
      'store-info': { eyebrow: 'Visit us', title: 'Store information' }
    },
    pages: ['catalogue'],
    offeringsNoun: { singular: 'Device', plural: 'Products' },
    serviceBusiness: false,
    cta: { primary: 'Ask for price', secondary: 'Browse products' },
    imageKeywords: ['laptop on desk', 'smartphone line-up', 'electronic components', 'retail display', 'charging setup'],
    schemaType: 'ElectronicsStore',
    voice: 'retail',
    guardrails: ['No warranty or best-price claims unless supplied.']
  },

  'Health & Wellness': {
    id: 'Health & Wellness',
    family: 'organic-lifestyle',
    alternates: ['minimal-contemporary', 'luxury-editorial'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'facilities', 'story', 'gallery', 'booking', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'Programmes', title: 'Services and programmes' },
      facilities: { eyebrow: 'The space', title: 'Facilities' },
      story: { eyebrow: 'Who we are', title: 'About the provider' },
      booking: { eyebrow: 'Come in', title: 'Book a session' }
    },
    pages: ['services'],
    offeringsNoun: { singular: 'Programme', plural: 'Services and programmes' },
    serviceBusiness: true,
    cta: { primary: 'Book an appointment', secondary: 'See programmes' },
    imageKeywords: ['calm studio', 'wellness interior', 'yoga mat', 'treatment room', 'fitness session'],
    schemaType: 'HealthAndBeautyBusiness',
    voice: 'care',
    guardrails: [
      'Never invent medical results, treatment guarantees or qualifications.',
      'Testimonials only render from genuine review data.'
    ]
  },

  'Handicrafts & Art': {
    id: 'Handicrafts & Art',
    family: 'organic-lifestyle',
    alternates: ['luxury-editorial', 'bold-creative'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'story', 'gallery', 'custom-order', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'Featured work', title: 'Featured creations' },
      categories: { eyebrow: 'By craft', title: 'Craft categories' },
      story: { eyebrow: 'The maker', title: 'Artist and brand story' },
      gallery: { eyebrow: 'In the studio', title: 'Work gallery' },
      'custom-order': { eyebrow: 'Made to order', title: 'Commission a piece' }
    },
    pages: ['portfolio'],
    offeringsNoun: { singular: 'Creation', plural: 'Creations' },
    serviceBusiness: false,
    cta: { primary: 'Enquire now', secondary: 'See the work' },
    imageKeywords: ['handmade craft', 'pottery wheel', 'woven textile', 'artisan hands', 'painted detail'],
    schemaType: 'LocalBusiness',
    voice: 'craft',
    guardrails: ['No heritage or award claims unless the provider states them.']
  },

  'Beauty & Personal Care': {
    id: 'Beauty & Personal Care',
    family: 'luxury-editorial',
    alternates: ['bold-creative', 'minimal-contemporary'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'facilities', 'gallery', 'story', 'booking', 'reviews', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'The menu', title: 'Services and collections' },
      categories: { eyebrow: 'Browse', title: 'Featured products' },
      facilities: { eyebrow: 'In the chair', title: 'Treatments and services' },
      story: { eyebrow: 'Our studio', title: 'About the brand' },
      booking: { eyebrow: 'Reserve', title: 'Book an appointment' }
    },
    pages: ['services'],
    offeringsNoun: { singular: 'Service', plural: 'Services and products' },
    serviceBusiness: true,
    cta: { primary: 'Book appointment', secondary: 'See the menu' },
    imageKeywords: ['salon interior', 'skincare products', 'makeup detail', 'treatment room', 'stylist at work'],
    schemaType: 'BeautySalon',
    voice: 'care',
    guardrails: ['No results or permanence claims about treatments.']
  },

  'Real Estate': {
    id: 'Real Estate',
    family: 'luxury-editorial',
    alternates: ['modern-dark', 'minimal-contemporary'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'specs', 'amenities', 'location-info', 'story', 'enquiry', 'contact'],
    labels: {
      offerings: { eyebrow: 'Available now', title: 'Featured properties' },
      categories: { eyebrow: 'Browse', title: 'Property categories' },
      specs: { eyebrow: 'The detail', title: 'Property details' },
      amenities: { eyebrow: 'What comes with it', title: 'Amenities' },
      'location-info': { eyebrow: 'Neighbourhood', title: 'Location information' },
      story: { eyebrow: 'Who we are', title: 'Agent and company profile' },
      enquiry: { eyebrow: 'Come see', title: 'Book a site visit' }
    },
    pages: ['properties'],
    offeringsNoun: { singular: 'Property', plural: 'Properties' },
    serviceBusiness: true,
    cta: { primary: 'Book a site visit', secondary: 'See properties' },
    imageKeywords: ['residential interior', 'modern home exterior', 'apartment living room', 'building facade', 'open plot'],
    schemaType: 'RealEstateAgent',
    voice: 'property',
    guardrails: [
      'No price, RERA, or possession-date claims unless supplied.',
      'Amenities render only from the provider list.'
    ]
  },

  Doctors: {
    id: 'Doctors',
    family: 'minimal-contemporary',
    alternates: ['organic-lifestyle', 'luxury-editorial'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'qualifications', 'categories', 'offerings', 'store-info', 'hours', 'booking', 'contact'],
    labels: {
      qualifications: { eyebrow: 'Credentials', title: 'Qualifications and experience' },
      categories: { eyebrow: 'We treat', title: 'Specializations' },
      offerings: { eyebrow: 'At the clinic', title: 'Services' },
      'store-info': { eyebrow: 'The clinic', title: 'Clinic information' },
      hours: { eyebrow: 'When we are open', title: 'Consultation timings' },
      booking: { eyebrow: 'Get in touch', title: 'Appointment enquiry' }
    },
    pages: ['services'],
    offeringsNoun: { singular: 'Service', plural: 'Services' },
    serviceBusiness: true,
    cta: { primary: 'Request appointment', secondary: 'See services' },
    imageKeywords: ['clinic reception', 'consultation room', 'medical equipment', 'clinical interior', 'waiting area'],
    schemaType: 'MedicalClinic',
    voice: 'care',
    guardrails: [
      'Never invent degrees, registrations, qualifications, patient reviews or clinical claims.',
      'No ratings markup unless genuine review rows exist.'
    ]
  },

  'Wedding Planning': {
    id: 'Wedding Planning',
    family: 'luxury-editorial',
    alternates: ['bold-creative', 'organic-lifestyle'],
    typography: { heading: 'Playfair Display', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'packages', 'gallery', 'process', 'story', 'enquiry', 'reviews', 'contact'],
    labels: {
      offerings: { eyebrow: 'What we handle', title: 'Wedding services' },
      packages: { eyebrow: 'Choose a shape', title: 'Event packages' },
      gallery: { eyebrow: 'Celebrations', title: 'Portfolio' },
      process: { eyebrow: 'How we work', title: 'Planning process' },
      story: { eyebrow: 'The planner', title: 'About us' },
      enquiry: { eyebrow: 'Start planning', title: 'Tell us about your day' }
    },
    pages: ['portfolio'],
    offeringsNoun: { singular: 'Service', plural: 'Wedding services' },
    serviceBusiness: true,
    cta: { primary: 'Enquire now', secondary: 'See the portfolio' },
    imageKeywords: ['wedding decor', 'mandap styling', 'event table setting', 'bridal detail', 'reception lighting'],
    schemaType: 'LocalBusiness',
    voice: 'event',
    guardrails: ['No package pricing unless the provider supplies it.']
  },

  Education: {
    id: 'Education',
    family: 'minimal-contemporary',
    alternates: ['bold-creative', 'modern-dark'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'faculty', 'facilities', 'process', 'enquiry', 'gallery', 'contact'],
    labels: {
      offerings: { eyebrow: 'What we teach', title: 'Courses and programmes' },
      categories: { eyebrow: 'By stage', title: 'Subjects and classes' },
      faculty: { eyebrow: 'The team', title: 'Faculty' },
      facilities: { eyebrow: 'Campus', title: 'Facilities' },
      process: { eyebrow: 'How we teach', title: 'Learning approach' },
      enquiry: { eyebrow: 'Join us', title: 'Admission enquiry' }
    },
    pages: ['courses'],
    offeringsNoun: { singular: 'Course', plural: 'Courses' },
    serviceBusiness: true,
    cta: { primary: 'Enquire for admission', secondary: 'See courses' },
    imageKeywords: ['classroom', 'study desks', 'books and notes', 'campus building', 'learning session'],
    schemaType: 'EducationalOrganization',
    voice: 'education',
    guardrails: ['No results, placement or board-pass statistics unless supplied.']
  },

  'Travel Booking': {
    id: 'Travel Booking',
    family: 'bold-creative',
    alternates: ['luxury-editorial', 'modern-dark'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'destinations', 'facilities', 'gallery', 'booking', 'reviews', 'contact'],
    labels: {
      offerings: { eyebrow: 'Trips we run', title: 'Travel packages' },
      categories: { eyebrow: 'By style', title: 'Tour categories' },
      destinations: { eyebrow: 'Where to', title: 'Popular destinations' },
      facilities: { eyebrow: 'What is included', title: 'Travel services' },
      booking: { eyebrow: 'Ready?', title: 'Book or enquire' }
    },
    pages: ['destinations'],
    offeringsNoun: { singular: 'Package', plural: 'Travel packages' },
    serviceBusiness: true,
    cta: { primary: 'Enquire now', secondary: 'See packages' },
    imageKeywords: ['mountain landscape', 'hotel lobby', 'coastal view', 'travel planning', 'heritage site'],
    schemaType: 'TravelAgency',
    voice: 'event',
    guardrails: ['No itinerary pricing or inclusion claims unless supplied.']
  },

  'B2B Suppliers': {
    id: 'B2B Suppliers',
    family: 'minimal-contemporary',
    alternates: ['modern-dark', 'luxury-editorial'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'industries', 'story', 'enquiry', 'contact'],
    labels: {
      offerings: { eyebrow: 'Line card', title: 'Product catalogue' },
      categories: { eyebrow: 'Ranges', title: 'Supply categories' },
      industries: { eyebrow: 'Who we serve', title: 'Industries served' },
      story: { eyebrow: 'The company', title: 'Company profile' },
      enquiry: { eyebrow: 'Talk to sales', title: 'Bulk enquiry' }
    },
    pages: ['catalogue'],
    offeringsNoun: { singular: 'Line item', plural: 'Catalogue' },
    serviceBusiness: false,
    cta: { primary: 'Send bulk enquiry', secondary: 'View catalogue' },
    imageKeywords: ['warehouse racking', 'manufacturing line', 'packed cartons', 'industrial parts', 'loading bay'],
    schemaType: 'Organization',
    voice: 'industrial',
    guardrails: ['No capacity, MOQ or certification claims unless supplied.']
  },

  'Repair Services': {
    id: 'Repair Services',
    family: 'modern-dark',
    alternates: ['minimal-contemporary', 'bold-creative'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'offerings', 'categories', 'process', 'service-areas', 'reviews', 'enquiry', 'faq', 'contact'],
    labels: {
      offerings: { eyebrow: 'We fix', title: 'Services offered' },
      categories: { eyebrow: 'By device', title: 'Repair categories' },
      process: { eyebrow: 'How it works', title: 'Our work process' },
      'service-areas': { eyebrow: 'Coverage', title: 'Service coverage' },
      reviews: { eyebrow: 'Feedback', title: 'Customer feedback' },
      enquiry: { eyebrow: 'Book it in', title: 'Repair enquiry' }
    },
    pages: ['services'],
    offeringsNoun: { singular: 'Repair', plural: 'Repairs' },
    serviceBusiness: true,
    cta: { primary: 'Book a repair', secondary: 'See what we fix' },
    imageKeywords: ['repair bench', 'technician hands', 'opened device', 'spare parts', 'diagnostic tool'],
    schemaType: 'LocalBusiness',
    voice: 'service',
    guardrails: ['Customer feedback renders only when genuine review rows exist.', 'No turnaround guarantees unless supplied.']
  },

  Other: {
    id: 'Other',
    family: 'minimal-contemporary',
    alternates: ['luxury-editorial', 'modern-dark'],
    typography: { heading: 'DM Sans', body: 'DM Sans' },
    sections: ['hero', 'strip', 'intro', 'offerings', 'story', 'gallery', 'why-us', 'hours', 'reviews', 'faq', 'contact'],
    labels: {
      intro: { eyebrow: 'Who we are', title: 'A little about us' },
      offerings: { eyebrow: 'What we offer', title: 'Products and services' },
      story: { eyebrow: 'Our story', title: 'How we work' },
      'why-us': { eyebrow: 'Why us', title: 'What we focus on' }
    },
    pages: [],
    offeringsNoun: { singular: 'Offering', plural: 'Products and services' },
    serviceBusiness: false,
    cta: { primary: 'Contact us', secondary: 'See offerings' },
    imageKeywords: ['business storefront', 'team at work', 'product display', 'service in progress', 'office interior'],
    schemaType: 'LocalBusiness',
    voice: 'neutral',
    guardrails: ['Nothing is inferred about the trade — neutral copy only.']
  }
}

/** Nearest profile for a category string that drifted (case, spacing, new label). */
export function profileFor(category: string | null | undefined): CategoryProfile {
  const key = String(category || '').trim()
  if (CATEGORY_PROFILES[key]) return CATEGORY_PROFILES[key]
  const lower = key.toLowerCase()
  const hit = Object.keys(CATEGORY_PROFILES).find((id) => id.toLowerCase() === lower)
  if (hit) return CATEGORY_PROFILES[hit]
  const partial = Object.keys(CATEGORY_PROFILES).find(
    (id) => id !== 'Other' && (lower.includes(id.toLowerCase()) || id.toLowerCase().includes(lower))
  )
  return CATEGORY_PROFILES[partial || 'Other']
}

export const PROFILE_CATEGORY_IDS = Object.keys(CATEGORY_PROFILES)
