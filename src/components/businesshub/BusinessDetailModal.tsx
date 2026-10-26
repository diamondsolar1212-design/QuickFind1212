'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Star, Phone, MessageCircle, Mail, Globe, MapPin, Clock, ShieldCheck, Crown,
  Navigation, Share2, ChevronLeft, Store, UtensilsCrossed, Wrench, Sparkles,
  ThumbsUp, Send, Check
} from 'lucide-react'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { toast } from 'sonner'

function getTagStyle(themeColor: string | undefined) {
  const c = themeColor || '#0d9488'
  return { borderColor: c + '40', color: c, backgroundColor: c + '10' }
}

interface Props {
  business: Business | null
  open: boolean
  onClose: () => void
}

const TEMPLATE_META: Record<string, { icon: any; accent: string; label: string }> = {
  retail: { icon: Store, accent: '#16a34a', label: 'Retail Store' },
  restaurant: { icon: UtensilsCrossed, accent: '#dc2626', label: 'Restaurant' },
  service: { icon: Wrench, accent: '#0891b2', label: 'Service Provider' },
  premium: { icon: Sparkles, accent: '#7c3aed', label: 'Premium Showcase' }
}

export function BusinessDetailModal({ business, open, onClose }: Props) {
  const { t } = useI18n()
  const { user } = useApp()
  const [reviewName, setReviewName] = useState(user?.name || '')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!business) return null

  const template = TEMPLATE_META[business.template] || TEMPLATE_META.retail
  const TemplateIcon = template.icon

  const products = (() => {
    try { return business.products ? JSON.parse(business.products) : [] } catch { return [] }
  })()
  const hours = (() => {
    try { return business.hours ? JSON.parse(business.hours) : {} } catch { return {} }
  })()
  const days = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
  ]

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error('Please fill name and comment')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          rating: reviewRating,
          comment: reviewComment,
          userName: reviewName,
          userId: user?.id || null
        })
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Review submitted successfully!')
        setReviewComment('')
        setReviewRating(5)
        // Refresh business data to show new review + updated rating
        if (business?.id) {
          try {
            const fresh = await fetch(`/api/business?id=${business.id}`)
            const freshData = await fresh.json()
            if (freshData.business) {
              // Update via window event so parent can refresh too
              window.dispatchEvent(new CustomEvent('business-updated', { detail: freshData.business }))
            }
          } catch {}
        }
      } else {
        toast.error('Failed to submit review')
      }
    } catch {
      toast.error('Network error')
    }
    setSubmitting(false)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?biz=${business.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: shareUrl
        })
      } else {
        await navigator.clipboard?.writeText(shareUrl)
        toast.success('Website link copied! Share it anywhere.')
      }
    } catch (err) {
      // User cancelled share — silently ignore
      console.warn('Share cancelled:', err)
    }
  }

  // Update website template (premium only)
  const handleTemplateChange = async (tpl: string) => {
    if (!business.premium) return
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          businessId: business.id,
          updates: { websiteTemplate: tpl }
        })
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Template switched to ${tpl}!`)
        // Trigger refresh
        window.dispatchEvent(new CustomEvent('business-updated', { detail: data.business }))
      } else {
        toast.error('Failed to update template')
      }
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 gap-0 bg-card">
        {/* Hero banner — uses profile image if available, otherwise gradient */}
        <div
          className="relative h-44 sm:h-56 overflow-hidden flex-shrink-0"
          style={{
            background: business.profileImage
              ? `linear-gradient(135deg, ${business.imageColor}99 0%, ${business.imageColor}55 100%)`
              : `linear-gradient(135deg, ${business.imageColor} 0%, ${business.imageColor}cc 60%, ${business.imageColor}80 100%)`
          }}
        >
          {/* Profile image background (if exists) */}
          {business.profileImage && (
             
            <img
              src={business.profileImage}
              alt={business.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Decorative pattern (only when no profile image) */}
          {!business.profileImage && (
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1.5px, transparent 1.5px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
              backgroundSize: '32px 32px, 24px 24px'
            }} />
          )}

          {/* Live location badge — top-center if liveTracking enabled */}
          {business.liveTracking && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE LOCATION
              </div>
            </div>
          )}

          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 left-3 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"
            onClick={onClose}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('detail_back')}
          </Button>

          {/* Share Website button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md h-9 px-3"
            onClick={handleShare}
            title="Share this website"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            <span className="text-xs font-semibold">Share</span>
          </Button>

          {/* Logo + template tag */}
          <div className="absolute bottom-4 left-5 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl border-4 border-white">
              {business.emoji}
            </div>
            <div className="pb-2">
              <div className="flex items-center gap-1.5 mb-1">
                {business.verified && (
                  <Badge className="bg-white/95 text-emerald-700 hover:bg-white/95 shadow-sm">
                    <ShieldCheck className="w-3 h-3 mr-1" /> {t('card_verified')}
                  </Badge>
                )}
                {business.premium && (
                  <Badge className="bg-amber-500/95 text-white hover:bg-amber-500/95 shadow-sm">
                    <Crown className="w-3 h-3 mr-1" /> {t('card_premium')}
                  </Badge>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md leading-tight max-w-xl">
                {business.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-white/90 text-sm">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                  <TemplateIcon className="w-3 h-3" />
                  {template.label}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  {business.rating.toFixed(1)} ({business.reviewCount})
                </span>
                {business.isB2B && <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-xs">B2B</span>}
                {business.isB2C && <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-xs">B2C</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 14rem)' }}>
          <div className="p-5 sm:p-7">
            <Tabs defaultValue="about" className="w-full">
              <TabsList
                className="mb-5 bg-muted/50 grid"
                style={{
                  gridTemplateColumns: 'repeat(' + (2 + (business.showProducts !== false ? 1 : 0) + (business.showReviews !== false ? 1 : 0)) + ', minmax(0, 1fr))'
                }}
              >
                <TabsTrigger value="about" className="text-xs sm:text-sm">{t('detail_about')}</TabsTrigger>
                {business.showProducts !== false && (
                  <TabsTrigger value="products" className="text-xs sm:text-sm">{t('detail_products')}</TabsTrigger>
                )}
                <TabsTrigger value="contact" className="text-xs sm:text-sm">{t('detail_contact')}</TabsTrigger>
                {business.showReviews !== false && (
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm">{t('detail_reviews')}</TabsTrigger>
                )}
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-5 mt-0">
                {/* Gallery images — rendered in different styles based on template */}
                {business.showGallery !== false && <GalleryRenderer business={business} />}

                <div>
                  <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 rounded" style={{ background: business.themeColor || '#0d9488' }} />
                    {t('detail_about')}
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
                    {business.description}
                  </p>
                  {business.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {business.tags.split(',').filter(Boolean).map((tag, i) => {
                        return (
                          <Badge key={i} variant="outline" className="text-xs" style={getTagStyle(business.themeColor)}>
                            <span>#{tag.trim()}</span>
                          </Badge>
                        )
                      })}

                    </div>
                  )}
                </div>

                <Separator />

                {/* Hours (only if showHours enabled) */}
                {business.showHours !== false && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-serif font-semibold text-lg mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: business.themeColor || '#0d9488' }} />
                        {t('detail_hours')}
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-1.5">
                        {days.map((d) => (
                          <div key={d.key} className="flex justify-between text-sm py-1.5 px-3 rounded-md bg-muted/30">
                            <span className="text-muted-foreground">{d.label}</span>
                            <span className="font-medium text-foreground">{hours[d.key] || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Premium website template picker (only for premium businesses) */}
                {business.premium && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-serif font-semibold text-lg mb-3 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        Website Template
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 bg-amber-50 ml-1">
                          PREMIUM
                        </Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Choose how your business website looks. Visitors will see this template when they open your shared link.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'elegant', name: 'Elegant', desc: 'Serif + soft', preview: 'from-slate-100 to-stone-200' },
                          { id: 'classic', name: 'Classic', desc: 'Warm + traditional', preview: 'from-amber-50 to-orange-100' },
                          { id: 'bold', name: 'Bold', desc: 'High contrast', preview: 'from-zinc-900 to-zinc-700' },
                          { id: 'boutique', name: 'Boutique', desc: 'Luxury + minimal', preview: 'from-rose-50 to-pink-100' }
                        ].map((tpl) => {
                          const isActive = (business.websiteTemplate || 'elegant') === tpl.id
                          return (
                            <button
                              key={tpl.id}
                              onClick={() => handleTemplateChange(tpl.id)}
                              className={`rounded-lg overflow-hidden border-2 transition-all text-left ${
                                isActive ? 'border-brand shadow-md' : 'border-border hover:border-brand/40'
                              }`}
                            >
                              <div className={`h-12 bg-gradient-to-br ${tpl.preview} flex items-center justify-center`}>
                                {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                              </div>
                              <div className="p-2 bg-card">
                                <div className="font-bold text-xs">{tpl.name}</div>
                                <div className="text-[10px] text-muted-foreground">{tpl.desc}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-0">
                <h3 className="font-serif font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded bg-brand" />
                  {t('detail_products')}
                </h3>
                {products.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {products.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-brand/40 hover:shadow-sm transition-all bg-card"
                      >
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: `${business.imageColor}15` }}
                        >
                          {p.img}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm leading-tight">{p.name}</div>
                          <div className="text-brand font-semibold text-sm mt-0.5">{p.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No products listed yet.</p>
                )}
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4 mt-0">
                <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="w-1 h-5 rounded bg-brand" />
                  {t('detail_contact')}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{t('detail_address')}</div>
                      <div className="text-sm font-medium mt-0.5">{business.address}</div>
                      <div className="text-sm text-muted-foreground">{business.city}, {business.state}{business.pincode ? ` - ${business.pincode}` : ''}</div>

                      {/* Live location indicator */}
                      {business.liveTracking && (
                        <div className="mt-2 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-700">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          LIVE LOCATION ENABLED
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-brand/40 text-brand hover:bg-brand-soft"
                          onClick={() => window.open(`https://www.openstreetmap.org/directions?from=&to=${business.lat}%2C${business.lng}`, '_blank')}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          {t('detail_getDirections')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            navigator.clipboard?.writeText(`${business.lat},${business.lng}`)
                            toast.success('Coordinates copied')
                          }}
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Copy Coordinates
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Button
                      className="h-12 bg-brand hover:bg-brand/90 text-brand-foreground font-medium"
                      onClick={() => window.location.href = `tel:${business.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="text-[10px] opacity-80 uppercase">{t('detail_callNow')}</div>
                        <div className="text-sm">{business.phone}</div>
                      </div>
                    </Button>

                    {business.whatsapp && (
                      <Button
                        variant="outline"
                        className="h-12 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-medium"
                        onClick={() => {
                          const num = business.whatsapp!.replace(/[^0-9]/g, '')
                          window.open(`https://wa.me/${num}`, '_blank')
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="text-[10px] opacity-80 uppercase">WhatsApp</div>
                          <div className="text-sm">{business.whatsapp}</div>
                        </div>
                      </Button>
                    )}

                    {business.email && (
                      <Button
                        variant="outline"
                        className="h-12 font-medium"
                        onClick={() => window.location.href = `mailto:${business.email}`}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="text-[10px] opacity-80 uppercase">{t('detail_emailNow')}</div>
                          <div className="text-sm truncate max-w-[180px]">{business.email}</div>
                        </div>
                      </Button>
                    )}

                    {business.website && (
                      <Button
                        variant="outline"
                        className="h-12 font-medium"
                        onClick={() => window.open(business.website!, '_blank')}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="text-[10px] opacity-80 uppercase">{t('detail_visitSite')}</div>
                          <div className="text-sm truncate max-w-[180px]">Visit Website</div>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Embedded mini map (only if showMap enabled) */}
                {business.showMap !== false && (
                  <div className="rounded-xl overflow-hidden border border-border/60 h-64 mt-4">
                    <iframe
                      title="map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.lng - 0.01}%2C${business.lat - 0.008}%2C${business.lng + 0.01}%2C${business.lat + 0.008}&layer=mapnik&marker=${business.lat}%2C${business.lng}`}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4 mt-0">
                <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
                  <span className="w-1 h-5 rounded bg-brand" />
                  {t('detail_reviews')}
                </h3>

                {/* Rating summary */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
                  <div className="text-center">
                    <div className="text-4xl font-serif font-bold text-amber-700">{business.rating.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= Math.round(business.rating) ? 'fill-amber-500 text-amber-500' : 'text-amber-300'}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{business.reviewCount} reviews</div>
                  </div>
                  <Separator orientation="vertical" className="h-20" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground/80 italic">
                      "{business.premium ? 'Top-rated premium business with consistent customer satisfaction.' : 'Trusted by customers in the local community.'}"
                    </p>
                  </div>
                </div>

                {/* Existing reviews */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {business.reviews && business.reviews.length > 0 ? (
                    business.reviews.map((r: any) => (
                      <div key={r.id} className="p-3 rounded-lg border border-border/50 bg-card">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm">{r.userName}</div>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-6">{t('detail_noReviews')}</p>
                  )}
                </div>

                <Separator />

                {/* Write review */}
                <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h4 className="font-serif font-semibold text-sm flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-brand" />
                    {t('detail_writeReview')}
                  </h4>
                  <div>
                    <Label className="text-xs">{t('detail_reviewName')}</Label>
                    <Input
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t('detail_reviewRating')}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)} className="p-1">
                          <Star
                            className={`w-6 h-6 transition-colors ${s <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/40 hover:text-amber-400'}`}
                          />
                        </button>
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">{reviewRating}.0</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t('detail_reviewComment')}</Label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full bg-brand hover:bg-brand/90 text-brand-foreground"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Submitting...' : t('detail_submitReview')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


// Helper component to render gallery in different template styles
function GalleryRenderer({ business }: { business: any }) {
  const gallery = business.imageUrls ? business.imageUrls.split(',').filter(Boolean) : []
  const allImages = business.profileImage && !gallery.includes(business.profileImage)
    ? [business.profileImage, ...gallery]
    : gallery
  if (allImages.length === 0) return null

  const tpl = business.websiteTemplate || 'elegant'
  const accent = business.themeColor || '#0d9488'

  if (tpl === 'bold') {
    return (
      <div>
        <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
          <span className="w-1 h-5 rounded" style={{ background: accent }} />
          Gallery
        </h3>
        <div className="rounded-xl overflow-hidden mb-2 border border-border/60">
          <img src={allImages[0]} alt="Featured" className="w-full h-48 object-cover" />
        </div>
        {allImages.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allImages.slice(1, 9).map((url: string, i: number) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted">
                <img src={url} alt={'Gallery ' + (i + 2)} className="w-full h-full object-cover hover:scale-110 transition-transform" />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (tpl === 'boutique') {
    return (
      <div>
        <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
          <span className="w-1 h-5 rounded" style={{ background: accent }} />
          Gallery
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {allImages.slice(0, 6).map((url: string, i: number) => (
            <div
              key={i}
              className={'rounded-xl overflow-hidden border-2 border-border/60 bg-muted hover:shadow-lg transition-all ' + (i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square')}
            >
              <img src={url} alt={'Gallery ' + (i + 1)} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tpl === 'classic') {
    return (
      <div>
        <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
          <span className="w-1 h-5 rounded" style={{ background: accent }} />
          Gallery
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.slice(0, 8).map((url: string, i: number) => (
            <div key={i} className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-border/60 bg-muted">
              <img src={url} alt={'Gallery ' + (i + 1)} className="w-full h-full object-cover hover:scale-110 transition-transform" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Elegant (default): grid layout
  return (
    <div>
      <h3 className="font-serif font-semibold text-lg mb-2 flex items-center gap-2">
        <span className="w-1 h-5 rounded" style={{ background: accent }} />
        Gallery
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {allImages.slice(0, 8).map((url: string, i: number) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted">
            <img src={url} alt={'Gallery ' + (i + 1)} className="w-full h-full object-cover hover:scale-110 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  )
}
