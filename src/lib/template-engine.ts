// HTML Template Engine — generates full HTML pages for premium business templates
// Based on the 5 uploaded HTML designs, adapted to inject business data
// Each template renders as a multi-section single-page site with working nav anchors.

export interface BusinessData {
  name: string
  description: string
  category: string
  subcategory?: string | null
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
}

export function generateBusinessWebsite(business: BusinessData): string {
  const tpl = business.template

  // Parse products
  let products: any[] = []
  try { products = business.products ? JSON.parse(business.products) : [] } catch {}

  // Parse gallery images
  const gallery = business.imageUrls ? business.imageUrls.split(',').filter(Boolean) : []
  const allImages = business.profileImage && !gallery.includes(business.profileImage)
    ? [business.profileImage, ...gallery]
    : gallery

  // Parse hours
  let hours: any = {}
  try { hours = business.hours ? JSON.parse(business.hours) : {} } catch {}

  switch (tpl) {
    case 'calm-sage':
      return generateCalmSage(business, allImages, products, hours)
    case 'jungle-gold':
      return generateJungleGold(business, allImages, products, hours)
    case 'athletic-bold':
      return generateAthleticBold(business, allImages, products, hours)
    case 'tech-lime':
      return generateTechLime(business, allImages, products, hours)
    case 'journalism-red':
      return generateJournalismRed(business, allImages, products, hours)
    default:
      return generateDefault(business, allImages, products, hours)
  }
}

function escapeHtml(str: string): string {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Background image used for nav bar — fallback to profile image, then gradient
function navBgStyle(b: BusinessData, fallback: string): string {
  if (b.profileImage) {
    return `background:linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.35) 100%),url('${b.profileImage}') center/cover fixed;`
  }
  return fallback
}

// Inline script injected at end of each template body.
// It intercepts ALL <a href="#..."> clicks inside the iframe and smooth-scrolls
// to the target section via scrollIntoView(). This is needed because:
//   1. Plain hash navigation on `about:srcdoc` URLs (used by iframe srcDoc) is unreliable.
//   2. Previously, sandbox="allow-top-navigation" let hash clicks escape and load the
//      parent app URL — showing the marketplace inside the preview iframe.
// Now we run without allow-top-navigation, but still intercept clicks for smooth UX.
const NAV_INTERCEPTOR_SCRIPT = `<script>(function(){document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var href=a.getAttribute('href');if(!href||href==='#'||href.length<2)return;var target=document.getElementById(href.slice(1));if(target){e.preventDefault();e.stopPropagation();target.scrollIntoView({behavior:'smooth',block:'start'});return false;}else{e.preventDefault();e.stopPropagation();window.scrollTo({top:0,behavior:'smooth'});return false;}});});})();</script>`

// Star rating HTML (out of 5)
function starsHtml(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  let s = ''
  for (let i = 0; i < full; i++) s += '★'
  if (half) s += '☆'
  for (let i = full + (half ? 1 : 0); i < 5; i++) s += '☆'
  return s
}

function generateCalmSage(b: BusinessData, images: string[], products: any[], hours: any): string {
  const galleryHtml = images.slice(0, 8).map((url, i) =>
    `<div style="aspect-ratio:1;overflow:hidden;border-radius:12px;"><img src="${url}" alt="Gallery ${i+1}" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.85) contrast(0.95);transition:transform 0.6s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>`
  ).join('')

  const productsHtml = products.length > 0 ? `
    <section id="products" class="section">
      <div style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:0.32em;text-transform:uppercase;color:#b16a48;margin-bottom:1.5rem;">— Offerings —</div>
      <h2 class="section-title">Our Products</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;">
        ${products.map(p => `
          <div style="background:#efe6d4;border-radius:16px;overflow:hidden;">
            <div style="aspect-ratio:1;overflow:hidden;">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#e3d5c1;">📦</div>'}</div>
            <div style="padding:1rem;">
              <div style="font-family:'Fraunces',serif;font-size:1rem;color:#2c2620;">${escapeHtml(p.name)}</div>
              <div style="font-size:0.875rem;color:#8a9a87;font-weight:600;margin-top:0.25rem;">${escapeHtml(p.price)}</div>
              ${p.details ? `<div style="font-size:0.75rem;color:#7a6e60;margin-top:0.25rem;">${escapeHtml(p.details)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>` : ''

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(b.name)}</title><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"><style>
  *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:'Inter',sans-serif;background:#f4ede0;color:#2c2620;line-height:1.75;overflow-x:hidden}
  .hero{position:relative;min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#faf5ec;padding:6rem 2rem;overflow:hidden}
  .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.78) saturate(0.85)}
  .hero-veil{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,transparent 0%,rgba(40,32,24,0.35) 70%,rgba(30,22,16,0.7) 100%)}
  .hero-content{position:relative;z-index:2;max-width:600px}
  .hero-label{font-size:11px;letter-spacing:0.36em;text-transform:uppercase;color:rgba(244,237,224,0.78);margin-bottom:2rem}
  .hero-title{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2.5rem,6vw,4rem);line-height:0.95;letter-spacing:-0.025em;margin-bottom:1rem}
  .hero-tag{font-family:'Fraunces',serif;font-style:italic;font-size:1.1rem;line-height:1.65;color:rgba(244,237,224,0.85);max-width:480px;margin:0 auto}
  .section{padding:4rem 2rem;max-width:900px;margin:0 auto;scroll-margin-top:80px}
  .section-label{font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#b16a48;margin-bottom:1.5rem}
  .section-title{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2rem,4vw,3rem);line-height:1.05;margin-bottom:1.5rem}
  .section-body{font-size:1rem;line-height:1.75;color:#4a4036;max-width:580px}
  .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.75rem;margin-top:2rem}
  .cta{display:inline-flex;padding:1rem 2rem;border:1px solid rgba(244,237,224,0.45);color:#2c2620;text-decoration:none;font-size:12px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;border-radius:999px;background:#faf5ec;margin-top:2rem}
  .contact{background:#e3d5c1;padding:4rem 2rem;text-align:center;scroll-margin-top:80px}
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:800px;margin:0 auto}
  .contact-item{font-family:'Fraunces',serif;font-size:0.95rem;color:#4a4036}
  .contact-label{font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#7a6e60;margin-bottom:0.5rem}
  footer{background:#2c2620;color:#f4ede0;padding:3rem 2rem;text-align:center;font-size:0.875rem}
  a{color:#b16a48;text-decoration:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;${navBgStyle(b, 'background:linear-gradient(180deg,rgba(44,38,32,0.92) 0%,rgba(44,38,32,0.85) 100%);')}backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(244,237,224,0.15);box-shadow:0 4px 24px rgba(0,0,0,0.15)}
  .topbar-inner{max-width:1200px;margin:0 auto;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}
  .topbar-logo{font-family:'Fraunces',serif;font-size:1.2rem;color:#f4ede0;text-decoration:none;letter-spacing:0.01em}
  .topbar-nav{display:flex;gap:2rem}
  .topbar-nav a{font-family:'Inter',sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(244,237,224,0.85);text-decoration:none;transition:color 0.3s;font-weight:500}
  .topbar-nav a:hover{color:#e8b988}
  .reviews-wrap{background:rgba(244,237,224,0.5);padding:4rem 2rem;text-align:center;scroll-margin-top:80px}
  .reviews-stars{font-size:2rem;color:#b16a48;letter-spacing:0.2em;margin:1rem 0}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(177,106,72,0.3);border-radius:3px}::-webkit-scrollbar-track{background:transparent}</style></head><body>
  <nav class="topbar">
    <div class="topbar-inner">
      <a href="#top" class="topbar-logo">${escapeHtml(b.name)}</a>
      <div class="topbar-nav">
        <a href="#about">About</a>
        <a href="#gallery">Gallery</a>
        <a href="#products">Products</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>
  <div id="top"></div>
  <div class="hero" style="margin-top:60px">
    ${b.profileImage ? `<img src="${b.profileImage}" alt="${escapeHtml(b.name)}">` : '<div style="position:absolute;inset:0;background:linear-gradient(135deg,#8a9a87,#5d6e5a)"></div>'}
    <div class="hero-veil"></div>
    <div class="hero-content">
      <div class="hero-label">${escapeHtml(b.category)} · ${escapeHtml(b.city)}</div>
      <h1 class="hero-title">${escapeHtml(b.name)}</h1>
      <p class="hero-tag">${escapeHtml(b.description.substring(0, 150))}</p>
      <a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}" class="cta">Contact →</a>
    </div>
  </div>

  <section id="about" class="section">
    <div class="section-label">— About —</div>
    <h2 class="section-title">Welcome to ${escapeHtml(b.name)}</h2>
    <p class="section-body">${escapeHtml(b.description)}</p>
    <p class="section-body" style="margin-top:1rem;">Located in the heart of ${escapeHtml(b.city)}, ${escapeHtml(b.state)}, we are committed to delivering quality and excellence in every interaction. Our team brings together years of expertise in ${escapeHtml(b.category.toLowerCase())}, ensuring you receive attentive service and reliable solutions tailored to your needs.</p>
  </section>

  ${images.length > 0 ? `
  <section id="gallery" class="section">
    <div class="section-label">— Gallery —</div>
    <h2 class="section-title">Moments & Spaces</h2>
    <div class="gallery">${galleryHtml}</div>
  </section>` : ''}

  ${productsHtml}

  <section id="reviews" class="reviews-wrap">
    <div class="section-label">— Reviews —</div>
    <h2 class="section-title">What People Say</h2>
    <div class="reviews-stars">${starsHtml(b.rating)}</div>
    <div style="font-family:'Fraunces',serif;font-size:1.5rem;color:#2c2620;">${b.rating.toFixed(1)} / 5.0</div>
    <div style="font-size:0.9rem;color:#7a6e60;margin-top:0.5rem;">Based on ${b.reviewCount} verified reviews</div>
    <div style="max-width:600px;margin:2rem auto 0;display:grid;gap:1rem;">
      <div style="background:#faf5ec;padding:1.5rem;border-radius:12px;border-left:3px solid #b16a48;"><div style="color:#b16a48;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="font-family:'Fraunces',serif;font-style:italic;color:#4a4036;">"Excellent service and quality. Highly recommend to anyone in ${escapeHtml(b.city)}."</div><div style="font-size:0.75rem;color:#7a6e60;margin-top:0.5rem;">— Verified Customer</div></div>
      <div style="background:#faf5ec;padding:1.5rem;border-radius:12px;border-left:3px solid #b16a48;"><div style="color:#b16a48;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="font-family:'Fraunces',serif;font-style:italic;color:#4a4036;">"Professional, reliable, and friendly. Will definitely visit again."</div><div style="font-size:0.75rem;color:#7a6e60;margin-top:0.5rem;">— Happy Customer</div></div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="section-label">— Visit Us —</div>
    <h2 class="section-title" style="font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2rem,4vw,3rem);line-height:1.05;margin-bottom:1.5rem;">Get in Touch</h2>
    <div class="contact-grid">
      <div class="contact-item"><div class="contact-label">Address</div>${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</div>
      <div class="contact-item"><div class="contact-label">Phone</div><a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}">${b.phone}</a></div>
      ${b.email ? `<div class="contact-item"><div class="contact-label">Email</div><a target="_blank" rel="noopener noreferrer" href="mailto:${b.email}">${b.email}</a></div>` : ''}
      ${b.whatsapp ? `<div class="contact-item"><div class="contact-label">WhatsApp</div><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}">${b.whatsapp}</a></div>` : ''}
    </div>
  </section>

  <footer>© ${new Date().getFullYear()} ${escapeHtml(b.name)} · ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</footer>
${NAV_INTERCEPTOR_SCRIPT}
</body></html>`
}

function generateJungleGold(b: BusinessData, images: string[], products: any[], hours: any): string {
  const galleryHtml = images.slice(0, 8).map((url, i) =>
    `<div style="border:1px solid rgba(201,162,39,0.15);padding:0.5rem;">
      <div style="aspect-ratio:4/3;overflow:hidden;margin-bottom:0.5rem;"><img src="${url}" alt="Pl. ${i+1}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.8) contrast(1.1);"></div>
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:0.75rem;color:#C9A227;">Pl. ${String(i+1).padStart(2,'0')}</div>
    </div>`
  ).join('')

  const productsHtml = products.length > 0 ? `
    <section id="products" class="section">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A227;margin-bottom:1.5rem;">— Products —</div>
      <h2 class="section-title">Our Catalogue</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.5rem;margin-top:2rem;">
        ${products.map(p => `
          <div style="border:1px solid rgba(201,162,39,0.15);padding:1.5rem;">
            <div style="aspect-ratio:4/3;overflow:hidden;margin-bottom:1rem;">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#0D2818;">📦</div>'}</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:1.25rem;color:#F5F5DC;">${escapeHtml(p.name)}</div>
            <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;color:#C9A227;margin-top:0.25rem;">${escapeHtml(p.price)}</div>
            ${p.details ? `<div style="font-size:0.8rem;color:#8FBC8F;margin-top:0.5rem;">${escapeHtml(p.details)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>` : ''

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(b.name)}</title><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"><style>
  *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{background:#05140A;color:#F5F5DC;font-family:'Inter',sans-serif;line-height:1.6;overflow-x:hidden}
  .hero{min-height:60vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:4rem 2rem;position:relative;overflow:hidden}
  .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.6) contrast(1.1) saturate(0.85)}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,20,10,0.85) 0%,rgba(5,20,10,0.4) 50%,rgba(5,20,10,0.9) 100%)}
  .hero-content{position:relative;z-index:2;text-align:center;max-width:700px}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A227;margin-bottom:1rem}
  .hero-title{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:clamp(3rem,8vw,6rem);line-height:0.85;letter-spacing:-0.04em;color:#F5F5DC}
  .hero-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.2rem;color:#C9A227;margin-top:1rem}
  .section{padding:3rem 2rem;max-width:900px;margin:0 auto;position:relative;z-index:2;scroll-margin-top:80px}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A227;margin-bottom:1rem}
  .section-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:400;color:#F5F5DC;margin-bottom:1.5rem}
  .section-body{font-family:'Cormorant Garamond',serif;font-size:1.1rem;line-height:1.65;color:#8FBC8F;max-width:600px}
  .gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:2rem}
  .divider{display:flex;align-items:center;justify-content:center;gap:1rem;padding:2rem;font-family:'Cormorant Garamond',serif;font-style:italic;color:#C9A227}
  .divider:before,.divider:after{content:'';width:4rem;height:1px;background:#C9A227;opacity:0.4}
  .contact{background:#0D2818;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:800px;margin:0 auto}
  .contact-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#C9A227;margin-bottom:0.5rem}
  .contact-val{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#F5F5DC}
  a{color:#C9A227;text-decoration:none}
  footer{background:#05140A;padding:2rem;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.25em;color:rgba(245,245,220,0.4);text-transform:uppercase}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;${navBgStyle(b, 'background:linear-gradient(180deg,rgba(5,20,10,0.92) 0%,rgba(5,20,10,0.85) 100%);')}backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,162,39,0.25);box-shadow:0 4px 24px rgba(0,0,0,0.4)}
  .topbar-inner{max-width:1200px;margin:0 auto;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}
  .topbar-logo{font-family:'Cormorant Garamond',serif;font-size:1.3rem;color:#F5F5DC;text-decoration:none;font-weight:600}
  .topbar-nav{display:flex;gap:2rem}
  .topbar-nav a{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,245,220,0.75);text-decoration:none;transition:color 0.3s}
  .topbar-nav a:hover{color:#C9A227}
  .reviews-wrap{background:#0D2818;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .reviews-stars{font-size:2rem;color:#C9A227;letter-spacing:0.2em;margin:1rem 0}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(201,162,39,0.3);border-radius:3px}::-webkit-scrollbar-track{background:transparent}</style></head><body>
  <nav class="topbar">
    <div class="topbar-inner">
      <a href="#top" class="topbar-logo">${escapeHtml(b.name)}</a>
      <div class="topbar-nav">
        <a href="#about">Preface</a>
        <a href="#gallery">Gallery</a>
        <a href="#products">Catalogue</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>
  <div id="top"></div>
  <div class="hero" style="margin-top:60px">
    ${b.profileImage ? `<img src="${b.profileImage}" alt="${escapeHtml(b.name)}">` : '<div style="position:absolute;inset:0;background:#0D2818"></div>'}
    <div class="hero-veil"></div>
    <div class="hero-content">
      <div class="eyebrow">— ${escapeHtml(b.category)} —</div>
      <h1 class="hero-title">${escapeHtml(b.name)}</h1>
      <div class="hero-sub">${escapeHtml(b.city)}, ${escapeHtml(b.state)}</div>
    </div>
  </div>

  <div class="divider">I — Preface</div>

  <section id="about" class="section">
    <div class="section-label">— About —</div>
    <h2 class="section-title">${escapeHtml(b.name)}</h2>
    <p class="section-body">${escapeHtml(b.description)}</p>
    <p class="section-body" style="margin-top:1rem;">Nestled in ${escapeHtml(b.city)}, ${escapeHtml(b.state)}, ${escapeHtml(b.name)} embodies a quiet commitment to craft and care. Every detail, from our offerings to our service, has been considered with you in mind. We invite you to experience the difference.</p>
  </section>

  ${images.length > 0 ? `<div class="divider">II — Gallery</div><section id="gallery" class="section"><div class="gallery-grid">${galleryHtml}</div></section>` : ''}

  ${productsHtml ? `<div class="divider">III — Products</div>${productsHtml}` : ''}

  <div class="divider">IV — Reviews</div>
  <section id="reviews" class="reviews-wrap">
    <div class="section-label">— Testimonials —</div>
    <h2 class="section-title">Words of Kindness</h2>
    <div class="reviews-stars">${starsHtml(b.rating)}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:#F5F5DC;">${b.rating.toFixed(1)} / 5.0</div>
    <div style="font-size:0.9rem;color:#8FBC8F;margin-top:0.5rem;">From ${b.reviewCount} cherished patrons</div>
    <div style="max-width:600px;margin:2rem auto 0;display:grid;gap:1rem;">
      <div style="border:1px solid rgba(201,162,39,0.2);padding:1.5rem;"><div style="color:#C9A227;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="font-family:'Cormorant Garamond',serif;font-style:italic;color:#F5F5DC;">"An extraordinary experience. The craftsmanship is unparalleled."</div><div style="font-size:0.75rem;color:#8FBC8F;margin-top:0.5rem;">— A Cherished Patron</div></div>
      <div style="border:1px solid rgba(201,162,39,0.2);padding:1.5rem;"><div style="color:#C9A227;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="font-family:'Cormorant Garamond',serif;font-style:italic;color:#F5F5DC;">"Refined, attentive, and timeless. A true hidden gem."</div><div style="font-size:0.75rem;color:#8FBC8F;margin-top:0.5rem;">— Returning Visitor</div></div>
    </div>
  </section>

  <div class="divider">V — Contact</div>
  <section id="contact" class="contact">
    <div class="contact-grid">
      <div><div class="contact-label">Address</div><div class="contact-val">${escapeHtml(b.address)}, ${escapeHtml(b.city)}</div></div>
      <div><div class="contact-label">Phone</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}">${b.phone}</a></div></div>
      ${b.email ? `<div><div class="contact-label">Email</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="mailto:${b.email}">${b.email}</a></div></div>` : ''}
      ${b.whatsapp ? `<div><div class="contact-label">WhatsApp</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}">${b.whatsapp}</a></div></div>` : ''}
    </div>
  </section>
  <footer>— ${escapeHtml(b.name)} · ${new Date().getFullYear()} —</footer>
${NAV_INTERCEPTOR_SCRIPT}
</body></html>`
}

function generateAthleticBold(b: BusinessData, images: string[], products: any[], hours: any): string {
  const galleryHtml = images.slice(0, 6).map((url, i) =>
    `<div style="aspect-ratio:1;overflow:hidden;border:1px solid #1f1f1f;"><img src="${url}" alt="Gallery ${i+1}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(100%) contrast(1.3) brightness(0.7);transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></div>`
  ).join('')

  const productsHtml = products.length > 0 ? `
    <section id="products" class="section">
      <div style="display:inline-block;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#000;background:#FF5400;padding:0.5rem 1rem;margin-bottom:2rem;font-weight:700;">/ Products</div>
      <h2 class="section-title">GEAR & EQUIPMENT</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:2rem;">
        ${products.map(p => `
          <div style="background:#141414;border:2px solid rgba(255,84,0,0.25);border-radius:8px;overflow:hidden;">
            <div style="aspect-ratio:1;overflow:hidden;">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(80%) contrast(1.2);">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#141414;">📦</div>'}</div>
            <div style="padding:1rem;">
              <div style="font-family:'Oswald',sans-serif;font-weight:600;text-transform:uppercase;font-size:0.875rem;color:#f5f5f5;">${escapeHtml(p.name)}</div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:#FF5400;margin-top:0.25rem;">${escapeHtml(p.price)}</div>
              ${p.details ? `<div style="font-size:0.75rem;color:#6a6a6a;margin-top:0.25rem;">${escapeHtml(p.details)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>` : ''

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(b.name)}</title><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"><style>
  *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{background:#0a0a0a;color:#f5f5f5;font-family:'Oswald',sans-serif;overflow-x:hidden}
  .hero{min-height:60vh;display:flex;flex-direction:column;justify-content:flex-end;padding:4rem 2rem;position:relative;overflow:hidden}
  .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(100%) contrast(1.4) brightness(0.5)}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,10,0.9) 0%,rgba(10,10,10,0.4) 40%,rgba(10,10,10,0.9) 100%)}
  .hero-content{position:relative;z-index:2;max-width:800px}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5400;margin-bottom:1rem}
  .hero-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,10vw,7rem);line-height:0.85;letter-spacing:-0.01em;text-transform:uppercase;color:#f5f5f5}
  .hero-sub{font-family:'Oswald',sans-serif;font-size:1rem;color:#c0c0c0;margin-top:0.5rem;text-transform:uppercase;letter-spacing:0.1em}
  .section{padding:3rem 2rem;max-width:900px;margin:0 auto;scroll-margin-top:80px}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5400;margin-bottom:1rem;display:flex;align-items:center;gap:0.75rem}
  .section-label:before{content:'';width:32px;height:1px;background:#FF5400}
  .section-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,5vw,4rem);line-height:0.9;color:#f5f5f5;margin-bottom:1rem;text-transform:uppercase}
  .section-body{font-family:'Oswald',sans-serif;font-size:1rem;line-height:1.75;color:#c0c0c0;max-width:600px;font-weight:300}
  .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin-top:2rem}
  .cta{display:inline-block;background:#FF5400;color:#000;padding:1rem 2rem;font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:0.05em;text-transform:uppercase;border:none;cursor:pointer;text-decoration:none;margin-top:1.5rem}
  .contact{background:#050505;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:800px;margin:0 auto}
  .contact-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#FF5400;margin-bottom:0.5rem}
  .contact-val{font-family:'Oswald',sans-serif;font-size:1rem;color:#f5f5f5}
  a{color:#FF5400;text-decoration:none}
  footer{background:#050505;padding:2rem;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.15em;color:#555;text-transform:uppercase}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;${navBgStyle(b, 'background:linear-gradient(180deg,rgba(10,10,10,0.92) 0%,rgba(10,10,10,0.85) 100%);')}backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,84,0,0.25);box-shadow:0 4px 24px rgba(0,0,0,0.5)}
  .topbar-inner{max-width:1200px;margin:0 auto;padding:0.8rem 2rem;display:flex;align-items:center;justify-content:space-between}
  .topbar-logo{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:#f5f5f5;text-decoration:none;letter-spacing:0.02em;text-transform:uppercase}
  .topbar-nav{display:flex;gap:2rem}
  .topbar-nav a{font-family:'Oswald',sans-serif;font-size:0.75rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(245,245,245,0.75);text-decoration:none;transition:color 0.3s;font-weight:500}
  .topbar-nav a:hover{color:#FF5400}
  .reviews-wrap{background:#141414;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .reviews-stars{font-size:2rem;color:#FF5400;letter-spacing:0.2em;margin:1rem 0}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(255,84,0,0.4);border-radius:3px}::-webkit-scrollbar-track{background:#0a0a0a}</style></head><body>
  <nav class="topbar">
    <div class="topbar-inner">
      <a href="#top" class="topbar-logo">${escapeHtml(b.name)}</a>
      <div class="topbar-nav">
        <a href="#about">Programs</a>
        <a href="#gallery">Gallery</a>
        <a href="#products">Products</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>
  <div id="top"></div>
  <div class="hero" style="margin-top:50px">
    ${b.profileImage ? `<img src="${b.profileImage}" alt="${escapeHtml(b.name)}">` : '<div style="position:absolute;inset:0;background:#141414"></div>'}
    <div class="hero-veil"></div>
    <div class="hero-content">
      <div class="eyebrow">/ ${escapeHtml(b.category).toUpperCase()} /</div>
      <h1 class="hero-title">${escapeHtml(b.name)}</h1>
      <div class="hero-sub">${b.city.toUpperCase()} · ${b.state.toUpperCase()}</div>
      <a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}" class="cta">Book Now →</a>
    </div>
  </div>

  <section id="about" class="section">
    <div class="section-label">/ About</div>
    <h2 class="section-title">BUILT BY DISCIPLINE</h2>
    <p class="section-body">${escapeHtml(b.description)}</p>
    <p class="section-body" style="margin-top:1rem;">Located at ${escapeHtml(b.address)}, ${escapeHtml(b.city)}, we push limits every day. No shortcuts. No excuses. Just relentless focus on quality, performance, and results. This is where champions are made.</p>
  </section>

  ${images.length > 0 ? `<section id="gallery" class="section"><div class="section-label">/ Gallery</div><h2 class="section-title">IN ACTION</h2><div class="gallery">${galleryHtml}</div></section>` : ''}

  ${productsHtml}

  <section id="reviews" class="reviews-wrap">
    <div class="section-label">/ Reviews</div>
    <h2 class="section-title">REAL TALK</h2>
    <div class="reviews-stars">${starsHtml(b.rating)}</div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:3rem;color:#FF5400;">${b.rating.toFixed(1)}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#6a6a6a;margin-top:0.5rem;">FROM ${b.reviewCount} ATHLETES</div>
    <div style="max-width:600px;margin:2rem auto 0;display:grid;gap:1rem;">
      <div style="background:#0a0a0a;border-left:4px solid #FF5400;padding:1.5rem;text-align:left;"><div style="color:#FF5400;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="font-family:'Oswald',sans-serif;color:#f5f5f5;font-weight:300;">"This place changed my life. The energy is unmatched."</div><div style="font-size:0.7rem;color:#6a6a6a;margin-top:0.5rem;font-family:'JetBrains Mono',monospace;">— VERIFIED ATHLETE</div></div>
      <div style="background:#0a0a0a;border-left:4px solid #FF5400;padding:1.5rem;text-align:left;"><div style="color:#FF5400;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="font-family:'Oswald',sans-serif;color:#f5f5f5;font-weight:300;">"Best decision I ever made. Coaches know their stuff."</div><div style="font-size:0.7rem;color:#6a6a6a;margin-top:0.5rem;font-family:'JetBrains Mono',monospace;">— VERIFIED MEMBER</div></div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="section-label">/ Get in Touch</div>
    <h2 class="section-title">JOIN THE MOVEMENT</h2>
    <div class="contact-grid" style="margin-top:2rem;">
      <div><div class="contact-label">/ Location</div><div class="contact-val">${escapeHtml(b.address)}, ${escapeHtml(b.city)}</div></div>
      <div><div class="contact-label">/ Phone</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}">${b.phone}</a></div></div>
      ${b.email ? `<div><div class="contact-label">/ Email</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="mailto:${b.email}">${b.email}</a></div></div>` : ''}
      ${b.whatsapp ? `<div><div class="contact-label">/ WhatsApp</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}">${b.whatsapp}</a></div></div>` : ''}
    </div>
  </section>
  <footer>© ${new Date().getFullYear()} ${escapeHtml(b.name).toUpperCase()} · ALL RIGHTS RESERVED</footer>
${NAV_INTERCEPTOR_SCRIPT}
</body></html>`
}

function generateTechLime(b: BusinessData, images: string[], products: any[], hours: any): string {
  const galleryHtml = images.slice(0, 6).map((url, i) =>
    `<div style="aspect-ratio:1;overflow:hidden;border-radius:12px;background:#1a1d28;border:1px solid rgba(240,235,225,0.08);"><img src="${url}" alt="Image ${i+1}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.5) saturate(0.8);transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></div>`
  ).join('')

  const productsHtml = products.length > 0 ? `
    <section id="products" class="section">
      <div class="section-label">02 — Products</div>
      <h2 class="section-title">Catalog</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:2rem;">
        ${products.map(p => `
          <div style="background:#1a1d28;border:1px solid rgba(212,255,58,0.2);border-radius:12px;overflow:hidden;transition:border-color 0.3s;" onmouseover="this.style.borderColor='rgba(212,255,58,0.5)'" onmouseout="this.style.borderColor='rgba(212,255,58,0.2)'">
            <div style="aspect-ratio:1;overflow:hidden;position:relative;">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#1a1d28;">📦</div>'}<div style="position:absolute;top:8px;right:8px;padding:4px 8px;font-family:monospace;font-size:10px;font-weight:700;color:#0d0e14;background:#d4ff3a;border-radius:4px;">${escapeHtml(p.price)}</div></div>
            <div style="padding:1rem;">
              <div style="font-weight:600;font-size:0.875rem;color:#f0ebe1;">${escapeHtml(p.name)}</div>
              ${p.details ? `<div style="font-size:0.75rem;color:#6b6d7a;margin-top:0.25rem;">${escapeHtml(p.details)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>` : ''

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(b.name)}</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"><style>
  *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{background:#0d0e14;color:#f0ebe1;font-family:'Space Grotesk',sans-serif;overflow-x:hidden;line-height:1.5}
  .hero{min-height:60vh;display:flex;flex-direction:column;justify-content:center;padding:4rem 2rem;position:relative;overflow:hidden}
  .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.5) saturate(0.8)}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(135deg,rgba(13,14,20,0.9) 0%,rgba(13,14,20,0.3) 50%,rgba(13,14,20,0.8) 100%)}
  .hero-content{position:relative;z-index:2;max-width:800px}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#d4ff3a;margin-bottom:1rem;display:inline-flex;align-items:center;gap:0.5rem}
  .eyebrow:before{content:'';width:7px;height:7px;background:#d4ff3a;border-radius:50%;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .hero-title{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(2.5rem,6vw,5rem);line-height:0.95;letter-spacing:-0.02em;color:#f0ebe1}
  .hero-sub{font-size:1.1rem;color:#a8a496;margin-top:1rem;max-width:500px}
  .btn{display:inline-block;background:#d4ff3a;color:#0d0e14;padding:0.875rem 1.5rem;border-radius:10px;font-weight:600;text-decoration:none;margin-top:1.5rem;font-size:0.875rem;transition:transform 0.25s}
  .btn:hover{transform:translateY(-3px);box-shadow:0 14px 40px -8px rgba(212,255,58,0.5)}
  .section{padding:3rem 2rem;max-width:900px;margin:0 auto;scroll-margin-top:80px}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#d4ff3a;margin-bottom:1rem;display:flex;align-items:center;gap:0.75rem}
  .section-label:before{content:'';width:36px;height:1px;background:#d4ff3a}
  .section-title{font-size:clamp(1.8rem,4vw,3rem);font-weight:700;letter-spacing:-0.02em;color:#f0ebe1;margin-bottom:1rem}
  .section-body{font-size:1rem;line-height:1.65;color:#a8a496;max-width:600px}
  .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.75rem;margin-top:2rem}
  .contact{background:#15171f;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:800px;margin:0 auto}
  .contact-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#d4ff3a;margin-bottom:0.5rem}
  .contact-val{font-size:1rem;color:#f0ebe1}
  a{color:#d4ff3a;text-decoration:none}
  footer{background:#15171f;padding:2rem;text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;color:#6b6d7a}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;${navBgStyle(b, 'background:linear-gradient(180deg,rgba(13,14,20,0.92) 0%,rgba(13,14,20,0.85) 100%);')}backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(212,255,58,0.15);box-shadow:0 4px 24px rgba(0,0,0,0.4)}
  .topbar-inner{max-width:1200px;margin:0 auto;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}
  .topbar-logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.2rem;color:#f0ebe1;text-decoration:none;display:flex;align-items:center;gap:8px}
  .topbar-logo-mark{width:26px;height:26px;background:#d4ff3a;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:#0d0e14;font-size:14px;font-weight:900;transform:rotate(-8deg)}
  .topbar-nav{display:flex;gap:2rem}
  .topbar-nav a{font-size:14px;color:#a8a496;text-decoration:none;transition:color 0.2s;font-weight:500}
  .topbar-nav a:hover{color:#d4ff3a}
  .reviews-wrap{background:#15171f;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .reviews-stars{font-size:2rem;color:#d4ff3a;letter-spacing:0.2em;margin:1rem 0}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(212,255,58,0.4);border-radius:3px}::-webkit-scrollbar-track{background:#0d0e14}</style></head><body>
  <nav class="topbar">
    <div class="topbar-inner">
      <a href="#top" class="topbar-logo"><span class="topbar-logo-mark">${escapeHtml(b.name.charAt(0))}</span>${escapeHtml(b.name)}</a>
      <div class="topbar-nav">
        <a href="#about">About</a>
        <a href="#gallery">Gallery</a>
        <a href="#products">Products</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>
  <div id="top"></div>
  <div class="hero" style="margin-top:60px">
    ${b.profileImage ? `<img src="${b.profileImage}" alt="${escapeHtml(b.name)}">` : '<div style="position:absolute;inset:0;background:#1a1d28"></div>'}
    <div class="hero-veil"></div>
    <div class="hero-content">
      <div class="eyebrow">// ${escapeHtml(b.category)}</div>
      <h1 class="hero-title">${escapeHtml(b.name)}</h1>
      <p class="hero-sub">${escapeHtml(b.description.substring(0, 120))}</p>
      <a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}" class="btn">Get Best Price →</a>
    </div>
  </div>

  <section id="about" class="section">
    <div class="section-label">01 — About</div>
    <h2 class="section-title">About ${escapeHtml(b.name)}</h2>
    <p class="section-body">${escapeHtml(b.description)}</p>
    <p class="section-body" style="margin-top:1rem;">Based in ${escapeHtml(b.city)}, ${escapeHtml(b.state)}, we leverage modern tools and a customer-first approach to deliver exceptional ${escapeHtml(b.category.toLowerCase())} solutions. Every project we take on is built with precision, transparency, and long-term reliability in mind.</p>
  </section>

  ${images.length > 0 ? `<section id="gallery" class="section"><div class="section-label">02 — Gallery</div><h2 class="section-title">Showcase</h2><div class="gallery">${galleryHtml}</div></section>` : ''}

  ${productsHtml}

  <section id="reviews" class="reviews-wrap">
    <div class="section-label">03 — Reviews</div>
    <h2 class="section-title">Customer Feedback</h2>
    <div class="reviews-stars">${starsHtml(b.rating)}</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:2.5rem;font-weight:700;color:#d4ff3a;">${b.rating.toFixed(1)}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#6b6d7a;margin-top:0.5rem;">// ${b.reviewCount} VERIFIED REVIEWS</div>
    <div style="max-width:600px;margin:2rem auto 0;display:grid;gap:1rem;">
      <div style="background:#1a1d28;border:1px solid rgba(212,255,58,0.15);padding:1.5rem;border-radius:12px;text-align:left;"><div style="color:#d4ff3a;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="color:#f0ebe1;">"Outstanding work. The team delivered exactly what they promised, on time."</div><div style="font-size:0.75rem;color:#6b6d7a;margin-top:0.5rem;font-family:'JetBrains Mono',monospace;">// VERIFIED CUSTOMER</div></div>
      <div style="background:#1a1d28;border:1px solid rgba(212,255,58,0.15);padding:1.5rem;border-radius:12px;text-align:left;"><div style="color:#d4ff3a;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="color:#f0ebe1;">"Modern approach, fair pricing, and quick response. Highly recommended."</div><div style="font-size:0.75rem;color:#6b6d7a;margin-top:0.5rem;font-family:'JetBrains Mono',monospace;">// VERIFIED CUSTOMER</div></div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="section-label">04 — Get in Touch</div>
    <h2 class="section-title">Contact Us</h2>
    <div class="contact-grid" style="margin-top:2rem;">
      <div><div class="contact-label">// Address</div><div class="contact-val">${escapeHtml(b.address)}, ${escapeHtml(b.city)}</div></div>
      <div><div class="contact-label">// Phone</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}">${b.phone}</a></div></div>
      ${b.email ? `<div><div class="contact-label">// Email</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="mailto:${b.email}">${b.email}</a></div></div>` : ''}
      ${b.whatsapp ? `<div><div class="contact-label">// WhatsApp</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}">${b.whatsapp}</a></div></div>` : ''}
    </div>
  </section>
  <footer>© ${new Date().getFullYear()} ${escapeHtml(b.name)} · Made with precision</footer>
${NAV_INTERCEPTOR_SCRIPT}
</body></html>`
}

function generateJournalismRed(b: BusinessData, images: string[], products: any[], hours: any): string {
  const galleryHtml = images.slice(0, 8).map((url, i) =>
    `<div style="width:180px;height:180px;flex-shrink:0;overflow:hidden;background:#111111;border:1px solid rgba(255,42,42,0.15);"><img src="${url}" alt="Frame ${i+1}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.6) saturate(0.7);transition:transform 0.5s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></div>`
  ).join('')

  const productsHtml = products.length > 0 ? `
    <section id="products" class="section">
      <div class="section-label">/ 02 — Products</div>
      <h2 class="section-title">Picks</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:2rem;">
        ${products.map(p => `
          <div style="background:#111111;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
            <div style="aspect-ratio:1;overflow:hidden;position:relative;">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#111111;">📦</div>'}<div style="position:absolute;bottom:0;left:0;right:0;padding:4px 8px;font-family:monospace;font-size:10px;font-weight:700;color:#000;background:#ff2a2a;">${escapeHtml(p.price)}</div></div>
            <div style="padding:1rem;">
              <div style="font-weight:700;font-size:0.875rem;text-transform:uppercase;color:#f5f5f5;">${escapeHtml(p.name)}</div>
              ${p.details ? `<div style="font-size:0.75rem;color:#555;margin-top:0.25rem;">${escapeHtml(p.details)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>` : ''

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(b.name)}</title><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"><style>
  *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{background:#080808;color:#f5f5f5;font-family:'Space Grotesk',sans-serif;overflow-x:hidden}
  .hero{min-height:60vh;display:flex;flex-direction:column;justify-content:flex-end;padding:4rem 2rem;position:relative;overflow:hidden}
  .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.6) contrast(1.1) saturate(0.7)}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.85) 0%,rgba(8,8,8,0.2) 50%,rgba(8,8,8,0.95) 100%)}
  .hero-content{position:relative;z-index:2;max-width:900px}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#ff2a2a;margin-bottom:1rem;display:inline-flex;align-items:center;gap:0.5rem}
  .eyebrow:before{content:'';width:8px;height:8px;border-radius:50%;background:#ff2a2a;animation:live-pulse 1.8s infinite}
  @keyframes live-pulse{0%{box-shadow:0 0 0 0 rgba(255,42,42,0.7)}70%{box-shadow:0 0 0 14px rgba(255,42,42,0)}100%{box-shadow:0 0 0 0 rgba(255,42,42,0)}}
  .hero-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(2.5rem,7vw,6rem);line-height:0.92;letter-spacing:-0.035em;color:#f5f5f5;text-transform:uppercase}
  .hero-sub{font-family:'JetBrains Mono',monospace;font-size:0.875rem;color:#ff2a2a;margin-top:0.75rem;text-transform:uppercase;letter-spacing:0.1em}
  .btn{display:inline-flex;background:#ff2a2a;color:#000;padding:0.875rem 1.5rem;font-weight:700;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.04em;text-decoration:none;margin-top:1.5rem;border:1px solid #ff2a2a;transition:all 0.25s}
  .btn:hover{background:#f5f5f5;border-color:#f5f5f5;transform:translate(-2px,-2px);box-shadow:4px 4px 0 #ff2a2a}
  .section{padding:3rem 2rem;max-width:900px;margin:0 auto;scroll-margin-top:80px}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#ff2a2a;margin-bottom:1rem;display:inline-flex;align-items:center;gap:0.75rem}
  .section-label:before{content:'';width:36px;height:1px;background:#ff2a2a}
  .section-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(2rem,5vw,4rem);line-height:1;letter-spacing:-0.025em;color:#f5f5f5;margin-bottom:1rem;text-transform:uppercase}
  .section-body{font-size:1rem;line-height:1.75;color:#888888;max-width:600px}
  .gallery-strip{display:flex;gap:0.5rem;overflow-x:auto;padding-bottom:0.5rem;margin-top:2rem}
  .contact{background:#111111;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:800px;margin:0 auto}
  .contact-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#ff2a2a;margin-bottom:0.5rem}
  .contact-val{font-size:1rem;color:#f5f5f5}
  a{color:#ff2a2a;text-decoration:none}
  footer{background:#080808;padding:2rem;text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.15em}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;${navBgStyle(b, 'background:linear-gradient(180deg,rgba(8,8,8,0.92) 0%,rgba(8,8,8,0.85) 100%);')}backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,42,42,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.5)}
  .topbar-inner{max-width:1400px;margin:0 auto;padding:0.9rem 2rem;display:flex;align-items:center;justify-content:space-between}
  .topbar-logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:1.1rem;color:#f5f5f5;text-decoration:none;display:flex;align-items:center;gap:10px;text-transform:uppercase;letter-spacing:-0.02em}
  .topbar-logo-mark{width:32px;height:32px;background:#ff2a2a;display:inline-flex;align-items:center;justify-content:center;color:#000;font-size:16px;font-weight:900}
  .topbar-nav{display:flex;gap:2rem}
  .topbar-nav a{font-size:13px;font-weight:500;color:#aaa;text-decoration:none;transition:color 0.2s;text-transform:uppercase;letter-spacing:0.02em}
  .topbar-nav a:hover{color:#ff2a2a}
  .reviews-wrap{background:#0f0f0f;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
  .reviews-stars{font-size:2rem;color:#ff2a2a;letter-spacing:0.2em;margin:1rem 0}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:rgba(255,42,42,0.4);border-radius:3px}::-webkit-scrollbar-track{background:#080808}</style></head><body>
  <nav class="topbar">
    <div class="topbar-inner">
      <a href="#top" class="topbar-logo"><span class="topbar-logo-mark">${escapeHtml(b.name.charAt(0))}</span>${escapeHtml(b.name)}</a>
      <div class="topbar-nav">
        <a href="#about">About</a>
        <a href="#gallery">Gallery</a>
        <a href="#products">Picks</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>
  <div id="top"></div>
  <div class="hero" style="margin-top:55px">
    ${b.profileImage ? `<img src="${b.profileImage}" alt="${escapeHtml(b.name)}">` : '<div style="position:absolute;inset:0;background:#111111"></div>'}
    <div class="hero-veil"></div>
    <div class="hero-content">
      <div class="eyebrow">NEW · ${escapeHtml(b.category).toUpperCase()}</div>
      <h1 class="hero-title">${escapeHtml(b.name)}</h1>
      <div class="hero-sub">${b.city.toUpperCase()} · EST. ${new Date().getFullYear()}</div>
      <a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}" class="btn">Read More →</a>
    </div>
  </div>

  <section id="about" class="section">
    <div class="section-label">/ 01 — About</div>
    <h2 class="section-title">${escapeHtml(b.name)}</h2>
    <p class="section-body">${escapeHtml(b.description)}</p>
    <p class="section-body" style="margin-top:1rem;">Operating from ${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.name)} has built a reputation for honesty, speed, and substance. We don't make empty promises — we deliver results that you can see, measure, and trust.</p>
  </section>

  ${images.length > 0 ? `<section id="gallery" class="section"><div class="section-label">/ Gallery</div><h2 class="section-title">Frames</h2><div class="gallery-strip">${galleryHtml}</div></section>` : ''}

  ${productsHtml}

  <section id="reviews" class="reviews-wrap">
    <div class="section-label">/ 03 — Reviews</div>
    <h2 class="section-title">Voices</h2>
    <div class="reviews-stars">${starsHtml(b.rating)}</div>
    <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:3rem;font-weight:800;color:#ff2a2a;">${b.rating.toFixed(1)}</div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:#555;margin-top:0.5rem;text-transform:uppercase;">${b.reviewCount} VERIFIED VOICES</div>
    <div style="max-width:600px;margin:2rem auto 0;display:grid;gap:1rem;">
      <div style="background:#111111;border:1px solid rgba(255,42,42,0.2);padding:1.5rem;text-align:left;"><div style="color:#ff2a2a;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="color:#f5f5f5;">"Real, honest, and reliable. They told me exactly what to expect — and delivered more."</div><div style="font-size:0.7rem;color:#555;margin-top:0.5rem;font-family:'JetBrains Mono',monospace;">— VERIFIED CUSTOMER</div></div>
      <div style="background:#111111;border:1px solid rgba(255,42,42,0.2);padding:1.5rem;text-align:left;"><div style="color:#ff2a2a;font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="color:#f5f5f5;">"Quick, clean, and professional. Would recommend to anyone in ${escapeHtml(b.city)}."</div><div style="font-size:0.7rem;color:#555;margin-top:0.5rem;font-family:'JetBrains Mono',monospace;">— VERIFIED CUSTOMER</div></div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="section-label">/ 04 — Get in Touch</div>
    <h2 class="section-title">Reach Out</h2>
    <div class="contact-grid" style="margin-top:2rem;">
      <div><div class="contact-label">/ Location</div><div class="contact-val">${escapeHtml(b.address)}, ${escapeHtml(b.city)}</div></div>
      <div><div class="contact-label">/ Phone</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}">${b.phone}</a></div></div>
      ${b.email ? `<div><div class="contact-label">/ Email</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="mailto:${b.email}">${b.email}</a></div></div>` : ''}
      ${b.whatsapp ? `<div><div class="contact-label">/ WhatsApp</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}">${b.whatsapp}</a></div></div>` : ''}
    </div>
  </section>
  <footer>© ${new Date().getFullYear()} ${escapeHtml(b.name).toUpperCase()} · ALL RIGHTS RESERVED</footer>
${NAV_INTERCEPTOR_SCRIPT}
</body></html>`
}

function generateDefault(b: BusinessData, images: string[], products: any[], hours: any): string {
  const galleryHtml = images.slice(0, 8).map((url, i) =>
    '<div style="aspect-ratio:1;overflow:hidden;border-radius:8px;"><img src="' + url + '" alt="Gallery ' + (i + 1) + '" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s;" onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'scale(1)\'"></div>'
  ).join('')

  const productsHtml = products.length > 0 ? `
    <section id="products" class="section">
      <div class="section-label">Products & Services</div>
      <h2 class="section-title">Our Offerings</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;margin-top:1.5rem;">
        ${products.map(p => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <div style="aspect-ratio:1;overflow:hidden;">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#f9fafb;">\u{1F4E6}</div>'}</div>
            <div style="padding:0.75rem;">
              <div style="font-weight:600;font-size:0.875rem;color:#1a1a1a;">${escapeHtml(p.name)}</div>
              <div style="font-size:0.875rem;font-weight:600;color:${b.themeColor || '#0d9488'};margin-top:0.25rem;">${escapeHtml(p.price)}</div>
              ${p.details ? `<div style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">${escapeHtml(p.details)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>` : ''

  const accent = b.themeColor || '#0d9488'
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(b.name)}</title><style>
    *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;color:#1a1a1a;line-height:1.6;overflow-x:hidden}
    .hero{min-height:50vh;display:flex;flex-direction:column;justify-content:center;padding:4rem 2rem;position:relative;overflow:hidden;color:#fff}
    .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.7)}
    .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.5) 0%,transparent 50%,rgba(0,0,0,0.5) 100%)}
    .hero-content{position:relative;z-index:2;max-width:700px}
    .hero-label{font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.9;margin-bottom:1rem}
    .hero-title{font-size:clamp(2rem,5vw,3.5rem);font-weight:700;line-height:1.1;margin-bottom:1rem}
    .hero-sub{font-size:1rem;opacity:0.9;max-width:500px}
    .btn{display:inline-block;background:${accent};color:#fff;padding:0.875rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:600;margin-top:1.5rem}
    .section{padding:3rem 2rem;max-width:900px;margin:0 auto;scroll-margin-top:80px}
    .section-label{font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;color:${accent};margin-bottom:0.5rem;font-weight:600}
    .section-title{font-size:1.875rem;font-weight:700;margin-bottom:1rem}
    .section-body{font-size:1rem;line-height:1.75;color:#4b5563;max-width:600px}
    .gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin-top:1.5rem}
    .contact{background:#f9fafb;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
    .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;max-width:800px;margin:0 auto}
    .contact-label{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#9ca3af;margin-bottom:0.5rem;font-weight:600}
    .contact-val{font-size:0.95rem;color:#1a1a1a}
    a{color:${accent};text-decoration:none}
    footer{background:#1a1a1a;color:#9ca3af;padding:2rem;text-align:center;font-size:0.8rem}
    .topbar{position:fixed;top:0;left:0;right:0;z-index:100;${navBgStyle(b, 'background:linear-gradient(180deg,rgba(26,26,26,0.92) 0%,rgba(26,26,26,0.85) 100%);')}backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.1);box-shadow:0 4px 24px rgba(0,0,0,0.15)}
    .topbar-inner{max-width:1200px;margin:0 auto;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}
    .topbar-logo{font-size:1.2rem;font-weight:700;color:#fff;text-decoration:none}
    .topbar-nav{display:flex;gap:2rem}
    .topbar-nav a{font-size:0.85rem;color:rgba(255,255,255,0.8);text-decoration:none;transition:color 0.2s;font-weight:500}
    .topbar-nav a:hover{color:${accent}}
    .reviews-wrap{background:#f9fafb;padding:3rem 2rem;text-align:center;scroll-margin-top:80px}
    .reviews-stars{font-size:2rem;color:${accent};letter-spacing:0.2em;margin:1rem 0}
  ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:${accent}66;border-radius:3px}::-webkit-scrollbar-track{background:transparent}</style></head><body>
    <nav class="topbar">
      <div class="topbar-inner">
        <a href="#top" class="topbar-logo">${escapeHtml(b.name)}</a>
        <div class="topbar-nav">
          <a href="#about">About</a>
          <a href="#gallery">Gallery</a>
          <a href="#products">Products</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </nav>
    <div id="top"></div>
    <div class="hero" style="margin-top:60px">
      ${b.profileImage ? `<img src="${b.profileImage}" alt="${escapeHtml(b.name)}">` : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${accent},${accent}cc)"></div>`}
      <div class="hero-veil"></div>
      <div class="hero-content">
        <div class="hero-label">${escapeHtml(b.category)} \u00b7 ${escapeHtml(b.city)}</div>
        <h1 class="hero-title">${escapeHtml(b.name)}</h1>
        <p class="hero-sub">${escapeHtml(b.description.substring(0, 150))}</p>
        <a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}" class="btn">Get Best Price</a>
      </div>
    </div>
    <section id="about" class="section">
      <div class="section-label">About</div>
      <h2 class="section-title">${escapeHtml(b.name)}</h2>
      <p class="section-body">${escapeHtml(b.description)}</p>
      <p class="section-body" style="margin-top:1rem;">We are located at ${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.state)}. Our commitment to quality and customer satisfaction has made us a trusted name in ${escapeHtml(b.category.toLowerCase())}. Visit us today and experience the difference.</p>
    </section>
    ${images.length > 0 ? `<section id="gallery" class="section"><div class="section-label">Gallery</div><h2 class="section-title">Photo Gallery</h2><div class="gallery">${galleryHtml}</div></section>` : ''}
    ${productsHtml}
    <section id="reviews" class="reviews-wrap">
      <div class="section-label">Reviews</div>
      <h2 class="section-title">What Our Customers Say</h2>
      <div class="reviews-stars">${starsHtml(b.rating)}</div>
      <div style="font-size:2rem;font-weight:700;color:${accent};">${b.rating.toFixed(1)} / 5.0</div>
      <div style="font-size:0.875rem;color:#6b7280;margin-top:0.5rem;">Based on ${b.reviewCount} reviews</div>
      <div style="max-width:600px;margin:2rem auto 0;display:grid;gap:1rem;">
        <div style="background:#fff;padding:1.5rem;border-radius:8px;border:1px solid #e5e7eb;text-align:left;"><div style="color:${accent};font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="color:#1a1a1a;">"Great experience! Highly recommend ${escapeHtml(b.name)} to everyone in ${escapeHtml(b.city)}."</div><div style="font-size:0.75rem;color:#6b7280;margin-top:0.5rem;">— Verified Customer</div></div>
        <div style="background:#fff;padding:1.5rem;border-radius:8px;border:1px solid #e5e7eb;text-align:left;"><div style="color:${accent};font-size:1rem;margin-bottom:0.5rem;">★★★★★</div><div style="color:#1a1a1a;">"Professional service and quality products. Will definitely come back."</div><div style="font-size:0.75rem;color:#6b7280;margin-top:0.5rem;">— Happy Customer</div></div>
      </div>
    </section>
    <section id="contact" class="contact">
      <div class="section-label">Contact</div>
      <h2 class="section-title">Get in Touch</h2>
      <div class="contact-grid" style="margin-top:1.5rem;">
        <div><div class="contact-label">Address</div><div class="contact-val">${escapeHtml(b.address)}, ${escapeHtml(b.city)}, ${escapeHtml(b.state)}</div></div>
        <div><div class="contact-label">Phone</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="tel:${b.phone}">${b.phone}</a></div></div>
        ${b.email ? `<div><div class="contact-label">Email</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="mailto:${b.email}">${b.email}</a></div></div>` : ''}
        ${b.whatsapp ? `<div><div class="contact-label">WhatsApp</div><div class="contact-val"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}">${b.whatsapp}</a></div></div>` : ''}
      </div>
    </section>
    <footer>\u00a9 ${new Date().getFullYear()} ${escapeHtml(b.name)}</footer>
  ${NAV_INTERCEPTOR_SCRIPT}
</body></html>`
}
