// Metadata for the 15 designer templates added to the collection.
// Kept separate from the renderer so client bundles only pull labels/colors.

export interface CollectionTemplateMeta {
  id: string
  name: string
  desc: string
  color: string
  emoji: string
  font: string
}

export const COLLECTION_TEMPLATES: CollectionTemplateMeta[] = [
  { id: 'blush-atelier', name: 'Blush Atelier', desc: 'Romantic rose & ivory — boutique salon / studio mood', color: '#d96a7a', emoji: '🌸', font: 'Playfair Display · Karla' },
  { id: 'coastal-drift', name: 'Coastal Drift', desc: 'Ocean navy & sand — calm travel / wellness look', color: '#0e7490', emoji: '🌊', font: 'DM Serif Display · Outfit' },
  { id: 'noir-edition', name: 'Noir Edition', desc: 'Black & champagne — high-fashion editorial', color: '#c9a96e', emoji: '🖤', font: 'Bodoni Moda · Manrope' },
  { id: 'citrus-studio', name: 'Citrus Studio', desc: 'Lemon yellow & ink — playful modern brand', color: '#f5c518', emoji: '🍋', font: 'Bricolage Grotesque · Inter' },
  { id: 'terracotta-house', name: 'Terracotta House', desc: 'Warm clay & olive — artisan / homely heritage', color: '#b4552d', emoji: '🏺', font: 'Libre Baskerville · Karla' },
  { id: 'violet-pulse', name: 'Violet Pulse', desc: 'Deep violet & neon pink — nightlife energy', color: '#a855f7', emoji: '💜', font: 'Space Grotesk · Manrope' },
  { id: 'sage-journal', name: 'Sage Journal', desc: 'Paper & sage — slow-living magazine feel', color: '#6f7f6a', emoji: '🌿', font: 'Cormorant Garamond · Inter' },
  { id: 'maroon-heritage', name: 'Maroon Heritage', desc: 'Maroon & gold — royal traditional elegance', color: '#8c1c2b', emoji: '👑', font: 'Marcellus · Lato' },
  { id: 'monochrome-lab', name: 'Monochrome Lab', desc: 'Pure black & white — technical Swiss grid', color: '#111111', emoji: '⬛', font: 'IBM Plex Mono · IBM Plex Sans' },
  { id: 'peach-sunset', name: 'Peach Sunset', desc: 'Peach & coral gradients — warm lifestyle brand', color: '#ff6b4a', emoji: '🌅', font: 'Sora · Inter' },
  { id: 'forest-table', name: 'Forest Table', desc: 'Forest green & cream — farm-to-table organic', color: '#3f6b3a', emoji: '🌲', font: 'Lora · Work Sans' },
  { id: 'steel-works', name: 'Steel Works', desc: 'Steel grey & safety yellow — industrial workshop', color: '#f2b705', emoji: '⚙️', font: 'Oswald · Inter' },
  { id: 'lavender-hush', name: 'Lavender Hush', desc: 'Soft lavender & white — gentle self-care calm', color: '#8b7bd8', emoji: '🪻', font: 'Quicksand · Nunito Sans' },
  { id: 'rust-modern', name: 'Rust Modern', desc: 'Rust & charcoal — brutalist architecture vibe', color: '#c2410c', emoji: '🧱', font: 'Archivo · Archivo Narrow' },
  { id: 'aqua-house', name: 'Aqua House', desc: 'Teal & aqua — fresh coastal hospitality', color: '#0d9488', emoji: '🐚', font: 'Outfit · DM Sans' }
]

export const COLLECTION_IDS = COLLECTION_TEMPLATES.map((t) => t.id)

export function isCollectionTemplate(id: string): boolean {
  return COLLECTION_IDS.includes(id)
}
