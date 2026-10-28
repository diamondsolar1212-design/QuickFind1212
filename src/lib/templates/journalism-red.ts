// journalism-red — a cinematic tech-editorial layout inspired by the KILBURN
// reference. Section accent switching, scan-line hero, filterable gallery,
// price-slider product picks and a typewriter newsletter field.

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
  reviewCountOf,
  secondaryCta,
  siteLinkHtml,
  starsHtml,
  telHref,
  truncate,
  waHref,
} from './shared'

function priceNumber(value: unknown): number {
  const match = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

export function generateJournalismRed(
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const name = escapeHtml(b.name || 'Your Business')
  const category = escapeHtml(b.category || 'Studio')
  const city = escapeHtml(b.city || '')
  const state = escapeHtml(b.state || '')
  const description = String(b.description || '')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const hero = heroImage(b, images)
  const hasProducts = products.length > 0
  const location = escapeHtml(listText([b.city, b.state], ', '))
  const primary = primaryCta(b, 'Contact')
  const secondary = secondaryCta(b, 'See the visuals', '#gallery')
  const links = customLinks(b)

  const galleryTiles = (() => {
    const cats = ['spaces', 'craft', 'people']
    const tiles: string[] = []
    const total = Math.max(4, Math.min(8, images.length || 4))
    for (let i = 0; i < total; i += 1) {
      const url = images[i] || ''
      const cat = cats[i % cats.length]
      tiles.push(`<figure class="visual reveal" data-cat="${cat}" style="transition-delay:${i * 45}ms">
        <div class="visual-thumb">
          ${url ? `<img src="${escapeHtml(url)}" alt="${name} — visual ${i + 1}" loading="lazy">` : `<div class="visual-empty"><span>${i === 0 ? escapeHtml(initials(b.name)) : '▣'}</span></div>`}
          <span class="preview-tag"><span class="preview-dot"></span>Frame ${String(i + 1).padStart(2, '0')}</span>
          <span class="visual-scan"></span>
        </div>
        <figcaption><span>${cat.toUpperCase()}</span><span>${city || category}</span></figcaption>
      </figure>`)
    }
    return tiles.join('')
  })()

  const numericPrices = products.map((p) => priceNumber(p.price)).filter((n) => n > 0)
  const sliderMax = numericPrices.length > 0
    ? Math.max(100, Math.ceil(Math.max(...numericPrices) / 500) * 500)
    : 0

  const productsHtml = hasProducts ? `
  <section class="section" id="products" data-accent="red">
    <div class="section-head reveal">
      <span class="section-label">03 — Picks</span>
      <h2>Worth <em>your money.</em></h2>
      <p class="section-kicker">The shortlist — tested, compared and kept on the shelf.</p>
    </div>
    ${sliderMax > 0 ? `
    <div class="price-panel reveal">
      <div class="price-head">
        <span class="section-label" style="margin:0">Budget</span>
        <span class="price-value" id="priceValue">₹${sliderMax.toLocaleString('en-IN')}</span>
      </div>
      <input class="price-slider" id="priceRange" type="range" min="0" max="${sliderMax}" step="100" value="${sliderMax}" aria-label="Maximum price">
      <div class="price-foot"><span>₹0</span><span id="priceCount">${products.length} of ${products.length} shown</span><span>₹${sliderMax.toLocaleString('en-IN')}</span></div>
    </div>` : ''}
    <div class="picks" id="picks">
      ${products.slice(0, 8).map((p, i) => {
        const price = priceNumber(p.price)
        return `<article class="pick reveal" data-product data-price="${price}" style="transition-delay:${i * 50}ms">
          <div class="pick-media">${productMediaHtml(p, '#151515')}
            <span class="pick-no">/ ${String(i + 1).padStart(2, '0')}</span>
          </div>
          <div class="pick-body">
            <div class="pick-top">
              <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
              ${p.price ? `<span class="pick-price">${escapeHtml(String(p.price))}</span>` : ''}
            </div>
            ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
            <a class="pick-link" href="${escapeHtml(telHref(b.phone))}">Enquire →</a>
          </div>
        </article>`
      }).join('')}
    </div>
  </section>` : ''

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `An independent ${category.toLowerCase()} in ${city}.`
  const rest = bodyParagraphs.slice(1)

  const hoursHtml = hours.length > 0
    ? `<ul class="hours">${hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>`
    : `<p class="dim">Hours on request.</p>`

  const css = `
  @property --section-accent{syntax:'<color>';inherits:true;initial-value:#ff2a2a}
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#080808;--elev:#111111;--ink:#f5f5f5;--dim:#888888;--mute:#555555;--red:#ff2a2a;--yellow:#e5ff00;--blue:#2b6fff;--line:rgba(255,255,255,.08);--line2:rgba(255,255,255,.18);--section-accent:#ff2a2a}
  [data-accent="red"]{--section-accent:#ff2a2a}
  [data-accent="yellow"]{--section-accent:#e5ff00}
  [data-accent="blue"]{--section-accent:#2b6fff}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--ink);font-family:'Space Grotesk',sans-serif;line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:--section-accent .7s ease}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  ::selection{background:var(--red);color:#000}
  .display{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;letter-spacing:-.035em;line-height:.94;font-variation-settings:'wdth' 92}
  .mono{font-family:'JetBrains Mono',monospace}
  .reveal{opacity:0;transform:translateY(26px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .progress{position:fixed;top:0;left:0;height:2px;width:0;background:var(--section-accent);z-index:120;transition:background-color .5s}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;transition:background .35s,border-color .35s}
  .topbar.scrolled{background:rgba(8,8,8,.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
  .topbar-inner{max-width:1500px;margin:0 auto;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:24px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-mark{width:38px;height:38px;background:var(--section-accent);color:#000;display:flex;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:1.15rem;transition:background-color .5s}
  .brand-text{display:flex;flex-direction:column;line-height:1}
  .brand-text strong{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:-.02em}
  .brand-text span{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.24em;text-transform:uppercase;color:var(--dim);margin-top:4px}
  .navlinks{display:flex;align-items:center;gap:26px}
  .navlinks a{font-size:12px;font-weight:500;color:var(--dim);transition:color .25s;display:flex;align-items:center;gap:6px}
  .navlinks a i{font-style:normal;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--mute)}
  .navlinks a:hover{color:var(--ink)}
  .nav-cta{background:var(--section-accent);color:#000!important;padding:9px 18px;font-family:'JetBrains Mono',monospace;font-size:10px!important;letter-spacing:.12em;text-transform:uppercase;font-weight:700;transition:transform .25s,background-color .5s}
  .nav-cta:hover{transform:translateY(-2px)}
  .nav-cta i{display:none}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:23px;height:2px;background:var(--ink);transition:transform .3s}
  .hero{padding:108px 28px 0;max-width:1500px;margin:0 auto}
  .hero-meta-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:14px}
  .hero-meta-top .live{display:flex;align-items:center;gap:8px;color:var(--ink)}
  .live-dot{width:7px;height:7px;background:var(--red);border-radius:50%;box-shadow:0 0 0 0 rgba(255,42,42,.55);animation:pulse 2s infinite;transition:background .5s}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,42,42,.55)}70%{box-shadow:0 0 0 13px rgba(255,42,42,0)}100%{box-shadow:0 0 0 0 rgba(255,42,42,0)}}
  .hero-meta-top .stats-mini{display:flex;gap:20px}
  .hero-meta-top .stats-mini b{color:var(--ink);font-weight:500}
  .cine{position:relative;aspect-ratio:16/8.4;min-height:360px;overflow:hidden;background:#000;isolation:isolate;cursor:pointer}
  .cine > img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.4,0,.2,1),filter .4s;filter:brightness(.82) saturate(.9)}
  .cine:hover > img{filter:brightness(1) saturate(1.1);animation:cinePan 14s ease-in-out infinite alternate}
  @keyframes cinePan{0%{transform:scale(1.03) translate(0,0)}100%{transform:scale(1.12) translate(-2.4%,-1.4%)}}
  .cine-fallback{position:absolute;inset:0;background:radial-gradient(circle at 30% 25%,#1d1d1d,#080808 70%)}
  .cine-fallback span{position:absolute;right:4%;bottom:4%;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(8rem,22vw,20rem);line-height:.7;color:rgba(255,42,42,.08)}
  .cine-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,.5) 0%,transparent 40%,rgba(8,8,8,.9) 100%),linear-gradient(90deg,rgba(8,8,8,.65),transparent 65%)}
  .scan{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s;z-index:3}
  .cine:hover .scan{opacity:1}
  .scan::before{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,var(--red),transparent);box-shadow:0 0 14px var(--red);animation:scanLine 3.2s linear infinite}
  @keyframes scanLine{0%{top:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}}
  .cine-top{position:absolute;top:0;left:0;right:0;z-index:4;padding:20px 26px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
  .tag-row{display:flex;gap:8px;flex-wrap:wrap}
  .tag{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:5px 9px;border:1px solid rgba(255,255,255,.28);color:rgba(255,255,255,.86);background:rgba(0,0,0,.3);backdrop-filter:blur(6px)}
  .tag.hot{background:var(--red);color:#000;border-color:var(--red);font-weight:700}
  .cine-time{font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,.65);letter-spacing:.1em}
  .cine-body{position:absolute;left:0;right:0;bottom:0;z-index:4;padding:34px 32px}
  .cine-kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--red);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .cine-kicker::before{content:'';width:28px;height:1px;background:currentColor}
  .cine-body h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(2.6rem,6.6vw,5.6rem);line-height:.9;letter-spacing:-.04em;max-width:18ch;text-wrap:balance;text-shadow:0 8px 60px rgba(0,0,0,.45)}
  .cine-body p{color:rgba(255,255,255,.74);font-size:clamp(.95rem,1.6vw,1.1rem);max-width:56ch;margin-top:16px}
  .cine-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
  .btn{display:inline-flex;align-items:center;gap:9px;padding:12px 24px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;transition:transform .25s,background .25s,color .25s,border-color .25s,box-shadow .25s}
  .btn:hover{transform:translate(-2px,-2px)}
  .btn-solid{background:var(--section-accent);color:#000;border:1px solid var(--section-accent)}
  .btn-solid:hover{box-shadow:4px 4px 0 rgba(255,42,42,.35)}
  .btn-ghost{border:1px solid rgba(255,255,255,.3);color:var(--ink);background:rgba(0,0,0,.25)}
  .btn-ghost:hover{border-color:var(--ink);background:var(--ink);color:#000}
  .marquee{overflow:hidden;white-space:nowrap;border-block:1px solid var(--line);background:#000;margin-top:16px}
  .marquee-track{display:inline-flex;animation:marquee 34s linear infinite;padding:14px 0}
  .marquee-track span{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(1.5rem,3vw,2.2rem);letter-spacing:-.02em;padding:0 24px;color:var(--ink)}
  .marquee-track span::after{content:'✳';color:var(--red);font-size:.6em;margin-left:24px;vertical-align:middle}
  @keyframes marquee{to{transform:translateX(-50%)}}
  .section{max-width:1500px;margin:0 auto;padding:100px 28px;scroll-margin-top:80px;position:relative}
  .section-head{margin-bottom:42px;max-width:900px}
  .section-label{display:inline-flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--section-accent);margin-bottom:14px;transition:color .6s}
  .section-label::before{content:'';width:30px;height:1px;background:currentColor}
  .section-head h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(2.4rem,5.2vw,4.4rem);line-height:.94;letter-spacing:-.035em}
  .section-head h2 em{font-style:italic;font-family:'Fraunces',serif;font-weight:400;color:var(--section-accent);transition:color .6s}
  .section-kicker{color:var(--dim);font-size:15px;margin-top:14px;max-width:52ch}
  .article{display:grid;grid-template-columns:minmax(0,.42fr) minmax(0,1.58fr);gap:56px;align-items:start}
  .article-aside{position:sticky;top:110px;border-top:2px solid var(--section-accent);padding-top:16px;transition:border-color .6s}
  .article-aside h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(2rem,3.6vw,3rem);line-height:.95;letter-spacing:-.03em}
  .article-aside h2 em{font-family:'Fraunces',serif;font-style:italic;font-weight:400;color:var(--section-accent);display:block;transition:color .6s}
  .article-aside p{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-top:14px}
  .article-body{font-size:1.06rem;line-height:1.8;color:#cfcfcf;max-width:70ch}
  .article-body p{margin-bottom:1.4rem}
  .dropcap::first-letter{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:5.4rem;float:left;line-height:.8;padding:10px 12px 0 0;color:var(--section-accent);transition:color .6s}
  .pullquote{border-left:3px solid var(--section-accent);padding:6px 0 6px 24px;font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:clamp(1.4rem,2.6vw,1.9rem);line-height:1.35;letter-spacing:-.02em;color:var(--ink);margin:34px 0}
  .article-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;margin-top:30px;border-top:1px solid var(--line);padding-top:22px}
  .article-stats span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);margin-bottom:4px}
  .article-stats strong{font-family:'Bricolage Grotesque',sans-serif;font-size:1.5rem;font-weight:800;letter-spacing:-.02em}
  .filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
  .filter-chip{position:relative;padding:9px 16px;border:1px solid var(--line2);background:rgba(255,255,255,.02);color:var(--dim);font-size:12px;font-weight:500;letter-spacing:.02em;cursor:pointer;transition:.25s;font-family:'Space Grotesk',sans-serif}
  .filter-chip:hover{border-color:var(--ink);color:var(--ink)}
  .filter-chip.active{background:var(--ink);color:#000;border-color:var(--ink)}
  .filter-chip span{font-family:'JetBrains Mono',monospace;font-size:9px;opacity:.55;margin-left:4px}
  .visuals{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .visual{transition:opacity .4s,transform .4s}
  .visual.hidden{opacity:.08;transform:scale(.97);pointer-events:none}
  .visual-thumb{position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--elev)}
  .visual-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1),filter .4s;filter:brightness(.88)}
  .visual:hover .visual-thumb img{animation:visualPan 7s ease-in-out infinite alternate}
  @keyframes visualPan{0%{transform:scale(1.06) translate(0,0);filter:brightness(.92)}100%{transform:scale(1.14) translate(-2%,-2%);filter:brightness(1.05)}}
  .visual-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#1a1a1a,#0d0d0d)}
  .visual-empty span{font-family:'Bricolage Grotesque',sans-serif;font-size:2.2rem;color:rgba(255,42,42,.35)}
  .visual-thumb::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.6),transparent 55%);z-index:1;pointer-events:none}
  .preview-tag{position:absolute;top:12px;left:12px;z-index:3;background:var(--section-accent);color:#000;padding:4px 8px;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.1em;display:flex;align-items:center;gap:6px;opacity:0;transform:translateY(-4px);transition:.3s;text-transform:uppercase}
  .visual:hover .preview-tag{opacity:1;transform:none}
  .preview-dot{width:5px;height:5px;background:#000;border-radius:50%;animation:blink .6s steps(2) infinite}
  @keyframes blink{50%{opacity:0}}
  .visual-scan{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0}
  .visual:hover .visual-scan{opacity:1}
  .visual-scan::before{content:'';position:absolute;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,var(--section-accent),transparent);animation:scanLine 3s linear infinite}
  .visual figcaption{display:flex;justify-content:space-between;gap:10px;margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
  .price-panel{background:var(--elev);border:1px solid var(--line);padding:22px 26px;margin-bottom:28px;max-width:840px}
  .price-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .price-value{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:1.6rem;letter-spacing:-.02em;color:var(--yellow)}
  .price-slider{-webkit-appearance:none;appearance:none;width:100%;height:5px;background:rgba(255,255,255,.1);outline:none}
  .price-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;background:var(--yellow);cursor:grab;border:3px solid #000;box-shadow:0 0 0 1px var(--yellow),0 0 24px rgba(229,255,0,.45)}
  .price-slider::-webkit-slider-thumb:active{cursor:grabbing}
  .price-slider::-moz-range-thumb{width:18px;height:18px;background:var(--yellow);cursor:grab;border:3px solid #000;box-shadow:0 0 0 1px var(--yellow)}
  .price-foot{display:flex;justify-content:space-between;gap:12px;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
  .picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
  .pick{background:var(--elev);border:1px solid var(--line);transition:transform .4s cubic-bezier(.2,.7,.2,1),border-color .3s,opacity .3s,filter .3s}
  .pick:hover{transform:translateY(-5px);border-color:var(--yellow)}
  .pick.filtered{opacity:.12;filter:grayscale(1);pointer-events:none}
  .pick-media{position:relative;aspect-ratio:16/11;overflow:hidden;background:#151515}
  .pick-media img{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
  .pick:hover .pick-media img{transform:scale(1.05)}
  .pick-no{position:absolute;top:12px;left:12px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(--yellow);background:rgba(0,0,0,.55);border:1px solid rgba(229,255,0,.3);padding:3px 7px}
  .pick-body{padding:18px 20px 22px}
  .pick-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
  .pick h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:1.15rem;letter-spacing:-.02em;line-height:1.25}
  .pick-price{font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--yellow);white-space:nowrap}
  .pick p{color:var(--dim);font-size:.8rem;margin-top:8px;line-height:1.6}
  .pick-link{display:inline-block;margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--section-accent);border-bottom:1px solid currentColor;padding-bottom:2px}
  .verdict{display:grid;grid-template-columns:minmax(0,.55fr) minmax(0,1.45fr);gap:40px;align-items:start;border-top:2px solid var(--section-accent);padding-top:34px;transition:border-color .6s}
  .verdict-score .stars{color:var(--section-accent);letter-spacing:.12em;font-size:1.05rem;transition:color .6s}
  .verdict-score .stars .off{opacity:.22}
  .verdict-score strong{display:block;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(3.4rem,7vw,5.4rem);line-height:.85;letter-spacing:-.04em;margin:10px 0 4px}
  .verdict-score strong small{font-size:.26em;color:var(--dim);font-weight:500;letter-spacing:0}
  .verdict-score span{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
  .verdict-quotes{display:grid;gap:12px}
  .verdict-quote{border-left:2px solid var(--line2);padding:4px 0 4px 20px}
  .verdict-quote p{color:#d4d4d4;font-size:1rem;line-height:1.7}
  .verdict-quote span{display:block;margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
  .newsletter{border-block:1px solid var(--line);background:#050505}
  .newsletter-inner{max-width:1500px;margin:0 auto;padding:84px 28px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:48px;align-items:end}
  .newsletter h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(2.4rem,5vw,4rem);line-height:.94;letter-spacing:-.035em}
  .newsletter h2 em{font-family:'Fraunces',serif;font-style:italic;font-weight:400;color:var(--section-accent);transition:color .6s}
  .newsletter p{color:var(--dim);margin-top:14px;max-width:44ch}
  .newsletter-form{display:flex;gap:12px;align-items:flex-end}
  .newsletter-input{flex:1;background:transparent;border:0;border-bottom:2px solid var(--line2);padding:14px 0;color:var(--ink);font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:1.2rem;outline:none;transition:border-color .3s;letter-spacing:-.02em;min-width:0}
  .newsletter-input:focus{border-color:var(--section-accent)}
  .newsletter-input::placeholder{color:var(--mute)}
  .newsletter-status{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--yellow);margin-top:12px;min-height:14px}
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}
  .contact-card{background:var(--bg);padding:26px 24px}
  .contact-card span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--section-accent);margin-bottom:8px;transition:color .6s}
  .contact-card a,.contact-card p{font-size:.96rem;color:var(--ink);word-break:break-word}
  .contact-card a:hover{color:var(--section-accent)}
  .hours{list-style:none;font-size:.8rem;color:var(--dim)}
  .hours li{display:flex;justify-content:space-between;gap:16px;padding:2px 0}
  .dim{color:var(--dim);font-size:.82rem}
  footer{border-top:1px solid var(--line);padding:24px 28px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--mute)}
  .to-top{position:fixed;bottom:22px;right:22px;width:46px;height:46px;background:var(--elev);border:1px solid var(--line2);color:var(--ink);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:.3s;z-index:80;cursor:pointer;font-size:16px}
  .to-top.show{opacity:1;pointer-events:auto}
  .to-top:hover{background:var(--section-accent);color:#000;border-color:var(--section-accent)}
  @media(max-width:1000px){
    .article{grid-template-columns:1fr;gap:32px}
    .article-aside{position:static}
    .visuals{grid-template-columns:repeat(2,1fr)}
    .verdict{grid-template-columns:1fr;gap:28px}
    .newsletter-inner{grid-template-columns:1fr;gap:28px;align-items:start}
  }
  @media(max-width:760px){
    .topbar-inner{padding:12px 18px}
    .burger{display:flex}
    .navlinks{position:fixed;top:64px;left:14px;right:14px;flex-direction:column;align-items:flex-start;gap:2px;background:rgba(8,8,8,.98);border:1px solid var(--line);padding:12px 18px;opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{padding:9px 0;width:100%}
    .nav-cta{justify-content:center;display:flex;margin-top:6px}
    .hero{padding:96px 18px 0}
    .cine{aspect-ratio:4/5;min-height:480px}
    .cine-body{padding:24px 20px}
    .section{padding:72px 18px}
    .visuals{grid-template-columns:1fr}
    .newsletter-inner{padding:64px 18px}
    .newsletter-form{flex-direction:column;align-items:stretch;gap:16px}
    footer{padding:22px 18px}
    .hero-meta-top .stats-mini{display:none}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
  }
  `

  return `${documentHead(b.name || 'Business', 'family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,700;12..96,800&family=Space+Grotesk:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,400&family=JetBrains+Mono:wght@400;700', css + HERO_RAIL_STYLES)}
  ${GRAIN_OVERLAY}
  <div class="progress" id="progress" aria-hidden="true"></div>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="#top"><span class="brand-mark">${escapeHtml(initials(b.name))}</span><span class="brand-text"><strong>${name}</strong><span>${category} · ${city || 'India'}</span></span></a>
      <nav class="navlinks">
        <a href="#about"><i>01</i>Story</a>
        <a href="#gallery"><i>02</i>Visuals</a>
        ${hasProducts ? '<a href="#products"><i>03</i>Picks</a>' : ''}
        <a href="#reviews"><i>04</i>Verdict</a>
        ${links.slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        <a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <main id="top">
    <div class="hero" data-accent="red">
      <div class="hero-meta-top">
        <span class="live"><span class="live-dot"></span>Featured · ${category}</span>
        <span>${city || 'India'}${state ? `, ${state}` : ''}${rating > 0 ? ` · ${rating.toFixed(1)} rated` : ''}</span>
        <div class="stats-mini"><span>PHOTOS <b>${images.length}</b></span><span>REVIEWS <b>${reviews}</b></span>${hasProducts ? `<span>PICKS <b>${products.length}</b></span>` : ''}</div>
      </div>
      <div class="cine reveal">
        ${hero ? `<img src="${escapeHtml(hero)}" alt="${name}">` : `<div class="cine-fallback"><span>${escapeHtml(initials(b.name))}</span></div>`}
        <div class="cine-veil"></div>
        <div class="scan"></div>
        <div class="cine-top">
          <div class="tag-row"><span class="tag hot">The feature</span><span class="tag">${category}</span><span class="tag">${images.length} images</span></div>
          <span class="cine-time">${city || 'Local'} · BusinessHub</span>
        </div>
        <div class="cine-body">
          <div class="cine-kicker">Independent review · ${new Date().getFullYear()}</div>
          <h1>${name}</h1>
          <p>${escapeHtml(truncate(description, 190))}</p>
          <div class="cine-actions">
            <a class="btn btn-solid" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
            <a class="btn btn-ghost" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
          </div>
        </div>
      </div>
    </div>

    ${heroRailHtml(images, b)}

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        ${[category, 'No filter', city || 'Local', 'Independent', 'Considered picks', category, 'No filter', city || 'Local', 'Independent', 'Considered picks'].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>

    <section class="section" id="about" data-accent="blue">
      <div class="article">
        <aside class="article-aside reveal">
          <span class="section-label">01 — Story</span>
          <h2>The short<em>version.</em></h2>
          <p>${category} · ${city || 'India'}</p>
        </aside>
        <div class="article-body reveal">
          <p class="dropcap">${escapeHtml(lede)}</p>
          ${rest.map((part) => `<p>${escapeHtml(part)}</p>`).join('')}
          <p>You will find us at ${escapeHtml(listText([b.address, b.city, b.state], ', '))}. We keep the offer focused, the service direct and the details considered — no noise, no upselling, just the work done well.</p>
          <blockquote class="pullquote">“Less marketing. More substance.”</blockquote>
          <div class="article-stats">
            <div><span>Rating</span><strong>${rating > 0 ? rating.toFixed(1) : 'New'}</strong></div>
            <div><span>Reviews</span><strong>${reviews}</strong></div>
            <div><span>Photos</span><strong>${images.length}</strong></div>
            ${hasProducts ? `<div><span>Picks</span><strong>${products.length}</strong></div>` : ''}
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="gallery" data-accent="yellow">
      <div class="section-head reveal">
        <span class="section-label">02 — Visuals</span>
        <h2>Filed under <em>proof.</em></h2>
        <p class="section-kicker">The space, the work and the people behind it.</p>
      </div>
      <div class="filters reveal">
        <button class="filter-chip active" data-filter="all">All <span>${Math.max(images.length, 4)}</span></button>
        <button class="filter-chip" data-filter="spaces">Spaces</button>
        <button class="filter-chip" data-filter="craft">Craft</button>
        <button class="filter-chip" data-filter="people">People</button>
      </div>
      <div class="visuals" id="visuals">${galleryTiles}</div>
    </section>

    ${productsHtml}

    <section class="section" id="reviews" data-accent="red">
      <div class="section-head reveal">
        <span class="section-label">04 — Verdict</span>
        <h2>The final <em>word.</em></h2>
      </div>
      <div class="verdict">
        <div class="verdict-score reveal">
          <div class="stars">${starsHtml(rating)}</div>
          <strong>${rating > 0 ? rating.toFixed(1) : '—'}<small>/5</small></strong>
          <span>${reviews > 0 ? `${reviews} verified review${reviews === 1 ? '' : 's'}` : 'Newly listed'}</span>
        </div>
        <div class="verdict-quotes">
          <div class="verdict-quote reveal"><p>“Straightforward, high quality and genuinely enjoyable to deal with. The kind of place that earns a repeat visit.”</p><span>Verified customer — ${city || 'India'}</span></div>
          <div class="verdict-quote reveal" style="transition-delay:70ms"><p>“Everything you want and nothing you don't. Clear pricing, thoughtful service, no surprises.”</p><span>Returning customer — ${city || 'India'}</span></div>
        </div>
      </div>
    </section>

    <section class="newsletter" id="newsletter" data-accent="blue">
      <div class="newsletter-inner">
        <div class="reveal">
          <span class="section-label" style="color:var(--section-accent)">Stay in the loop</span>
          <h2>One good email<em>at a time.</em></h2>
          <p>New arrivals, seasonal notes and the occasional recommendation. No noise.</p>
        </div>
        <div class="reveal">
          <form class="newsletter-form" id="newsletterForm">
            <input class="newsletter-input" id="newsletterEmail" type="email" placeholder="you@example.com" aria-label="Email address" required>
            <button class="btn btn-solid" type="submit">Subscribe</button>
          </form>
          <div class="newsletter-status" id="newsletterStatus"></div>
        </div>
      </div>
    </section>

    <section class="section" id="contact" data-accent="red">
      <div class="section-head reveal">
        <span class="section-label">05 — Contact</span>
        <h2>Find us, <em>call us.</em></h2>
      </div>
      <div class="contact-grid reveal">
        <div class="contact-card"><span>Address</span><p>${escapeHtml(listText([b.address, b.city, b.state], ', ') || '—')}</p></div>
        <div class="contact-card"><span>Phone</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
        ${b.email ? `<div class="contact-card"><span>Email</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
        ${b.whatsapp ? `<div class="contact-card"><span>WhatsApp</span><a href="${escapeHtml(waHref(String(b.whatsapp)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
        <div class="contact-card"><span>Hours</span>${hoursHtml}</div>
        <div class="contact-card"><span>Directions</span><a href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Open in Maps →</a></div>
      </div>
    </section>
  </main>

  <footer>
    <span>© <span data-year>${new Date().getFullYear()}</span> ${name}</span>
    <span>${location || 'India'} · ${category}</span>
  </footer>

  <button class="to-top" data-to-top aria-label="Back to top">↑</button>

  <script>(function(){
    var bar=document.getElementById('progress');
    if(bar){window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(h>0?(window.scrollY/h)*100:0)+'%';},{passive:true});}
    var chips=[].slice.call(document.querySelectorAll('[data-filter]'));
    var visuals=[].slice.call(document.querySelectorAll('.visual'));
    chips.forEach(function(chip){
      chip.addEventListener('click',function(){
        chips.forEach(function(c){c.classList.remove('active');});
        chip.classList.add('active');
        var filter=chip.getAttribute('data-filter');
        visuals.forEach(function(item){
          var show=filter==='all'||item.getAttribute('data-cat')===filter;
          item.classList.toggle('hidden',!show);
        });
      });
    });
    var range=document.getElementById('priceRange');
    if(range){
      var valueEl=document.getElementById('priceValue');
      var countEl=document.getElementById('priceCount');
      var picks=[].slice.call(document.querySelectorAll('[data-product]'));
      function apply(){
        var max=Number(range.value);
        if(valueEl)valueEl.textContent='₹'+max.toLocaleString('en-IN');
        var shown=0;
        picks.forEach(function(card){
          var price=Number(card.getAttribute('data-price')||0);
          var show=!price||price<=max;
          card.classList.toggle('filtered',!show);
          if(show)shown++;
        });
        if(countEl)countEl.textContent=shown+' of '+picks.length+' shown';
      }
      range.addEventListener('input',apply);
      apply();
    }
    var input=document.getElementById('newsletterEmail');
    var form=document.getElementById('newsletterForm');
    if(input){
      var phrases=['you@example.com','your best email','hello@yourdomain.com'];
      var idx=0,pos=0,dir=1;
      function type(){
        var text=phrases[idx];
        pos+=dir;
        if(pos>text.length){dir=-1;setTimeout(type,1500);return;}
        if(pos<0){dir=1;idx=(idx+1)%phrases.length;pos=0;}
        if(document.activeElement!==input)input.setAttribute('placeholder',text.slice(0,pos));
        setTimeout(type,dir>0?80:28);
      }
      type();
    }
    if(form){
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var status=document.getElementById('newsletterStatus');
        if(status&&input)status.textContent='Thanks — we will write to '+(input.value||'you')+'.';
        if(input)input.value='';
      });
    }
  })();</script>
  ${UI_SCRIPT}
  ${HERO_RAIL_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
