// Shared building blocks for the premium business website templates.
// Every generator gets the same normalised inputs so the site stays valid
// no matter what shape the database row is in.

import { productEmoji, productImage } from '../products'

export interface BusinessData {
  /** Listing id — used for canonical URLs by the site engine. */
  id?: string
  name: string
  description: string
  category: string
  subcategory?: string | null
  /** Comma separated keywords the provider entered — real data, used for grouping. */
  tags?: string
  city: string
  state: string
  address: string
  phone: string
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  rating: number
  reviewCount: number
  profileImage: string
  imageUrls: string
  products: string
  hours: string
  themeColor: string
  template: string
  ctaLabel?: string | null
  ctaUrl?: string | null
  cta2Label?: string | null
  cta2Url?: string | null
  links?: string | null
  heroImages?: string | null
  heroAutoScroll?: boolean
  siteMode?: string | null
  siteContent?: string | null
  fontChoice?: string | null
  layoutStyle?: string | null
  showGallery?: boolean
  showHours?: boolean
  showReviews?: boolean
  showMap?: boolean
  showProducts?: boolean
}

export interface TemplateProduct {
  name?: unknown
  price?: unknown
  details?: unknown
  description?: unknown
  image?: unknown
  img?: unknown
  emoji?: unknown
}

export const MIN_IMAGES = 4

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const URL_RE = /^(https?:\/\/|data:image\/|\/)/i

export function safeUrl(value: unknown): string {
  const url = String(value ?? '').trim()
  if (!url || !URL_RE.test(url)) return ''
  return url
}

// Website buttons/links may be phone, email, in-page anchors or web URLs.
const HREF_RE = /^(https?:\/\/|\/|tel:|mailto:|#)/i

export function safeHref(value: unknown, fallback = '#'): string {
  const url = String(value ?? '').trim()
  if (!url || !HREF_RE.test(url)) return fallback
  return url
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(String(href || ''))
}

/** Opens user-supplied web links safely in a new tab; tel/mailto stay in place. */
export function anchorAttrs(href: string): string {
  return isExternalHref(href) ? ' target="_blank" rel="noopener noreferrer"' : ''
}

export interface SiteLink {
  label: string
  url: string
}

/** Accepts the JSON stored on Business.links, an array, or nothing. */
export function customLinks(business: BusinessData): SiteLink[] {
  const raw: unknown = business.links
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    if (!raw.trim()) return []
    try { parsed = JSON.parse(raw) } catch { return [] }
  }
  if (!Array.isArray(parsed)) return []
  const out: SiteLink[] = []
  for (const row of parsed) {
    if (!row || typeof row !== 'object') continue
    const label = String((row as Record<string, unknown>).label ?? '').trim().slice(0, 40)
    const url = safeHref((row as Record<string, unknown>).url, '')
    if (!label || !url) continue
    out.push({ label, url })
    if (out.length >= 6) break
  }
  return out
}

export function primaryCta(
  business: BusinessData,
  fallbackLabel = 'Contact Us'
): SiteLink {
  const label = String(business.ctaLabel || '').trim().slice(0, 40) || fallbackLabel
  const url = safeHref(business.ctaUrl, '') || telHref(business.phone)
  return { label, url }
}

export function secondaryCta(
  business: BusinessData,
  fallbackLabel = 'Explore',
  fallbackHref = '#gallery'
): SiteLink {
  const label = String(business.cta2Label || '').trim().slice(0, 40) || fallbackLabel
  const url = safeHref(business.cta2Url, '') || fallbackHref
  return { label, url }
}

/** Custom nav/footer link markup with safe hrefs. */
export function siteLinkHtml(link: SiteLink, className = ''): string {
  const cls = className ? ` class="${escapeHtml(className)}"` : ''
  return `<a href="${escapeHtml(link.url)}"${anchorAttrs(link.url)}${cls}>${escapeHtml(link.label)}</a>`
}

export function safeColor(value: unknown, fallback: string): string {
  const v = String(value ?? '').trim()
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ? v : fallback
}

/** Black or white text, whichever is readable on the given background. */
export function readableOn(hex: string): string {
  const value = safeColor(hex, '#0d9488').slice(1)
  const full = value.length === 3
    ? value.split('').map((char) => char + char).join('')
    : value.slice(0, 6)
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#121212' : '#ffffff'
}

/** Profile image first, then the comma separated gallery — deduped, capped at 12. */
export function collectImages(business: BusinessData): string[] {
  const gallery = String(business.imageUrls || '')
    .split(',')
    .map(safeUrl)
    .filter(Boolean)
  const profile = safeUrl(business.profileImage)
  const all = profile ? [profile, ...gallery] : gallery
  return Array.from(new Set(all)).slice(0, 12)
}

/** The owner's chosen hero photos, in the order they picked them. */
export function heroPicks(business: BusinessData): string[] {
  return Array.from(
    new Set(
      String(business.heroImages || '')
        .split(',')
        .map(safeUrl)
        .filter(Boolean)
    )
  )
}

export function heroImage(business: BusinessData, images: string[]): string {
  return heroPicks(business)[0] || safeUrl(business.profileImage) || images[0] || ''
}

export function telHref(phone: string): string {
  return 'tel:' + String(phone || '').replace(/[^+\d]/g, '')
}

export function waHref(whatsapp: string): string {
  return 'https://wa.me/' + String(whatsapp || '').replace(/\D/g, '')
}

export function mapHref(business: BusinessData): string {
  const query = [business.address, business.city, business.state].filter(Boolean).join(', ')
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query)
}

export function initials(name: string): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const value = parts.map((part) => part[0]).join('')
  return (value || 'B').toUpperCase()
}

export function ratingOf(business: BusinessData): number {
  const value = Number(business.rating)
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(5, value))
}

export function reviewCountOf(business: BusinessData): number {
  const value = Number(business.reviewCount)
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
}

export function starsHtml(rating: number): string {
  const r = Math.max(0, Math.min(5, Number(rating) || 0))
  const filled = Math.round(r)
  let out = ''
  for (let i = 1; i <= 5; i += 1) {
    out += `<span class="${i <= filled ? 'on' : 'off'}">★</span>`
  }
  return out
}

export function paragraphs(text: string): string[] {
  return String(text || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function truncate(text: string, max: number): string {
  const value = String(text || '').trim()
  if (value.length <= max) return value
  return value.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

export function listText(items: Array<string | null | undefined>, separator = ' · '): string {
  return items.filter(Boolean).join(separator)
}

export function productMediaHtml(
  product: TemplateProduct,
  fallbackBackground: string,
  imageStyle = 'width:100%;height:100%;object-fit:cover;display:block;'
): string {
  const src = safeUrl(productImage(product) || '')
  if (src) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(String(product?.name ?? 'Product'))}" style="${imageStyle}" loading="lazy">`
  }
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.25rem;background:${fallbackBackground};"><span>${escapeHtml(productEmoji(product))}</span></div>`
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', monday: 'Monday',
  tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
  wed: 'Wednesday', wednesday: 'Wednesday',
  thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
  fri: 'Friday', friday: 'Friday',
  sat: 'Saturday', saturday: 'Saturday',
  sun: 'Sunday', sunday: 'Sunday',
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function hourValue(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim()
  if (raw && typeof raw === 'object') {
    const row = raw as Record<string, unknown>
    const open = typeof row.open === 'string' ? row.open.trim() : ''
    const close = typeof row.close === 'string' ? row.close.trim() : ''
    if (open && close) return `${open} – ${close}`
    if (open) return open
  }
  return ''
}

export interface HourEntry {
  day: string
  value: string
}

/** Accepts { mon: '9-9' }, { Monday: { open, close } } or an array of such rows. */
export function hoursEntries(hours: unknown): HourEntry[] {
  if (!hours || typeof hours !== 'object') return []
  const source = Array.isArray(hours) ? hours : [hours]
  const entries: HourEntry[] = []
  for (const row of source) {
    if (!row || typeof row !== 'object') continue
    for (const [key, raw] of Object.entries(row as Record<string, unknown>)) {
      const value = hourValue(raw)
      if (!value) continue
      const day = DAY_LABELS[key.toLowerCase()] || key
      entries.push({ day, value })
    }
  }
  entries.sort((a, b) => {
    const ai = DAY_ORDER.indexOf(a.day.toLowerCase())
    const bi = DAY_ORDER.indexOf(b.day.toLowerCase())
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  return entries.slice(0, 7)
}

export function googleFonts(families: string): string {
  const href = `https://fonts.googleapis.com/css2?${families.replace(/&/g, '&amp;')}&amp;display=swap`
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${href}" rel="stylesheet">`
}

export function documentHead(title: string, fonts: string, css: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>${googleFonts(fonts)}<style>${css}</style></head><body>`
}

/**
 * Hash clicks inside the preview iframe must never navigate the parent app.
 * Intercept them and scroll to the target section instead.
 */
export const NAV_INTERCEPTOR_SCRIPT = `<script>(function(){document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){if(document.documentElement.classList.contains('site-editing'))return;var href=a.getAttribute('href');if(!href||href==='#'||href.length<2)return;var target=document.getElementById(href.slice(1));e.preventDefault();e.stopPropagation();if(target){target.scrollIntoView({behavior:'smooth',block:'start'});}else{window.scrollTo({top:0,behavior:'smooth'});}return false;});});})();</script>`

/** Reveals, counters, mobile nav, scroll state, back-to-top and footer year. */
export const UI_SCRIPT = `<script>(function(){
  document.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear();});
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(function(el){io.observe(el);});
  }else{reveals.forEach(function(el){el.classList.add('in');});}
  function runCounter(el){
    var target=parseFloat(el.getAttribute('data-count')||'0');
    var decimals=parseInt(el.getAttribute('data-decimals')||'0',10);
    var start=null;
    function step(ts){
      if(start===null)start=ts;
      var p=Math.min((ts-start)/1500,1);
      var eased=1-Math.pow(1-p,3);
      el.textContent=(target*eased).toFixed(decimals);
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters=document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    var co=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){runCounter(entry.target);co.unobserve(entry.target);}});},{threshold:0.6});
    counters.forEach(function(el){co.observe(el);});
  }else{
    counters.forEach(function(el){el.textContent=parseFloat(el.getAttribute('data-count')||'0').toFixed(parseInt(el.getAttribute('data-decimals')||'0',10));});
  }
  var burger=document.querySelector('[data-burger]');
  var links=document.querySelector('.navlinks');
  if(burger&&links){
    burger.addEventListener('click',function(){links.classList.toggle('open');burger.classList.toggle('open');});
    links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open');burger.classList.remove('open');});});
  }
  var header=document.querySelector('.topbar');
  if(header){
    var onScroll=function(){if(window.scrollY>24)header.classList.add('scrolled');else header.classList.remove('scrolled');};
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }
  var top=document.querySelector('[data-to-top]');
  if(top){
    window.addEventListener('scroll',function(){if(window.scrollY>600)top.classList.add('show');else top.classList.remove('show');},{passive:true});
    top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  }
})();</script>`

export const GRAIN_OVERLAY = `<div aria-hidden="true" style="position:fixed;inset:0;z-index:9998;pointer-events:none;opacity:0.055;mix-blend-mode:overlay;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;);"></div>`

// ---------------------------------------------------------------------------
// Scrollable hero photo strip — shared by every template so each site opens
// with a draggable, snap-scrolling gallery of its own photography.
// ---------------------------------------------------------------------------

/** Provider-picked hero photos (falls back to the full gallery). */
export function heroSlides(business: BusinessData, images: string[]): string[] {
  const picked = heroPicks(business)
  const source = picked.length >= 2 ? picked : images
  return Array.from(new Set(source.filter(Boolean))).slice(0, 12)
}

export function heroRailHtml(images: string[], b: BusinessData): string {
  const usable = heroSlides(b, images).filter(Boolean)
  if (usable.length < 2) return ''
  const figures = usable
    .map(
      (src, i) =>
        `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(b.name || 'Business')} photo ${i + 1}" loading="${i < 2 ? 'eager' : 'lazy'}"></figure>`
    )
    .join('')
  const auto = b.heroAutoScroll === false ? '' : ' data-autoplay'
  return `<section class="hero-rail-band" aria-label="Hero photo strip">
    <div class="hero-rail-head"><span>${escapeHtml(b.category || 'Gallery')} · photo strip</span><span>Drag or scroll →</span></div>
    <div class="hero-rail"${auto}>${figures}</div>
  </section>`
}

export const HERO_RAIL_STYLES = `
  .hero-rail-band{max-width:1200px;margin:0 auto;padding:20px 24px 4px;position:relative;z-index:2}
  .hero-rail-head{display:flex;justify-content:space-between;align-items:center;gap:12px;font:600 10px/1.4 ui-monospace,'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;opacity:.55;margin-bottom:10px}
  .hero-rail{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 12px;scrollbar-width:thin;cursor:grab;-webkit-overflow-scrolling:touch}
  .hero-rail.dragging{cursor:grabbing;scroll-snap-type:none}
  .hero-rail figure{flex:0 0 clamp(160px,22vw,240px);aspect-ratio:4/3;margin:0;border-radius:14px;overflow:hidden;scroll-snap-align:start;background:rgba(127,127,127,.14)}
  .hero-rail img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
  .hero-rail figure:hover img{transform:scale(1.06)}
  @media(max-width:640px){.hero-rail-band{padding:16px 16px 2px}.hero-rail figure{flex-basis:150px}}
`

export const HERO_RAIL_SCRIPT = `<script>(function(){
  document.querySelectorAll('.hero-rail').forEach(function(rail){
    var down=false,startX=0,startLeft=0;
    rail.addEventListener('pointerdown',function(e){down=true;startX=e.clientX;startLeft=rail.scrollLeft;rail.classList.add('dragging');});
    rail.addEventListener('pointermove',function(e){if(!down)return;e.preventDefault();rail.scrollLeft=startLeft-(e.clientX-startX);});
    ['pointerup','pointerleave','pointercancel'].forEach(function(ev){rail.addEventListener(ev,function(){down=false;rail.classList.remove('dragging');});});
    if(rail.hasAttribute('data-autoplay')){
      var paused=false;
      rail.addEventListener('mouseenter',function(){paused=true;});
      rail.addEventListener('mouseleave',function(){paused=false;});
      rail.addEventListener('touchstart',function(){paused=true;},{passive:true});
      rail.addEventListener('touchend',function(){paused=false;},{passive:true});
      setInterval(function(){
        if(paused||down||document.hidden)return;
        if(rail.scrollWidth<=rail.clientWidth+4)return;
        rail.scrollLeft+=1;
        if(rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-1)rail.scrollLeft=0;
      },40);
    }
  });
})();</script>`

// ---------------------------------------------------------------------------
// Provider-editable website copy + single-page / multi-page experience.
// Both are applied as a small progressive-enhancement layer at the end of
// every generated site, so all templates (collection, bespoke and default)
// support them without duplicating markup.
// ---------------------------------------------------------------------------

export type SiteCopyKey =
  | 'heroTitle'
  | 'heroTagline'
  | 'aboutTitle'
  | 'aboutText'
  | 'galleryTitle'
  | 'offeringsTitle'
  | 'reviewsTitle'
  | 'visitTitle'
  | 'footerNote'
  | 'navAbout'
  | 'navGallery'
  | 'navOfferings'
  | 'navReviews'
  | 'navVisit'
  | 'navHome'

export type SiteCopy = Partial<Record<SiteCopyKey, string>>

const SITE_COPY_LIMITS: Record<SiteCopyKey, number> = {
  heroTitle: 90,
  heroTagline: 240,
  aboutTitle: 90,
  aboutText: 1400,
  galleryTitle: 90,
  offeringsTitle: 90,
  reviewsTitle: 90,
  visitTitle: 90,
  footerNote: 240,
  navAbout: 40,
  navGallery: 40,
  navOfferings: 40,
  navReviews: 40,
  navVisit: 40,
  navHome: 40
}

const SITE_COPY_KEYS = Object.keys(SITE_COPY_LIMITS) as SiteCopyKey[]

/** Reads the JSON stored on Business.siteContent; ignores unknown keys. */
export function siteCopy(business: BusinessData): SiteCopy {
  const raw = business.siteContent
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    if (!raw.trim()) return {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const record = parsed as Record<string, unknown>
  const out: SiteCopy = {}
  for (const key of SITE_COPY_KEYS) {
    const value = String(record[key] ?? '').trim().slice(0, SITE_COPY_LIMITS[key])
    if (value) out[key] = value
  }
  return out
}

function parseContentRecord(raw: unknown): Record<string, unknown> {
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    if (!raw.trim()) return {}
    try {
      parsed = JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  return parsed as Record<string, unknown>
}

// Click-to-edit text is stored as { texts: { "<dom path>": "new copy" } }.
// A path is built from tag names plus sibling indexes, e.g. "main.0>h2.1",
// so it survives a reload as long as the template markup itself is unchanged.
const TEXT_EDIT_LIMIT = 200
const TEXT_EDIT_KEY_RE = /^[a-z][a-z0-9]*\.\d+(>[a-z][a-z0-9]*\.\d+)*$/i
const TEXT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,span,a,button,li,strong,em,small,label,figcaption,blockquote,div'

export function siteTextOverrides(business: BusinessData): Record<string, string> {
  const record = parseContentRecord(business.siteContent)
  const texts = record.texts
  if (!texts || typeof texts !== 'object' || Array.isArray(texts)) return {}
  const out: Record<string, string> = {}
  let count = 0
  for (const [key, value] of Object.entries(texts as Record<string, unknown>)) {
    if (count >= TEXT_EDIT_LIMIT) break
    if (key.length > 300 || !TEXT_EDIT_KEY_RE.test(key)) continue
    const text = String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 400)
    if (!text) continue
    out[key] = text
    count += 1
  }
  return out
}

/** Validates and re-serialises siteContent before it is stored. */
export function sanitizeSiteContent(raw: unknown): string {
  const record = parseContentRecord(raw)
  const out: Record<string, unknown> = {}
  for (const key of SITE_COPY_KEYS) {
    const value = String(record[key] ?? '').trim().slice(0, SITE_COPY_LIMITS[key])
    if (value) out[key] = value
  }
  const texts: Record<string, string> = {}
  const textRecord = record.texts
  if (textRecord && typeof textRecord === 'object' && !Array.isArray(textRecord)) {
    let count = 0
    for (const [key, value] of Object.entries(textRecord as Record<string, unknown>)) {
      if (count >= TEXT_EDIT_LIMIT) break
      if (key.length > 300 || !TEXT_EDIT_KEY_RE.test(key)) continue
      const text = String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 400)
      if (!text) continue
      texts[key] = text
      count += 1
    }
  }
  if (Object.keys(texts).length > 0) out.texts = texts
  return Object.keys(out).length > 0 ? JSON.stringify(out) : ''
}

/** Applies click-to-edit overrides to the published site (no editor UI). */
function siteTextScript(texts: Record<string, string>): string {
  const json = JSON.stringify(texts).replace(/</g, '\u003c').replace(/>/g, '\u003e')
  return `<script>(function(){
  var t=${json};
  if(!t)return;
  function directText(el){
    for(var i=0;i<el.childNodes.length;i++){var n=el.childNodes[i];if(n.nodeType===3&&n.nodeValue.trim())return n;}
    return null;
  }
  function pathOf(el){
    var parts=[];
    while(el&&el.nodeType===1&&el!==document.body){
      var parent=el.parentElement;if(!parent)break;
      var index=0;
      for(var i=0;i<parent.children.length;i++){if(parent.children[i]===el){index=i;break;}}
      parts.unshift(el.tagName.toLowerCase()+'.'+index);
      el=parent;
    }
    return parts.join('>');
  }
  var els=document.body.querySelectorAll('${TEXT_SELECTOR}');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    if(el.hasAttribute('data-site-copy'))continue;
    var value=t[pathOf(el)];
    if(typeof value!=='string'||!value)continue;
    var node=directText(el);
    if(node)node.nodeValue=value;
    else el.textContent=value;
  }
})();</script>`
}

function siteCopyScript(copy: SiteCopy): string {
  const json = JSON.stringify(copy).replace(/</g, '\u003c').replace(/>/g, '\u003e')
  return `<script>(function(){
  var c=${json};
  function setText(selector,value){
    if(!value)return;
    var el=document.querySelector(selector);
    if(!el)return;
    el.textContent=value;
    el.setAttribute('data-site-copy','1');
  }
  // Nav labels keep any decorative prefix (e.g. <i>01</i>) intact.
  function setLabel(selector,value){
    if(!value)return;
    document.querySelectorAll(selector).forEach(function(el){
      var node=null;
      for(var i=el.childNodes.length-1;i>=0;i--){
        var n=el.childNodes[i];
        if(n.nodeType===3&&n.nodeValue.trim()){node=n;break;}
      }
      if(node)node.nodeValue=value;
      else el.textContent=value;
      el.setAttribute('data-site-copy','1');
    });
  }
  setText('.hero-tag',c.heroTagline);
  setText('.hero h1',c.heroTitle);
  setText('#about h2',c.aboutTitle);
  setText('#about .about-p, #about .dropcap',c.aboutText);
  setText('#gallery h2',c.galleryTitle);
  setText('#offerings h2, #products h2, #menu h2',c.offeringsTitle);
  setText('#reviews h2',c.reviewsTitle);
  setText('#visit h2, #contact h2',c.visitTitle);
  setText('footer p, footer .foot-note',c.footerNote);
  setLabel('.navlinks a[href="#about"]',c.navAbout);
  setLabel('.navlinks a[href="#gallery"]',c.navGallery);
  setLabel('.navlinks a[href="#offerings"], .navlinks a[href="#products"], .navlinks a[href="#menu"]',c.navOfferings);
  setLabel('.navlinks a[href="#reviews"]',c.navReviews);
  setLabel('.navlinks a[href="#visit"], .navlinks a[href="#contact"]',c.navVisit);
  setLabel('.navlinks a[data-page="home"]',c.navHome);
})();</script>`
}

const FONT_STACKS: Record<string, string> = {
  sans: 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',
  serif: 'Georgia,"Times New Roman",Times,serif',
  modern: '"Inter","Segoe UI",system-ui,-apple-system,sans-serif',
  classic: '"Palatino Linotype","Book Antiqua",Palatino,Georgia,serif'
}

const DESIGN_SECTION_SELECTOR =
  '#about,#gallery,#products,#offerings,#menu,#reviews,#visit,#contact'

// The provider's font/layout choices and the section switches from the wizard.
// Applied as a last CSS + script layer so all 20 templates honour them.
function siteDesignStyles(business: BusinessData): string {
  const fontKey = String(business.fontChoice || '').toLowerCase()
  // "sans" (the wizard default) keeps each template's own typography, so the
  // designer fonts are only replaced when the provider picks another style.
  const font = fontKey && fontKey !== 'sans' ? FONT_STACKS[fontKey] : ''
  const layout = String(business.layoutStyle || 'standard').toLowerCase()
  const pad = layout === 'compact' ? '48px' : layout === 'spacious' ? '104px' : ''
  const rules: string[] = []
  if (font) rules.push(`body{font-family:${font}!important}`)
  if (pad) {
    rules.push(`${DESIGN_SECTION_SELECTOR}{padding-top:${pad}!important;padding-bottom:${pad}!important}`)
  }
  rules.push('.site-section-off{display:none!important}')
  return `<style id="site-design-css">${rules.join('')}</style>`
}

function siteVisibilityScript(business: BusinessData): string {
  const flags = {
    gallery: business.showGallery !== false,
    hours: business.showHours !== false,
    reviews: business.showReviews !== false,
    map: business.showMap !== false,
    products: business.showProducts !== false
  }
  return `<script>(function(){
  var on=${JSON.stringify(flags)};
  function off(el){if(el)el.classList.add('site-section-off');}
  function card(el){
    try{return el.closest('.contact-card, .colophon-item')||el;}catch(err){return el;}
  }
  if(!on.gallery)off(document.getElementById('gallery'));
  if(!on.reviews)off(document.getElementById('reviews'));
  if(!on.products){
    ['products','offerings','menu'].forEach(function(id){off(document.getElementById(id));});
    document.querySelectorAll('.navlinks a[data-page="products"]').forEach(function(a){a.remove();});
  }
  if(!on.hours){
    document.querySelectorAll('.hours').forEach(function(el){off(card(el));});
  }
  if(!on.map){
    document.querySelectorAll('a[href*="google.com/maps"]').forEach(function(a){off(card(a));});
  }
})();</script>`
}

// Every generated template is grouped into four real pages:
//   Home · Products & services · About · Contact
// Sections keep their scroll anchors, but the site only shows one page at a
// time and the top navigation switches between them.
const PAGES_MODE_STYLES = `<style id="site-pages-css">
html.site-pages body{scroll-behavior:auto}
html.site-pages .site-page-hidden{display:none!important}
html.site-pages .site-page-active{animation:sitePageIn .45s ease both}
html.site-pages .navlinks a.site-nav-current{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1px}
@keyframes sitePageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
</style>`

const PAGES_MODE_SCRIPT = `<script>(function(){
  var body=document.body;
  // Stay quiet during the first draw; the host replies to "site-ready" with the
  // page that should be shown, so a reload does not bounce back to home.
  var ready=false;
  function usable(parent){
    return Array.prototype.filter.call(parent.children,function(el){
      if(/^(SCRIPT|STYLE|LINK|HEADER|FOOTER|NOSCRIPT|TEMPLATE)$/.test(el.tagName))return false;
      if(el.classList.contains('announce'))return false;
      if(el.classList.contains('site-section-off'))return false;
      var cs=getComputedStyle(el);
      if(cs.position==='fixed'||cs.position==='sticky')return false;
      return true;
    });
  }
  var blocks=usable(body);
  // Some skins wrap the whole page in <main id="top">; descend so each
  // section inside the wrapper becomes its own page block.
  if(blocks.length<=1&&blocks[0]){
    var inner=usable(blocks[0]);
    if(inner.length>1)blocks=inner;
  }
  if(blocks.length<2)return;
  function blockOf(id){
    var el=document.getElementById(id);
    if(!el)return null;
    for(var i=0;i<blocks.length;i++){
      if(blocks[i]===el||blocks[i].contains(el))return blocks[i];
    }
    return null;
  }
  var pages={home:[],products:[],about:[],contact:[]};
  var assigned={};
  function add(page,block){
    if(!block)return;
    var index=blocks.indexOf(block);
    if(index<0||assigned[index])return;
    assigned[index]=page;
    pages[page].push(block);
  }
  // The site engine states each block's page outright; older skins are grouped
  // by their section ids below instead.
  var declared=false;
  for(var d=0;d<blocks.length;d++){
    var group=blocks[d].getAttribute?blocks[d].getAttribute('data-page-group'):null;
    if(group&&pages[group]){pages[group].push(blocks[d]);assigned[d]=group;declared=true;}
  }
  if(!declared){
    add('products',blockOf('products')||blockOf('offerings')||blockOf('menu'));
    add('about',blockOf('about'));
    add('about',blockOf('gallery'));
    add('contact',blockOf('contact')||blockOf('visit'));
    add('home',blockOf('reviews'));
  }
  for(var i=0;i<blocks.length;i++){
    if(!assigned[i]){assigned[i]='home';pages.home.push(blocks[i]);}
  }
  if(pages.home.length===0){assigned[0]='home';pages.home.push(blocks[0]);}
  function pageOfBlock(block){
    var index=blocks.indexOf(block);
    return index>=0&&assigned[index]?assigned[index]:'home';
  }
  function setCurrent(page){
    document.querySelectorAll('.navlinks a[data-page]').forEach(function(a){
      if(a.getAttribute('data-page')===page)a.classList.add('site-nav-current');
      else a.classList.remove('site-nav-current');
    });
  }
  function draw(page,anchorId){
    var list=pages[page]&&pages[page].length?pages[page]:pages.home;
    blocks.forEach(function(el){
      var visible=list.indexOf(el)>=0;
      if(visible){el.classList.remove('site-page-hidden');el.classList.add('site-page-active');}
      else{el.classList.add('site-page-hidden');el.classList.remove('site-page-active');}
    });
    setCurrent(page);
    try{
      if(ready&&window.parent&&window.parent!==window)window.parent.postMessage({type:'site-page-change',page:page},'*');
    }catch(err){}
    var target=anchorId?document.getElementById(anchorId):null;
    if(target&&target.offsetParent!==null){
      try{target.scrollIntoView({block:'start'});}catch(err){window.scrollTo(0,0);}
    }else{
      window.scrollTo(0,0);
    }
  }
  window.addEventListener('message',function(e){
    var data=e.data||{};
    if(data.type==='site-page'&&pages[data.page])draw(data.page,'');
  });
  document.addEventListener('click',function(e){
    var node=e.target;
    var a=node&&node.closest?node.closest('a[href^="#"]'):null;
    if(!a)return;
    var href=a.getAttribute('href')||'';
    if(href.length<2)return;
    var id=href.slice(1);
    if(id==='top'){
      var page=a.getAttribute('data-page')||'home';
      if(pages[page]){e.preventDefault();draw(page,'');}
      return;
    }
    var block=blockOf(id);
    if(!block)return;
    e.preventDefault();
    draw(pageOfBlock(block),id);
  },true);
  document.documentElement.classList.add('site-pages');
  // Nav links carry real page URLs so each page is crawlable. Inside the
  // preview iframe those URLs cannot resolve, so draw the page locally.
  if(window.self!==window.top){
    document.addEventListener('click',function(e){
      var link=e.target&&e.target.closest?e.target.closest('a[data-page]'):null;
      if(!link)return;
      var wanted=link.getAttribute('data-page');
      if(!pages[wanted]||!pages[wanted].length)return;
      e.preventDefault();
      draw(wanted,'');
    },true);
  }
  var initial=location.hash?location.hash.slice(1):'';
  var served=body.getAttribute?body.getAttribute('data-start-page'):'';
  if(initial&&initial!=='top'){
    var start=blockOf(initial);
    if(start)draw(pageOfBlock(start),initial);
    else if(served&&pages[served]&&pages[served].length)draw(served,'');
    else draw('home','');
  }else if(served&&pages[served]&&pages[served].length){
    draw(served,'');
  }else{
    draw('home','');
  }
  // Tell the preview host the document is ready, so it can re-apply the
  // current page and edit mode after an iframe reload.
  ready=true;
  try{
    if(window.parent&&window.parent!==window)window.parent.postMessage({type:'site-ready'},'*');
  }catch(err){}
})();</script>`

// ---------------------------------------------------------------------------
// Inline preview editor — only injected into the wizard iframe, never into the
// published site. The parent app enables it over postMessage; clicks on tagged
// copy are committed back to the wizard as { type: 'site-copy-edit' }.
// ---------------------------------------------------------------------------

const PREVIEW_EDITOR_STYLES = `<style id="site-editor-css">
html.site-editing [data-edit-key],html.site-editing [data-edit-index],html.site-editing [data-edit-path]{cursor:text;outline:1.5px dashed rgba(13,148,136,.42);outline-offset:4px;border-radius:3px;transition:background .15s ease,outline-color .15s ease}
html.site-editing [data-edit-key]:hover,html.site-editing [data-edit-index]:hover,html.site-editing [data-edit-path]:hover{background:rgba(13,148,136,.10);outline-color:#0d9488}
html.site-editing [data-edit-key]:focus,html.site-editing [data-edit-index]:focus,html.site-editing [data-edit-path]:focus{outline:2px solid #0d9488;background:rgba(13,148,136,.14)}
html.site-editing [data-edit-nav]{cursor:pointer;outline-style:dotted}
</style>`

const PREVIEW_EDITOR_SCRIPT = `<script>(function(){
  var root=document.documentElement;
  var active=null;
  var original='';
  var activeText=null;
  function isEditing(){return root.classList.contains('site-editing');}
  function directText(el){
    for(var i=0;i<el.childNodes.length;i++){var n=el.childNodes[i];if(n.nodeType===3&&n.nodeValue.trim())return n;}
    return null;
  }
  function pathOf(el){
    var parts=[];
    while(el&&el.nodeType===1&&el!==document.body){
      var parent=el.parentElement;if(!parent)break;
      var index=0;
      for(var i=0;i<parent.children.length;i++){if(parent.children[i]===el){index=i;break;}}
      parts.unshift(el.tagName.toLowerCase()+'.'+index);
      el=parent;
    }
    return parts.join('>');
  }
  function eligible(el){
    if(!el||el.nodeType!==1)return false;
    if(/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|OPTION|SVG|PATH|IFRAME)$/.test(el.tagName))return false;
    if(el.closest('[data-no-edit]'))return false;
    if(el.closest('.navlinks'))return false;
    if(!directText(el))return false;
    for(var i=0;i<el.children.length;i++){
      var child=el.children[i];
      if(child.textContent.trim())return false;
      if(!/^(svg|br|img|path|span|i)$/i.test(child.tagName))return false;
    }
    return true;
  }
  function copy(el,key){
    if(!el||el.getAttribute('data-edit-key'))return;
    el.setAttribute('data-edit-key',key);
    el.setAttribute('data-edit-kind','copy');
  }
  // Wrap only the text of a nav link so decorative parts stay intact.
  function nav(selector,key){
    document.querySelectorAll(selector).forEach(function(a){
      if(a.querySelector('[data-edit-key]')||a.getAttribute('data-edit-key'))return;
      var node=null;
      for(var i=a.childNodes.length-1;i>=0;i--){
        var n=a.childNodes[i];
        if(n.nodeType===3&&n.nodeValue.trim()){node=n;break;}
      }
      if(node){
        var span=document.createElement('span');
        span.textContent=node.nodeValue.trim();
        span.setAttribute('data-edit-nav','1');
        a.replaceChild(span,node);
        copy(span,key);
      }else{copy(a,key);}
    });
  }
  function markProduct(el,index,field){
    if(!el||el.getAttribute('data-edit-index'))return;
    el.setAttribute('data-edit-kind','product');
    el.setAttribute('data-edit-index',String(index));
    el.setAttribute('data-edit-field',field);
  }
  function tagProducts(){
    var cards=document.querySelectorAll('#products .product, #offerings .product, #products .price-row, #products .pick, #offerings .menu-row, #offerings .offer-row, #offerings .offer-chip');
    Array.prototype.forEach.call(cards,function(card,index){
      if(index>=12)return;
      card.setAttribute('data-no-edit','1');
      var nameEl=card.querySelector('h3 > span')||card.querySelector('h3')||(card.classList.contains('offer-chip')?card.querySelector('span'):null);
      var priceEl=card.querySelector('.menu-price')||card.querySelector('.price')||card.querySelector('.product-price')||card.querySelector('.pick-price')||(card.classList.contains('offer-chip')?card.querySelector('b'):null);
      markProduct(nameEl,index,'name');
      markProduct(priceEl,index,'price');
    });
  }
  function tagText(){
    var els=document.querySelectorAll('${TEXT_SELECTOR}');
    var count=0;
    for(var i=0;i<els.length&&count<400;i++){
      var el=els[i];
      if(el.getAttribute('data-edit-key')||el.getAttribute('data-edit-path'))continue;
      if(!eligible(el))continue;
      el.setAttribute('data-edit-kind','text');
      el.setAttribute('data-edit-path',pathOf(el));
      count++;
    }
  }
  function tag(){
    copy(document.querySelector('.hero h1'),'heroTitle');
    copy(document.querySelector('.hero-tag'),'heroTagline');
    copy(document.querySelector('#about h2'),'aboutTitle');
    copy(document.querySelector('#about .about-p, #about .dropcap'),'aboutText');
    copy(document.querySelector('#gallery h2'),'galleryTitle');
    copy(document.querySelector('#offerings h2, #products h2, #menu h2'),'offeringsTitle');
    copy(document.querySelector('#reviews h2'),'reviewsTitle');
    copy(document.querySelector('#visit h2, #contact h2'),'visitTitle');
    copy(document.querySelector('footer .foot-note, footer p'),'footerNote');
    copy(document.querySelector('.navlinks .nav-cta'),'ctaLabel');
    copy(document.querySelector('.hero .btn-primary, .hero-actions .btn-primary'),'ctaLabel');
    copy(document.querySelector('.hero .btn-ghost, .hero-actions .btn-ghost'),'cta2Label');
    nav('.navlinks a[href="#about"]','navAbout');
    nav('.navlinks a[href="#gallery"]','navGallery');
    nav('.navlinks a[href="#offerings"], .navlinks a[href="#products"], .navlinks a[href="#menu"]','navOfferings');
    nav('.navlinks a[href="#reviews"]','navReviews');
    nav('.navlinks a[href="#visit"], .navlinks a[href="#contact"]','navVisit');
    nav('.navlinks a[data-page="home"]','navHome');
    tagProducts();
    tagText();
  }
  function start(el){
    active=el;
    original=el.innerHTML;
    activeText=el.getAttribute('data-edit-kind')==='text'?directText(el):null;
    el.setAttribute('contenteditable','true');
    el.focus();
    var range=document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel=window.getSelection();
    if(sel){sel.removeAllRanges();sel.addRange(range);}
    el.addEventListener('blur',function(){if(active===el)commit();},{once:true});
  }
  function commit(){
    var el=active;
    if(!el)return;
    active=null;
    el.removeAttribute('contenteditable');
    var value=(el.textContent||'').replace(/\\s+/g,' ').trim();
    var kind=el.getAttribute('data-edit-kind');
    if(kind==='product'){
      el.textContent=value;
      window.parent.postMessage({type:'site-product-edit',index:Number(el.getAttribute('data-edit-index')),field:el.getAttribute('data-edit-field'),value:value},'*');
    }else if(kind==='text'){
      if(activeText&&activeText.isConnected&&activeText.parentNode===el)activeText.nodeValue=value;
      else el.textContent=value;
      var path=el.getAttribute('data-edit-path');
      if(path)window.parent.postMessage({type:'site-text-edit',path:path,value:value},'*');
    }else{
      el.textContent=value;
      var key=el.getAttribute('data-edit-key');
      if(key)window.parent.postMessage({type:'site-copy-edit',key:key,value:value},'*');
    }
  }
  function revert(){
    var el=active;
    if(!el)return;
    active=null;
    el.innerHTML=original;
    el.removeAttribute('contenteditable');
  }
  document.addEventListener('click',function(e){
    if(!isEditing())return;
    var node=e.target;
    var el=node&&node.closest?node.closest('[data-edit-key],[data-edit-index],[data-edit-path]'):null;
    if(!el)return;
    // Menu links keep navigating on a single click; double-click renames them.
    if(el.hasAttribute('data-edit-nav'))return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(active===el)return;
    commit();
    start(el);
  },true);
  document.addEventListener('dblclick',function(e){
    if(!isEditing())return;
    var node=e.target;
    var el=node&&node.closest?node.closest('[data-edit-nav]'):null;
    if(!el)return;
    e.preventDefault();
    e.stopPropagation();
    if(active===el)return;
    commit();
    start(el);
  },true);
  document.addEventListener('keydown',function(e){
    if(!active)return;
    if(e.key==='Enter'){e.preventDefault();commit();}
    else if(e.key==='Escape'){e.preventDefault();revert();}
  },true);
  document.addEventListener('paste',function(e){
    if(!active)return;
    e.preventDefault();
    var text=e.clipboardData?e.clipboardData.getData('text/plain'):'';
    if(text)document.execCommand('insertText',false,text);
  },true);
  function enable(){tag();root.classList.add('site-editing');}
  function disable(){commit();root.classList.remove('site-editing');}
  window.addEventListener('message',function(e){
    var d=e.data||{};
    if(d.type==='site-edit-mode'){if(d.enabled){enable();}else{disable();}}
  });
})();</script>`

/** Injects the click-to-edit layer into a preview iframe document. */
export function withPreviewEditor(html: string): string {
  if (html.includes('id="site-editor-css"')) return html
  return html.replace('</body>', `${PREVIEW_EDITOR_STYLES}${PREVIEW_EDITOR_SCRIPT}</body>`)
}

/** Applies provider copy overrides and the four-page navigation to generated HTML. */
export function applySiteExperience(html: string, business: BusinessData): string {
  let out = html
  const copy = siteCopy(business)
  if (Object.keys(copy).length > 0) {
    out = out.replace('</body>', `${siteCopyScript(copy)}</body>`)
  }
  const texts = siteTextOverrides(business)
  if (Object.keys(texts).length > 0) {
    out = out.replace('</body>', `${siteTextScript(texts)}</body>`)
  }
  // Every template ships the same four pages, so the page shell is always on.
  // Design + section switches are injected first so the page script sees them.
  out = out.replace(
    '</body>',
    `${siteDesignStyles(business)}${siteVisibilityScript(business)}${PAGES_MODE_STYLES}${PAGES_MODE_SCRIPT}</body>`
  )
  return out
}
