// HTML Template Engine — generates full premium single-page websites.
// Each template lives in its own module under ./templates so the markup,
// CSS and animation scripts stay readable; this file only normalises the
// database row and dispatches to the right generator.

import {
  applySiteExperience,
  collectImages,
  hoursEntries,
  type BusinessData,
  type HourEntry,
  type TemplateProduct,
} from './templates/shared'
import { generateCalmSage } from './templates/calm-sage'
import { generateJungleGold } from './templates/jungle-gold'
import { generateAthleticBold } from './templates/athletic-bold'
import { generateTechLime } from './templates/tech-lime'
import { generateJournalismRed } from './templates/journalism-red'
import { generateDefault } from './templates/default'
import { generateCollectionTemplate, isCollectionSkin } from './templates/collection'

export { MIN_IMAGES, withPreviewEditor, type BusinessData } from './templates/shared'

function parseProducts(raw: string): TemplateProduct[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is TemplateProduct => !!item && typeof item === 'object')
      .slice(0, 12)
  } catch {
    return []
  }
}

function parseHours(raw: string): HourEntry[] {
  if (!raw) return []
  try {
    return hoursEntries(JSON.parse(raw))
  } catch {
    return []
  }
}

export function generateBusinessWebsite(business: BusinessData): string {
  const images = collectImages(business)
  const products = parseProducts(business.products)
  const hours = parseHours(business.hours)

  let html: string
  if (isCollectionSkin(business.template)) {
    html = generateCollectionTemplate(business.template, business, images, products, hours)
  } else {
    switch (business.template) {
      case 'calm-sage':
        html = generateCalmSage(business, images, products, hours)
        break
      case 'jungle-gold':
        html = generateJungleGold(business, images, products, hours)
        break
      case 'athletic-bold':
        html = generateAthleticBold(business, images, products, hours)
        break
      case 'tech-lime':
        html = generateTechLime(business, images, products, hours)
        break
      case 'journalism-red':
        html = generateJournalismRed(business, images, products, hours)
        break
      default:
        html = generateDefault(business, images, products, hours)
    }
  }

  return applySiteExperience(html, business)
}
