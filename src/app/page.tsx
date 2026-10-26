'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useApp, type Business, type NearbyPlace } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search, MapPin, LocateFixed, Store, LayoutGrid, Map as MapIcon, Languages,
  ShieldCheck, Star, Loader2, ChevronRight, ChevronLeft,
  Crown, Sparkles, X, Tag, MessageCircle
} from 'lucide-react'
import { BusinessCard } from '@/components/businesshub/BusinessCard'
import { FilterPanel } from '@/components/businesshub/FilterPanel'
import { BusinessDetailModal } from '@/components/businesshub/BusinessDetailModal'
import { ListBusinessModal } from '@/components/businesshub/ListBusinessModal'
import { AuthModal } from '@/components/businesshub/AuthModal'
import { CategoriesGrid } from '@/components/businesshub/CategoriesGrid'
import { HomeSections } from '@/components/businesshub/HomeSections'
import { NearbyPlaceCard } from '@/components/businesshub/NearbyPlaceCard'
import { UserPanel } from '@/components/businesshub/UserPanel'
import { AdminPanel } from '@/components/businesshub/AdminPanel'

// MapView uses react-leaflet which needs `window`. Load it on client only.
const MapView = dynamic(
  () => import('@/components/businesshub/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full rounded-md" />
  }
)

const TOP_CATEGORIES = [
  { name: 'Grocery & Essentials', emoji: '🛒', color: '#16a34a' },
  { name: 'Restaurants', emoji: '🍽️', color: '#dc2626' },
  { name: 'Home Services', emoji: '🔧', color: '#0891b2' },
  { name: 'Textiles & Apparel', emoji: '🧵', color: '#7c3aed' },
  { name: 'Food & Sweets', emoji: '🍯', color: '#c026d3' },
  { name: 'Food & Beverages', emoji: '☕', color: '#92400e' },
  { name: 'Automobile', emoji: '🚗', color: '#475569' },
  { name: 'Electronics', emoji: '📱', color: '#0284c7' },
  { name: 'Health & Wellness', emoji: '🌿', color: '#15803d' },
  { name: 'Beauty & Personal Care', emoji: '💇', color: '#be185d' },
  { name: 'Handicrafts & Art', emoji: '🎨', color: '#db2777' }
]

export default function Home() {
  const {
    user, logout,
    searchQuery, setSearchQuery,
    cityQuery, setCityQuery,
    userLat, userLng, setLocation, isLocating, setIsLocating,
    selectedCategory, setSelectedCategory,
    minRating, businessType, verifiedOnly, premiumOnly, radius, sortBy,
    clearFilters,
    activeTab, setActiveTab,
    selectedBusinessId, setSelectedBusinessId,
    showListModal, setShowListModal,
    showAuthModal, setShowAuthModal
  } = useApp()
  const { t, lang, toggle } = useI18n()

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<{ name: string; emoji: string; count: number; subcategories: string[] }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)
  const [showMapMobile, setShowMapMobile] = useState(false)
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  // Nearby POIs from OpenStreetMap (Overpass API)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  // Fetch nearby places from OpenStreetMap (Overpass API)
  const fetchNearbyPlaces = useCallback(async (lat: number, lng: number, radiusKm: number) => {
    setNearbyLoading(true)
    setNearbyError(null)
    try {
      // Convert km to meters, cap at 5km
      const radiusMeters = Math.min(Math.max(Math.round(radiusKm * 1000), 500), 5000)
      const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}&limit=15`)
      const data = await res.json()
      if (res.ok && data.nearby) {
        setNearbyPlaces(data.nearby)
      } else {
        setNearbyPlaces([])
        setNearbyError(data.error || 'No nearby places found')
      }
    } catch {
      setNearbyPlaces([])
      setNearbyError('Could not load nearby places')
    }
    setNearbyLoading(false)
  }, [])

  useEffect(() => {
    if (userLat && userLng) {
      // Use setTimeout to break synchronous setState chain
      const timer = setTimeout(() => {
        fetchNearbyPlaces(userLat, userLng, Math.min(radius, 5))
      }, 0)
      return () => clearTimeout(timer)
    } else {
      // Clear nearby places async (no location)
      const timer = setTimeout(() => setNearbyPlaces([]), 0)
      return () => clearTimeout(timer)
    }
  }, [userLat, userLng, radius, fetchNearbyPlaces])

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory)
      if (cityQuery) params.set('city', cityQuery)
      if (userLat && userLng) {
        params.set('lat', String(userLat))
        params.set('lng', String(userLng))
        params.set('radius', String(radius))
      }
      if (minRating) params.set('minRating', String(minRating))
      if (businessType) params.set('type', businessType)
      if (verifiedOnly) params.set('verified', 'true')
      if (premiumOnly) params.set('premium', 'true')

      const res = await fetch(`/api/businesses?${params.toString()}`)
      const data = await res.json()
      let list: Business[] = data.businesses || []

      // Client-side sort — premium first, verified next, then by selected sort
      const sortWithPriority = (a: Business, b: Business, sortFn: (a: Business, b: Business) => number) => {
        if (a.premium !== b.premium) return a.premium ? -1 : 1
        if (a.verified !== b.verified) return a.verified ? -1 : 1
        return sortFn(a, b)
      }

      if (sortBy === 'rating') {
        list.sort((a, b) => sortWithPriority(a, b, (x, y) => y.rating - x.rating))
      } else if (sortBy === 'reviews') {
        list.sort((a, b) => sortWithPriority(a, b, (x, y) => y.reviewCount - x.reviewCount))
      } else if (sortBy === 'distance' && userLat) {
        list.sort((a, b) => sortWithPriority(a, b, (x, y) => (x.distance || 0) - (y.distance || 0)))
      }
      // For 'relevance', we keep server's order (already premium → verified → rating)

      setBusinesses(list)
    } catch {
      setBusinesses([])
    }
    setLoading(false)
  }, [searchQuery, selectedCategory, cityQuery, userLat, userLng, radius, minRating, businessType, verifiedOnly, premiumOnly, sortBy])

  useEffect(() => {
    const timeout = setTimeout(fetchBusinesses, 250)
    return () => clearTimeout(timeout)
  }, [fetchBusinesses])

  useEffect(() => {
    if (!selectedBusinessId) return
    let cancelled = false
    fetch(`/api/business?id=${selectedBusinessId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSelectedBusiness(data.business)
      })
      .catch(() => {
        if (!cancelled) setSelectedBusiness(null)
      })
    return () => { cancelled = true }
  }, [selectedBusinessId])

  // Listen for business-updated events (e.g. after review submission)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) setSelectedBusiness(detail)
    }
    window.addEventListener('business-updated', handler)
    return () => window.removeEventListener('business-updated', handler)
  }, [])

  // Handle ?biz=<id> URL parameter — auto-open business detail (for shared links)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const bizId = params.get('biz')
    if (bizId) {
      setSelectedBusinessId(bizId)
      // Clean URL after auto-open (so refresh doesn't re-trigger)
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude)
        setIsLocating(false)
      },
      (err) => {
        // Don't auto-fallback to Mumbai. Inform user instead.
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          alert('Location permission denied. Please allow location access in your browser settings, or search by city name instead.')
        } else {
          alert('Could not detect your location. Please try again or search by city.')
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSearch = () => fetchBusinesses()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== TOP HEADER ===== */}
      <header className="sticky top-0 z-50 bg-navy text-navy-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Row 1: logo + search + actions */}
          <div className="h-16 flex items-center gap-3 sm:gap-5">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center text-brand-foreground font-black text-lg shadow-sm">
                B
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg leading-none">
                  Business<span className="text-brand">Hub</span>
                </div>
                <div className="text-[10px] text-navy-foreground/70 uppercase tracking-wider mt-0.5">India · B2B + B2C</div>
              </div>
            </div>

            {/* Search bar — prominent, IndiaMART style */}
            <div className="flex-1 max-w-3xl">
              <div className="flex items-stretch bg-white rounded-md overflow-hidden border-2 border-brand shadow-sm">
                <div className="hidden sm:flex items-center pl-3 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search products, suppliers, buyers, services..."
                  className="flex-1 h-10 sm:h-11 px-3 sm:pl-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none min-w-0"
                />
                <div className="hidden sm:flex items-center px-2 border-l border-border">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="City"
                  className="hidden sm:block w-24 h-10 sm:h-11 px-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
                />
                <Button
                  onClick={handleSearch}
                  className="rounded-none h-10 sm:h-11 bg-brand hover:bg-brand/90 text-brand-foreground font-bold px-4 sm:px-6"
                >
                  <Search className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">{t('hero_searchBtn')}</span>
                </Button>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={getUserLocation}
                disabled={isLocating}
                title={t('hero_useLocation')}
                className="hidden sm:flex items-center gap-1.5 text-navy-foreground hover:text-brand text-xs font-medium disabled:opacity-60"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{userLat ? `${userLat.toFixed(2)}, ${userLng?.toFixed(2)}` : t('hero_useLocation')}</span>
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className="text-navy-foreground hover:text-brand hover:bg-transparent px-2"
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs ml-1">{lang === 'en' ? 'हिं' : 'EN'}</span>
              </Button>

              {user ? (
                <div className="flex items-center gap-1.5">
                  {/* Admin Panel button (only for admins) */}
                  {user.isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAdminPanel(true)}
                      className="text-navy-foreground hover:text-red-400 hover:bg-transparent text-xs font-semibold"
                      title="Admin Panel"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  )}
                  {/* My Account button */}
                  <button
                    onClick={() => setShowUserPanel(true)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-foreground/10 hover:bg-navy-foreground/20 transition-colors"
                    title="My Account"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand text-brand-foreground flex items-center justify-center text-[11px] font-bold">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{user.name?.split(' ')[0] || user.email.split('@')[0]}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-navy-foreground hover:text-brand hover:bg-transparent text-xs"
                  >
                    {t('nav_logout')}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAuthModal(true)}
                  className="text-navy-foreground hover:text-brand hover:bg-transparent font-semibold text-sm"
                >
                  {t('nav_login')}
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: tab nav + Post Requirement CTA */}
          <div className="h-10 flex items-center justify-between border-t border-navy-foreground/10">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'discover' ? 'text-brand border-b-2 border-brand' : 'text-navy-foreground/80 hover:text-brand'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                {t('nav_discover')}
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'map' ? 'text-brand border-b-2 border-brand' : 'text-navy-foreground/80 hover:text-brand'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                {t('nav_map')}
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'categories' ? 'text-brand border-b-2 border-brand' : 'text-navy-foreground/80 hover:text-brand'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                {t('nav_categories')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (!user) setShowAuthModal(true)
                  else setShowListModal(true)
                }}
                className="bg-brand hover:bg-brand/90 text-brand-foreground font-bold text-xs h-8"
              >
                <Store className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">{t('nav_listBusiness')}</span>
                <span className="sm:hidden">List</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HORIZONTAL CATEGORY CHIPS STRIP ===== */}
      {activeTab !== 'categories' && (
        <div className="bg-card border-b border-border/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
            <div className="flex items-center gap-2 overflow-x-auto chip-strip">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-navy text-navy-foreground border-navy'
                    : 'bg-background text-foreground border-border hover:border-brand hover:text-brand'
                }`}
              >
                All Categories
              </button>
              {TOP_CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCategory(c.name)
                    setActiveTab('discover')
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                    selectedCategory === c.name
                      ? 'bg-brand text-brand-foreground border-brand'
                      : 'bg-background text-foreground border-border hover:border-brand hover:text-brand'
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'categories' ? (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-navy to-navy/80 text-navy-foreground rounded-lg px-5 py-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">{t('cat_title')}</h2>
              <p className="text-sm text-navy-foreground/80">{t('cat_subtitle', { count: categories.length })}</p>
            </div>
            {categories.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <CategoriesGrid categories={categories} onPick={() => setActiveTab('discover')} />
            )}
          </div>
        ) : activeTab === 'map' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-navy">
                  <MapIcon className="w-5 h-5 text-brand" />
                  {t('tab_map')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {userLat ? t('results_found', { count: businesses.length }) : 'Use your location to see nearest businesses'}
                </p>
              </div>
              <Button
                onClick={getUserLocation}
                disabled={isLocating}
                variant="outline"
                className="border-brand text-brand hover:bg-brand-soft h-9"
              >
                {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-2" />}
                {t('hero_useLocation')}
              </Button>
            </div>
            <div className="h-[600px] sm:h-[650px]">
              {loading ? (
                <Skeleton className="h-full rounded-lg" />
              ) : (
                <MapView businesses={businesses} height="100%" />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Home sections shown when no active search/filter */}
            {!searchQuery && !cityQuery && selectedCategory === 'All' && !userLat && !verifiedOnly && !premiumOnly && !businessType ? (
              <HomeSections
                businesses={businesses}
                onCategoryPick={(cat) => {
                  setSelectedCategory(cat)
                }}
                onBusinessPick={(id) => setSelectedBusinessId(id)}
                onSearchByTag={(tag) => setSearchQuery(tag)}
                onSearchByCity={(city) => setCityQuery(city)}
                onGoToTab={(tab) => setActiveTab(tab)}
              />
            ) : (
              <>
            {/* Top bar: results count + actions */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card border border-border/60 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-navy">
                  {loading ? 'Searching...' : t('results_found', { count: businesses.length })}
                </h2>
                {selectedCategory !== 'All' && (
                  <Badge variant="outline" className="border-brand text-brand bg-brand-soft/40 font-medium">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="ml-1 hover:bg-brand/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {userLat && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 bg-emerald-50 font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    Near you
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFiltersMobile(true)}
                  className="lg:hidden h-8 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Filters
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMapMobile(true)}
                  className="xl:hidden h-8 text-xs border-brand text-brand hover:bg-brand-soft"
                >
                  <MapIcon className="w-3.5 h-3.5 mr-1" />
                  Map
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTab('map')}
                  className="hidden xl:inline-flex h-8 text-xs text-navy"
                >
                  <MapIcon className="w-3.5 h-3.5 mr-1" />
                  Full Map
                </Button>
              </div>
            </div>

            {/* 3-column layout: filters | results | map */}
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_400px] gap-4">
              {/* Filter sidebar (desktop) */}
              <aside className="hidden lg:block">
                <div className="sticky top-32">
                  <FilterPanel categories={categories} />
                </div>
              </aside>

              {/* Results */}
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 gap-3">
                    {[1,2,3,4].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4 flex gap-4">
                          <Skeleton className="w-44 h-32 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                              <Skeleton className="h-5 w-2/3" />
                              <Skeleton className="h-6 w-12" />
                            </div>
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-9 w-32 mt-3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : businesses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                        <Search className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-bold mb-1 text-navy">{t('no_results')}</h3>
                      <p className="text-sm text-muted-foreground">{t('no_results_hint')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {businesses.map((b, i) => (
                      <BusinessCard key={b.id} business={b} index={i} />
                    ))}
                  </div>
                )}

                {/* ===== Nearby Places from OpenStreetMap (real nearby POIs from Overpass API) ===== */}
                {userLat && userLng && (
                  <div className="mt-6">
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-blue-200/60">
                      <div>
                        <h2 className="text-base font-bold text-navy flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-700" />
                          Nearby Places
                          <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-700 bg-blue-50 font-semibold ml-1">
                            LIVE OSM DATA
                          </Badge>
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Real businesses around your location · fetched from OpenStreetMap API
                        </p>
                      </div>
                      {nearbyLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                      )}
                    </div>

                    {/* Loading state */}
                    {nearbyLoading && (
                      <div className="grid grid-cols-1 gap-3">
                        {[1, 2, 3].map((i) => (
                          <Card key={i}>
                            <CardContent className="p-4 flex gap-4">
                              <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-7 w-32" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Error state */}
                    {!nearbyLoading && nearbyError && nearbyPlaces.length === 0 && (
                      <Card className="border-dashed border-blue-200/60 bg-blue-50/30">
                        <CardContent className="py-8 text-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-2">
                            <MapPin className="w-6 h-6 text-blue-700" />
                          </div>
                          <h3 className="font-bold text-sm text-navy mb-1">No nearby places found</h3>
                          <p className="text-xs text-muted-foreground">{nearbyError}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 h-8 text-xs border-blue-500/40 text-blue-700 hover:bg-blue-100"
                            onClick={() => userLat && userLng && fetchNearbyPlaces(userLat, userLng, Math.min(radius, 5))}
                          >
                            <Loader2 className="w-3.5 h-3.5 mr-1.5" />
                            Retry
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Nearby places list */}
                    {!nearbyLoading && nearbyPlaces.length > 0 && (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          {nearbyPlaces.map((p, i) => (
                            <NearbyPlaceCard key={p.id} place={p} index={i} />
                          ))}
                        </div>
                        <div className="text-center text-[10px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>Data from OpenStreetMap contributors · {nearbyPlaces.length} places within {Math.min(radius, 5)} km radius</span>
                        </div>
                      </>
                    )}

                    {/* Empty state (no location enabled) */}
                    {!nearbyLoading && !nearbyError && nearbyPlaces.length === 0 && (
                      <Card className="border-dashed border-blue-200/60 bg-blue-50/30">
                        <CardContent className="py-6 text-center">
                          <p className="text-xs text-muted-foreground">Searching for nearby places...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky map (desktop xl only) */}
              <aside className="hidden xl:block">
                <div className="sticky top-32">
                  <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-3 py-2.5 bg-card border-b border-border/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-navy">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        LIVE MAP
                      </div>
                      <span className="text-[10px] bg-brand text-brand-foreground px-2 py-0.5 rounded-full font-semibold">
                        {businesses.length} pinned
                      </span>
                    </div>
                    <div className="h-[480px]">
                      <MapView businesses={businesses} height="100%" />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ===== FOOTER (IndiaMART style) ===== */}
      <footer className="bg-navy text-navy-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-md bg-brand flex items-center justify-center text-brand-foreground font-black">
                  B
                </div>
                <div>
                  <div className="font-bold text-lg leading-none">
                    Business<span className="text-brand">Hub</span>
                  </div>
                  <div className="text-[10px] text-navy-foreground/70 uppercase tracking-wider mt-0.5">India · B2B + B2C</div>
                </div>
              </div>
              <p className="text-sm text-navy-foreground/80 leading-relaxed max-w-md mb-3">
                {t('footer_aboutDesc')}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] bg-navy-foreground/10 px-2 py-1 rounded">
                  <ShieldCheck className="w-3 h-3 text-verified" /> Verified Suppliers
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-navy-foreground/10 px-2 py-1 rounded">
                  <MapPin className="w-3 h-3 text-brand" /> Live Map Location
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-navy-foreground/10 px-2 py-1 rounded">
                  <Tag className="w-3 h-3 text-inquiry" /> Best Price Quotes
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-brand">{t('footer_quickLinks')}</h4>
              <ul className="space-y-1.5 text-sm text-navy-foreground/80">
                <li><button onClick={() => setActiveTab('discover')} className="hover:text-brand">{t('nav_discover')}</button></li>
                <li><button onClick={() => setActiveTab('map')} className="hover:text-brand">{t('nav_map')}</button></li>
                <li><button onClick={() => setActiveTab('categories')} className="hover:text-brand">{t('nav_categories')}</button></li>
                <li><button onClick={() => setShowListModal(true)} className="hover:text-brand">{t('footer_listFree')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-brand">{t('footer_forBusiness')}</h4>
              <ul className="space-y-1.5 text-sm text-navy-foreground/80">
                <li><button onClick={() => setShowListModal(true)} className="hover:text-brand">{t('footer_listFree')}</button></li>
                <li><button className="hover:text-brand">{t('footer_premium')}</button></li>
                <li><button className="hover:text-brand">{t('footer_advertise')}</button></li>
                <li><button onClick={() => setShowAuthModal(true)} className="hover:text-brand">{t('nav_login')}</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-foreground/15 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-navy-foreground/70">
            <div>© 2026 BusinessHub India. {t('footer_rights')}</div>
            <div className="flex items-center gap-3">
              <button onClick={toggle} className="hover:text-brand font-semibold">{lang === 'en' ? 'हिंदी' : 'English'}</button>
              <span>·</span>
              <span>Made with care in India 🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== MODALS ===== */}
      <BusinessDetailModal
        business={selectedBusiness}
        open={!!selectedBusinessId && !!selectedBusiness}
        onClose={() => setSelectedBusinessId(null)}
      />
      <ListBusinessModal open={showListModal} onClose={() => setShowListModal(false)} />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* ===== User Panel (logged-in users) ===== */}
      {showUserPanel && user && (
        <UserPanel onClose={() => setShowUserPanel(false)} />
      )}

      {/* ===== Admin Panel (admin only) ===== */}
      {showAdminPanel && user?.isAdmin && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* ===== Mobile filters drawer (simple) ===== */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFiltersMobile(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">{t('filter_title')}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFiltersMobile(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <FilterPanel categories={categories} />
          </div>
        </div>
      )}

      {/* ===== Mobile map overlay ===== */}
      {showMapMobile && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMapMobile(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[80vh] bg-background shadow-xl rounded-t-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-navy text-navy-foreground">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5 text-brand" />
                LIVE MAP · {businesses.length} BUSINESSES
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowMapMobile(false)} className="text-navy-foreground hover:bg-transparent">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="h-[calc(80vh-40px)]">
              <MapView businesses={businesses} height="100%" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
