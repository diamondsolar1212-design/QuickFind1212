'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Clock,
  ChevronRight, Tag, IndianRupee, Building2
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

export function BusinessCard({ business, index = 0, compact = false }: Props) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()

  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null
  const products = (() => {
    try { return business.products ? JSON.parse(business.products) : [] } catch { return [] }
  })()

  return (
    <Card
      className="group overflow-hidden border-border/70 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card animate-fadeInUp hover:border-brand/40"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      <CardContent className={compact ? "p-3" : "p-4"}>
        {/* Top row: logo + name + badges */}
        <div className="flex gap-3">
          {/* Logo box */}
          <div
            className="w-14 h-14 rounded-md flex items-center justify-center text-2xl flex-shrink-0 border border-border/40 group-hover:scale-105 transition-transform"
            style={{ background: `${business.imageColor}15` }}
          >
            {business.emoji}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5">
              <h3
                className="font-bold text-sm leading-snug line-clamp-2 text-navy group-hover:text-brand transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBusinessId(business.id)
                }}
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

            <div className="flex items-center gap-2 mt-0.5 text-xs">
              <span className="text-brand font-semibold flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-brand text-brand" />
                {business.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">({business.reviewCount})</span>
              {distance && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-muted-foreground flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {distance} km
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[11px] flex-wrap">
              <span className="text-muted-foreground">{business.category}</span>
              {business.subcategory && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-muted-foreground">{business.subcategory}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Trust seal + tags */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {business.verified && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 border-verified/40 text-verified bg-verified-soft/40 font-semibold">
              <ShieldCheck className="w-2.5 h-2.5 mr-1" />
              VERIFIED
            </Badge>
          )}
          {business.premium && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 border-brand/50 text-brand bg-brand-soft/40 font-semibold">
              <Crown className="w-2.5 h-2.5 mr-1" />
              PREMIUM
            </Badge>
          )}
          {business.isB2B && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 border-navy/30 text-navy font-semibold">
              B2B
            </Badge>
          )}
          {business.isB2C && (
            <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 border-navy/30 text-navy font-semibold">
              B2C
            </Badge>
          )}
          <span className="ml-auto text-[10px] flex items-center gap-0.5">
            <Clock className={`w-2.5 h-2.5 ${open ? 'text-verified' : 'text-destructive'}`} />
            <span className={open ? 'text-verified font-medium' : 'text-destructive font-medium'}>
              {open ? t('card_open') : t('card_closed')}
            </span>
          </span>
        </div>

        {/* Description (only when not compact) */}
        {!compact && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {business.description}
          </p>
        )}

        {/* Product preview tags */}
        {products.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mt-2">
            {products.slice(0, 3).map((p: any, i: number) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 bg-muted/60 text-foreground/80 rounded border border-border/50"
              >
                {p.img} {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Location line */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{business.address}, {business.city}, {business.state}</span>
        </div>

        {/* Action buttons — IndiaMART style */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border/50">
          <Button
            size="sm"
            className="flex-1 h-9 bg-inquiry hover:bg-inquiry/90 text-inquiry-foreground font-bold text-xs"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBusinessId(business.id)
            }}
          >
            <Tag className="w-3.5 h-3.5 mr-1" />
            {t('card_getBestPrice')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-2 border-navy/30 text-navy hover:bg-navy hover:text-navy-foreground font-semibold"
            title={t('card_call')}
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `tel:${business.phone}`
            }}
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
          <Button
            size="sm"
            variant="ghost"
            className="h-9 px-2 text-brand hover:bg-brand-soft"
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
