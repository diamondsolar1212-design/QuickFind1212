import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { toBusinessData } from '@/lib/business-site'
import { applySiteExperience } from '@/lib/templates/shared'
import { buildEngineSite, isEngineSkin, renderEngineNotFound } from '@/lib/site-engine'
import type { PageId } from '@/lib/site-engine/types'

export const dynamic = 'force-dynamic'

/** Slugs that resolve to a standard page when the profile names it differently. */
const ALIASES: Record<string, PageId> = {
  products: 'products',
  about: 'about',
  contact: 'contact',
  menu: 'products',
  services: 'products',
  catalogue: 'products',
  properties: 'products',
  courses: 'products',
  destinations: 'products',
  portfolio: 'about',
  lookbook: 'about'
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; page: string }> }
) {
  const { id, page } = await params
  if (!id) return new Response('Missing business id', { status: 400 })

  const business = await db.business.findUnique({ where: { id } }).catch(() => null)
  if (!business) return new Response('Business not found', { status: 404 })

  const data = toBusinessData(business)
  const wanted = String(page || '').toLowerCase()
  const htmlHeaders = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Frame-Options': 'SAMEORIGIN'
  } as Record<string, string>

  // Skins outside the engine are single-page, so their inner URLs resolve home.
  if (!isEngineSkin(data.template)) {
    return Response.redirect(new URL(`/business/${id}/website`, _request.url), 307)
  }

  const origin = new URL(_request.url).origin
  const bundle = buildEngineSite(id, data, { origin })
  // A slug only exists when the composition actually published a page for it,
  // so a listing with no catalogue has no /products URL rather than an empty one.
  const composed = bundle.pages.filter((p) => p.slug === wanted || p.id === wanted)[0]
  const alias = composed ? composed.id : ALIASES[wanted]
  const target = alias && bundle.pages.filter((p) => p.id === alias)[0]

  if (!target) {
    return new Response(renderEngineNotFound(id, data, { origin }), { status: 404, headers: htmlHeaders })
  }
  return new Response(applySiteExperience(bundle.document(target.id), data), { headers: htmlHeaders })
}
