'use client'

import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Store, ShoppingBag, Building2, Users, MapPin, Star, ShieldCheck, Crown,
  TrendingUp, Cake, Heart, Wrench, Plane, Car, Train, Hotel, Bus, Calendar,
  Factory, Smartphone, Briefcase, Utensils, Scissors, GraduationCap, Activity,
  ChevronRight, Sparkles, Award, Clock, Tag, ArrowRight, Truck, IndianRupee,
  Package, Layers, Wheat, Sparkle
} from 'lucide-react'

// 12 colorful category tiles like Sulekha's grid
const CATEGORY_TILES = [
  { name: 'B2B Suppliers', emoji: '🏭', color: '#0284c7', bg: '#e0f2fe' },
  { name: 'Repair Services', emoji: '🔧', color: '#dc2626', bg: '#fee2e2' },
  { name: 'Real Estate', emoji: '🏠', color: '#16a34a', bg: '#dcfce7' },
  { name: 'Doctors', emoji: '⚕️', color: '#0891b2', bg: '#cffafe' },
  { name: 'Beauty & Spa', emoji: '💇', color: '#be185d', bg: '#fce7f3' },
  { name: 'Wedding Planning', emoji: '💍', color: '#c026d3', bg: '#fae8ff' },
  { name: 'Restaurants', emoji: '🍽️', color: '#ea580c', bg: '#ffedd5' },
  { name: 'Home Services', emoji: '🛠️', color: '#15803d', bg: '#f0fdf4' },
  { name: 'Education', emoji: '🎓', color: '#7c3aed', bg: '#ede9fe' },
  { name: 'Travel Booking', emoji: '✈️', color: '#0e7490', bg: '#ecfeff' },
  { name: 'Electronics', emoji: '📱', color: '#1e40af', bg: '#dbeafe' },
  { name: 'Automobile', emoji: '🚗', color: '#475569', bg: '#f1f5f9' }
]

// IndiaMART-style trending products
const TRENDING_PRODUCTS = [
  { name: 'Premium Basmati Rice 5kg', price: '₹450', supplier: 'Sharma Kirana', city: 'Mumbai', emoji: '🍚', color: '#16a34a' },
  { name: 'Hyderabadi Dum Biryani', price: '₹320', supplier: 'Bawarchi Restaurant', city: 'Mumbai', emoji: '🍛', color: '#dc2626' },
  { name: 'Pure Silk Bandhani Saree', price: '₹4,500', supplier: 'Law Garden Garments', city: 'Ahmedabad', emoji: '🥻', color: '#7c3aed' },
  { name: 'Bosch Spark Plug Set', price: '₹1,200', supplier: 'Karol Bagh Auto Parts', city: 'Delhi', emoji: '🔌', color: '#475569' },
  { name: 'Coorg Arabica Coffee 250g', price: '₹520', supplier: 'Indiranagar Coffee', city: 'Bengaluru', emoji: '☕', color: '#92400e' },
  { name: 'Motichoor Laddu 1kg', price: '₹640', supplier: 'Chandni Chowk Sweets', city: 'Delhi', emoji: '🟡', color: '#c026d3' },
  { name: 'AC Service & Repair', price: '₹499+', supplier: 'CoolCare AC', city: 'Mumbai', emoji: '❄️', color: '#0891b2' },
  { name: 'Blue Pottery Vase Set', price: '₹2,800', supplier: 'Pink City Handicrafts', city: 'Jaipur', emoji: '🏺', color: '#db2777' },
  { name: 'Samsung Galaxy M14', price: '₹13,499', supplier: 'Lajpat Electronics', city: 'Delhi', emoji: '📱', color: '#0284c7' },
  { name: 'Organic Vegetables (Daily)', price: '₹40/kg', supplier: 'Jayanagar Fresh Veg', city: 'Bengaluru', emoji: '🥬', color: '#16a34a' },
  { name: 'Bridal Lehenga Collection', price: '₹45,000+', supplier: 'Brigade Salon', city: 'Bengaluru', emoji: '👗', color: '#be185d' },
  { name: 'Marble Hand Carved Elephant', price: '₹4,500', supplier: 'Pink City Handicrafts', city: 'Jaipur', emoji: '🐘', color: '#db2777' }
]

// Sulekha-style thematic zones
const THEMATIC_ZONES = [
  {
    title: 'Wedding Planning',
    emoji: '💍',
    color: '#c026d3',
    gradient: 'from-fuchsia-500 to-pink-600',
    services: ['Caterers', 'Photographers', 'Decorators', 'Makeup Artists', 'Wedding Cards', 'Tents']
  },
  {
    title: 'Beauty & Spa',
    emoji: '💇',
    color: '#be185d',
    gradient: 'from-pink-500 to-rose-600',
    services: ['Salons', 'Spa & Massage', 'Hair Stylists', 'Bridal Makeup', 'Tattoo Artists', 'Nail Care']
  },
  {
    title: 'Daily Needs',
    emoji: '🛒',
    color: '#16a34a',
    gradient: 'from-emerald-500 to-green-600',
    services: ['Grocery', 'Vegetables', 'Milk Delivery', 'Pharmacies', 'Bakeries', 'Laundry']
  },
  {
    title: 'Travel Booking',
    emoji: '✈️',
    color: '#0e7490',
    gradient: 'from-cyan-500 to-blue-600',
    services: ['Flights', 'Hotels', 'Bus Tickets', 'Train Tickets', 'Car Rental', 'Holiday Packages']
  }
]

// IndiaMART-style industries
const INDUSTRIES = [
  { name: 'Agriculture & Farming', emoji: '🌾', count: '2.4L+' },
  { name: 'Apparel & Textiles', emoji: '🧵', count: '4.8L+' },
  { name: 'Automobile Parts', emoji: '🚗', count: '3.1L+' },
  { name: 'Chemicals & Dyes', emoji: '⚗️', count: '1.9L+' },
  { name: 'Construction Materials', emoji: '🏗️', count: '5.2L+' },
  { name: 'Electronics & Electrical', emoji: '🔌', count: '6.7L+' },
  { name: 'Food & Beverages', emoji: '🍔', count: '8.3L+' },
  { name: 'Healthcare & Medical', emoji: '⚕️', count: '2.6L+' },
  { name: 'Heavy Machinery', emoji: '⚙️', count: '1.4L+' },
  { name: 'Home & Lifestyle', emoji: '🛋️', count: '4.1L+' },
  { name: 'Packaging & Printing', emoji: '📦', count: '2.2L+' },
  { name: 'Plastic & Rubber', emoji: '🧴', count: '1.8L+' }
]

// Top cities (Sulekha-style)
const TOP_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', businesses: '12.4L+', emoji: '🏙️' },
  { name: 'Delhi', state: 'Delhi', businesses: '15.2L+', emoji: '🏛️' },
  { name: 'Bengaluru', state: 'Karnataka', businesses: '9.8L+', emoji: '🌆' },
  { name: 'Pune', state: 'Maharashtra', businesses: '6.5L+', emoji: '⛰️' },
  { name: 'Hyderabad', state: 'Telangana', businesses: '7.2L+', emoji: '🕌' },
  { name: 'Ahmedabad', state: 'Gujarat', businesses: '5.4L+', emoji: '🛕' },
  { name: 'Chennai', state: 'Tamil Nadu', businesses: '6.8L+', emoji: '🏖️' },
  { name: 'Jaipur', state: 'Rajasthan', businesses: '3.7L+', emoji: '🏰' }
]

interface Props {
  businesses: Business[]
  onCategoryPick: (cat: string) => void
  onBusinessPick: (id: string) => void
}

export function HomeSections({ businesses, onCategoryPick, onBusinessPick }: Props) {
  const { t } = useI18n()

  // Pick featured businesses (premium first, then by rating)
  const featured = [...businesses]
    .sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0) || b.rating - a.rating)
    .slice(0, 8)

  return (
    <div className="space-y-8">
      {/* ===== IndiaMART-style Stats Banner ===== */}
      <section className="bg-gradient-to-br from-navy via-navy to-blue-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        {/* Yellow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-amber-400 to-brand" />

        <div className="relative text-center max-w-3xl mx-auto">
          <Badge className="inline-flex items-center gap-1 mb-3 bg-brand/90 text-brand-foreground hover:bg-brand/90 font-bold">
            <Sparkles className="w-3 h-3" />
            INDIA'S LARGEST B2B + B2C MARKETPLACE
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black mb-3 leading-tight">
            Search across <span className="text-brand">5.8 Crore+</span> Businesses
          </h1>
          <p className="text-sm sm:text-base text-white/80 mb-6 max-w-2xl mx-auto">
            Find verified suppliers, wholesalers, manufacturers, retailers near you with live map location.
            Get instant best price quotes from trusted businesses.
          </p>

          {/* Stats grid - IndiaMART style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Users, value: '10K+', label: 'Verified Businesses', color: 'text-brand' },
              { icon: MapPin, value: '50+', label: 'Cities Covered', color: 'text-blue-300' },
              { icon: Package, value: '12Cr+', label: 'Products & Services', color: 'text-emerald-300' },
              { icon: Award, value: '30 yrs', label: 'Empowering India', color: 'text-amber-300' }
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/15">
                  <Icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
                  <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wide font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== Sulekha-style Category Icon Grid ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" />
              Browse by Category
            </h2>
            <p className="text-xs text-muted-foreground">Popular categories across India</p>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 font-semibold text-xs">
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {CATEGORY_TILES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => onCategoryPick(cat.name)}
              className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform"
                style={{ background: cat.bg }}
              >
                {cat.emoji}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-navy text-center leading-tight">{cat.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ===== IndiaMART-style Trending Products ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-inquiry" />
              Trending on BusinessHub
            </h2>
            <p className="text-xs text-muted-foreground">Most searched products & services this week</p>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 font-semibold text-xs">
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TRENDING_PRODUCTS.map((p, i) => (
            <button
              key={i}
              onClick={() => onBusinessPick(featured[i % featured.length]?.id || '')}
              className="group bg-card border border-border/70 rounded-lg overflow-hidden hover:shadow-md hover:border-brand/40 transition-all text-left"
            >
              {/* Product image area */}
              <div
                className="relative h-24 sm:h-28 flex items-center justify-center text-5xl sm:text-6xl"
                style={{ background: `${p.color}15` }}
              >
                {p.emoji}
                <Badge className="absolute top-1.5 right-1.5 bg-inquiry text-inquiry-foreground hover:bg-inquiry text-[9px] font-bold px-1.5 py-0">
                  <Tag className="w-2 h-2 mr-0.5" />
                  BEST PRICE
                </Badge>
                <div className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-foreground bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
                  {p.city}
                </div>
              </div>
              {/* Product info */}
              <div className="p-2.5">
                <div className="font-bold text-xs text-navy line-clamp-1 group-hover:text-brand transition-colors">
                  {p.name}
                </div>
                <div className="text-[11px] text-inquiry font-bold mt-0.5">{p.price}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  by {p.supplier}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ===== Sulekha-style Thematic Zones ===== */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" />
            Explore by Need
          </h2>
          <p className="text-xs text-muted-foreground">Discover services for every life moment</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {THEMATIC_ZONES.map((zone) => (
            <Card
              key={zone.title}
              className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${zone.gradient} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{zone.emoji}</div>
                  <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-base mt-2">{zone.title}</div>
              </div>
              {/* Services list */}
              <div className="p-3 bg-card">
                <div className="space-y-1.5">
                  {zone.services.map((svc) => (
                    <button
                      key={svc}
                      onClick={() => onCategoryPick(zone.title)}
                      className="flex items-center justify-between w-full text-xs hover:text-blue-700 transition-colors group/item"
                    >
                      <span className="font-medium text-foreground/85 group-hover/item:text-blue-700">{svc}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 text-blue-700" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== Featured Businesses (Live from DB) ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Featured Premium Businesses
            </h2>
            <p className="text-xs text-muted-foreground">Verified & trusted suppliers near you</p>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 font-semibold text-xs">
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.map((b) => (
              <button
                key={b.id}
                onClick={() => onBusinessPick(b.id)}
                className="bg-card border border-border/70 rounded-lg overflow-hidden hover:shadow-md hover:border-brand/40 transition-all text-left group"
              >
                <div
                  className="relative h-20 flex items-center justify-center text-4xl"
                  style={{ background: `linear-gradient(135deg, ${b.imageColor} 0%, ${b.imageColor}dd 100%)` }}
                >
                  {b.emoji}
                  {b.verified && (
                    <Badge className="absolute top-1.5 left-1.5 bg-white/95 text-verified hover:bg-white/95 text-[9px] font-bold">
                      <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                      VERIFIED
                    </Badge>
                  )}
                  {b.premium && (
                    <Badge className="absolute top-1.5 right-1.5 bg-amber-500 text-white hover:bg-amber-500 text-[9px] font-bold">
                      <Crown className="w-2.5 h-2.5 mr-0.5" />
                      PREMIUM
                    </Badge>
                  )}
                </div>
                <div className="p-2.5">
                  <div className="font-bold text-xs text-navy line-clamp-1 group-hover:text-brand transition-colors">
                    {b.name}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] mt-1">
                    <Star className="w-2.5 h-2.5 fill-brand text-brand" />
                    <span className="font-bold">{b.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({b.reviewCount})</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {b.city}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {/* ===== Travel Booking Quick Links (Sulekha-style) ===== */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-5 border border-blue-100">
        <h2 className="text-base sm:text-lg font-bold text-navy mb-3 flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-700" />
          Book Travel & Tickets
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { icon: Plane, label: 'Flights', color: '#0284c7' },
            { icon: Hotel, label: 'Hotels', color: '#7c3aed' },
            { icon: Bus, label: 'Bus', color: '#16a34a' },
            { icon: Train, label: 'Trains', color: '#dc2626' },
            { icon: Car, label: 'Car Rental', color: '#ea580c' }
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className="flex flex-col items-center gap-2 p-3 bg-card rounded-lg hover:shadow-md transition-all border border-border/50 hover:border-blue-300"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-navy">{item.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ===== IndiaMART-style Explore by Industry ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-700" />
              Explore by Industry
            </h2>
            <p className="text-xs text-muted-foreground">Browse B2B suppliers by industry verticals</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.name}
              className="group flex items-center gap-3 p-3 bg-card border border-border/60 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-soft flex items-center justify-center text-xl flex-shrink-0">
                {ind.emoji}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-xs text-navy group-hover:text-blue-700 transition-colors line-clamp-1">
                  {ind.name}
                </div>
                <div className="text-[10px] text-muted-foreground">{ind.count} suppliers</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-700 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* ===== Top Cities (Sulekha-style) ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-navy flex items-center gap-2">
              <MapPin className="w-5 h-5 text-inquiry" />
              Popular Cities
            </h2>
            <p className="text-xs text-muted-foreground">Find businesses across India's top cities</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {TOP_CITIES.map((city) => (
            <button
              key={city.name}
              className="group bg-card border border-border/70 rounded-lg p-3 hover:shadow-md hover:border-inquiry/40 transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy to-blue-700 flex items-center justify-center text-xl flex-shrink-0">
                {city.emoji}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-sm text-navy group-hover:text-inquiry transition-colors">
                  {city.name}
                </div>
                <div className="text-[10px] text-muted-foreground">{city.state}</div>
                <div className="text-[10px] text-blue-700 font-bold mt-0.5">{city.businesses} businesses</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-inquiry transition-colors" />
            </button>
          ))}
        </div>
      </section>

      {/* ===== Trust Badges Row (IndiaMART style) ===== */}
      <section className="bg-gradient-to-r from-navy to-blue-900 rounded-xl p-5 text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, label: 'Verified Suppliers', desc: 'TrustSEAL verified businesses' },
            { icon: Tag, label: 'Best Price Quotes', desc: 'Get instant quotes from multiple sellers' },
            { icon: MapPin, label: 'Live Map Location', desc: 'See businesses near you on map' },
            { icon: Clock, label: 'Quick Response', desc: 'Avg 2-hour response time' }
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-[10px] text-white/70 leading-tight mt-0.5">{item.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
