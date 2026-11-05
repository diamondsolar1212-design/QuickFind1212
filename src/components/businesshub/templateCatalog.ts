import { Sparkles } from 'lucide-react'
import { COLLECTION_TEMPLATES } from '@/lib/templates/collection-meta'
import { STOREFRONT_TEMPLATES } from '@/lib/templates/storefront-meta'

export interface TemplateChoice {
  id: string
  icon: typeof Sparkles
  /** Translation key for the base layouts, plain label for designer skins. */
  name: string
  desc: string
  color: string
  emoji: string
  premium: boolean
  designer: boolean
  /** Rendered by the rule-based site engine, so the layout follows the data. */
  engine: boolean
}

export const TEMPLATES: TemplateChoice[] = [
  // Storefront layouts — the product-site pack, always free
  ...STOREFRONT_TEMPLATES.map((tpl) => ({
    id: tpl.id,
    icon: Sparkles,
    name: tpl.name,
    desc: tpl.desc,
    color: tpl.color,
    emoji: tpl.emoji,
    premium: false,
    designer: false,
    engine: true
  })),
  // Designer collection — 20 legacy HTML sites, kept so existing rows still render
  { id: 'calm-sage', icon: Sparkles, name: 'Calm Sage', desc: 'Serene studio style — soft sand/sage tones', color: '#8a9a87', emoji: '🌿', premium: false, designer: true, engine: false },
  { id: 'jungle-gold', icon: Sparkles, name: 'Jungle Gold', desc: 'Editorial monograph — deep green + gold luxury', color: '#C9A227', emoji: '📖', premium: false, designer: true, engine: false },
  { id: 'athletic-bold', icon: Sparkles, name: 'Athletic Bold', desc: 'High-intensity gym — black + orange energy', color: '#FF5400', emoji: '💪', premium: false, designer: true, engine: false },
  { id: 'tech-lime', icon: Sparkles, name: 'Tech Lime', desc: 'Dark technical — lime green modern accents', color: '#d4ff3a', emoji: '⚡', premium: false, designer: true, engine: false },
  { id: 'journalism-red', icon: Sparkles, name: 'Journalism Red', desc: 'Tech review style — black + red editorial', color: '#ff2a2a', emoji: '📰', premium: false, designer: true, engine: false },
  ...COLLECTION_TEMPLATES.map((tpl) => ({
    id: tpl.id,
    icon: Sparkles,
    name: tpl.name,
    desc: tpl.desc,
    color: tpl.color,
    emoji: tpl.emoji,
    premium: false,
    designer: true,
    engine: false
  }))
]

/** The five design families new listings choose between. */
export const SITE_TEMPLATES: TemplateChoice[] = TEMPLATES.filter((tpl) => tpl.engine)

export function templateById(id: string): TemplateChoice | undefined {
  return TEMPLATES.find((tpl) => tpl.id === id)
}
