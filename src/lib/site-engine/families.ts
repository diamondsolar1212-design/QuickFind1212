// Design-token layer: the five visual families from the spec.
//
// Each family is a full token set — palette, type pairing, radii, shadow,
// button/card treatment, hero layout, nav style and gallery shape — so two
// families produce visibly different websites rather than a recolour job.
// The ids match the storefront skins the provider can still pick by hand.

import type { DesignFamily } from './types'
import { STOREFRONT_STYLES } from '../templates/storefront'

export interface FamilyTokens {
  id: DesignFamily
  label: string
  /** Google Fonts query fragment for this pairing. */
  fonts: string
  headingFont: string
  bodyFont: string
  bg: string
  surface: string
  raised: string
  ink: string
  muted: string
  accent: string
  line: string
  radius: string
  cardRadius: string
  shadow: string
  /** 'solid' fills with the accent, 'outline' keeps it transparent. */
  buttonStyle: 'solid' | 'outline'
  /** Hero composition. */
  heroLayout: 'split' | 'stacked' | 'framed'
  /** Gallery geometry. */
  galleryShape: 'grid' | 'mosaic' | 'strip'
  /** Letter-spacing for the uppercase kickers. */
  tracking: string
  dark: boolean
}

const base = STOREFRONT_STYLES

export const FAMILY_TOKENS: Record<DesignFamily, FamilyTokens> = {
  'luxury-editorial': {
    id: 'luxury-editorial',
    label: 'Luxury Editorial',
    fonts: 'family=Playfair+Display:ital,wght@0,400..700;1,400..500&family=DM+Sans:wght@300;400;500;700',
    headingFont: "'Playfair Display',Georgia,serif",
    bodyFont: "'DM Sans',Arial,sans-serif",
    bg: base['luxury-editorial'].bg,
    surface: base['luxury-editorial'].surface,
    raised: '#f7f3ea',
    ink: base['luxury-editorial'].ink,
    muted: base['luxury-editorial'].muted,
    accent: base['luxury-editorial'].accent,
    line: base['luxury-editorial'].line,
    radius: '2px',
    cardRadius: '4px',
    shadow: '0 30px 70px -45px rgba(25,25,22,.55)',
    buttonStyle: 'solid',
    heroLayout: 'split',
    galleryShape: 'mosaic',
    tracking: '.22em',
    dark: false
  },
  'modern-dark': {
    id: 'modern-dark',
    label: 'Modern Dark',
    fonts: 'family=DM+Sans:wght@300;400;500;700',
    headingFont: "'DM Sans',Arial,sans-serif",
    bodyFont: "'DM Sans',Arial,sans-serif",
    bg: base['modern-dark'].bg,
    surface: base['modern-dark'].surface,
    raised: '#1c2622',
    ink: base['modern-dark'].ink,
    muted: base['modern-dark'].muted,
    accent: base['modern-dark'].accent,
    line: base['modern-dark'].line,
    radius: '10px',
    cardRadius: '14px',
    shadow: '0 34px 80px -40px rgba(0,0,0,.8)',
    buttonStyle: 'solid',
    heroLayout: 'stacked',
    galleryShape: 'grid',
    tracking: '.16em',
    dark: true
  },
  'minimal-contemporary': {
    id: 'minimal-contemporary',
    label: 'Minimal Contemporary',
    fonts: 'family=DM+Sans:wght@300;400;500;700',
    headingFont: "'DM Sans',Arial,sans-serif",
    bodyFont: "'DM Sans',Arial,sans-serif",
    bg: base['minimal-contemporary'].bg,
    surface: base['minimal-contemporary'].surface,
    raised: '#f0f3ef',
    ink: base['minimal-contemporary'].ink,
    muted: base['minimal-contemporary'].muted,
    accent: base['minimal-contemporary'].accent,
    line: base['minimal-contemporary'].line,
    radius: '4px',
    cardRadius: '6px',
    shadow: '0 20px 50px -38px rgba(32,37,34,.6)',
    buttonStyle: 'outline',
    heroLayout: 'split',
    galleryShape: 'strip',
    tracking: '.18em',
    dark: false
  },
  'organic-lifestyle': {
    id: 'organic-lifestyle',
    label: 'Organic Lifestyle',
    fonts: 'family=Playfair+Display:ital,wght@0,400..700;1,400..500&family=DM+Sans:wght@300;400;500;700',
    headingFont: "'Playfair Display',Georgia,serif",
    bodyFont: "'DM Sans',Arial,sans-serif",
    bg: base['organic-lifestyle'].bg,
    surface: base['organic-lifestyle'].surface,
    raised: '#f2ece0',
    ink: base['organic-lifestyle'].ink,
    muted: base['organic-lifestyle'].muted,
    accent: base['organic-lifestyle'].accent,
    line: base['organic-lifestyle'].line,
    radius: '18px',
    cardRadius: '20px',
    shadow: '0 26px 60px -40px rgba(52,55,43,.5)',
    buttonStyle: 'solid',
    heroLayout: 'framed',
    galleryShape: 'mosaic',
    tracking: '.2em',
    dark: false
  },
  'bold-creative': {
    id: 'bold-creative',
    label: 'Bold Creative',
    fonts: 'family=DM+Sans:wght@300;400;500;700;900',
    headingFont: "'DM Sans',Arial,sans-serif",
    bodyFont: "'DM Sans',Arial,sans-serif",
    bg: base['bold-creative'].bg,
    surface: base['bold-creative'].surface,
    raised: '#efeade',
    ink: base['bold-creative'].ink,
    muted: base['bold-creative'].muted,
    accent: base['bold-creative'].accent,
    line: base['bold-creative'].line,
    radius: '0px',
    cardRadius: '0px',
    shadow: '10px 10px 0 rgba(23,38,160,.12)',
    buttonStyle: 'solid',
    heroLayout: 'stacked',
    galleryShape: 'grid',
    tracking: '.14em',
    dark: false
  }
}

export const FAMILY_IDS = Object.keys(FAMILY_TOKENS) as DesignFamily[]

export function familyFor(id: string | null | undefined, fallback: DesignFamily = 'luxury-editorial'): FamilyTokens {
  return FAMILY_TOKENS[(id || '') as DesignFamily] || FAMILY_TOKENS[fallback]
}
