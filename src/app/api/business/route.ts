import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    const business = await db.business.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: 'desc' } } }
    })
    if (!business) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ business })
  } catch (err) {
    console.error('[GET /api/business]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Fields an owner may edit from the public site (admin-only flags such as
// `premium` / `verified` are intentionally excluded — use /api/admin/businesses).
const OWNER_EDITABLE_FIELDS = [
  'websiteTemplate', 'profileImage', 'imageUrls', 'liveTracking',
  'themeColor', 'fontChoice', 'layoutStyle', 'template',
  'showGallery', 'showHours', 'showReviews', 'showMap', 'showProducts',
  'ctaLabel', 'ctaUrl', 'cta2Label', 'cta2Url', 'links'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // If action=update, treat as business update (e.g. website template, profile image)
    if (body.action === 'update') {
      const { businessId, updates, userId } = body
      if (!businessId || !updates || typeof updates !== 'object') {
        return NextResponse.json({ error: 'Missing businessId or updates' }, { status: 400 })
      }
      if (!userId) {
        return NextResponse.json({ error: 'Please sign in to edit this listing' }, { status: 401 })
      }

      const [business, actor] = await Promise.all([
        db.business.findUnique({ where: { id: businessId }, select: { id: true, ownerId: true } }),
        db.user.findUnique({ where: { id: userId }, select: { id: true, isAdmin: true } })
      ])
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 })
      }
      if (!actor) {
        return NextResponse.json({ error: 'Account not found' }, { status: 401 })
      }
      if (!actor.isAdmin && business.ownerId !== actor.id) {
        return NextResponse.json({ error: 'You can only edit your own listing' }, { status: 403 })
      }

      const allowed: Record<string, unknown> = {}
      for (const f of OWNER_EDITABLE_FIELDS) {
        if (updates[f] !== undefined) allowed[f] = updates[f]
      }
      if (Object.keys(allowed).length === 0) {
        return NextResponse.json({ error: 'No editable fields supplied' }, { status: 400 })
      }

      const updated = await db.business.update({
        where: { id: businessId },
        data: allowed
      })
      return NextResponse.json({ business: updated })
    }

    // Default: add review
    const { businessId, comment, userName, userId } = body
    const rating = Number(body.rating)
    if (!businessId || !userName || !comment) {
      return NextResponse.json({ error: 'Please provide a name, rating and comment' }, { status: 400 })
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be a whole number between 1 and 5' }, { status: 400 })
    }
    const cleanName = String(userName).trim().slice(0, 80)
    const cleanComment = String(comment).trim().slice(0, 2000)
    if (!cleanName || !cleanComment) {
      return NextResponse.json({ error: 'Please provide a name and comment' }, { status: 400 })
    }

    const business = await db.business.findUnique({ where: { id: businessId }, select: { id: true } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    let reviewerId: string | null = null
    if (userId) {
      const reviewer = await db.user.findUnique({ where: { id: String(userId) }, select: { id: true } })
      reviewerId = reviewer?.id ?? null
    }

    const review = await db.review.create({
      data: {
        businessId,
        rating,
        comment: cleanComment,
        userName: cleanName,
        userId: reviewerId
      }
    })

    // Recalculate aggregate rating
    const reviews = await db.review.findMany({ where: { businessId }, select: { rating: true } })
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await db.business.update({
      where: { id: businessId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/business]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
