// Picker metadata for the five storefront templates ported from the
// "5-premium-product-website-templates" pack. Kept out of the renderer so
// client bundles pull labels and colours, not the HTML generator.

export interface StorefrontTemplateMeta {
  id: string
  name: string
  desc: string
  color: string
  emoji: string
  font: string
}

export const STOREFRONT_TEMPLATES: StorefrontTemplateMeta[] = [
  { id: 'luxury-editorial', name: 'Luxury Editorial', desc: 'Ivory & warm neutrals — editorial serif boutique', color: '#a77b45', emoji: '🥂', font: 'Playfair Display · DM Sans' },
  { id: 'modern-dark', name: 'Modern Dark', desc: 'Charcoal & acid green — high-contrast studio', color: '#b7f36b', emoji: '🌑', font: 'DM Sans · DM Sans' },
  { id: 'minimal-contemporary', name: 'Minimal Contemporary', desc: 'White & soft grey — quiet retail grid', color: '#527c70', emoji: '⬜', font: 'DM Sans · DM Sans' },
  { id: 'organic-lifestyle', name: 'Organic Lifestyle', desc: 'Earth, terracotta & olive — artisan brand', color: '#b65f43', emoji: '🪴', font: 'Playfair Display · DM Sans' },
  { id: 'bold-creative', name: 'Bold Creative', desc: 'Cobalt & orange — expressive statement shop', color: '#ff5b35', emoji: '🎨', font: 'DM Sans · DM Sans' }
]
