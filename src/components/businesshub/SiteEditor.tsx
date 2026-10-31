'use client'

// Live website builder shown to the listing owner.
// The generated site is rendered in an iframe with a click-to-edit layer:
// clicking any outlined text lets the provider rewrite it in place. Changes
// are collected locally, then saved to Business.siteContent in one go.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ExternalLink, Eye, Loader2, Pencil, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { generateBusinessWebsite, withPreviewEditor } from '@/lib/template-engine'
import { sanitizeSiteContent } from '@/lib/templates/shared'
import { parseProducts } from '@/lib/products'
import { toBusinessData } from '@/lib/business-site'
import { Button } from '@/components/ui/button'

type Draft = {
  texts: Record<string, string>
  copy: Record<string, string>
  products: Record<string, string>
  ctaLabel?: string
  cta2Label?: string
}

const EMPTY_DRAFT: Draft = { texts: {}, copy: {}, products: {} }

const SITE_PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Products & services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
]

function parseContent(raw: unknown): Record<string, any> {
  if (typeof raw !== 'string' || !raw.trim()) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function mergeDraft(raw: string, draft: Draft): string {
  const base = parseContent(raw)
  const merged: Record<string, any> = { ...base, ...draft.copy }
  delete merged.ctaLabel
  delete merged.cta2Label
  const texts = {
    ...(base.texts && typeof base.texts === 'object' ? base.texts : {}),
    ...draft.texts
  }
  for (const [key, value] of Object.entries(texts)) {
    if (!String(value ?? '').trim()) delete texts[key]
  }
  if (Object.keys(texts).length > 0) merged.texts = texts
  else delete merged.texts
  return sanitizeSiteContent(merged)
}

export function SiteEditor({
  business,
  userId,
  onSaved
}: {
  business: any
  userId: string
  onSaved?: (updated: any) => void
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [content, setContent] = useState<string>(business.siteContent || '')
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [editing, setEditing] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activePage, setActivePage] = useState('home')
  // Bumped whenever the preview must be rebuilt even if the HTML is unchanged
  // (Discard / Save), so React remounts the iframe instead of keeping DOM edits.
  const [frameKey, setFrameKey] = useState(0)

  const build = useCallback(
    (siteContent: string, cta?: string, cta2?: string, products?: string | null) =>
      withPreviewEditor(
        generateBusinessWebsite(
          toBusinessData({
            ...business,
            siteContent,
            ctaLabel: cta ?? business.ctaLabel,
            cta2Label: cta2 ?? business.cta2Label,
            ...(products ? { products } : {})
          })
        )
      ),
    [business]
  )

  const [shownHtml, setShownHtml] = useState(() => build(business.siteContent || ''))

  // A new saved version (save, template switch, different business) resets the editor.
  useEffect(() => {
    setContent(business.siteContent || '')
    setDraft(EMPTY_DRAFT)
    setEditing(false)
    setFullscreen(false)
    setDirty(false)
    setShownHtml(build(business.siteContent || ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id, business.siteContent, business.template, business.products])

  const sendMode = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'site-edit-mode', enabled: editing },
      '*'
    )
    frameRef.current?.contentWindow?.postMessage({ type: 'site-page', page: activePage }, '*')
  }, [editing, activePage])

  // Answer the iframe's ready ping with the page the provider was looking at.
  const sendModeRef = useRef(sendMode)
  sendModeRef.current = sendMode

  const goPage = (page: string) => {
    setActivePage(page)
    frameRef.current?.contentWindow?.postMessage({ type: 'site-page', page }, '*')
  }

  useEffect(() => {
    const timer = setTimeout(sendMode, 90)
    return () => clearTimeout(timer)
  }, [sendMode, shownHtml])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return
      const data = event.data
      if (!data || typeof data !== 'object') return
      const value = String(data.value ?? '').replace(/\s+/g, ' ').trim()
      if (data.type === 'site-copy-edit' && typeof data.key === 'string') {
        if (data.key === 'ctaLabel') {
          setDraft((prev) => ({ ...prev, ctaLabel: value.slice(0, 40) }))
          setDirty(true)
          return
        }
        if (data.key === 'cta2Label') {
          setDraft((prev) => ({ ...prev, cta2Label: value.slice(0, 40) }))
          setDirty(true)
          return
        }
        setDraft((prev) => ({ ...prev, copy: { ...prev.copy, [data.key]: value } }))
        setDirty(true)
      } else if (data.type === 'site-text-edit' && typeof data.path === 'string') {
        setDraft((prev) => {
          const texts = { ...prev.texts }
          if (value) texts[data.path] = value.slice(0, 400)
          else delete texts[data.path]
          return { ...prev, texts }
        })
        setDirty(true)
      } else if (data.type === 'site-page-change' && typeof data.page === 'string') {
        setActivePage(data.page)
      } else if (data.type === 'site-ready') {
        sendModeRef.current()
      } else if (data.type === 'site-product-edit') {
        const index = Number(data.index)
        const field = String(data.field ?? '')
        if (!Number.isInteger(index) || index < 0) return
        if (field !== 'name' && field !== 'price') return
        setDraft((prev) => ({
          ...prev,
          products: { ...prev.products, [`${index}:${field}`]: value.slice(0, 120) }
        }))
        setDirty(true)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const nextContent = useMemo(() => mergeDraft(content, draft), [content, draft])
  const editedProducts = useMemo(() => {
    const entries = Object.entries(draft.products)
    if (entries.length === 0) return null
    const list = parseProducts(business.products).map((item) => ({ ...(item as Record<string, unknown>) }))
    for (const [key, value] of entries) {
      const [indexRaw, field] = key.split(':')
      const index = Number(indexRaw)
      if (!Number.isInteger(index) || index < 0 || !list[index]) continue
      if (field !== 'name' && field !== 'price') continue
      list[index][field] = value
    }
    return JSON.stringify(list)
  }, [draft.products, business.products])
  const canSave = dirty || nextContent !== content

  // Leaving full-screen editing re-renders the page from the draft, so nothing
  // typed or renamed is lost when the iframe is recreated at the normal size.
  const exitEditing = () => {
    setShownHtml(
      build(
        nextContent,
        draft.ctaLabel ?? business.ctaLabel,
        draft.cta2Label ?? business.cta2Label,
        editedProducts ?? business.products
      )
    )
    setEditing(false)
    setFullscreen(false)
  }

  const toggleEditing = () => {
    if (editing) {
      exitEditing()
    } else {
      setEditing(true)
      setFullscreen(true)
    }
  }

  // Full-screen editing should not scroll the page behind the overlay.
  // (Esc is left to the preview's own editor so it never closes the dialog.)
  useEffect(() => {
    if (!fullscreen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [fullscreen])

  const resetDraft = () => {
    setDraft(EMPTY_DRAFT)
    setDirty(false)
    setShownHtml(build(content))
    setFrameKey((value) => value + 1)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates: Record<string, unknown> = { siteContent: nextContent }
      if (draft.ctaLabel !== undefined) updates.ctaLabel = draft.ctaLabel
      if (draft.cta2Label !== undefined) updates.cta2Label = draft.cta2Label
      if (editedProducts !== null) updates.products = editedProducts
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          businessId: business.id,
          userId,
          updates
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.business) {
        toast.error(data.error || 'Could not save website text')
        return
      }
      setContent(nextContent)
      setDraft(EMPTY_DRAFT)
      setDirty(false)
      setEditing(false)
      setFullscreen(false)
      setShownHtml(
        build(nextContent, draft.ctaLabel ?? business.ctaLabel, draft.cta2Label ?? business.cta2Label)
      )
      setFrameKey((value) => value + 1)
      toast.success('Website text saved')
      window.dispatchEvent(new CustomEvent('business-updated', { detail: data.business }))
      onSaved?.(data.business)
    } catch {
      toast.error('Network error while saving')
    } finally {
      setSaving(false)
    }
  }

  const liveHref = `/business/${business.id}/website`

  const card = (
    <div
      className={
        fullscreen
          ? 'flex flex-1 flex-col min-h-0 bg-card overflow-hidden shadow-2xl sm:rounded-xl border border-brand/30'
          : 'rounded-xl overflow-hidden border border-border/60 shadow-lg bg-card'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-brand/10 border-b border-brand/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-brand flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> LIVE WEBSITE
            {fullscreen && (
              <span className="text-[9px] font-semibold uppercase tracking-wide bg-brand text-brand-foreground rounded-full px-1.5 py-0.5">
                Full screen
              </span>
            )}
          </span>
          {dirty && (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
              unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px]"
            onClick={() => window.open(liveHref, '_blank', 'noopener')}
          >
            <ExternalLink className="w-3 h-3 mr-1" /> View site
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editing ? 'default' : 'outline'}
            className="h-7 px-2 text-[11px]"
            onClick={toggleEditing}
            title={editing ? 'Finish editing and return to the page' : 'Open the full-screen text editor'}
          >
            {editing ? <Check className="w-3 h-3 mr-1" /> : <Pencil className="w-3 h-3 mr-1" />}
            {editing ? 'Done editing' : 'Edit text'}
          </Button>
          {canSave && (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px]"
                onClick={resetDraft}
                disabled={saving}
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Discard
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 px-2.5 text-[11px]"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-700 border-b border-amber-200">
          Click any outlined text (menu buttons, headings, paragraphs, buttons) to edit · Enter saves · Esc cancels
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-b border-border/60 bg-muted/20">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mr-1">Pages</span>
        {SITE_PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => goPage(page.id)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              activePage === page.id
                ? 'bg-brand text-brand-foreground border-brand'
                : 'bg-card text-muted-foreground border-border hover:border-brand/50 hover:text-brand'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div
        style={
          fullscreen
            ? { flex: 1, minHeight: 0, overflow: 'hidden', background: '#fff' }
            : { height: 'min(72vh, 760px)', minHeight: 420, overflow: 'hidden', background: '#fff' }
        }
      >
        <iframe
          key={frameKey}
          ref={frameRef}
          srcDoc={shownHtml}
          onLoad={sendMode}
          title={`${business.name} live website`}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
        />
      </div>

      <div className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border/60 bg-muted/20">
        Tip: your <strong>Products &amp; services</strong> page is always included. Click a product name or price in
        the preview to edit it, or add more products from <strong>Edit listing</strong> — customers can see prices and
        enquire directly.
      </div>
    </div>
  )

  if (fullscreen && typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex bg-slate-900/95 p-1 sm:p-3 pointer-events-auto">
        {card}
      </div>,
      document.body
    )
  }

  return card
}
