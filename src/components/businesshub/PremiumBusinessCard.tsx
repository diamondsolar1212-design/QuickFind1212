'use client'

import {
  Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Clock,
  Navigation, Globe, ChevronRight, Images, Package, Camera
} from 'lucide-react'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { parseProducts, productEmoji } from '@/lib/products'

interface Props {
  business: Business
  onChat: (business: Business) => void
}

function isOpen(hoursJson: string): boolean {
  try {
    if (!hoursJson) return true
    const hours = JSON.parse(hoursJson)
    const now = new Date()
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const today = days[now.getDay()].trim()
    const todayHours = hours[today] || hours.mon || ''
    return !String(todayHours).toLowerCase().includes('closed')
  } catch {
    return true
  }
}

function todayHours(hoursJson: string): string {
  try {
    if (!hoursJson) return 'Open today'
    const hours = JSON.parse(hoursJson)
    const now = new Date()
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const day = days[now.getDay()].trim()
    const value = hours[day] || hours.mon || ''
    return value ? String(value) : 'Open today'
  } catch {
    return 'Open today'
  }
}

interface CardAction {
  label: string
  hint: string
  icon: typeof Phone
  className: string
  href?: string
  onClick?: () => void
}

export function PremiumBusinessCard({ business, onChat }: Props) {
  const { setSelectedBusinessId, user } = useApp()
  const { t } = useI18n()

  const gallery = (business.imageUrls || '').split(',').map((url) => url.trim()).filter(Boolean)
  const cover = business.profileImage || gallery[0] || ''
  const products = parseProducts(business.products)
  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null

  const mapsHref = business.lat && business.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}, ${business.city}`)}`

  const websiteHref = `/business/${business.id}/website`

  const actions: CardAction[] = [
    {
      label: 'Call',
      hint: business.phone || 'Phone unavailable',
      icon: Phone,
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      onClick: () => { if (business.phone) window.location.href = `tel:${business.phone}` }
    },
    {
      label: 'Navigate',
      hint: distance ? `${distance} km away` : business.city || 'Directions',
      icon: Navigation,
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
      onClick: () => window.open(mapsHref, '_blank', 'noopener,noreferrer')
    },
    {
      label: 'Website',
      hint: 'Opens in new tab',
      icon: Globe,
      className: 'bg-violet-600 hover:bg-violet-700 text-white',
      href: websiteHref
    },
    {
      label: 'Live Chat',
      hint: 'Chat + photos',
      icon: MessageCircle,
      className: 'bg-amber-500 hover:bg-amber-600 text-white',
      onClick: () => onChat(business)
    }
  ]

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand/30 bg-card shadow-xl shadow-brand/10 animate-fadeInUp">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-amber-400 to-brand" />

      {/* Cover */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {cover ? (
          <img src={cover} alt={business.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${business.imageColor || '#0d9488'} 0%, ${business.imageColor || '#0d9488'}cc 60%, #0f172a 100%)` }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-80">{business.emoji || '🏪'}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 text-amber-950 shadow">
            <Crown className="w-3 h-3" /> {business.premium ? 'PREMIUM' : 'TOP PICK'}
          </span>
          {business.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/25">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${open ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            {open ? t('card_open').toUpperCase() : t('card_closed').toUpperCase()}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/45 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          {business.rating.toFixed(1)}
          <span className="text-white/60 font-medium">({business.reviewCount})</span>
        </div>

        {/* Title block */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-[11px] text-white/80 mb-1.5 flex-wrap">
            <span className="text-amber-300 font-semibold">{business.category}</span>
            {business.subcategory && <><span>·</span><span>{business.subcategory}</span></>}
            {distance && <><span>·</span><span>{distance} km away</span></>}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md line-clamp-1">
            {business.name}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
            <span className="truncate">{[business.address, business.city, business.state].filter(Boolean).join(', ')}</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{business.description}</p>

        {/* Quick facts */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 border border-border/50 text-foreground/75">
            <Clock className="w-3 h-3 text-brand" /> {todayHours(business.hours)}
          </span>
          {gallery.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 border border-border/50 text-foreground/75">
              <Images className="w-3 h-3 text-brand" /> {gallery.length} photos
            </span>
          )}
          {products.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 border border-border/50 text-foreground/75">
              <Package className="w-3 h-3 text-brand" /> {products.length} products
            </span>
          )}
          {business.isB2B && (
            <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium">B2B</span>
          )}
          {business.isB2C && (
            <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">B2C</span>
          )}
        </div>

        {/* Gallery rail */}
        {gallery.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
            {gallery.slice(0, 6).map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setSelectedBusinessId(business.id)}
                className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border/60 hover:border-brand transition-colors"
                title="Open gallery"
              >
                <img src={url} alt={`${business.name} ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                {index === 5 && gallery.length > 6 && (
                  <span className="absolute inset-0 bg-black/60 text-white text-xs font-bold flex items-center justify-center">
                    +{gallery.length - 5}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Products preview */}
        {products.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 4).map((product: any, index: number) => (
              <span key={index} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-brand-soft/40 text-foreground/80 rounded-md border border-brand/20">
                {productEmoji(product, '🛍️')} {product.name}
                {product.price ? <b className="text-brand ml-0.5">{product.price}</b> : null}
              </span>
            ))}
            {products.length > 4 && (
              <span className="text-[11px] px-2 py-1 text-muted-foreground">+{products.length - 4} more</span>
            )}
          </div>
        )}

        {/* Four primary actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {actions.map((action) => {
            const Icon = action.icon
            const inner = (
              <>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold">{action.label}</span>
                <span className="text-[9px] opacity-80 truncate max-w-full">{action.hint}</span>
              </>
            )
            const className = `group/action flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2.5 text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${action.className}`
            return action.href ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <button key={action.label} type="button" onClick={action.onClick} className={className}>
                {inner}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Camera className="w-3.5 h-3.5" />
            <span>Full profile, reviews & gallery</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBusinessId(business.id)}
            className="inline-flex items-center gap-0.5 text-xs font-bold text-brand hover:text-brand/80"
          >
            View details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!user && (
          <p className="text-[10px] text-muted-foreground">
            Tip: sign in to keep your live chat history and share photos with {business.name}.
          </p>
        )}
      </div>
    </div>
  )
}
