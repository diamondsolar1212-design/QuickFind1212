// Seed script — populates DB with sample businesses across India
import { db } from '../src/lib/db'

const HOURS_RETAIL = JSON.stringify({
  mon: "9:00 AM - 9:00 PM", tue: "9:00 AM - 9:00 PM", wed: "9:00 AM - 9:00 PM",
  thu: "9:00 AM - 9:00 PM", fri: "9:00 AM - 9:00 PM", sat: "9:00 AM - 10:00 PM", sun: "10:00 AM - 8:00 PM"
})
const HOURS_RESTAURANT = JSON.stringify({
  mon: "11:00 AM - 11:30 PM", tue: "11:00 AM - 11:30 PM", wed: "11:00 AM - 11:30 PM",
  thu: "11:00 AM - 11:30 PM", fri: "11:00 AM - 12:30 AM", sat: "11:00 AM - 12:30 AM", sun: "11:00 AM - 11:00 PM"
})
const HOURS_SERVICE = JSON.stringify({
  mon: "10:00 AM - 7:00 PM", tue: "10:00 AM - 7:00 PM", wed: "10:00 AM - 7:00 PM",
  thu: "10:00 AM - 7:00 PM", fri: "10:00 AM - 7:00 PM", sat: "10:00 AM - 5:00 PM", sun: "Closed"
})
const HOURS_PREMIUM = JSON.stringify({
  mon: "9:30 AM - 8:00 PM", tue: "9:30 AM - 8:00 PM", wed: "9:30 AM - 8:00 PM",
  thu: "9:30 AM - 8:00 PM", fri: "9:30 AM - 9:00 PM", sat: "9:30 AM - 9:00 PM", sun: "11:00 AM - 6:00 PM"
})

const PRODUCTS_RETAIL = JSON.stringify([
  { name: "Premium Basmati Rice 5kg", price: "₹450", img: "🍚" },
  { name: "Organic Atta 10kg", price: "₹520", img: "🌾" },
  { name: "Cold Pressed Mustard Oil 1L", price: "₹240", img: "🛢️" },
  { name: "Toor Dal Premium 1kg", price: "₹160", img: "🫘" }
])

const PRODUCTS_RESTAURANT = JSON.stringify([
  { name: "Hyderabadi Dum Biryani", price: "₹320", img: "🍛" },
  { name: "Butter Chicken", price: "₹380", img: "🍗" },
  { name: "Paneer Tikka Masala", price: "₹280", img: "🧀" },
  { name: "Garlic Naan", price: "₹60", img: "🫓" }
])

const PRODUCTS_SERVICE = JSON.stringify([
  { name: "AC Service & Repair", price: "₹499 onwards", img: "❄️" },
  { name: "Refrigerator Repair", price: "₹399 onwards", img: "🧊" },
  { name: "Washing Machine Service", price: "₹349 onwards", img: "🌀" },
  { name: "Annual Maintenance Contract", price: "₹2,999/year", img: "📋" }
])

const PRODUCTS_PREMIUM = JSON.stringify([
  { name: "Bridal Lehenga Collection", price: "₹45,000 onwards", img: "👗" },
  { name: "Designer Saree (Pure Silk)", price: "₹18,000 onwards", img: "🥻" },
  { name: "Sherwani Premium", price: "₹25,000 onwards", img: "🤵" },
  { name: "Custom Tailoring", price: "On consultation", img: "✂️" }
])

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing
  await db.review.deleteMany()
  await db.business.deleteMany()
  await db.user.deleteMany()

  // Create owner
  const owner = await db.user.create({
    data: {
      email: 'owner@businesshub.in',
      name: 'Demo Business Owner',
      phone: '+91 98765 43210',
      password: 'demo123',
      role: 'BUSINESS_OWNER'
    }
  })

  const customer = await db.user.create({
    data: {
      email: 'raj@businesshub.in',
      name: 'Raj Kumar',
      phone: '+91 90000 12345',
      password: 'demo123',
      role: 'CUSTOMER'
    }
  })

  // Create admin user
  await db.user.create({
    data: {
      email: 'admin@businesshub.in',
      name: 'Platform Admin',
      phone: '+91 90000 00000',
      password: 'admin123',
      role: 'CUSTOMER',
      isAdmin: true
    }
  })

  const businesses = [
    // ====== MUMBAI ======
    {
      name: "Sharma Kirana Store",
      description: "Trusted neighbourhood grocery store since 1985. Fresh vegetables, pulses, spices, and daily essentials at wholesale prices. B2B bulk supply available for restaurants and caterers.",
      category: "Grocery & Essentials",
      subcategory: "Kirana Stores",
      tags: "grocery,kirana,wholesale,bulk,pulses,spices",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      email: "sharma.kirana@gmail.com",
      address: "Shop 12, Linking Road, Bandra West",
      city: "Mumbai", state: "Maharashtra", pincode: "400050",
      lat: 19.0596, lng: 72.8295,
      rating: 4.3, reviewCount: 124,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "retail", imageColor: "#16a34a", emoji: "🛒",
      hours: HOURS_RETAIL, products: PRODUCTS_RETAIL, ownerId: owner.id
    },
    {
      name: "Bawarchi Restaurant",
      description: "Authentic Hyderabadi and North Indian cuisine served in a warm family-friendly ambience. Signature dum biryani, kebabs, and traditional thali. Pure veg and non-veg options available.",
      category: "Restaurants",
      subcategory: "Mughlai",
      tags: "restaurant,biryani,north indian,mughlai,kebab",
      phone: "+91 98200 11111",
      whatsapp: "+91 98200 11111",
      email: "bawarchi.mumbai@gmail.com",
      address: "Hill Road, Near Mount Mary Church, Bandra West",
      city: "Mumbai", state: "Maharashtra", pincode: "400050",
      lat: 19.0560, lng: 72.8244,
      rating: 4.5, reviewCount: 892,
      verified: true, premium: true, isB2B: false, isB2C: true,
      template: "restaurant", imageColor: "#dc2626", emoji: "🍽️",
      hours: HOURS_RESTAURANT, products: PRODUCTS_RESTAURANT, ownerId: owner.id
    },
    {
      name: "CoolCare AC & Refrigeration",
      description: "24x7 doorstep AC repair, refrigerator servicing, washing machine and microwave repair. Genuine spare parts, 90-day warranty on repairs. AMC contracts available for offices and societies.",
      category: "Home Services",
      subcategory: "Appliance Repair",
      tags: "ac repair,refrigerator,washing machine,amc,doorstep",
      phone: "+91 99300 22222",
      whatsapp: "+91 99300 22222",
      email: "coolcare.mumbai@gmail.com",
      address: "S.V. Road, Andheri West",
      city: "Mumbai", state: "Maharashtra", pincode: "400058",
      lat: 19.1197, lng: 72.8468,
      rating: 4.4, reviewCount: 342,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "service", imageColor: "#0891b2", emoji: "🔧",
      hours: HOURS_SERVICE, products: PRODUCTS_SERVICE, ownerId: owner.id
    },
    {
      name: "Mumbai Wholesale Textiles",
      description: "Largest wholesale textile market supplier. Direct from mill sarees, suit pieces, lehengas, and dress materials. Bulk orders for boutiques, retailers and wedding planners at unbeatable prices.",
      category: "Textiles & Apparel",
      subcategory: "Wholesale Textile",
      tags: "textile,wholesale,saree,suit,lehenga,bulk,b2b",
      phone: "+91 98330 33333",
      whatsapp: "+91 98330 33333",
      email: "sales@mumba textiles.in",
      address: "Mangaldas Market, Kalbadevi Road",
      city: "Mumbai", state: "Maharashtra", pincode: "400002",
      lat: 18.9500, lng: 72.8280,
      rating: 4.6, reviewCount: 567,
      verified: true, premium: true, isB2B: true, isB2C: false,
      template: "premium", imageColor: "#7c3aed", emoji: "🧵",
      hours: HOURS_PREMIUM, products: PRODUCTS_PREMIUM, ownerId: owner.id
    },
    {
      name: "Spice Junction Pure Veg",
      description: "Pure vegetarian family restaurant serving South Indian, Punjabi, and Chinese dishes. Famous for filter coffee, masala dosa, and unlimited thali. Catering services for events and corporate parties.",
      category: "Restaurants",
      subcategory: "Pure Veg",
      tags: "restaurant,veg,south indian,thali,catering",
      phone: "+91 98191 44444",
      whatsapp: "+91 98191 44444",
      email: "spicejunction@gmail.com",
      address: "Lokhandwala Complex, Andheri West",
      city: "Mumbai", state: "Maharashtra", pincode: "400053",
      lat: 19.1300, lng: 72.8200,
      rating: 4.2, reviewCount: 234,
      verified: false, premium: false, isB2B: false, isB2C: true,
      template: "restaurant", imageColor: "#ea580c", emoji: "🍜",
      hours: HOURS_RESTAURANT, products: PRODUCTS_RESTAURANT, ownerId: owner.id
    },

    // ====== DELHI ======
    {
      name: "Chandni Chowk Sweets & Snacks",
      description: "Heritage sweet shop since 1962 serving traditional Indian mithai, namkeen, and savouries. Bulk order for weddings, festivals, and corporate gifting. Famous for ghevar, motichoor laddu, and aloo tikki.",
      category: "Food & Sweets",
      subcategory: "Mithai Shops",
      tags: "sweets,mithai,namkeen,bulk,wholesale,festival,gift",
      phone: "+91 98100 55555",
      whatsapp: "+91 98100 55555",
      email: "chandni.sweets@gmail.com",
      address: "Gali Paranthe Wali, Chandni Chowk",
      city: "Delhi", state: "Delhi", pincode: "110006",
      lat: 28.6562, lng: 77.2305,
      rating: 4.7, reviewCount: 1245,
      verified: true, premium: true, isB2B: true, isB2C: true,
      template: "premium", imageColor: "#c026d3", emoji: "🍯",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "Motichoor Laddu 1kg", price: "₹640", img: "🟡" },
        { name: "Ghevar Special", price: "₹480", img: "🥮" },
        { name: "Kaju Katli 500g", price: "₹720", img: "💠" },
        { name: "Festival Gift Box 1kg", price: "₹1,800", img: "🎁" }
      ]), ownerId: owner.id
    },
    {
      name: "Karol Bagh Auto Parts Hub",
      description: "Wholesale and retail supplier of genuine and OEM automobile spare parts for cars, bikes, and commercial vehicles. Authorised dealer for Bosch, Denso, and MRF. Bulk orders for workshops and fleet owners.",
      category: "Automobile",
      subcategory: "Spare Parts",
      tags: "auto parts,spare parts,car,bike,oem,bosch,wholesale",
      phone: "+91 98990 66666",
      whatsapp: "+91 98990 66666",
      email: "kbautoparts@gmail.com",
      address: "Ajmal Khan Road, Karol Bagh",
      city: "Delhi", state: "Delhi", pincode: "110005",
      lat: 28.6519, lng: 77.1909,
      rating: 4.4, reviewCount: 423,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "retail", imageColor: "#475569", emoji: "🔧",
      hours: HOURS_RETAIL, products: JSON.stringify([
        { name: "Bosch Spark Plug Set", price: "₹1,200", img: "🔌" },
        { name: "MRF Tyre 165/80 R14", price: "₹4,200", img: "🛞" },
        { name: "Denso Alternator", price: "₹6,800", img: "⚙️" },
        { name: "Brake Pad Set", price: "₹980", img: "🛑" }
      ]), ownerId: owner.id
    },
    {
      name: "Lajpat Nagar Electronics Bazaar",
      description: "Largest electronics marketplace for mobile phones, laptops, accessories, and home appliances. Wholesale and retail. Bulk deals for retailers, schools, and corporate offices.",
      category: "Electronics",
      subcategory: "Mobile & Gadgets",
      tags: "electronics,mobile,laptop,wholesale,gadget",
      phone: "+91 98180 77777",
      whatsapp: "+91 98180 77777",
      email: "lajpat.electronics@gmail.com",
      address: "Central Market, Lajpat Nagar",
      city: "Delhi", state: "Delhi", pincode: "110024",
      lat: 28.5677, lng: 77.2415,
      rating: 4.3, reviewCount: 678,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "retail", imageColor: "#0284c7", emoji: "📱",
      hours: HOURS_RETAIL, products: JSON.stringify([
        { name: "Samsung Galaxy M14", price: "₹13,499", img: "📱" },
        { name: "boAt Airdopes 141", price: "₹1,099", img: "🎧" },
        { name: "Mi Power Bank 20000mAh", price: "₹1,799", img: "🔋" },
        { name: "Logitech Wireless Mouse", price: "₹699", img: "🖱️" }
      ]), ownerId: owner.id
    },
    {
      name: "Delhi Ayurveda Wellness Clinic",
      description: "Authentic Ayurvedic clinic offering panchakarma, abhyanga, and herbal treatments. Expert vaidyas with 25+ years experience. Custom wellness plans, herbal medicines, and diet consultations.",
      category: "Health & Wellness",
      subcategory: "Ayurvedic Clinics",
      tags: "ayurveda,panchakarma,wellness,herbal,clinic",
      phone: "+91 99100 88888",
      whatsapp: "+91 99100 88888",
      email: "delhiayurveda@gmail.com",
      address: "Block C, Greater Kailash 2",
      city: "Delhi", state: "Delhi", pincode: "110048",
      lat: 28.5244, lng: 77.2467,
      rating: 4.8, reviewCount: 156,
      verified: true, premium: true, isB2B: false, isB2C: true,
      template: "service", imageColor: "#15803d", emoji: "🌿",
      hours: HOURS_SERVICE, products: JSON.stringify([
        { name: "Panchakarma 7-day Package", price: "₹15,000", img: "🧘" },
        { name: "Abhyanga Full Body Massage", price: "₹1,800", img: "💆" },
        { name: "Ayurvedic Consultation", price: "₹600", img: "📋" },
        { name: "Herbal Medicine Kit", price: "₹2,400", img: "🌱" }
      ]), ownerId: owner.id
    },

    // ====== BANGALORE ======
    {
      name: "Indiranagar Coffee Roasters",
      description: "Specialty single-origin coffee roastery sourcing beans from Coorg, Chikmagalur, and Araku Valley. Fresh roasted Arabica and Robusta, brewing equipment, and barista training workshops.",
      category: "Food & Beverages",
      subcategory: "Coffee Roasters",
      tags: "coffee,roastery,specialty,arabica,bengaluru,b2b",
      phone: "+91 80500 99999",
      whatsapp: "+91 80500 99999",
      email: "indiranagar.coffee@gmail.com",
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru", state: "Karnataka", pincode: "560038",
      lat: 12.9719, lng: 77.6412,
      rating: 4.6, reviewCount: 389,
      verified: true, premium: true, isB2B: true, isB2C: true,
      template: "premium", imageColor: "#92400e", emoji: "☕",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "Coorg Arabica Roasted 250g", price: "₹520", img: "🫘" },
        { name: "Chikmagalur Monsooned Malabar 500g", price: "₹780", img: "🟤" },
        { name: "V60 Brew Kit", price: "₹2,400", img: "☕" },
        { name: "Barista Workshop (Weekend)", price: "₹3,500", img: "👨‍🍳" }
      ]), ownerId: owner.id
    },
    {
      name: "Koramangala Tech Repair Hub",
      description: "Same-day repair service for laptops, mobiles, tablets, and gaming consoles. Genuine parts with up to 6 months warranty. Specialised in MacBook, iPhone, and gaming PC repairs. Bulk AMC for IT companies.",
      category: "Electronics",
      subcategory: "Repair Services",
      tags: "laptop repair,mobile repair,macbook,iphone,b2b,amc",
      phone: "+91 74060 10101",
      whatsapp: "+91 74060 10101",
      email: "koramangala.techrepair@gmail.com",
      address: "5th Block, Koramangala, 80 Feet Road",
      city: "Bengaluru", state: "Karnataka", pincode: "560095",
      lat: 12.9352, lng: 77.6245,
      rating: 4.5, reviewCount: 612,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "service", imageColor: "#0e7490", emoji: "💻",
      hours: HOURS_SERVICE, products: JSON.stringify([
        { name: "iPhone Screen Replacement", price: "₹3,999 onwards", img: "📱" },
        { name: "MacBook Logic Board Repair", price: "₹8,500 onwards", img: "💻" },
        { name: "Laptop Battery Replacement", price: "₹2,200 onwards", img: "🔋" },
        { name: "Annual AMC for SMEs", price: "₹15,000/year", img: "📋" }
      ]), ownerId: owner.id
    },
    {
      name: "Jayanagar Fresh Vegetables",
      description: "Daily fresh organic vegetables sourced directly from local farmers. Wide range of leafy greens, exotic vegetables, and seasonal fruits. B2B supply to restaurants, juice bars, and hostels.",
      category: "Grocery & Essentials",
      subcategory: "Vegetables & Fruits",
      tags: "vegetables,organic,fresh,farmers,b2b",
      phone: "+91 80550 20202",
      whatsapp: "+91 80550 20202",
      email: "jayanagar.veg@gmail.com",
      address: "4th Block, Jayanagar Shopping Complex",
      city: "Bengaluru", state: "Karnataka", pincode: "560011",
      lat: 12.9250, lng: 77.5938,
      rating: 4.4, reviewCount: 245,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "retail", imageColor: "#16a34a", emoji: "🥬",
      hours: HOURS_RETAIL, products: JSON.stringify([
        { name: "Organic Tomato 1kg", price: "₹40", img: "🍅" },
        { name: "Palak (Spinach) Bundle", price: "₹25", img: "🥬" },
        { name: "Exotic Lettuce 100g", price: "₹60", img: "🥗" },
        { name: "Farm Fresh Carrot 1kg", price: "₹55", img: "🥕" }
      ]), ownerId: owner.id
    },
    {
      name: "Brigade Road Premium Salon",
      description: "Luxe unisex salon and spa offering hair styling, keratin treatment, balayage colour, spa therapies, and bridal makeup. International brand products used. Certified stylists trained in London.",
      category: "Beauty & Personal Care",
      subcategory: "Premium Salons",
      tags: "salon,spa,bridal,keratin,balayage,hair",
      phone: "+91 80440 30303",
      whatsapp: "+91 80440 30303",
      email: "brigade.salon@gmail.com",
      address: "Brigade Road, Ashoka Nagar",
      city: "Bengaluru", state: "Karnataka", pincode: "560025",
      lat: 12.9716, lng: 77.6060,
      rating: 4.7, reviewCount: 489,
      verified: true, premium: true, isB2B: false, isB2C: true,
      template: "premium", imageColor: "#be185d", emoji: "💇",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "Hair Cut & Style", price: "₹800 onwards", img: "💇" },
        { name: "Keratin Treatment", price: "₹5,500 onwards", img: "✨" },
        { name: "Bridal Makeup Package", price: "₹18,000 onwards", img: "👰" },
        { name: "Swedish Full Body Spa 90min", price: "₹3,200", img: "💆" }
      ]), ownerId: owner.id
    },

    // ====== JAIPUR ======
    {
      name: "Pink City Handicrafts Emporium",
      description: "Authentic Rajasthani handicrafts, blue pottery, marble statues, mojris, and bandhani textiles. Wholesale and export. Government recognised exporter supplying to boutiques worldwide.",
      category: "Handicrafts & Art",
      subcategory: "Handicraft Exporters",
      tags: "handicraft,rajasthani,blue pottery,bandhani,export",
      phone: "+91 94140 40404",
      whatsapp: "+91 94140 40404",
      email: "pinkcity.handicrafts@gmail.com",
      address: "MI Road, Near Ajmeri Gate",
      city: "Jaipur", state: "Rajasthan", pincode: "302001",
      lat: 26.9124, lng: 75.7873,
      rating: 4.6, reviewCount: 234,
      verified: true, premium: true, isB2B: true, isB2C: true,
      template: "premium", imageColor: "#db2777", emoji: "🎨",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "Blue Pottery Vase Set", price: "₹2,800", img: "🏺" },
        { name: "Marble Hand Carved Elephant", price: "₹4,500", img: "🐘" },
        { name: "Bandhani Saree Pure Silk", price: "₹6,200", img: "🥻" },
        { name: "Block Print Bed Sheet Set", price: "₹1,800", img: "🛏️" }
      ]), ownerId: owner.id
    },
    {
      name: "Jaipur Marwari Bhojanalay",
      description: "Traditional Rajasthani thali with unlimited servings of dal baati churma, gatte ki sabzi, ker sangri, and bajre ki roti. Pure veg family restaurant with rustic village ambience.",
      category: "Restaurants",
      subcategory: "Rajasthani",
      tags: "restaurant,rajasthani,thali,veg,traditional",
      phone: "+91 94130 50505",
      whatsapp: "+91 94130 50505",
      email: "marwari.bhojanalay@gmail.com",
      address: "Station Road, Sindhi Camp",
      city: "Jaipur", state: "Rajasthan", pincode: "302006",
      lat: 26.9236, lng: 75.7907,
      rating: 4.4, reviewCount: 312,
      verified: false, premium: false, isB2B: false, isB2C: true,
      template: "restaurant", imageColor: "#dc2626", emoji: "🍛",
      hours: HOURS_RESTAURANT, products: JSON.stringify([
        { name: "Special Rajasthani Thali", price: "₹320", img: "🍽️" },
        { name: "Dal Baati Churma", price: "₹240", img: "🟡" },
        { name: "Gatte Ki Sabzi + Bajre Roti", price: "₹190", img: "🥘" },
        { name: "Ghevar (Seasonal)", price: "₹180", img: "🥮" }
      ]), ownerId: owner.id
    },

    // ====== AHMEDABAD ======
    {
      name: "Law Garden Garments Hub",
      description: "Wholesale and retail of traditional Gujarati garments — chaniya choli, kedia, bandhani, and patola sarees. Special festival collections for Navratri. Bulk orders for dance troupes and event organisers.",
      category: "Textiles & Apparel",
      subcategory: "Ethnic Wear",
      tags: "garment,chaniya choli,bandhani,navratri,wholesale",
      phone: "+91 94260 60606",
      whatsapp: "+91 94260 60606",
      email: "lawgarden.garments@gmail.com",
      address: "Law Garden, Ellisbridge",
      city: "Ahmedabad", state: "Gujarat", pincode: "380006",
      lat: 23.0290, lng: 72.5280,
      rating: 4.3, reviewCount: 156,
      verified: false, premium: false, isB2B: true, isB2C: true,
      template: "retail", imageColor: "#7c3aed", emoji: "👗",
      hours: HOURS_RETAIL, products: JSON.stringify([
        { name: "Chaniya Choli (Navratri Special)", price: "₹2,800 onwards", img: "💃" },
        { name: "Bandhani Patola Saree", price: "₹4,500", img: "🥻" },
        { name: "Kurta Pajama Set", price: "₹1,200", img: "🧑" },
        { name: "Wholesale Lot (10 pieces)", price: "₹12,000", img: "📦" }
      ]), ownerId: owner.id
    },
    {
      name: "Manek Chowk Snacks Junction",
      description: "Famous street food joint serving legendary Punjabi samosa, khaman dhokla, fafda jalebi, and bhajiya. B2B catering for weddings, corporate events, and festive gatherings across Ahmedabad.",
      category: "Food & Sweets",
      subcategory: "Snacks & Street Food",
      tags: "snacks,street food,samosa,khaman,fafda,catering",
      phone: "+91 94270 70707",
      whatsapp: "+91 94270 70707",
      email: "manekchowk.snacks@gmail.com",
      address: "Manek Chowk Road, Khadia",
      city: "Ahmedabad", state: "Gujarat", pincode: "380001",
      lat: 23.0225, lng: 72.5714,
      rating: 4.5, reviewCount: 723,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "restaurant", imageColor: "#ea580c", emoji: "🥟",
      hours: HOURS_RESTAURANT, products: JSON.stringify([
        { name: "Punjabi Samosa (per piece)", price: "₹25", img: "🥟" },
        { name: "Khaman Dhokla 500g", price: "₹120", img: "🟡" },
        { name: "Fafda Jalebi Combo", price: "₹180", img: "🍯" },
        { name: "Wedding Catering Plate", price: "₹220/plate", img: "🍽️" }
      ]), ownerId: owner.id
    },

    // ===== REAL ESTATE =====
    {
      name: "Premium Properties India",
      description: "Verified residential and commercial property dealers. Buy, sell, rent — flats, plots, shops, offices. RERA registered. Loans and legal assistance tie-ups. Specialized in Mumbai, Pune, Bengaluru.",
      category: "Real Estate", subcategory: "Property Dealers",
      tags: "real estate,property,flats,plots,rent,buy,sell,rera",
      phone: "+91 98200 11122",
      whatsapp: "+91 98200 11122",
      email: "premium.properties@gmail.com",
      address: "Linking Road, Bandra West",
      city: "Mumbai", state: "Maharashtra", pincode: "400050",
      lat: 19.0610, lng: 72.8350,
      rating: 4.4, reviewCount: 312,
      verified: true, premium: true, isB2B: true, isB2C: true,
      template: "premium", imageColor: "#0891b2", emoji: "🏠",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "1BHK Flat Sale (Bandra)", price: "₹85 L onwards", img: "🏢" },
        { name: "Commercial Office Space", price: "₹45,000/month", img: "🏢" },
        { name: "Plot 1000sqft (Pune)", price: "₹35 L", img: "🏞️" },
        { name: "Property Legal Verification", price: "₹5,000", img: "📋" }
      ]), ownerId: owner.id
    },

    // ===== DOCTORS / HEALTHCARE =====
    {
      name: "Apollo Family Care Clinic",
      description: "Multi-speciality family clinic with experienced general physicians, pediatricians, and gynecologists. Online and in-person consultations. Home sample collection for lab tests. 24x7 emergency.",
      category: "Doctors", subcategory: "General Physicians",
      tags: "doctor,clinic,physician,pediatrician,healthcare,consultation",
      phone: "+91 98330 22233",
      whatsapp: "+91 98330 22233",
      email: "apollo.familycare@gmail.com",
      address: "Andheri West, SV Road",
      city: "Mumbai", state: "Maharashtra", pincode: "400058",
      lat: 19.1197, lng: 72.8468,
      rating: 4.6, reviewCount: 421,
      verified: true, premium: false, isB2B: false, isB2C: true,
      template: "service", imageColor: "#15803d", emoji: "⚕️",
      hours: HOURS_SERVICE, products: JSON.stringify([
        { name: "General Consultation", price: "₹500", img: "👨‍⚕️" },
        { name: "Pediatric Consultation", price: "₹700", img: "👶" },
        { name: "Home Blood Sample Collection", price: "₹300", img: "🩸" },
        { name: "Annual Health Checkup Package", price: "₹3,999", img: "📋" }
      ]), ownerId: owner.id
    },

    // ===== WEDDING PLANNING =====
    {
      name: "Royal Wedding Planners",
      description: "Complete wedding planning and management services. Theme decor, catering, photography, mehendi artists, bridal makeup, DJ, venue booking. Specialised in Gujarati, Marwari, and South Indian weddings.",
      category: "Wedding Planning", subcategory: "Wedding Planners",
      tags: "wedding,planning,catering,decor,photography,bridal,mehendi",
      phone: "+91 94140 40404",
      whatsapp: "+91 94140 40404",
      email: "royal.weddings@gmail.com",
      address: "MI Road, Near Ajmeri Gate",
      city: "Jaipur", state: "Rajasthan", pincode: "302001",
      lat: 26.9145, lng: 75.7870,
      rating: 4.7, reviewCount: 156,
      verified: true, premium: true, isB2B: true, isB2C: true,
      template: "premium", imageColor: "#c026d3", emoji: "💍",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "Complete Wedding Package (2-day)", price: "₹3,50,000 onwards", img: "💍" },
        { name: "Theme Decor & Flowers", price: "₹75,000 onwards", img: "💐" },
        { name: "Candid Photography + Video", price: "₹45,000", img: "📸" },
        { name: "Bridal Makeup Trial", price: "₹2,500", img: "👰" }
      ]), ownerId: owner.id
    },

    // ===== EDUCATION =====
    {
      name: "Bright Future Coaching Classes",
      description: "Premier coaching institute for JEE, NEET, CET, and board exams (CBSE/ICSE/State). Experienced faculty, small batches, regular tests, and doubt-solving sessions. Online + offline modes.",
      category: "Education", subcategory: "Coaching Institutes",
      tags: "education,coaching,jee,neet,cet,tuition,classes",
      phone: "+91 80440 30303",
      whatsapp: "+91 80440 30303",
      email: "brightfuture.classes@gmail.com",
      address: "Brigade Road, Ashoka Nagar",
      city: "Bengaluru", state: "Karnataka", pincode: "560025",
      lat: 12.9716, lng: 75.6060,
      rating: 4.5, reviewCount: 289,
      verified: true, premium: false, isB2B: false, isB2C: true,
      template: "service", imageColor: "#7c3aed", emoji: "🎓",
      hours: HOURS_SERVICE, products: JSON.stringify([
        { name: "JEE 1-Year Program", price: "₹65,000", img: "📚" },
        { name: "NEET Crash Course (3 months)", price: "₹35,000", img: "🩺" },
        { name: "Class 10 Tuition (All subjects)", price: "₹2,500/month", img: "📖" },
        { name: "Online Test Series (1 year)", price: "₹4,500", img: "💻" }
      ]), ownerId: owner.id
    },

    // ===== TRAVEL BOOKING =====
    {
      name: "MakeMyTrip Verified Travel Agent",
      description: "Authorized travel agent for flight bookings, hotel reservations, holiday packages, and visa assistance. Best deals on domestic & international flights. Group booking discounts available.",
      category: "Travel Booking", subcategory: "Travel Agents",
      tags: "travel,flights,hotels,holiday package,visa,train,bus",
      phone: "+91 98100 55555",
      whatsapp: "+91 98100 55555",
      email: "travels.mmt.agent@gmail.com",
      address: "Connaught Place, Block C",
      city: "Delhi", state: "Delhi", pincode: "110001",
      lat: 28.6315, lng: 77.2167,
      rating: 4.5, reviewCount: 567,
      verified: true, premium: true, isB2B: false, isB2C: true,
      template: "premium", imageColor: "#0e7490", emoji: "✈️",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "Mumbai to Goa Flight (Round trip)", price: "₹4,500 onwards", img: "✈️" },
        { name: "Goa Holiday Package (3N/4D)", price: "₹12,999/person", img: "🏖️" },
        { name: "Hotel Booking (3-star)", price: "₹1,800/night", img: "🏨" },
        { name: "Visa Assistance (Tourist)", price: "₹2,500", img: "📋" }
      ]), ownerId: owner.id
    },

    // ===== B2B SUPPLIERS (more) =====
    {
      name: "Mahalaxmi Steel Industries",
      description: "B2B manufacturer and wholesale supplier of TMT steel bars, MS angles, channels, and structural steel. ISO 9001 certified. Bulk supply to construction companies, fabricators, and infrastructure projects.",
      category: "B2B Suppliers", subcategory: "Steel & Metals",
      tags: "b2b,steel,tmt bars,wholesale,manufacturer,construction",
      phone: "+91 98330 33333",
      whatsapp: "+91 98330 33333",
      email: "sales@mahalaxmi.steel.in",
      website: "https://mahalaxmi-steel.in",
      address: "Kurla Industrial Estate",
      city: "Mumbai", state: "Maharashtra", pincode: "400070",
      lat: 19.0736, lng: 72.8858,
      rating: 4.4, reviewCount: 198,
      verified: true, premium: true, isB2B: true, isB2C: false,
      template: "premium", imageColor: "#475569", emoji: "🏭",
      hours: HOURS_PREMIUM, products: JSON.stringify([
        { name: "TMT Steel Bars Fe500 12mm (per ton)", price: "₹58,500", img: "🔩" },
        { name: "MS Angle 50x50x6mm (per ton)", price: "₹52,000", img: "📐" },
        { name: "GI Wire Mesh Roll", price: "₹1,800", img: "🕸️" },
        { name: "Bulk Order Quotation (10+ tons)", price: "On request", img: "📋" }
      ]), ownerId: owner.id
    },

    // ===== REPAIR SERVICES (Plumber + Electrician) =====
    {
      name: "QuickFix Home Repairs",
      description: "Trusted home repair service for plumbing, electrical, carpentry, and pest control. Verified technicians, transparent pricing, 30-day service warranty. Same-day service available in metro cities.",
      category: "Repair Services", subcategory: "Home Repair",
      tags: "repair,plumber,electrician,carpenter,pest control,home service",
      phone: "+91 94260 60606",
      whatsapp: "+91 94260 60606",
      email: "quickfix.repairs@gmail.com",
      address: "Satellite Road, Vastrapur",
      city: "Ahmedabad", state: "Gujarat", pincode: "380015",
      lat: 23.0379, lng: 72.5290,
      rating: 4.3, reviewCount: 234,
      verified: true, premium: false, isB2B: true, isB2C: true,
      template: "service", imageColor: "#dc2626", emoji: "🔧",
      hours: HOURS_SERVICE, products: JSON.stringify([
        { name: "Plumber Visit (within 1 hr)", price: "₹299 onwards", img: "🚿" },
        { name: "Electrician Service", price: "₹349 onwards", img: "💡" },
        { name: "Carpenter Repair", price: "₹399 onwards", img: "🪚" },
        { name: "Pest Control (1BHK)", price: "₹1,200", img: "🐛" }
      ]), ownerId: owner.id
    }
  ]

  for (const b of businesses) {
    await db.business.create({ data: b })
  }

  // Add some reviews
  const reviews = [
    { userName: "Raj Kumar", rating: 5, comment: "Excellent service and quality products. Highly recommended!" },
    { userName: "Priya Sharma", rating: 4, comment: "Good experience overall. Staff was helpful." },
    { userName: "Amit Patel", rating: 5, comment: "Best in the area. Will visit again for sure." },
    { userName: "Sneha Reddy", rating: 4, comment: "Decent prices and quick service." },
    { userName: "Mohammed Khan", rating: 5, comment: "Premium quality at fair price. Owner is very professional." }
  ]

  const allBusinesses = await db.business.findMany()
  for (const biz of allBusinesses) {
    const reviewCount = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < reviewCount; i++) {
      const r = reviews[Math.floor(Math.random() * reviews.length)]
      await db.review.create({
        data: {
          ...r,
          businessId: biz.id,
          userId: customer.id
        }
      })
    }
  }

  // === Add profile images + website templates for premium businesses ===
  console.log('🖼️  Adding profile images to premium businesses...')

  const premiumUpdates = [
    { name: 'Bawarchi Restaurant', profileImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', template: 'bold' },
    { name: 'Mumbai Wholesale Textiles', profileImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80', template: 'elegant' },
    { name: 'Chandni Chowk Sweets & Snacks', profileImage: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=600&q=80', template: 'classic' },
    { name: 'Indiranagar Coffee Roasters', profileImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', template: 'boutique' },
    { name: 'Brigade Road Premium Salon', profileImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80', template: 'elegant' },
    { name: 'Delhi Ayurveda Wellness Clinic', profileImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80', template: 'classic' },
    { name: 'Pink City Handicrafts Emporium', profileImage: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80', template: 'boutique' },
    { name: 'Royal Wedding Planners', profileImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', template: 'elegant' },
    { name: 'Premium Properties India', profileImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80', template: 'classic' },
    { name: 'MakeMyTrip Verified Travel Agent', profileImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80', template: 'bold' },
    { name: 'Mahalaxmi Steel Industries', profileImage: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80', template: 'classic' },
    { name: 'Apollo Family Care Clinic', profileImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80', template: 'elegant' }
  ]

  for (const upd of premiumUpdates) {
    const biz = await db.business.findFirst({ where: { name: upd.name } })
    if (biz) {
      await db.business.update({
        where: { id: biz.id },
        data: {
          profileImage: upd.profileImage,
          websiteTemplate: upd.template,
          imageUrls: upd.profileImage // also set as gallery image
        }
      })
    }
  }

  // Enable live tracking for a few businesses
  const liveTrackingBusinesses = ['CoolCare AC & Refrigeration', 'QuickFix Home Repairs', 'Spice Junction Pure Veg']
  for (const name of liveTrackingBusinesses) {
    const biz = await db.business.findFirst({ where: { name } })
    if (biz) {
      await db.business.update({ where: { id: biz.id }, data: { liveTracking: true } })
    }
  }

  console.log(`✅ Seeded ${businesses.length} businesses, 2 users, and reviews`)
  console.log(`   Customer login: raj@businesshub.in / demo123`)
  console.log(`   Owner login:    owner@businesshub.in / demo123`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
