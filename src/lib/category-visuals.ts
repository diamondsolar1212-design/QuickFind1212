// Shared category iconography.
//
// The marketplace uses emoji in seed data, but emoji rendering varies wildly
// between platforms (and turns into tofu boxes on some Windows/Linux setups).
// A consistent line-icon set keeps the home screen looking like a premium
// product on every device, while the brand colour keeps each tile recognisable.

import {
  Building2,
  CakeSlice,
  Car,
  Coffee,
  Factory,
  Gem,
  GraduationCap,
  Hammer,
  HeartPulse,
  LayoutGrid,
  Palette,
  Plane,
  Scissors,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
  type LucideIcon
} from 'lucide-react'

export interface CategoryVisual {
  icon: LucideIcon
  /** Foreground/accent colour for the icon. */
  color: string
  /** Soft tint used behind the icon. */
  soft: string
}

const FALLBACK: CategoryVisual = { icon: LayoutGrid, color: '#0d9488', soft: '#ccfbf1' }

const VISUALS: Record<string, CategoryVisual> = {
  'Grocery & Essentials': { icon: ShoppingBasket, color: '#16a34a', soft: '#dcfce7' },
  Restaurants: { icon: UtensilsCrossed, color: '#ea580c', soft: '#ffedd5' },
  'Home Services': { icon: Wrench, color: '#15803d', soft: '#f0fdf4' },
  'Textiles & Apparel': { icon: Shirt, color: '#7c3aed', soft: '#ede9fe' },
  'Food & Sweets': { icon: CakeSlice, color: '#c026d3', soft: '#fae8ff' },
  'Food & Beverages': { icon: Coffee, color: '#92400e', soft: '#fef3c7' },
  Automobile: { icon: Car, color: '#475569', soft: '#f1f5f9' },
  Electronics: { icon: Smartphone, color: '#1e40af', soft: '#dbeafe' },
  'Health & Wellness': { icon: HeartPulse, color: '#15803d', soft: '#dcfce7' },
  'Beauty & Personal Care': { icon: Scissors, color: '#be185d', soft: '#fce7f3' },
  'Handicrafts & Art': { icon: Palette, color: '#db2777', soft: '#fce7f3' },
  'Real Estate': { icon: Building2, color: '#16a34a', soft: '#dcfce7' },
  Doctors: { icon: Stethoscope, color: '#0891b2', soft: '#cffafe' },
  'Wedding Planning': { icon: Gem, color: '#c026d3', soft: '#fae8ff' },
  Education: { icon: GraduationCap, color: '#7c3aed', soft: '#ede9fe' },
  'Travel Booking': { icon: Plane, color: '#0e7490', soft: '#ecfeff' },
  'B2B Suppliers': { icon: Factory, color: '#0284c7', soft: '#e0f2fe' },
  'Repair Services': { icon: Hammer, color: '#dc2626', soft: '#fee2e2' }
}

export function categoryVisual(name: string | null | undefined): CategoryVisual {
  return (name && VISUALS[name]) || FALLBACK
}
