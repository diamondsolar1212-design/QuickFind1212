// Ready-made hero photos and catalogue items.
// A generated site always opens with a populated hero strip and a full
// Products & services section — even before the owner uploads anything.

import type { BusinessData, TemplateProduct } from './shared'

export const DEFAULT_HERO_IMAGES = [
  '/defaults/hero-grocery.svg',
  '/defaults/hero-restaurant.svg',
  '/defaults/hero-wellness.svg',
  '/defaults/hero-service.svg',
  '/defaults/hero-fashion.svg',
  '/defaults/hero-tech.svg'
]

// Category → hero photo names (public/defaults/hero-<name>.svg).
const HERO_BY_CATEGORY: Record<string, string[]> = {
  'Grocery & Essentials': ['grocery', 'service', 'fashion', 'wellness'],
  Restaurants: ['restaurant', 'grocery', 'fashion', 'service'],
  'Food & Sweets': ['restaurant', 'grocery', 'fashion', 'wellness'],
  'Food & Beverages': ['restaurant', 'grocery', 'wellness', 'service'],
  'Health & Wellness': ['wellness', 'service', 'fashion', 'grocery'],
  'Beauty & Personal Care': ['wellness', 'fashion', 'service', 'grocery'],
  'Textiles & Apparel': ['fashion', 'grocery', 'wellness', 'service'],
  'Handicrafts & Art': ['fashion', 'wellness', 'grocery', 'service'],
  'Home Services': ['service', 'tech', 'grocery', 'wellness'],
  'Repair Services': ['service', 'tech', 'fashion', 'grocery'],
  Automobile: ['tech', 'service', 'fashion', 'grocery'],
  Electronics: ['tech', 'service', 'fashion', 'grocery'],
  Doctors: ['wellness', 'service', 'tech', 'grocery'],
  'Real Estate': ['service', 'tech', 'fashion', 'wellness'],
  'Wedding Planning': ['fashion', 'restaurant', 'wellness', 'service'],
  Education: ['service', 'tech', 'wellness', 'fashion'],
  'Travel Booking': ['wellness', 'fashion', 'service', 'restaurant'],
  'B2B Suppliers': ['service', 'tech', 'grocery', 'fashion']
}

/** Four placeholder photos so the hero strip and gallery are never blank. */
export function defaultHeroImages(category?: string | null): string[] {
  const picked = HERO_BY_CATEGORY[String(category || '')]
  if (picked) return picked.map((name) => `/defaults/hero-${name}.svg`)
  return DEFAULT_HERO_IMAGES.slice(0, 4)
}

interface SampleItem {
  name: string
  price: string
  details: string
  emoji: string
}

// Category → four items that look like a real catalogue.
const SAMPLES_BY_CATEGORY: Record<string, SampleItem[]> = {
  'Grocery & Essentials': [
    { name: 'Premium Basmati Rice 5kg', price: '₹450', details: 'Aged long-grain rice, sorted and packed fresh.', emoji: '🍚' },
    { name: 'Organic Atta 10kg', price: '₹520', details: 'Whole-wheat chakki atta, no maida mix.', emoji: '🌾' },
    { name: 'Cold Pressed Mustard Oil 1L', price: '₹240', details: 'Kacchi ghani, single filter, strong aroma.', emoji: '🛢️' },
    { name: 'Toor Dal Premium 1kg', price: '₹160', details: 'Unpolished, machine-cleaned daily stock.', emoji: '🫘' }
  ],
  Restaurants: [
    { name: 'Hyderabadi Dum Biryani', price: '₹320', details: 'Slow-cooked with saffron, served with salan.', emoji: '🍛' },
    { name: 'Butter Chicken', price: '₹380', details: 'Tandoori chicken in a silky tomato-makhani gravy.', emoji: '🍗' },
    { name: 'Paneer Tikka Masala', price: '₹280', details: 'Hand-cut paneer char-grilled with onions.', emoji: '🧀' },
    { name: 'Garlic Naan', price: '₹60', details: 'Fresh from the tandoor, brushed with garlic butter.', emoji: '🫓' }
  ],
  'Food & Sweets': [
    { name: 'Kaju Katli 500g', price: '₹640', details: 'Pure cashew fudge, real silver varak.', emoji: '🍯' },
    { name: 'Gulab Jamun 1kg', price: '₹380', details: 'Soft khoya balls soaked in cardamom syrup.', emoji: '🍩' },
    { name: 'Dry Fruit Gift Box', price: '₹1,200', details: 'Assorted mithai and nuts, festive packing.', emoji: '🎁' },
    { name: 'Fresh Milk Cake 500g', price: '₹450', details: 'Baked same day, no artificial colour.', emoji: '🍰' }
  ],
  'Food & Beverages': [
    { name: 'Masala Chai', price: '₹30', details: 'Slow-brewed with ginger and fresh spices.', emoji: '☕' },
    { name: 'Cold Coffee', price: '₹120', details: 'Double-shot espresso blended with milk.', emoji: '🥤' },
    { name: 'Continental Platter', price: '₹260', details: 'Grilled proteins, fries and house dip.', emoji: '🍽️' },
    { name: 'Seasonal Juice', price: '₹80', details: 'Pressed to order, no added sugar.', emoji: '🍹' }
  ],
  'Home Services': [
    { name: 'AC Service & Repair', price: '₹499 onwards', details: 'Gas top-up, filter wash and full performance check.', emoji: '❄️' },
    { name: 'Refrigerator Repair', price: '₹399 onwards', details: 'Same-day visit for cooling and compressor faults.', emoji: '🧊' },
    { name: 'Washing Machine Service', price: '₹349 onwards', details: 'Drum clean, drum bearing and drain issues fixed.', emoji: '🌀' },
    { name: 'Annual Maintenance Contract', price: '₹2,999/year', details: 'Four visits, free labour, genuine spare warranty.', emoji: '📋' }
  ],
  'Repair Services': [
    { name: 'Phone Screen Replacement', price: '₹1,499 onwards', details: 'Original-grade display with 6-month warranty.', emoji: '📱' },
    { name: 'Laptop SSD Upgrade', price: '₹2,999 onwards', details: 'Clone your old drive, boot in seconds.', emoji: '💻' },
    { name: 'Water Purifier Service', price: '₹599', details: 'Filter change, UV check and full sanitisation.', emoji: '🚰' },
    { name: 'Home Appliance Check-up', price: '₹349', details: 'On-site diagnosis with an instant repair quote.', emoji: '🛠️' }
  ],
  Automobile: [
    { name: 'Full Service & Tuning', price: '₹2,499', details: 'Engine oil, filters, brake check and wash.', emoji: '🚗' },
    { name: 'Wheel Alignment & Balancing', price: '₹899', details: 'Laser alignment for a wobble-free drive.', emoji: '🛞' },
    { name: 'Denting & Painting', price: '₹3,500 onwards', details: 'Panel-beat with oven-baked, colour-matched paint.', emoji: '🎨' },
    { name: 'Battery Replacement', price: '₹4,200 onwards', details: 'Amaron/Exide with 24-month warranty and fitting.', emoji: '🔋' }
  ],
  Electronics: [
    { name: 'LED TV Installation', price: '₹799', details: 'Wall mounting, cabling and channel setup.', emoji: '📺' },
    { name: 'Wireless Earbuds', price: '₹1,999', details: 'Active noise cancelling, 30-hour battery.', emoji: '🎧' },
    { name: 'Inverter + Battery Combo', price: '₹12,500', details: '1100VA inverter with 150Ah tubular battery.', emoji: '🔌' },
    { name: 'Smartwatch Pro', price: '₹3,499', details: 'AMOLED display, SpO2 and 14-day backup.', emoji: '⌚' }
  ],
  'Health & Wellness': [
    { name: 'Full Body Ayurvedic Massage', price: '₹1,800', details: '90 minutes with warm herbal oils.', emoji: '🌿' },
    { name: 'Yoga & Meditation Course', price: '₹4,500/month', details: 'Daily sessions with a certified instructor.', emoji: '🧘' },
    { name: 'Diet Consultation', price: '₹999', details: 'Personalised plan with fortnightly follow-ups.', emoji: '🥗' },
    { name: 'Spa & Steam Therapy', price: '₹1,200', details: 'Steam, aroma relaxation and de-tan pack.', emoji: '💆' }
  ],
  'Beauty & Personal Care': [
    { name: 'Bridal Makeup Package', price: '₹15,000 onwards', details: 'HD makeup, hair styling and draping.', emoji: '💄' },
    { name: 'Hair Spa & Smoothening', price: '₹2,400 onwards', details: 'Keratin treatment with scalp therapy.', emoji: '💇' },
    { name: 'Classic Facial', price: '₹999', details: 'Clean-up, massage, pack and de-tan.', emoji: '✨' },
    { name: 'Manicure & Pedicure', price: '₹749', details: 'Sanitised tools, cuticle care and polish.', emoji: '💅' }
  ],
  'Textiles & Apparel': [
    { name: 'Pure Silk Banarasi Saree', price: '₹8,900 onwards', details: 'Handwoven with real zari border.', emoji: '🥻' },
    { name: 'Kurta Set (Hand Block)', price: '₹1,850', details: 'Cotton mul, Sanganeri block print.', emoji: '👕' },
    { name: 'Designer Lehenga', price: '₹12,500 onwards', details: 'Bridal collection with matching blouse.', emoji: '👗' },
    { name: 'Custom Tailoring', price: '₹650 onwards', details: 'Perfect fit in 5 working days.', emoji: '✂️' }
  ],
  'Handicrafts & Art': [
    { name: 'Hand-Painted Madhubani Frame', price: '₹3,200', details: 'Natural pigments on handmade paper.', emoji: '🖼️' },
    { name: 'Blue Pottery Vase', price: '₹1,450', details: 'Jaipur kashi work, food-safe glaze.', emoji: '🏺' },
    { name: 'Brass Diya Set (6)', price: '₹899', details: 'Lost-wax cast, hand-finished.', emoji: '🪔' },
    { name: 'Pashmina Shawl', price: '₹6,500 onwards', details: 'Kashmiri weave with hand-rolled edges.', emoji: '🧣' }
  ],
  'Real Estate': [
    { name: '2 BHK Apartment Sale', price: '₹65 Lakh onwards', details: 'Rera-approved, covered parking and lift.', emoji: '🏠' },
    { name: 'Commercial Shop Rental', price: '₹45,000/month', details: 'Main-road facing, high footfall location.', emoji: '🏢' },
    { name: 'Plot with Clear Title', price: '₹32 Lakh onwards', details: 'Demarcated, mutation done, ready to build.', emoji: '📐' },
    { name: 'Property Legal Advisory', price: '₹5,000', details: 'Document check, due diligence and registration.', emoji: '📝' }
  ],
  Doctors: [
    { name: 'General Consultation', price: '₹500', details: '30-minute OPD with digital prescription.', emoji: '🩺' },
    { name: 'Full Health Check-up', price: '₹2,499', details: '60 parameters with same-day report.', emoji: '🧪' },
    { name: 'Vaccination & Immunisation', price: '₹800 onwards', details: 'Cold-chain stored, WHO-approved vaccines.', emoji: '💉' },
    { name: 'Home Visit Consultation', price: '₹1,200', details: 'Ward-level care for elderly patients.', emoji: '🏡' }
  ],
  'Wedding Planning': [
    { name: 'Complete Wedding Package', price: '₹2,50,000 onwards', details: 'Venue, decor, catering and photography.', emoji: '💍' },
    { name: 'Mandap & Stage Decor', price: '₹45,000 onwards', details: 'Fresh flowers, drapes and lighting.', emoji: '🌸' },
    { name: 'Cinematic Wedding Film', price: '₹65,000 onwards', details: 'Two-day coverage with a 4K highlight reel.', emoji: '🎥' },
    { name: 'Catering (per plate)', price: '₹750 onwards', details: 'Multi-cuisine menu, live counters included.', emoji: '🍽️' }
  ],
  Education: [
    { name: 'Class 9-10 Foundation Batch', price: '₹6,000/month', details: 'All subjects, weekly tests and doubt sessions.', emoji: '📚' },
    { name: 'JEE/NEET Crash Course', price: '₹18,000', details: '60-day syllabus sprint with mock tests.', emoji: '🎯' },
    { name: 'Spoken English & IELTS', price: '₹8,500', details: 'Speaking practice with band-score feedback.', emoji: '🗣️' },
    { name: 'Coding for School Kids', price: '₹4,500/month', details: 'Scratch to Python, project-based batches.', emoji: '💻' }
  ],
  'Travel Booking': [
    { name: 'Kashmir 5N/6D Package', price: '₹24,500', details: 'Houseboat, shikara and guided sightseeing.', emoji: '🏔️' },
    { name: 'Goa Beach Getaway 4N/5D', price: '₹16,900', details: 'Sea-facing hotel, transfers and water sports.', emoji: '🏖️' },
    { name: 'Dubai Visa + Stay 5N', price: '₹42,000', details: 'Tourist visa, city tour and desert safari.', emoji: '🌇' },
    { name: 'Air Ticket Assistance', price: '₹500 / ticket', details: 'Best-fare search, refunds and rebooking help.', emoji: '✈️' }
  ],
  'B2B Suppliers': [
    { name: 'Wholesale Corrugated Boxes', price: '₹28 / piece', details: '5-ply, custom printing, 1000-piece MOQ.', emoji: '📦' },
    { name: 'Industrial Packaging Film', price: '₹220 / kg', details: 'Stretch and shrink rolls, immediate dispatch.', emoji: '🎞️' },
    { name: 'Bulk Stationery Supply', price: 'On request', details: 'Contract supply with monthly billing.', emoji: '🗂️' },
    { name: 'Raw Material Sourcing', price: 'On request', details: 'Traced vendors, quality checks before dispatch.', emoji: '🏭' }
  ],
  Other: [
    { name: 'Signature Package', price: '₹999', details: 'Our most requested service, done end-to-end.', emoji: '⭐' },
    { name: 'Premium Offering', price: '₹1,999', details: 'Priority handling with extended support.', emoji: '💎' },
    { name: 'Value Pack', price: '₹499', details: 'Everyday essentials at honest pricing.', emoji: '📦' },
    { name: 'New Arrival', price: '₹1,499', details: 'Freshly added — ask us for details.', emoji: '✨' }
  ]
}

/**
 * Four catalogue items for a business that has not added products yet.
 * Photos come from the business's own images so the cards match the store.
 */
export function sampleProducts(b: BusinessData, images: string[]): TemplateProduct[] {
  const items = SAMPLES_BY_CATEGORY[String(b.category || '')] || SAMPLES_BY_CATEGORY.Other
  const media = images.filter(Boolean)
  return items.map((item, i) => ({
    name: item.name,
    price: item.price,
    details: item.details,
    emoji: item.emoji,
    image: media.length > 0 ? media[i % media.length] : ''
  }))
}
