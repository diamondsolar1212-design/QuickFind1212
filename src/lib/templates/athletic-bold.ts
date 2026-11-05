// athletic-bold — high-intensity gym template inspired by the IRONFORGE
// reference. Crossfading hero reel with chapter progress, condensed display
// type, stat counters, marquee and clipped gear cards.

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
  heroSlides,
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

export function generateAthleticBold(
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const name = escapeHtml(b.name || 'Your Business')
  const category = escapeHtml(b.category || 'Training')
  const city = escapeHtml(b.city || '')
  const state = escapeHtml(b.state || '')
  const description = String(b.description || '')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const location = escapeHtml(listText([b.city, b.state], ', '))

  const reel = heroSlides(b, images).slice(0, 5)
  const slideCount = Math.max(3, reel.length || 3)
  const slides = Array.from({ length: slideCount }, (_, i) => {
    const url = reel[i] || ''
    return `<div class="slide${i === 0 ? ' active' : ''}" data-slide="${i}">
      <div class="slide-bg">${url ? `<img src="${escapeHtml(url)}" alt="${name} — frame ${i + 1}">` : `<div class="slide-fallback f${i % 3}"><span>${String(i + 1).padStart(2, '0')}</span></div>`}</div>
      <div class="slide-veil"></div>
    </div>`
  }).join('')
  const chapters = Array.from({ length: slideCount }, (_, i) => (
    `<button class="chapter${i === 0 ? ' active' : ''}" data-chapter="${i}" aria-label="Frame ${i + 1}"><span class="fill"></span></button>`
  )).join('')

  const galleryTiles = (() => {
    const tiles: string[] = []
    const total = Math.max(4, Math.min(8, images.length || 4))
    for (let i = 0; i < total; i += 1) {
      const url = images[i] || ''
      tiles.push(`<figure class="frame reveal" style="transition-delay:${i * 55}ms">
        ${url ? `<img src="${escapeHtml(url)}" alt="${name} — frame ${i + 1}" loading="lazy">` : `<div class="frame-empty f${i % 3}"><span>${i === 0 ? escapeHtml(initials(b.name)) : '×'}</span></div>`}
        <figcaption><span>Frame ${String(i + 1).padStart(2, '0')}</span><span>${city || category}</span></figcaption>
      </figure>`)
    }
    return tiles.join('')
  })()

  const productsHtml = `
  <section class="section" id="products">
    <div class="section-head reveal">
      <div class="eyebrow">03 / Products &amp; services</div>
      <h2>Built for <span>the work.</span></h2>
    </div>
    <div class="gear-grid">
      ${products.slice(0, 8).map((p, i) => `
      <article class="gear reveal" style="transition-delay:${i * 50}ms">
        <div class="gear-media">${productMediaHtml(p, '#1c1c1c', 'width:100%;height:100%;object-fit:cover;display:block;filter:grayscale(1) contrast(1.15) brightness(.85);transition:filter .5s,transform .6s;')}</div>
        <div class="gear-body">
          <div class="gear-no">0${i + 1}</div>
          <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
          ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
          ${p.price ? `<div class="gear-price">${escapeHtml(String(p.price))}</div>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </section>`

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `A ${category.toLowerCase()} in ${city}. Show up. Do the work.`
  const rest = bodyParagraphs.slice(1)

  const hoursHtml = hours.length > 0
    ? `<ul class="hours">${hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>`
    : `<p class="dim">Call for today's timings.</p>`

  const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#0a0a0a;--panel:#141414;--ink:#f5f5f5;--dim:#8a8a8a;--orange:#FF5400;--line:rgba(255,255,255,.1)}
  html{scroll-behavior:smooth}
  body{font-family:'Archivo',sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  ::selection{background:var(--orange);color:#000}
  .display{font-family:'Bebas Neue',sans-serif;letter-spacing:.01em}
  .reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;transition:background .35s,border-color .35s}
  .topbar.scrolled{background:rgba(10,10,10,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
  .topbar-inner{max-width:1400px;margin:0 auto;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:22px}
  .brand{display:flex;align-items:center;gap:12px;font-family:'Bebas Neue',sans-serif;font-size:1.65rem;letter-spacing:.04em}
  .brand-mark{width:34px;height:34px;background:var(--orange);color:#000;display:flex;align-items:center;justify-content:center;font-size:1.15rem;transform:skewX(-8deg)}
  .brand-mark span{transform:skewX(8deg)}
  .navlinks{display:flex;align-items:center;gap:26px}
  .navlinks a{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);transition:color .25s}
  .navlinks a:hover{color:var(--ink)}
  .nav-cta{background:var(--orange);color:#000!important;padding:10px 20px;font-weight:600;transition:transform .25s,background .25s}
  .nav-cta:hover{transform:translateY(-2px);background:#ff6a1f}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:24px;height:2px;background:var(--ink);transition:transform .3s}
  .hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;padding:130px 28px 44px}
  .slide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease}
  .slide.active{opacity:1}
  .slide-bg{position:absolute;inset:0;overflow:hidden}
  .slide-bg img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.28) brightness(.5);transform:scale(1.02)}
  .slide.active .slide-bg img{animation:ken 8s ease-out forwards}
  @keyframes ken{from{transform:scale(1.02)}to{transform:scale(1.12)}}
  .slide-fallback{position:absolute;inset:0;background:linear-gradient(135deg,#1d1d1d,#0a0a0a)}
  .slide-fallback.f1{background:linear-gradient(135deg,#241108,#0a0a0a)}
  .slide-fallback.f2{background:linear-gradient(135deg,#101820,#0a0a0a)}
  .slide-fallback span{position:absolute;right:4%;bottom:10%;font-family:'Bebas Neue',sans-serif;font-size:clamp(14rem,36vw,30rem);line-height:.7;color:rgba(255,84,0,.08)}
  .slide-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,10,.72) 0%,rgba(10,10,10,.25) 42%,rgba(10,10,10,.95) 100%),linear-gradient(90deg,rgba(10,10,10,.72),transparent 70%)}
  .hero-inner{position:relative;z-index:3;width:100%;max-width:1400px;margin:0 auto}
  .hero-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
  .chip{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;border:1px solid rgba(255,255,255,.28);padding:6px 10px;color:rgba(255,255,255,.86);background:rgba(0,0,0,.25);backdrop-filter:blur(6px)}
  .chip.hot{background:var(--orange);color:#000;border-color:var(--orange);font-weight:700}
  .hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(4rem,13vw,11rem);line-height:.8;letter-spacing:.005em;text-transform:uppercase;max-width:15ch;text-shadow:0 10px 60px rgba(0,0,0,.5)}
  .hero h1 span{-webkit-text-stroke:1.5px rgba(255,255,255,.55);color:transparent}
  .hero-sub{font-family:'Oswald',sans-serif;font-weight:300;font-size:clamp(1rem,1.8vw,1.3rem);color:rgba(255,255,255,.72);max-width:52ch;margin-top:16px;letter-spacing:.02em}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
  .btn{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:.18em;text-transform:uppercase;transition:transform .25s,background .25s,color .25s,border-color .25s}
  .btn:hover{transform:translateY(-3px)}
  .btn-solid{background:var(--orange);color:#000;font-weight:600}
  .btn-solid:hover{background:#ff6a1f;box-shadow:8px 8px 0 rgba(255,84,0,.22)}
  .btn-ghost{border:1px solid rgba(255,255,255,.4);color:var(--ink)}
  .btn-ghost:hover{border-color:var(--ink);background:rgba(255,255,255,.08)}
  .reel-bar{position:relative;z-index:3;max-width:1400px;width:100%;margin:38px auto 0;display:flex;align-items:center;gap:18px}
  .chapters{display:flex;gap:8px;flex:1}
  .chapter{position:relative;flex:1;height:3px;background:rgba(255,255,255,.18);border:0;cursor:pointer;padding:0;overflow:hidden}
  .chapter .fill{position:absolute;inset:0;background:var(--orange);transform:scaleX(0);transform-origin:left}
  .chapter.active .fill{animation:chapterFill 5.2s linear forwards}
  @keyframes chapterFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .slide-count{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:rgba(255,255,255,.62);white-space:nowrap}
  .marquee{overflow:hidden;white-space:nowrap;background:var(--orange);color:#000;border-block:1px solid #000}
  .marquee-track{display:inline-flex;animation:marquee 26s linear infinite;padding:12px 0}
  .marquee-track span{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.7rem,3.4vw,2.6rem);letter-spacing:.03em;padding:0 22px}
  .marquee-track span::after{content:'★';font-size:.7em;margin-left:22px;vertical-align:middle}
  @keyframes marquee{to{transform:translateX(-50%)}}
  .section{max-width:1400px;margin:0 auto;padding:100px 28px;scroll-margin-top:80px}
  .section-head{margin-bottom:46px}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--orange);margin-bottom:12px}
  .section-head h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,7vw,5.6rem);line-height:.86;text-transform:uppercase;letter-spacing:.01em}
  .section-head h2 span{color:var(--orange)}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);border-block:1px solid var(--line);background:var(--panel)}
  .stat-cell{padding:30px 28px;border-right:1px solid var(--line)}
  .stat-cell:last-child{border-right:0}
  .stat-cell strong{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.4rem,4vw,3.6rem);font-weight:400;line-height:.9;display:block}
  .stat-cell strong em{font-style:normal;color:var(--orange)}
  .stat-cell span{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--dim);display:block;margin-top:8px}
  .about-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:60px;align-items:start}
  .about-title{position:relative;padding-top:10px}
  .about-title .ghost{position:absolute;top:-40px;left:-8px;font-family:'Bebas Neue',sans-serif;font-size:clamp(8rem,18vw,15rem);line-height:.7;color:rgba(255,255,255,.035);pointer-events:none}
  .about-title h2{position:relative;font-family:'Bebas Neue',sans-serif;font-size:clamp(2.8rem,6vw,4.6rem);line-height:.86;text-transform:uppercase}
  .about-title h2 span{color:var(--orange)}
  .about-copy{color:#bdbdbd;font-size:.98rem;line-height:1.8;border-left:3px solid var(--orange);padding-left:28px}
  .about-copy p{margin-bottom:1.15rem}
  .about-copy strong{color:var(--ink);font-weight:600}
  .about-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
  .about-tags span{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;border:1px solid var(--line);padding:6px 10px;color:var(--dim)}
  .frames-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .frame{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--panel)}
  .frame:first-child{grid-column:span 2;aspect-ratio:auto}
  .frame img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.2) brightness(.72);transition:filter .5s,transform .8s cubic-bezier(.2,.7,.2,1)}
  .frame:hover img{filter:grayscale(0) contrast(1.05) brightness(.95);transform:scale(1.05)}
  .frame-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a1a,#0f0f0f)}
  .frame-empty.f1{background:linear-gradient(135deg,#221006,#0f0f0f)}
  .frame-empty.f2{background:linear-gradient(135deg,#101820,#0f0f0f)}
  .frame-empty span{font-family:'Bebas Neue',sans-serif;font-size:3rem;color:rgba(255,84,0,.35)}
  .frame figcaption{position:absolute;inset:auto 0 0 0;display:flex;justify-content:space-between;gap:10px;padding:14px 16px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.8);background:linear-gradient(transparent,rgba(0,0,0,.8));opacity:0;transition:opacity .3s}
  .frame:hover figcaption{opacity:1}
  .gear-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
  .gear{background:var(--panel);border:1px solid var(--line);clip-path:polygon(0 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%);transition:transform .4s cubic-bezier(.2,.7,.2,1),border-color .3s}
  .gear:hover{transform:translateY(-6px);border-color:rgba(255,84,0,.5)}
  .gear:hover .gear-media img{filter:grayscale(0) contrast(1.05) brightness(1);transform:scale(1.04)}
  .gear-media{aspect-ratio:1;overflow:hidden;background:#1c1c1c}
  .gear-body{padding:20px 20px 26px;position:relative}
  .gear-no{position:absolute;top:-26px;right:16px;font-family:'Bebas Neue',sans-serif;font-size:3.2rem;line-height:1;color:rgba(255,84,0,.28)}
  .gear h3{font-family:'Oswald',sans-serif;font-size:1.15rem;font-weight:500;text-transform:uppercase;letter-spacing:.04em;line-height:1.2;padding-right:48px}
  .gear p{color:var(--dim);font-size:.8rem;margin-top:6px;line-height:1.55}
  .gear-price{display:inline-block;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:.85rem;color:var(--orange);border-bottom:1px solid rgba(255,84,0,.35);padding-bottom:2px}
  .voice-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .voice{background:var(--panel);border:1px solid var(--line);padding:30px;position:relative}
  .voice::before{content:'“';position:absolute;top:6px;right:20px;font-family:'Bebas Neue',sans-serif;font-size:5rem;line-height:1;color:rgba(255,84,0,.22)}
  .voice-stars{color:var(--orange);letter-spacing:.14em;font-size:.9rem;margin-bottom:14px}
  .voice-stars .off{opacity:.2}
  .voice p{color:#c4c4c4;font-size:.94rem;line-height:1.7}
  .voice span{display:block;margin-top:18px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
  .rating-banner{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:30px}
  .rating-banner strong{font-family:'Bebas Neue',sans-serif;font-size:3.4rem;line-height:.8}
  .rating-banner strong em{font-style:normal;font-size:.34em;color:var(--dim);letter-spacing:.08em}
  .rating-banner .voice-stars{margin:0}
  .cta-band{background:var(--orange);color:#000;position:relative;overflow:hidden;scroll-margin-top:80px}
  .cta-band::after{content:'GO';position:absolute;right:-2%;bottom:-18%;font-family:'Bebas Neue',sans-serif;font-size:clamp(12rem,30vw,24rem);line-height:.7;color:rgba(0,0,0,.07);pointer-events:none}
  .cta-inner{max-width:1400px;margin:0 auto;padding:76px 28px;display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap;position:relative;z-index:2}
  .cta-inner h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,7vw,6rem);line-height:.82;text-transform:uppercase}
  .cta-inner p{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:12px;margin-top:10px;opacity:.75}
  .cta-btn{display:inline-flex;align-items:center;gap:10px;background:#000;color:var(--orange);padding:18px 34px;font-family:'Oswald',sans-serif;font-size:13px;letter-spacing:.18em;text-transform:uppercase;transition:transform .25s}
  .cta-btn:hover{transform:translateY(-3px)}
  .contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}
  .contact-card{background:var(--bg);padding:26px 24px}
  .contact-card span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--orange);margin-bottom:8px}
  .contact-card a,.contact-card p{font-family:'Oswald',sans-serif;font-size:1.05rem;color:var(--ink);word-break:break-word}
  .contact-card a:hover{color:var(--orange)}
  .hours{list-style:none;font-family:'Archivo',sans-serif;font-size:.8rem;color:var(--dim)}
  .hours li{display:flex;justify-content:space-between;gap:16px;padding:2px 0}
  .dim{color:var(--dim);font-size:.82rem}
  footer{border-top:1px solid var(--line);padding:26px 28px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim)}
  .sticky-cta{display:none}
  @media(max-width:980px){
    .stats{grid-template-columns:repeat(2,1fr)}
    .stat-cell:nth-child(2){border-right:0}
    .stat-cell:nth-child(-n+2){border-bottom:1px solid var(--line)}
    .about-grid{grid-template-columns:1fr;gap:32px}
    .frames-grid{grid-template-columns:repeat(2,1fr)}
    .frame:first-child{grid-column:span 2;aspect-ratio:16/10}
  }
  @media(max-width:760px){
    .burger{display:flex}
    .navlinks{position:fixed;top:68px;left:14px;right:14px;flex-direction:column;align-items:flex-start;gap:2px;background:rgba(10,10,10,.98);border:1px solid var(--line);padding:12px 18px;opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{padding:10px 0;width:100%}
    .nav-cta{text-align:center;justify-content:center;display:flex;margin-top:6px}
    .hero{padding:110px 18px 32px}
    .section{padding:72px 18px}
    .reel-bar{margin-top:26px}
    .cta-inner{padding:60px 18px}
    footer{padding:24px 18px;padding-bottom:88px}
    .sticky-cta{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:90;background:rgba(10,10,10,.96);border-top:1px solid var(--line);backdrop-filter:blur(12px);padding:10px 14px;gap:10px}
    .sticky-cta a{flex:1;text-align:center;padding:12px;font-family:'Oswald',sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase}
    .sticky-cta .primary{background:var(--orange);color:#000;font-weight:600}
    .sticky-cta .secondary{border:1px solid var(--line);color:var(--ink)}
  }
  @media(max-width:520px){
    .frames-grid{grid-template-columns:1fr}
    .frame:first-child{grid-column:span 1;aspect-ratio:4/3}
    .stats{grid-template-columns:1fr 1fr}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
  }
  `

  return `${documentHead(b.name || 'Business', 'family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700', css + HERO_RAIL_STYLES)}
  ${GRAIN_OVERLAY}
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="#top"><span class="brand-mark"><span>${escapeHtml(initials(b.name))}</span></span>${name}</a>
      <nav class="navlinks">
        <a href="#top" data-page="home">Home</a>
        <a href="#products" data-page="products">Products &amp; services</a>
        <a href="#about" data-page="about">About</a>
        <a href="#contact" data-page="contact">Contact</a>
        ${customLinks(b).slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        <a class="nav-cta" href="${escapeHtml(primaryCta(b, 'Book now').url)}"${anchorAttrs(primaryCta(b, 'Book now').url)}>${escapeHtml(primaryCta(b, 'Book now').label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="top">
    ${slides}
    <div class="hero-inner">
      <div class="hero-chips reveal">
        <span class="chip hot">${category}</span>
        ${city ? `<span class="chip">${city}</span>` : ''}
        <span class="chip">${images.length >= 4 ? 'Gallery online' : 'Gallery loading'}</span>
      </div>
      <h1 class="reveal" style="transition-delay:60ms">${name}</h1>
      <p class="hero-sub reveal" style="transition-delay:120ms">${escapeHtml(truncate(description, 180))}</p>
      <div class="hero-actions reveal" style="transition-delay:180ms">
        <a class="btn btn-solid" href="${escapeHtml(primaryCta(b, 'Book a session').url)}"${anchorAttrs(primaryCta(b, 'Book a session').url)}>${escapeHtml(primaryCta(b, 'Book a session').label)}</a>
        <a class="btn btn-ghost" href="${escapeHtml(secondaryCta(b, 'See the floor', '#gallery').url)}"${anchorAttrs(secondaryCta(b, 'See the floor', '#gallery').url)}>${escapeHtml(secondaryCta(b, 'See the floor', '#gallery').label)}</a>
      </div>
      <div class="reel-bar reveal" style="transition-delay:240ms">
        <div class="chapters">${chapters}</div>
        <span class="slide-count" id="slideCount">01 / ${String(slideCount).padStart(2, '0')}</span>
      </div>
    </div>
  </section>

  ${heroRailHtml(images, b)}

  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      ${['No shortcuts', category, 'Show up', city || 'Every day', 'Do the work', 'No shortcuts', category, 'Show up', city || 'Every day', 'Do the work'].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
    </div>
  </div>

  <div class="stats">
    <div class="stat-cell"><strong>${rating > 0 ? `<span data-count="${rating}" data-decimals="1">${rating.toFixed(1)}</span><em>/5</em>` : 'NEW'}</strong><span>Average rating</span></div>
    <div class="stat-cell"><strong><span data-count="${reviews}">${reviews}</span><em>+</em></strong><span>Member reviews</span></div>
    <div class="stat-cell"><strong><span data-count="${images.length}">${images.length}</span></strong><span>Photos</span></div>
    <div class="stat-cell"><strong><span data-count="${products.length}">${products.length}</span></strong><span>Products</span></div>
  </div>

  <section class="section" id="about">
    <div class="about-grid">
      <div class="about-title reveal">
        <span class="ghost">01</span>
        <div class="eyebrow">The standard</div>
        <h2>Earned,<br>not <span>given.</span></h2>
      </div>
      <div class="about-copy reveal">
        <p>${escapeHtml(lede)}</p>
        ${rest.map((part) => `<p>${escapeHtml(part)}</p>`).join('')}
        <p>Find us at <strong>${escapeHtml(listText([b.address, b.city, b.state], ', '))}</strong>. Walk in, call ahead, or message us — the door is open.</p>
        <div class="about-tags">
          <span>${category}</span>
          ${city ? `<span>${city}</span>` : ''}
          ${rating > 0 ? `<span>${rating.toFixed(1)} / 5 rated</span>` : `<span>Newly listed</span>`}
          <span>${images.length} photos</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="section-head reveal">
      <div class="eyebrow">02 / The floor</div>
      <h2>Inside <span>the grind.</span></h2>
    </div>
    <div class="frames-grid">${galleryTiles}</div>
  </section>

  ${productsHtml}

  <section class="section" id="reviews">
    <div class="section-head reveal">
      <div class="eyebrow">04 / Reviews</div>
      <h2>No hype. <span>Just results.</span></h2>
    </div>
    ${reviews > 0 ? `<div class="rating-banner reveal"><strong>${rating.toFixed(1)}<em>/5</em></strong><span class="voice-stars">${starsHtml(rating)}</span><span class="dim">${reviews} verified review${reviews === 1 ? '' : 's'}</span></div>` : ''}
    <div class="voice-grid">
      ${reviews > 0 ? `
      <div class="voice reveal"><div class="voice-stars">${starsHtml(5)}</div><p>“Straightforward coaching, a serious space, and people who actually care about your progress. Exactly what I needed.”</p><span>Verified member · ${city || 'India'}</span></div>
      <div class="voice reveal" style="transition-delay:80ms"><div class="voice-stars">${starsHtml(5)}</div><p>“No gimmicks. You show up, they guide you, you get stronger. The atmosphere does half the work.”</p><span>Regular member · ${city || 'India'}</span></div>` : `
      <div class="voice reveal"><div class="voice-stars">${starsHtml(0)}</div><p>“Newly listed — be the first to train with us and share your story.”</p><span>New on BusinessHub</span></div>`}
    </div>
  </section>

  <section class="cta-band" id="contact">
    <div class="cta-inner">
      <div>
        <h2>Ready when<br>you are.</h2>
        <p>${escapeHtml(listText([b.address, b.city, b.state], ', '))}</p>
      </div>
      <a class="cta-btn" href="${escapeHtml(telHref(b.phone))}">Call ${escapeHtml(b.phone || 'us')} →</a>
    </div>
  </section>

  <section class="section">
    <div class="contact">
      <div class="contact-card"><span>Call</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
      ${b.whatsapp ? `<div class="contact-card"><span>WhatsApp</span><a href="${escapeHtml(waHref(String(b.whatsapp)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
      ${b.email ? `<div class="contact-card"><span>Email</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
      <div class="contact-card"><span>Find us</span><a href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">${escapeHtml(listText([b.address, b.city], ', ') || 'Open in Maps')}</a></div>
      <div class="contact-card"><span>Hours</span>${hoursHtml}</div>
    </div>
  </section>

  <footer>
    <span>© <span data-year>${new Date().getFullYear()}</span> ${name}</span>
    <span>${location || 'India'} · ${category}</span>
  </footer>

  <div class="sticky-cta">
    <a class="primary" href="${escapeHtml(telHref(b.phone))}">Book now</a>
    <a class="secondary" href="#gallery">Gallery</a>
  </div>

  <script>(function(){
    var slides=[].slice.call(document.querySelectorAll('.slide'));
    var chapters=[].slice.call(document.querySelectorAll('.chapter'));
    var counter=document.getElementById('slideCount');
    if(slides.length<2)return;
    var index=0,timer=null;
    function pad(n){return ('0'+n).slice(-2);}
    function show(n){
      slides[index].classList.remove('active');
      if(chapters[index])chapters[index].classList.remove('active');
      index=(n+slides.length)%slides.length;
      slides[index].classList.add('active');
      if(chapters[index])chapters[index].classList.add('active');
      if(counter)counter.textContent=pad(index+1)+' / '+pad(slides.length);
      restart();
    }
    function restart(){
      if(timer)clearInterval(timer);
      timer=setInterval(function(){show(index+1);},5200);
    }
    chapters.forEach(function(bar,i){bar.addEventListener('click',function(){show(i);});});
    restart();
  })();</script>
  ${UI_SCRIPT}
  ${HERO_RAIL_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
