// Product records in this app come from two sources:
//  - seeded demo data: { name, price, img: "🍕" }   (img holds an emoji)
//  - listings created in the UI: { id, name, price, details, image: "/uploads/x.jpg" }
// These helpers normalise both shapes so every renderer shows the right thing.

const URL_RE = /^(https?:\/\/|data:image\/|\/)/i

export interface ProductLike {
  name?: unknown
  price?: unknown
  details?: unknown
  description?: unknown
  image?: unknown
  img?: unknown
  emoji?: unknown
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** Returns a usable image URL for a product, or null when it only has an emoji. */
export function productImage(product: unknown): string | null {
  const p = (product ?? {}) as ProductLike
  for (const candidate of [p.image, p.img]) {
    const value = asTrimmedString(candidate)
    if (value && URL_RE.test(value)) return value
  }
  return null
}

/** Returns the emoji for a product, falling back to a generic package icon. */
export function productEmoji(product: unknown, fallback = '📦'): string {
  const p = (product ?? {}) as ProductLike
  for (const candidate of [p.img, p.emoji]) {
    const value = asTrimmedString(candidate)
    if (value && !URL_RE.test(value) && value.length <= 8) return value
  }
  return fallback
}

/** Parses the JSON `products` column without ever throwing. */
export function parseProducts(raw: unknown): ProductLike[] {
  if (typeof raw !== 'string' || raw.trim() === '') return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
