import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateWebsite, publishWebsite, rollbackWebsite, websiteStatus } from '@/lib/site-store'

export const dynamic = 'force-dynamic'

async function actorOwnsListing(userId: unknown, businessId: string) {
  if (!userId) return { ok: false as const, status: 401, error: 'Please sign in to manage this website' }
  const [business, actor] = await Promise.all([
    db.business.findUnique({ where: { id: businessId }, select: { id: true, ownerId: true } }),
    db.user.findUnique({ where: { id: String(userId) }, select: { id: true, isAdmin: true } })
  ])
  if (!business) return { ok: false as const, status: 404, error: 'Listing not found' }
  if (!actor) return { ok: false as const, status: 401, error: 'Account not found' }
  if (!actor.isAdmin && business.ownerId !== actor.id) {
    return { ok: false as const, status: 403, error: 'You can only manage your own listing' }
  }
  return { ok: true as const }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const status = await websiteStatus(id)
  return NextResponse.json({ ok: true, ...status })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}) as Record<string, unknown>)
  const guard = await actorOwnsListing(body.userId, id)
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  const origin = new URL(request.url).origin
  const action = String(body.action || '')

  try {
    if (action === 'generate') {
      const result = await generateWebsite(id, origin, body.family ? String(body.family) : null)
      return NextResponse.json({ ok: true, ...result })
    }
    if (action === 'publish') {
      const result = await publishWebsite(id, origin, body.version ? Number(body.version) : undefined)
      return NextResponse.json({ ok: true, ...result })
    }
    if (action === 'rollback') {
      if (!body.version) return NextResponse.json({ error: 'Pick a version to restore' }, { status: 400 })
      const result = await rollbackWebsite(id, Number(body.version))
      return NextResponse.json({ ok: true, ...result })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const e = err as { message?: string }
    return NextResponse.json({ error: e.message || 'The website build failed' }, { status: 400 })
  }
}
