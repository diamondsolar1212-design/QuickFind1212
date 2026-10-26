'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Clock, ChevronRight } from 'lucide-react'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'

function isOpen(hoursJson: string): boolean {
  try {
    if (!hoursJson) return true
    const hours = JSON.parse(hoursJson)
    const now = new Date()
    const days = ['sun', 'mon', 'tue', 'wed', ' thu', 'fri', 'sat']
    const today = days[now.getDay()]
    const todayHours = hours[today.trim()] || hours.mon || ''
    if (todayHours.toLowerCase().includes('closed')) return false
    return true
  } catch {
    return true
  }
}

interface Props {
  business: Business
  index?: number
}

export function BusinessCard({ business, index = 0 }: Props) {
  const { setSelectedBusinessId } = useApp()
  const { t, lang } = useI18n()
  const [imgError, setImgError] = useState(false)

  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null
  const products = (() => {
    try { return business.products ? JSON.parse(business.products) : [] } catch { return [] }
  })()

  return (
    <Card
      className="group overflow-hidden border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-card animate-fadeInUp"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      {/* Top banner */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.imageColor} 0%, ${business.imageColor}dd 50%, ${business.imageColor}99 100%)`
        }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px, 32px 32px'
        }} />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {business.verified && (
            <Badge className="bg-white/95 text-emerald-700 hover:bg-white/95 shadow-sm font-medium">
              <ShieldCheck className="w-3 h-3 mr-1" /> {t('card_verified')}
            </Badge>
          )}
          {business.premium && (
            <Badge className="bg-amber-500/95 text-white hover:bg-amber-500/95 shadow-sm font-medium">
              <Crown className="w-3 h-3 mr-1" /> {t('card_premium')}
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {business.isB2B && <Badge variant="secondary" className="bg-white/85 text-slate-700 hover:bg-white/85 font-medium">B2B</Badge>}
          {business.isB2C && <Badge variant="secondary" className="bg-white/85 text-slate-700 hover:bg-white/85 font-medium">B2C</Badge>}
        </div>
        <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl border border-border/40">
          {business.emoji}
        </div>
        <div className="absolute bottom-2 right-3 text-white/90 text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {open ? t('card_open') : t('card_closed')}
        </div>
      </div>

      <CardContent className="pt-8 pb-4 px-5">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif font-semibold text-lg text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            {business.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-2 text-sm">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {business.rating.toFixed(1)}
          </div>
          <span className="text-muted-foreground text-xs">
            {t('card_reviews', { count: business.reviewCount })}
          </span>
        </div>

        {/* Category + distance */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
          <span className="text-brand font-medium">{business.category}</span>
          {business.subcategory && <span className="text-muted-foreground/60">·</span>}
          {business.subcategory && <span>{business.subcategory}</span>}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 text-brand/60" />
          <span className="truncate">{business.address}, {business.city}</span>
          {distance && (
            <Badge variant="outline" className="ml-auto text-[10px] border-brand/30 text-brand bg-brand-soft/50 font-medium">
              {t('card_km', { km: distance })}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {business.description}
        </p>

        {/* Product tags preview */}
        {products.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {products.slice(0, 3).map((p: any, i: number) => (
              <span key={i} className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border/50">
          <Button
            size="sm"
            className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-medium"
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `tel:${business.phone}`
            }}
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            {t('card_call')}
          </Button>
          {business.whatsapp && (
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 font-medium"
              onClick={(e) => {
                e.stopPropagation()
                const num = (business.whatsapp || '').replace(/[^0-9]/g, '')
                window.open(`https://wa.me/${num}`, '_blank')
              }}
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              {t('card_whatsapp')}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-brand hover:bg-brand-soft"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBusinessId(business.id)
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
