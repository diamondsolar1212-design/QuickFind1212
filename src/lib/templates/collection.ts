// 15 designer website templates rendered from a shared skin system.
// Every skin has its own palette, typography, navigation style, hero
// composition, section order and card treatments so no two sites look alike.

import {
  anchorAttrs,
  collectImages,
  customLinks,
  documentHead,
  escapeHtml,
  heroImage,
  heroSlides,
  initials,
  mapHref,
  primaryCta,
  productMediaHtml,
  ratingOf,
  reviewCountOf,
  secondaryCta,
  siteLinkHtml,
  starsHtml,
  telHref,
  truncate,
  UI_SCRIPT,
  waHref,
  type BusinessData,
  type HourEntry,
  type SiteLink,
  type TemplateProduct
} from './shared'

type SectionKey = 'about' | 'gallery' | 'offerings' | 'reviews' | 'visit'

interface SkinStyle {
  bg: string
  surface: string
  ink: string
  muted: string
  accent: string
  line: string
  display: string
  body: string
  google: string
  radius: number
  nav: 'classic' | 'centered' | 'modern' | 'pill' | 'announce'
  hero: 'split' | 'reversed' | 'full' | 'framed' | 'stacked' | 'diagonal' | 'poster' | 'minimal'
  gallery: 'grid' | 'masonry' | 'rail' | 'mosaic' | 'pairs' | 'strip'
  about: 'split' | 'dropcap' | 'stats' | 'centered' | 'pull'
  offerings: 'cards' | 'menu' | 'rows' | 'compact'
  reviews: 'quote' | 'wall' | 'big' | 'ticker'
  visit: 'split' | 'card' | 'strip'
  order: SectionKey[]
  uppercase?: boolean
  displayWeight?: number
}

const SKINS: Record<string, SkinStyle> = {
  'blush-atelier': {
    bg: '#fdf3ef', surface: '#ffffff', ink: '#2b1a1a', muted: '#7c5f5e', accent: '#d96a7a', line: '#efd9d4',
    display: 'Playfair Display', body: 'Karla', radius: 20, displayWeight: 500,
    nav: 'classic', hero: 'split', gallery: 'masonry', about: 'split',
    offerings: 'cards', reviews: 'quote', visit: 'split',
    order: ['about', 'gallery', 'offerings', 'reviews', 'visit'],
    google: 'family=Playfair+Display:wght@400;500;600;700&family=Karla:wght@300;400;500;600;700'
  },
  'coastal-drift': {
    bg: '#f2f7f7', surface: '#ffffff', ink: '#0d2b33', muted: '#527078', accent: '#0e7490', line: '#d3e5e7',
    display: 'DM Serif Display', body: 'Outfit', radius: 6, displayWeight: 400,
    nav: 'modern', hero: 'full', gallery: 'mosaic', about: 'centered',
    offerings: 'rows', reviews: 'wall', visit: 'strip',
    order: ['gallery', 'about', 'offerings', 'reviews', 'visit'],
    google: 'family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700'
  },
  'noir-edition': {
    bg: '#0e0e0e', surface: '#171717', ink: '#f4f1ea', muted: '#a09a8e', accent: '#d4b483', line: '#2c2a26',
    display: 'Bodoni Moda', body: 'Manrope', radius: 0, displayWeight: 500,
    nav: 'announce', hero: 'framed', gallery: 'rail', about: 'pull',
    offerings: 'menu', reviews: 'big', visit: 'card',
    order: ['offerings', 'gallery', 'about', 'reviews', 'visit'],
    google: 'family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600&family=Manrope:wght@300;400;500;600'
  },
  'citrus-studio': {
    bg: '#fffdf2', surface: '#ffffff', ink: '#1c1c10', muted: '#6d6a4c', accent: '#f5c518', line: '#eee7c4',
    display: 'Bricolage Grotesque', body: 'Inter', radius: 22, displayWeight: 800,
    nav: 'pill', hero: 'stacked', gallery: 'grid', about: 'stats',
    offerings: 'compact', reviews: 'ticker', visit: 'split',
    order: ['gallery', 'offerings', 'about', 'reviews', 'visit'],
    google: 'family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@300;400;500;600;700'
  },
  'terracotta-house': {
    bg: '#fbf1e8', surface: '#fffaf4', ink: '#3b2418', muted: '#8a6a55', accent: '#b4552d', line: '#ecd9c8',
    display: 'Libre Baskerville', body: 'Karla', radius: 8, displayWeight: 700,
    nav: 'classic', hero: 'reversed', gallery: 'pairs', about: 'dropcap',
    offerings: 'rows', reviews: 'quote', visit: 'split',
    order: ['about', 'offerings', 'gallery', 'reviews', 'visit'],
    google: 'family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Karla:wght@300;400;500;600;700'
  },
  'violet-pulse': {
    bg: '#0b0614', surface: '#150a24', ink: '#f5edff', muted: '#a996c4', accent: '#ff4ecd', line: '#2a1a40',
    display: 'Space Grotesk', body: 'Manrope', radius: 16, displayWeight: 600,
    nav: 'modern', hero: 'poster', gallery: 'mosaic', about: 'stats',
    offerings: 'cards', reviews: 'wall', visit: 'card',
    order: ['offerings', 'gallery', 'about', 'reviews', 'visit'],
    google: 'family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@300;400;500;600'
  },
  'sage-journal': {
    bg: '#f6f3ec', surface: '#fdfbf6', ink: '#26302a', muted: '#6f7a70', accent: '#6f7f6a', line: '#e2ddd0',
    display: 'Cormorant Garamond', body: 'Inter', radius: 2, displayWeight: 500,
    nav: 'announce', hero: 'minimal', gallery: 'strip', about: 'dropcap',
    offerings: 'menu', reviews: 'quote', visit: 'strip',
    order: ['about', 'gallery', 'offerings', 'reviews', 'visit'],
    google: 'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600'
  },
  'maroon-heritage': {
    bg: '#fbf5ea', surface: '#fffdf8', ink: '#3d0f16', muted: '#7c5b52', accent: '#8c1c2b', line: '#eadbc3',
    display: 'Marcellus', body: 'Lato', radius: 0, displayWeight: 400,
    nav: 'centered', hero: 'framed', gallery: 'pairs', about: 'pull',
    offerings: 'rows', reviews: 'big', visit: 'split',
    order: ['about', 'offerings', 'gallery', 'reviews', 'visit'],
    google: 'family=Marcellus&family=Lato:ital,wght@0,300;0,400;0,700;1,400'
  },
  'monochrome-lab': {
    bg: '#ffffff', surface: '#f4f4f4', ink: '#111111', muted: '#666666', accent: '#111111', line: '#dddddd',
    display: 'IBM Plex Mono', body: 'IBM Plex Sans', radius: 0, displayWeight: 600, uppercase: true,
    nav: 'modern', hero: 'minimal', gallery: 'mosaic', about: 'stats',
    offerings: 'menu', reviews: 'ticker', visit: 'strip',
    order: ['gallery', 'offerings', 'about', 'reviews', 'visit'],
    google: 'family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600'
  },
  'peach-sunset': {
    bg: '#fff4ee', surface: '#ffffff', ink: '#3a1c17', muted: '#8a625a', accent: '#f0552f', line: '#f8ddd3',
    display: 'Sora', body: 'Inter', radius: 24, displayWeight: 600,
    nav: 'pill', hero: 'poster', gallery: 'rail', about: 'centered',
    offerings: 'cards', reviews: 'quote', visit: 'card',
    order: ['offerings', 'gallery', 'about', 'reviews', 'visit'],
    google: 'family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600'
  },
  'forest-table': {
    bg: '#f3f6ee', surface: '#ffffff', ink: '#20301f', muted: '#66755f', accent: '#3f6b3a', line: '#dbe3d0',
    display: 'Lora', body: 'Work Sans', radius: 10, displayWeight: 500,
    nav: 'classic', hero: 'split', gallery: 'strip', about: 'centered',
    offerings: 'menu', reviews: 'quote', visit: 'split',
    order: ['offerings', 'about', 'gallery', 'reviews', 'visit'],
    google: 'family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Work+Sans:wght@300;400;500;600'
  },
  'steel-works': {
    bg: '#e9ebee', surface: '#f7f8f9', ink: '#15181c', muted: '#5c636b', accent: '#f2b705', line: '#d2d6db',
    display: 'Oswald', body: 'Inter', radius: 2, displayWeight: 600, uppercase: true,
    nav: 'announce', hero: 'diagonal', gallery: 'grid', about: 'stats',
    offerings: 'rows', reviews: 'big', visit: 'strip',
    order: ['gallery', 'about', 'offerings', 'reviews', 'visit'],
    google: 'family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600'
  },
  'lavender-hush': {
    bg: '#f7f4ff', surface: '#ffffff', ink: '#2f2850', muted: '#7b7398', accent: '#8b7bd8', line: '#e6e0f7',
    display: 'Quicksand', body: 'Nunito Sans', radius: 26, displayWeight: 600,
    nav: 'centered', hero: 'framed', gallery: 'mosaic', about: 'pull',
    offerings: 'compact', reviews: 'wall', visit: 'card',
    order: ['offerings', 'about', 'gallery', 'reviews', 'visit'],
    google: 'family=Quicksand:wght@400;500;600;700&family=Nunito+Sans:wght@300;400;500;600'
  },
  'rust-modern': {
    bg: '#f4ede4', surface: '#fbf7f1', ink: '#1d1a17', muted: '#6f6258', accent: '#c2410c', line: '#e0d4c5',
    display: 'Archivo', body: 'Archivo Narrow', radius: 0, displayWeight: 800, uppercase: true,
    nav: 'modern', hero: 'stacked', gallery: 'rail', about: 'dropcap',
    offerings: 'cards', reviews: 'ticker', visit: 'split',
    order: ['gallery', 'about', 'offerings', 'reviews', 'visit'],
    google: 'family=Archivo:wght@400;500;600;700;800&family=Archivo+Narrow:wght@400;500;600'
  },
  'aqua-house': {
    bg: '#effbfa', surface: '#ffffff', ink: '#063a3a', muted: '#4f7b7b', accent: '#0d9488', line: '#cdeceb',
    display: 'Outfit', body: 'DM Sans', radius: 18, displayWeight: 600,
    nav: 'modern', hero: 'full', gallery: 'grid', about: 'stats',
    offerings: 'rows', reviews: 'quote', visit: 'strip',
    order: ['about', 'offerings', 'gallery', 'reviews', 'visit'],
    google: 'family=Outfit:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600'
  }
}

export function isCollectionSkin(id: string): boolean {
  return !!SKINS[id]
}

// ── small render helpers ────────────────────────────────────────────────────

function fallbackMedia(background: string, label: string, size = '2.2rem'): string {
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:${size};background:${background};">${escapeHtml(label)}</div>`
}

function imageOrFallback(src: string, alt: string, background: string, label: string): string {
  if (src) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">`
  }
  return fallbackMedia(background, label, '2.6rem')
}

function railHtml(images: string[], b: BusinessData): string {
  const slides = heroSlides(b, images)
  if (slides.length === 0) return ''
  const figures = slides
    .map(
      (src, i) =>
        `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(b.name)} photo ${i + 1}" loading="${i < 2 ? 'eager' : 'lazy'}"></figure>`
    )
    .join('')
  const auto = b.heroAutoScroll === false ? '' : ' data-autoplay'
  return `<section class="rail-band" aria-label="Hero image gallery"><div class="wrap">
    <div class="rail-label"><span>Photo strip — ${escapeHtml(b.category || 'Business')}</span><b>Scroll →</b></div>
    <div class="hero-rail"${auto}>${figures}</div>
  </div></section>`
}

function galleryFigures(images: string[], b: BusinessData): string {
  if (images.length === 0) {
    return Array.from({ length: 4 })
      .map(
        (_, i) =>
          `<figure class="ph">${fallbackMedia('linear-gradient(135deg,var(--surface),var(--accent))', '◈', '2.4rem')}</figure>`
      )
      .join('')
  }
  return images
    .map(
      (src, i) =>
        `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(b.name)} gallery ${i + 1}" loading="lazy"></figure>`
    )
    .join('')
}

function photoCount(b: BusinessData): number {
  return collectImages(b).length
}

function sectionHead(eyebrow: string, title: string, copy = ''): string {
  return `<div class="section-head reveal">
    <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2></div>
    ${copy ? `<p>${escapeHtml(copy)}</p>` : ''}
  </div>`
}

function heroMeta(b: BusinessData): string {
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  return `<div class="hero-meta">
    <div><b>${rating.toFixed(1)} / 5</b><span>Rated by ${reviews}</span></div>
    <div><b>${escapeHtml(b.city || 'India')}</b><span>Based in</span></div>
    <div><b>${b.phone ? 'Direct' : 'Local'}</b><span>Contact</span></div>
  </div>`
}

function factsHtml(b: BusinessData, variant = ''): string {
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  return `<div class="facts ${variant}">
    <div class="fact"><span>Rating</span><b>${rating.toFixed(1)} / 5</b></div>
    <div class="fact"><span>Reviews</span><b>${reviews}</b></div>
    <div class="fact"><span>Category</span><b>${escapeHtml(b.category || '—')}</b></div>
    <div class="fact"><span>City</span><b>${escapeHtml(b.city || '—')}</b></div>
  </div>`
}

function statCards(b: BusinessData): string {
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  return `<div class="stat-grid">
    <div class="stat-card"><span>Average rating</span><b>${rating > 0 ? rating.toFixed(1) : 'New'}</b><small>out of 5</small></div>
    <div class="stat-card"><span>Verified reviews</span><b>${reviews}</b><small>customer voices</small></div>
    <div class="stat-card"><span>Photo story</span><b>${photoCount(b)}</b><small>images to explore</small></div>
    <div class="stat-card"><span>Based in</span><b class="stat-text">${escapeHtml(b.city || 'India')}</b><small>${escapeHtml(b.state || '')}</small></div>
  </div>`
}

function navHtml(skin: SkinStyle, b: BusinessData, primary: SiteLink, products: TemplateProduct[]): string {
  const custom = customLinks(b).slice(0, 2).map((link) => siteLinkHtml(link, 'nav-custom'))
  const anchors = [
    `<a href="#top" data-page="home">Home</a>`,
    `<a href="#offerings" data-page="products">Products &amp; services</a>`,
    `<a href="#about" data-page="about">About</a>`,
    `<a href="#visit" data-page="contact">Contact</a>`
  ]
  const cta = `<a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>`
  const brand = `<a class="brand" href="#top"><span class="brand-mark">${escapeHtml(initials(b.name))}</span><span>${escapeHtml(b.name)}</span></a>`
  const burger = `<button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>`

  if (skin.nav === 'modern') {
    return `<header class="topbar topbar--modern"><div class="wrap nav">
      ${brand}
      <nav class="navlinks">${anchors.join('')}${custom.join('')}${cta}</nav>
      ${burger}
    </div></header>`
  }
  if (skin.nav === 'pill') {
    return `<header class="topbar topbar--pill"><div class="wrap nav">
      ${brand}
      <nav class="navlinks">${anchors.join('')}${custom.join('')}${cta}</nav>
      ${burger}
    </div></header>`
  }
  if (skin.nav === 'centered') {
    return `<header class="topbar topbar--decks"><div class="wrap nav">
      ${brand}
      <nav class="navlinks">${anchors.join('')}${custom.join('')}${cta}</nav>
      ${burger}
    </div></header>`
  }
  if (skin.nav === 'announce') {
    return `<div class="announce"><div class="wrap">
      <span>${escapeHtml(b.city || 'India')} · ${escapeHtml(b.category || 'Business')}</span>
      <span>${b.phone ? `<a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone)}</a>` : 'Open today'}</span>
    </div></div>
    <header class="topbar"><div class="wrap nav">
      ${brand}
      <nav class="navlinks">${anchors.join('')}${custom.join('')}${cta}</nav>
      ${burger}
    </div></header>`
  }
  return `<header class="topbar"><div class="wrap nav">
    ${brand}
    <nav class="navlinks">${anchors.join('')}${custom.join('')}${cta}</nav>
    ${burger}
  </div></header>`
}

function heroCopy(b: BusinessData, primary: SiteLink, secondary: SiteLink): string {
  return `<div class="hero-copy">
    <p class="eyebrow">${escapeHtml(b.category || 'Business')} · ${escapeHtml(b.city || 'India')}${b.state ? ' · ' + escapeHtml(b.state) : ''}</p>
    <h1>${escapeHtml(b.name)}</h1>
    <p class="hero-tag">${escapeHtml(truncate(b.description || 'Quality products and services, delivered with care.', 190))}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)} →</a>
      <a class="btn btn-ghost" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
    </div>
    ${heroMeta(b)}
  </div>`
}

function heroMedia(b: BusinessData, images: string[]): string {
  const src = heroImage(b, images)
  const fallback = `linear-gradient(135deg,var(--accent),var(--ink))`
  return `<figure class="hero-media">${imageOrFallback(src, b.name, fallback, initials(b.name))}
    <figcaption class="hero-badge">${escapeHtml(b.category || 'Featured')} · ${escapeHtml(b.city || 'India')}</figcaption>
  </figure>`
}

function heroHtml(skin: SkinStyle, b: BusinessData, images: string[], primary: SiteLink, secondary: SiteLink): string {
  const src = heroImage(b, images)
  const fallback = `linear-gradient(135deg,var(--accent),var(--ink))`

  if (skin.hero === 'full') {
    return `<section class="hero hero-full" id="top">
      ${src ? `<img class="hero-bg" src="${escapeHtml(src)}" alt="${escapeHtml(b.name)}" loading="eager">` : `<div class="hero-bg hero-fallback">${fallbackMedia(fallback, initials(b.name), 'clamp(6rem,18vw,14rem)')}</div>`}
      <div class="hero-veil"></div>
      <div class="wrap">${heroCopy(b, primary, secondary)}</div>
      <div class="hero-scroll">Scroll ↓</div>
    </section>`
  }
  if (skin.hero === 'framed') {
    return `<section class="hero hero-framed" id="top"><div class="wrap">
      <div class="hero-frame">${imageOrFallback(src, b.name, fallback, initials(b.name))}</div>
      ${heroCopy(b, primary, secondary)}
    </div></section>`
  }
  if (skin.hero === 'stacked') {
    return `<section class="hero hero-stacked" id="top"><div class="wrap">
      ${heroCopy(b, primary, secondary)}
      <figure class="hero-wide">${imageOrFallback(src, b.name, fallback, initials(b.name))}</figure>
    </div></section>`
  }
  if (skin.hero === 'diagonal') {
    return `<section class="hero hero-diagonal" id="top"><div class="wrap hero-grid">
      ${heroCopy(b, primary, secondary)}
      <figure class="hero-diag">${imageOrFallback(src, b.name, fallback, initials(b.name))}</figure>
    </div></section>`
  }
  if (skin.hero === 'reversed') {
    return `<section class="hero hero-reversed" id="top"><div class="wrap hero-grid">
      ${heroMedia(b, images)}
      ${heroCopy(b, primary, secondary)}
    </div></section>`
  }
  if (skin.hero === 'poster') {
    return `<section class="hero hero-poster" id="top">
      <div class="poster-frame">
        ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(b.name)}" loading="eager">` : `<div class="poster-fallback">${fallbackMedia(fallback, initials(b.name), 'clamp(6rem,18vw,14rem)')}</div>`}
        <div class="poster-veil"></div>
        <div class="wrap poster-inner">${heroCopy(b, primary, secondary)}</div>
      </div>
      <div class="poster-strip"><div class="wrap">
        <span>${escapeHtml(b.category || 'Business')} <b>· ${escapeHtml(b.city || 'India')}</b></span>
        <span>Rated <b>${ratingOf(b).toFixed(1)} ★</b> · ${reviewCountOf(b)} reviews</span>
        <span>${b.phone ? `<a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone)}</a>` : 'Local business'}</span>
      </div></div>
    </section>`
  }
  if (skin.hero === 'minimal') {
    return `<section class="hero hero-minimal" id="top"><div class="wrap">
      ${heroCopy(b, primary, secondary)}
    </div>
    <figure class="hero-band">${imageOrFallback(src, b.name, fallback, initials(b.name))}
      <figcaption class="hero-badge">${escapeHtml(b.category || 'Featured')} · ${escapeHtml(b.city || 'India')}</figcaption>
    </figure></section>`
  }
  return `<section class="hero hero-split" id="top"><div class="wrap hero-grid">
    ${heroCopy(b, primary, secondary)}
    ${heroMedia(b, images)}
  </div></section>`
}

function aboutHtml(skin: SkinStyle, b: BusinessData): string {
  const paragraphs = `<p class="about-p">${escapeHtml(b.description || '')}</p>
    <p class="about-p">Based in ${escapeHtml(b.city)}, ${escapeHtml(b.state)}, ${escapeHtml(b.name)} serves customers with care, quality and attention to detail. Every visit is an invitation to experience what makes us different.</p>`

  if (skin.about === 'dropcap') {
    return `<section class="section" id="about"><div class="wrap">
      <div class="about-dropcap reveal">
        <p class="eyebrow">About us</p>
        <h2>The short story.</h2>
        <div class="dropcap">${escapeHtml(b.description || '')} Based in ${escapeHtml(b.city)}, ${escapeHtml(b.state)}, ${escapeHtml(b.name)} serves customers with care, quality and attention to detail.</div>
      </div>
      ${factsHtml(b, 'facts-row reveal')}
    </div></section>`
  }
  if (skin.about === 'stats') {
    return `<section class="section" id="about"><div class="wrap about about-stats">
      <div class="reveal">
        <p class="eyebrow">About us</p>
        <h2>The short story.</h2>
        ${paragraphs}
      </div>
      <div class="reveal">${statCards(b)}</div>
    </div></section>`
  }
  if (skin.about === 'centered') {
    return `<section class="section" id="about"><div class="wrap">
      <div class="about-centered reveal">
        <p class="eyebrow">About us</p>
        <h2>Made with intention.</h2>
        ${paragraphs}
      </div>
      ${factsHtml(b, 'facts-row reveal')}
    </div></section>`
  }
  if (skin.about === 'pull') {
    return `<section class="section" id="about"><div class="wrap about about-pull">
      <div class="reveal">
        <p class="eyebrow">About us</p>
        <blockquote>“${escapeHtml(truncate(b.description || 'Quality, care and a personal welcome — every single day.', 140))}”</blockquote>
        <p class="about-p">${escapeHtml(b.name)} · ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</p>
      </div>
      ${factsHtml(b, 'reveal')}
    </div></section>`
  }
  return `<section class="section" id="about"><div class="wrap about">
    <div class="reveal">
      <p class="eyebrow">About us</p>
      <h2>The short story.</h2>
      ${paragraphs}
    </div>
    ${factsHtml(b, 'reveal')}
  </div></section>`
}

function galleryHtml(skin: SkinStyle, b: BusinessData, images: string[]): string {
  const copy = skin.gallery === 'strip' ? 'Swipe through the photo story.' : 'A closer look at what we do.'
  return `<section class="section" id="gallery"><div class="wrap">
    ${sectionHead('Gallery', skin.gallery === 'pairs' ? 'A study in detail.' : 'Inside the space.', truncate(b.description || copy, 120))}
    <div class="gallery ${skin.gallery}">${galleryFigures(images, b)}</div>
  </div></section>`
}

function productsHtml(skin: SkinStyle, b: BusinessData, products: TemplateProduct[]): string {
  const title =
    skin.offerings === 'menu' ? 'The catalogue.' :
    skin.offerings === 'rows' ? 'Signature products.' :
    skin.offerings === 'compact' ? 'Popular picks.' : 'Our products & services.'

  let inner = ''
  if (skin.offerings === 'menu') {
    inner = `<div class="menu-list">${products
      .map(
        (p) => `<article class="menu-row reveal">
          <div class="menu-thumb">${productMediaHtml(p, 'var(--surface)')}</div>
          <div class="menu-text">
            <h3><span>${escapeHtml(String(p.name ?? 'Product'))}</span><i class="menu-dots" aria-hidden="true"></i><b class="menu-price">${escapeHtml(String(p.price ?? ''))}</b></h3>
            ${p.details ? `<p>${escapeHtml(truncate(String(p.details), 110))}</p>` : ''}
          </div>
        </article>`
      )
      .join('')}</div>`
  } else if (skin.offerings === 'rows') {
    inner = `<div class="offer-rows">${products
      .map(
        (p, i) => `<article class="offer-row reveal${i % 2 ? ' flip' : ''}">
          <div class="offer-media">${productMediaHtml(p, 'var(--surface)')}</div>
          <div class="offer-body">
            <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
            <div class="price">${escapeHtml(String(p.price ?? ''))}</div>
            ${p.details ? `<p>${escapeHtml(truncate(String(p.details), 120))}</p>` : ''}
          </div>
        </article>`
      )
      .join('')}</div>`
  } else if (skin.offerings === 'compact') {
    inner = `<div class="offer-compact">${products
      .map(
        (p) => `<div class="offer-chip reveal">
          <span>${escapeHtml(String(p.name ?? 'Product'))}</span>
          <b>${escapeHtml(String(p.price ?? ''))}</b>
        </div>`
      )
      .join('')}</div>`
  } else {
    inner = `<div class="products">${products
      .map(
        (p) => `<article class="product reveal">
          <div class="product-media">${productMediaHtml(p, 'var(--surface)')}</div>
          <div class="product-body">
            <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
            <div class="price">${escapeHtml(String(p.price ?? ''))}</div>
            ${p.details ? `<p>${escapeHtml(truncate(String(p.details), 90))}</p>` : ''}
            <a class="product-enquire" href="${escapeHtml(telHref(b.phone))}" style="display:inline-block;margin-top:10px;font-size:.85rem;font-weight:600;color:var(--accent);text-decoration:none;">Enquire →</a>
          </div>
        </article>`
      )
      .join('')}</div>`
  }

  return `<section class="section" id="offerings"><div class="wrap">
    ${sectionHead('Products & services', title, 'Explore the most requested products and services.')}
    ${inner}
  </div></section>`
}

function quoteCards(b: BusinessData, count = 3): string {
  const quotes = [
    'Excellent service and a genuinely warm team. Everything was exactly as promised.',
    'Reliable, professional and easy to deal with. This is now part of our weekly routine.',
    'Quality you can feel and a team that actually listens. Highly recommended.'
  ].slice(0, count)
  return quotes
    .map(
      (text, i) =>
        `<blockquote class="quote reveal"><p>“${escapeHtml(text)}”</p><span>${i === 0 ? 'Verified customer' : i === 1 ? 'Regular visitor' : 'Local customer'} · ${escapeHtml(b.city)}</span></blockquote>`
    )
    .join('')
}

function reviewsHtml(skin: SkinStyle, b: BusinessData): string {
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const ratingBlock = `<div class="rating-big reveal">
    <b>${rating.toFixed(1)}</b>
    <div><div class="stars">${starsHtml(rating)}</div>
    <p style="color:var(--muted);font-size:.9rem;margin-top:6px;">Based on ${reviews} verified reviews</p></div>
  </div>`

  if (skin.reviews === 'wall') {
    return `<section class="section reviews" id="reviews"><div class="wrap">
      <div class="reviews-wall">
        ${ratingBlock}
        <div class="quote-grid">${quoteCards(b, 3)}</div>
      </div>
    </div></section>`
  }
  if (skin.reviews === 'big') {
    return `<section class="section reviews" id="reviews"><div class="wrap">
      <div class="reviews-big">
        ${ratingBlock}
        <div class="quote-grid">${quoteCards(b, 2)}</div>
      </div>
    </div></section>`
  }
  if (skin.reviews === 'ticker') {
    const track = `${quoteCards(b, 3)}${quoteCards(b, 3)}`
    return `<section class="section reviews" id="reviews"><div class="wrap">
      ${sectionHead('Reviews', 'What people say.', `Rated ${rating.toFixed(1)} out of 5 by ${reviews} customers.`)}
      <div class="reviews-ticker"><div class="ticker-track">${track}</div></div>
    </div></section>`
  }
  return `<section class="section reviews" id="reviews"><div class="wrap">
    ${ratingBlock}
    <div class="quote-grid">${quoteCards(b, 2)}</div>
  </div></section>`
}

function visitHtml(skin: SkinStyle, b: BusinessData, hours: HourEntry[], primary: SiteLink, links: SiteLink[]): string {
  const contactRows = [
    `<div class="contact-row"><span>Phone</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone)}</a></div>`,
    b.email ? `<div class="contact-row"><span>Email</span><a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></div>` : '',
    b.whatsapp ? `<div class="contact-row"><span>WhatsApp</span><a href="${escapeHtml(waHref(b.whatsapp))}" target="_blank" rel="noopener noreferrer">${escapeHtml(b.whatsapp)}</a></div>` : '',
    `<div class="contact-row"><span>Address</span><span style="text-align:right;max-width:60%;color:var(--ink);">${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</span></div>`
  ]
    .filter(Boolean)
    .join('')

  const hoursHtml = hours.length
    ? `<div class="hours">${hours.map((h) => `<div><span>${escapeHtml(h.day)}</span><b>${escapeHtml(h.value)}</b></div>`).join('')}</div>`
    : `<p style="color:var(--muted);font-size:.9rem;">Call us for current opening hours.</p>`

  const extra = links.length
    ? `<div class="visit-links">${links.map((l) => siteLinkHtml(l)).join('')}</div>`
    : ''

  const actions = `<div class="hero-actions" style="margin-top:22px;">
    <a class="btn btn-primary" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)} →</a>
    <a class="btn btn-ghost" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Get directions</a>
  </div>`

  if (skin.visit === 'card') {
    return `<section class="section" id="visit"><div class="wrap">
      <div class="visit-card reveal">
        <div class="visit-card-head">
          <div><p class="eyebrow">Visit</p><h2>Come by for a while.</h2>
          <p class="about-p">${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</p></div>
          ${actions}
        </div>
        <div class="visit-card-grid">
          <div class="contact-list">${contactRows}</div>
          <div>${hoursHtml}${extra}</div>
        </div>
      </div>
    </div></section>`
  }
  if (skin.visit === 'strip') {
    return `<section class="visit-strip" id="visit"><div class="wrap visit-strip-grid reveal">
      <div class="visit-strip-cell"><span>Address</span><b>${escapeHtml(b.address)}</b><p>${escapeHtml(b.city)}, ${escapeHtml(b.state)}</p></div>
      <div class="visit-strip-cell"><span>Phone</span><b><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone)}</a></b><p>${b.email ? escapeHtml(b.email) : 'Call for enquiries'}</p></div>
      <div class="visit-strip-cell"><span>Hours</span><b>${hours.length ? escapeHtml(hours[0].value) : 'Call us'}</b><p>${hours.length ? escapeHtml(hours[0].day) + ' onwards' : 'Open this week'}</p></div>
      <div class="visit-strip-actions">
        <a class="btn btn-primary" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)} →</a>
        <a class="btn btn-ghost" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Directions</a>
      </div>
    </div>${extra ? `<div class="wrap visit-strip-links">${extra}</div>` : ''}</section>`
  }
  return `<section class="section" id="visit"><div class="wrap">
    <div class="visit-grid">
      <div class="reveal">
        <p class="eyebrow">Visit</p>
        <h2 style="font-size:clamp(2rem,4vw,3.2rem);margin-top:10px;">Come by for a while.</h2>
        <p class="about-p">${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</p>
        ${actions}
        ${extra}
      </div>
      <div class="reveal">
        <div class="contact-list">${contactRows}</div>
        <div style="margin-top:22px;">${hoursHtml}</div>
      </div>
    </div>
  </div></section>`
}

function footerHtml(b: BusinessData, links: SiteLink[]): string {
  return `<footer><div class="wrap">
    <div>
      <div class="brand" style="color:inherit;"><span class="brand-mark">${escapeHtml(initials(b.name))}</span><span>${escapeHtml(b.name)}</span></div>
      <p style="max-width:38ch;opacity:.7;font-size:.9rem;margin-top:12px;">${escapeHtml(truncate(b.description || '', 120))}</p>
    </div>
    <div>
      <div class="foot-links">
        <a href="#top" data-page="home">Home</a><a href="#offerings" data-page="products">Products &amp; services</a><a href="#about" data-page="about">About</a><a href="#visit" data-page="contact">Contact</a>
        ${links.map((l) => siteLinkHtml(l)).join('')}
      </div>
    </div>
    <div class="foot-bottom" style="width:100%;">
      <span>© <span data-year></span> ${escapeHtml(b.name)} · ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</span>
      <span>${escapeHtml(b.phone)}</span>
    </div>
  </div></footer>`
}

function skinCss(skin: SkinStyle): string {
  return `
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth}
  :root{--bg:${skin.bg};--surface:${skin.surface};--ink:${skin.ink};--muted:${skin.muted};--accent:${skin.accent};--line:${skin.line};--r:${skin.radius}px;--f-display:'${skin.display}',Georgia,serif;--f-body:'${skin.body}',system-ui,sans-serif;--dw:${skin.displayWeight ?? 500}}
  body{background:var(--bg);color:var(--ink);font-family:var(--f-body);line-height:1.68;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  img{display:block;max-width:100%}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(18px,4vw,40px)}
  section{scroll-margin-top:96px}
  h1,h2,h3{font-family:var(--f-display);font-weight:var(--dw);line-height:1.04;letter-spacing:-.02em;text-wrap:balance}
  .eyebrow{font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);font-weight:700}
  .reveal{opacity:0;transform:translateY(20px);transition:opacity .8s ease,transform .8s ease}
  .reveal.in{opacity:1;transform:none}

  .announce{background:var(--ink);color:var(--bg);font-size:9px;letter-spacing:.2em;text-transform:uppercase}
  .announce .wrap{display:flex;justify-content:space-between;gap:14px;padding-top:9px;padding-bottom:9px;flex-wrap:wrap;opacity:.92}
  .announce b{color:var(--accent)}

  .topbar{position:sticky;top:0;z-index:60;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line);transition:box-shadow .3s}
  .topbar.scrolled{box-shadow:0 12px 32px rgba(0,0,0,.08)}
  .nav{position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;min-height:74px;height:74px}
  .brand{display:flex;align-items:center;gap:10px;font-family:var(--f-display);font-size:1.12rem;font-weight:600;letter-spacing:.01em}
  .brand-mark{width:38px;height:38px;border-radius:calc(var(--r)*.5);background:var(--accent);color:var(--bg);display:grid;place-items:center;font-family:var(--f-body);font-size:.78rem;font-weight:800;letter-spacing:.06em;flex-shrink:0}
  .navlinks{display:flex;align-items:center;gap:clamp(12px,2vw,26px);font-size:12px;letter-spacing:.05em}
  .navlinks a{opacity:.72;font-weight:500;transition:opacity .2s,color .2s}
  .navlinks a:hover{opacity:1;color:var(--accent)}
  .navlinks .nav-cta{background:var(--accent);color:var(--bg);padding:10px 18px;border-radius:999px;font-weight:700;opacity:1}
  .navlinks .nav-cta:hover{color:var(--bg);filter:brightness(1.06)}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:8px}
  .burger span{width:22px;height:2px;background:var(--ink);display:block;transition:.25s}

  .topbar--pill{background:transparent;border-bottom:0;backdrop-filter:none}
  .topbar--pill .nav{margin-top:14px;background:color-mix(in srgb,var(--surface) 94%,transparent);border:1px solid var(--line);border-radius:999px;padding:0 clamp(14px,2.4vw,26px);min-height:62px;height:62px;box-shadow:0 18px 46px rgba(0,0,0,.09)}
  .topbar--pill .brand-mark{border-radius:999px}

  .topbar--decks .nav{flex-direction:column;justify-content:center;height:auto;min-height:0;padding-top:16px;gap:0}
  .topbar--decks .brand{font-size:1.28rem;margin-bottom:12px}
  .topbar--decks .navlinks{width:100%;justify-content:center;border-top:1px solid var(--line);padding:10px 0 12px;flex-wrap:wrap}

  .topbar--modern .navlinks{gap:18px}

  .hero{position:relative}
  .hero-copy h1{font-size:clamp(2.7rem,6.4vw,5.3rem);max-width:16ch}
  .hero-tag{margin-top:18px;color:var(--muted);max-width:54ch;font-size:clamp(.98rem,1.5vw,1.08rem)}
  .hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.04em;border:1px solid transparent;transition:transform .25s,box-shadow .25s,background .25s;cursor:pointer}
  .btn-primary{background:var(--accent);color:var(--bg);box-shadow:0 14px 34px color-mix(in srgb,var(--accent) 28%,transparent)}
  .btn-primary:hover{transform:translateY(-2px)}
  .btn-ghost{border-color:color-mix(in srgb,var(--ink) 26%,transparent);color:var(--ink)}
  .btn-ghost:hover{background:var(--surface)}
  .hero-meta{display:flex;flex-wrap:wrap;gap:clamp(16px,3vw,34px);margin-top:34px;padding-top:20px;border-top:1px solid var(--line)}
  .hero-meta b{font-family:var(--f-display);font-size:1.4rem;font-weight:600;display:block}
  .hero-meta span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:3px}
  .hero-grid{display:grid;grid-template-columns:1.02fr .98fr;gap:clamp(24px,4.5vw,58px);align-items:center}
  .hero-split,.hero-reversed{padding:clamp(34px,5vw,66px) 0}
  .hero-media{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:4/4.5;box-shadow:0 30px 80px rgba(0,0,0,.16);background:var(--surface)}
  .hero-media img{width:100%;height:100%;object-fit:cover;animation:kb 24s ease-in-out infinite alternate}
  .hero-badge{position:absolute;left:14px;bottom:14px;background:rgba(0,0,0,.55);color:#fff;font-size:9px;letter-spacing:.2em;text-transform:uppercase;padding:9px 12px;border-radius:999px;backdrop-filter:blur(6px)}
  .hero-full{min-height:88svh;display:flex;align-items:flex-end;padding:130px 0 58px;color:#fff;overflow:hidden}
  .hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:kb 28s ease-in-out infinite alternate}
  .hero-fallback{display:block;background:linear-gradient(135deg,var(--accent),#111)}
  .hero-fallback > div{height:100%}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.26),rgba(0,0,0,.06) 42%,rgba(0,0,0,.74))}
  .hero-full .wrap{position:relative;z-index:2}
  .hero-full h1{color:#fff}
  .hero-full .hero-tag{color:rgba(255,255,255,.84)}
  .hero-full .hero-meta{border-color:rgba(255,255,255,.24)}
  .hero-full .hero-meta span{color:rgba(255,255,255,.68)}
  .hero-full .hero-meta b{color:#fff}
  .hero-full .btn-ghost{border-color:rgba(255,255,255,.5);color:#fff}
  .hero-full .btn-ghost:hover{background:rgba(255,255,255,.12)}
  .hero-scroll{position:absolute;right:28px;bottom:26px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.7);z-index:3}
  .hero-framed{padding:clamp(26px,4vw,50px) 0 0}
  .hero-frame{border:1px solid var(--line);padding:clamp(8px,1.2vw,16px);border-radius:calc(var(--r)*.5);background:var(--surface)}
  .hero-frame img,.hero-frame > div{width:100%;height:clamp(280px,50vw,520px);object-fit:cover;border-radius:calc(var(--r)*.35)}
  .hero-framed .hero-copy{max-width:860px;margin:-64px auto 0;position:relative;background:var(--bg);padding:0 clamp(12px,3vw,34px) 8px;text-align:center}
  .hero-framed .hero-tag{margin-left:auto;margin-right:auto}
  .hero-framed .hero-actions{justify-content:center}
  .hero-framed .hero-meta{justify-content:center}
  .hero-stacked{padding:clamp(48px,7vw,92px) 0 0;text-align:center}
  .hero-stacked h1{margin:0 auto;max-width:18ch}
  .hero-stacked .hero-tag{margin-left:auto;margin-right:auto}
  .hero-stacked .hero-actions{justify-content:center}
  .hero-stacked .hero-meta{justify-content:center}
  .hero-wide{margin-top:clamp(28px,4vw,48px);border-radius:var(--r) var(--r) 0 0;overflow:hidden;height:clamp(300px,50vw,540px);box-shadow:0 -12px 60px rgba(0,0,0,.12);background:var(--surface)}
  .hero-wide img{width:100%;height:100%;object-fit:cover;animation:kb 26s ease-in-out infinite alternate}
  .hero-diagonal{padding:clamp(34px,5vw,62px) 0;overflow:hidden}
  .hero-diag{position:relative;height:clamp(320px,44vw,560px);clip-path:polygon(9% 0,100% 0,100% 100%,0 100%);border-radius:calc(var(--r)*.5);overflow:hidden;background:var(--surface)}
  .hero-diag img{width:100%;height:100%;object-fit:cover;animation:kb 26s ease-in-out infinite alternate}
  .hero-diagonal .hero-copy{padding-right:clamp(0px,2vw,24px)}
  .hero-reversed .hero-media{aspect-ratio:1/1.02;box-shadow:0 30px 80px rgba(0,0,0,.14)}
  .hero-reversed .hero-copy{order:2}
  @keyframes kb{from{transform:scale(1)}to{transform:scale(1.07)}}

  .hero-poster{padding:0}
  .poster-frame{position:relative;min-height:86svh;display:flex;align-items:flex-end;overflow:hidden;background:var(--ink)}
  .poster-frame > img,.poster-frame > .poster-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:kb 30s ease-in-out infinite alternate}
  .poster-veil{position:absolute;inset:0;background:linear-gradient(205deg,rgba(0,0,0,.08),rgba(0,0,0,.28) 45%,rgba(0,0,0,.8));z-index:1}
  .poster-inner{position:relative;z-index:2;width:100%;padding-bottom:clamp(34px,6vw,74px);color:#fff}
  .hero-poster .hero-copy{max-width:960px}
  .hero-poster h1{color:#fff;font-size:clamp(3rem,8.6vw,7.2rem);line-height:.96;max-width:15ch}
  .hero-poster .hero-tag{color:rgba(255,255,255,.84);max-width:52ch}
  .hero-poster .eyebrow{color:rgba(255,255,255,.75)}
  .hero-poster .hero-meta{border-color:rgba(255,255,255,.28)}
  .hero-poster .hero-meta span{color:rgba(255,255,255,.66)}
  .hero-poster .hero-meta b{color:#fff}
  .hero-poster .btn-primary{background:var(--accent);color:var(--bg)}
  .hero-poster .btn-ghost{border-color:rgba(255,255,255,.55);color:#fff}
  .hero-poster .btn-ghost:hover{background:rgba(255,255,255,.14)}
  .poster-strip{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .poster-strip .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-top:15px;padding-bottom:15px;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
  .poster-strip b{color:var(--accent)}

  .hero-minimal{padding:clamp(46px,7vw,96px) 0 0}
  .hero-minimal .hero-copy{max-width:1020px}
  .hero-minimal h1{font-size:clamp(3rem,8.4vw,6.6rem);line-height:.94;max-width:20ch}
  .hero-minimal .hero-meta{margin-top:28px}
  .hero-band{position:relative;margin-top:clamp(28px,4vw,52px);height:clamp(300px,44vw,520px);overflow:hidden;background:var(--surface)}
  .hero-band img,.hero-band > div{width:100%;height:100%;object-fit:cover}
  .hero-band .hero-badge{z-index:2}

  .rail-band{padding:0 0 clamp(26px,4vw,46px)}
  .rail-label{display:flex;justify-content:space-between;align-items:center;margin:16px 0 6px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
  .rail-label b{color:var(--accent);font-weight:700}
  .hero-rail{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 10px;scrollbar-width:thin;scrollbar-color:var(--accent) transparent;cursor:grab}
  .hero-rail.dragging{cursor:grabbing}
  .hero-rail figure{flex:0 0 clamp(150px,21vw,230px);aspect-ratio:4/3;border-radius:calc(var(--r)*.5);overflow:hidden;scroll-snap-align:start;border:1px solid var(--line);background:var(--surface);margin:0}
  .hero-rail img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
  .hero-rail figure:hover img{transform:scale(1.06)}

  .section{padding:clamp(54px,8vw,94px) 0}
  .section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:clamp(24px,4vw,40px);flex-wrap:wrap}
  .section-head h2{font-size:clamp(2rem,4.2vw,3.3rem);margin-top:10px}
  .section-head p{color:var(--muted);max-width:42ch;font-size:.92rem}
  .about{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(24px,4.5vw,60px);align-items:start}
  .about h2{font-size:clamp(2rem,4vw,3.2rem);margin-top:10px}
  .about-p{color:var(--muted);margin-top:16px;font-size:.96rem}
  .facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .fact{background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--r)*.55);padding:18px 18px 16px}
  .fact b{font-family:var(--f-display);font-size:1.28rem;font-weight:600}
  .fact span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}

  .about-dropcap{max-width:850px;margin:0 auto;text-align:center}
  .about-dropcap h2{font-size:clamp(2.1rem,4.4vw,3.4rem);margin-top:10px}
  .about-dropcap .dropcap{margin-top:22px;text-align:left;color:var(--muted);font-size:1.02rem;line-height:1.78}
  .about-dropcap .dropcap::first-letter{float:left;font-family:var(--f-display);font-size:3.8rem;line-height:.78;padding:8px 14px 0 0;color:var(--accent)}
  .facts-row{grid-template-columns:repeat(4,minmax(0,1fr))}
  .facts-row .fact{background:none;border:0;border-top:1px solid var(--line);border-radius:0;padding:18px 0 0}

  .about-stats .stat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .stat-card{background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--r)*.55);padding:20px 20px 18px}
  .stat-card span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
  .stat-card b{font-family:var(--f-display);font-size:clamp(1.9rem,3.6vw,2.6rem);font-weight:var(--dw);line-height:1;display:block}
  .stat-card b.stat-text{font-size:clamp(1.3rem,2.6vw,1.7rem)}
  .stat-card small{display:block;font-size:10px;color:var(--muted);margin-top:6px}

  .about-centered{max-width:780px;margin:0 auto;text-align:center}
  .about-centered h2{font-size:clamp(2rem,4.4vw,3.4rem);margin-top:10px}
  .about-centered .facts{margin-top:34px;text-align:left}

  .about-pull{align-items:center}
  .about-pull blockquote{font-family:var(--f-display);font-size:clamp(1.7rem,3.8vw,2.9rem);line-height:1.18;margin:18px 0 0;border-left:3px solid var(--accent);padding-left:clamp(16px,2.4vw,26px)}
  .about-pull .about-p{font-size:.85rem;letter-spacing:.08em;text-transform:uppercase}

  .gallery{display:grid;gap:12px}
  .gallery figure{margin:0;overflow:hidden;background:var(--surface);border-radius:calc(var(--r)*.45)}
  .gallery img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
  .gallery figure:hover img{transform:scale(1.05)}
  .gallery.grid{grid-template-columns:repeat(4,minmax(0,1fr))}
  .gallery.grid figure{aspect-ratio:1}
  .gallery.grid figure:first-child{grid-column:span 2;grid-row:span 2;aspect-ratio:auto;min-height:280px}
  .gallery.masonry{display:block;columns:3;column-gap:12px}
  .gallery.masonry figure{break-inside:avoid;margin:0 0 12px}
  .gallery.masonry img{aspect-ratio:4/5}
  .gallery.masonry figure:nth-child(3n+2) img{aspect-ratio:1}
  .gallery.masonry figure:nth-child(3n) img{aspect-ratio:4/3}
  .gallery.rail{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding-bottom:10px;cursor:grab}
  .gallery.rail figure{flex:0 0 clamp(220px,30vw,340px);aspect-ratio:4/3;scroll-snap-align:start}
  .gallery.mosaic{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:clamp(120px,14vw,180px)}
  .gallery.mosaic figure{height:100%}
  .gallery.mosaic figure:nth-child(1){grid-column:span 2;grid-row:span 2}
  .gallery.mosaic figure:nth-child(4){grid-row:span 2}
  .gallery.mosaic figure:nth-child(6){grid-column:span 2}
  .gallery.pairs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gallery.pairs figure{aspect-ratio:16/10}
  .gallery.strip{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding-bottom:12px;cursor:grab}
  .gallery.strip figure{flex:0 0 clamp(240px,32vw,380px);aspect-ratio:4/3;scroll-snap-align:start}

  .products{display:grid;grid-template-columns:repeat(auto-fill,minmax(218px,1fr));gap:16px}
  .product{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column;transition:transform .3s,box-shadow .3s}
  .product:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(0,0,0,.1)}
  .product-media{aspect-ratio:4/3;overflow:hidden}
  .product-body{padding:16px 18px 18px}
  .product h3{font-size:1.12rem}
  .price{color:var(--accent);font-weight:700;font-size:.9rem;margin-top:5px}
  .product p{font-size:.78rem;color:var(--muted);margin-top:4px}

  .menu-list{border-top:1px solid var(--line)}
  .menu-row{display:flex;align-items:center;gap:18px;padding:18px 0;border-bottom:1px solid var(--line)}
  .menu-thumb{width:64px;height:64px;flex-shrink:0;border-radius:calc(var(--r)*.4);overflow:hidden;background:var(--surface)}
  .menu-text{flex:1;min-width:0}
  .menu-text h3{display:flex;align-items:baseline;gap:10px;font-size:1.05rem}
  .menu-dots{flex:1;border-bottom:1px dotted color-mix(in srgb,var(--muted) 55%,transparent);transform:translateY(-4px)}
  .menu-price{color:var(--accent);font-weight:700;white-space:nowrap;font-family:var(--f-body);font-size:.92rem}
  .menu-text p{font-size:.8rem;color:var(--muted);margin-top:4px}

  .offer-rows{display:grid;gap:18px}
  .offer-row{display:grid;grid-template-columns:.85fr 1.15fr;gap:0;align-items:stretch;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
  .offer-row.flip{grid-template-columns:1.15fr .85fr}
  .offer-media{min-height:220px;overflow:hidden}
  .offer-row.flip .offer-media{order:2}
  .offer-body{padding:clamp(20px,3vw,32px);align-self:center}
  .offer-body h3{font-size:clamp(1.4rem,2.4vw,1.9rem)}
  .offer-body .price{font-size:1rem;margin-top:8px}
  .offer-body p{color:var(--muted);font-size:.86rem;margin-top:8px;max-width:46ch}

  .offer-compact{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .offer-chip{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:16px 18px;border:1px solid var(--line);background:var(--surface);border-radius:calc(var(--r)*.5)}
  .offer-chip span{font-family:var(--f-display);font-size:1.02rem;font-weight:var(--dw)}
  .offer-chip b{color:var(--accent);font-size:.88rem;white-space:nowrap}

  .reviews{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .rating-big{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
  .rating-big > b{font-family:var(--f-display);font-size:clamp(3rem,7vw,5rem);line-height:1;font-weight:600}
  .stars{letter-spacing:.16em;color:var(--accent);font-size:1.05rem}
  .stars .off{opacity:.28}
  .quote-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:30px}
  .quote{border:1px solid var(--line);border-radius:calc(var(--r)*.6);padding:24px;background:var(--bg);margin:0}
  .quote p{font-family:var(--f-display);font-size:1.05rem;line-height:1.55}
  .quote span{display:block;margin-top:14px;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}

  .reviews-wall{display:grid;grid-template-columns:.75fr 1.25fr;gap:clamp(20px,4vw,48px);align-items:start}
  .reviews-wall .quote-grid{margin-top:0}
  .reviews-big{display:grid;grid-template-columns:.7fr 1.3fr;gap:clamp(20px,4vw,48px);align-items:start}
  .reviews-big .rating-big{display:block}
  .reviews-big .rating-big > b{font-size:clamp(4rem,10vw,7rem);display:block;margin-bottom:8px}
  .reviews-big .quote-grid{margin-top:0}
  .reviews-ticker{overflow:hidden;margin-top:10px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .ticker-track{display:flex;gap:16px;padding:18px 0;width:max-content;animation:ticker 40s linear infinite}
  .ticker-track .quote{width:min(360px,78vw);flex-shrink:0}
  @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  .visit-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4.5vw,60px)}
  .visit-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
  .visit-links a{border:1px solid var(--line);border-radius:999px;padding:8px 14px;font-size:11px;font-weight:600;color:var(--ink);transition:border-color .2s,color .2s}
  .visit-links a:hover{border-color:var(--accent);color:var(--accent)}
  .contact-list{border-top:1px solid var(--line)}
  .contact-row{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--line);font-size:.9rem}
  .contact-row span:first-child{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);padding-top:3px;flex-shrink:0}
  .contact-row a:hover{color:var(--accent)}
  .hours{display:grid;gap:6px;font-size:.85rem}
  .hours div{display:flex;justify-content:space-between;color:var(--muted);gap:16px}
  .hours b{color:var(--ink);font-weight:600;text-align:right}

  .visit-card{max-width:960px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:calc(var(--r)*.8);padding:clamp(22px,4vw,46px)}
  .visit-card-head{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:flex-start}
  .visit-card-head h2{font-size:clamp(2rem,4vw,3rem);margin-top:8px}
  .visit-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,46px);margin-top:clamp(22px,3.4vw,36px);border-top:1px solid var(--line);padding-top:clamp(20px,3vw,30px)}
  .visit-strip{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:clamp(26px,4vw,42px) 0}
  .visit-strip-grid{display:grid;grid-template-columns:1.15fr 1fr .8fr auto;gap:clamp(18px,3vw,34px);align-items:center}
  .visit-strip-cell span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
  .visit-strip-cell b{font-family:var(--f-display);font-size:1.05rem;font-weight:600;display:block}
  .visit-strip-cell p{font-size:.8rem;color:var(--muted);margin-top:2px}
  .visit-strip-actions{display:flex;gap:10px;flex-wrap:wrap}
  .visit-strip-links{padding-top:16px}

  footer{background:var(--ink);color:var(--bg);padding:46px 0 26px}
  footer .wrap{display:flex;flex-wrap:wrap;gap:26px;justify-content:space-between;align-items:flex-start}
  footer .brand-mark{background:var(--accent);color:var(--ink)}
  footer a{opacity:.7;transition:opacity .2s}
  footer a:hover{opacity:1}
  .foot-links{display:flex;flex-wrap:wrap;gap:18px;font-size:12px}
  .foot-bottom{display:flex;justify-content:space-between;gap:12px;border-top:1px solid rgba(128,128,128,.3);margin-top:26px;padding-top:18px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.6}

  ${skin.uppercase ? `.hero h1,.hero-poster h1,.hero-minimal h1{text-transform:uppercase;letter-spacing:-.01em}
  .eyebrow,.section-head h2,.about h2{text-transform:uppercase}` : ''}

  @media(max-width:900px){
    .hero-grid,.about,.visit-grid,.visit-card-grid,.reviews-wall,.reviews-big,.offer-row,.offer-row.flip{grid-template-columns:1fr}
    .hero-media{aspect-ratio:4/3;margin-top:8px}
    .hero-reversed .hero-media{order:0}
    .hero-framed .hero-copy{margin-top:-40px}
    .hero-diag{height:340px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%);margin-top:24px}
    .facts{grid-template-columns:repeat(2,1fr)}
    .facts-row{grid-template-columns:repeat(2,1fr)}
    .gallery.grid{grid-template-columns:repeat(2,1fr)}
    .gallery.masonry{columns:2}
    .gallery.mosaic{grid-template-columns:repeat(2,1fr);grid-auto-rows:150px}
    .offer-row.flip .offer-media{order:0}
    .visit-strip-grid{grid-template-columns:1fr 1fr}
    .visit-card-head{flex-direction:column}
  }
  @media(max-width:860px){
    .burger{display:flex}
    .navlinks{position:absolute;top:100%;left:0;right:0;background:var(--bg);border-bottom:1px solid var(--line);flex-direction:column;align-items:stretch;padding:18px 24px 24px;gap:14px;display:none;box-shadow:0 20px 40px rgba(0,0,0,.14);z-index:70}
    .navlinks.open{display:flex}
    .navlinks .nav-cta{text-align:center;justify-content:center;display:flex}
    .topbar--decks .nav{padding-top:14px}
    .topbar--decks .brand{margin-bottom:10px}
    .topbar--decks .navlinks{top:100%;left:0;right:0;padding:18px 24px 24px}
    .topbar--pill .nav{height:auto;min-height:58px;padding:6px 14px}
    .topbar--pill .navlinks{top:calc(100% + 4px);border-radius:18px;border:1px solid var(--line);overflow:hidden}
    .hero-full{min-height:78svh;padding:110px 0 46px}
    .hero-scroll{display:none}
    .hero-poster h1{font-size:clamp(2.7rem,11vw,4.6rem)}
    .poster-frame{min-height:78svh}
    .about-pull blockquote{font-size:1.6rem}
    .gallery.rail figure,.gallery.strip figure{flex-basis:250px}
  }
  @media(max-width:560px){
    .gallery.grid{grid-template-columns:1fr 1fr}
    .gallery.grid figure:first-child{grid-column:span 2;grid-row:auto;min-height:220px;aspect-ratio:4/3}
    .gallery.masonry{columns:1}
    .gallery.mosaic{grid-template-columns:1fr 1fr;grid-auto-rows:130px}
    .gallery.mosaic figure:nth-child(1){grid-column:span 2;grid-row:span 2}
    .products{grid-template-columns:1fr 1fr}
    .offer-compact{grid-template-columns:1fr}
    .hero-meta{gap:18px}
    .hero-meta b{font-size:1.15rem}
    .hero-poster h1{font-size:2.6rem}
    .foot-bottom{flex-direction:column;gap:6px}
    .menu-thumb{width:52px;height:52px}
    .visit-strip-grid{grid-template-columns:1fr}
    .about-stats .stat-grid{grid-template-columns:1fr 1fr}
  }
  `
}

const RAIL_SCRIPT = `<script>(function(){
  document.querySelectorAll('.hero-rail,.gallery.rail,.gallery.strip').forEach(function(rail){
    var down=false,startX=0,startLeft=0;
    rail.addEventListener('pointerdown',function(e){down=true;startX=e.clientX;startLeft=rail.scrollLeft;rail.classList.add('dragging');});
    rail.addEventListener('pointermove',function(e){if(!down)return;rail.scrollLeft=startLeft-(e.clientX-startX);});
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

// Store-type → product presentation style. Keeps the curated skin look but
// makes the Products & services section read like the business's actual trade
// (menu for food, rows for services, cards for retail/catalogue).
const OFFERINGS_BY_CATEGORY: Record<string, 'cards' | 'menu' | 'rows' | 'compact'> = {
  'Grocery & Essentials': 'cards',
  Restaurants: 'menu',
  'Food & Sweets': 'menu',
  'Food & Beverages': 'menu',
  'Textiles & Apparel': 'cards',
  'Handicrafts & Art': 'cards',
  Electronics: 'cards',
  Automobile: 'cards',
  'Beauty & Personal Care': 'cards',
  'Real Estate': 'rows',
  'Home Services': 'rows',
  Doctors: 'rows',
  'Repair Services': 'rows',
  'Wedding Planning': 'rows',
  Education: 'rows',
  'Travel Booking': 'rows',
  'B2B Suppliers': 'rows',
  'Health & Wellness': 'cards',
  Other: 'cards'
}

export function generateCollectionTemplate(
  templateId: string,
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const baseSkin = SKINS[templateId] || SKINS['blush-atelier']
  const skin = { ...baseSkin, offerings: 'cards' as const }
  const primary = primaryCta(b)
  const secondary = secondaryCta(b)
  const links = customLinks(b)

  const sections: Record<SectionKey, string> = {
    about: aboutHtml(skin, b),
    gallery: galleryHtml(skin, b, images),
    offerings: productsHtml(skin, b, products),
    reviews: reviewsHtml(skin, b),
    visit: visitHtml(skin, b, hours, primary, links)
  }
  const body = `${navHtml(skin, b, primary, products)}
  ${heroHtml(skin, b, images, primary, secondary)}
  ${railHtml(images, b)}
  ${skin.order.map((key) => sections[key]).join('')}
  ${footerHtml(b, links)}
  ${UI_SCRIPT}${RAIL_SCRIPT}`

  return `${documentHead(b.name, skin.google, skinCss(skin))}${body}</body></html>`
}

export { SKINS as COLLECTION_STYLES }
