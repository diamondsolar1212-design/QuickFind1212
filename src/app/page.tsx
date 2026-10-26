'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search, MapPin, LocateFixed, Store, LayoutGrid, Map as MapIcon, Languages,
  ShieldCheck, Star, Loader2, ChevronRight, ChevronLeft,
  Crown, Sparkles, Megaphone, X, Tag, MessageCircle
} from 'lucide-react'
import { BusinessCard } from '@/components/businesshub/BusinessCard'
import { FilterPanel } from '@/components/businesshub/FilterPanel'
import { BusinessDetailModal } from '@/components/businesshub/BusinessDetailModal'
import { ListBusinessModal } from '@/components/businesshub/ListBusinessModal'
import { AuthModal } from '@/components/businesshub/AuthModal'
import { CategoriesGrid } from '@/components/businesshub/CategoriesGrid'
import { ThemePicker } from '@/components/businesshub/ThemePicker'

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
    theme,
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
  const [showPostRequirement, setShowPostRequirement] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

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

      if (!userLat) {
        if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
        else if (sortBy === 'reviews') list.sort((a, b) => b.reviewCount - a.reviewCount)
      } else if (sortBy === 'rating') {
        list.sort((a, b) => b.rating - a.rating)
      } else if (sortBy === 'reviews') {
        list.sort((a, b) => b.reviewCount - a.reviewCount)
      }

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
      () => {
        setLocation(19.0760, 72.8777)
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSearch = () => fetchBusinesses()

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col bg-background">
      {/* ===== TOP HEADER ===== */}
      <header className={`sticky top-0 z-50 shadow-md ${theme === 'editorial' ? 'bg-card text-foreground border-b-4 border-brand' : 'bg-navy text-navy-foreground'}`}>
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
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-foreground/10">
                    <div className="w-6 h-6 rounded-full bg-brand text-brand-foreground flex items-center justify-center text-[11px] font-bold">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-medium">{user.name?.split(' ')[0] || user.email.split('@')[0]}</span>
                  </div>
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
                onClick={() => setShowPostRequirement(true)}
                className="bg-inquiry hover:bg-inquiry/90 text-inquiry-foreground font-bold text-xs h-8"
              >
                <Megaphone className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">{t('nav_postRequirement')}</span>
                <span className="sm:hidden">Post</span>
              </Button>
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
            {/* Top bar: results count + actions */}
            <div className="flex items-center justify-between flex-wrap gap-2 bg-card border border-border/60 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-sm font-bold text-navy">
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
                  <Badge variant="outline" className="border-navy/30 text-navy bg-background font-medium">
                    <MapPin className="w-3 h-3 mr-1" />
                    {userLat.toFixed(2)}, {userLng?.toFixed(2)}
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
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[1,2,3,4,5,6].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex gap-3">
                            <Skeleton className="w-14 h-14 rounded-md" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                              <Skeleton className="h-3 w-2/3" />
                            </div>
                          </div>
                          <Skeleton className="h-9 w-full" />
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
                  <div className="grid sm:grid-cols-2 gap-3">
                    {businesses.map((b, i) => (
                      <BusinessCard key={b.id} business={b} index={i} />
                    ))}
                  </div>
                )}
              </div>

              {/* Sticky map (desktop xl only) */}
              <aside className="hidden xl:block">
                <div className="sticky top-32">
                  <div className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-3 py-2 bg-navy text-navy-foreground">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <MapIcon className="w-3.5 h-3.5 text-brand" />
                        LIVE MAP
                      </div>
                      <span className="text-[10px] bg-brand text-brand-foreground px-1.5 py-0.5 rounded font-semibold">
                        {businesses.length} PINNED
                      </span>
                    </div>
                    <div className="h-[480px]">
                      <MapView businesses={businesses} height="100%" />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
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
                <li><button onClick={() => setShowPostRequirement(true)} className="hover:text-brand">{t('nav_postRequirement')}</button></li>
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

      {/* ===== Post Requirement Modal ===== */}
      <PostRequirementModal open={showPostRequirement} onClose={() => setShowPostRequirement(false)} />

      {/* ===== Theme Picker — switch between 4 design options ===== */}
      <ThemePicker />

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

      {/* ===== Floating Post Requirement button (mobile) ===== */}
      <button
        onClick={() => setShowPostRequirement(true)}
        className="sm:hidden fixed bottom-4 right-4 z-40 h-12 px-4 rounded-full bg-inquiry text-inquiry-foreground shadow-lg hover:bg-inquiry/90 flex items-center gap-1.5 font-bold text-xs"
      >
        <Megaphone className="w-4 h-4" />
        Post Requirement
      </button>
    </div>
  )
}

// ===== Inline Post Requirement Modal =====
function PostRequirementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    product: '', quantity: '', unit: 'pieces', city: '', name: '', phone: '', details: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product || !form.name || !form.phone) return
    setSubmitted(true)
  }

  const reset = () => {
    setSubmitted(false)
    setForm({ product: '', quantity: '', unit: 'pieces', city: '', name: '', phone: '', details: '' })
    onClose()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={reset} />
          <div className="relative bg-card rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-inquiry to-inquiry/80 text-inquiry-foreground px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  {t('nav_postRequirement')}
                </h3>
                <p className="text-xs text-inquiry-foreground/80 mt-0.5">
                  Get best price quotes from verified suppliers
                </p>
              </div>
              <button onClick={reset} className="p-1 hover:bg-inquiry-foreground/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-verified-soft mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-9 h-9 text-verified" />
                </div>
                <h3 className="font-bold text-lg text-navy">Requirement Posted!</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Verified suppliers near you will contact you shortly with their best price quotes.
                  You'll receive calls on <span className="font-semibold text-navy">{form.phone}</span>.
                </p>
                <Button onClick={reset} className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Product / Service Required *
                  </label>
                  <input
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    placeholder="e.g. TMT Steel Bars, Office Chairs, Catering Service..."
                    className="mt-1 w-full h-10 px-3 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Quantity</label>
                    <input
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      placeholder="500"
                      className="mt-1 w-full h-10 px-3 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Unit</label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="mt-1 w-full h-10 px-3 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="kg">Kg</option>
                      <option value="tons">Tons</option>
                      <option value="liters">Liters</option>
                      <option value="boxes">Boxes</option>
                      <option value="units">Units</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Your City *</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="mt-1 w-full h-10 px-3 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Your Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Raj Kumar"
                      className="mt-1 w-full h-10 px-3 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone *</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-1 w-full h-10 px-3 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Additional Details</label>
                  <textarea
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    placeholder="Brand preference, delivery timeline, payment terms..."
                    className="mt-1 w-full min-h-[60px] px-3 py-2 text-sm border border-border rounded-md bg-background focus:border-brand outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-inquiry hover:bg-inquiry/90 text-inquiry-foreground font-bold rounded-md flex items-center justify-center gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Submit Requirement
                </button>
                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-verified" />
                  Your details are safe. We don't share without consent.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
