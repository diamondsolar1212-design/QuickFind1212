'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star, MapPin, Phone, MessageCircle, ShieldCheck, Crown, Clock,
  ChevronRight, Tag, Building2
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
  const { setSelectedBusinessId, theme } = useApp()
  const { t } = useI18n()

  if (theme === 'justdial') return <JustDialRow business={business} index={index} />
  if (theme === 'editorial') return <EditorialCard business={business} index={index} />
  if (theme === 'dark-gold') return <DarkGoldCard business={business} index={index} />
  if (theme === 'mint') return <MintCard business={business} index={index} />

  return <JustDialRow business={business} index={index} />
}

/* ============================================ */
/* THEME A: JustDial-style list row with big CALL button */
/* ============================================ */
function JustDialRow({ business, index }: { business: Business; index: number }) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()
  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null

  return (
    <div
      className="bg-card border border-border rounded-md overflow-hidden hover:border-brand hover:shadow-md transition-all cursor-pointer animate-fadeInUp"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      <div className="flex">
        {/* Left: Logo + verified */}
        <div className="w-24 sm:w-28 flex-shrink-0 p-3 bg-muted/30 border-r border-border flex flex-col items-center justify-center text-center">
          <div
            className="w-14 h-14 rounded-md flex items-center justify-center text-2xl mb-1"
            style={{ background: `${business.imageColor}15` }}
          >
            {business.emoji}
          </div>
          {business.verified && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-verified font-bold">
              <ShieldCheck className="w-2.5 h-2.5" />
              VERIFIED
            </span>
          )}
          {business.premium && !business.verified && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-brand font-bold">
              <Crown className="w-2.5 h-2.5" />
              PREMIUM
            </span>
          )}
        </div>

        {/* Middle: info */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-bold text-sm leading-snug text-foreground hover:text-brand line-clamp-1 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
            >
              {business.name}
            </h3>
            <div className="flex items-center gap-1 text-xs flex-shrink-0">
              <Star className="w-3 h-3 fill-brand text-brand" />
              <span className="font-bold text-brand">{business.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({business.reviewCount})</span>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-brand font-semibold">{business.category}</span>
            {business.subcategory && <span>·</span>}
            {business.subcategory && <span>{business.subcategory}</span>}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {business.description}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5 flex-wrap">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate max-w-[140px]">{business.city}, {business.state}</span>
            </span>
            {distance && (
              <>
                <span>·</span>
                <span className="text-foreground font-semibold">{distance} km</span>
              </>
            )}
            <span>·</span>
            <span className={`flex items-center gap-0.5 ${open ? 'text-verified' : 'text-destructive'}`}>
              <Clock className="w-2.5 h-2.5" />
              {open ? t('card_open') : t('card_closed')}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            {business.isB2B && <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-navy/30 text-navy font-semibold">B2B</Badge>}
            {business.isB2C && <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-navy/30 text-navy font-semibold">B2C</Badge>}
            {business.premium && (
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-brand/50 text-brand bg-brand-soft/40 font-semibold">
                <Crown className="w-2 h-2 mr-0.5" /> PREMIUM
              </Badge>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-col gap-1.5 p-2 border-l border-border/60 w-24 sm:w-28 flex-shrink-0 justify-center">
          <Button
            size="sm"
            className="bg-verified hover:bg-verified/90 text-white font-bold text-xs h-9"
            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.phone}` }}
          >
            <Phone className="w-3.5 h-3.5 mr-1" />
            {t('card_call')}
          </Button>
          {business.whatsapp && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-brand text-brand hover:bg-brand-soft font-semibold"
              onClick={(e) => {
                e.stopPropagation()
                const num = (business.whatsapp || '').replace(/[^0-9]/g, '')
                window.open(`https://wa.me/${num}`, '_blank')
              }}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-inquiry hover:bg-inquiry-soft font-semibold"
            onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
          >
            <Tag className="w-3 h-3 mr-1" />
            {t('card_sendInquiry')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ============================================ */
/* THEME B: Premium Dark Gold glassmorphism card */
/* ============================================ */
function DarkGoldCard({ business, index }: { business: Business; index: number }) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()
  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden cursor-pointer animate-fadeInUp group"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      {/* Header with gradient */}
      <div
        className="relative h-24 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${business.imageColor} 0%, ${business.imageColor}99 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(251,191,36,0.4) 0%, transparent 60%)`
        }} />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {business.verified && (
            <Badge className="bg-gold/95 text-black hover:bg-gold/95 shadow-md font-semibold text-[10px]">
              <ShieldCheck className="w-2.5 h-2.5 mr-1" />
              VERIFIED
            </Badge>
          )}
          {business.premium && (
            <Badge className="bg-black/40 text-gold hover:bg-black/40 backdrop-blur-md border border-gold/40 font-semibold text-[10px]">
              <Crown className="w-2.5 h-2.5 mr-1" />
              PREMIUM
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {business.isB2B && <span className="text-[10px] bg-black/40 text-gold backdrop-blur-md px-1.5 py-0.5 rounded font-semibold border border-gold/30">B2B</span>}
          {business.isB2C && <span className="text-[10px] bg-black/40 text-gold backdrop-blur-md px-1.5 py-0.5 rounded font-semibold border border-gold/30">B2C</span>}
        </div>
        <div className="absolute -bottom-7 left-4 w-14 h-14 rounded-xl bg-card border-2 border-gold/40 flex items-center justify-center text-3xl shadow-lg">
          {business.emoji}
        </div>
      </div>

      <div className="pt-8 pb-4 px-4">
        <h3 className="heading-serif font-bold text-base text-foreground leading-snug line-clamp-1 group-hover:text-gold transition-colors">
          {business.name}
        </h3>

        <div className="flex items-center gap-2 mt-1 text-xs">
          <div className="flex items-center gap-1 bg-gold/15 text-gold px-2 py-0.5 rounded-md font-semibold">
            <Star className="w-3 h-3 fill-gold text-gold" />
            {business.rating.toFixed(1)}
          </div>
          <span className="text-muted-foreground">({business.reviewCount})</span>
          {distance && (
            <Badge variant="outline" className="ml-auto text-[10px] border-gold/40 text-gold bg-gold/10 font-medium">
              <MapPin className="w-2.5 h-2.5 mr-1" />
              {distance} km
            </Badge>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground mt-1.5">
          <span className="text-gold font-semibold">{business.category}</span>
          {business.subcategory && <span className="text-muted-foreground"> · {business.subcategory}</span>}
        </div>

        <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-2 leading-relaxed">
          {business.description}
        </p>

        <div className="flex items-center gap-1.5 mt-2 text-[10px]">
          <Clock className={`w-2.5 h-2.5 ${open ? 'text-verified' : 'text-destructive'}`} />
          <span className={open ? 'text-verified font-semibold' : 'text-destructive font-semibold'}>
            {open ? t('card_open') : t('card_closed')}
          </span>
          <span className="text-muted-foreground/40 mx-1">·</span>
          <span className="text-muted-foreground truncate">{business.city}, {business.state}</span>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-gold to-amber-500 text-black hover:from-gold/90 hover:to-amber-500/90 font-bold text-xs h-9"
            onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
          >
            <Tag className="w-3.5 h-3.5 mr-1.5" />
            {t('card_getBestPrice')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-2 border-gold/40 text-gold hover:bg-gold/10 font-semibold"
            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.phone}` }}
          >
            <Phone className="w-3.5 h-3.5" />
          </Button>
          {business.whatsapp && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-2 border-verified/40 text-verified hover:bg-verified/10 font-semibold"
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

/* ============================================ */
/* THEME C: Modern Mint pastel rounded card */
/* ============================================ */
function MintCard({ business, index }: { business: Business; index: number }) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()
  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null
  const products = (() => {
    try { return business.products ? JSON.parse(business.products) : [] } catch { return [] }
  })()

  return (
    <div
      className="bg-card rounded-3xl border border-border/60 shadow-sm hover:shadow-lg mint-glow p-5 cursor-pointer transition-all animate-fadeInUp group"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      {/* Top: avatar + name + rating */}
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{ background: `${business.imageColor}20` }}
        >
          {business.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {business.name}
            </h3>
            {business.verified && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full verified-ring flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="text-brand font-semibold">{business.category}</span>
            {business.subcategory && <span>·</span>}
            {business.subcategory && <span>{business.subcategory}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className="inline-flex items-center gap-0.5 bg-accent/40 text-accent-foreground px-2 py-0.5 rounded-full font-bold">
              <Star className="w-3 h-3 fill-current" />
              {business.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">({business.reviewCount})</span>
            {distance && (
              <span className="ml-auto inline-flex items-center gap-0.5 text-foreground font-semibold">
                <MapPin className="w-3 h-3 text-brand" />
                {distance} km
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
        {business.description}
      </p>

      {/* Status + location */}
      <div className="flex items-center gap-2 mt-2.5 text-[11px]">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
          open ? 'bg-verified-soft text-verified' : 'bg-destructive/10 text-destructive'
        }`}>
          <Clock className="w-2.5 h-2.5" />
          {open ? t('card_open') : t('card_closed')}
        </span>
        <span className="text-muted-foreground truncate">{business.city}, {business.state}</span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-2">
        {business.isB2B && <Badge variant="outline" className="text-[10px] border-navy/30 text-navy font-semibold rounded-full">B2B</Badge>}
        {business.isB2C && <Badge variant="outline" className="text-[10px] border-navy/30 text-navy font-semibold rounded-full">B2C</Badge>}
        {business.premium && (
          <Badge variant="outline" className="text-[10px] border-brand text-brand bg-brand-soft font-semibold rounded-full">
            <Crown className="w-2.5 h-2.5 mr-0.5" /> Premium
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
        <Button
          size="sm"
          className="flex-1 bg-inquiry hover:bg-inquiry/90 text-inquiry-foreground font-bold rounded-full h-9"
          onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
        >
          <Tag className="w-3.5 h-3.5 mr-1.5" />
          {t('card_getBestPrice')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-2 rounded-full border-brand text-brand hover:bg-brand-soft"
          onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.phone}` }}
        >
          <Phone className="w-3.5 h-3.5" />
        </Button>
        {business.whatsapp && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-2 rounded-full border-verified text-verified hover:bg-verified-soft"
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
  )
}

/* ============================================ */
/* THEME D: Editorial magazine-style card */
/* ============================================ */
function EditorialCard({ business, index }: { business: Business; index: number }) {
  const { setSelectedBusinessId } = useApp()
  const { t } = useI18n()
  const open = isOpen(business.hours)
  const distance = business.distance !== undefined ? business.distance.toFixed(1) : null

  return (
    <article
      className="bg-card border-t-2 border-brand pt-2 cursor-pointer animate-fadeInUp group"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => setSelectedBusinessId(business.id)}
    >
      {/* Top: emoji big + meta */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-16 h-16 flex items-center justify-center text-3xl flex-shrink-0 border-2 border-foreground"
          style={{ background: `${business.imageColor}15` }}
        >
          {business.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-brand mb-0.5">
            {business.category}
            {business.subcategory && <span className="text-muted-foreground"> · {business.subcategory}</span>}
          </div>
          <h3 className="heading-serif font-bold text-xl text-foreground leading-tight group-hover:text-brand transition-colors line-clamp-2">
            {business.name}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-serif font-bold text-2xl text-brand leading-none">
            {business.rating.toFixed(1)}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {business.reviewCount} reviews
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-2" />

      {/* Description as lead paragraph */}
      <p className="text-sm text-foreground/85 leading-relaxed line-clamp-3 mb-2">
        {business.description}
      </p>

      {/* Meta strip */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-wide mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-brand" />
          {business.city}, {business.state}
        </span>
        {distance && (
          <span className="font-bold text-foreground">
            {distance} km
          </span>
        )}
        <span className={`flex items-center gap-1 ${open ? 'text-verified' : 'text-destructive'} font-bold`}>
          <Clock className="w-3 h-3" />
          {open ? 'OPEN' : 'CLOSED'}
        </span>
        {business.verified && (
          <span className="flex items-center gap-1 text-verified font-bold">
            <ShieldCheck className="w-3 h-3" />
            VERIFIED
          </span>
        )}
        {business.premium && (
          <span className="flex items-center gap-1 text-brand font-bold">
            <Crown className="w-3 h-3" />
            PREMIUM
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-bold text-xs h-9 rounded-none"
          onClick={(e) => { e.stopPropagation(); setSelectedBusinessId(business.id) }}
        >
          <Tag className="w-3.5 h-3.5 mr-1.5" />
          {t('card_getBestPrice')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3 border-foreground text-foreground hover:bg-foreground hover:text-card-foreground font-bold rounded-none"
          onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.phone}` }}
        >
          <Phone className="w-3.5 h-3.5 mr-1.5" />
          {t('card_call')}
        </Button>
        {business.whatsapp && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3 border-verified text-verified hover:bg-verified hover:text-white font-bold rounded-none"
            onClick={(e) => {
              e.stopPropagation()
              const num = (business.whatsapp || '').replace(/[^0-9]/g, '')
              window.open(`https://wa.me/${num}`, '_blank')
            }}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            WhatsApp
          </Button>
        )}
      </div>
    </article>
  )
}
