'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Clock, Tag
} from 'lucide-react'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'

function isOpen(hoursJson: string): boolean {
  try {
    if (!hoursJson) return true
    const hours = JSON.parse(hoursJson)
    const now = new Date()
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const today = days[now.getDay()].trim()
    const todayHours = hours[today] || hours.mon || ''
    if (todayHours.toLowerCase().includes('closed')) return false
    return true
  } catch {
    return true
  }
}

interface Props {
  business: Business
  index?: number
  compact?: boolean
}

export function BusinessCard({ business, index = 0 }: Props) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()

  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null
  const products = (() => {
    try { return business.products ? JSON.parse(business.products) : [] } catch { return [] }
  })()

  return (
    <div
      className="bg-card border border-border/70 rounded-lg overflow-hidden hover:shadow-lg hover:border-brand/50 transition-all cursor-pointer animate-fadeInUp group"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      {/* Image banner — IndiaMART style */}
      <div
        className="relative h-28 sm:h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.imageColor} 0%, ${business.imageColor}dd 60%, ${business.imageColor}99 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px, 32px 32px'
        }} />

        {/* Verified + Premium badges top-left */}
        <div className="absolute top-2 left-2 flex gap-1">
          {business.verified && (
            <Badge className="bg-white/95 text-verified hover:bg-white/95 shadow-sm font-bold text-[10px]">
              <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
              VERIFIED
            </Badge>
          )}
          {business.premium && (
            <Badge className="bg-brand text-brand-foreground hover:bg-brand shadow-sm font-bold text-[10px]">
              <Crown className="w-2.5 h-2.5 mr-0.5" />
              PREMIUM
            </Badge>
          )}
        </div>

        {/* B2B/B2C top-right */}
        <div className="absolute top-2 right-2 flex gap-1">
          {business.isB2B && <Badge className="bg-white/85 text-blue-700 hover:bg-white/85 font-bold text-[10px]">B2B</Badge>}
          {business.isB2C && <Badge className="bg-white/85 text-blue-700 hover:bg-white/85 font-bold text-[10px]">B2C</Badge>}
        </div>

        {/* Big emoji logo */}
        <div className="absolute -bottom-5 left-3 w-12 h-12 rounded-lg bg-white shadow-md flex items-center justify-center text-2xl border-2 border-white">
          {business.emoji}
        </div>

        {/* Open/closed status bottom-right */}
        <div className="absolute bottom-2 right-2 text-white/95 text-[10px] font-semibold flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
          <Clock className="w-2.5 h-2.5" />
          {open ? t('card_open') : t('card_closed')}
        </div>
      </div>

      <div className="pt-7 pb-3 px-3">
        {/* Name + verified ring */}
        <div className="flex items-start gap-1.5 mb-1">
          <h3
            className="font-bold text-sm text-navy leading-snug line-clamp-2 group-hover:text-brand transition-colors flex-1"
            onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
          >
            {business.name}
          </h3>
          {business.verified && (
            <span
              title="Verified Supplier"
              className="inline-flex items-center justify-center w-4 h-4 rounded-full verified-ring flex-shrink-0 mt-0.5"
            >
              <ShieldCheck className="w-3 h-3 text-white" />
            </span>
          )}
        </div>

        {/* Rating + distance row */}
        <div className="flex items-center gap-2 text-xs mb-1.5">
          <span className="flex items-center gap-0.5 bg-brand-soft text-foreground font-bold px-1.5 py-0.5 rounded">
            <Star className="w-3 h-3 fill-brand text-brand" />
            {business.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground text-[11px]">({business.reviewCount})</span>
          {distance && (
            <span className="ml-auto text-[11px] text-blue-700 font-semibold flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {distance} km
            </span>
          )}
        </div>

        {/* Category + subcategory */}
        <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-blue-700 font-semibold">{business.category}</span>
          {business.subcategory && <span>·</span>}
          {business.subcategory && <span>{business.subcategory}</span>}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {business.description}
        </p>

        {/* Product preview chips */}
        {products.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {products.slice(0, 2).map((p: any, i: number) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-soft/50 text-blue-700 rounded border border-blue/20 font-medium">
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Location line */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2.5">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{business.city}, {business.state}</span>
        </div>

        {/* Action buttons row — IndiaMART style */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
          <Button
            size="sm"
            className="flex-1 h-9 bg-inquiry hover:bg-inquiry/90 text-inquiry-foreground font-bold text-xs"
            onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
          >
            <Tag className="w-3.5 h-3.5 mr-1" />
            {t('card_getBestPrice')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-2 border-blue/30 text-blue-700 hover:bg-blue-soft font-semibold"
            title={t('card_call')}
            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.phone}` }}
          >
            <Phone className="w-3.5 h-3.5" />
          </Button>
          {business.whatsapp && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-2 border-verified/40 text-verified hover:bg-verified-soft font-semibold"
              title={t('card_whatsapp')}
              onClick={(e) => {
                e.stopPropagation()
                const num = (business.whatsapp || '').replace(/[^0-9]/g, '')
                window.open(`https://wa.me/${num}`, '_blank')
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
