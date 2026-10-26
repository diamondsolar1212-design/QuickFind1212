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
  ShieldCheck, Users, Building2, Star, Loader2, ChevronRight, Sparkles,
  TrendingUp, Crown, Fingerprint
} from 'lucide-react'
import { BusinessCard } from '@/components/businesshub/BusinessCard'
import { FilterPanel } from '@/components/businesshub/FilterPanel'
import { BusinessDetailModal } from '@/components/businesshub/BusinessDetailModal'
import { ListBusinessModal } from '@/components/businesshub/ListBusinessModal'
import { AuthModal } from '@/components/businesshub/AuthModal'
import { CategoriesGrid } from '@/components/businesshub/CategoriesGrid'

// MapView uses react-leaflet which needs `window`. Load it on client only.
const MapView = dynamic(
  () => import('@/components/businesshub/MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <Skeleton className="h-[600px] rounded-xl" /> }
)

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

  // Fetch categories once
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {})
  }, [])

  // Fetch businesses whenever filters change
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

      // Client-side sort (since premium + distance sort is already done server-side when lat/lng present)
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

  // Fetch selected business detail
  useEffect(() => {
    if (!selectedBusinessId) {
      return
    }
    let cancelled = false
    fetch(`/api/business?id=${selectedBusinessId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSelectedBusiness(data.business)
      })
      .catch(() => {
        if (!cancelled) setSelectedBusiness(null)
      })
    return () => {
      cancelled = true
    }
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
      (err) => {
        // Fallback to Mumbai
        setLocation(19.0760, 72.8777)
        setIsLocating(false)
        console.warn('Geo error:', err.message)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSearch = () => fetchBusinesses()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== Top Navbar ===== */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center text-brand-foreground shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg leading-none">
                Business<span className="text-brand">Hub</span>
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">India</div>
            </div>
          </div>

          {/* Center nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('discover')} className={activeTab === 'discover' ? 'bg-brand-soft text-brand' : ''}>
              <LayoutGrid className="w-4 h-4 mr-1.5" />
              {t('nav_discover')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'bg-brand-soft text-brand' : ''}>
              <MapIcon className="w-4 h-4 mr-1.5" />
              {t('nav_map')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'bg-brand-soft text-brand' : ''}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              {t('nav_categories')}
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="text-muted-foreground hover:text-brand gap-1.5 font-medium"
              title="Switch language"
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{lang === 'en' ? 'हिं' : 'EN'}</span>
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <div className="w-7 h-7 rounded-full bg-brand text-brand-foreground flex items-center justify-center text-xs font-semibold">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="text-xs">
                    <div className="font-medium leading-none">{user.name || user.email}</div>
                    <div className="text-muted-foreground">{user.role === 'BUSINESS_OWNER' ? 'Owner' : 'Customer'}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="text-xs">
                  {t('nav_logout')}
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowAuthModal(true)} className="border-brand/30 text-brand hover:bg-brand-soft">
                {t('nav_login')}
              </Button>
            )}
            <Button
              size="sm"
              className="bg-brand hover:bg-brand/90 text-brand-foreground hidden sm:flex"
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true)
                } else {
                  setShowListModal(true)
                }
              }}
            >
              <Store className="w-4 h-4 mr-1.5" />
              {t('nav_listBusiness')}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border/60 px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('discover')} className={activeTab === 'discover' ? 'bg-brand-soft text-brand' : ''}>
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">{t('nav_discover')}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('map')} className={activeTab === 'map' ? 'bg-brand-soft text-brand' : ''}>
            <MapIcon className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">{t('nav_map')}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'bg-brand-soft text-brand' : ''}>
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">{t('nav_categories')}</span>
          </Button>
        </div>
      </header>

      {/* ===== Hero (only on discover tab) ===== */}
      {activeTab === 'discover' && (
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-soft/30 via-background to-gold-soft/20 border-b border-border/40">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${'#0d9488'} 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="inline-flex items-center gap-1.5 mb-5 bg-brand-soft text-brand border-brand/20 hover:bg-brand-soft font-medium">
                <Sparkles className="w-3 h-3" />
                {t('hero_badge')}
              </Badge>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
                {t('hero_title')}
                <br />
                <span className="gradient-text">{t('hero_title_accent')}</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                {t('hero_subtitle')}
              </p>

              {/* Search bar */}
              <div className="bg-card rounded-2xl shadow-lg border border-border/60 p-3 max-w-3xl mx-auto">
                <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={t('hero_searchPlaceholder')}
                      className="pl-9 h-11 bg-background"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={t('hero_locationPlaceholder')}
                      className="pl-9 h-11 bg-background"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-11 bg-brand hover:bg-brand/90 text-brand-foreground font-medium px-6"
                  >
                    <Search className="w-4 h-4 mr-1.5" />
                    {t('hero_searchBtn')}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <button
                    onClick={getUserLocation}
                    disabled={isLocating}
                    className="text-xs text-brand hover:underline flex items-center gap-1.5 font-medium disabled:opacity-60"
                  >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                    {isLocating ? t('hero_locating') : t('hero_useLocation')}
                  </button>
                  <div className="text-[10px] text-muted-foreground">
                    {userLat ? `📍 ${userLat.toFixed(2)}, ${userLng?.toFixed(2)}` : 'No location set'}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-brand flex items-center justify-center gap-1">
                    <Building2 className="w-5 h-5" />
                    10K+
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('hero_stats_businesses')}</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-brand flex items-center justify-center gap-1">
                    <MapPin className="w-5 h-5" />
                    50+
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('hero_stats_cities')}</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-brand flex items-center justify-center gap-1">
                    <LayoutGrid className="w-5 h-5" />
                    25+
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('hero_stats_categories')}</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-brand flex items-center justify-center gap-1">
                    <Star className="w-5 h-5" />
                    50K+
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('hero_stats_reviews')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Main content ===== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {activeTab === 'categories' ? (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">{t('cat_title')}</h2>
              <p className="text-sm text-muted-foreground">{t('cat_subtitle', { count: categories.length })}</p>
            </div>
            {categories.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              <CategoriesGrid
                categories={categories}
                onPick={() => setActiveTab('discover')}
              />
            )}
          </div>
        ) : activeTab === 'map' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-brand" />
                  {t('tab_map')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userLat
                    ? t('results_found', { count: businesses.length })
                    : 'Use your location to see businesses nearest to you'}
                </p>
              </div>
              <Button
                onClick={getUserLocation}
                disabled={isLocating}
                variant="outline"
                className="border-brand/40 text-brand hover:bg-brand-soft"
              >
                {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LocateFixed className="w-4 h-4 mr-2" />}
                {t('hero_useLocation')}
              </Button>
            </div>
            {loading ? (
              <Skeleton className="h-[600px] rounded-xl" />
            ) : (
              <MapView businesses={businesses} height="650px" />
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Filter sidebar */}
            <aside className="hidden lg:block">
              <FilterPanel categories={categories} />
            </aside>

            {/* Mobile filter dropdown */}
            <details className="lg:hidden bg-card rounded-xl border border-border/60">
              <summary className="px-4 py-3 cursor-pointer flex items-center justify-between font-medium text-sm">
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-brand" />
                  {t('filter_title')}
                </span>
                <ChevronRight className="w-4 h-4" />
              </summary>
              <div className="p-4 pt-0">
                <FilterPanel categories={categories} />
              </div>
            </details>

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold">
                    {loading ? 'Searching...' : t('results_found', { count: businesses.length })}
                  </h2>
                  {selectedCategory !== 'All' && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-brand/30 text-brand bg-brand-soft/30">
                        {selectedCategory}
                      </Badge>
                      <button onClick={() => setSelectedCategory('All')} className="text-xs text-muted-foreground hover:text-brand hover:underline">
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(selectedCategory !== 'All' || minRating > 0 || businessType || verifiedOnly || premiumOnly) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground hover:text-brand">
                      {t('filter_clear')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('map')}
                    className="border-brand/30 text-brand hover:bg-brand-soft"
                  >
                    <MapIcon className="w-4 h-4 mr-1.5" />
                    {t('tab_map')}
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-32" />
                      <CardContent className="pt-8 pb-4 px-5 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-9 w-full mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : businesses.length === 0 ? (
                <Card className="border-dashed border-border/60">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-1">{t('no_results')}</h3>
                    <p className="text-sm text-muted-foreground">{t('no_results_hint')}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {businesses.map((b, i) => (
                    <BusinessCard key={b.id} business={b} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-card border-t border-border/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center text-brand-foreground">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-lg leading-none">
                    Business<span className="text-brand">Hub</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">India</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                {t('footer_aboutDesc')}
              </p>
              <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified listings</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand" /> Live map</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-600" /> 10K+ users</span>
              </div>
            </div>
            <div>
              <h4 className="font-serif font-semibold text-sm mb-3">{t('footer_quickLinks')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setActiveTab('discover')} className="hover:text-brand">{t('nav_discover')}</button></li>
                <li><button onClick={() => setActiveTab('map')} className="hover:text-brand">{t('nav_map')}</button></li>
                <li><button onClick={() => setActiveTab('categories')} className="hover:text-brand">{t('nav_categories')}</button></li>
                <li><button onClick={() => setShowListModal(true)} className="hover:text-brand">{t('footer_listFree')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-semibold text-sm mb-3">{t('footer_forBusiness')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setShowListModal(true)} className="hover:text-brand">{t('footer_listFree')}</button></li>
                <li><button className="hover:text-brand">{t('footer_premium')}</button></li>
                <li><button className="hover:text-brand">{t('footer_advertise')}</button></li>
                <li><button onClick={() => setShowAuthModal(true)} className="hover:text-brand">{t('nav_login')}</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/60 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div>© 2026 BusinessHub India. {t('footer_rights')}</div>
            <div className="flex items-center gap-3">
              <span>Made with care in India</span>
              <span>·</span>
              <button onClick={toggle} className="hover:text-brand font-medium">{lang === 'en' ? 'हिंदी' : 'English'}</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== Modals ===== */}
      <BusinessDetailModal
        business={selectedBusiness}
        open={!!selectedBusinessId && !!selectedBusiness}
        onClose={() => setSelectedBusinessId(null)}
      />
      <ListBusinessModal open={showListModal} onClose={() => setShowListModal(false)} />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Mobile list business FAB */}
      <button
        onClick={() => {
          if (!user) setShowAuthModal(true)
          else setShowListModal(true)
        }}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand text-brand-foreground shadow-lg hover:bg-brand/90 flex items-center justify-center"
        aria-label="List your business"
      >
        <Store className="w-6 h-6" />
      </button>
    </div>
  )
}
