// jungle-gold — an editorial monograph in deep green and gold, inspired by
// the Severin Halbe reference. Split hero with a framed plate, numbered index,
// manifesto drop cap, plate gallery and colophon contact.

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

export function generateJungleGold(
  b: BusinessData,
  images: string[],
  products: TemplateProduct[],
  hours: HourEntry[]
): string {
  const name = escapeHtml(b.name || 'Your Business')
  const category = escapeHtml(b.category || 'Atelier')
  const city = escapeHtml(b.city || '')
  const state = escapeHtml(b.state || '')
  const description = String(b.description || '')
  const rating = ratingOf(b)
  const reviews = reviewCountOf(b)
  const hero = heroImage(b, images)
  const hasProducts = products.length > 0
  const location = escapeHtml(listText([b.city, b.state], ', '))

  const galleryTiles = (() => {
    const tiles: string[] = []
    const total = Math.max(4, Math.min(8, images.length || 4))
    for (let i = 0; i < total; i += 1) {
      const url = images[i] || ''
      tiles.push(`<figure class="plate-tile reveal" style="transition-delay:${i * 55}ms">
        <div class="tile-media">
          ${url ? `<img src="${escapeHtml(url)}" alt="${name} — plate ${i + 1}" loading="lazy">` : `<div class="tile-empty"><span>${i === 0 ? escapeHtml(initials(b.name)) : '✦'}</span></div>`}
          <div class="plate-line"></div>
        </div>
        <figcaption><span>Pl. ${String(i + 1).padStart(2, '0')}</span><span>${city || category}</span></figcaption>
      </figure>`)
    }
    return tiles.join('')
  })()

  const productsHtml = hasProducts ? `
  <section class="section" id="products">
    <div class="section-head reveal">
      <span class="kicker">03 — Catalogue</span>
      <h2>The <em>collection</em>.</h2>
      <p class="section-note">A considered selection, available in store and by enquiry.</p>
    </div>
    <div class="catalogue">
      ${products.slice(0, 8).map((p, i) => `
      <article class="entry reveal" style="transition-delay:${i * 60}ms">
        <div class="entry-media">${productMediaHtml(p, '#0D2818')}</div>
        <div class="entry-body">
          <div class="entry-top">
            <span class="entry-no">${String(i + 1).padStart(2, '0')}</span>
            ${p.price ? `<span class="entry-price">${escapeHtml(String(p.price))}</span>` : ''}
          </div>
          <h3>${escapeHtml(String(p.name ?? 'Product'))}</h3>
          ${p.details ? `<p>${escapeHtml(String(p.details))}</p>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </section>` : ''

  const bodyParagraphs = paragraphs(description)
  const lede = bodyParagraphs[0] || `An independent ${category.toLowerCase()} in ${city}.`
  const rest = bodyParagraphs.slice(1)

  const hoursHtml = hours.length > 0
    ? `<ul class="hours">${hours.map((h) => `<li><span>${escapeHtml(h.day)}</span><span>${escapeHtml(h.value)}</span></li>`).join('')}</ul>`
    : `<p class="colophon-note">By appointment — please call ahead.</p>`

  const indexRows = [
    ['01', 'Ethos', '#about'],
    ['02', 'Plates', '#gallery'],
    ...(hasProducts ? [['03', 'Catalogue', '#products']] : []),
    ['04', 'Voices', '#reviews'],
    ['05', 'Colophon', '#contact'],
  ]

  const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#05140A;--panel:#0D2818;--panel2:#0a1f12;--cream:#F5F5DC;--gold:#C9A227;--moss:#8FBC8F;--dim:rgba(245,245,220,.58);--line:rgba(201,162,39,.22)}
  html{scroll-behavior:smooth}
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--cream);line-height:1.7;overflow-x:hidden;-webkit-font-smoothing:antialiased;position:relative}
  a{color:inherit;text-decoration:none}
  img{display:block;max-width:100%}
  ::selection{background:var(--gold);color:var(--bg)}
  .cursor-glow{position:fixed;top:0;left:0;width:440px;height:440px;margin:-220px 0 0 -220px;border-radius:50%;background:radial-gradient(circle,rgba(201,162,39,.11),transparent 66%);pointer-events:none;z-index:1;transition:opacity .4s}
  @media(pointer:coarse){.cursor-glow{display:none}}
  .reveal{opacity:0;transform:translateY(26px);transition:opacity 1s ease,transform 1s cubic-bezier(.2,.7,.2,1)}
  .reveal.in{opacity:1;transform:none}
  .topbar{position:fixed;top:0;left:0;right:0;z-index:100;transition:background .4s,box-shadow .4s;border-bottom:1px solid var(--line)}
  .topbar.scrolled{background:rgba(5,20,10,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 12px 40px rgba(0,0,0,.45)}
  .topbar-inner{max-width:1360px;margin:0 auto;padding:18px 5vw;display:flex;align-items:center;justify-content:space-between;gap:24px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-mark{width:34px;height:34px;border:1px solid var(--gold);color:var(--gold);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em}
  .brand-name{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.28rem;letter-spacing:.02em}
  .navlinks{display:flex;align-items:center;gap:26px}
  .navlinks a{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--dim);transition:color .25s;position:relative}
  .navlinks a::before{content:'';position:absolute;left:0;right:100%;bottom:-5px;height:1px;background:var(--gold);transition:right .3s}
  .navlinks a:hover{color:var(--cream)}
  .navlinks a:hover::before{right:0}
  .nav-cta{border:1px solid var(--line);padding:9px 18px;color:var(--gold)!important;transition:background .25s,color .25s}
  .nav-cta:hover{background:var(--gold);color:var(--bg)!important}
  .nav-cta::before{display:none}
  .burger{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:6px}
  .burger span{width:22px;height:1.5px;background:var(--gold);transition:transform .3s}
  .hero{position:relative;min-height:100svh;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:6vw;align-items:center;padding:150px 6vw 80px;overflow:hidden;z-index:2}
  .hero::before{content:'';position:absolute;top:-20%;left:-12%;width:62%;height:70%;background:radial-gradient(circle,rgba(201,162,39,.08),transparent 65%);pointer-events:none}
  .hero::after{content:'';position:absolute;bottom:-20%;right:-10%;width:52%;height:60%;background:radial-gradient(circle,rgba(143,188,143,.06),transparent 65%);pointer-events:none}
  .hero-copy{position:relative;z-index:2}
  .overline{display:flex;align-items:center;gap:14px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:26px}
  .overline::before{content:'';width:44px;height:1px;background:var(--gold)}
  .hero h1{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:clamp(3.6rem,9.4vw,8.6rem);line-height:.8;letter-spacing:-.045em;max-width:11ch;text-wrap:balance}
  .hero-sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.2rem,2.2vw,1.6rem);color:var(--gold);margin-top:20px}
  .hero-desc{color:var(--dim);font-size:.98rem;max-width:44ch;margin-top:18px;line-height:1.75}
  .hero-meta{display:grid;grid-template-columns:repeat(3,auto);gap:26px;margin-top:38px;padding-top:22px;border-top:1px solid var(--line);max-width:520px}
  .hero-meta span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:4px}
  .hero-meta strong{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:1.05rem;color:var(--cream)}
  .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:34px}
  .btn{display:inline-flex;align-items:center;gap:10px;padding:13px 28px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;transition:.3s}
  .btn-solid{background:var(--gold);color:var(--bg)}
  .btn-solid:hover{background:var(--cream)}
  .btn-ghost{border:1px solid var(--line);color:var(--cream)}
  .btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
  .plate{position:relative;z-index:2;border:1px solid var(--gold);padding:14px;background:rgba(13,40,24,.35)}
  .plate::before,.plate::after{content:'';position:absolute;width:26px;height:26px;border:1px solid var(--gold);pointer-events:none}
  .plate::before{top:-7px;left:-7px;border-right:0;border-bottom:0}
  .plate::after{bottom:-7px;right:-7px;border-left:0;border-top:0}
  .plate-media{position:relative;aspect-ratio:3/4;overflow:hidden;background:linear-gradient(150deg,#123a22,#05140A)}
  .plate-media img{width:100%;height:100%;object-fit:cover;filter:brightness(.72) contrast(1.08) saturate(.9);transition:transform 1.2s cubic-bezier(.2,.7,.2,1),filter .6s}
  .plate-media:hover img{transform:scale(1.04);filter:brightness(.86) contrast(1.05) saturate(1)}
  .plate-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  .plate-empty span{font-family:'Cormorant Garamond',serif;font-size:4.4rem;color:rgba(201,162,39,.6)}
  .plate-caption{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold)}
  .seal{position:absolute;top:-46px;right:-30px;width:92px;height:92px;border:1px solid var(--line);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--gold);background:var(--bg);animation:spin 26s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .scroll-cue{position:absolute;bottom:34px;left:6vw;display:flex;align-items:center;gap:12px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:var(--dim)}
  .scroll-cue span{display:block;width:1px;height:48px;background:linear-gradient(rgba(201,162,39,.1),rgba(201,162,39,.7));animation:cue 2.4s ease-in-out infinite}
  @keyframes cue{0%,100%{transform:scaleY(.3);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}}
  .ticker{overflow:hidden;white-space:nowrap;border-block:1px solid var(--line);background:var(--panel2);position:relative;z-index:2}
  .ticker-track{display:inline-flex;animation:tick 32s linear infinite;padding:13px 0}
  .ticker-track span{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);padding:0 26px;opacity:.85}
  .ticker-track span::after{content:'◆';font-size:.5rem;margin-left:26px;opacity:.6}
  @keyframes tick{to{transform:translateX(-50%)}}
  .section{max-width:1360px;margin:0 auto;padding:108px 6vw;position:relative;z-index:2;scroll-margin-top:84px}
  .section-head{margin-bottom:52px;max-width:820px}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:block}
  .section-head h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(2.4rem,5vw,4.2rem);line-height:1;letter-spacing:-.02em}
  .section-head h2 em{font-style:italic;color:var(--gold)}
  .section-note{color:var(--dim);font-size:.92rem;margin-top:14px;max-width:52ch}
  .index{border-top:1px solid var(--line)}
  .index a{display:grid;grid-template-columns:60px 1fr auto;align-items:center;gap:20px;padding:20px 6px;border-bottom:1px solid var(--line);transition:padding .3s,background .3s}
  .index a:hover{padding-left:18px;background:rgba(201,162,39,.04)}
  .index-no{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:.14em}
  .index-name{font-family:'Cormorant Garamond',serif;font-size:1.6rem;line-height:1}
  .index-arrow{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold);opacity:.5;transition:.3s}
  .index a:hover .index-arrow{opacity:1;transform:translateX(6px)}
  .manifesto{display:grid;grid-template-columns:minmax(0,.55fr) minmax(0,1.45fr);gap:6vw;align-items:start}
  .manifesto-aside{position:sticky;top:120px}
  .manifesto-aside .kicker{margin-bottom:22px}
  .manifesto-aside h2{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,4vw,3.4rem);font-weight:400;line-height:1;letter-spacing:-.02em}
  .manifesto-aside h2 em{font-style:italic;color:var(--gold);display:block}
  .manifesto-copy{font-family:'Cormorant Garamond',serif;font-size:1.24rem;line-height:1.7;color:rgba(245,245,220,.82)}
  .manifesto-copy p{margin-bottom:1.3rem}
  .dropcap::first-letter{font-family:'Cormorant Garamond',serif;font-size:5.4rem;line-height:.72;float:left;padding:10px 14px 0 0;color:var(--gold)}
  .pullquote{font-size:clamp(1.7rem,3.2vw,2.5rem);font-style:italic;line-height:1.25;color:var(--cream);border-left:1px solid var(--gold);padding-left:26px;margin:38px 0}
  .manifesto-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:20px;margin-top:34px;padding-top:24px;border-top:1px solid var(--line)}
  .manifesto-facts span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:5px}
  .manifesto-facts strong{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:1.2rem}
  .plates{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
  .plate-tile{border:1px solid var(--line);padding:10px;background:rgba(13,40,24,.28);transition:border-color .3s,transform .4s}
  .plate-tile:hover{border-color:var(--gold);transform:translateY(-5px)}
  .plate-tile:nth-child(1){grid-column:span 2}
  .tile-media{position:relative;aspect-ratio:4/5;overflow:hidden;background:linear-gradient(150deg,#123a22,#05140A)}
  .plate-tile:nth-child(1) .tile-media{aspect-ratio:16/10}
  .plate-tile img{width:100%;height:100%;object-fit:cover;filter:brightness(.78) contrast(1.05);transition:transform 1s cubic-bezier(.2,.7,.2,1),filter .5s}
  .plate-tile:hover img{transform:scale(1.05);filter:brightness(.92)}
  .tile-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  .tile-empty span{font-family:'Cormorant Garamond',serif;font-size:2.6rem;color:rgba(201,162,39,.55)}
  .plate-line{position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .5s}
  .plate-tile:hover .plate-line{transform:scaleX(1)}
  .plate-tile figcaption{display:flex;justify-content:space-between;gap:10px;margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
  .catalogue{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:26px}
  .entry{border:1px solid var(--line);background:rgba(13,40,24,.25);transition:border-color .3s,transform .4s}
  .entry:hover{border-color:var(--gold);transform:translateY(-6px)}
  .entry-media{aspect-ratio:4/3;overflow:hidden;background:var(--panel)}
  .entry-media img{transition:transform 1s cubic-bezier(.2,.7,.2,1)}
  .entry:hover .entry-media img{transform:scale(1.05)}
  .entry-body{padding:20px 22px 24px}
  .entry-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
  .entry-no{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;color:var(--gold)}
  .entry-price{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.05rem;color:var(--gold)}
  .entry h3{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:500;line-height:1.15}
  .entry p{color:var(--dim);font-size:.84rem;margin-top:8px;line-height:1.6}
  .voices{background:var(--panel2);border-block:1px solid var(--line);position:relative;z-index:2;scroll-margin-top:84px}
  .voices-inner{max-width:1000px;margin:0 auto;padding:100px 6vw;text-align:center}
  .voices .kicker{text-align:center}
  .voices h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(2.2rem,4.6vw,3.6rem);line-height:1.05}
  .voices h2 em{font-style:italic;color:var(--gold)}
  .rating-line{display:flex;align-items:center;justify-content:center;gap:18px;margin:30px 0 8px}
  .rating-line strong{font-family:'Cormorant Garamond',serif;font-size:2.6rem;font-weight:500;line-height:1}
  .stars{color:var(--gold);letter-spacing:.12em;font-size:1rem}
  .stars .off{opacity:.22}
  .rating-caption{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--dim)}
  .voice{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.35rem,2.6vw,1.9rem);line-height:1.45;color:rgba(245,245,220,.86);margin:36px auto 0;max-width:36ch}
  .voice-rule{width:64px;height:1px;background:var(--gold);margin:26px auto}
  .voice-by{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}
  .colophon{background:var(--panel);border-top:1px solid var(--line);position:relative;z-index:2;scroll-margin-top:84px}
  .colophon-inner{max-width:1360px;margin:0 auto;padding:96px 6vw;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:6vw}
  .colophon h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(2.4rem,5vw,4rem);line-height:.98;letter-spacing:-.02em}
  .colophon h2 em{font-style:italic;color:var(--gold)}
  .colophon-address{color:var(--dim);margin:22px 0 28px;max-width:32ch}
  .colophon-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px 32px}
  .colophon-item span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
  .colophon-item a,.colophon-item p{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--cream);word-break:break-word}
  .colophon-item a:hover{color:var(--gold)}
  .hours{list-style:none;font-family:'Inter',sans-serif;font-size:.8rem;color:var(--dim)}
  .hours li{display:flex;justify-content:space-between;gap:16px;padding:2px 0}
  .colophon-note{font-family:'Inter',sans-serif;font-size:.8rem;color:var(--dim)}
  footer{position:relative;z-index:2;border-top:1px solid var(--line);padding:28px 6vw;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(245,245,220,.4)}
  @media(max-width:980px){
    .hero{grid-template-columns:1fr;gap:48px;padding:130px 6vw 70px;min-height:auto}
    .plate{max-width:520px}
    .seal{right:6px;top:-38px;width:76px;height:76px;font-size:1rem}
    .scroll-cue{display:none}
    .manifesto{grid-template-columns:1fr;gap:36px}
    .manifesto-aside{position:static}
    .plates{grid-template-columns:repeat(2,1fr)}
    .plate-tile:nth-child(1){grid-column:span 2}
    .colophon-inner{grid-template-columns:1fr;gap:44px}
  }
  @media(max-width:760px){
    .burger{display:flex}
    .navlinks{position:fixed;top:72px;left:16px;right:16px;flex-direction:column;align-items:flex-start;gap:2px;background:rgba(5,20,10,.98);padding:14px 20px;border:1px solid var(--line);opacity:0;transform:translateY(-8px);pointer-events:none;transition:.28s}
    .navlinks.open{opacity:1;transform:none;pointer-events:auto}
    .navlinks a{padding:10px 0;width:100%}
    .nav-cta{text-align:center;justify-content:center;display:flex;margin-top:6px}
    .section{padding:76px 5vw}
    .plates{grid-template-columns:1fr}
    .plate-tile:nth-child(1){grid-column:span 1}
    .voices-inner{padding:76px 5vw}
    .hero-meta{grid-template-columns:1fr 1fr}
    .colophon-grid{grid-template-columns:1fr}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}
    .reveal{opacity:1;transform:none}
    .seal{animation:none}
  }
  `

  return `${documentHead(b.name || 'Business', 'family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500', css + HERO_RAIL_STYLES)}
  ${GRAIN_OVERLAY}
  <div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="#top"><span class="brand-mark">${escapeHtml(initials(b.name))}</span><span class="brand-name">${name}</span></a>
      <nav class="navlinks">
        <a href="#about">Ethos</a>
        <a href="#gallery">Plates</a>
        ${hasProducts ? '<a href="#products">Catalogue</a>' : ''}
        <a href="#reviews">Voices</a>
        <a href="#contact">Colophon</a>
        ${customLinks(b).slice(0, 2).map((link) => siteLinkHtml(link)).join('')}
        <a class="nav-cta" href="${escapeHtml(primaryCta(b, 'Enquire').url)}"${anchorAttrs(primaryCta(b, 'Enquire').url)}>${escapeHtml(primaryCta(b, 'Enquire').label)}</a>
      </nav>
      <button class="burger" data-burger aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero" id="top">
    <div class="hero-copy">
      <div class="overline reveal">${category}${location ? ` — ${location}` : ''}</div>
      <h1 class="reveal" style="transition-delay:70ms">${name}</h1>
      <p class="hero-sub reveal" style="transition-delay:140ms">A considered ${category.toLowerCase()}, quietly done.</p>
      <p class="hero-desc reveal" style="transition-delay:200ms">${escapeHtml(truncate(description, 190))}</p>
      <div class="hero-meta reveal" style="transition-delay:260ms">
        <div><span>Based in</span><strong>${city || 'India'}</strong></div>
        <div><span>Practice</span><strong>${category}</strong></div>
        <div><span>Plates</span><strong>${String(Math.max(images.length, 4)).padStart(2, '0')}</strong></div>
      </div>
      <div class="hero-actions reveal" style="transition-delay:320ms">
        <a class="btn btn-solid" href="${escapeHtml(primaryCta(b, 'Enquire').url)}"${anchorAttrs(primaryCta(b, 'Enquire').url)}>${escapeHtml(primaryCta(b, 'Enquire').label)}</a>
        <a class="btn btn-ghost" href="${escapeHtml(secondaryCta(b, 'View the plates', '#gallery').url)}"${anchorAttrs(secondaryCta(b, 'View the plates', '#gallery').url)}>${escapeHtml(secondaryCta(b, 'View the plates', '#gallery').label)}</a>
      </div>
    </div>
    <div class="plate reveal" style="transition-delay:180ms">
      <div class="seal">${escapeHtml(initials(b.name))}</div>
      <div class="plate-media">
        ${hero ? `<img src="${escapeHtml(hero)}" alt="${name}">` : `<div class="plate-empty"><span>${escapeHtml(initials(b.name))}</span></div>`}
      </div>
      <div class="plate-caption"><span>Pl. I</span><span>${city || category}</span></div>
    </div>
    <a class="scroll-cue" href="#about"><span></span>Scroll</a>
  </section>

  ${heroRailHtml(images, b)}

  <div class="ticker" aria-hidden="true">
    <div class="ticker-track">
      ${[category, 'Collected with care', city, 'By appointment', 'Est. locally', category, 'Collected with care', city, 'By appointment', 'Est. locally'].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
    </div>
  </div>

  <section class="section" id="index">
    <div class="section-head reveal">
      <span class="kicker">Contents</span>
      <h2>An index of <em>the house</em>.</h2>
    </div>
    <nav class="index reveal">
      ${indexRows.map(([no, label, href]) => `<a href="${href}"><span class="index-no">${no}</span><span class="index-name">${label}</span><span class="index-arrow">→</span></a>`).join('')}
    </nav>
  </section>

  <section class="section" id="about">
    <div class="manifesto">
      <aside class="manifesto-aside reveal">
        <span class="kicker">01 — Ethos</span>
        <h2>A small house,<em>a long view.</em></h2>
      </aside>
      <div class="manifesto-copy reveal">
        <p class="dropcap">${escapeHtml(lede)}</p>
        ${rest.map((part) => `<p>${escapeHtml(part)}</p>`).join('')}
        <p>We keep our circle small and our standards high. Everything we make or stock is chosen for how it ages, how it feels, and how it serves the people who live with it. Find us at ${escapeHtml(listText([b.address, b.city, b.state], ', '))}.</p>
        <blockquote class="pullquote">“Buy less. Choose well. Make it last.”</blockquote>
        <div class="manifesto-facts">
          <div><span>Practice</span><strong>${category}</strong></div>
          <div><span>Location</span><strong>${city || '—'}</strong></div>
          ${rating > 0 ? `<div><span>Rating</span><strong>${rating.toFixed(1)} / 5</strong></div>` : ''}
          <div><span>Plates</span><strong>${images.length}</strong></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="section-head reveal">
      <span class="kicker">02 — Plates</span>
      <h2>Field notes &amp; <em>objects</em>.</h2>
      <p class="section-note">A visual record of the space, the work and the details in between.</p>
    </div>
    <div class="plates">${galleryTiles}</div>
  </section>

  ${productsHtml}

  <section class="voices" id="reviews">
    <div class="voices-inner">
      <span class="kicker reveal">04 — Voices</span>
      <h2 class="reveal">Words we <em>keep</em>.</h2>
      ${reviews > 0
        ? `<div class="rating-line reveal"><strong>${rating.toFixed(1)}</strong><span class="stars">${starsHtml(rating)}</span></div>
           <p class="rating-caption reveal">${reviews} verified review${reviews === 1 ? '' : 's'}</p>
           <p class="voice reveal">“Quietly excellent. The kind of place you remember and return to — every detail considered, nothing rushed.”</p>
           <div class="voice-rule reveal"></div>
           <p class="voice-by reveal">Verified guest — ${city || 'India'}</p>`
        : `<p class="voice reveal">“A new address worth watching. Reviews from our first guests will appear here.”</p>
           <div class="voice-rule reveal"></div>
           <p class="voice-by reveal">Newly listed on BusinessHub</p>`}
    </div>
  </section>

  <section class="colophon" id="contact">
    <div class="colophon-inner">
      <div class="reveal">
        <span class="kicker">05 — Colophon</span>
        <h2>Visit, write,<br><em>or call.</em></h2>
        <p class="colophon-address">${escapeHtml(listText([b.address, b.city, b.state], ', '))}</p>
        <a class="btn btn-solid" href="${escapeHtml(mapHref(b))}" target="_blank" rel="noopener noreferrer">Open in Maps</a>
      </div>
      <div class="colophon-grid reveal">
        <div class="colophon-item"><span>Telephone</span><a href="${escapeHtml(telHref(b.phone))}">${escapeHtml(b.phone || '—')}</a></div>
        ${b.email ? `<div class="colophon-item"><span>Email</span><a href="mailto:${escapeHtml(String(b.email))}">${escapeHtml(String(b.email))}</a></div>` : ''}
        ${b.whatsapp ? `<div class="colophon-item"><span>WhatsApp</span><a href="${escapeHtml(waHref(String(b.whatsapp)))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.whatsapp))}</a></div>` : ''}
        <div class="colophon-item"><span>Hours</span>${hoursHtml}</div>
        ${b.website ? `<div class="colophon-item"><span>Web</span><a href="${escapeHtml(String(b.website))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(b.website))}</a></div>` : ''}
      </div>
    </div>
    <footer>
      <span>© <span data-year>${new Date().getFullYear()}</span> ${name}</span>
      <span>${location || 'India'} · ${category}</span>
    </footer>
  </section>

  <script>(function(){var glow=document.getElementById('cursorGlow');if(!glow)return;if(!window.matchMedia||!window.matchMedia('(pointer:fine)').matches){glow.style.display='none';return;}var x=window.innerWidth/2,y=window.innerHeight/2,cx=x,cy=y;window.addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY;},{passive:true});(function loop(){cx+=(x-cx)*0.08;cy+=(y-cy)*0.08;glow.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop);})();})();</script>
  ${UI_SCRIPT}
  ${HERO_RAIL_SCRIPT}
  ${NAV_INTERCEPTOR_SCRIPT}
  </body></html>`
}
