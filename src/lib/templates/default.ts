// default — shared generator for the four foundation templates
// (retail, restaurant, service, premium). Each one gets its own palette,
// typography, navigation, hero composition, gallery and product layout so
// they never look like recolours of the same page.

import {
  BusinessData,
  TemplateProduct,
  HourEntry,
  GRAIN_OVERLAY,
  NAV_INTERCEPTOR_SCRIPT,
  UI_SCRIPT,
  anchorAttrs,
  customLinks,
  documentHead,
  escapeHtml,
  heroImage,
  heroRailHtml,
  HERO_RAIL_SCRIPT,
  HERO_RAIL_STYLES,
  initials,
  listText,
  mapHref,
  paragraphs,
  primaryCta,
  productMediaHtml,
  ratingOf,
  readableOn,
  reviewCountOf,
  safeColor,
  secondaryCta,
  siteLinkHtml,
  starsHtml,
  telHref,
  truncate,
  waHref,
} from './shared'

type DefaultVariant = 'retail' | 'restaurant' | 'service' | 'premium'

interface DefaultTheme {
  fonts: string
  display: string
  body: string
  bg: string
  cream: string
  ink: string
  muted: string
  line: string
  footerBg: string
  footerText: string
  footerHead: string
  fallbackAccent: string
  hero: 'immersive' | 'menu' | 'split' | 'framed'
  navClass: string
  tagline: string
}

const DEFAULT_VARIANTS: Record<DefaultVariant, DefaultTheme> = {
  retail: {
    fonts: 'family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@300;400;500;600',
    display: "'Fraunces',serif",
    body: "'Inter',sans-serif",
    bg: '#fbf8f3',
    cream: '#ffffff',
    ink: '#161616',
    muted: '#6c665d',
    line: 'rgba(22,22,22,.12)',
    footerBg: '#161616',
    footerText: 'rgba(255,255,255,.6)',
    footerHead: '#ffffff',
    fallbackAccent: '#16a34a',
    hero: 'immersive',
    navClass: '',
    tagline: 'Considered service'
  },
  restaurant: {
    fonts: 'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600',
    display: "'Cormorant Garamond',serif",
    body: "'Jost',sans-serif",
    bg: '#12100d',
    cream: '#1c1814',
    ink: '#f5eddc',
    muted: '#b3a58f',
    line: 'rgba(245,237,220,.16)',
    footerBg: '#0b0a08',
    footerText: 'rgba(245,237,220,.55)',
    footerHead: '#f5eddc',
    fallbackAccent: '#e0a63c',
    hero: 'menu',
    navClass: 'topbar--center',
    tagline: 'Freshly made daily'
  },
  service: {
    fonts: 'family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600',
    display: "'Space Grotesk',sans-serif",
    body: "'Inter',sans-serif",
    bg: '#f2f7fd',
    cream: '#ffffff',
    ink: '#0d2340',
    muted: '#5c7089',
    line: 'rgba(13,35,64,.13)',
    footerBg: '#0d2340',
    footerText: 'rgba(255,255,255,.62)',
    footerHead: '#ffffff',
    fallbackAccent: '#0891b2',
    hero: 'split',
    navClass: 'topbar--onlight',
    tagline: 'Trusted local experts'
  },
  premium: {
    fonts: 'family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600&family=Jost:wght@300;400;500;600',
    display: "'Bodoni Moda',serif",
    body: "'Jost',sans-serif",
    bg: '#f7f2ea',
    cream: '#fffdf8',
    ink: '#17130e',
    muted: '#7a6f60',
    line: 'rgba(23,19,14,.15)',
    footerBg: '#17130e',
    footerText: 'rgba(255,253,248,.6)',
    footerHead: '#fffdf8',
    fallbackAccent: '#b08a4a',
    hero: 'framed',
    navClass: 'topbar--lux',
    tagline: 'Crafted with care'
  }
}

function variantOf(template: string): DefaultVariant {
  return template === 'restaurant' || template === 'service' || template === 'premium' ? template : 'retail'
}

export function generateDefault(
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const variant = variantOf(b.template)
  const v = DEFAULT_VARIANTS[variant]
  const name = escapeHtml(b.name || 'Your Business')
  const category = escapeHtml(b.category || 'Business')
  const city = escapeHtml(b.city || '')
  const state = escapeHtml(b.state || '')
  const description = String(b.description || '')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const hero = heroImage(b, images)
  const accent = safeColor(b.themeColor, v.fallbackAccent)
  const onAccent = readableOn(accent)
  const primary = primaryCta(b, 'Call')
  const secondary = secondaryCta(b, 'Take a look', '#gallery')
  const links = customLinks(b)
  const showRows = false

  const menuLabel = 'Products & services'
  const navPhone = variant === 'service' && b.phone
    ? `<a class="nav-phone" href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone)}</a>`
    : ''

  const aboutTitle =
    variant === 'restaurant' ? 'Our <em>table</em>.' :
    variant === 'service' ? 'Built on <em>trust</em>.' :
    variant === 'premium' ? `The house of <em>${name}</em>.` :
    `Welcome to <em>${name}</em>.`
  const galleryTitle =
    variant === 'restaurant' ? 'Plates &amp; <em>places</em>.' :
    variant === 'service' ? 'The work, <em>documented</em>.' :
    variant === 'premium' ? 'A study in <em>detail</em>.' :
    'A look <em>inside</em>.'
  const productsTitle =
    variant === 'restaurant' ? 'From the <em>kitchen</em>.' :
    variant === 'service' ? 'What we <em>do</em>.' :
    variant === 'premium' ? 'The <em>collection</em>.' :
    'A closer <em>look</em>.'
  const productsKicker = variant === 'service' ? '03 — Services' : variant === 'premium' ? '03 — Collection' : '03 — Products'
  const visitTitle =
    variant === 'restaurant' ? 'Join us at<br>the table.' :
    variant === 'service' ? 'Let&rsquo;s get<br>started.' :
    variant === 'premium' ? 'An invitation<br>to visit.' :
    'We would love<br>to see you.'

  const galleryTiles = (() => {
    const tiles: string[] = []
    const total = Math.max(4, Math.min(8, images.length || 4))
    for (let i = 0; i < total; i += 1) {
      const url = images[i] || ''
      tiles.push(`<figure class="tile reveal" style="transition-delay:${i * 45}ms">
        ${url ? `<img src="${escapeHtml(url)}" alt="${name} — photo ${i + 1}" loading="lazy">` : `<div class="tile-empty"><span>${i === 0 ? escapeHtml(initials(b.name)) : '◦'}</span></div>`}
        <figcaption><span>${String(i + 1).padStart(2, '0')}</span><span>${city || category}</span></figcaption>
      </figure>`)
    }
    return tiles.join('')
  })()

  const productCards = `<div class="product-grid">
      ${products.slice(0, 8).map((p, i) => `
      <article class="product reveal" style="transition-delay:${i * 45}ms">
        <div class="product-media">${productMediaHtml(p, 'var(--cream)')}</div>
        <div class="product-body">
          <div class="product-line"><h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>${p.price ? `<span class="price">${escapeHtml(String(p.price))}</span>` : ''}</div>
          ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
          <a href="${escapeHtml(telHref(b.phone))}" style="display:inline-block;margin-top:8px;font-size:.8rem;font-weight:600;color:var(--accent);text-decoration:none;">Enquire →</a>
        </div>
      </article>`).join('')}
    </div>`

  const productList = `<div class="price-list">
      ${products.slice(0, 8).map((p, i) => `
      <article class="price-row reveal" style="transition-delay:${i * 40}ms">
        ${variant === 'restaurant' ? `<div class="price-thumb">${productMediaHtml(p, 'var(--cream)')}</div>` : ''}
        <div class="price-row-text">
          <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
          ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
        </div>
        ${p.price ? `<span class="price">${escapeHtml(String(p.price))}</span>` : ''}
      </article>`).join('')}
    </div>`

  const productsHtml = `
  <section class="section products-${variant}" id="products">
    <div class="section-head reveal">
      <span class="kicker">${productsKicker}</span>
      <h2>${productsTitle}</h2>
    </div>
    ${productCards}
  </section>`

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `A ${category.toLowerCase()} in ${city}.`
  const rest = bodyParagraphs.slice(1)

  const hoursHtml = hours.length > 0
    ? `<ul class="hours">${hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>`
    : `<p class="muted">Call us for opening hours.</p>`

  const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:${v.bg};--cream:${v.cream};--ink:${v.ink};--muted:${v.muted};--line:${v.line};--accent:${accent};--on-accent:${onAccent};--footer-bg:${v.footerBg};--footer-text:${v.footerText};--footer-head:${v.footerHead};--font-display:${v.display};--font-body:${v.body}}
  html{scroll-behavior:smooth}
  body{font-family:var(--font-body);background:var(--bg);color:var(--ink);line-height:1.75;overflow-x:hidden;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  ::selection{background:var(--accent);color:var(--on-accent)}
  .reveal{opacity:0;transform:translateY(26px);transition:opacity .85s ease,transform .85s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;transition:background .35s,box-shadow .35s,border-color .35s;border-bottom:1px solid transparent}
  .topbar.scrolled{background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom-color:var(--line);box-shadow:0 12px 40px rgba(22,22,22,.07)}
  .topbar-inner{max-width:1240px;margin:0 auto;padding:16px 30px;display:flex;align-items:center;justify-content:space-between;gap:24px}
  .brand{display:flex;align-items:center;gap:11px;color:#fff}
  .topbar.scrolled .brand{color:var(--ink)}
  .brand-mark{width:36px;height:36px;border-radius:10px;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:.86rem;letter-spacing:.02em}
  .brand-name{font-family:var(--font-display);font-size:1.16rem;letter-spacing:-.01em}
  .navlinks{display:flex;align-items:center;gap:26px}
  .navlinks a{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.84);transition:color .25s;position:relative}
  .topbar.scrolled .navlinks a{color:var(--muted)}
  .navlinks a:not(.nav-cta):not(.nav-phone)::after{content:'';position:absolute;left:0;right:100%;bottom:-6px;height:1px;background:currentColor;transition:right .3s}
  .navlinks a:hover::after{right:0}
  .navlinks a:hover{color:#fff}
  .topbar.scrolled .navlinks a:hover{color:var(--accent)}
  .nav-phone{display:none}
  .nav-cta{background:var(--accent);color:var(--on-accent)!important;padding:10px 20px;border-radius:999px;font-weight:600}
  .nav-cta:hover{transform:translateY(-1px)}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:22px;height:2px;background:#fff;transition:transform .3s}
  .topbar.scrolled .burger span{background:var(--ink)}
  .topbar--onlight:not(.scrolled) .brand{color:var(--ink)}
  .topbar--onlight:not(.scrolled) .navlinks a{color:var(--muted)}
  .topbar--onlight .burger span{background:var(--ink)}
  .hero{position:relative;min-height:92svh;display:flex;align-items:flex-end;padding:150px 30px 48px;overflow:hidden;color:#fff}
  .hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.74) saturate(.9);animation:breathe 20s ease-in-out infinite alternate}
  @keyframes breathe{from{transform:scale(1.02)}to{transform:scale(1.08)}}
  .hero-fallback{position:absolute;inset:0;background:linear-gradient(140deg,var(--accent),var(--footer-bg))}
  .hero-fallback span{position:absolute;right:5%;top:15%;font-family:var(--font-display);font-size:clamp(10rem,26vw,24rem);line-height:.8;color:rgba(255,255,255,.1)}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,12,12,.42),rgba(12,12,12,.05) 42%,rgba(12,12,12,.78))}
  .hero-inner{position:relative;z-index:2;max-width:1240px;width:100%;margin:0 auto}
  .eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:7px 14px;margin-bottom:22px;backdrop-filter:blur(6px);background:rgba(0,0,0,.18)}
  .eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent)}
  .hero h1{font-family:var(--font-display);font-weight:400;font-size:clamp(3rem,8.4vw,6.8rem);line-height:.94;letter-spacing:-.03em;max-width:15ch;text-wrap:balance}
  .hero-tag{font-size:clamp(1rem,1.8vw,1.16rem);color:rgba(255,255,255,.82);max-width:52ch;margin-top:20px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
  .btn{display:inline-flex;align-items:center;gap:9px;padding:14px 28px;border-radius:999px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;transition:transform .25s,background .25s,color .25s,border-color .25s}
  .btn:hover{transform:translateY(-2px)}
  .btn-solid{background:var(--accent);color:var(--on-accent)}
  .btn-ghost{border:1px solid rgba(255,255,255,.55);color:#fff}
  .btn-ghost:hover{background:rgba(255,255,255,.12)}
  .hero-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.22);border-radius:14px;overflow:hidden;max-width:760px;margin-top:40px;backdrop-filter:blur(10px)}
  .hero-meta div{background:rgba(15,15,15,.35);padding:16px 20px}
  .hero-meta span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.62);margin-bottom:4px}
  .hero-meta strong{font-family:var(--font-display);font-weight:500;font-size:1.35rem;line-height:1}
  .marquee{overflow:hidden;white-space:nowrap;background:var(--accent);color:var(--on-accent)}
  .marquee-premium{background:var(--ink);color:var(--bg)}
  .marquee-track{display:inline-flex;animation:marquee 30s linear infinite;padding:13px 0}
  .marquee-track span{font-family:var(--font-display);font-style:italic;font-size:clamp(1.1rem,2.2vw,1.5rem);padding:0 24px}
  .marquee-track span::after{content:'✦';font-style:normal;font-size:.6em;margin-left:24px;vertical-align:middle}
  @keyframes marquee{to{transform:translateX(-50%)}}
  .section{max-width:1240px;margin:0 auto;padding:100px 30px;scroll-margin-top:82px}
  .section-head{margin-bottom:44px;max-width:780px}
  .kicker{display:inline-flex;align-items:center;gap:11px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
  .kicker::before{content:'';width:30px;height:1px;background:currentColor}
  .section-head h2{font-family:var(--font-display);font-weight:400;font-size:clamp(2.2rem,4.8vw,3.7rem);line-height:1.04;letter-spacing:-.02em}
  .section-head h2 em{font-style:italic;color:var(--accent)}
  .about-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:56px;align-items:start}
  .about-copy{font-size:1.01rem;color:var(--muted);max-width:60ch}
  .about-copy p{margin-bottom:1.2rem}
  .dropcap::first-letter{font-family:var(--font-display);font-size:4.4rem;line-height:.8;float:left;padding:9px 12px 0 0;color:var(--accent)}
  .pullquote{font-family:var(--font-display);font-style:italic;font-size:clamp(1.35rem,2.4vw,1.75rem);line-height:1.4;border-left:2px solid var(--accent);padding:4px 0 4px 22px;margin:30px 0;color:var(--ink)}
  .about-cards{display:grid;gap:12px;position:sticky;top:110px}
  .about-card{background:var(--cream);border:1px solid var(--line);border-radius:14px;padding:20px 22px}
  .about-card span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
  .about-card strong{font-family:var(--font-display);font-weight:500;font-size:1.3rem;line-height:1}
  .about-card strong em{font-style:normal;font-size:.5em;color:var(--muted);letter-spacing:0;margin-left:3px}
  .gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .tile{position:relative;overflow:hidden;border-radius:14px;min-height:210px;background:var(--line)}
  .tile:nth-child(1){grid-column:span 2;grid-row:span 2;min-height:432px}
  .tile:nth-child(4){grid-column:span 2}
  .tile img{width:100%;height:100%;object-fit:cover;transition:transform 1s cubic-bezier(.2,.7,.2,1),filter .5s}
  .tile:hover img{transform:scale(1.06)}
  .tile figcaption{position:absolute;inset:auto 0 0 0;padding:14px 16px;display:flex;justify-content:space-between;gap:10px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#fff;background:linear-gradient(transparent,rgba(10,10,10,.65));opacity:0;transition:.3s;transform:translateY(6px)}
  .tile:hover figcaption{opacity:1;transform:none}
  .tile-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--cream),var(--line))}
  .tile-empty span{font-family:var(--font-display);font-size:2.2rem;color:var(--accent);opacity:.5}
  .product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}
  .product{background:var(--cream);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:transform .4s cubic-bezier(.2,.7,.2,1),box-shadow .4s}
  .product:hover{transform:translateY(-6px);box-shadow:0 26px 60px -34px rgba(22,22,22,.4)}
  .product-media{aspect-ratio:4/5;overflow:hidden;background:var(--line)}
  .product-media img{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
  .product:hover .product-media img{transform:scale(1.05)}
  .product-body{padding:17px 19px 21px}
  .product-line{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
  .product h3{font-family:var(--font-display);font-size:1.1rem;font-weight:500;line-height:1.25}
  .price{font-size:.8rem;letter-spacing:.05em;color:var(--accent);white-space:nowrap;font-weight:600}
  .product p{font-size:.8rem;color:var(--muted);margin-top:7px;line-height:1.55}
  .price-list{max-width:860px;margin:0 auto}
  .price-row{display:flex;align-items:center;gap:18px;padding:20px 4px;border-bottom:1px solid var(--line)}
  .price-row:first-child{border-top:1px solid var(--line)}
  .price-row-text{flex:1;min-width:0}
  .price-row h3{font-family:var(--font-display);font-weight:500;font-size:1.3rem;line-height:1.2}
  .price-row p{font-size:.85rem;color:var(--muted);margin-top:5px;line-height:1.55}
  .price-thumb{width:62px;height:62px;flex:0 0 62px;border-radius:50%;overflow:hidden;background:var(--line)}
  .reviews{background:var(--cream);border-block:1px solid var(--line);scroll-margin-top:82px}
  .reviews-inner{max-width:1240px;margin:0 auto;padding:92px 30px;display:grid;grid-template-columns:minmax(0,.7fr) minmax(0,1.3fr);gap:48px;align-items:start}
  .score .stars{color:var(--accent);letter-spacing:.12em;font-size:1.1rem}
  .score .stars .off{opacity:.22}
  .score strong{display:block;font-family:var(--font-display);font-weight:400;font-size:clamp(3rem,6vw,4.6rem);line-height:.9;margin:12px 0 4px}
  .score strong small{font-size:.28em;color:var(--muted)}
  .score span{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
  .quote-grid{display:grid;gap:12px}
  .quote{border:1px solid var(--line);border-radius:14px;padding:24px 26px;background:var(--bg)}
  .quote p{font-family:var(--font-display);font-style:italic;font-size:1.08rem;line-height:1.55;color:var(--ink)}
  .quote span{display:block;margin-top:14px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
  .contact-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:40px;align-items:start}
  .contact-grid h2{font-family:var(--font-display);font-weight:400;font-size:clamp(2.2rem,4.6vw,3.6rem);line-height:1;letter-spacing:-.02em;margin-bottom:14px}
  .contact-address{color:var(--muted);max-width:34ch;margin-bottom:24px}
  .contact-cards{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .contact-card{background:var(--cream);padding:20px 22px}
  .contact-card span{display:block;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:5px}
  .contact-card a,.contact-card p{font-family:var(--font-display);font-size:1rem;word-break:break-word}
  .contact-card a:hover{color:var(--accent)}
  .hours{list-style:none;font-family:var(--font-body);font-size:.78rem}
  .hours li{display:flex;justify-content:space-between;gap:14px;padding:2px 0;color:var(--muted)}
  .muted{font-size:.8rem;color:var(--muted)}
  footer{background:var(--footer-bg);color:var(--footer-text);padding:38px 30px;text-align:center;font-size:.78rem}
  footer strong{display:block;font-family:var(--font-display);font-weight:400;font-size:1.12rem;color:var(--footer-head);margin-bottom:6px}
  .foot-note{max-width:62ch;margin:0 auto 8px;font-size:.78rem}

  /* restaurant — centred dark menu */
  .topbar--center .topbar-inner{flex-direction:column;gap:6px;padding:14px 30px 11px}
  .topbar--center .brand-name{font-size:1.02rem;letter-spacing:.2em;text-transform:uppercase}
  .topbar--center .navlinks{gap:24px}
  .hero-menu{align-items:center;justify-content:center;text-align:center;padding:172px 30px 72px}
  .hero-menu .hero-inner,.hero-framed .hero-inner{display:flex;flex-direction:column;align-items:center}
  .hero-menu .hero-tag,.hero-framed .hero-tag{margin-left:auto;margin-right:auto}
  .hero-menu .hero-actions,.hero-framed .hero-actions{justify-content:center}
  .hero-menu .hero-meta,.hero-framed .hero-meta{margin-left:auto;margin-right:auto}
  .hero-menu .hero-img{filter:brightness(.42) saturate(.9)}
  .gallery-restaurant{grid-template-columns:repeat(3,1fr);gap:10px}
  .gallery-restaurant .tile{grid-column:auto;grid-row:auto;min-height:280px;border-radius:4px}
  .gallery-restaurant .tile:nth-child(1){grid-column:span 2;grid-row:span 2;min-height:570px}
  .about-restaurant{grid-template-columns:1fr;max-width:900px;margin:0 auto;text-align:center;gap:38px}
  .about-restaurant .about-copy{margin:0 auto}
  .about-restaurant .dropcap::first-letter{float:none;display:block;font-size:3.4rem;padding:0 0 8px}
  .about-restaurant .about-cards{position:static;grid-template-columns:repeat(4,minmax(0,1fr))}
  .about-restaurant .pullquote{border-left:0;border-block:1px solid var(--line);padding:22px 0}

  /* service — split hero, light corporate */
  .hero-split{background:linear-gradient(180deg,var(--cream),var(--bg));align-items:center;padding:150px 30px 70px;min-height:92svh;color:var(--ink)}
  .hero-split .hero-img{position:absolute;right:30px;top:50%;transform:translateY(-50%);width:42%;height:60vh;border-radius:26px;object-fit:cover;filter:none;animation:none;box-shadow:0 40px 90px -46px rgba(13,35,64,.55)}
  .hero-split .hero-veil{display:none}
  .hero-split .hero-inner > *{max-width:52%}
  .hero-split .eyebrow{color:var(--accent);border-color:var(--line);background:var(--cream);backdrop-filter:none;margin-top:6px}
  .hero-split .hero-tag{color:var(--muted)}
  .hero-split .btn-ghost{border-color:var(--line);color:var(--ink)}
  .hero-split .btn-ghost:hover{background:var(--cream)}
  .hero-split .hero-meta{background:var(--line);border-color:var(--line);backdrop-filter:none}
  .hero-split .hero-meta div{background:var(--cream)}
  .hero-split .hero-meta span{color:var(--muted)}
  .hero-split .hero-meta strong{color:var(--ink)}
  .nav-phone{align-items:center;font-size:11px;letter-spacing:.08em;color:inherit;opacity:.8;white-space:nowrap}
  @media(min-width:900px){.nav-phone{display:inline-flex}}
  .gallery-service{grid-template-columns:repeat(4,1fr);gap:14px}
  .gallery-service .tile{grid-column:auto;grid-row:auto;min-height:0;aspect-ratio:1/1;border-radius:20px}
  .about-service .about-card{border-radius:18px;box-shadow:0 22px 50px -40px rgba(13,35,64,.5)}
  .contact-service .contact-cards{border-radius:18px;box-shadow:0 30px 70px -54px rgba(13,35,64,.45)}
  .reviews-service .quote{border-radius:18px}

  /* premium — framed couture typography */
  .topbar--lux .navlinks a{letter-spacing:.26em;font-size:10px}
  .topbar--lux .brand-name{font-size:1rem;letter-spacing:.22em;text-transform:uppercase}
  .topbar--lux .nav-cta{border-radius:0;padding:11px 20px;letter-spacing:.22em}
  .hero-framed{min-height:94svh;align-items:center;justify-content:center;text-align:center;padding:150px 40px 72px}
  .hero-framed .hero-img{filter:brightness(.5) saturate(.8) sepia(.08)}
  .hero-framed .hero-inner{border:1px solid rgba(255,255,255,.42);padding:clamp(28px,5vw,58px);max-width:940px;background:rgba(10,8,6,.28);backdrop-filter:blur(2px)}
  .hero-framed .eyebrow{border-radius:0}
  .hero-framed .btn{border-radius:0}
  .gallery-premium{grid-template-columns:repeat(2,1fr);gap:18px}
  .gallery-premium .tile{grid-column:auto;grid-row:auto;min-height:430px;border-radius:0}
  .gallery-premium .tile figcaption{opacity:1;transform:none;background:linear-gradient(transparent,rgba(0,0,0,.55))}
  .about-premium{gap:72px}
  .about-premium .pullquote{font-size:clamp(1.6rem,3vw,2.2rem);border-left-width:1px}
  .about-premium .about-card{border-radius:0}
  .products-premium .price-row{padding:24px 4px}
  .products-premium .price-row h3{font-size:1.5rem;font-weight:400}
  .contact-premium .contact-cards{border-radius:0}
  .reviews-premium .quote{border-radius:0;border-left:2px solid var(--accent)}

  @media(max-width:980px){
    .about-grid{grid-template-columns:1fr;gap:32px}
    .about-cards{position:static;grid-template-columns:repeat(2,1fr)}
    .reviews-inner{grid-template-columns:1fr;gap:30px}
    .contact-grid{grid-template-columns:1fr;gap:30px}
    .gallery{grid-template-columns:repeat(2,1fr)}
    .tile:nth-child(1){grid-column:span 2;grid-row:span 1;min-height:300px}
    .tile:nth-child(4){grid-column:span 2}
    .gallery-restaurant .tile:nth-child(1){grid-column:span 2;grid-row:span 1;min-height:320px}
    .gallery-premium .tile{min-height:300px}
    .about-restaurant .about-cards{grid-template-columns:repeat(2,minmax(0,1fr))}
    .hero-split{padding:120px 22px 60px;min-height:auto}
    .hero-split .hero-img{position:relative;right:auto;top:auto;transform:none;width:100%;height:340px;margin-bottom:34px;border-radius:22px;box-shadow:none}
    .hero-split .hero-inner > *{max-width:100%}
    .hero-split .hero-meta{max-width:100%}
  }
  @media(max-width:760px){
    .topbar-inner{padding:13px 18px}
    .topbar--center .topbar-inner{flex-direction:row;justify-content:space-between;padding:13px 18px}
    .burger{display:flex}
    .navlinks{position:fixed;top:66px;left:14px;right:14px;flex-direction:column;align-items:flex-start;gap:2px;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:14px 18px;box-shadow:0 24px 60px rgba(22,22,22,.18);opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s}
    .navlinks a{color:var(--muted)!important;padding:9px 0;width:100%}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .nav-cta{color:var(--on-accent)!important;justify-content:center;display:flex;margin-top:4px}
    .hero{padding:120px 18px 36px;min-height:92svh}
    .hero-menu{padding:130px 18px 48px}
    .hero-framed{padding:120px 16px 50px;min-height:auto}
    .hero-framed .hero-inner{padding:26px 18px}
    .hero-meta{grid-template-columns:1fr 1fr}
    .section{padding:72px 18px}
    .reviews-inner{padding:72px 18px}
    .gallery{grid-template-columns:1fr}
    .tile:nth-child(1),.tile:nth-child(4){grid-column:span 1;min-height:280px}
    .gallery-restaurant{grid-template-columns:1fr}
    .gallery-restaurant .tile:nth-child(1){grid-column:span 1;min-height:300px}
    .gallery-service{grid-template-columns:repeat(2,1fr)}
    .gallery-premium{grid-template-columns:1fr}
    .gallery-premium .tile{min-height:260px}
    .contact-cards{grid-template-columns:1fr}
    .price-row{gap:12px}
    .price-thumb{width:48px;height:48px;flex-basis:48px}
    .price-row h3{font-size:1.1rem}
    footer{padding:32px 18px}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
  }
  `

  const aboutClass =
    variant === 'restaurant' ? 'about-grid about-restaurant' :
    variant === 'service' ? 'about-grid about-service' :
    variant === 'premium' ? 'about-grid about-premium' :
    'about-grid'

  const contactClass =
    variant === 'service' ? 'contact-grid contact-service' :
    variant === 'premium' ? 'contact-grid contact-premium' :
    'contact-grid'

  const reviewsClass =
    variant === 'service' ? 'reviews reviews-service' :
    variant === 'premium' ? 'reviews reviews-premium' :
    'reviews'

  return `${documentHead(b.name || 'Business', v.fonts, css + HERO_RAIL_STYLES)}
  ${GRAIN_OVERLAY}
  <header class="topbar ${v.navClass}">
    <div class="topbar-inner">
      <a class="brand" href="#top"><span class="brand-mark">${escapeHtml(initials(b.name))}</span><span class="brand-name">${name}</span></a>
      <nav class="navlinks">
        <a href="#top" data-page="home">Home</a>
        <a href="#products" data-page="products">${menuLabel}</a>
        <a href="#about" data-page="about">About</a>
        <a href="#contact" data-page="contact">Contact</a>
        ${links.slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        ${navPhone}
        <a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero hero-${v.hero}" id="top">
    ${hero ? `<img class="hero-img" src="${escapeHtml(hero)}" alt="${name}">` : `<div class="hero-fallback"><span>${escapeHtml(initials(b.name))}</span></div>`}
    <div class="hero-veil"></div>
    <div class="hero-inner">
      <div class="eyebrow reveal">${category}${city ? ` · ${city}` : ''}</div>
      <h1 class="reveal" style="transition-delay:70ms">${name}</h1>
      <p class="hero-tag reveal" style="transition-delay:140ms">${escapeHtml(truncate(description, 180))}</p>
      <div class="hero-actions reveal" style="transition-delay:200ms">
        <a class="btn btn-solid" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
        <a class="btn btn-ghost" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
      </div>
      <div class="hero-meta reveal" style="transition-delay:260ms">
        <div><span>Rating</span><strong>${rating > 0 ? `${rating.toFixed(1)} / 5` : 'New'}</strong></div>
        <div><span>Reviews</span><strong>${reviews}</strong></div>
        <div><span>Photos</span><strong>${images.length}</strong></div>
      </div>
    </div>
  </section>

  ${heroRailHtml(images, b)}

  <div class="marquee marquee-${variant}" aria-hidden="true">
    <div class="marquee-track">
      ${[category, city || 'Local', v.tagline, 'Quality first', 'Visit us', category, city || 'Local', v.tagline, 'Quality first', 'Visit us'].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
    </div>
  </div>

  <section class="section" id="about">
    <div class="section-head reveal">
      <span class="kicker">01 — About</span>
      <h2>${aboutTitle}</h2>
    </div>
    <div class="${aboutClass}">
      <div class="about-copy reveal">
        <p class="dropcap">${escapeHtml(lede)}</p>
        ${rest.map((part) => `<p>${escapeHtml(part)}</p>`).join('')}
        <p>Find us at ${escapeHtml(listText([b.address, b.city, b.state], ', '))}. Whether you are a first-time visitor or a familiar face, we are glad you are here.</p>
        <blockquote class="pullquote">“Good service is a series of small decisions, made well.”</blockquote>
      </div>
      <div class="about-cards reveal">
        ${rating > 0 ? `<div class="about-card"><span>Average rating</span><strong><span data-count="${rating}" data-decimals="1">${rating.toFixed(1)}</span><em>/5</em></strong></div>` : ''}
        <div class="about-card"><span>Verified reviews</span><strong>${reviews}</strong></div>
        <div class="about-card"><span>Category</span><strong style="font-size:1.05rem">${category}</strong></div>
        <div class="about-card"><span>Gallery</span><strong>${images.length}</strong></div>
      </div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="section-head reveal">
      <span class="kicker">02 — Gallery</span>
      <h2>${galleryTitle}</h2>
    </div>
    <div class="gallery gallery-${variant}">${galleryTiles}</div>
  </section>

  ${productsHtml}

  <section class="${reviewsClass}" id="reviews">
    <div class="reviews-inner">
      <div class="score reveal">
        <span class="kicker" style="margin-bottom:12px">04 — Reviews</span>
        <div class="stars">${starsHtml(rating)}</div>
        <strong>${rating > 0 ? rating.toFixed(1) : '—'}<small>/5</small></strong>
        <span>${reviews > 0 ? `${reviews} verified review${reviews === 1 ? '' : 's'}` : 'Newly listed'}</span>
      </div>
      <div class="quote-grid">
        <div class="quote reveal"><p>“Friendly, reliable and genuinely good at what they do. Highly recommended.”</p><span>Verified customer · ${city || 'India'}</span></div>
        <div class="quote reveal" style="transition-delay:70ms"><p>“Quality you can see and service you remember. We will be back.”</p><span>Returning customer · ${city || 'India'}</span></div>
      </div>
    </div>
  </section>

  <section class="section" id="contact">
    <div class="${contactClass}">
      <div class="reveal">
        <span class="kicker">05 — Visit</span>
        <h2>${visitTitle}</h2>
        <p class="contact-address">${escapeHtml(listText([b.address, b.city, b.state], ', ') || '—')}</p>
        <a class="btn btn-solid" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer" style="border:1px solid var(--accent)">Open in Maps</a>
      </div>
      <div class="contact-cards reveal">
        <div class="contact-card"><span>Phone</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
        ${b.email ? `<div class="contact-card"><span>Email</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
        ${b.whatsapp ? `<div class="contact-card"><span>WhatsApp</span><a href="${escapeHtml(waHref(String(b.whatsapp)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
        ${b.website ? `<div class="contact-card"><span>Website</span><a href="${escapeHtml(String(b.website))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.website))}</a></div>` : ''}
        <div class="contact-card" style="grid-column:1/-1"><span>Hours</span>${hoursHtml}</div>
      </div>
    </div>
  </section>

  <footer>
    <strong>${name}</strong>
    <p class="foot-note">${escapeHtml(truncate(description, 140))}</p>
    ${city ? `${city}${state ? `, ${state}` : ''} · ` : ''}© <span data-year>${new Date().getFullYear()}</span> ${name}
  </footer>
  ${UI_SCRIPT}
  ${HERO_RAIL_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
