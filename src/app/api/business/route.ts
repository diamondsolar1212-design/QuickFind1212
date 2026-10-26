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

export async function POST(request: NextRequest) {
  // Add review
  try {
    const body = await request.json()
    const { businessId, rating, comment, userName, userId } = body
    if (!businessId || !rating || !userName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const review = await db.review.create({
      data: { businessId, rating: parseInt(rating), comment: comment || '', userName, userId: userId || null }
    })

    // Update aggregate
    const reviews = await db.review.findMany({ where: { businessId } })
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await db.business.update({
      where: { id: businessId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/business/review]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
