'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Store, UtensilsCrossed, Wrench, Sparkles, ChevronRight, ChevronLeft,
  Check, MapPin, Loader2, PartyPopper, Phone, Globe, Tag, Camera, Upload, Plus, X, Crown, Eye, LocateFixed
} from 'lucide-react'
import { useApp } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { toast } from 'sonner'

const MapView = dynamic(
  () => import('./MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <Skeleton className="h-[320px] rounded-xl" /> }
)

interface Props {
  open: boolean
  onClose: () => void
}

const TEMPLATES = [
  // Base templates (free)
  { id: 'retail', icon: Store, name: 'list_template_retail', desc: 'list_template_retail_desc', color: '#16a34a', emoji: '🏪', premium: false },
  { id: 'restaurant', icon: UtensilsCrossed, name: 'list_template_restaurant', desc: 'list_template_restaurant_desc', color: '#dc2626', emoji: '🍽️', premium: false },
  { id: 'service', icon: Wrench, name: 'list_template_service', desc: 'list_template_service_desc', color: '#0891b2', emoji: '🔧', premium: false },
  // Premium templates (paid/luxury)
  { id: 'premium', icon: Sparkles, name: 'list_template_premium', desc: 'list_template_premium_desc', color: '#7c3aed', emoji: '✨', premium: true },
  { id: 'calm-sage', icon: Sparkles, name: 'Calm Sage', desc: 'Serene yoga studio style — soft sand/sage tones', color: '#8a9a87', emoji: '🌿', premium: true },
  { id: 'jungle-gold', icon: Crown, name: 'Jungle Gold', desc: 'Editorial monograph — deep green + gold luxury', color: '#C9A227', emoji: '📖', premium: true },
  { id: 'athletic-bold', icon: Crown, name: 'Athletic Bold', desc: 'High-intensity gym — black + orange energy', color: '#FF5400', emoji: '💪', premium: true },
  { id: 'tech-lime', icon: Sparkles, name: 'Tech Lime', desc: 'Dark technical — lime green modern accents', color: '#d4ff3a', emoji: '⚡', premium: true },
  { id: 'journalism-red', icon: Crown, name: 'Journalism Red', desc: 'Tech review style — black + red editorial', color: '#ff2a2a', emoji: '📰', premium: true }
]

const CATEGORIES = [
  'Grocery & Essentials', 'Restaurants', 'Home Services', 'Textiles & Apparel',
  'Food & Sweets', 'Food & Beverages', 'Automobile', 'Electronics',
  'Health & Wellness', 'Handicrafts & Art', 'Beauty & Personal Care', 'Other'
]

const EMOJI_MAP: Record<string, string> = {
  'Grocery & Essentials': '🛒', 'Restaurants': '🍽️', 'Home Services': '🔧', 'Textiles & Apparel': '🧵',
  'Food & Sweets': '🍯', 'Food & Beverages': '☕', 'Automobile': '🚗', 'Electronics': '📱',
  'Health & Wellness': '🌿', 'Handicrafts & Art': '🎨', 'Beauty & Personal Care': '💇', 'Other': '🏪'
}

export function ListBusinessModal({ open, onClose }: Props) {
  const { t } = useI18n()
  const { user, setShowAuthModal, setSelectedBusinessId } = useApp()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [liveTracking, setLiveTracking] = useState(false)
  const [websiteTemplate, setWebsiteTemplate] = useState('elegant')
  // New design customization state
  const [themeColor, setThemeColor] = useState('#0d9488')
  const [fontChoice, setFontChoice] = useState('sans')
  const [layoutStyle, setLayoutStyle] = useState('standard')
  const [showGallery, setShowGallery] = useState(true)
  const [showHours, setShowHours] = useState(true)
  const [showReviews, setShowReviews] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [showProducts, setShowProducts] = useState(true)
  // Products catalog (image + name + price + details)
  const [catalogProducts, setCatalogProducts] = useState<Array<{
    id: string
    name: string
    price: string
    details: string
    image: string
  }>>([])

  const [form, setForm] = useState({
    template: 'retail',
    name: '', description: '', category: 'Grocery & Essentials', subcategory: '', tags: '',
    phone: '', whatsapp: '', email: '', website: '',
    address: '', city: '', state: 'Maharashtra', pincode: '',
    lat: 19.0760, lng: 72.8777,
    isB2B: false, isB2C: true
  })

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const handlePickLocation = (lat: number, lng: number) => {
    update('lat', lat)
    update('lng', lng)
    toast.success(`Location set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  // Image upload handler — uses /api/upload endpoint
  const handleImageUpload = async (file: File, kind: 'profile' | 'gallery') => {
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        if (kind === 'profile') {
          setProfileImage(data.url)
          toast.success('Profile image uploaded!')
        } else {
          setGalleryImages((prev) => [...prev, data.url].slice(0, 6)) // max 6 gallery images
          toast.success('Image added to gallery!')
        }
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Network error during upload')
    }
    setUploadingImage(false)
  }

  const removeGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login first')
      setShowAuthModal(true)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          emoji: EMOJI_MAP[form.category] || '🏪',
          imageColor: TEMPLATES.find((t) => t.id === form.template)?.color || '#0d9488',
          profileImage,
          imageUrls: galleryImages.join(','),
          liveTracking,
          websiteTemplate,
          themeColor,
          fontChoice,
          layoutStyle,
          showGallery,
          showHours,
          showReviews,
          showMap,
          showProducts,
          products: catalogProducts.length > 0 ? JSON.stringify(catalogProducts) : '',
          ownerId: user.id
        })
      })
      const data = await res.json()
      if (res.ok && data.business) {
        setSuccess(data.business.id)
        toast.success('Business listed successfully!')
      } else {
        toast.error(data.error || 'Failed to list business')
      }
    } catch {
      toast.error('Network error')
    }
    setSubmitting(false)
  }

  const reset = () => {
    setStep(1)
    setSuccess(null)
    setProfileImage('')
    setGalleryImages([])
    setLiveTracking(false)
    setWebsiteTemplate('elegant')
    setThemeColor('#0d9488')
    setFontChoice('sans')
    setLayoutStyle('standard')
    setShowGallery(true)
    setShowHours(true)
    setShowReviews(true)
    setShowMap(true)
    setShowProducts(true)
    setCatalogProducts([])
    setForm({
      template: 'retail', name: '', description: '', category: 'Grocery & Essentials',
      subcategory: '', tags: '', phone: '', whatsapp: '', email: '', website: '',
      address: '', city: '', state: 'Maharashtra', pincode: '',
      lat: 19.0760, lng: 72.8777, isB2B: false, isB2C: true
    })
  }

  const handleClose = () => {
    if (success) {
      reset()
    }
    onClose()
  }

  const steps = [1, 2, 3, 4]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-7xl sm:max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto p-0 gap-0 bg-card">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand to-brand/80 px-6 py-5 text-brand-foreground">
          <DialogTitle className="font-serif text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            {t('list_title')}
          </DialogTitle>
          <DialogDescription className="text-brand-foreground/80 mt-1">
            {t('list_subtitle')}
          </DialogDescription>

          {/* Stepper */}
          {!success && (
            <div className="flex items-center gap-2 mt-5">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    step === s ? 'bg-white text-brand' :
                    step > s ? 'bg-white/30 text-white' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {step > s ? <Check className="w-3 h-3" /> : <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">{s}</span>}
                    <span className="hidden sm:inline">
                      {s === 1 && t('list_step1')}
                      {s === 2 && t('list_step2')}
                      {s === 3 && t('list_step3')}
                      {s === 4 && t('list_step4')}
                    </span>
                  </div>
                  {i < 3 && <div className={`h-px w-4 ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">{t('list_success')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your business is now live on BusinessHub India. Customers near you can find you on the live map.
              </p>
              <div className="flex gap-3 justify-center pt-3">
                <Button
                  className="bg-brand hover:bg-brand/90 text-brand-foreground"
                  onClick={() => {
                    setSelectedBusinessId(success)
                    handleClose()
                  }}
                >
                  {t('list_viewListing')}
                </Button>
                <Button variant="outline" onClick={reset}>
                  {t('list_submit')} Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Template + Design Customization (split layout) */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif font-semibold text-lg">{t('list_step1')}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose template, customize design, manage products. Live preview on right updates as you change.</p>
                  </div>

                  {/* Split layout: customization LEFT, live preview RIGHT */}
                  <div className="grid lg:grid-cols-[1fr_420px] gap-5">
                    {/* ===== LEFT: Customization ===== */}
                    <div className="space-y-4 min-w-0">
                      {/* Base template selection */}
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide mb-2 block">Base Template</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                          {TEMPLATES.map((tpl) => {
                            const Icon = tpl.icon
                            const selected = form.template === tpl.id
                            return (
                              <button
                                key={tpl.id}
                                onClick={() => update('template', tpl.id)}
                                className={`text-left p-3 rounded-lg border-2 transition-all relative ${
                                  selected ? 'border-brand bg-brand-soft/30 shadow-sm' : 'border-border bg-card hover:border-brand/40'
                                }`}
                              >
                                {tpl.premium && (
                                  <span className="absolute top-1.5 right-1.5 text-amber-500">
                                    <Crown className="w-3 h-3" />
                                  </span>
                                )}
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center text-base mb-1.5"
                                  style={{ background: tpl.color + '20', color: tpl.color }}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="font-bold text-xs leading-tight">{typeof tpl.name === 'string' && tpl.name.startsWith('list_') ? t(tpl.name as any) : tpl.name}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">{typeof tpl.desc === 'string' && tpl.desc.startsWith('list_') ? t(tpl.desc as any) : tpl.desc}</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <Separator />

                      {/* Theme Color picker */}
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide mb-2 block">Theme Color</Label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { name: 'Teal', value: '#0d9488' },
                            { name: 'Blue', value: '#2563eb' },
                            { name: 'Purple', value: '#7c3aed' },
                            { name: 'Rose', value: '#e11d48' },
                            { name: 'Orange', value: '#ea580c' },
                            { name: 'Green', value: '#16a34a' },
                            { name: 'Amber', value: '#d97706' },
                            { name: 'Slate', value: '#475569' }
                          ].map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setThemeColor(color.value)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                themeColor === color.value ? 'border-navy scale-110 shadow-md' : 'border-white hover:scale-105'
                              }`}
                              style={{ background: color.value }}
                              title={color.name}
                            />
                          ))}
                          <label className="cursor-pointer relative w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-brand">
                            <input
                              type="color"
                              value={themeColor}
                              onChange={(e) => setThemeColor(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                          </label>
                        </div>
                      </div>

                      {/* Font + Layout in grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Font</Label>
                          <select
                            value={fontChoice}
                            onChange={(e) => setFontChoice(e.target.value)}
                            className="w-full h-9 px-2 text-sm border border-border rounded-md bg-background"
                          >
                            <option value="sans">Sans</option>
                            <option value="serif">Serif</option>
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block">Layout</Label>
                          <select
                            value={layoutStyle}
                            onChange={(e) => setLayoutStyle(e.target.value)}
                            className="w-full h-9 px-2 text-sm border border-border rounded-md bg-background"
                          >
                            <option value="compact">Compact</option>
                            <option value="standard">Standard</option>
                            <option value="spacious">Spacious</option>
                          </select>
                        </div>
                      </div>

                      {/* Section Toggles */}
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide mb-2 block">Sections to Show</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'showGallery', label: 'Image Gallery', state: showGallery, set: setShowGallery },
                            { id: 'showProducts', label: 'Products Catalog', state: showProducts, set: setShowProducts },
                            { id: 'showHours', label: 'Business Hours', state: showHours, set: setShowHours },
                            { id: 'showMap', label: 'Location Map', state: showMap, set: setShowMap },
                            { id: 'showReviews', label: 'Customer Reviews', state: showReviews, set: setShowReviews }
                          ].map((s) => (
                            <label key={s.id} className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${s.state ? 'border-brand bg-brand-soft/20' : 'border-border hover:border-brand/30'}`}>
                              <Checkbox checked={s.state} onCheckedChange={(v) => s.set(!!v)} />
                              <span className="text-xs font-medium">{s.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Products Catalog Manager */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-semibold uppercase tracking-wide">Products Catalog</Label>
                          <button
                            type="button"
                            onClick={() => setCatalogProducts([...catalogProducts, { id: Date.now().toString(), name: '', price: '', details: '', image: '' }])}
                            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Product
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">Add products with image, name, price, and details. These show on your website.</p>

                        {catalogProducts.length === 0 ? (
                          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                            <p className="text-xs text-muted-foreground">No products yet. Click "Add Product" to create your catalog.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {catalogProducts.map((prod, idx) => (
                              <div key={prod.id} className="border border-border rounded-lg p-3 bg-muted/20">
                                <div className="flex items-start gap-3">
                                  {/* Product image */}
                                  <label className="cursor-pointer flex-shrink-0">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const f = e.target.files?.[0]
                                        if (!f) return
                                        setUploadingImage(true)
                                        try {
                                          const fd = new FormData()
                                          fd.append('file', f)
                                          const res = await fetch('/api/upload', { method: 'POST', body: fd })
                                          const data = await res.json()
                                          if (res.ok && data.url) {
                                            const updated = [...catalogProducts]
                                            updated[idx] = { ...prod, image: data.url }
                                            setCatalogProducts(updated)
                                            toast.success('Product image uploaded!')
                                          }
                                        } catch { toast.error('Upload failed') }
                                        setUploadingImage(false)
                                      }}
                                    />
                                    <div className="w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-card hover:border-brand">
                                      {prod.image ? (
                                        <img src={prod.image} alt="" className="w-full h-full object-cover" />
                                      ) : uploadingImage ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                      ) : (
                                        <Camera className="w-4 h-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </label>

                                  {/* Product fields */}
                                  <div className="flex-1 min-w-0 space-y-1.5">
                                    <input
                                      type="text"
                                      placeholder="Product name"
                                      value={prod.name}
                                      onChange={(e) => {
                                        const updated = [...catalogProducts]
                                        updated[idx] = { ...prod, name: e.target.value }
                                        setCatalogProducts(updated)
                                      }}
                                      className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Price (e.g. ₹450)"
                                      value={prod.price}
                                      onChange={(e) => {
                                        const updated = [...catalogProducts]
                                        updated[idx] = { ...prod, price: e.target.value }
                                        setCatalogProducts(updated)
                                      }}
                                      className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Details (e.g. 5kg, organic, etc.)"
                                      value={prod.details}
                                      onChange={(e) => {
                                        const updated = [...catalogProducts]
                                        updated[idx] = { ...prod, details: e.target.value }
                                        setCatalogProducts(updated)
                                      }}
                                      className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                                    />
                                  </div>

                                  {/* Delete button */}
                                  <button
                                    type="button"
                                    onClick={() => setCatalogProducts(catalogProducts.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:bg-red-50 rounded p-1 flex-shrink-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ===== RIGHT: LIVE PREVIEW (sticky) ===== */}
                    <div className="hidden lg:block">
                      <div className="sticky top-4">
                        <div className="bg-card rounded-xl border-2 border-dashed border-brand/30 overflow-hidden">
                          <div className="bg-brand/10 px-3 py-2 flex items-center justify-between border-b border-brand/20">
                            <span className="text-xs font-bold text-brand flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              LIVE PREVIEW
                            </span>
                            <span className="text-[10px] text-muted-foreground">{form.template}</span>
                          </div>
                          <div
                            className={`p-3 ${layoutStyle === 'compact' ? 'space-y-2' : layoutStyle === 'spacious' ? 'space-y-4' : 'space-y-3'}`}
                            style={{ fontFamily: fontChoice === 'serif' || fontChoice === 'classic' ? 'Georgia, serif' : fontChoice === 'modern' ? 'monospace' : 'inherit' }}
                          >
                            {/* Mini website preview */}
                            <div
                              className="rounded-lg p-3 text-white"
                              style={{ background: 'linear-gradient(135deg, ' + themeColor + ' 0%, ' + themeColor + 'cc 100%)' }}
                            >
                              <div className="text-base font-bold">{form.name || 'Your Business Name'}</div>
                              <div className="text-[10px] opacity-90 mt-0.5">{form.category || 'Category'} · {form.city || 'City'}</div>
                            </div>

                            {/* Gallery row */}
                            {showGallery && (
                              <div className="flex gap-1.5 overflow-x-auto">
                                {profileImage && (
                                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                    <img src={profileImage} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                {galleryImages.slice(0, 3).map((url, i) => (
                                  <div key={i} className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {!profileImage && galleryImages.length === 0 && (
                                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xl flex-shrink-0">🖼️</div>
                                )}
                              </div>
                            )}

                            {/* Description */}
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {form.description || 'Your business description will appear here. Add details in Step 2.'}
                            </p>

                            {/* Products preview */}
                            {showProducts && catalogProducts.length > 0 && (
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold uppercase text-muted-foreground">Products</div>
                                {catalogProducts.slice(0, 3).map((p, i) => (
                                  <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-muted/40">
                                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                                      {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : '📦'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[11px] font-semibold truncate">{p.name || 'Product name'}</div>
                                      <div className="text-[10px] text-muted-foreground">{p.price || '₹0'}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Section badges */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {showHours && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">⏰ Open</span>}
                              {showProducts && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">🛍️ Products</span>}
                              {showReviews && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">⭐ Reviews</span>}
                              {showMap && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">📍 Map</span>}
                            </div>

                            {/* CTA button */}
                            <button
                              type="button"
                              className="w-full py-2 rounded-md text-xs font-bold text-white"
                              style={{ background: themeColor }}
                            >
                              Get Best Price
                            </button>
                          </div>
                        </div>

                        {/* Mobile preview note */}
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                          Preview updates live as you customize
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile preview (shown below on small screens) */}
                  <div className="lg:hidden bg-card rounded-xl border-2 border-dashed border-brand/30 overflow-hidden">
                    <div className="bg-brand/10 px-3 py-2 border-b border-brand/20">
                      <span className="text-xs font-bold text-brand flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        LIVE PREVIEW
                      </span>
                    </div>
                    <div className="p-3 space-y-2" style={{ fontFamily: fontChoice === 'serif' || fontChoice === 'classic' ? 'Georgia, serif' : 'inherit' }}>
                      <div className="rounded-lg p-3 text-white" style={{ background: 'linear-gradient(135deg, ' + themeColor + ' 0%, ' + themeColor + 'cc 100%)' }}>
                        <div className="text-base font-bold">{form.name || 'Your Business Name'}</div>
                        <div className="text-[10px] opacity-90 mt-0.5">{form.category || 'Category'} · {form.city || 'City'}</div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {form.description || 'Your business description will appear here.'}
                      </p>
                      <button type="button" className="w-full py-2 rounded-md text-xs font-bold text-white" style={{ background: themeColor }}>
                        Get Best Price
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-semibold text-lg">{t('list_step2')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label>{t('list_field_businessName')} *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="e.g. Sharma Kirana Store"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>{t('list_field_description')} *</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        placeholder="Describe your business in detail..."
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_category')}</Label>
                      <Select value={form.category} onValueChange={(v) => update('category', v)}>
                        <SelectTrigger className="mt-1 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('list_field_subcategory')}</Label>
                      <Input
                        value={form.subcategory}
                        onChange={(e) => update('subcategory', e.target.value)}
                        placeholder="e.g. Kirana Stores"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>{t('list_field_tags')}</Label>
                      <Input
                        value={form.tags}
                        onChange={(e) => update('tags', e.target.value)}
                        placeholder="grocery, wholesale, pulses, spices"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact + Location */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-semibold text-lg">{t('list_step3')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{t('list_field_phone')} *</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_whatsapp')}</Label>
                      <Input
                        value={form.whatsapp}
                        onChange={(e) => update('whatsapp', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_email')}</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="business@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_website')}</Label>
                      <Input
                        value={form.website}
                        onChange={(e) => update('website', e.target.value)}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>{t('list_field_address')} *</Label>
                      <Textarea
                        value={form.address}
                        onChange={(e) => update('address', e.target.value)}
                        placeholder="Shop 12, Linking Road, Bandra West"
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_city')} *</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        placeholder="Mumbai"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_state')} *</Label>
                      <Input
                        value={form.state}
                        onChange={(e) => update('state', e.target.value)}
                        placeholder="Maharashtra"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('list_field_pincode')}</Label>
                      <Input
                        value={form.pincode}
                        onChange={(e) => update('pincode', e.target.value)}
                        placeholder="400050"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={form.isB2B} onCheckedChange={(v) => update('isB2B', !!v)} />
                        <span className="text-sm">{t('list_field_b2b')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={form.isB2C} onCheckedChange={(v) => update('isB2C', !!v)} />
                        <span className="text-sm">{t('list_field_b2c')}</span>
                      </label>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Map picker */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand" />
                        {t('list_pickLocation')}
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          if (!navigator.geolocation) {
                            toast.error('Geolocation not supported')
                            return
                          }
                          toast.info('Detecting your location...')
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              handlePickLocation(pos.coords.latitude, pos.coords.longitude)
                            },
                            () => {
                              toast.error('Could not detect location. Please pick on map.')
                            },
                            { enableHighAccuracy: true, timeout: 10000 }
                          )
                        }}
                        className="text-xs font-semibold text-brand hover:underline flex items-center gap-1.5 border border-brand/30 rounded-md px-3 py-1.5 hover:bg-brand-soft/30 transition-colors"
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        Use Current Location
                      </button>
                    </div>
                    <MapView
                      businesses={[]}
                      pickMode
                      onPickLocation={handlePickLocation}
                      height="320px"
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                      <Badge variant="outline" className="border-brand/30 text-brand bg-brand-soft/30">
                        Lat: {form.lat.toFixed(4)}, Lng: {form.lng.toFixed(4)}
                      </Badge>
                      <label className="flex items-center gap-2 cursor-pointer ml-auto">
                        <Checkbox
                          checked={liveTracking}
                          onCheckedChange={(v) => setLiveTracking(!!v)}
                        />
                        <span className="text-xs">Enable Live Location Tracking on Profile</span>
                      </label>
                    </div>
                  </div>

                  {/* Image upload section */}
                  <Separator className="my-3" />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      <Camera className="w-4 h-4 text-brand" />
                      Profile Image
                    </Label>
                    <div className="flex items-center gap-3">
                      {/* Preview */}
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30 flex-shrink-0">
                        {profileImage ? (
                           
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8 text-muted-foreground/50" />
                        )}
                      </div>
                      {/* Upload button */}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleImageUpload(f, 'profile')
                          }}
                          disabled={uploadingImage}
                        />
                        <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border ${
                          uploadingImage
                            ? 'bg-muted text-muted-foreground border-border'
                            : 'bg-card text-navy border-border hover:border-brand hover:bg-brand-soft/30'
                        }`}>
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              {profileImage ? 'Change Image' : 'Upload Image'}
                            </>
                          )}
                        </span>
                      </label>
                    </div>
                    <p className="text-[11px] text-muted-foreground">JPG/PNG/WEBP, max 5MB. This image will appear in your profile hero banner.</p>
                  </div>

                  {/* Gallery images */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Gallery Images (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {galleryImages.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                          { }
                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {galleryImages.length < 6 && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handleImageUpload(f, 'gallery')
                            }}
                            disabled={uploadingImage}
                          />
                          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-brand hover:bg-brand-soft/30 transition-colors">
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Plus className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Up to 6 images. Show your products, store interior, team, etc.</p>
                  </div>

                  {/* Premium website template picker */}
                  {form.template === 'premium' && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          Premium Website Template
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'elegant', name: 'Elegant', desc: 'Serif + soft colors' },
                            { id: 'classic', name: 'Classic', desc: 'Traditional + warm' },
                            { id: 'bold', name: 'Bold', desc: 'Modern + high contrast' },
                            { id: 'boutique', name: 'Boutique', desc: 'Luxury + minimal' }
                          ].map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => setWebsiteTemplate(tpl.id)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                websiteTemplate === tpl.id
                                  ? 'border-brand bg-brand-soft/30 shadow-sm'
                                  : 'border-border hover:border-brand/40'
                              }`}
                            >
                              <div className="font-bold text-sm">{tpl.name}</div>
                              <div className="text-[10px] text-muted-foreground">{tpl.desc}</div>
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">Premium businesses get a customizable mini-website with their own template.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-semibold text-lg">{t('list_step4')}</h3>
                  <div className="rounded-xl border border-border/60 overflow-hidden">
                    <div
                      className="h-24 flex items-center px-5 text-white"
                      style={{ background: `linear-gradient(135deg, ${TEMPLATES.find((t) => t.id === form.template)?.color}, ${TEMPLATES.find((t) => t.id === form.template)?.color}aa)` }}
                    >
                      <div className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center text-2xl mr-3">
                        {EMOJI_MAP[form.category] || '🏪'}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-xl">{form.name || 'Business Name'}</div>
                        <div className="text-sm opacity-90">{form.category} · {form.city || 'City'}</div>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 text-sm">
                      <div>
                        <div className="text-xs uppercase text-muted-foreground mb-1">Description</div>
                        <p>{form.description || '—'}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</div>
                          <p>{form.phone || '—'}</p>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</div>
                          <p>{form.address || '—'}, {form.city}, {form.state}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {form.isB2B && <Badge variant="outline" className="text-brand border-brand/30">B2B</Badge>}
                        {form.isB2C && <Badge variant="outline" className="text-brand border-brand/30">B2C</Badge>}
                        <Badge variant="outline" className="text-muted-foreground">
                          {TEMPLATES.find((t) => t.id === form.template)?.emoji} {t(TEMPLATES.find((tp) => tp.id === form.template)!.name as any)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer nav */}
              <div className="flex justify-between items-center pt-5 mt-5 border-t border-border/60">
                <Button
                  variant="ghost"
                  onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {step > 1 ? t('list_back') : 'Cancel'}
                </Button>
                {step < 4 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    className="bg-brand hover:bg-brand/90 text-brand-foreground"
                    disabled={step === 2 && (!form.name || !form.description)}
                  >
                    {t('list_next')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-brand hover:bg-brand/90 text-brand-foreground"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                    {t('list_submit')}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
