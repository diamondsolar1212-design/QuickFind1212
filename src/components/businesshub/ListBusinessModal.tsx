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
  Check, MapPin, Loader2, PartyPopper, Phone, Globe, Tag
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
  { id: 'retail', icon: Store, name: 'list_template_retail', desc: 'list_template_retail_desc', color: '#16a34a', emoji: '🏪' },
  { id: 'restaurant', icon: UtensilsCrossed, name: 'list_template_restaurant', desc: 'list_template_restaurant_desc', color: '#dc2626', emoji: '🍽️' },
  { id: 'service', icon: Wrench, name: 'list_template_service', desc: 'list_template_service_desc', color: '#0891b2', emoji: '🔧' },
  { id: 'premium', icon: Sparkles, name: 'list_template_premium', desc: 'list_template_premium_desc', color: '#7c3aed', emoji: '✨' }
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
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 bg-card">
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

        <div className="p-6">
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
              {/* Step 1: Template */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-semibold text-lg">{t('list_step1')}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {TEMPLATES.map((tpl) => {
                      const Icon = tpl.icon
                      const selected = form.template === tpl.id
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => update('template', tpl.id)}
                          className={`text-left p-5 rounded-xl border-2 transition-all ${
                            selected
                              ? 'border-brand bg-brand-soft/30 shadow-md'
                              : 'border-border bg-card hover:border-brand/40 hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                              style={{ background: `${tpl.color}20`, color: tpl.color }}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="font-serif font-semibold text-base flex items-center gap-2">
                                {t(tpl.name as any)}
                                {selected && <Check className="w-4 h-4 text-brand" />}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {t(tpl.desc as any)}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
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
                    <Label className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-brand" />
                      {t('list_pickLocation')}
                    </Label>
                    <MapView
                      businesses={[]}
                      pickMode
                      onPickLocation={handlePickLocation}
                      height="320px"
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="border-brand/30 text-brand bg-brand-soft/30">
                        Lat: {form.lat.toFixed(4)}, Lng: {form.lng.toFixed(4)}
                      </Badge>
                    </div>
                  </div>
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
