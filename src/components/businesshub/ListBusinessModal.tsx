'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  Store, Sparkles, ChevronRight, ChevronLeft,
  Check, MapPin, Loader2, PartyPopper, Phone, Globe, Tag, Camera, Upload, Plus, X, Eye, LocateFixed,
  Images, Pencil
} from 'lucide-react'
import { useApp } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { generateBusinessWebsite, withPreviewEditor, MIN_IMAGES, type BusinessData } from '@/lib/template-engine'
import { profileFor } from '@/lib/site-engine/categories'
import { DEFAULT_HERO_IMAGES, defaultHeroImages, sampleProducts } from '@/lib/templates/samples'
import { detectCategoryFromName, suggestBusinessDetails } from '@/lib/business-details-suggestions'
import { autoSiteContent } from '@/lib/website-autocontent'
import { AutoDetailsPanel } from './AutoDetailsPanel'
import { SITE_TEMPLATES, templateById } from './templateCatalog'
import { ScaledSiteFrame, TemplateThumb } from './SitePreviewFrame'
import { toast } from 'sonner'

const MapView = dynamic(
  () => import('./MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <Skeleton className="h-[320px] rounded-xl" /> }
)

interface Props {
  open: boolean
  onClose: () => void
}

interface SiteCopyFields {
  heroTitle: string
  heroTagline: string
  aboutTitle: string
  aboutText: string
  galleryTitle: string
  offeringsTitle: string
  reviewsTitle: string
  visitTitle: string
  footerNote: string
  navAbout: string
  navGallery: string
  navOfferings: string
  navReviews: string
  navVisit: string
  navHome: string
}

const EMPTY_SITE_COPY: SiteCopyFields = {
  heroTitle: '',
  heroTagline: '',
  aboutTitle: '',
  aboutText: '',
  galleryTitle: '',
  offeringsTitle: '',
  reviewsTitle: '',
  visitTitle: '',
  footerNote: '',
  navAbout: '',
  navGallery: '',
  navOfferings: '',
  navReviews: '',
  navVisit: '',
  navHome: ''
}

const SITE_COPY_KEYS = Object.keys(EMPTY_SITE_COPY) as Array<keyof SiteCopyFields>

/** Only non-empty overrides are stored, so templates keep their own copy by default. */
function siteContentJson(copy: SiteCopyFields, texts: Record<string, string> = {}): string {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(copy)) {
    const trimmed = value.trim()
    if (trimmed) out[key] = trimmed
  }
  const cleanedTexts: Record<string, string> = {}
  for (const [key, value] of Object.entries(texts)) {
    const trimmed = String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 400)
    if (trimmed) cleanedTexts[key] = trimmed
  }
  if (Object.keys(cleanedTexts).length > 0) out.texts = cleanedTexts
  return Object.keys(out).length > 0 ? JSON.stringify(out) : ''
}

/** Later sources win, but only when they actually contain text. */
function mergeSiteCopy(...sources: Array<Partial<SiteCopyFields>>): SiteCopyFields {
  const out: SiteCopyFields = { ...EMPTY_SITE_COPY }
  for (const source of sources) {
    for (const key of SITE_COPY_KEYS) {
      const value = String(source[key] ?? '').trim()
      if (value) out[key] = value
    }
  }
  return out
}

const CATEGORIES = [
  'Grocery & Essentials', 'Restaurants', 'Home Services', 'Textiles & Apparel',
  'Food & Sweets', 'Food & Beverages', 'Automobile', 'Electronics',
  'Health & Wellness', 'Handicrafts & Art', 'Beauty & Personal Care',
  'Real Estate', 'Doctors', 'Wedding Planning', 'Education', 'Travel Booking',
  'B2B Suppliers', 'Repair Services', 'Other'
]

// Ready-made hero photos so a new website has a scrolling hero strip before
// the provider uploads anything. Local files keep it working offline.
const DEFAULT_HERO_PICK = DEFAULT_HERO_IMAGES.slice(0, 4)

// Gallery slots the wizard offers; the hero strip and gallery render all of them.
const MAX_GALLERY_IMAGES = 12

const EMOJI_MAP: Record<string, string> = {
  'Grocery & Essentials': '🛒', 'Restaurants': '🍽️', 'Home Services': '🔧', 'Textiles & Apparel': '🧵',
  'Food & Sweets': '🍯', 'Food & Beverages': '☕', 'Automobile': '🚗', 'Electronics': '📱',
  'Health & Wellness': '🌿', 'Handicrafts & Art': '🎨', 'Beauty & Personal Care': '💇',
  'Real Estate': '🏠', 'Doctors': '⚕️', 'Wedding Planning': '💍', 'Education': '🎓',
  'Travel Booking': '✈️', 'B2B Suppliers': '🏭', 'Repair Services': '🛠️', 'Other': '🏪'
}

/** Every website field auto-create can fill in one go. */
interface DesignSnapshot {
  template: string
  themeColor: string
  fontChoice: string
  layoutStyle: string
  showGallery: boolean
  showHours: boolean
  showReviews: boolean
  showMap: boolean
  showProducts: boolean
  products: string
  ctaLabel: string
  ctaUrl: string
  cta2Label: string
  cta2Url: string
  heroImages: string
  heroAutoScroll: boolean
  /** Editable page copy, buttons and custom links carried by this snapshot. */
  copy: SiteCopyFields
  siteContent: string
  links: string
  /** Present when `products` is the generated sample list for this category. */
  autoSampleJson?: string
}

/** Typography + spacing that suits each category's design family. */
function fontForFamily(family: string): string {
  if (family === 'luxury-editorial' || family === 'organic-lifestyle') return 'serif'
  if (family === 'modern-dark' || family === 'bold-creative') return 'modern'
  return 'sans'
}

function layoutForFamily(family: string): string {
  if (family === 'luxury-editorial' || family === 'organic-lifestyle') return 'spacious'
  if (family === 'bold-creative') return 'compact'
  return 'standard'
}

export function ListBusinessModal({ open, onClose }: Props) {
  const { t } = useI18n()
  const { user, setShowAuthModal, setSelectedBusinessId } = useApp()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  // True once auto-create generated the design, so publishing does not demand
  // four uploaded photos — the generated site already has category hero images.
  const [autoCreated, setAutoCreated] = useState(false)
  // The exact sample catalogue auto-create wrote last. If the provider has not
  // edited it, a category change regenerates fresh samples for the new trade.
  const [autoSampleJson, setAutoSampleJson] = useState<string | null>(null)
  // Chooser for the auto-generated description / category / subcategory / tags.
  const [showSuggestions, setShowSuggestions] = useState(false)
  // True once the provider chooses a category by hand, so auto-detect does not
  // overwrite their choice on the next auto-create click.
  const [categoryPicked, setCategoryPicked] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [liveTracking, setLiveTracking] = useState(false)
  // True once the provider picks a template by hand; until then the template
  // follows the category chosen in the Business Details step.
  const [templatePicked, setTemplatePicked] = useState(false)
  // New design customization state
  const [themeColor, setThemeColor] = useState('#0d9488')
  const [fontChoice, setFontChoice] = useState('sans')
  const [layoutStyle, setLayoutStyle] = useState('standard')
  const [showGallery, setShowGallery] = useState(true)
  const [showHours, setShowHours] = useState(true)
  const [showReviews, setShowReviews] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [showProducts, setShowProducts] = useState(true)
  // Editable website buttons + custom links
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [cta2Label, setCta2Label] = useState('')
  const [cta2Url, setCta2Url] = useState('')
  const [siteLinks, setSiteLinks] = useState<Array<{ id: string; label: string; url: string }>>([])
  // Website experience: hero strip, editable copy and page mode
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [heroAutoScroll, setHeroAutoScroll] = useState(true)
  const [siteMode] = useState<'scroll' | 'pages'>('pages')
  const [siteCopy, setSiteCopy] = useState<SiteCopyFields>({ ...EMPTY_SITE_COPY })
  // True while `siteCopy` only holds auto-generated text, so a later
  // auto-create run may refresh it; any manual edit flips this to false.
  const [copyAuto, setCopyAuto] = useState(false)
  const [linksAuto, setLinksAuto] = useState(false)
  // Free-form click-to-edit copy keyed by its DOM path in the generated site.
  const [siteTexts, setSiteTexts] = useState<Record<string, string>>({})
  // Products catalog (image + name + price + details)
  const [catalogProducts, setCatalogProducts] = useState<Array<{
    id: string
    name: string
    price: string
    details: string
    image: string
  }>>([])

  const [form, setForm] = useState({
    template: 'blush-atelier',
    name: '', description: '', category: 'Grocery & Essentials', subcategory: '', tags: '',
    phone: '', whatsapp: '', email: '', website: '',
    address: '', city: '', state: 'Maharashtra', pincode: '',
    lat: 19.0760, lng: 72.8777,
    isB2B: false, isB2C: true
  })

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  // The website is composed from the business details, so the category's design
  // family is picked as soon as the category is known. A manual choice wins.
  const recommendedTemplate = profileFor(form.category).family
  useEffect(() => {
    if (templatePicked) return
    setForm((f) => (f.template === recommendedTemplate ? f : { ...f, template: recommendedTemplate }))
  }, [recommendedTemplate, templatePicked])

  // Recommended family first, the rest keep the curated order.
  const templateChoices = useMemo(
    () =>
      [...SITE_TEMPLATES].sort(
        (a, b) => Number(b.id === recommendedTemplate) - Number(a.id === recommendedTemplate)
      ),
    [recommendedTemplate]
  )

  const totalImages = (profileImage ? 1 : 0) + galleryImages.length
  const allImages = useMemo(
    () => (profileImage ? [profileImage, ...galleryImages] : galleryImages),
    [profileImage, galleryImages]
  )
  // A brand-new website opens with ready-made hero photos, so the scrolling
  // strip is never empty; uploaded photos take over as soon as there are any.
  const heroFallback = allImages.length > 0 ? allImages : DEFAULT_HERO_PICK
  const heroSelected = heroImages.length > 0 ? heroImages : heroFallback
  const heroChoices = Array.from(new Set([...allImages, ...DEFAULT_HERO_IMAGES]))

  // Snapshot of everything the generated website needs, so every wizard step
  // can show the same live preview without duplicating the mapping.
  const previewBusiness = useMemo<BusinessData>(() => ({
    name: form.name || 'Your Business Name',
    description: form.description || 'Your business description will appear here. Fill in your details on the left and watch your website take shape.',
    category: form.category || 'Category',
    subcategory: form.subcategory,
    city: form.city || 'City',
    state: form.state || 'State',
    address: form.address || 'Address',
    phone: form.phone || '+91 98765 43210',
    whatsapp: form.whatsapp,
    email: form.email,
    website: form.website,
    rating: 4.5,
    reviewCount: 100,
    profileImage,
    imageUrls: galleryImages.join(','),
    products: catalogProducts.length > 0 ? JSON.stringify(catalogProducts) : '',
    hours: '',
    themeColor,
    template: form.template,
    ctaLabel,
    ctaUrl,
    cta2Label,
    cta2Url,
    links: JSON.stringify(siteLinks.filter((l) => l.label.trim() && l.url.trim())),
    heroImages: heroSelected.join(','),
    heroAutoScroll,
    siteMode,
    siteContent: siteContentJson(siteCopy, siteTexts),
    fontChoice,
    layoutStyle,
    showGallery,
    showHours,
    showReviews,
    showMap,
    showProducts
  }), [
    form.name, form.description, form.category, form.subcategory,
    form.city, form.state, form.address, form.phone, form.whatsapp,
    form.email, form.website, form.template,
    profileImage, galleryImages, catalogProducts, themeColor,
    ctaLabel, ctaUrl, cta2Label, cta2Url, siteLinks,
    heroImages, heroAutoScroll, siteMode, siteCopy, siteTexts,
    fontChoice, layoutStyle, showGallery, showHours, showReviews, showMap, showProducts
  ])

  // Full website copy for the current details. The auto-create flow uses this
  // to fill every heading, paragraph, button and custom link in one click.
  const autoContent = useMemo(
    () =>
      autoSiteContent({
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        tags: form.tags,
        city: form.city,
        state: form.state,
        address: form.address,
        description: form.description,
        phone: form.phone,
        email: form.email,
        whatsapp: form.whatsapp
      }),
    [
      form.name, form.category, form.subcategory, form.tags, form.city, form.state,
      form.address, form.description, form.phone, form.email, form.whatsapp
    ]
  )

  // Everything auto-create needs, derived from the business details. Manual
  // choices already made by the provider win, so auto-create never wipes work.
  const autoDesign = useMemo<DesignSnapshot>(() => {
    const profile = profileFor(form.category)
    const family = profile.family
    const tpl = templateById(family)
    const photos = allImages.length > 0 ? allImages : defaultHeroImages(form.category)
    const heroPool = Array.from(new Set([...photos, ...defaultHeroImages(form.category)]))
    const sampleList = sampleProducts(previewBusiness, photos).map((p, i) => ({
      id: String(i + 1),
      name: String(p.name ?? ''),
      price: String(p.price ?? ''),
      details: String(p.details ?? p.description ?? ''),
      image: String(p.image ?? photos[i % Math.max(photos.length, 1)] ?? '')
    }))
    const sampleJson = JSON.stringify(sampleList)
    const currentJson = catalogProducts.length > 0 ? JSON.stringify(catalogProducts) : ''
    // Refresh samples after a category change, but never overwrite a catalogue
    // the provider has edited themselves.
    const useSample = !currentJson || (autoSampleJson !== null && currentJson === autoSampleJson)
    const sample = useSample ? sampleList : catalogProducts
    const tel = String(form.whatsapp || form.phone || '').replace(/[^\d+]/g, '')
    // Auto copy fills every field, while anything the provider already typed
    // wins. Values left over from an earlier auto-create run are not "manual"
    // — regenerating them keeps the copy in sync with the latest details
    // (city, phone, links) instead of freezing the first draft.
    const manualCopy = copyAuto ? {} : siteCopy
    const autoCopy = mergeSiteCopy(autoContent.copy, manualCopy)
    const manualLinks = linksAuto ? [] : siteLinks.filter((link) => link.label.trim() && link.url.trim())
    const autoLinks = manualLinks.length > 0 ? manualLinks : autoContent.links
    return {
      template: templatePicked ? form.template : family,
      themeColor: themeColor !== '#0d9488' ? themeColor : (tpl?.color || '#0d9488'),
      fontChoice: fontChoice !== 'sans' ? fontChoice : fontForFamily(family),
      layoutStyle: layoutStyle !== 'standard' ? layoutStyle : layoutForFamily(family),
      showGallery,
      showHours,
      showReviews,
      showMap,
      showProducts,
      products: JSON.stringify(sample),
      ctaLabel: ctaLabel || profile.cta.primary,
      ctaUrl: ctaUrl || (tel ? `tel:${tel}` : ''),
      cta2Label: cta2Label || profile.cta.secondary,
      cta2Url: cta2Url || '#offerings',
      heroImages: heroPool.slice(0, 8).join(','),
      heroAutoScroll: true,
      copy: autoCopy,
      siteContent: siteContentJson(autoCopy, siteTexts),
      links: JSON.stringify(autoLinks),
      autoSampleJson: useSample ? sampleJson : undefined
    }
  }, [
    form.category, form.template, form.phone, form.whatsapp, templatePicked,
    themeColor, fontChoice, layoutStyle, showGallery, showHours, showReviews,
    showMap, showProducts, allImages, catalogProducts, autoSampleJson, ctaLabel,
    ctaUrl, cta2Label, cta2Url, previewBusiness, autoContent, siteCopy, siteTexts,
    siteLinks, copyAuto, linksAuto
  ])

  // Snapshot used by the normal (manual) submit path.
  const currentDesign = useMemo<DesignSnapshot>(() => ({
    template: form.template,
    themeColor,
    fontChoice,
    layoutStyle,
    showGallery,
    showHours,
    showReviews,
    showMap,
    showProducts,
    products: catalogProducts.length > 0 ? JSON.stringify(catalogProducts) : '',
    ctaLabel,
    ctaUrl,
    cta2Label,
    cta2Url,
    heroImages: heroSelected.join(','),
    heroAutoScroll,
    copy: siteCopy,
    siteContent: siteContentJson(siteCopy, siteTexts),
    links: JSON.stringify(siteLinks.filter((link) => link.label.trim() && link.url.trim()))
  }), [
    form.template, themeColor, fontChoice, layoutStyle, showGallery, showHours,
    showReviews, showMap, showProducts, catalogProducts, ctaLabel, ctaUrl,
    cta2Label, cta2Url, heroSelected, heroAutoScroll, siteCopy, siteTexts, siteLinks
  ])

  // Chooser options: description variants, categories, subcategories and tags
  // derived from the current name/category/location.
  const detailSuggestions = useMemo(
    () =>
      suggestBusinessDetails({
        name: form.name,
        category: form.category,
        city: form.city,
        state: form.state
      }),
    [form.name, form.category, form.city, form.state]
  )

  // Style samples for the template grid: fixed copy + the user's photos, so
  // typing a description never re-renders twenty websites.
  const thumbSeed = useMemo<BusinessData>(() => ({
    name: form.name || 'Sample Business',
    description: 'Premium business website with quality products and services.',
    category: form.category || 'Category',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Main Road',
    phone: '+91 98765 43210',
    rating: 4.5,
    reviewCount: 100,
    profileImage: profileImage || DEFAULT_HERO_IMAGES[0],
    imageUrls: (profileImage ? [profileImage, ...galleryImages] : galleryImages).concat(DEFAULT_HERO_PICK).join(','),
    heroImages: (heroImages.length > 0 ? heroImages : DEFAULT_HERO_PICK).join(','),
    products: JSON.stringify([
      { id: '1', name: 'Premium Product', price: '₹499', details: 'Best seller item with great quality.', image: DEFAULT_HERO_IMAGES[1] },
      { id: '2', name: 'Signature Service', price: '₹999', details: 'Professional service for your needs.', image: DEFAULT_HERO_IMAGES[2] },
      { id: '3', name: 'Value Pack', price: '₹299', details: 'Affordable and reliable.', image: DEFAULT_HERO_IMAGES[3] },
      { id: '4', name: 'New Arrival', price: '₹799', details: 'Freshly added to our catalogue.', image: DEFAULT_HERO_IMAGES[4] || DEFAULT_HERO_IMAGES[0] }
    ]),
    hours: '',
    themeColor,
    template: 'retail'
  }), [form.name, form.category, profileImage, galleryImages, heroImages, themeColor])

  const fillAddressFromCoords = async (lat: number, lng: number, force: boolean) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { signal: controller.signal, headers: { Accept: 'application/json' } }
      )
      if (!res.ok) return
      const data = await res.json()
      const addr = data?.address || {}
      const street = [addr.house_number, addr.road || addr.pedestrian || addr.neighbourhood].filter(Boolean).join(' ')
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || ''
      const state = addr.state || ''
      const pincode = addr.postcode || ''
      if (!street && !city && !state && !pincode) return
      setForm((f) => ({
        ...f,
        address: force || !f.address.trim() ? (street || f.address) : f.address,
        city: force || !f.city.trim() ? (city || f.city) : f.city,
        state: force || !f.state.trim() ? (state || f.state) : f.state,
        pincode: force || !f.pincode.trim() ? (pincode || f.pincode) : f.pincode
      }))
      const filled = [street, city, state, pincode].filter(Boolean).join(', ')
      if (filled) toast.success(`Address filled: ${filled}`)
    } catch {
      // The map pin still saves the coordinates when lookup is unavailable.
    } finally {
      clearTimeout(timer)
    }
  }

  const handlePickLocation = (lat: number, lng: number, force = false) => {
    update('lat', lat)
    update('lng', lng)
    toast.success(`Location set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    void fillAddressFromCoords(lat, lng, force)
  }

  const toggleHeroImage = (url: string) => {
    const base = heroImages.length > 0 ? heroImages : heroFallback
    if (base.includes(url)) {
      if (base.length <= 2) {
        toast.error('Keep at least 2 images in the scrolling hero')
        return
      }
      setHeroImages(base.filter((u) => u !== url))
    } else {
      setHeroImages([...base, url])
    }
  }

  const updateSiteCopy = (key: keyof SiteCopyFields, value: string) => {
    setSiteCopy((prev) => ({ ...prev, [key]: value }))
    setCopyAuto(false)
  }

  // Inline preview edits arrive as postMessage from the generated site.
  const handleSiteCopyEdit = useCallback((key: string, value: string) => {
    const text = value.replace(/\s+/g, ' ').trim()
    if (key === 'ctaLabel') {
      setCtaLabel(text.slice(0, 40))
      return
    }
    if (key === 'cta2Label') {
      setCta2Label(text.slice(0, 40))
      return
    }
    if (!SITE_COPY_KEYS.includes(key as keyof SiteCopyFields)) return
    setCopyAuto(false)
    setSiteCopy((prev) => ({
      ...prev,
      [key]: text.slice(0, key === 'aboutText' || key === 'heroTagline' || key === 'footerNote' ? 1400 : 120)
    }))
  }, [])

  // Free-form text edits from the preview arrive as a DOM path + new value.
  const handleSiteTextEdit = useCallback((path: string, value: string) => {
    if (typeof path !== 'string' || !path) return
    const text = value.replace(/\s+/g, ' ').trim().slice(0, 400)
    setSiteTexts((prev) => {
      const next = { ...prev }
      if (text) next[path] = text
      else delete next[path]
      return next
    })
  }, [])

  const handleSiteProductEdit = useCallback((index: number, field: string, value: string) => {    if (!Number.isInteger(index) || index < 0) return
    if (field !== 'name' && field !== 'price') return
    const text = value.replace(/\s+/g, ' ').trim().slice(0, 80)
    setCatalogProducts((prev) =>
      prev.map((product, i) => (i === index ? { ...product, [field]: text } : product))
    )
  }, [])

  // Image upload handler — one /api/upload request per picked file, so a
  // multi-select fills the gallery in a single gesture.
  const handleImageUpload = async (files: File[], kind: 'profile' | 'gallery') => {
    if (files.length === 0) return
    const room = kind === 'profile' ? 1 : Math.max(0, MAX_GALLERY_IMAGES - galleryImages.length)
    if (room === 0) {
      toast.error(`Gallery is full — ${MAX_GALLERY_IMAGES} images maximum`)
      return
    }
    setUploadingImage(true)
    const uploaded: string[] = []
    let failed = 0
    for (const file of files.slice(0, room)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (res.ok && data.url) uploaded.push(data.url)
        else failed += 1
      } catch {
        failed += 1
      }
    }
    if (uploaded.length > 0) {
      if (kind === 'profile') {
        setProfileImage(uploaded[0])
        toast.success('Profile image uploaded!')
      } else {
        setGalleryImages((prev) => [...prev, ...uploaded].slice(0, MAX_GALLERY_IMAGES))
        toast.success(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} added to gallery!`)
      }
    }
    if (failed > 0) toast.error(`${failed} image${failed === 1 ? '' : 's'} failed to upload`)
    setUploadingImage(false)
  }

  const removeGalleryImage = (idx: number) => {
    const removed = galleryImages[idx]
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
    setHeroImages((prev) => prev.filter((url) => url !== removed))
  }

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.name.trim()) { toast.error('Business name is required'); return false }
      if (!form.description.trim()) { toast.error('A short description is required'); return false }
    }
    if (s === 2) {
      if (!form.phone.trim()) { toast.error('Phone number is required'); return false }
      if (!form.address.trim()) { toast.error('Street address is required'); return false }
      if (!form.city.trim()) { toast.error('City is required'); return false }
      if (!form.state.trim()) { toast.error('State is required'); return false }
      if (totalImages < MIN_IMAGES) {
        toast.error(`Add at least ${MIN_IMAGES} images to create your website (${totalImages}/${MIN_IMAGES} added)`)
        return false
      }
    }
    return true
  }

  // Contact fields needed to publish. Images are optional for auto-create —
  // the generated site already opens with category hero photos and sample products.
  const contactReady = !!(form.phone.trim() && form.address.trim() && form.city.trim() && form.state.trim())

  const submitBusiness = async (design: DesignSnapshot) => {
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
          imageColor: templateById(design.template)?.color || '#0d9488',
          profileImage,
          imageUrls: galleryImages.join(','),
          liveTracking,
          template: design.template,
          themeColor: design.themeColor,
          fontChoice: design.fontChoice,
          layoutStyle: design.layoutStyle,
          showGallery: design.showGallery,
          showHours: design.showHours,
          showReviews: design.showReviews,
          showMap: design.showMap,
          showProducts: design.showProducts,
          products: design.products,
          ctaLabel: design.ctaLabel,
          ctaUrl: design.ctaUrl,
          cta2Label: design.cta2Label,
          cta2Url: design.cta2Url,
          links: design.links,
          heroImages: design.heroImages,
          heroAutoScroll: design.heroAutoScroll,
          siteMode,
          siteContent: design.siteContent,
          ownerId: user.id
        })
      })
      const data = await res.json()
      if (res.ok && data.business) {
        setSuccess(data.business.id)
        window.dispatchEvent(new CustomEvent('business-created', { detail: data.business.id }))
        toast.success('Business listed successfully!')
      } else {
        toast.error(data.error || 'Failed to list business')
      }
    } catch {
      toast.error('Network error')
    }
    setSubmitting(false)
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login first')
      setShowAuthModal(true)
      return
    }
    if (!validateStep(1)) {
      setStep(1)
      return
    }
    if (autoCreated) {
      // Auto-created sites already ship with hero photos and products; only the
      // contact fields are still required to publish.
      if (!contactReady) {
        setStep(2)
        toast.error('Add your phone and address to publish the website')
        return
      }
    } else if (!validateStep(2)) {
      setStep(2)
      return
    }
    await submitBusiness(currentDesign)
  }

  // Fills the whole website from the business details in one click: template,
  // theme, typography, layout, hero photos, sample products and button copy.
  const applyAutoDesign = (design: DesignSnapshot) => {
    setForm((f) => ({ ...f, template: design.template }))
    setThemeColor(design.themeColor)
    setFontChoice(design.fontChoice)
    setLayoutStyle(design.layoutStyle)
    setShowGallery(design.showGallery)
    setShowHours(design.showHours)
    setShowReviews(design.showReviews)
    setShowMap(design.showMap)
    setShowProducts(design.showProducts)
    if (design.products) {
      try {
        const parsed = JSON.parse(design.products)
        if (Array.isArray(parsed)) setCatalogProducts(parsed)
      } catch {
        // Keep the existing catalogue when the snapshot cannot be parsed.
      }
    }
    setCtaLabel(design.ctaLabel)
    setCtaUrl(design.ctaUrl)
    setCta2Label(design.cta2Label)
    setCta2Url(design.cta2Url)
    // The review step shows exactly what the generated site will use. Copy the
    // provider typed by hand is left untouched; copy that came from an earlier
    // auto-create run is refreshed so it matches the latest details.
    if (copyAuto || !Object.values(siteCopy).some((value) => String(value ?? '').trim())) {
      setSiteCopy(design.copy)
      setCopyAuto(true)
    }
    if (linksAuto || siteLinks.filter((link) => link.label.trim() && link.url.trim()).length === 0) {
      try {
        const parsed = JSON.parse(design.links || '[]')
        if (Array.isArray(parsed)) {
          setSiteLinks(
            parsed
              .filter((link) => link && typeof link === 'object')
              .map((link, index) => ({
                id: `link-${index}-${Date.now()}`,
                label: String(link.label ?? ''),
                url: String(link.url ?? '')
              }))
              .slice(0, 4)
          )
          setLinksAuto(true)
        }
      } catch {
        // Keep whatever links the provider already has.
      }
    }
    setHeroImages(design.heroImages ? design.heroImages.split(',').filter(Boolean) : [])
    setHeroAutoScroll(design.heroAutoScroll)
    setAutoSampleJson(design.autoSampleJson ?? null)
    setAutoCreated(true)
  }

  /**
   * One-click auto-create. With `publish` it creates the listing immediately
   * (no image uploads needed); otherwise it fills the website and jumps to the
   * review step so the provider can fine-tune before publishing.
   */
  const handleAutoCreate = async (publish: boolean) => {
    if (!user) {
      toast.error('Please login first')
      setShowAuthModal(true)
      return
    }
    if (!validateStep(1)) {
      setStep(1)
      return
    }
    const design = autoDesign
    applyAutoDesign(design)
    if (publish) {
      if (!contactReady) {
        setStep(2)
        toast.info('Website generated — add your phone and address to publish it.')
        return
      }
      await submitBusiness(design)
      return
    }
    if (contactReady) {
      setStep(4)
      toast.success('Website auto-created from your business details — review and publish.')
    } else {
      setStep(2)
      toast.success('Website auto-created — add contact details to publish.')
    }
  }

  /**
   * The "auto system" behind the Website Text panel: writes every heading,
   * paragraph, menu label, button and custom link from the current business
   * details. Pressing it is an explicit choice, so generated copy wins.
   */
  const applyWebsiteAutoContent = () => {
    if (!form.name.trim()) {
      toast.error('Enter your business name first')
      return
    }
    setSiteCopy(mergeSiteCopy(autoContent.copy))
    setCopyAuto(true)
    setCtaLabel(autoContent.ctaLabel)
    setCtaUrl(autoContent.ctaUrl || ctaUrl)
    setCta2Label(autoContent.cta2Label)
    setCta2Url(autoContent.cta2Url || cta2Url)
    setSiteLinks(
      autoContent.links.map((link, index) => ({
        id: `link-${index}-${Date.now()}`,
        label: link.label,
        url: link.url
      }))
    )
    setLinksAuto(true)
    toast.success('Website content auto-filled — every field stays editable.')
  }

  // Fills the form with the best suggestions for the current name/category.
  // Only empty fields are filled, so anything the provider typed is preserved.
  const applyTopSuggestions = () => {
    const detected = !categoryPicked && form.name.trim() ? detectCategoryFromName(form.name) : null
    const targetCategory = detected || form.category
    const next = suggestBusinessDetails({
      name: form.name,
      category: targetCategory,
      city: form.city,
      state: form.state
    })
    setForm((current) => {
      const patch: typeof current = { ...current }
      if (targetCategory !== current.category) patch.category = targetCategory
      if (!current.subcategory.trim()) patch.subcategory = next.subcategories[0] || ''
      if (!current.description.trim()) patch.description = next.descriptions[0] || ''
      if (!current.tags.trim()) patch.tags = next.tags.slice(0, 4).join(', ')
      return patch
    })
    return { category: targetCategory, suggestions: next }
  }

  /** Opens the chooser with auto-generated description/category/tags options. */
  const openAutoDetails = () => {
    if (!form.name.trim()) {
      toast.error('Enter your business name first')
      return
    }
    const { category } = applyTopSuggestions()
    setShowSuggestions(true)
    toast.success(`Auto-created details for ${category} — choose what fits your business.`)
  }

  const chooseSuggestedCategory = (category: string) => {
    if (category === form.category) return
    setCategoryPicked(true)
    const next = suggestBusinessDetails({
      name: form.name,
      category,
      city: form.city,
      state: form.state
    })
    setForm((current) => {
      const currentTags = current.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      const previousTags = detailSuggestions.tags
      const tagsWereSuggested =
        currentTags.length === 0 ||
        currentTags.every((tag) => previousTags.some((item) => item.toLowerCase() === tag.toLowerCase()))
      const currentDescription = current.description.trim()
      const descriptionWasSuggested =
        !currentDescription || detailSuggestions.descriptions.includes(currentDescription)
      return {
        ...current,
        category,
        subcategory: next.subcategories[0] || '',
        description: descriptionWasSuggested ? next.descriptions[0] || '' : current.description,
        tags: tagsWereSuggested ? next.tags.slice(0, 4).join(', ') : current.tags
      }
    })
  }

  const chooseSuggestedSubcategory = (subcategory: string) => {
    update('subcategory', subcategory)
  }

  const toggleSuggestedTag = (tag: string) => {
    setForm((current) => {
      const list = current.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      const exists = list.some((item) => item.toLowerCase() === tag.toLowerCase())
      const next = exists
        ? list.filter((item) => item.toLowerCase() !== tag.toLowerCase())
        : [...list, tag]
      return { ...current, tags: next.slice(0, 12).join(', ') }
    })
  }

  const chooseSuggestedDescription = (description: string) => {
    update('description', description)
  }

  const useSuggestedDetails = () => {
    setShowSuggestions(false)
    handleAutoCreate(false)
  }

  const publishSuggestedDetails = () => {
    setShowSuggestions(false)
    handleAutoCreate(true)
  }

  const reset = () => {
    setStep(1)
    setSuccess(null)
    setProfileImage('')
    setGalleryImages([])
    setLiveTracking(false)
    setTemplatePicked(false)
    setAutoCreated(false)
    setAutoSampleJson(null)
    setCopyAuto(false)
    setLinksAuto(false)
    setShowSuggestions(false)
    setCategoryPicked(false)
    setThemeColor('#0d9488')
    setFontChoice('sans')
    setLayoutStyle('standard')
    setShowGallery(true)
    setShowHours(true)
    setShowReviews(true)
    setShowMap(true)
    setShowProducts(true)
    setCatalogProducts([])
    setCtaLabel('')
    setCtaUrl('')
    setCta2Label('')
    setCta2Url('')
    setSiteLinks([])
    setHeroImages([])
    setHeroAutoScroll(true)
    setSiteCopy({ ...EMPTY_SITE_COPY })
    setSiteTexts({})
    setForm({
      template: 'blush-atelier', name: '', description: '', category: 'Grocery & Essentials',
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
      <DialogContent className="max-w-[1600px] sm:max-w-[1600px] w-[95vw] max-h-[95vh] overflow-y-auto p-0 gap-0 bg-card">
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
                      {s === 1 && t('list_step2')}
                      {s === 2 && t('list_step3')}
                      {s === 3 && t('list_step1')}
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
              {/* Step 3: Template + Design Customization (split layout) */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif font-semibold text-lg">{t('list_step1')}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose template, customize design, manage products. Live preview on right updates as you change.</p>
                  </div>

                  {/* Split layout: customization LEFT, live preview RIGHT (wider) */}
                  <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5">
                    {/* ===== LEFT: Customization ===== */}
                    <div className="space-y-4 min-w-0">
                      {/* Base template selection — visual previews */}
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide mb-2 block">Choose Template</Label>
                        <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5 mb-2">
                          Recommended for {form.category}: <b>{templateById(recommendedTemplate)?.name || recommendedTemplate}</b>. 5 design families · <b>FREE</b> for now — the layout is built from your products, photos and details, so each family shows your business differently.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {templateChoices.map((tpl) => {
                            const selected = form.template === tpl.id
                            const recommended = tpl.id === recommendedTemplate

                            return (
                              <button
                                key={tpl.id}
                                onClick={() => { setTemplatePicked(true); update('template', tpl.id) }}
                                className={`text-left rounded-lg border-2 overflow-hidden transition-all relative ${
                                  selected ? 'border-brand shadow-md scale-[1.02]' : 'border-border hover:border-brand/40 hover:scale-[1.01]'
                                }`}
                              >
                                {recommended && (
                                  <span className="absolute top-1.5 right-1.5 z-10 text-[8px] font-black tracking-wider text-sky-700 bg-sky-100 border border-sky-300 rounded-full px-1.5 py-0.5">
                                    Recommended
                                  </span>
                                )}
                                {tpl.designer && !recommended && (
                                  <span className="absolute top-1.5 right-1.5 z-10 text-[8px] font-black tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-full px-1.5 py-0.5">
                                    FREE
                                  </span>
                                )}
                                {selected && (
                                  <span className="absolute top-1.5 left-1.5 z-10 bg-brand text-brand-foreground rounded-full p-0.5">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}

                                {/* Desktop-layout template thumbnail */}
                                <div style={{ height: '240px' }}>
                                  <TemplateThumb seed={thumbSeed} id={tpl.id} color={tpl.color} />
                                </div>

                                {/* Template name */}
                                <div className="px-2 py-1.5 border-t bg-card">
                                  <div className="font-bold text-[10px] leading-tight text-navy">
                                    {typeof tpl.name === 'string' && tpl.name.startsWith('list_') ? t(tpl.name as any) : tpl.name}
                                  </div>
                                </div>
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
                            <option value="sans">Sans (default)</option>
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

                      {/* Website pages */}
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide mb-2 block">Website Pages</Label>
                        <p className="text-[11px] text-muted-foreground">
                          Every template includes <strong>4 pages</strong> — Home, Products &amp; services, About and
                          Contact — linked from the top menu. Visitors can move between them instantly.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {['Home', 'Products & services', 'About', 'Contact'].map((page) => (
                            <span key={page} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-brand/10 text-brand">
                              {page}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Editable website buttons and links */}
                      <div>
                        <Label className="text-xs font-semibold uppercase tracking-wide mb-1 block">Website Buttons & Links</Label>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          Rename the main buttons or point them anywhere (https://, tel:, mailto:). Custom links appear in the site nav and footer.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={ctaLabel}
                            onChange={(e) => setCtaLabel(e.target.value)}
                            placeholder="Main button text (Call Now)"
                            className="h-9 text-xs"
                            maxLength={40}
                          />
                          <Input
                            value={ctaUrl}
                            onChange={(e) => setCtaUrl(e.target.value)}
                            placeholder="Main button link (tel:+91…)"
                            className="h-9 text-xs"
                          />
                          <Input
                            value={cta2Label}
                            onChange={(e) => setCta2Label(e.target.value)}
                            placeholder="Second button text (View Gallery)"
                            className="h-9 text-xs"
                            maxLength={40}
                          />
                          <Input
                            value={cta2Url}
                            onChange={(e) => setCta2Url(e.target.value)}
                            placeholder="Second button link (#gallery)"
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="mt-3 space-y-2">
                          {siteLinks.map((link, idx) => (
                            <div key={link.id} className="flex items-center gap-2">
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const next = [...siteLinks]
                                  next[idx] = { ...link, label: e.target.value }
                                  setSiteLinks(next)
                                  setLinksAuto(false)
                                }}
                                placeholder="Link text"
                                className="h-8 text-xs"
                                maxLength={40}
                              />
                              <Input
                                value={link.url}
                                onChange={(e) => {
                                  const next = [...siteLinks]
                                  next[idx] = { ...link, url: e.target.value }
                                  setSiteLinks(next)
                                  setLinksAuto(false)
                                }}
                                placeholder="https://…"
                                className="h-8 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSiteLinks(siteLinks.filter((l) => l.id !== link.id))
                                  setLinksAuto(false)
                                }}
                                className="w-8 h-8 flex-shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-red-600 hover:border-red-300"
                                aria-label="Remove link"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {siteLinks.length < 4 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSiteLinks([...siteLinks, { id: `link-${Date.now()}`, label: '', url: '' }])
                                setLinksAuto(false)
                              }}
                              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add custom link
                            </button>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Editable website copy */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <Label className="text-xs font-semibold uppercase tracking-wide">Website Text</Label>
                          <button
                            type="button"
                            onClick={applyWebsiteAutoContent}
                            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Auto-fill content
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          Change any heading, paragraph or footer line. Empty fields keep the template&apos;s own copy.
                          <b> Auto-fill</b> writes all of it from your business details — nothing is sent anywhere.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={siteCopy.heroTitle}
                            onChange={(e) => updateSiteCopy('heroTitle', e.target.value)}
                            placeholder="Hero title (business name)"
                            className="h-9 text-xs"
                            maxLength={90}
                          />
                          <Input
                            value={siteCopy.heroTagline}
                            onChange={(e) => updateSiteCopy('heroTagline', e.target.value)}
                            placeholder="Hero tagline"
                            className="h-9 text-xs"
                            maxLength={240}
                          />
                          <Input
                            value={siteCopy.aboutTitle}
                            onChange={(e) => updateSiteCopy('aboutTitle', e.target.value)}
                            placeholder="About heading"
                            className="h-9 text-xs"
                            maxLength={90}
                          />
                          <Input
                            value={siteCopy.galleryTitle}
                            onChange={(e) => updateSiteCopy('galleryTitle', e.target.value)}
                            placeholder="Gallery heading"
                            className="h-9 text-xs"
                            maxLength={90}
                          />
                          <Input
                            value={siteCopy.offeringsTitle}
                            onChange={(e) => updateSiteCopy('offeringsTitle', e.target.value)}
                            placeholder="Products / menu heading"
                            className="h-9 text-xs"
                            maxLength={90}
                          />
                          <Input
                            value={siteCopy.reviewsTitle}
                            onChange={(e) => updateSiteCopy('reviewsTitle', e.target.value)}
                            placeholder="Reviews heading"
                            className="h-9 text-xs"
                            maxLength={90}
                          />
                          <Input
                            value={siteCopy.visitTitle}
                            onChange={(e) => updateSiteCopy('visitTitle', e.target.value)}
                            placeholder="Visit / contact heading"
                            className="h-9 text-xs"
                            maxLength={90}
                          />
                          <Input
                            value={siteCopy.footerNote}
                            onChange={(e) => updateSiteCopy('footerNote', e.target.value)}
                            placeholder="Footer note"
                            className="h-9 text-xs"
                            maxLength={240}
                          />
                          <Input
                            value={siteCopy.navHome}
                            onChange={(e) => updateSiteCopy('navHome', e.target.value)}
                            placeholder="Menu: Home"
                            className="h-9 text-xs"
                            maxLength={40}
                          />
                          <Input
                            value={siteCopy.navAbout}
                            onChange={(e) => updateSiteCopy('navAbout', e.target.value)}
                            placeholder="Menu: About"
                            className="h-9 text-xs"
                            maxLength={40}
                          />
                          <Input
                            value={siteCopy.navOfferings}
                            onChange={(e) => updateSiteCopy('navOfferings', e.target.value)}
                            placeholder="Menu: Products and Services"
                            className="h-9 text-xs"
                            maxLength={40}
                          />
                          <Input
                            value={siteCopy.navVisit}
                            onChange={(e) => updateSiteCopy('navVisit', e.target.value)}
                            placeholder="Menu: Contact"
                            className="h-9 text-xs"
                            maxLength={40}
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-brand">
                          Tip: click any heading, paragraph or button in the live preview and type — the box here
                          fills in automatically. For menu items, double-click the label to rename it.
                        </p>
                        <Textarea
                          value={siteCopy.aboutText}
                          onChange={(e) => updateSiteCopy('aboutText', e.target.value)}
                          placeholder="About paragraph"
                          className="mt-2 min-h-[64px] text-xs"
                          maxLength={1400}
                        />
                      </div>

                      <Separator />
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

                    {/* ===== RIGHT: LIVE PREVIEW (sticky, desktop-scaled) ===== */}
                    <PreviewPane business={previewBusiness} onCopyEdit={handleSiteCopyEdit} onProductEdit={handleSiteProductEdit} onTextEdit={handleSiteTextEdit} />
                  </div>
                </div>
              )}

              {/* Step 1: Business Details */}
              {step === 1 && (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5">
                  <div className="space-y-4 min-w-0">
                  <h3 className="font-serif font-semibold text-lg">{t('list_step2')}</h3>
                  {/* One-click of the whole website from the business details */}
                  <div className="rounded-xl border border-brand/30 bg-gradient-to-r from-brand-soft/50 via-brand-soft/20 to-transparent p-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-brand text-brand-foreground flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">Auto-create your website</div>
                        <p className="text-[11px] leading-snug text-muted-foreground mt-0.5">
                          Builds the complete site from your business name, category and details — template, theme,
                          hero photos, sample products and page copy. You can fine-tune everything afterwards.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5 sm:pl-[42px]">
                      <Button
                        size="sm"
                        onClick={openAutoDetails}
                        className="bg-brand hover:bg-brand/90 text-brand-foreground h-8"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Auto-create website
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        Pick from ready-made options for description, category, subcategory and keywords.
                      </span>
                    </div>
                  </div>
                  {showSuggestions && (
                    <AutoDetailsPanel
                      suggestions={detailSuggestions}
                      category={form.category}
                      subcategory={form.subcategory}
                      tags={form.tags}
                      description={form.description}
                      submitting={submitting}
                      onCategory={chooseSuggestedCategory}
                      onSubcategory={chooseSuggestedSubcategory}
                      onToggleTag={toggleSuggestedTag}
                      onDescription={chooseSuggestedDescription}
                      onContinue={useSuggestedDetails}
                      onPublish={publishSuggestedDetails}
                      onClose={() => setShowSuggestions(false)}
                    />
                  )}
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
                      <Select value={form.category} onValueChange={(v) => { setCategoryPicked(true); update('category', v) }}>
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
                  <PreviewPane business={previewBusiness} onCopyEdit={handleSiteCopyEdit} onProductEdit={handleSiteProductEdit} onTextEdit={handleSiteTextEdit} />
                </div>
              )}

              {/* Step 2: Contact + Location */}
              {step === 2 && (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5">
                  <div className="space-y-4 min-w-0">
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
                              handlePickLocation(pos.coords.latitude, pos.coords.longitude, true)
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
                            e.target.value = ''
                            if (f) handleImageUpload([f], 'profile')
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
                    <p className="text-[11px] text-muted-foreground">JPG/PNG/WEBP, max 5MB. This image appears in your hero banner and counts as image 1 of {MIN_IMAGES}.</p>
                  </div>

                  {/* Gallery images */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-semibold">Gallery Images *</Label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        totalImages >= MIN_IMAGES
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {totalImages}/{MIN_IMAGES} images
                      </span>
                    </div>
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
                      {galleryImages.length < MAX_GALLERY_IMAGES && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? [])
                              e.target.value = ''
                              if (files.length) handleImageUpload(files, 'gallery')
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
                    <p className={`text-[11px] ${totalImages >= MIN_IMAGES ? 'text-emerald-600' : 'text-amber-600 font-medium'}`}>
                      {totalImages >= MIN_IMAGES
                        ? `✓ ${totalImages} images ready — your website gallery is complete.`
                        : `Add ${MIN_IMAGES - totalImages} more image${MIN_IMAGES - totalImages === 1 ? '' : 's'} to unlock your website. Minimum ${MIN_IMAGES} images (profile + gallery) required.`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Up to {MAX_GALLERY_IMAGES} gallery images — select several photos at once (Ctrl/click in the picker, or drag them together). Show your products, store interior, team, etc.</p>
                  </div>

                  {/* Hero scrolling images */}
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Images className="w-4 h-4 text-brand" />
                        Hero Scrolling Images
                      </Label>
                      {heroImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHeroImages([])}
                          className="text-[10px] font-semibold text-brand hover:underline"
                        >
                          Reset to all images
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pick the photos that scroll in the hero strip. All uploaded images are used by default.
                    </p>
                    {heroChoices.length === 0 ? (
                      <p className="text-[11px] font-medium text-amber-600">Upload images above to choose hero photos.</p>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {heroChoices.map((url) => {
                          const active = heroSelected.includes(url)
                          const isDefault = DEFAULT_HERO_IMAGES.includes(url)
                          return (
                            <button
                              key={url}
                              type="button"
                              onClick={() => toggleHeroImage(url)}
                              title={active ? 'Shown in hero strip' : 'Hidden from hero strip'}
                              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                active ? 'border-brand' : 'border-border opacity-50 hover:opacity-80'
                              }`}
                            >
                              <img src={url} alt="Hero option" className="w-full h-14 object-cover" />
                              {isDefault && (
                                <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/60 rounded px-1 py-0.5">
                                  Default
                                </span>
                              )}
                              <span className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                active ? 'bg-brand text-brand-foreground' : 'bg-white/90 text-muted-foreground border border-border'
                              }`}>
                                {active ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <Checkbox checked={heroAutoScroll} onCheckedChange={(v) => setHeroAutoScroll(!!v)} />
                      <span className="text-xs">Auto-scroll hero images</span>
                    </label>
                  </div>
                  </div>
                  <PreviewPane business={previewBusiness} onCopyEdit={handleSiteCopyEdit} onProductEdit={handleSiteProductEdit} onTextEdit={handleSiteTextEdit} />
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5">
                  <div className="space-y-4 min-w-0">
                  <h3 className="font-serif font-semibold text-lg">{t('list_step4')}</h3>
                  <div className="rounded-xl border border-border/60 overflow-hidden">
                    <div
                      className="h-24 flex items-center px-5 text-white"
                      style={{ background: `linear-gradient(135deg, ${templateById(form.template)?.color}, ${templateById(form.template)?.color}aa)` }}
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
                          {templateById(form.template)?.emoji} {t((templateById(form.template)?.name || '') as any)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  </div>
                  <PreviewPane business={previewBusiness} onCopyEdit={handleSiteCopyEdit} onProductEdit={handleSiteProductEdit} onTextEdit={handleSiteTextEdit} />
                </div>
              )}

              <div className="mt-4 lg:hidden">
                <WebsitePreview
                  business={previewBusiness}
                  height="520px"
                  title="Live Website Preview (Mobile)"
                  desktop={false}
                  onCopyEdit={handleSiteCopyEdit}
                  onProductEdit={handleSiteProductEdit}
                  onTextEdit={handleSiteTextEdit}
                />
              </div>

              {/* Footer nav */}
              <div className="flex justify-between items-center pt-5 mt-5 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                    className="text-muted-foreground"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {step > 1 ? t('list_back') : 'Cancel'}
                  </Button>
                  {step > 1 && step < 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutoCreate(contactReady)}
                      className="h-8 border-brand/40 text-brand hover:bg-brand-soft/40"
                    >
                      {contactReady ? <Globe className="w-3.5 h-3.5 mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                      {contactReady ? 'Auto-create & publish' : 'Auto-create'}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {step === 2 && totalImages < MIN_IMAGES && (
                    <span className="text-[11px] font-medium text-amber-600 text-right">
                      Add {MIN_IMAGES - totalImages} more image{MIN_IMAGES - totalImages === 1 ? '' : 's'} to continue
                    </span>
                  )}
                  {step < 4 ? (
                    <Button
                      onClick={() => { if (validateStep(step)) setStep(step + 1) }}
                      className="bg-brand hover:bg-brand/90 text-brand-foreground"
                      disabled={
                        (step === 1 && (!form.name || !form.description)) ||
                        (step === 2 && totalImages < MIN_IMAGES)
                      }
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
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ===== Live website preview shared by every wizard step =====
type PreviewEditHandler = (key: string, value: string) => void
type ProductEditHandler = (index: number, field: string, value: string) => void
type TextEditHandler = (path: string, value: string) => void

const PREVIEW_PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Products' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
]

function WebsitePreview({
  business,
  height = 'calc(95vh - 200px)',
  title = 'Live Website Preview',
  desktop = true,
  onCopyEdit,
  onProductEdit,
  onTextEdit
}: {
  business: BusinessData
  height?: string
  title?: string
  desktop?: boolean
  onCopyEdit?: PreviewEditHandler
  onProductEdit?: ProductEditHandler
  onTextEdit?: TextEditHandler
}) {
  const html = useMemo(() => withPreviewEditor(generateBusinessWebsite(business)), [business])
  const [shownHtml, setShownHtml] = useState(html)
  // The preview starts as a clean page; "Edit text" opens the full-screen editor.
  const [editing, setEditing] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  // Edits made inside the iframe are already visible there. Reloading the frame
  // for them would steal focus and jump back to the first page, so skip it.
  const inlineEditsRef = useRef(0)
  const appliedInlineRef = useRef(0)
  // Escape / Done needs the newest HTML without re-binding listeners every keystroke.
  const htmlRef = useRef(html)
  htmlRef.current = html

  // Keep typing responsive: reload the preview a beat after the last keystroke.
  useEffect(() => {
    if (inlineEditsRef.current !== appliedInlineRef.current) {
      appliedInlineRef.current = inlineEditsRef.current
      return
    }
    const timer = setTimeout(() => setShownHtml(html), 300)
    return () => clearTimeout(timer)
  }, [html])

  const sendEditMode = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: 'site-edit-mode', enabled: editing }, '*')
    frameRef.current?.contentWindow?.postMessage({ type: 'site-page', page: currentPage }, '*')
  }, [editing, currentPage])

  // The iframe announces itself once its page script is running; answer with the
  // current page + edit mode so a reload never falls back to the home page.
  const sendEditModeRef = useRef(sendEditMode)
  sendEditModeRef.current = sendEditMode

  // srcDoc reloads reset the iframe, so re-send the mode after each update.
  useEffect(() => {
    const timer = setTimeout(sendEditMode, 80)
    return () => clearTimeout(timer)
  }, [shownHtml, sendEditMode])

  const goPage = (page: string) => {
    setCurrentPage(page)
    frameRef.current?.contentWindow?.postMessage({ type: 'site-page', page }, '*')
  }

  const exitEditing = useCallback(() => {
    // Leaving edit mode re-syncs the preview with everything captured so far.
    setShownHtml(htmlRef.current)
    setEditing(false)
    setFullscreen(false)
  }, [])

  const toggleEditing = () => {
    if (editing) {
      exitEditing()
    } else {
      // Editing opens full screen, so there is room to click and type.
      setEditing(true)
      setFullscreen(true)
    }
  }

  // Full-screen editing should not scroll the wizard behind the overlay.
  // (Esc is left to the preview's own editor so it never closes the wizard.)
  useEffect(() => {
    if (!fullscreen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [fullscreen])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'site-copy-edit' && typeof data.key === 'string') {
        inlineEditsRef.current += 1
        onCopyEdit?.(data.key, String(data.value ?? ''))
      } else if (data.type === 'site-product-edit') {
        inlineEditsRef.current += 1
        onProductEdit?.(Number(data.index), String(data.field ?? ''), String(data.value ?? ''))
      } else if (data.type === 'site-text-edit' && typeof data.path === 'string') {
        inlineEditsRef.current += 1
        onTextEdit?.(data.path, String(data.value ?? ''))
      } else if (data.type === 'site-page-change' && typeof data.page === 'string') {
        setCurrentPage(data.page)
      } else if (data.type === 'site-ready') {
        sendEditModeRef.current()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onCopyEdit, onProductEdit, onTextEdit])

  // The same markup renders inline and in the full-screen overlay; only the
  // outer classes and the frame height change, so nothing is lost on toggle.
  const card = (
    <div
      className={
        fullscreen
          ? 'flex flex-1 flex-col min-h-0 bg-card overflow-hidden shadow-2xl sm:rounded-xl border border-brand/30'
          : 'bg-card rounded-xl border-2 border-dashed border-brand/30 overflow-hidden shadow-md'
      }
    >
      <div className="bg-brand/10 px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-brand/20">
        <span className="text-xs font-bold text-brand flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          LIVE PREVIEW
          {fullscreen && (
            <span className="text-[9px] font-semibold uppercase tracking-wide bg-brand text-brand-foreground rounded-full px-1.5 py-0.5">
              Full screen
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={toggleEditing}
            title={editing ? 'Finish editing and return to the page' : 'Open the full-screen text editor'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold shadow-md ring-2 ring-brand/30 transition-colors ${
              editing
                ? 'bg-brand text-brand-foreground ring-brand'
                : 'bg-brand text-brand-foreground hover:bg-brand/90 animate-pulse'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            {editing ? 'Done editing' : 'Edit text'}
          </button>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
            {business.template} · {desktop ? 'Desktop' : 'Mobile'}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-b border-brand/20 bg-white/70">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">Pages</span>
        {PREVIEW_PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => goPage(page.id)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
              currentPage === page.id
                ? 'bg-brand text-brand-foreground border-brand'
                : 'bg-card text-muted-foreground border-border hover:border-brand/50 hover:text-brand'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>
      {editing && (
        <div className="bg-amber-50 px-3 py-1.5 text-[10px] font-medium text-amber-700 border-b border-amber-200">
          Click any outlined text to edit · menu links open their page (double-click to rename) · Enter saves · Esc cancels
        </div>
      )}
      <div
        style={
          fullscreen
            ? { flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative', background: '#fff' }
            : { height, overflow: 'hidden', position: 'relative', background: '#fff' }
        }
      >
        {desktop ? (
          <ScaledSiteFrame html={shownHtml} title={title} iframeRef={frameRef} onLoad={sendEditMode} />
        ) : (
          <iframe
            ref={frameRef}
            onLoad={sendEditMode}
            srcDoc={shownHtml}
            title={title}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  )

  if (fullscreen && typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex bg-slate-900/95 p-1 sm:p-3 pointer-events-auto">
        {card}
      </div>,
      document.body
    )
  }

  return card
}

// Sticky preview column used by every wizard step; the mobile version is
// rendered once below the step content.
function PreviewPane({
  business,
  onCopyEdit,
  onProductEdit,
  onTextEdit
}: {
  business: BusinessData
  onCopyEdit: PreviewEditHandler
  onProductEdit: ProductEditHandler
  onTextEdit: TextEditHandler
}) {
  return (
    <div className="hidden lg:block min-w-0">
      <div className="sticky top-2">
        <WebsitePreview
          business={business}
          height="calc(95vh - 200px)"
          onCopyEdit={onCopyEdit}
          onProductEdit={onProductEdit}
          onTextEdit={onTextEdit}
        />
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Preview updates live · Use Edit text to change any heading, menu item or button
        </p>
      </div>
    </div>
  )
}
