// Rule-based suggestions for the "auto-create website" chooser.
// No AI call: every option is derived from the business name, the chosen
// category and the location, so it works offline and is fully deterministic.

export interface BusinessDetailSuggestions {
  /** Categories worth offering, best match first. */
  categories: string[]
  /** Subcategories for the currently selected category. */
  subcategories: string[]
  /** Keywords/tags for the currently selected category. */
  tags: string[]
  /** Three ready-to-use descriptions. */
  descriptions: string[]
}

export interface SuggestionInput {
  name: string
  category: string
  city?: string
  state?: string
}

// Name keywords → category. The first matching rule with the most hits wins.
const CATEGORY_HINTS: Array<{ category: string; keywords: RegExp }> = [
  { category: 'Grocery & Essentials', keywords: /kirana|grocery|groceries|supermarket|super mart|mart|provision|general store|daily needs?|vegetables?|fruits?|dairy|staples?/i },
  { category: 'Restaurants', keywords: /restaurant|restro|dhaba|biryani|pizza|burger|dining|dine|eatery|food court|kitchen|cuisine|thali/i },
  { category: 'Home Services', keywords: /home service|plumber|plumbing|electrician|electrical|cleaning|pest control|appliance repair|carpenter|carpentry|painter|painting service|handyman/i },
  { category: 'Textiles & Apparel', keywords: /saree|sari|garment|boutique|fashion|textile|tailor|clothing|apparel|lehenga|kurta|dress|fabric/i },
  { category: 'Food & Sweets', keywords: /sweet|mithai|halwai|bakery|bake|cake|dessert|namkeen|confection/i },
  { category: 'Food & Beverages', keywords: /cafe|coffee|tea|juice|beverage|snack|fast food|cloud kitchen/i },
  { category: 'Automobile', keywords: /car|bike|motor|automobile|vehicle|garage|tyre|tire|showroom|scooter/i },
  { category: 'Electronics', keywords: /electronic|mobile|smartphone|laptop|computer|tv|television|appliance|gadget|inverter/i },
  { category: 'Beauty & Personal Care', keywords: /salon|beauty|parlour|parlor|makeup|hair|nail|skin|facial|bridal/i },
  { category: 'Health & Wellness', keywords: /wellness|yoga|gym|fitness|ayurveda|massage|spa|nutrition|physio|meditation/i },
  { category: 'Handicrafts & Art', keywords: /handicraft|craft|art|painting|pottery|handmade|decor|sculpture|artisan/i },
  { category: 'Real Estate', keywords: /real estate|property|builder|flat|apartment|plot|rent|estate|realtor/i },
  { category: 'Doctors', keywords: /clinic|doctor|hospital|dental|dentist|medical|diagnostic|physician|pediatric|ortho/i },
  { category: 'Wedding Planning', keywords: /wedding|shaadi|marriage|event|decorator|caterer|planner|invitation/i },
  { category: 'Education', keywords: /school|academy|coaching|tuition|institute|college|learning|classes|tutorial/i },
  { category: 'Travel Booking', keywords: /travel|tour|holiday|trip|visa|ticket|flight|hotel booking|honeymoon/i },
  { category: 'B2B Suppliers', keywords: /wholesale|supplier|distributor|manufacturer|factory|packaging|industrial|bulk|trading/i },
  { category: 'Repair Services', keywords: /repair|service center|mobile repair|laptop repair|water purifier|technician|service centre/i }
]

const RELATED_CATEGORIES: Record<string, string[]> = {
  'Grocery & Essentials': ['Food & Sweets', 'B2B Suppliers', 'Food & Beverages'],
  Restaurants: ['Food & Beverages', 'Food & Sweets', 'Wedding Planning'],
  'Home Services': ['Repair Services', 'Real Estate', 'B2B Suppliers'],
  'Textiles & Apparel': ['Handicrafts & Art', 'Wedding Planning', 'B2B Suppliers'],
  'Food & Sweets': ['Restaurants', 'Food & Beverages', 'Wedding Planning'],
  'Food & Beverages': ['Restaurants', 'Food & Sweets', 'Travel Booking'],
  Automobile: ['Repair Services', 'Electronics', 'B2B Suppliers'],
  Electronics: ['Repair Services', 'B2B Suppliers', 'Home Services'],
  'Health & Wellness': ['Doctors', 'Beauty & Personal Care', 'Education'],
  'Handicrafts & Art': ['Textiles & Apparel', 'Wedding Planning', 'B2B Suppliers'],
  'Beauty & Personal Care': ['Health & Wellness', 'Wedding Planning', 'Textiles & Apparel'],
  'Real Estate': ['Home Services', 'B2B Suppliers', 'Doctors'],
  Doctors: ['Health & Wellness', 'Beauty & Personal Care', 'Education'],
  'Wedding Planning': ['Food & Sweets', 'Textiles & Apparel', 'Handicrafts & Art'],
  Education: ['Doctors', 'Travel Booking', 'B2B Suppliers'],
  'Travel Booking': ['Wedding Planning', 'Food & Beverages', 'Education'],
  'B2B Suppliers': ['Automobile', 'Electronics', 'Grocery & Essentials'],
  'Repair Services': ['Home Services', 'Electronics', 'Automobile'],
  Other: ['Home Services', 'Grocery & Essentials', 'B2B Suppliers']
}

const SUBCATEGORIES: Record<string, string[]> = {
  'Grocery & Essentials': ['Kirana Store', 'Supermarket', 'Fresh Produce', 'Packaged Staples', 'Dairy & Frozen', 'Wholesale Grocery'],
  Restaurants: ['North Indian', 'South Indian', 'Chinese', 'Mughlai', 'Multi-cuisine', 'Cafe & Bakery', 'Pure Veg', 'Family Restaurant'],
  'Home Services': ['AC Service', 'Plumbing', 'Electrical', 'Cleaning', 'Pest Control', 'Appliance Repair', 'Painting', 'Carpentry'],
  'Textiles & Apparel': ['Sarees', 'Boutique', "Men's Wear", "Women's Wear", 'Kids Wear', 'Tailoring', 'Fabric Store', 'Uniforms'],
  'Food & Sweets': ['Mithai Shop', 'Bakery', 'Cakes & Desserts', 'Namkeen', 'Gift Hampers', 'Event Orders'],
  'Food & Beverages': ['Cafe', 'Tea & Coffee', 'Juice Bar', 'Quick Service', 'Cloud Kitchen', 'Catering'],
  Automobile: ['Car Service', 'Bike Service', 'Spare Parts', 'Tyres', 'Detailing', 'Showroom', 'Insurance Help'],
  Electronics: ['Mobile Store', 'Laptop & Computer', 'Home Appliances', 'TV & Audio', 'Accessories', 'Repairs'],
  'Health & Wellness': ['Yoga Studio', 'Gym & Fitness', 'Ayurveda', 'Spa', 'Nutrition', 'Physiotherapy', 'Wellness Clinic'],
  'Handicrafts & Art': ['Pottery', 'Paintings', 'Home Decor', 'Handmade Gifts', 'Textile Craft', 'Custom Orders'],
  'Beauty & Personal Care': ['Salon', 'Spa', 'Makeup Studio', 'Hair Studio', 'Nail Studio', 'Skin Care', 'Bridal Makeup'],
  'Real Estate': ['Residential', 'Commercial', 'Rentals', 'Plots', 'Property Management', 'Legal Advisory'],
  Doctors: ['General Physician', 'Dental', 'Pediatrics', 'Orthopedic', 'Dermatology', 'Diagnostics', 'Home Visits'],
  'Wedding Planning': ['Full Planning', 'Decor', 'Catering', 'Photography', 'Venue Booking', 'Invitations'],
  Education: ['Coaching', 'Tuition', 'Test Prep', 'Spoken English', 'Coding', 'Music', 'Art Classes'],
  'Travel Booking': ['Domestic Packages', 'International Packages', 'Honeymoon', 'Visa Assistance', 'Flight Booking', 'Hotel Booking'],
  'B2B Suppliers': ['Wholesale Supply', 'Manufacturing', 'Distribution', 'Packaging', 'Raw Materials', 'Industrial Services'],
  'Repair Services': ['Mobile Repair', 'Laptop Repair', 'Appliance Repair', 'Electronics Repair', 'Water Purifier', 'On-site Service'],
  Other: ['Products', 'Services', 'Retail', 'Consulting', 'Home Business', 'Local Service']
}

const TAGS: Record<string, string[]> = {
  'Grocery & Essentials': ['grocery', 'daily essentials', 'fresh produce', 'home delivery', 'staples', 'wholesale', 'local store', 'best prices'],
  Restaurants: ['restaurant', 'dine-in', 'takeaway', 'home delivery', 'party orders', 'fresh food', 'multi-cuisine', 'family dining'],
  'Home Services': ['home service', 'repair', 'installation', 'maintenance', 'on-site service', 'same-day visit', 'trusted technicians', 'free estimate'],
  'Textiles & Apparel': ['saree', 'boutique', 'custom tailoring', 'wedding wear', 'handloom', 'fabric', 'fashion', 'made to order'],
  'Food & Sweets': ['mithai', 'sweets', 'bakery', 'cakes', 'namkeen', 'gift box', 'festive orders', 'freshly made'],
  'Food & Beverages': ['cafe', 'coffee', 'tea', 'juice', 'snacks', 'takeaway', 'catering', 'freshly prepared'],
  Automobile: ['car service', 'bike service', 'spare parts', 'tyres', 'detailing', 'workshop', 'showroom', 'insurance help'],
  Electronics: ['mobile', 'laptop', 'appliances', 'tv', 'accessories', 'installation', 'repairs', 'latest models'],
  'Health & Wellness': ['yoga', 'fitness', 'ayurveda', 'spa', 'massage', 'nutrition', 'wellness', 'appointment'],
  'Handicrafts & Art': ['handmade', 'handicraft', 'pottery', 'painting', 'home decor', 'artisan', 'gifts', 'custom order'],
  'Beauty & Personal Care': ['salon', 'spa', 'makeup', 'hair', 'skin care', 'nails', 'bridal', 'appointment'],
  'Real Estate': ['property', 'flats', 'plots', 'commercial space', 'rentals', 'site visit', 'legal support', 'local agent'],
  Doctors: ['clinic', 'consultation', 'appointment', 'diagnostics', 'family doctor', 'home visit', 'health checkup', 'specialist'],
  'Wedding Planning': ['wedding planning', 'decor', 'catering', 'photography', 'venue', 'invitations', 'event management', 'packages'],
  Education: ['coaching', 'tuition', 'test prep', 'spoken english', 'coding', 'music', 'art classes', 'admissions open'],
  'Travel Booking': ['travel packages', 'tour', 'holiday', 'visa', 'flight booking', 'hotel booking', 'honeymoon', 'custom itinerary'],
  'B2B Suppliers': ['wholesale', 'bulk supply', 'manufacturer', 'distributor', 'packaging', 'raw material', 'industrial', 'trade enquiry'],
  'Repair Services': ['repair', 'mobile repair', 'laptop repair', 'appliance repair', 'onsite service', 'warranty', 'quick service', 'diagnostics'],
  Other: ['local business', 'quality service', 'trusted', 'experienced team', 'fair pricing', 'customer support', 'made in india', 'home delivery']
}

const OFFERINGS: Record<string, string> = {
  'Grocery & Essentials': 'fresh groceries, daily essentials and household staples',
  Restaurants: 'freshly prepared dishes for dine-in, takeaway and party orders',
  'Home Services': 'home repair, installation and maintenance services',
  'Textiles & Apparel': 'sarees, garments, fabrics and custom tailoring',
  'Food & Sweets': 'fresh sweets, namkeen, cakes and festive gift boxes',
  'Food & Beverages': 'tea, coffee, juices, snacks and quick bites',
  Automobile: 'vehicle servicing, repairs, spare parts and accessories',
  Electronics: 'mobiles, computers, home appliances and accessories',
  'Health & Wellness': 'wellness programmes, therapies and fitness services',
  'Handicrafts & Art': 'handmade crafts, art pieces and custom decor',
  'Beauty & Personal Care': 'salon, spa, hair and makeup services',
  'Real Estate': 'residential and commercial property solutions',
  Doctors: 'consultations, health checkups and treatment services',
  'Wedding Planning': 'wedding planning, decor, catering and photography',
  Education: 'coaching, tuition and skill-development programmes',
  'Travel Booking': 'domestic and international travel packages',
  'B2B Suppliers': 'wholesale supply, manufacturing and bulk sourcing',
  'Repair Services': 'repair and maintenance services for everyday devices',
  Other: 'quality products and services'
}

const DEFAULT_TAGS = TAGS.Other
const DEFAULT_SUBCATEGORIES = SUBCATEGORIES.Other
const DEFAULT_OFFERINGS = OFFERINGS.Other

/** Best category match for a business name, or null when nothing matches. */
export function detectCategoryFromName(name: string): string | null {
  const text = String(name || '')
  let best: { category: string; score: number } | null = null
  for (const hint of CATEGORY_HINTS) {
    const matches = text.match(hint.keywords)
    const score = matches ? matches.length : 0
    if (score > 0 && (!best || score > best.score)) best = { category: hint.category, score }
  }
  return best ? best.category : null
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => !!value)))
}

export function suggestBusinessDetails(input: SuggestionInput): BusinessDetailSuggestions {
  const category = input.category || 'Other'
  const detected = detectCategoryFromName(input.name)
  const related = RELATED_CATEGORIES[detected || category] || []
  const categories = unique([detected, category, ...related]).slice(0, 4)
  const subcategories = (SUBCATEGORIES[category] || DEFAULT_SUBCATEGORIES).slice(0, 6)
  const tags = (TAGS[category] || DEFAULT_TAGS).slice(0, 8)
  const offerings = OFFERINGS[category] || DEFAULT_OFFERINGS
  const city = String(input.city || '').trim()
  const place = city ? ` in ${city}` : ''
  const name = String(input.name || '').trim() || 'Your business'
  const descriptions = [
    `${name} is a ${category.toLowerCase()} business${place}. We offer ${offerings} with quality you can trust, friendly service and fair prices. Visit us or call to know more.`,
    `Looking for ${offerings}${place}? ${name} brings you a carefully chosen range, honest pricing and quick service. Get in touch for orders, availability and enquiries.`,
    `${name} serves customers${place} with ${offerings}. From everyday needs to special requests, we focus on quality, value and a service you can rely on.`
  ]
  return { categories, subcategories, tags, descriptions }
}
