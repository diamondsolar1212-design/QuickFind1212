import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Haversine distance in km
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase().trim() || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city')?.toLowerCase().trim() || ''
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = parseFloat(searchParams.get('radius') || '50')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const type = searchParams.get('type')
    const verifiedOnly = searchParams.get('verified') === 'true'
    const premiumOnly = searchParams.get('premium') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    let businesses = await db.business.findMany({
      take: 500,
      // Sort order: Premium first, then Verified, then rating, then reviewCount
      orderBy: [
        { premium: 'desc' },
        { verified: 'desc' },
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      include: { reviews: { take: 5, orderBy: { createdAt: 'desc' } } }
    })

    if (q) {
      businesses = businesses.filter((b) =>
        [b.name, b.description, b.category, b.subcategory || '', b.tags, b.city, b.address]
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
    if (minRating > 0) {
      businesses = businesses.filter((b) => b.rating >= minRating)
    }
    if (type === 'B2B') businesses = businesses.filter((b) => b.isB2B)
    if (type === 'B2C') businesses = businesses.filter((b) => b.isB2C)
    if (verifiedOnly) businesses = businesses.filter((b) => b.verified)
    if (premiumOnly) businesses = businesses.filter((b) => b.premium)

    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const withDistance = businesses.map((b) => ({
        ...b,
        distance: haversine(userLat, userLng, b.lat, b.lng)
      }))
      const filtered = withDistance.filter((b) => b.distance <= radius)
      // Sort: Premium first → Verified next → then by distance
      filtered.sort((a, b) => {
        if (a.premium !== b.premium) return a.premium ? -1 : 1
        if (a.verified !== b.verified) return a.verified ? -1 : 1
        return a.distance - b.distance
      })
      return NextResponse.json({ businesses: filtered.slice(0, limit), total: filtered.length })
    }

    return NextResponse.json({ businesses: businesses.slice(0, limit), total: businesses.length })
  } catch (err) {
    console.error('[GET /api/businesses]', err)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const required = ['name', 'description', 'category', 'phone', 'address', 'city', 'state', 'lat', 'lng', 'ownerId']
    for (const f of required) {
      if (body[f] === undefined || body[f] === null || body[f] === '') {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
      }
    }

    const business = await db.business.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory || null,
        tags: body.tags || '',
        phone: body.phone,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        website: body.website || null,
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode || null,
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
        isB2B: !!body.isB2B,
        isB2C: body.isB2C !== false,
        template: body.template || 'retail',
        websiteTemplate: body.websiteTemplate || 'elegant',
        themeColor: body.themeColor || '#0d9488',
        fontChoice: body.fontChoice || 'sans',
        layoutStyle: body.layoutStyle || 'standard',
        showGallery: body.showGallery !== false,
        showHours: body.showHours !== false,
        showReviews: body.showReviews !== false,
        showMap: body.showMap !== false,
        showProducts: body.showProducts !== false,
        imageColor: body.imageColor || '#0d9488',
        emoji: body.emoji || '🏪',
        hours: body.hours || '',
        products: body.products || '',
        imageUrls: body.imageUrls || '',
        profileImage: body.profileImage || '',
        liveTracking: !!body.liveTracking,
        ownerId: body.ownerId
      }
    })

    return NextResponse.json({ business }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/businesses]', err)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
