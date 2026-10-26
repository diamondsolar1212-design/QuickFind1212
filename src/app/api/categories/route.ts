import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const businesses = await db.business.findMany({ select: { category: true, subcategory: true } })
    const categoryMap: Record<string, { count: number; subcategories: Set<string>; emoji: string }> = {}

    const emojiMap: Record<string, string> = {
      'Grocery & Essentials': '🛒',
      'Restaurants': '🍽️',
      'Home Services': '🔧',
      'Textiles & Apparel': '🧵',
      'Food & Sweets': '🍯',
      'Food & Beverages': '☕',
      'Automobile': '🚗',
      'Electronics': '📱',
      'Health & Wellness': '🌿',
      'Handicrafts & Art': '🎨',
      'Beauty & Personal Care': '💇',
      'Real Estate': '🏠',
      'Doctors': '⚕️',
      'Wedding Planning': '💍',
      'Education': '🎓',
      'Travel Booking': '✈️',
      'B2B Suppliers': '🏭',
      'Repair Services': '🛠️'
    }

    for (const b of businesses) {
      if (!categoryMap[b.category]) {
        categoryMap[b.category] = { count: 0, subcategories: new Set(), emoji: emojiMap[b.category] || '🏪' }
      }
      categoryMap[b.category].count++
      if (b.subcategory) categoryMap[b.category].subcategories.add(b.subcategory)
    }

    const categories = Object.entries(categoryMap).map(([name, info]) => ({
      name,
      count: info.count,
      emoji: info.emoji,
      subcategories: Array.from(info.subcategories)
    }))

    return NextResponse.json({ categories })
  } catch (err) {
    console.error('[GET /api/categories]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
