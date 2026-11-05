// calm-sage — serene studio template inspired by the Stillwater reference.
// Sand, sage and terracotta, Fraunces display type, a breathing hero image,
// grain overlay, editorial gallery and quiet scroll reveals.

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
  heroRailHtml,
  HERO_RAIL_SCRIPT,
  HERO_RAIL_STYLES,
  escapeHtml,
  heroImage,
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
} from './shared'

export function generateCalmSage(
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
  const primary = primaryCta(b, 'Call')
  const secondary = secondaryCta(b, 'Explore the space', '#gallery')
  const links = customLinks(b)

  const galleryTiles = (() => {
    const tiles: string[] = []
    const total = Math.max(4, Math.min(8, images.length || 4))
    for (let i = 0; i < total; i += 1) {
      const url = images[i] || ''
      if (url) {
        tiles.push(`<figure class="tile">
          <img src="${escapeHtml(url)}" alt="${name} — image ${i + 1}" loading="lazy">
          <figcaption><span>0${i + 1}</span>${city}</figcaption>
        </figure>`)
      } else {
        tiles.push(`<figure class="tile tile-empty tile-${i % 4}">
          <span class="tile-glyph">${i === 0 ? escapeHtml(initials(b.name)) : '◦'}</span>
          <figcaption><span>0${i + 1}</span>Photo coming soon</figcaption>
        </figure>`)
      }
    }
    return tiles.join('')
  })()

  const productsHtml = `
  <section class="section" id="products">
    <div class="section-head reveal">
      <span class="kicker">03 — Products &amp; services</span>
      <h2>Made to be <em>taken home</em>.</h2>
    </div>
    <div class="product-grid">
      ${products.slice(0, 8).map((p, i) => `
      <article class="product reveal" style="transition-delay:${i * 60}ms">
        <div class="product-media">${productMediaHtml(p, '#e3d5c1')}</div>
        <div class="product-body">
          <div class="product-line">
            <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
            ${p.price ? `<span class="price">${escapeHtml(String(p.price))}</span>` : ''}
          </div>
          ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </section>`

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `A ${category.toLowerCase()} in the heart of ${city}.`
  const rest = bodyParagraphs.slice(1)

  const reviewCards = reviews > 0 ? `
    <div class="quote reveal">
      <p>“A lovely space, thoughtful service, and real attention to detail. You feel looked after from the moment you walk in.”</p>
      <span>Verified guest · ${city}</span>
    </div>
    <div class="quote reveal" style="transition-delay:90ms">
      <p>“Calm, considered and genuinely welcoming. It has become part of our weekly routine.”</p>
      <span>Regular visitor · ${city}</span>
    </div>` : `
    <div class="quote reveal">
      <p>“Be the first to share your experience — reviews from guests will appear here.”</p>
      <span>Newly listed on BusinessHub</span>
    </div>`

  const hoursHtml = hours.length > 0
    ? `<ul class="hours">${hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>`
    : `<p class="muted">Call us for current opening hours.</p>`

  const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--sand:#f4ede0;--sand2:#efe6d4;--cream:#faf5ec;--ink:#2c2620;--muted:#6f6558;--sage:#8a9a87;--sage-deep:#5d6e5a;--terra:#b16a48;--line:rgba(44,38,32,.14)}
  html{scroll-behavior:smooth}
  body{font-family:'Inter',sans-serif;background:var(--sand);color:var(--ink);line-height:1.75;overflow-x:hidden;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  ::selection{background:var(--terra);color:var(--cream)}
  .reveal{opacity:0;transform:translateY(26px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;transition:background .4s,box-shadow .4s,backdrop-filter .4s;border-bottom:1px solid transparent}
  .topbar.scrolled{background:rgba(250,245,236,.86);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom-color:var(--line);box-shadow:0 10px 40px rgba(44,38,32,.08)}
  .topbar-inner{max-width:1240px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px}
  .brand{display:flex;align-items:center;gap:12px;color:var(--cream)}
  .topbar.scrolled .brand{color:var(--ink)}
  .brand-mark{width:36px;height:36px;border:1px solid currentColor;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:.85rem;letter-spacing:.04em}
  .brand-name{font-family:'Fraunces',serif;font-size:1.12rem;letter-spacing:.01em}
  .navlinks{display:flex;align-items:center;gap:28px}
  .navlinks a{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(250,245,236,.82);transition:color .25s;position:relative}
  .topbar.scrolled .navlinks a{color:var(--muted)}
  .navlinks a:not(.nav-cta)::after{content:'';position:absolute;left:0;right:100%;bottom:-6px;height:1px;background:currentColor;transition:right .3s}
  .navlinks a:hover::after{right:0}
  .navlinks a:hover{color:var(--cream)}
  .topbar.scrolled .navlinks a:hover{color:var(--terra)}
  .nav-cta{padding:9px 18px;border:1px solid rgba(250,245,236,.5);border-radius:999px;color:var(--cream)!important;transition:all .25s}
  .nav-cta:hover{background:var(--cream);color:var(--ink)!important}
  .topbar.scrolled .nav-cta{border-color:var(--ink);color:var(--ink)!important}
  .topbar.scrolled .nav-cta:hover{background:var(--ink);color:var(--cream)!important}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:22px;height:1.5px;background:var(--cream);transition:transform .3s,opacity .3s}
  .topbar.scrolled .burger span{background:var(--ink)}
  .hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;padding:140px 32px 64px;overflow:hidden;color:var(--cream)}
  .hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.72) saturate(.82) contrast(.96);animation:breathe 22s ease-in-out infinite alternate}
  @keyframes breathe{from{transform:scale(1.02)}to{transform:scale(1.1)}}
  .hero-fallback{position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,#93a08d 0%,#5d6e5a 45%,#2f3a2d 100%)}
  .hero-fallback span{position:absolute;right:6%;top:18%;font-family:'Fraunces',serif;font-size:clamp(10rem,28vw,26rem);line-height:.8;color:rgba(250,245,236,.08)}
  .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,26,20,.38) 0%,rgba(30,26,20,.08) 40%,rgba(24,20,15,.72) 100%)}
  .hero-inner{position:relative;z-index:2;max-width:1240px;width:100%;margin:0 auto}
  .eyebrow{font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:rgba(250,245,236,.8);margin-bottom:22px}
  .hero h1{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(3.1rem,9vw,7.4rem);line-height:.92;letter-spacing:-.035em;max-width:14ch;text-wrap:balance}
  .hero-tag{font-family:'Fraunces',serif;font-style:italic;font-size:clamp(1.05rem,2vw,1.35rem);color:rgba(250,245,236,.84);max-width:46ch;margin-top:22px}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:34px}
  .btn{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border-radius:999px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;transition:transform .25s,background .25s,color .25s,border-color .25s}
  .btn:hover{transform:translateY(-2px)}
  .btn-solid{background:var(--cream);color:var(--ink)}
  .btn-solid:hover{background:var(--terra);color:var(--cream)}
  .btn-ghost{border:1px solid rgba(250,245,236,.55);color:var(--cream)}
  .btn-ghost:hover{background:rgba(250,245,236,.12)}
  .scroll-cue{position:absolute;right:38px;bottom:38px;z-index:2;display:flex;align-items:center;gap:12px;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(250,245,236,.7)}
  .scroll-cue span{display:block;width:1px;height:54px;background:linear-gradient(rgba(250,245,236,.1),rgba(250,245,236,.7));animation:cue 2.4s ease-in-out infinite}
  @keyframes cue{0%,100%{transform:scaleY(.3);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}}
  .marquee{overflow:hidden;white-space:nowrap;background:var(--sand2);border-block:1px solid var(--line)}
  .marquee-track{display:inline-flex;align-items:center;gap:0;animation:slide 34s linear infinite;padding:16px 0}
  .marquee-track span{font-family:'Fraunces',serif;font-style:italic;font-size:1.05rem;color:var(--muted);padding:0 26px;position:relative}
  .marquee-track span::after{content:'✦';font-style:normal;font-size:.55rem;color:var(--terra);margin-left:26px;position:absolute;top:50%;transform:translateY(-50%)}
  @keyframes slide{to{transform:translateX(-50%)}}
  .section{max-width:1240px;margin:0 auto;padding:104px 32px;scroll-margin-top:84px}
  .section-head{margin-bottom:48px;max-width:780px}
  .kicker{display:inline-flex;align-items:center;gap:12px;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--terra);margin-bottom:18px}
  .kicker::before{content:'';width:34px;height:1px;background:currentColor}
  .section-head h2{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2.1rem,4.6vw,3.6rem);line-height:1.04;letter-spacing:-.02em}
  .section-head h2 em{font-style:italic;color:var(--terra)}
  .about-grid{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:64px;align-items:start}
  .about-side{display:grid;gap:28px;position:sticky;top:110px}
  .stat{border-top:1px solid var(--line);padding-top:16px}
  .stat strong{display:block;font-family:'Fraunces',serif;font-size:2.4rem;font-weight:300;line-height:1}
  .stat span{display:block;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-top:8px}
  .about-copy{font-size:1.02rem;color:#4a4036;max-width:58ch}
  .about-copy p{margin-bottom:1.2rem}
  .dropcap::first-letter{font-family:'Fraunces',serif;font-weight:300;font-size:4.6rem;line-height:.78;float:left;padding:8px 12px 0 0;color:var(--terra)}
  .pullquote{font-family:'Fraunces',serif;font-style:italic;font-size:clamp(1.4rem,2.6vw,1.9rem);line-height:1.35;color:var(--ink);border-left:2px solid var(--terra);padding:6px 0 6px 24px;margin:32px 0}
  .facts{display:flex;flex-wrap:wrap;gap:10px 24px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:26px}
  .facts span{display:inline-flex;align-items:center;gap:8px}
  .facts span::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--sage)}
  .gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .tile{position:relative;overflow:hidden;border-radius:14px;min-height:230px;background:var(--sand2)}
  .tile:nth-child(1){grid-column:span 2;grid-row:span 2;min-height:474px}
  .tile:nth-child(4){grid-column:span 2}
  .tile img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s cubic-bezier(.2,.7,.2,1),filter .5s;filter:saturate(.85) contrast(.96)}
  .tile:hover img{transform:scale(1.06);filter:saturate(1)}
  .tile figcaption{position:absolute;inset:auto 0 0 0;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--cream);background:linear-gradient(transparent,rgba(24,20,15,.72));opacity:0;transform:translateY(8px);transition:.35s}
  .tile:hover figcaption{opacity:1;transform:none}
  .tile-empty{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e3d5c1,#d3c3ab)}
  .tile-empty.tile-1{background:linear-gradient(135deg,#cfd6c8,#b9c4b2)}
  .tile-empty.tile-2{background:linear-gradient(135deg,#e6c9b8,#d3ab93)}
  .tile-empty.tile-3{background:linear-gradient(135deg,#d9d2c4,#c4b8a4)}
  .tile-glyph{font-family:'Fraunces',serif;font-size:2.2rem;color:rgba(44,38,32,.28)}
  .tile-empty figcaption{opacity:1;transform:none;color:rgba(44,38,32,.6);background:none;justify-content:center}
  .product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px}
  .product{background:var(--cream);border-radius:16px;overflow:hidden;transition:transform .4s cubic-bezier(.2,.7,.2,1),box-shadow .4s}
  .product:hover{transform:translateY(-7px);box-shadow:0 26px 60px -30px rgba(44,38,32,.45)}
  .product-media{aspect-ratio:4/5;overflow:hidden;background:var(--sand2)}
  .product-media img{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
  .product:hover .product-media img{transform:scale(1.05)}
  .product-body{padding:18px 20px 22px}
  .product-line{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
  .product h3{font-family:'Fraunces',serif;font-size:1.15rem;font-weight:400;line-height:1.25}
  .product .price{font-size:.82rem;letter-spacing:.06em;color:var(--terra);white-space:nowrap}
  .product p{font-size:.82rem;color:var(--muted);margin-top:8px;line-height:1.6}
  .reviews{background:var(--sand2);border-block:1px solid var(--line);scroll-margin-top:84px}
  .reviews-inner{max-width:1240px;margin:0 auto;padding:96px 32px}
  .rating-row{display:flex;align-items:flex-end;gap:26px;flex-wrap:wrap;margin-bottom:40px}
  .rating-number{font-family:'Fraunces',serif;font-size:clamp(3.4rem,7vw,5.4rem);font-weight:300;line-height:.85}
  .rating-number small{font-size:.28em;color:var(--muted);letter-spacing:.05em}
  .stars{display:flex;gap:5px;font-size:1.05rem;color:var(--terra);letter-spacing:.08em}
  .stars .off{opacity:.22}
  .rating-note{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);padding-bottom:8px}
  .quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .quote{background:var(--cream);border-radius:16px;padding:30px 30px 26px;border:1px solid rgba(44,38,32,.06)}
  .quote p{font-family:'Fraunces',serif;font-style:italic;font-size:1.12rem;line-height:1.55;color:#4a4036}
  .quote span{display:block;margin-top:18px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--sage-deep)}
  .contact{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:56px;align-items:start}
  .contact h2{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(2.2rem,5vw,3.7rem);line-height:1;letter-spacing:-.02em;margin-bottom:20px}
  .contact-address{color:var(--muted);max-width:34ch;margin-bottom:28px}
  .contact-cards{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .contact-card{background:var(--cream);padding:22px 24px}
  .contact-card span{display:block;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--sage-deep);margin-bottom:6px}
  .contact-card a,.contact-card p{font-family:'Fraunces',serif;font-size:1.05rem;color:var(--ink);word-break:break-word}
  .contact-card a:hover{color:var(--terra)}
  .hours{list-style:none;font-family:'Inter',sans-serif;font-size:.84rem}
  .hours li{display:flex;justify-content:space-between;gap:18px;padding:3px 0;color:#4a4036}
  .muted{font-size:.84rem;color:var(--muted)}
  footer{background:var(--ink);color:rgba(244,237,224,.62);padding:44px 32px;text-align:center;font-size:.78rem;letter-spacing:.04em}
  footer strong{display:block;font-family:'Fraunces',serif;font-weight:400;font-size:1.15rem;color:var(--cream);margin-bottom:8px;letter-spacing:.01em}
  @media(max-width:900px){
    .topbar-inner{padding:14px 20px}
    .burger{display:flex}
    .navlinks{position:fixed;top:72px;left:16px;right:16px;flex-direction:column;align-items:flex-start;gap:4px;background:rgba(250,245,236,.98);padding:16px 20px;border-radius:14px;box-shadow:0 24px 60px rgba(44,38,32,.22);opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s;border:1px solid var(--line)}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{color:var(--muted)!important;padding:10px 0;width:100%}
    .nav-cta{border-color:var(--ink);color:var(--ink)!important;margin-top:6px;text-align:center;justify-content:center;display:flex}
    .hero{padding:120px 20px 56px;min-height:94svh}
    .scroll-cue{display:none}
    .section{padding:72px 20px}
    .about-grid{grid-template-columns:1fr;gap:36px}
    .about-side{position:static;grid-template-columns:repeat(2,1fr)}
    .gallery{grid-template-columns:repeat(2,1fr)}
    .tile:nth-child(1){grid-column:span 2;grid-row:span 1;min-height:300px}
    .tile:nth-child(4){grid-column:span 2}
    .contact{grid-template-columns:1fr;gap:36px}
    .reviews-inner{padding:72px 20px}
  }
  @media(max-width:560px){
    .hero h1{font-size:clamp(2.6rem,12vw,3.6rem)}
    .gallery{grid-template-columns:1fr}
    .tile:nth-child(1),.tile:nth-child(4){grid-column:span 1}
    .about-side{grid-template-columns:1fr 1fr}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
  }
  `

  return `${documentHead(b.name || 'Business', 'family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Inter:wght@300;400;500;600', css + HERO_RAIL_STYLES)}
  ${GRAIN_OVERLAY}
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="#top"><span class="brand-mark">${escapeHtml(initials(b.name))}</span><span class="brand-name">${name}</span></a>
      <nav class="navlinks">
        <a href="#top" data-page="home">Home</a>
        <a href="#products" data-page="products">Products &amp; services</a>
        <a href="#about" data-page="about">About</a>
        <a href="#contact" data-page="contact">Contact</a>
        ${links.slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        <a class="nav-cta" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="top">
    ${hero ? `<img class="hero-img" src="${escapeHtml(hero)}" alt="${name}">` : `<div class="hero-fallback"><span>${escapeHtml(initials(b.name))}</span></div>`}
    <div class="hero-veil"></div>
    <div class="hero-inner">
      <div class="eyebrow reveal">${category}${city ? ` · ${city}` : ''}</div>
      <h1 class="reveal" style="transition-delay:80ms">${name}</h1>
      <p class="hero-tag reveal" style="transition-delay:160ms">${escapeHtml(truncate(description, 170))}</p>
      <div class="hero-actions reveal" style="transition-delay:240ms">
        <a class="btn btn-solid" href="${escapeHtml(primary.url)}"${anchorAttrs(primary.url)}>${escapeHtml(primary.label)}</a>
        <a class="btn btn-ghost" href="${escapeHtml(secondary.url)}"${anchorAttrs(secondary.url)}>${escapeHtml(secondary.label)}</a>
      </div>
    </div>
    <a class="scroll-cue" href="#about"><span></span>Scroll</a>
  </section>

  ${heroRailHtml(images, b)}

  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      ${[category, city, 'Considered details', 'Warm service', 'Made with care', category, city, 'Considered details', 'Warm service', 'Made with care'].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
    </div>
  </div>

  <section class="section" id="about">
    <div class="section-head reveal">
      <span class="kicker">01 — Ethos</span>
      <h2>A slower kind of <em>${category.toLowerCase()}</em>.</h2>
    </div>
    <div class="about-grid">
      <aside class="about-side reveal">
        ${rating > 0 ? `<div class="stat"><strong><span data-count="${rating}" data-decimals="1">${rating.toFixed(1)}</span></strong><span>Average rating</span></div>` : ''}
        ${reviews > 0 ? `<div class="stat"><strong><span data-count="${reviews}">${reviews}</span></strong><span>Verified reviews</span></div>` : ''}
        <div class="stat"><strong><span data-count="${images.length}">${images.length}</span></strong><span>Photos on show</span></div>
        <div class="stat"><strong><span data-count="${products.length}">${products.length}</span></strong><span>Offerings</span></div>
      </aside>
      <div class="about-copy reveal">
        <p class="dropcap">${escapeHtml(lede)}</p>
        ${rest.map((part) => `<p>${escapeHtml(part)}</p>`).join('')}
        <p>You will find us at ${escapeHtml(listText([b.address, b.city, b.state], ', '))}${b.subcategory ? `, a ${escapeHtml(String(b.subcategory).toLowerCase())} tucked into the neighbourhood` : ''}. Come as you are — there is always room for one more.</p>
        <blockquote class="pullquote">“Good things take time, and a little care.”</blockquote>
        <div class="facts">
          <span>${category}</span>
          ${city ? `<span>${city}</span>` : ''}
          ${state ? `<span>${state}</span>` : ''}
          <span>${images.length >= 4 ? 'Gallery ready' : 'Gallery in progress'}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="section-head reveal">
      <span class="kicker">02 — Gallery</span>
      <h2>Moments, light and <em>quiet corners</em>.</h2>
    </div>
    <div class="gallery reveal">${galleryTiles}</div>
  </section>

  ${productsHtml}

  <section class="reviews" id="reviews">
    <div class="reviews-inner">
      <div class="section-head reveal">
        <span class="kicker">04 — Reviews</span>
        <h2>Words from our <em>guests</em>.</h2>
      </div>
      <div class="rating-row reveal">
        <div class="rating-number">${rating > 0 ? rating.toFixed(1) : '—'}<small>/5</small></div>
        <div>
          <div class="stars">${starsHtml(rating)}</div>
          <div class="rating-note">${reviews > 0 ? `${reviews} verified review${reviews === 1 ? '' : 's'}` : 'Newly listed'}</div>
        </div>
      </div>
      <div class="quotes">${reviewCards}</div>
    </div>
  </section>

  <section class="section contact" id="contact">
    <div class="reveal">
      <span class="kicker">05 — Visit</span>
      <h2>Come by for<br>a while.</h2>
      <p class="contact-address">${escapeHtml(listText([b.address, b.city, b.state], ', '))}</p>
      <a class="btn btn-solid" style="background:var(--ink);color:var(--cream)" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Open in Maps</a>
    </div>
    <div class="contact-cards reveal">
      <div class="contact-card"><span>Phone</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
      ${b.email ? `<div class="contact-card"><span>Email</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
      ${b.whatsapp ? `<div class="contact-card"><span>WhatsApp</span><a href="${escapeHtml('https://wa.me/' + String(b.whatsapp).replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
      <div class="contact-card"><span>Hours</span>${hoursHtml}</div>
    </div>
  </section>

  <footer>
    <strong>${name}</strong>
    ${city ? `${city}${state ? `, ${state}` : ''} · ` : ''}© <span data-year>${new Date().getFullYear()}</span> ${name}
  </footer>
  ${UI_SCRIPT}
  ${HERO_RAIL_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
