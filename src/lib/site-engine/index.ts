// Public entry point for the rule-based website engine.
//
// A listing is rendered by the engine when its template is one of the five
// design families (or unset). Older rows that still name a collection or
// bespoke skin keep using their original renderer, so no published site
// changes until the provider picks a family.

import type { BusinessData } from '../templates/shared'
import { applySiteExperience } from '../templates/shared'
import { buildSite, type BuildOptions, type SiteBundle } from './render'
import { FAMILY_TOKENS } from './families'
import type { DesignFamily, PageId } from './types'

export const FAMILY_SKIN_IDS = Object.keys(FAMILY_TOKENS) as DesignFamily[]

export function isEngineSkin(template: string | null | undefined): boolean {
  if (!template || template === 'auto') return true
  return FAMILY_SKIN_IDS.indexOf(template as DesignFamily) >= 0
}

export function buildEngineSite(businessId: string, business: BusinessData, opts: BuildOptions = {}): SiteBundle {
  return buildSite(businessId, business, opts)
}

/** Complete document for one page, with the shared page experience applied. */
export function renderEnginePage(
  businessId: string,
  business: BusinessData,
  page: PageId = 'home',
  opts: BuildOptions = {}
): string {
  const bundle = buildEngineSite(businessId, business, opts)
  return applySiteExperience(bundle.document(page), business)
}

/** Whole document for the default (home) page — used by the legacy generator. */
export function renderEngineSite(businessId: string, business: BusinessData, opts: BuildOptions = {}): string {
  return renderEnginePage(businessId, business, 'home', opts)
}

/** Styled 404 carrying the listing's own design family. */
export function renderEngineNotFound(businessId: string, business: BusinessData, opts: BuildOptions = {}): string {
  return buildEngineSite(businessId, business, opts).notFound()
}

export type { SiteBundle, BuildOptions }
export type { DesignFamily, PageId }
