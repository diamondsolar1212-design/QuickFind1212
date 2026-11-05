// Five premium product-storefront templates ported from the supplied
// "5-premium-product-website-templates" pack. The pack ships a single
// storefront layout in five palettes, so one renderer reads a theme record
// per skin and every skin keeps the pack's signature furniture: announcement
// topline, sticky blurred nav, split hero with a tall image, thin uppercase
// strip, four-up product grid, story split and a dark three-column footer.

import { productImage } from '../products'
import {
  anchorAttrs,
  BusinessData,
  customLinks,
  documentHead,
  escapeHtml,
  heroImage,
  heroPicks,
  HourEntry,
  initials,
  listText,
  mapHref,
  NAV_INTERCEPTOR_SCRIPT,
  paragraphs,
  primaryCta,
  productMediaHtml,
  ratingOf,
  readableOn,
  reviewCountOf,
  secondaryCta,
  siteLinkHtml,
  starsHtml,
  telHref,
  TemplateProduct,
  truncate,
  UI_SCRIPT,
  waHref
} from './shared'

interface StorefrontTheme {
  bg: string
  surface: string
  ink: string
  muted: string
  accent: string
  line: string
  /** Serif display face from the pack (Playfair) or its grotesque fallback. */
  display: string
}

export const STOREFRONT_STYLES: Record<string, StorefrontTheme> = {
  'luxury-editorial': {
    bg: '#f3efe7', surface: '#fffdf8', ink: '#191916', muted: '#77736a', accent: '#a77b45', line: '#ded7ca',
    display: "'Playfair Display',Georgia,serif"
  },
  'modern-dark': {
    bg: '#0c1110', surface: '#151d1a', ink: '#f1f4ee', muted: '#9aa69e', accent: '#b7f36b', line: '#2b3831',
    display: "'DM Sans',Arial,sans-serif"
  },
  'minimal-contemporary': {
    bg: '#f7f8f6', surface: '#ffffff', ink: '#202522', muted: '#78817b', accent: '#527c70', line: '#e1e7e2',
    display: "'DM Sans',Arial,sans-serif"
  },
  'organic-lifestyle': {
    bg: '#eee9df', surface: '#faf7f0', ink: '#34372b', muted: '#7c7d6c', accent: '#b65f43', line: '#d9d0c1',
    display: "'Playfair Display',Georgia,serif"
  },
  'bold-creative': {
    bg: '#f4f0e8', surface: '#fffdf7', ink: '#1726a0', muted: '#595e84', accent: '#ff5b35', line: '#d8d6cf',
    display: "'DM Sans',Arial,sans-serif"
  }
}

const STOREFRONT_IDS = Object.keys(STOREFRONT_STYLES)

export function isStorefrontSkin(template: string | null | undefined): boolean {
  return !!template && STOREFRONT_IDS.indexOf(template) >= 0
}

export function generateStorefront(
  skin: string,
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const theme = STOREFRONT_STYLES[skin] || STOREFRONT_STYLES['luxury-editorial']
  const onAccent = readableOn(theme.accent)

  const name = escapeHtml(b.name || 'Your Business')
  const category = escapeHtml(b.category || 'Store')
  const city = escapeHtml(b.city || '')
  const state = escapeHtml(b.state || '')
  const description = String(b.description || '')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const hero = heroImage(b, images)
  const primary = primaryCta(b, 'Call now')
  const secondary = secondaryCta(b, 'Browse products', '#products')
  const links = customLinks(b)
  const tagline = escapeHtml(String(b.subcategory || '').trim() || `${b.category || 'Store'}${b.city ? ` in ${b.city}` : ''}`)

  const productCards = products.slice(0, 12).map((p, i) => {
    // Every tile in the pack is a photograph, so a listing whose catalogue has
    // no per-product image lends its own gallery shots in rotation.
    const photo = productImage(p) || images[i % images.length] || ''
    return `
      <article class="product reveal" style="transition-delay:${(i % 4) * 70}ms">
        <div class="product-img">${productMediaHtml({ ...p, image: photo }, theme.line)}</div>
        <div class="product-meta">
          <strong>${escapeHtml(String(p.name ?? 'Product'))}</strong>
          ${p.price ? `<span class="price">${escapeHtml(String(p.price))}</span>` : ''}
        </div>
        ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
      </article>`
  }).join('')

  const galleryTiles = Array.from(new Set([...heroPicks(b), ...images]))
    .filter(Boolean)
    .slice(0, 8)
    .map((src, i) => `
      <figure class="shot reveal" style="transition-delay:${(i % 4) * 70}ms">
        <img src="${escapeHtml(src)}" alt="${name} — photo ${i + 1}" loading="lazy">
        <figcaption><span>${String(i + 1).padStart(2, '0')}</span>${city || category}</figcaption>
      </figure>`).join('')

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `A ${category.toLowerCase()} serving ${city || 'our neighbourhood'} with care.`
  const rest = bodyParagraphs.slice(1)

  const quoteCards = reviews > 0 ? `
        <blockquote class="quote reveal"><p>“Quality matched what they promised, and the service was quick and courteous. Would happily order again.”</p><span>Verified customer${city ? ` · ${city}` : ''}</span></blockquote>
        <blockquote class="quote reveal" style="transition-delay:90ms"><p>“Well priced, clearly described and delivered on time. It is rare to find a shop this dependable.”</p><span>Repeat buyer${city ? ` · ${city}` : ''}</span></blockquote>` : `
        <blockquote class="quote reveal"><p>“Be the first to share your experience — customer reviews will appear right here.”</p><span>Newly listed on BusinessHub</span></blockquote>`

  const hoursHtml = hours.length > 0
    ? `<ul class="hours">${hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>`
    : `<p class="muted small">Call for current opening hours.</p>`

  const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:${theme.bg};--surface:${theme.surface};--ink:${theme.ink};--muted:${theme.muted};--accent:${theme.accent};--line:${theme.line};--on-accent:${onAccent};--display:${theme.display}}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--ink);font-family:'DM Sans',Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{display:block;width:100%;object-fit:cover}
  ::selection{background:var(--accent);color:var(--on-accent)}
  .wrap{width:min(1200px,calc(100% - 48px));margin:auto}
  .reveal{opacity:0;transform:translateY(22px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .muted{color:var(--muted)}
  .small{font-size:13px}
  // .announce also opts the banner out of the multi-page block sweep.
  .topline{padding:9px 20px;text-align:center;background:var(--ink);color:var(--bg);font-size:11px;letter-spacing:.13em;text-transform:uppercase}
  header{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
  .nav{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px}
  .brand{font-family:var(--display);font-size:24px;font-weight:700;letter-spacing:-.04em;line-height:1.1;max-width:46%}
  .brand small{display:block;font:10px 'DM Sans',sans-serif;letter-spacing:.18em;color:var(--muted);text-transform:uppercase;margin-top:4px}
  .navlinks{display:flex;gap:26px;font-size:13px;color:var(--muted);align-items:center}
  .navlinks a:hover{color:var(--accent)}
  .nav-cta,.btn{display:inline-flex;align-items:center;justify-content:center;padding:13px 20px;background:var(--accent);color:var(--on-accent);border:0;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:transform .25s,opacity .25s}
  .nav-cta{padding:11px 16px}
  .btn:hover,.nav-cta:hover{transform:translateY(-2px)}
  .btn-outline{display:inline-flex;align-items:center;padding:12px 18px;border:1px solid var(--line);font-size:12px;text-transform:uppercase;letter-spacing:.08em;transition:border-color .25s,color .25s}
  .btn-outline:hover{border-color:var(--accent);color:var(--accent)}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:22px;height:1.5px;background:var(--ink)}
  .hero{padding:82px 0 70px;display:grid;grid-template-columns:1fr 1.05fr;gap:56px;align-items:center}
  .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.2em;color:var(--accent);font-weight:700}
  h1,h2,h3{font-family:var(--display);font-weight:${theme.display.indexOf('Playfair') >= 0 ? '500' : '700'};margin-top:0}
  h1{font-size:clamp(42px,6vw,80px);line-height:.98;letter-spacing:-.045em;margin:20px 0;text-wrap:balance}
  .hero p{max-width:470px;color:var(--muted);font-size:16px}
  .hero-media{height:560px;background:var(--line);overflow:hidden}
  .hero-media img{height:100%;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
  .hero-media:hover img{transform:scale(1.04)}
  .hero-fallback{height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(140deg,var(--accent),var(--ink));font-family:var(--display);font-size:clamp(70px,12vw,150px);color:var(--bg)}
  .actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
  .hero-note{font-size:11px;margin-top:35px;letter-spacing:.14em;text-transform:uppercase}
  .strip{border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden;white-space:nowrap;text-align:center}
  .strip-track{display:inline-flex;animation:slide 38s linear infinite;padding:18px 0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
  .strip-track span{padding:0 26px;position:relative}
  .strip-track span::after{content:'✳';color:var(--accent);margin-left:26px;font-size:9px}
  @keyframes slide{to{transform:translateX(-50%)}}
  .section{padding:82px 0;scroll-margin-top:96px}
  .section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:30px}
  h2{font-size:clamp(30px,4vw,50px);line-height:1.04;letter-spacing:-.035em;margin:12px 0}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
  .product{min-width:0}
  .product-img{height:290px;background:var(--line);overflow:hidden}
  .product-img img{height:100%;transition:transform .5s}
  .product:hover .product-img img{transform:scale(1.045)}
  .product-meta{display:flex;justify-content:space-between;gap:12px;margin-top:13px;font-size:13px;align-items:baseline}
  .product p{font-size:12px;color:var(--muted);margin:5px 0}
  .price{font-weight:700;white-space:nowrap}
  .story{display:grid;grid-template-columns:1fr 1fr;gap:54px;align-items:center}
  .story-img{height:470px;overflow:hidden;background:var(--line)}
  .story-img img{height:100%}
  .story h2{margin-top:14px}
  .feature-band{background:var(--surface);padding:42px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px;border:1px solid var(--line)}
  .feature-band strong{display:block;font-family:var(--display);font-size:24px;margin-bottom:7px}
  .feature-band span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .shots{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .shot{position:relative;overflow:hidden;min-height:230px;background:var(--line)}
  .shot img{height:100%;min-height:230px;transition:transform .9s cubic-bezier(.2,.7,.2,1)}
  .shot:hover img{transform:scale(1.05)}
  .shot figcaption{position:absolute;inset:auto 0 0 0;padding:14px 16px;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--bg);background:linear-gradient(transparent,rgba(0,0,0,.62));opacity:0;transform:translateY(8px);transition:.35s}
  .shot:hover figcaption{opacity:1;transform:none}
  .review-wrap{background:var(--surface);border-block:1px solid var(--line)}
  .rating-row{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap;margin-bottom:28px}
  .rating-number{font-family:var(--display);font-size:clamp(44px,7vw,68px);line-height:.9}
  .stars{color:var(--accent);letter-spacing:.1em}
  .stars .off{opacity:.28}
  .rating-note{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
  .quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .quote{border:1px solid var(--line);background:var(--bg);padding:28px}
  .quote p{font-family:var(--display);font-size:17px;line-height:1.5}
  .quote span{display:block;margin-top:16px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
  .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:start}
  .detail-list{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);margin-top:26px}
  .detail{background:var(--bg);padding:18px 20px}
  .detail span{display:block;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
  .detail a,.detail p{font-size:15px;word-break:break-word}
  .detail a:hover{color:var(--accent)}
  .hours{list-style:none;font-size:13px}
  .hours li{display:flex;justify-content:space-between;gap:18px;padding:4px 0}
  .map-card{background:var(--surface);border:1px solid var(--line);padding:34px}
  .map-card h3{font-size:22px;margin-bottom:12px}
  .pill{display:inline-block;border:1px solid var(--line);padding:7px 12px;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:16px}
  footer{background:var(--ink);color:var(--bg);padding:52px 0 24px;margin-top:70px}
  footer .muted{color:color-mix(in srgb,var(--bg) 65%,var(--ink))}
  .footgrid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:36px;padding-bottom:40px}
  .footgrid .brand{color:var(--bg)}
  .footgrid b{display:block;font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:12px}
  .footgrid a{display:block;font-size:13px;margin:7px 0;color:color-mix(in srgb,var(--bg) 82%,var(--ink))}
  .footgrid a:hover{color:var(--accent)}
  .copyright{border-top:1px solid color-mix(in srgb,var(--bg) 25%,var(--ink));padding-top:20px;font-size:11px;display:flex;justify-content:space-between;color:var(--muted);gap:12px;flex-wrap:wrap}
  @media(max-width:980px){.grid,.shots{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:850px){
    .hero,.story,.contact-grid{grid-template-columns:1fr}
    .hero{padding-top:48px}
    .hero-media{height:420px}
    .product-img{height:240px}
    .navlinks{position:fixed;top:76px;left:16px;right:16px;flex-direction:column;align-items:stretch;gap:2px;background:var(--surface);padding:14px 18px;border:1px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,.18);opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{padding:11px 0;border-bottom:1px solid var(--line)}
    .navlinks a:last-child{border-bottom:0}
    .burger{display:flex}
    .footgrid{grid-template-columns:1fr 1fr}
    .feature-band{grid-template-columns:1fr}
    .section{padding:56px 0}
  }
  @media(max-width:520px){
    .wrap{width:min(100% - 32px,1200px)}
    .grid,.shots{gap:12px}
    .product-img{height:190px}
    .shot,.shot img{min-height:170px}
    .section-head{display:block}
    .footgrid{grid-template-columns:1fr}
    .copyright{display:block}
    .hero-media{height:340px}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
  }
  `

  return `${documentHead(b.name || 'Business', 'family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500', css)}
  <div class="topline announce">${category}${city ? ` · ${city}` : ''} · Complimentary quotes · Thoughtfully selected</div>
  <header>
    <div class="wrap nav">
      <a class="brand" href="#top" data-page="home">${name}<small>${tagline}</small></a>
      <nav class="navlinks">
        <a href="#top" data-page="home">Home</a>
        <a href="#products" data-page="products">Products</a>
        <a href="#about" data-page="about">About us</a>
        <a href="#contact" data-page="contact">Contact</a>
        ${links.slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        <a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>Explore ↗</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <main>
    <div class="wrap hero" id="top">
      <div>
        <span class="eyebrow reveal">${category}${city ? ` · ${city}` : ''}</span>
        <h1 class="reveal" style="transition-delay:70ms">${name}</h1>
        <p class="reveal" style="transition-delay:140ms">${escapeHtml(truncate(description, 190))}</p>
        <div class="actions reveal" style="transition-delay:210ms">
          <a class="btn" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)} ↗</a>
          <a class="btn-outline" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
        </div>
        <p class="muted hero-note reveal" style="transition-delay:280ms">${rating > 0 ? `${rating.toFixed(1)} rated by ${reviews || 'guests'} · ` : ''}${products.length} offerings · Made with intention</p>
      </div>
      <div class="hero-media reveal" style="transition-delay:120ms">
        ${hero ? `<img src="${escapeHtml(hero)}" alt="${name}">` : `<div class="hero-fallback"><span>${escapeHtml(initials(b.name))}</span></div>`}
      </div>
    </div>

    <div class="strip" aria-hidden="true">
      <div class="strip-track">
        ${[category, city || 'Local', 'Quality first', 'Trusted service', 'Fast response', category, city || 'Local', 'Quality first', 'Trusted service', 'Fast response'].map((item) => `<span>${item}</span>`).join('')}
      </div>
    </div>

    <section class="section" id="products">
      <div class="wrap">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">Curated for you</span>
            <h2>Products &amp; services</h2>
          </div>
          <a class="btn-outline" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>Enquire ↗</a>
        </div>
        <div class="grid">${productCards}</div>
      </div>
    </section>

    <section class="section" id="about" style="padding-top:0">
      <div class="wrap story">
        <div class="story-img reveal">
          ${images[1] ? `<img src="${escapeHtml(images[1])}" alt="${name} — our story" loading="lazy">` : `<div class="hero-fallback"><span>${escapeHtml(initials(b.name))}</span></div>`}
        </div>
        <div class="reveal" style="transition-delay:90ms">
          <span class="eyebrow">Our point of view</span>
          <h2>${category}, done properly.</h2>
          <p class="muted">${escapeHtml(lede)}</p>
          ${rest.slice(0, 2).map((part) => `<p class="muted" style="margin-top:14px">${escapeHtml(part)}</p>`).join('')}
          <div class="actions">
            <a class="btn" href="${escapeHtml(telHref(b.phone))}">Talk to us ↗</a>
            <a class="btn-outline" href="#gallery">See the gallery</a>
          </div>
        </div>
      </div>
      <div class="wrap">
        <div class="feature-band reveal">
          <div><strong>${rating > 0 ? `<span data-count="${rating}" data-decimals="1">${rating.toFixed(1)}</span>/5` : 'New'}</strong><span>${reviews > 0 ? `${reviews} customer reviews` : 'Rated by customers'}</span></div>
          <div><strong><span data-count="${products.length}">${products.length}</span></strong><span>Products &amp; services listed</span></div>
          <div><strong><span data-count="${images.length}">${images.length}</span></strong><span>Photos from ${city || 'the team'}</span></div>
        </div>
      </div>
    </section>

    <section class="section" id="gallery" style="padding-top:0">
      <div class="wrap">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">The gallery</span>
            <h2>A closer look</h2>
          </div>
          <span class="pill">${images.length} photos</span>
        </div>
        <div class="shots">${galleryTiles}</div>
      </div>
    </section>

    <section class="review-wrap" id="reviews" style="scroll-margin-top:96px">
      <div class="wrap section">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">In their words</span>
            <h2>Customer reviews</h2>
          </div>
          <div class="rating-row" style="margin-bottom:0">
            <div class="rating-number">${rating > 0 ? rating.toFixed(1) : '—'}</div>
            <div>
              <div class="stars">${starsHtml(rating)}</div>
              <div class="rating-note">${reviews > 0 ? `${reviews} review${reviews === 1 ? '' : 's'}` : 'Newly listed'}</div>
            </div>
          </div>
        </div>
        <div class="quotes">${quoteCards}</div>
      </div>
    </section>

    <section class="section" id="contact">
      <div class="wrap">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">Visit / Connect</span>
            <h2>Get in touch</h2>
          </div>
        </div>
        <div class="contact-grid">
          <div class="reveal">
            <p class="muted">${escapeHtml(listText([b.address, b.city, b.state], ', ')) || 'Reach us by phone or email — we reply fast.'}</p>
            <div class="detail-list">
              <div class="detail"><span>Phone</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
              ${b.whatsapp ? `<div class="detail"><span>WhatsApp</span><a href="${escapeHtml(waHref(String(b.whatsapp)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
              ${b.email ? `<div class="detail"><span>Email</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
              ${b.website ? `<div class="detail"><span>Website</span><a href="${escapeHtml(String(b.website))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.website).replace(/^https?:\/\//, ''))}</a></div>` : ''}
            </div>
          </div>
          <div class="map-card reveal" style="transition-delay:90ms">
            <span class="pill">${city || state || 'Location'}</span>
            <h3>Opening hours</h3>
            ${hoursHtml}
            <div class="actions">
              <a class="btn" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap">
      <div class="footgrid">
        <div>
          <div class="brand">${name}<small>${tagline}</small></div>
          <p class="muted small" style="max-width:300px;margin-top:14px">${escapeHtml(truncate(description, 130))}</p>
        </div>
        <div>
          <b>Explore</b>
          <a href="#products" data-page="products">All products</a>
          <a href="#about" data-page="about">Our story</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact" data-page="contact">Get in touch</a>
        </div>
        <div>
          <b>Visit / Connect</b>
          <a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || 'Call us')}</a>
          <a href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Find our location</a>
          ${b.email ? `<a href="mailto:${escapeHtml(String(b.email))}">Email us</a>` : ''}
          ${links.slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        </div>
      </div>
      <div class="copyright">
        <span>© <span data-year>${new Date().getFullYear()}</span> ${name}. All rights reserved.</span>
        <span>${listText([city, state].filter(Boolean), ', ')}${reviews > 0 ? ` · ${reviews} customer reviews` : ''}</span>
      </div>
    </div>
  </footer>
  ${UI_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
