'use client'

// Premium marketplace home. Everything shown here is driven by live data:
// category counts, catalog products, businesses, subcategories and cities all
// come from the listings API, so every tile opens a result the visitor can
// actually browse. No dead links, no invented numbers.

import { useMemo, useState } from 'react'
import type { Business } from '@/store/app'
import { Button } from '@/components/ui/button'
import { categoryVisual } from '@/lib/category-visuals'
import { parseProducts, productEmoji, productImage } from '@/lib/products'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Car,
  ChevronRight,
  Coffee,
  Crown,
  Factory,
  Gem,
  Globe,
  Hammer,
  HeartPulse,
  IndianRupee,
  Landmark,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Navigation,
  Package,
  Palette,
  Plane,
  Search,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Wheat,
  Wrench,
  type LucideIcon
} from 'lucide-react'

export interface HomeCategory {
  name: string
  emoji?: string
  count: number
  subcategories?: string[]
}

interface Props {
  businesses: Business[]
  categories?: HomeCategory[]
  onCategoryPick: (cat: string) => void
  onBusinessPick: (id: string) => void
  onSearchByTag?: (tag: string) => void
  onSearchByCity?: (city: string) => void
  onGoToTab?: (tab: 'discover' | 'map' | 'categories') => void
  onBrowseAll?: () => void
  /** Hero search; both values are applied together. */
  onSearch?: (query: string, city: string) => void
  /** Applies any combination of search / city / category filters. */
  onExplore?: (filters: { q?: string; city?: string; category?: string }) => void
}

type Filter = { q?: string; city?: string; category?: string }

// Category-level photography used when a catalogue item has no image of its
// own. Keeps industrial listings from inheriting an unrelated business cover.
const PRODUCT_IMAGE_BY_CATEGORY: Record<string, string> = {
  'B2B Suppliers': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80'
}

const TEXT_KEYS = (b: Business) => [
  b.name,
  b.description,
  b.category,
  b.subcategory || '',
  b.tags,
  b.city,
  b.address,
  b.state
]

function businessMatches(b: Business, filter: Filter): boolean {
  if (filter.category && filter.category !== 'All' && b.category !== filter.category) return false
  if (filter.city && !String(b.city || '').toLowerCase().includes(filter.city.toLowerCase())) return false
  if (filter.q) {
    const hay = TEXT_KEYS(b).join(' ').toLowerCase()
    if (!hay.includes(filter.q.toLowerCase())) return false
  }
  return true
}

const ZONES: Array<{
  title: string
  subtitle: string
  icon: LucideIcon
  gradient: string
  category: string
  services: string[]
}> = [
  {
    title: 'Weddings & celebrations',
    subtitle: 'Planners, mithai, outfits & decor',
    icon: Gem,
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
    category: 'Wedding Planning',
    services: ['Wedding Planners', 'Mithai Shops', 'Ethnic Wear', 'Premium Salons', 'Handicraft Exporters']
  },
  {
    title: 'Beauty & wellness',
    subtitle: 'Salons, clinics & self-care',
    icon: HeartPulse,
    gradient: 'from-rose-500 via-pink-600 to-fuchsia-700',
    category: 'Beauty & Personal Care',
    services: ['Premium Salons', 'Ayurvedic Clinics', 'General Physicians']
  },
  {
    title: 'Home & repairs',
    subtitle: 'Fix, furnish & move in',
    icon: Wrench,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    category: 'Home Services',
    services: ['Appliance Repair', 'Home Repair', 'Mobile Repair', 'Steel & Metals', 'Property Dealers']
  },
  {
    title: 'Food & dining',
    subtitle: 'Every craving, close to home',
    icon: UtensilsCrossed,
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    category: 'Restaurants',
    services: ['Mughlai', 'Pure Veg', 'Rajasthani', 'Multi-cuisine', 'Coffee Roasters', 'Cafe']
  }
]

const INDUSTRIES: Array<{ name: string; icon: LucideIcon; filter: Filter }> = [
  { name: 'Agriculture & Farming', icon: Wheat, filter: { q: 'vegetable' } },
  { name: 'Apparel & Textiles', icon: Shirt, filter: { category: 'Textiles & Apparel' } },
  { name: 'Automobile Parts', icon: Car, filter: { category: 'Automobile' } },
  { name: 'Construction Materials', icon: Building2, filter: { q: 'steel' } },
  { name: 'Electronics & Electrical', icon: Smartphone, filter: { category: 'Electronics' } },
  { name: 'Food & Beverages', icon: Coffee, filter: { category: 'Food & Beverages' } },
  { name: 'Healthcare & Medical', icon: Stethoscope, filter: { category: 'Health & Wellness' } },
  { name: 'Home & Lifestyle', icon: Palette, filter: { category: 'Handicrafts & Art' } },
  { name: 'Packaging & Printing', icon: Package, filter: { q: 'wholesale' } },
  { name: 'Hospitality & Travel', icon: Plane, filter: { category: 'Travel Booking' } },
  { name: 'Repair & Maintenance', icon: Hammer, filter: { category: 'Repair Services' } },
  { name: 'Real Estate & Property', icon: Landmark, filter: { category: 'Real Estate' } }
]

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  onViewAll
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  subtitle: string
  onViewAll?: () => void
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-brand">
          <Icon className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
        <h2 className="text-xl font-black tracking-tight text-navy sm:text-2xl">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="group inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-sm transition-all hover:border-brand hover:text-brand hover:shadow-md"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  )
}

function CoverFallback({ business }: { business: Business }) {
  const visual = categoryVisual(business.category)
  const Icon = visual.icon
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${visual.color} 0%, ${visual.color}cc 55%, #0f172a 100%)`
      }}
    >
      <Icon className="h-16 w-16 text-white/85" />
    </div>
  )
}

export function HomeSections({
  businesses,
  categories,
  onCategoryPick,
  onBusinessPick,
  onSearchByTag,
  onSearchByCity,
  onGoToTab,
  onBrowseAll,
  onSearch,
  onExplore
}: Props) {
  const [heroQuery, setHeroQuery] = useState('')
  const [heroCity, setHeroCity] = useState('')

  // Category list: prefer the live API categories, fall back to the loaded
  // listings so the home never renders an empty grid while data is loading.
  const categoryList = useMemo<HomeCategory[]>(() => {
    if (categories && categories.length > 0) return categories
    const map = new Map<string, number>()
    for (const b of businesses) map.set(b.category, (map.get(b.category) || 0) + 1)
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [categories, businesses])

  const liveCategories = useMemo(
    () => categoryList.filter((c) => c.count > 0).sort((a, b) => b.count - a.count).slice(0, 12),
    [categoryList]
  )

  const featured = useMemo(
    () =>
      [...businesses]
        .sort(
          (a, b) =>
            (b.premium ? 1 : 0) - (a.premium ? 1 : 0) ||
            (b.verified ? 1 : 0) - (a.verified ? 1 : 0) ||
            b.rating - a.rating
        )
        .slice(0, 8),
    [businesses]
  )

  const spotlight = featured[0]

  // Real catalogue products, one per business, so "Trending" is never filler.
  const deals = useMemo(() => {
    const list: Array<{
      name: string
      price: string
      emoji: string
      image: string | null
      businessId: string
      businessName: string
      category: string
      city: string
    }> = []
    const seen = new Set<string>()
    const ordered = [...featured, ...businesses].filter((b) => {
      if (seen.has(b.id)) return false
      seen.add(b.id)
      return true
    })
    for (const b of ordered) {
      const products = parseProducts(b.products)
      for (const p of products) {
        const name = String(p.name ?? '').trim()
        if (!name) continue
        list.push({
          name,
          price: String(p.price ?? '').trim(),
          emoji: productEmoji(p, '🛍️'),
          image: productImage(p) || PRODUCT_IMAGE_BY_CATEGORY[b.category] || b.profileImage || null,
          businessId: b.id,
          businessName: b.name,
          category: b.category,
          city: b.city
        })
        break
      }
      if (list.length >= 12) break
    }
    return list
  }, [businesses, featured])


  const stats = useMemo(() => {
    const verified = businesses.filter((b) => b.verified).length
    const cities = new Set(businesses.map((b) => b.city).filter(Boolean))
    const reviews = businesses.reduce((sum, b) => sum + (Number(b.reviewCount) || 0), 0)
    return { total: businesses.length, verified, cities: cities.size, reviews }
  }, [businesses])

  const cities = useMemo(() => {
    const map = new Map<string, { count: number; state: string }>()
    for (const b of businesses) {
      if (!b.city) continue
      const entry = map.get(b.city)
      if (entry) entry.count += 1
      else map.set(b.city, { count: 1, state: b.state || '' })
    }
    return Array.from(map.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [businesses])

  const quickServices = useMemo(() => {
    const map = new Map<string, { count: number; category: string }>()
    for (const b of businesses) {
      const sub = String(b.subcategory || '').trim()
      if (!sub) continue
      const entry = map.get(sub)
      if (entry) entry.count += 1
      else map.set(sub, { count: 1, category: b.category })
    }
    return Array.from(map.entries())
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [businesses])

  const explore = (filters: Filter) => {
    if (onExplore) {
      onExplore(filters)
      return
    }
    // Backwards-compatible fallbacks for older callers.
    if (filters.category) onCategoryPick(filters.category)
    if (filters.q !== undefined && onSearchByTag) onSearchByTag(filters.q)
    if (filters.city !== undefined && onSearchByCity) onSearchByCity(filters.city)
  }

  const submitHeroSearch = () => {
    const q = heroQuery.trim()
    const city = heroCity.trim()
    if (!q && !city) {
      if (onBrowseAll) onBrowseAll()
      return
    }
    if (onSearch) {
      onSearch(q, city)
      return
    }
    if (onSearchByTag) onSearchByTag(q)
    if (onSearchByCity) onSearchByCity(city)
  }

  const heroCategories = liveCategories.slice(0, 4)

  return (
    <div className="space-y-10">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-navy text-white shadow-2xl shadow-navy/20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '26px 26px'
          }}
        />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-amber-300 to-brand" />

        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand">
              <Sparkles className="h-3 w-3" />
              India&apos;s B2B + B2C marketplace
            </span>

            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Find trusted businesses.
              <span className="block text-brand">Get the best price.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Verified shops, suppliers and service pros across India — with live map location,
              real reviews, direct WhatsApp contact and a free website for every listing.
            </p>

            {/* Premium search card */}
            <div className="mt-6 rounded-2xl bg-white p-1.5 shadow-2xl shadow-black/25 ring-1 ring-white/40">
              <div className="flex flex-col gap-1.5 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 sm:py-0">
                  <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <input
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitHeroSearch()}
                    placeholder="Search products, services, suppliers..."
                    aria-label="Search businesses"
                    className="h-9 w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-xl border-t border-border px-3 py-2 sm:border-l sm:border-t-0 sm:py-0">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <input
                    value={heroCity}
                    onChange={(e) => setHeroCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitHeroSearch()}
                    placeholder="City or area"
                    aria-label="City"
                    className="h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-28"
                  />
                </div>
                <Button
                  type="button"
                  onClick={submitHeroSearch}
                  className="h-11 rounded-xl bg-brand px-6 text-sm font-black text-brand-foreground shadow-lg shadow-brand/25 transition-transform hover:scale-[1.02] hover:bg-brand/90"
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Quick category chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                Popular:
              </span>
              {heroCategories.map((c) => {
                const visual = categoryVisual(c.name)
                const Icon = visual.icon
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => explore({ category: c.name })}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80 transition-colors hover:border-brand/50 hover:bg-brand/15 hover:text-white"
                  >
                    <Icon className="h-3 w-3" style={{ color: visual.color }} />
                    {c.name}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => onGoToTab?.('categories')}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-brand transition-colors hover:text-amber-300"
              >
                All categories
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Spotlight business */}
          <div className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Top rated near you
              </span>
              {spotlight && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                  <Star className="h-3 w-3 fill-amber-300" />
                  {spotlight.rating.toFixed(1)}
                </span>
              )}
            </div>

            {spotlight ? (
              <>
                <div className="relative h-44 overflow-hidden rounded-xl sm:h-48">
                  {spotlight.profileImage ? (
                    <img
                      src={spotlight.profileImage}
                      alt={spotlight.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <CoverFallback business={spotlight} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
                    {spotlight.premium && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-950 shadow">
                        <Crown className="h-2.5 w-2.5" /> PREMIUM
                      </span>
                    )}
                    {spotlight.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                        <ShieldCheck className="h-2.5 w-2.5" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      {spotlight.category}
                    </div>
                    <div className="line-clamp-1 text-lg font-black leading-tight text-white">
                      {spotlight.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/75">
                      <MapPin className="h-3 w-3 text-brand" />
                      {[spotlight.city, spotlight.state].filter(Boolean).join(', ')}
                      <span className="text-white/40">·</span>
                      {spotlight.reviewCount} reviews
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBusinessPick(spotlight.id)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-black text-brand-foreground transition-colors hover:bg-brand/90"
                >
                  View business
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 text-xs text-white/50 sm:h-48">
                New businesses are being added
              </div>
            )}

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[
                { icon: Navigation, label: 'Live map', action: () => onGoToTab?.('map') },
                { icon: MessagesSquare, label: 'Chat', action: () => spotlight && onBusinessPick(spotlight.id) },
                {
                  icon: Globe,
                  label: 'Website',
                  action: () => spotlight && window.open(`/business/${spotlight.id}/website`, '_blank', 'noopener')
                }
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-[10px] font-semibold text-white/70 transition-colors hover:border-brand/40 hover:bg-brand/15 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-brand" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="relative grid grid-cols-2 gap-px border-t border-white/10 bg-white/5 sm:grid-cols-4">
          {[
            { icon: Store, value: stats.total, label: 'Businesses listed' },
            { icon: BadgeCheck, value: stats.verified, label: 'Verified sellers' },
            { icon: MapPin, value: stats.cities, label: 'Cities covered' },
            { icon: Star, value: stats.reviews, label: 'Customer reviews' }
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-2.5 px-4 py-3.5 sm:px-6">
                <Icon className="h-5 w-5 flex-shrink-0 text-brand" />
                <div>
                  <div className="text-lg font-black leading-none text-white sm:text-xl">
                    {stat.value.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/55">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section>
        <SectionHeading
          icon={Sparkles}
          eyebrow="Browse the marketplace"
          title="Everything, by category"
          subtitle="Pick a category to see the businesses near you"
          onViewAll={() => onGoToTab?.('categories')}
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
          {liveCategories.map((cat) => {
            const visual = categoryVisual(cat.name)
            const Icon = visual.icon
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => explore({ category: cat.name })}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg sm:p-4"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14"
                  style={{ background: visual.soft }}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: visual.color }} />
                </div>
                <div className="text-[11px] font-bold leading-tight text-navy sm:text-xs">
                  {cat.name}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground">
                  {cat.count} {cat.count === 1 ? 'business' : 'businesses'}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ===== TRENDING PRODUCTS ===== */}
      {deals.length > 0 && (
        <section>
          <SectionHeading
            icon={TrendingUp}
            eyebrow="Live catalogue"
            title="Trending on BusinessHub"
            subtitle="Real products and prices from verified businesses"
            onViewAll={() => (onBrowseAll ? onBrowseAll() : onCategoryPick('All'))}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {deals.map((deal, index) => {
              const visual = categoryVisual(deal.category)
              return (
                <button
                  key={`${deal.businessId}-${deal.name}-${index}`}
                  type="button"
                  onClick={() => onBusinessPick(deal.businessId)}
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                >
                  <div
                    className="relative flex h-28 items-center justify-center overflow-hidden sm:h-32"
                    style={{ background: `linear-gradient(135deg, ${visual.soft} 0%, #ffffff 100%)` }}
                  >
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-5xl transition-transform duration-500 group-hover:scale-110 sm:text-6xl">
                        {deal.emoji}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur">
                      <MapPin className="h-2.5 w-2.5 text-brand" />
                      {deal.city}
                    </span>
                    {deal.price && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-navy px-2 py-0.5 text-[10px] font-black text-white shadow">
                        <IndianRupee className="h-2.5 w-2.5 text-brand" />
                        {deal.price.replace(/^₹\s*/, '')}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="line-clamp-1 text-xs font-bold text-navy transition-colors group-hover:text-brand">
                      {deal.name}
                    </div>
                    <div className="mt-1 line-clamp-1 text-[10px] font-medium text-muted-foreground">
                      by {deal.businessName}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand">
                      Enquire now
                      <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ===== EXPLORE BY NEED ===== */}
      <section>
        <SectionHeading
          icon={Sparkles}
          eyebrow="Shop by occasion"
          title="Explore by need"
          subtitle="Curated shortcuts to the right businesses"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((zone) => {
            const services = zone.services
              .map((service) => ({ service, count: businesses.filter((b) => businessMatches(b, { q: service })).length }))
              .filter((entry) => entry.count > 0)
            const zoneCount = businesses.filter((b) => b.category === zone.category).length
            if (services.length === 0 && zoneCount === 0) return null
            const Icon = zone.icon
            return (
              <div
                key={zone.title}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => explore({ category: zone.category })}
                  className={`relative flex w-full items-start gap-3 bg-gradient-to-br ${zone.gradient} p-4 text-left text-white`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black leading-tight">{zone.title}</div>
                    <div className="mt-0.5 text-[10px] font-medium text-white/80">{zone.subtitle}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5" />
                </button>
                <div className="space-y-0.5 p-2">
                  {services.map(({ service, count }) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => explore({ q: service })}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                    >
                      <span className="font-medium text-foreground/85">{service}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        {count}
                        <ArrowRight className="h-3 w-3 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </button>
                  ))}
                  {services.length === 0 && zoneCount > 0 && (
                    <button
                      type="button"
                      onClick={() => explore({ category: zone.category })}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground/85 transition-colors hover:bg-muted"
                    >
                      Browse {zone.category}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== FEATURED BUSINESSES ===== */}
      {featured.length > 0 && (
        <section>
          <SectionHeading
            icon={Crown}
            eyebrow="Handpicked"
            title="Featured premium businesses"
            subtitle="Top-rated and verified sellers from across India"
            onViewAll={() => (onBrowseAll ? onBrowseAll() : onCategoryPick('All'))}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((b) => {
              const visual = categoryVisual(b.category)
              const Icon = visual.icon
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onBusinessPick(b.id)}
                  className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg"
                >
                  <div className="relative h-32 overflow-hidden sm:h-36">
                    {b.profileImage ? (
                      <img
                        src={b.profileImage}
                        alt={b.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <CoverFallback business={b} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {b.premium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-amber-950 shadow">
                          <Crown className="h-2.5 w-2.5" /> PREMIUM
                        </span>
                      )}
                      {b.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                          <ShieldCheck className="h-2.5 w-2.5" /> VERIFIED
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                      {b.rating.toFixed(1)}
                      <span className="font-medium text-white/60">({b.reviewCount})</span>
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="line-clamp-1 text-xs font-black text-navy transition-colors group-hover:text-brand">
                      {b.name}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Icon className="h-3 w-3" style={{ color: visual.color }} />
                      <span className="line-clamp-1">
                        {b.subcategory || b.category}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5 text-brand" />
                      <span className="line-clamp-1">{b.city}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ===== QUICK SERVICES ===== */}
      {quickServices.length > 0 && (
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-white p-4 sm:p-5">
          <SectionHeading
            icon={Wrench}
            eyebrow="Near you"
            title="Popular services"
            subtitle="Book trusted local pros in a couple of taps"
            onViewAll={() => (onBrowseAll ? onBrowseAll() : onCategoryPick('All'))}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {quickServices.map((service) => {
              const visual = categoryVisual(service.category)
              const Icon = visual.icon
              return (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => explore({ q: service.name, category: service.category })}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: visual.soft }}
                  >
                    <Icon className="h-4 w-4" style={{ color: visual.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-[11px] font-bold text-navy">{service.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {service.count} {service.count === 1 ? 'pro' : 'pros'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ===== INDUSTRIES ===== */}
      <section>
        <SectionHeading
          icon={Factory}
          eyebrow="B2B verticals"
          title="Explore by industry"
          subtitle="Source directly from suppliers and manufacturers"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry) => {
            const count = businesses.filter((b) => businessMatches(b, industry.filter)).length
            if (count === 0) return null
            const Icon = industry.icon
            return (
              <button
                key={industry.name}
                type="button"
                onClick={() => explore(industry.filter)}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-soft/60">
                  <Icon className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs font-bold text-navy transition-colors group-hover:text-blue-700">
                    {industry.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {count} {count === 1 ? 'supplier' : 'suppliers'}
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-blue-700" />
              </button>
            )
          })}
        </div>
      </section>

      {/* ===== CITIES ===== */}
      {cities.length > 0 && (
        <section>
          <SectionHeading
            icon={MapPin}
            eyebrow="Across India"
            title="Popular cities"
            subtitle="Find businesses in India's busiest markets"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {cities.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => explore({ city: city.name })}
                className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-blue-700 text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-navy transition-colors group-hover:text-brand">
                    {city.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{city.state}</div>
                  <div className="mt-0.5 text-[10px] font-bold text-blue-700">
                    {city.count} {city.count === 1 ? 'business' : 'businesses'}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ===== TRUST ===== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy via-navy to-blue-900 p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: ShieldCheck, label: 'Verified listings', desc: 'Owner details checked before going live' },
            { icon: MessageCircle, label: 'Direct contact', desc: 'Call, WhatsApp or live chat — no middlemen' },
            { icon: Navigation, label: 'Live map', desc: 'See exactly which businesses are near you' },
            { icon: Globe, label: 'Free website', desc: 'Every listing gets a ready-made website' }
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="mt-0.5 text-[10px] leading-tight text-white/70">{item.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
