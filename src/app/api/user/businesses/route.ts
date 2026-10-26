import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get current user's businesses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const businesses = await db.business.findMany({
      where: { ownerId: userId },
      orderBy: [{ premium: 'desc' }, { createdAt: 'desc' }],
      include: { reviews: { take: 3, orderBy: { createdAt: 'desc' } } }
    })

    return NextResponse.json({ businesses, total: businesses.length })
  } catch (err) {
    console.error('[GET /api/user/businesses]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Update own business (owner only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, businessId, action, updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership
    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    if (business.ownerId !== userId) {
      return NextResponse.json({ error: 'You do not own this business' }, { status: 403 })
    }

    if (action === 'delete') {
      await db.business.delete({ where: { id: businessId } })
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    if (action === 'update') {
      const allowed: Record<string, any> = {}
      const allowedFields = [
        'name', 'description', 'category', 'subcategory', 'tags',
        'phone', 'whatsapp', 'email', 'website',
        'address', 'city', 'state', 'pincode',
        'isB2B', 'isB2C',
        'websiteTemplate', 'profileImage', 'imageUrls', 'liveTracking',
        'hours', 'products'
      ]
      for (const f of allowedFields) {
        if (updates[f] !== undefined) allowed[f] = updates[f]
      }
      const updated = await db.business.update({
        where: { id: businessId },
        data: allowed
      })
      return NextResponse.json({ business: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/user/businesses]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
