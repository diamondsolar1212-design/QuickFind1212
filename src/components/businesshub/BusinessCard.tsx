'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Clock, ChevronRight, ExternalLink
} from 'lucide-react'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { parseProducts, productEmoji } from '@/lib/products'

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
}

export function BusinessCard({ business, index = 0 }: Props) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()

  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null
  const products = parseProducts(business.products)

  return (
    <div
      className="group bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-lg hover:border-brand/30 transition-all cursor-pointer animate-fadeInUp flex flex-col sm:flex-row"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      {/* Image / Logo area — left side on desktop, top on mobile */}
      <div
        className="relative sm:w-44 md:w-52 h-32 sm:h-auto flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.imageColor} 0%, ${business.imageColor}dd 60%, ${business.imageColor}99 100%)`
        }}
      >
        {/* Profile image (if available) or gradient fallback */}
        {business.profileImage ? (
           
          <img
            src={business.profileImage}
            alt={business.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}

        {/* Gradient overlay at bottom for badge readability (only when image present) */}
        {business.profileImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        )}

        {/* Decorative pattern (only when no profile image) */}
        {!business.profileImage && (
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, white 1px, transparent 1.5px)`,
            backgroundSize: '20px 20px'
          }} />
        )}

        {/* Centered emoji (only when no profile image) */}
        {!business.profileImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl sm:text-6xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">
              {business.emoji}
            </div>
          </div>
        )}

        {/* Open/Closed status pill — bottom-left */}
        <div className="absolute bottom-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
            open ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 align-middle" />
            {open ? t('card_open').toUpperCase() : t('card_closed').toUpperCase()}
          </span>
        </div>

        {/* Premium ribbon — top-right corner */}
        {business.premium && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg shadow-sm flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5" />
              PREMIUM
            </div>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 p-4 flex flex-col min-w-0">
        {/* Top row: name + rating */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base text-navy leading-snug line-clamp-1 group-hover:text-brand transition-colors flex items-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
            >
              <span className="truncate">{business.name}</span>
              {business.verified && (
                <span
                  title="Verified Supplier"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full verified-ring flex-shrink-0"
                >
                  <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </h3>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-blue-700 font-semibold">{business.category}</span>
              {business.subcategory && <span className="text-muted-foreground/40">·</span>}
              {business.subcategory && <span className="text-muted-foreground">{business.subcategory}</span>}
              {business.isB2B && !business.isB2C && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">B2B only</span>}
              {business.isB2C && !business.isB2B && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">B2C</span>}
              {business.isB2B && business.isB2C && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">B2B + B2C</span>}
            </div>
          </div>

          {/* Rating chip — Zomato style */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-sm font-bold">
              <Star className="w-3 h-3 fill-white text-white" />
              {business.rating.toFixed(1)}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {business.reviewCount} ratings
            </div>
          </div>
        </div>

        {/* Location + distance row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          <span className="truncate flex-1 min-w-0">{business.address}, {business.city}</span>
          {distance && (
            <span className="text-[11px] font-bold text-brand bg-brand-soft/50 px-1.5 py-0.5 rounded flex-shrink-0">
              {distance} km
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
          {business.description}
        </p>

        {/* Product preview chips */}
        {products.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {products.slice(0, 3).map((p: any, i: number) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted/60 text-foreground/75 rounded border border-border/40">
                {productEmoji(p, '🛍️')} {p.name}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-auto">
          <Button
            size="sm"
            className="bg-navy hover:bg-navy/90 text-navy-foreground font-semibold text-xs h-9 px-4"
            onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 border-border text-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-500/40"
              title={t('card_call')}
              onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.phone}` }}
            >
              <Phone className="w-4 h-4" />
            </Button>
            {business.whatsapp && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 border-border text-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-500/40"
                title={t('card_whatsapp')}
                onClick={(e) => {
                  e.stopPropagation()
                  const num = (business.whatsapp || '').replace(/[^0-9]/g, '')
                  window.open(`https://wa.me/${num}`, '_blank')
                }}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
