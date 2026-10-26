import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin-only: dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [
      totalBusinesses,
      totalUsers,
      totalReviews,
      verifiedCount,
      premiumCount,
      recentBusinesses,
      allBusinessesForGrouping
    ] = await Promise.all([
      db.business.count(),
      db.user.count(),
      db.review.count(),
      db.business.count({ where: { verified: true } }),
      db.business.count({ where: { premium: true } }),
      db.business.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, category: true, city: true, createdAt: true, verified: true, premium: true }
      }),
      // Fetch all for in-memory grouping (SQLite has limited groupBy support)
      db.business.findMany({ select: { city: true, category: true } })
    ])

    // Group by city (in-memory)
    const cityMap = new Map<string, number>()
    const categoryMap = new Map<string, number>()
    for (const b of allBusinessesForGrouping) {
      cityMap.set(b.city, (cityMap.get(b.city) || 0) + 1)
      categoryMap.set(b.category, (categoryMap.get(b.category) || 0) + 1)
    }
    const businessesByCity = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    const businessesByCategory = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    return NextResponse.json({
      stats: {
        totalBusinesses,
        totalUsers,
        totalReviews,
        verifiedCount,
        premiumCount,
        pendingVerification: totalBusinesses - verifiedCount,
        nonPremiumCount: totalBusinesses - premiumCount,
        recentBusinesses,
        businessesByCity,
        businessesByCategory
      }
    })
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
