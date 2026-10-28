import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin-only: list all businesses with owner info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const q = searchParams.get('q')?.toLowerCase().trim() || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city')?.toLowerCase().trim() || ''
    const verifiedOnly = searchParams.get('verified') === 'true'
    const premiumOnly = searchParams.get('premium') === 'true'

    // Verify admin
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 403 })
    }

    let businesses = await db.business.findMany({
      orderBy: [{ premium: 'desc' }, { verified: 'desc' }, { createdAt: 'desc' }],
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } }
      }
    })

    if (q) {
      businesses = businesses.filter((b) =>
        [b.name, b.description, b.category, b.city, b.address, b.phone]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (category && category !== 'All') {
      businesses = businesses.filter((b) => b.category === category)
    }
    if (city) {
      businesses = businesses.filter((b) => b.city.toLowerCase().includes(city))
    }
    if (verifiedOnly) businesses = businesses.filter((b) => b.verified)
    if (premiumOnly) businesses = businesses.filter((b) => b.premium)

    return NextResponse.json({ businesses, total: businesses.length })
  } catch (err) {
    console.error('[GET /api/admin/businesses]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Admin-only: update business (verify/premium/delete)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, businessId, action, updates } = body

    // Verify admin
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (action === 'delete' || action === 'update') {
      if (!businessId) {
        return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
      }
    }

    if (action === 'update' && (!updates || typeof updates !== 'object')) {
      return NextResponse.json({ error: 'Updates are required' }, { status: 400 })
    }

    if (action === 'delete') {
      await db.business.delete({ where: { id: businessId } })
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    if (action === 'update') {
      // Allow admin to update any business field
      const allowed: Record<string, any> = {}
      const allowedFields = ['name', 'description', 'category', 'subcategory', 'tags', 'phone', 'whatsapp', 'email', 'website', 'address', 'city', 'state', 'pincode', 'verified', 'premium', 'isB2B', 'isB2C', 'template', 'websiteTemplate', 'profileImage', 'imageUrls', 'liveTracking']
      for (const f of allowedFields) {
        if (updates[f] !== undefined) allowed[f] = updates[f]
      }
      if (allowed.verified !== undefined) allowed.verified = Boolean(allowed.verified)
      if (allowed.premium !== undefined) allowed.premium = Boolean(allowed.premium)
      if (allowed.isB2B !== undefined) allowed.isB2B = Boolean(allowed.isB2B)
      if (allowed.isB2C !== undefined) allowed.isB2C = Boolean(allowed.isB2C)
      const business = await db.business.update({
        where: { id: businessId },
        data: allowed
      })
      return NextResponse.json({ business })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/admin/businesses]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
