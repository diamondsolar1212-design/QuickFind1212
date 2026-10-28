import { NextRequest, NextResponse } from 'next/server'

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

// Map OSM amenity/shop keys to category + emoji
function mapOsmToCategory(tags: Record<string, string>): { category: string; emoji: string; imageColor: string } {
  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') {
    return { category: 'Restaurants', emoji: '🍽️', imageColor: '#dc2626' }
  }
  if (tags.amenity === 'cafe') {
    return { category: 'Food & Beverages', emoji: '☕', imageColor: '#92400e' }
  }
  if (tags.shop === 'supermarket' || tags.shop === 'convenience') {
    return { category: 'Grocery & Essentials', emoji: '🛒', imageColor: '#16a34a' }
  }
  if (tags.shop === 'clothes' || tags.shop === 'fashion') {
    return { category: 'Textiles & Apparel', emoji: '🧵', imageColor: '#7c3aed' }
  }
  if (tags.amenity === 'pharmacy' || tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'doctors') {
    return { category: 'Health & Wellness', emoji: '⚕️', imageColor: '#15803d' }
  }
  if (tags.amenity === 'fuel') {
    return { category: 'Automobile', emoji: '⛽', imageColor: '#475569' }
  }
  if (tags.shop === 'mobile_phone' || tags.shop === 'electronics') {
    return { category: 'Electronics', emoji: '📱', imageColor: '#0284c7' }
  }
  if (tags.amenity === 'bank' || tags.amenity === 'atm') {
    return { category: 'Finance', emoji: '🏦', imageColor: '#0e7490' }
  }
  if (tags.shop === 'hairdresser' || tags.shop === 'beauty') {
    return { category: 'Beauty & Personal Care', emoji: '💇', imageColor: '#be185d' }
  }
  if (tags.amenity === 'cinema' || tags.amenity === 'theatre') {
    return { category: 'Entertainment', emoji: '🎬', imageColor: '#db2777' }
  }
  if (tags.shop === 'bakery') {
    return { category: 'Food & Sweets', emoji: '🥐', imageColor: '#c026d3' }
  }
  if (tags.tourism) {
    return { category: 'Travel & Tourism', emoji: '📸', imageColor: '#0891b2' }
  }
  if (tags.office || tags.amenity === 'office') {
    return { category: 'Services', emoji: '🏢', imageColor: '#475569' }
  }
  // Default
  return { category: 'Local Business', emoji: '🏪', imageColor: '#6b7280' }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = parseInt(searchParams.get('radius') || '2000', 10) // meters, default 2km
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat or lng parameter' },
        { status: 400 }
      )
    }

    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)

    if (!Number.isFinite(userLat) || !Number.isFinite(userLng) ||
        userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
      return NextResponse.json(
        { error: 'Invalid lat or lng parameter' },
        { status: 400 }
      )
    }

    // Cap radius to 5km to avoid huge queries; clamp result count
    const safeRadius = Math.min(Math.max(Number.isFinite(radius) ? radius : 2000, 500), 5000)
    const safeLimit = Math.min(Math.max(Number.isFinite(limit) ? limit : 20, 1), 50)

    // Build Overpass QL query — fetch amenities + shops in radius
    const query = `[out:json][timeout:10];(
      node["amenity"~"restaurant|cafe|fast_food|pharmacy|hospital|clinic|doctors|bank|fuel|cinema|theatre"](around:${safeRadius},${userLat},${userLng});
      node["shop"~"supermarket|convenience|clothes|fashion|mobile_phone|electronics|bakery|hairdresser|beauty"](around:${safeRadius},${userLat},${userLng});
      node["tourism"](around:${safeRadius},${userLat},${userLng});
    );out body 50;`

    const overpassUrls = [
      'https://overpass.kumi.systems/api/interpreter', // Mirror 1
      'https://overpass-api.de/api/interpreter', // Mirror 2 (main)
      'https://overpass.private.coffee/api/interpreter' // Mirror 3
    ]

    let overpassData: any = null
    let lastError: any = null

    for (const overpassUrl of overpassUrls) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s per mirror

        try {
          const overpassRes = await fetch(overpassUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query),
            signal: controller.signal
          })

          if (overpassRes.ok) {
            overpassData = await overpassRes.json()
            break
          } else {
            lastError = new Error(`Overpass responded ${overpassRes.status}`)
          }
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (err: any) {
        lastError = err
        // Try next mirror
      }
    }

    // If Overpass failed entirely, return graceful empty state with helpful message
    if (!overpassData) {
      return NextResponse.json({
        nearby: [],
        total: 0,
        source: 'OpenStreetMap via Overpass API',
        radius: safeRadius,
        error: 'Nearby places service is busy right now. Please try again in a moment.',
        details: lastError?.message || 'Network error'
      })
    }

    const elements = overpassData.elements || []

    // Convert to our nearby POI format
    const nearby = elements
      .filter((el: any) => el.lat && el.lon && el.tags && (el.tags.name || el.tags.amenity || el.tags.shop))
      .map((el: any) => {
        const tags = el.tags || {}
        const meta = mapOsmToCategory(tags)
        const distance = haversine(userLat, userLng, el.lat, el.lon)
        return {
          id: `osm-${el.id}`,
          name: tags.name || `${meta.category} Place`,
          category: meta.category,
          emoji: meta.emoji,
          imageColor: meta.imageColor,
          type: tags.amenity || tags.shop || tags.tourism || 'place',
          address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']]
            .filter(Boolean)
            .join(' ') || 'Address not available',
          phone: tags['phone'] || tags['contact:phone'] || '',
          whatsapp: (() => {
            const raw = tags['contact:whatsapp'] || tags['whatsapp'] || ''
            const digits = raw.replace(/[^0-9]/g, '')
            return digits.length >= 10 && digits.length <= 15 ? digits : ''
          })(),
          website: tags['website'] || tags['contact:website'] || '',
          lat: el.lat,
          lng: el.lon,
          distance: Math.round(distance * 10) / 10,
          source: 'openstreetmap'
        }
      })
      .filter((p: any) => p.distance <= safeRadius / 1000)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, safeLimit)

    return NextResponse.json({
      nearby,
      total: nearby.length,
      source: 'OpenStreetMap via Overpass API',
      radius: safeRadius
    })
  } catch (err: any) {
    console.error('[GET /api/nearby]', err.message || err)

    // If it was an abort error, return a friendly message
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Nearby places request timed out. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    )
  }
}
