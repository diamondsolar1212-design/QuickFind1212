'use client'

import { useApp } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, X, Star, ShieldCheck, Crown, RotateCcw } from 'lucide-react'

interface Props {
  categories: { name: string; emoji: string; count: number }[]
}

export function FilterPanel({ categories }: Props) {
  const {
    selectedCategory, setSelectedCategory,
    minRating, setMinRating,
    businessType, setBusinessType,
    verifiedOnly, setVerifiedOnly,
    premiumOnly, setPremiumOnly,
    radius, setRadius,
    sortBy, setSortBy,
    clearFilters,
    userLat
  } = useApp()
  const { t } = useI18n()

  return (
    <Card className="border-border/60 shadow-sm sticky top-4 bg-card">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand" />
            <h3 className="font-serif font-semibold text-base">{t('filter_title')}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 text-muted-foreground hover:text-brand">
            <RotateCcw className="w-3 h-3 mr-1" />
            {t('filter_clear')}
          </Button>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">{t('filter_sortBy')}</label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t('sort_relevance')}</SelectItem>
              <SelectItem value="rating">{t('sort_rating')}</SelectItem>
              {userLat && <SelectItem value="distance">{t('sort_distance')}</SelectItem>}
              <SelectItem value="reviews">{t('sort_reviews')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">{t('filter_category')}</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('filter_all')}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.emoji} {c.name} ({c.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min rating */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
            {t('filter_minRating')}: <span className="text-brand font-semibold">{minRating.toFixed(1)}★</span>
          </label>
          <Slider
            value={[minRating]}
            onValueChange={([v]) => setMinRating(v)}
            min={0}
            max={5}
            step={0.5}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0</span><span>2.5</span><span>5</span>
          </div>
        </div>

        {/* Radius */}
        {userLat && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
              {t('filter_radius')}: <span className="text-brand font-semibold">{radius} km</span>
            </label>
            <Slider
              value={[radius]}
              onValueChange={([v]) => setRadius(v)}
              min={1}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 km</span><span>50 km</span><span>100 km</span>
            </div>
          </div>
        )}

        {/* Business type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">{t('filter_businessType')}</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={businessType === null ? 'default' : 'outline'}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setBusinessType(null)}
            >
              {t('filter_all')}
            </Button>
            <Button
              variant={businessType === 'B2B' ? 'default' : 'outline'}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setBusinessType(businessType === 'B2B' ? null : 'B2B')}
            >
              B2B
            </Button>
            <Button
              variant={businessType === 'B2C' ? 'default' : 'outline'}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setBusinessType(businessType === 'B2C' ? null : 'B2C')}
            >
              B2C
            </Button>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
              verifiedOnly ? 'border-emerald-500/40 bg-emerald-50' : 'border-border bg-background hover:bg-muted'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className={`w-4 h-4 ${verifiedOnly ? 'text-emerald-600' : 'text-muted-foreground'}`} />
              {t('filter_verified')}
            </span>
            <span className={`w-4 h-4 rounded-full border-2 transition-colors ${verifiedOnly ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30'}`} />
          </button>
          <button
            onClick={() => setPremiumOnly(!premiumOnly)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
              premiumOnly ? 'border-amber-500/40 bg-amber-50' : 'border-border bg-background hover:bg-muted'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Crown className={`w-4 h-4 ${premiumOnly ? 'text-amber-600' : 'text-muted-foreground'}`} />
              {t('filter_premium')}
            </span>
            <span className={`w-4 h-4 rounded-full border-2 transition-colors ${premiumOnly ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/30'}`} />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
