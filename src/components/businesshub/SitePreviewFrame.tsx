'use client'

// Shared iframe shells for website previews: the scaled desktop frame plus the
// memoised template thumbnail used by the wizard and the owner's picker.

import { memo, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { generateBusinessWebsite, type BusinessData } from '@/lib/template-engine'

// 1440px keeps the site on its desktop breakpoints; a phone-width card shows the
// generated site in its desktop layout instead of collapsing to mobile.
const DESKTOP_VIEWPORT = 1440

export function ScaledSiteFrame({
  html,
  title,
  viewportWidth = DESKTOP_VIEWPORT,
  sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox',
  interactive = true,
  iframeRef,
  onLoad
}: {
  html: string
  title: string
  viewportWidth?: number
  sandbox?: string
  interactive?: boolean
  iframeRef?: RefObject<HTMLIFrameElement | null>
  onLoad?: () => void
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Only mint real iframes for previews near the viewport; 20 full websites
  // at once would stall the wizard.
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const scale = box.w > 0 ? box.w / viewportWidth : 0

  return (
    <div
      ref={boxRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: '#fff' }}
    >
      {scale > 0 && inView && (
        <iframe
          ref={iframeRef}
          onLoad={onLoad}
          srcDoc={html}
          title={title}
          style={{
            width: `${viewportWidth}px`,
            height: `${Math.max(box.h / scale, 320)}px`,
            border: 'none',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: interactive ? 'auto' : 'none'
          }}
          sandbox={sandbox}
          loading="lazy"
        />
      )}
    </div>
  )
}

// Template-grid sample: memoized so typing never rebuilds 20 sites.
export const TemplateThumb = memo(function TemplateThumb({ seed, id, color }: { seed: BusinessData; id: string; color: string }) {
  const html = useMemo(
    () => generateBusinessWebsite({ ...seed, template: id, themeColor: color }),
    [seed, id, color]
  )
  return (
    <ScaledSiteFrame
      html={html}
      title={id + ' preview'}
      viewportWidth={1100}
      sandbox="allow-same-origin allow-scripts allow-popups"
      interactive={false}
    />
  )
})
