// tech-lime — a dark, technical layout inspired by the AXIOMA reference.
// Lime-on-charcoal palette, live morphing SVG blob, readout panels, scroll
// progress bar and a click-to-expand gallery lightbox.

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

export function generateTechLime(
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const name = escapeHtml(b.name || 'Your Business')
  const rawName = String(b.name || 'Your Business').trim()
  const words = rawName.split(/\s+/)
  const lastName = words.pop() || rawName
  const firstNames = words.join(' ')
  const category = escapeHtml(b.category || 'Studio')
  const city = escapeHtml(b.city || '')
  const state = escapeHtml(b.state || '')
  const description = String(b.description || '')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const hero = heroImage(b, images)
  const hasProducts = products.length > 0
  const location = escapeHtml(listText([b.city, b.state], ', '))
  const primary = primaryCta(b, 'Connect')
  const secondary = secondaryCta(b, 'Explore the work', '#gallery')
  const links = customLinks(b)

  const galleryTiles = (() => {
    const tiles: string[] = []
    const total = Math.max(4, Math.min(8, images.length || 4))
    for (let i = 0; i < total; i += 1) {
      const url = images[i] || ''
      tiles.push(`<figure class="tile reveal" data-full="${escapeHtml(url)}" data-label="${escapeHtml(`${b.name || 'Business'} — ${String(i + 1).padStart(2, '0')}`)}" style="transition-delay:${i * 45}ms">
        ${url ? `<img src="${escapeHtml(url)}" alt="${name} — image ${i + 1}" loading="lazy">` : `<div class="tile-empty"><span>${i === 0 ? escapeHtml(initials(b.name)) : '◇'}</span></div>`}
        <div class="tile-overlay"><span class="tile-index">/${String(i + 1).padStart(2, '0')}</span><span class="tile-zoom">＋</span></div>
        <figcaption>${city || category}</figcaption>
      </figure>`)
    }
    return tiles.join('')
  })()

  const productsHtml = hasProducts ? `
  <section class="section" id="products">
    <div class="section-head reveal">
      <span class="kicker">03 / Catalog</span>
      <h2>Selected <em>output.</em></h2>
    </div>
    <div class="product-grid">
      ${products.slice(0, 8).map((p, i) => `
      <article class="product reveal" style="transition-delay:${i * 45}ms">
        <div class="product-media">${productMediaHtml(p, '#1a1d28', 'width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.7,.2,1);')}
          <span class="product-index">P.${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="product-body">
          <div class="product-line">
            <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
            ${p.price ? `<span class="product-price">${escapeHtml(String(p.price))}</span>` : ''}
          </div>
          ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </section>` : ''

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `A ${category.toLowerCase()} built on precision and care.`
  const rest = bodyParagraphs.slice(1)

  const hoursHtml = hours.length > 0
    ? hours.map((h) => `<div class="readout-row"><span>${escapeHtml(h.day)}</span><strong>${escapeHtml(h.value)}</strong></div>`).join('')
    : `<div class="readout-row"><span>Hours</span><strong>Call to confirm</strong></div>`

  const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#0d0e14;--elev:#15171f;--card:#1a1d28;--card2:#21242f;--ink:#f0ebe1;--dim:#a8a496;--mute:#6b6d7a;--lime:#d4ff3a;--mint:#4dd4ac;--amber:#ffb627;--line:rgba(240,235,225,.1);--line2:rgba(240,235,225,.2)}
  html{scroll-behavior:smooth}
  body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased;font-feature-settings:'ss01','ss02'}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  ::selection{background:var(--lime);color:var(--bg)}
  .mono{font-family:'JetBrains Mono',monospace}
  .grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(240,235,225,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(240,235,225,.03) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 0%,#000 30%,transparent 85%);-webkit-mask-image:radial-gradient(ellipse at 50% 0%,#000 30%,transparent 85%)}
  .atmosphere{position:fixed;inset:0;z-index:0;pointer-events:none}
  .atmosphere::before{content:'';position:absolute;top:-22%;left:-12%;width:60%;height:60%;background:radial-gradient(circle,rgba(212,255,58,.07),transparent 62%)}
  .atmosphere::after{content:'';position:absolute;bottom:-24%;right:-12%;width:54%;height:54%;background:radial-gradient(circle,rgba(77,212,172,.055),transparent 62%)}
  .progress{position:fixed;top:0;left:0;height:2px;width:0;background:linear-gradient(90deg,var(--lime),var(--mint));z-index:120;box-shadow:0 0 12px rgba(212,255,58,.55)}
  .reveal{opacity:0;transform:translateY(26px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;border-bottom:1px solid transparent;transition:background .35s,border-color .35s}
  .topbar.scrolled{background:rgba(13,14,20,.86);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom-color:var(--line)}
  .topbar-inner{max-width:1400px;margin:0 auto;padding:16px 30px;display:flex;align-items:center;justify-content:space-between;gap:24px}
  .brand{display:flex;align-items:center;gap:11px;font-family:'Fraunces',serif;font-weight:900;font-size:1.28rem;letter-spacing:-.02em}
  .brand-mark{width:32px;height:32px;background:var(--lime);color:var(--bg);display:flex;align-items:center;justify-content:center;border-radius:7px;font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:700;transform:rotate(-7deg)}
  .navlinks{display:flex;align-items:center;gap:26px}
  .navlinks a{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);transition:color .25s;display:flex;gap:7px;align-items:baseline}
  .navlinks a i{font-style:normal;color:var(--mute);font-size:9px}
  .navlinks a:hover{color:var(--lime)}
  .nav-cta{background:var(--lime);color:var(--bg)!important;padding:9px 18px;border-radius:999px;font-weight:600;transition:transform .25s,box-shadow .25s}
  .nav-cta:hover{transform:translateY(-2px);box-shadow:0 10px 30px -10px rgba(212,255,58,.6)}
  .nav-cta i{display:none}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:22px;height:2px;background:var(--ink);transition:transform .3s}
  .hero{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:150px 30px 70px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:48px;align-items:center;min-height:100svh}
  .badge{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--line2);border-radius:999px;padding:7px 14px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin-bottom:28px}
  .live-dot{width:7px;height:7px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 0 rgba(212,255,58,.6);animation:pulse 2s infinite}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(212,255,58,.55)}70%{box-shadow:0 0 0 12px rgba(212,255,58,0)}100%{box-shadow:0 0 0 0 rgba(212,255,58,0)}}
  .hero h1{font-family:'Fraunces',serif;font-weight:900;font-size:clamp(3rem,7.6vw,6.6rem);line-height:.92;letter-spacing:-.035em;text-wrap:balance}
  .hero h1 em{font-style:italic;font-weight:400;background:linear-gradient(120deg,var(--lime),var(--mint));-webkit-background-clip:text;background-clip:text;color:transparent}
  .hero-desc{color:var(--dim);font-size:1rem;line-height:1.75;max-width:48ch;margin-top:22px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
  .btn{display:inline-flex;align-items:center;gap:10px;padding:13px 24px;border-radius:10px;font-size:13px;font-weight:600;transition:transform .25s,box-shadow .25s,background .25s,border-color .25s}
  .btn:hover{transform:translateY(-2px)}
  .btn-solid{background:var(--lime);color:var(--bg)}
  .btn-solid:hover{box-shadow:0 14px 34px -14px rgba(212,255,58,.65)}
  .btn-ghost{border:1px solid var(--line2);color:var(--ink)}
  .btn-ghost:hover{border-color:var(--dim);background:var(--card)}
  .hero-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:30px}
  .hero-chips span{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;border:1px solid var(--line);padding:6px 10px;color:var(--mute);border-radius:6px}
  .hero-chips span b{color:var(--lime);font-weight:500}
  .canvas-card{background:linear-gradient(160deg,var(--card),var(--elev));border:1px solid var(--line);border-radius:20px;padding:18px;position:relative;overflow:hidden}
  .canvas-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--lime),transparent);opacity:.5}
  .canvas-head{display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);margin-bottom:8px}
  .canvas-head .live{display:flex;align-items:center;gap:7px;color:var(--lime)}
  .blob-wrap{position:relative;aspect-ratio:1;display:flex;align-items:center;justify-content:center}
  .blob-wrap svg{width:100%;height:100%;overflow:visible}
  .blob-hint{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
  .blob-hint strong{display:block;font-family:'Fraunces',serif;font-size:clamp(2rem,4.6vw,3.4rem);font-weight:600;letter-spacing:-.02em}
  .blob-hint span{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--dim)}
  .canvas-foot{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-top:8px}
  .canvas-foot div{background:var(--card2);padding:10px 12px}
  .canvas-foot span{display:block;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin-bottom:3px}
  .canvas-foot strong{font-size:.92rem;font-weight:500}
  .canvas-foot strong em{font-style:normal;color:var(--lime)}
  .stats{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:0 30px;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .stat{background:var(--elev);padding:26px 24px}
  .stat span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);margin-bottom:8px}
  .stat strong{font-family:'Fraunces',serif;font-size:clamp(2rem,3.4vw,2.8rem);font-weight:600;line-height:1;letter-spacing:-.02em}
  .stat strong em{font-style:normal;font-size:.35em;color:var(--lime);letter-spacing:0;margin-left:2px}
  .section{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:104px 30px;scroll-margin-top:80px}
  .section-head{margin-bottom:46px;max-width:760px}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--lime);margin-bottom:14px;display:block}
  .section-head h2{font-family:'Fraunces',serif;font-weight:600;font-size:clamp(2.4rem,5vw,4rem);line-height:1.02;letter-spacing:-.025em}
  .section-head h2 em{font-style:italic;font-weight:400;color:var(--lime)}
  .about-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:48px;align-items:start}
  .about-copy{color:var(--dim);font-size:.98rem;line-height:1.8}
  .about-copy p{margin-bottom:1.15rem}
  .about-copy .lead{color:var(--ink);font-size:1.1rem;line-height:1.7}
  .readouts{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .readouts-head{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);padding:14px 18px;border-bottom:1px solid var(--line);background:var(--card2)}
  .readout-row{display:flex;justify-content:space-between;gap:18px;padding:13px 18px;border-bottom:1px solid var(--line)}
  .readout-row:last-child{border-bottom:0}
  .readout-row span{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
  .readout-row strong{font-size:.9rem;font-weight:500;text-align:right}
  .readout-row strong em{font-style:normal;color:var(--lime)}
  .gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .tile{position:relative;aspect-ratio:1;overflow:hidden;border-radius:14px;background:var(--card);border:1px solid var(--line);cursor:zoom-in}
  .tile:nth-child(1){grid-column:span 2;grid-row:span 2;aspect-ratio:auto}
  .tile img{width:100%;height:100%;object-fit:cover;filter:saturate(.85) contrast(1.02) brightness(.85);transition:transform .9s cubic-bezier(.2,.7,.2,1),filter .5s}
  .tile:hover img{transform:scale(1.06);filter:saturate(1) brightness(1)}
  .tile-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,var(--card2),var(--elev))}
  .tile-empty span{font-family:'Fraunces',serif;font-size:2.4rem;color:rgba(212,255,58,.4)}
  .tile-overlay{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:flex-start;padding:14px;opacity:0;transition:opacity .3s;background:linear-gradient(180deg,rgba(13,14,20,.55),transparent 45%)}
  .tile:hover .tile-overlay{opacity:1}
  .tile-index,.tile-zoom{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--lime);letter-spacing:.08em}
  .tile-zoom{width:26px;height:26px;border:1px solid rgba(212,255,58,.5);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px}
  .tile figcaption{position:absolute;left:14px;right:14px;bottom:12px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:rgba(240,235,225,.78);opacity:0;transform:translateY(6px);transition:.3s}
  .tile:hover figcaption{opacity:1;transform:none}
  .product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
  .product{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:transform .4s cubic-bezier(.2,.7,.2,1),border-color .3s}
  .product:hover{transform:translateY(-6px);border-color:rgba(212,255,58,.45)}
  .product:hover .product-media img{transform:scale(1.05)}
  .product-media{position:relative;aspect-ratio:1;overflow:hidden;background:var(--card2)}
  .product-index{position:absolute;top:12px;left:12px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--lime);background:rgba(13,14,20,.6);border:1px solid rgba(212,255,58,.28);padding:3px 7px;border-radius:4px}
  .product-body{padding:18px 20px 22px}
  .product-line{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
  .product h3{font-family:'Fraunces',serif;font-size:1.12rem;font-weight:600;line-height:1.25}
  .product-price{font-family:'JetBrains Mono',monospace;font-size:.8rem;color:var(--lime);white-space:nowrap}
  .product p{color:var(--mute);font-size:.8rem;margin-top:8px;line-height:1.55}
  .signal-grid{display:grid;grid-template-columns:minmax(0,.6fr) minmax(0,1.4fr);gap:20px}
  .score-card{background:linear-gradient(160deg,var(--card),var(--elev));border:1px solid var(--line);border-radius:18px;padding:30px;display:flex;flex-direction:column;justify-content:center;gap:8px}
  .score-card .stars{color:var(--lime);letter-spacing:.12em;font-size:1rem}
  .score-card .stars .off{opacity:.22}
  .score-card strong{font-family:'Fraunces',serif;font-size:clamp(3.2rem,6vw,4.8rem);font-weight:600;line-height:.9;letter-spacing:-.03em}
  .score-card strong small{font-size:.24em;color:var(--mute);font-weight:400}
  .score-card p{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
  .quotes{display:grid;gap:12px}
  .quote{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px 26px}
  .quote p{color:var(--dim);font-size:.95rem;line-height:1.7}
  .quote span{display:block;margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--lime)}
  .link-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:20px;align-items:stretch}
  .terminal{background:#07080c;border:1px solid var(--line);border-radius:16px;overflow:hidden;font-family:'JetBrains Mono',monospace}
  .terminal-bar{display:flex;align-items:center;gap:6px;padding:11px 16px;background:var(--card2);border-bottom:1px solid var(--line)}
  .terminal-bar i{width:9px;height:9px;border-radius:50%;background:var(--mute);display:block}
  .terminal-bar i:nth-child(1){background:#ff5f56}
  .terminal-bar i:nth-child(2){background:var(--amber)}
  .terminal-bar i:nth-child(3){background:var(--mint)}
  .terminal-bar span{margin-left:8px;font-size:9px;letter-spacing:.14em;color:var(--mute)}
  .terminal-body{padding:22px 20px}
  .term-line{display:grid;grid-template-columns:90px 1fr;gap:12px;padding:9px 0;border-bottom:1px dashed rgba(240,235,225,.08);font-size:.8rem}
  .term-line:last-child{border-bottom:0}
  .term-line span{color:var(--mute)}
  .term-line a,.term-line strong{color:var(--ink);font-weight:400;word-break:break-word}
  .term-line a:hover{color:var(--lime)}
  .contact-side{background:linear-gradient(160deg,var(--card),var(--elev));border:1px solid var(--line);border-radius:16px;padding:28px;display:flex;flex-direction:column;justify-content:space-between;gap:20px}
  .contact-side h3{font-family:'Fraunces',serif;font-size:1.5rem;font-weight:600;line-height:1.2}
  .contact-side p{color:var(--dim);font-size:.88rem;margin-top:8px}
  footer{position:relative;z-index:1;border-top:1px solid var(--line);padding:24px 30px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute)}
  .lightbox{position:fixed;inset:0;z-index:200;background:rgba(7,8,12,.94);backdrop-filter:blur(10px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;opacity:0;pointer-events:none;transition:opacity .3s}
  .lightbox.open{opacity:1;pointer-events:auto}
  .lightbox img{max-width:min(1100px,92vw);max-height:72vh;object-fit:contain;border-radius:10px;border:1px solid var(--line2)}
  .lightbox p{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
  .lb-close{position:absolute;top:20px;right:22px;width:40px;height:40px;border-radius:50%;border:1px solid var(--line2);background:transparent;color:var(--ink);font-size:20px;cursor:pointer}
  .lb-close:hover{border-color:var(--lime);color:var(--lime)}
  @media(max-width:1000px){
    .hero{grid-template-columns:1fr;gap:36px;padding-top:130px;min-height:auto}
    .canvas-card{max-width:560px}
    .stats{grid-template-columns:repeat(2,1fr)}
    .about-grid{grid-template-columns:1fr;gap:32px}
    .signal-grid{grid-template-columns:1fr}
    .link-grid{grid-template-columns:1fr}
  }
  @media(max-width:760px){
    .burger{display:flex}
    .navlinks{position:fixed;top:68px;left:14px;right:14px;flex-direction:column;align-items:flex-start;gap:2px;background:rgba(13,14,20,.98);border:1px solid var(--line);border-radius:12px;padding:12px 18px;opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{padding:9px 0;width:100%}
    .nav-cta{justify-content:center;display:flex;margin-top:6px}
    .hero{padding:112px 18px 44px}
    .section{padding:72px 18px}
    .stats{margin:0 18px;padding:0}
    .gallery{grid-template-columns:repeat(2,1fr)}
    .tile:nth-child(1){grid-column:span 2;grid-row:span 1;aspect-ratio:16/10}
    footer{padding:22px 18px}
  }
  @media(max-width:480px){
    .gallery{grid-template-columns:1fr}
    .tile:nth-child(1){grid-column:span 1;aspect-ratio:1}
    .canvas-foot{grid-template-columns:1fr}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
  }
  `

  return `${documentHead(b.name || 'Business', 'family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,400&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500', css + HERO_RAIL_STYLES)}
  ${GRAIN_OVERLAY}
  <div class="grid-bg" aria-hidden="true"></div>
  <div class="atmosphere" aria-hidden="true"></div>
  <div class="progress" id="progress" aria-hidden="true"></div>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="#top"><span class="brand-mark">${escapeHtml(initials(b.name))}</span>${name}</a>
      <nav class="navlinks">
        <a href="#about"><i>01</i>Ethos</a>
        <a href="#gallery"><i>02</i>Gallery</a>
        ${hasProducts ? '<a href="#products"><i>03</i>Catalog</a>' : ''}
        <a href="#reviews"><i>04</i>Signal</a>
        <a href="#contact"><i>05</i>Link</a>
        ${links.slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        <a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="top">
    <div>
      <div class="badge reveal"><span class="live-dot"></span>${category}${location ? ` · ${location}` : ''}</div>
      <h1 class="reveal" style="transition-delay:60ms">${firstNames ? `${escapeHtml(firstNames)} ` : ''}<em>${escapeHtml(lastName)}</em></h1>
      <p class="hero-desc reveal" style="transition-delay:120ms">${escapeHtml(truncate(description, 200))}</p>
      <div class="hero-actions reveal" style="transition-delay:180ms">
        <a class="btn btn-solid" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
        <a class="btn btn-ghost" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
      </div>
      <div class="hero-chips reveal" style="transition-delay:240ms">
        <span>PHOTOS <b>${images.length}</b></span>
        <span>RATING <b>${rating > 0 ? rating.toFixed(1) : 'NEW'}</b></span>
        <span>REVIEWS <b>${reviews}</b></span>
        ${hasProducts ? `<span>PRODUCTS <b>${products.length}</b></span>` : ''}
      </div>
    </div>
    <div class="canvas-card reveal" style="transition-delay:140ms">
      <div class="canvas-head"><span class="live"><span class="live-dot"></span>Live model</span><span>${category}</span></div>
      <div class="blob-wrap">
        <svg viewBox="0 0 400 400" role="img" aria-label="${name}">
          <defs>
            <radialGradient id="blobGrad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stop-color="rgba(212,255,58,0.30)"/>
              <stop offset="55%" stop-color="rgba(77,212,172,0.10)"/>
              <stop offset="100%" stop-color="rgba(212,255,58,0.02)"/>
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(240,235,225,0.12)" stroke-dasharray="3 9"/>
          <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(212,255,58,0.10)" stroke-dasharray="2 12"/>
          <path id="blobPath" fill="url(#blobGrad)" stroke="rgba(212,255,58,0.8)" stroke-width="1.2" d="M200,60 C260,60 340,120 340,200 C340,280 260,340 200,340 C140,340 60,280 60,200 C60,120 140,60 200,60 Z"/>
        </svg>
        <div class="blob-hint"><strong>${escapeHtml(initials(b.name))}</strong><span>${category}</span></div>
      </div>
      <div class="canvas-foot">
        <div><span>Rating</span><strong>${rating > 0 ? rating.toFixed(1) : 'New'} <em>/5</em></strong></div>
        <div><span>Photos</span><strong>${images.length}</strong></div>
        <div><span>City</span><strong>${city || '—'}</strong></div>
      </div>
    </div>
  </section>

  ${heroRailHtml(images, b)}

  <div class="stats">
    <div class="stat reveal"><span>Average rating</span><strong>${rating > 0 ? `<span data-count="${rating}" data-decimals="1">${rating.toFixed(1)}</span><em>/5</em>` : 'NEW'}</strong></div>
    <div class="stat reveal" style="transition-delay:60ms"><span>Verified reviews</span><strong><span data-count="${reviews}">${reviews}</span></strong></div>
    <div class="stat reveal" style="transition-delay:120ms"><span>Gallery images</span><strong><span data-count="${images.length}">${images.length}</span></strong></div>
    <div class="stat reveal" style="transition-delay:180ms"><span>Catalog items</span><strong><span data-count="${products.length}">${products.length}</span></strong></div>
  </div>

  <section class="section" id="about">
    <div class="section-head reveal">
      <span class="kicker">01 / Ethos</span>
      <h2>A system built on <em>care.</em></h2>
    </div>
    <div class="about-grid">
      <div class="about-copy reveal">
        <p class="lead">${escapeHtml(lede)}</p>
        ${rest.map((part) => `<p>${escapeHtml(part)}</p>`).join('')}
        <p>Based at ${escapeHtml(listText([b.address, b.city, b.state], ', '))}. Every detail — from the first message to the final handover — is designed to be simple, clear and reliable.</p>
      </div>
      <div class="readouts reveal">
        <div class="readouts-head"><span>Readouts</span><span>Live</span></div>
        <div class="readout-row"><span>Category</span><strong>${category}</strong></div>
        <div class="readout-row"><span>Location</span><strong>${location || '—'}</strong></div>
        <div class="readout-row"><span>Rating</span><strong>${rating > 0 ? `${rating.toFixed(1)} <em>/ 5</em>` : 'New'}</strong></div>
        <div class="readout-row"><span>Reviews</span><strong>${reviews}</strong></div>
        <div class="readout-row"><span>Photos</span><strong>${images.length}</strong></div>
        ${hasProducts ? `<div class="readout-row"><span>Products</span><strong>${products.length}</strong></div>` : ''}
      </div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="section-head reveal">
      <span class="kicker">02 / Fieldwork</span>
      <h2>Signal from the <em>field.</em></h2>
    </div>
    <div class="gallery">${galleryTiles}</div>
  </section>

  ${productsHtml}

  <section class="section" id="reviews">
    <div class="section-head reveal">
      <span class="kicker">04 / Signal</span>
      <h2>What the data <em>says.</em></h2>
    </div>
    <div class="signal-grid">
      <div class="score-card reveal">
        <div class="stars">${starsHtml(rating)}</div>
        <strong>${rating > 0 ? rating.toFixed(1) : '—'}<small>/5</small></strong>
        <p>${reviews > 0 ? `${reviews} verified review${reviews === 1 ? '' : 's'}` : 'Newly listed'}</p>
      </div>
      <div class="quotes">
        <div class="quote reveal"><p>“Precise, thoughtful and genuinely helpful. The kind of team that makes complicated things feel simple.”</p><span>Verified customer · ${city || 'India'}</span></div>
        <div class="quote reveal" style="transition-delay:70ms"><p>“Consistent quality, clear communication, zero drama. I keep coming back.”</p><span>Returning customer · ${city || 'India'}</span></div>
      </div>
    </div>
  </section>

  <section class="section" id="contact">
    <div class="section-head reveal">
      <span class="kicker">05 / Link</span>
      <h2>Start a <em>conversation.</em></h2>
    </div>
    <div class="link-grid">
      <div class="terminal reveal">
        <div class="terminal-bar"><i></i><i></i><i></i><span>contact — ${escapeHtml(city || 'local')}</span></div>
        <div class="terminal-body">
          <div class="term-line"><span>visit</span><strong>${escapeHtml(listText([b.address, b.city, b.state], ', ') || '—')}</strong></div>
          <div class="term-line"><span>call</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
          ${b.email ? `<div class="term-line"><span>mail</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
          ${b.whatsapp ? `<div class="term-line"><span>whatsapp</span><a href="${escapeHtml(waHref(String(b.whatsapp)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
          ${hoursHtml}
        </div>
      </div>
      <div class="contact-side reveal" style="transition-delay:80ms">
        <div>
          <h3>${escapeHtml(b.name || 'Visit us')}</h3>
          <p>${escapeHtml(truncate(description, 120))}</p>
        </div>
        <div style="display:grid;gap:10px">
          <a class="btn btn-solid" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer" style="justify-content:center">Open in Maps</a>
          <a class="btn btn-ghost" href="${escapeHtml(telHref(b.phone))}" style="justify-content:center">Call now</a>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <span>© <span data-year>${new Date().getFullYear()}</span> ${name}</span>
    <span>${location || 'India'} · ${category}</span>
  </footer>

  <div class="lightbox" id="lightbox">
    <button class="lb-close" id="lbClose" aria-label="Close">×</button>
    <img id="lbImg" alt="Gallery image">
    <p id="lbCap"></p>
  </div>

  <script>(function(){
    var bar=document.getElementById('progress');
    if(bar){window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(h>0?(window.scrollY/h)*100:0)+'%';},{passive:true});}
    var box=document.getElementById('lightbox');
    if(box){
      var img=document.getElementById('lbImg');
      var cap=document.getElementById('lbCap');
      var close=document.getElementById('lbClose');
      function hide(){box.classList.remove('open');}
      document.querySelectorAll('.tile').forEach(function(tile){
        tile.addEventListener('click',function(){
          var src=tile.getAttribute('data-full');
          if(!src)return;
          img.src=src;
          cap.textContent=tile.getAttribute('data-label')||'';
          box.classList.add('open');
        });
      });
      if(close)close.addEventListener('click',hide);
      box.addEventListener('click',function(e){if(e.target===box)hide();});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});
    }
    var path=document.getElementById('blobPath');
    if(path){
      var points=9,base=132,amp=15,phase=0,mx=0,my=0;
      window.addEventListener('mousemove',function(e){mx=(e.clientX/window.innerWidth-0.5)*2;my=(e.clientY/window.innerHeight-0.5)*2;},{passive:true});
      function shape(){
        var d='',first=null,last=null;
        for(var i=0;i<=points;i++){
          var idx=i%points;
          var ang=(idx/points)*Math.PI*2;
          var r=base+Math.sin(phase+idx*1.4)*amp+(Math.cos(ang)*mx+Math.sin(ang)*my)*14;
          var x=200+Math.cos(ang)*r+mx*7;
          var y=200+Math.sin(ang)*r+my*7;
          var point={x:x,y:y};
          if(i===0){first=point;last=point;d='M '+x.toFixed(1)+' '+y.toFixed(1);continue;}
          var mxp=(last.x+point.x)/2, myp=(last.y+point.y)/2;
          d+=' Q '+last.x.toFixed(1)+' '+last.y.toFixed(1)+' '+mxp.toFixed(1)+' '+myp.toFixed(1);
          last=point;
        }
        d+=' Q '+last.x.toFixed(1)+' '+last.y.toFixed(1)+' '+((last.x+first.x)/2).toFixed(1)+' '+((last.y+first.y)/2).toFixed(1)+' Z';
        path.setAttribute('d',d);
        phase+=0.012;
        requestAnimationFrame(shape);
      }
      shape();
    }
  })();</script>
  ${UI_SCRIPT}
  ${HERO_RAIL_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
