import { db } from '../src/lib/db'
async function main() {
  const businesses = await db.business.findMany({ select: { category: true, subcategory: true, city: true, tags: true, name: true } })
  const cats = new Map<string, number>()
  const cities = new Map<string, number>()
  const allTags = new Set<string>()
  for (const b of businesses) {
    cats.set(b.category, (cats.get(b.category) || 0) + 1)
    cities.set(b.city, (cities.get(b.city) || 0) + 1)
    b.tags.split(',').filter(Boolean).forEach((t: string) => allTags.add(t.trim()))
  }
  console.log('=== CATEGORIES ===')
  for (const [c, n] of cats) console.log(`  ${c}: ${n}`)
  console.log('=== CITIES ===')
  for (const [c, n] of cities) console.log(`  ${c}: ${n}`)
  console.log('=== TAGS ===')
  console.log([...allTags].join(', '))
}
main().finally(() => db.$disconnect())
