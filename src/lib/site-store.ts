// Persistence for the rule-based site engine.
//
// Generation stays deterministic — the Business row is the source of truth and
// the engine rebuilds from it — so what lands here is the *plan* the engine
// produced (pages, sections, SEO) plus an immutable snapshot per run that a
// publication can be rolled back to.

import { db } from './db'
import { toBusinessData } from './business-site'
import { buildEngineSite } from './site-engine'
import { pageUrl } from './site-engine/seo'
import type { PageDescriptor } from './site-engine/types'

/** The stages the engine reports, in the order its work really happens. */
export const SITE_STAGES = ['analysing', 'design', 'content', 'images', 'pages', 'seo', 'ready'] as const

export interface StageTiming {
  stage: string
  ms: number
}

export interface GenerateResult {
  jobId: string
  version: number
  family: string
  pages: PageDescriptor[]
  stages: StageTiming[]
  sections: number
}

async function projectFor(businessId: string) {
  return db.websiteProject.upsert({
    where: { businessId },
    update: {},
    create: { businessId }
  })
}

/**
 * Runs the engine once, records the page plan it composed and stores the home
 * document as a numbered version.
 */
export async function generateWebsite(
  businessId: string,
  origin: string,
  family?: string | null
): Promise<GenerateResult> {
  const row = await db.business.findUnique({ where: { id: businessId } })
  if (!row) throw new Error('Business not found')
  const data = toBusinessData(row)
  const project = await projectFor(businessId)

  const stages: StageTiming[] = []
  const bundle = buildEngineSite(businessId, data, {
    family: family || null,
    origin,
    published: true,
    onStage: (stage, ms) => stages.push({ stage, ms })
  })

  const chosen = bundle.family.id
  const latest = await db.websiteVersion.aggregate({
    where: { projectId: project.id },
    _max: { number: true }
  })
  const number = (latest._max.number || 0) + 1
  const summary = `${bundle.pages.length} pages · ${bundle.composition.included.length} sections`

  const job = await db.websiteJob.create({
    data: {
      projectId: project.id,
      status: 'done',
      stage: 'ready',
      progress: 100,
      timings: stages.map((s) => `${s.stage}:${s.ms}`).join(',')
    }
  })

  await db.$transaction([
    db.websitePage.deleteMany({ where: { projectId: project.id } }),
    db.websitePage.createMany({
      data: bundle.pages.map((page, index) => ({
        projectId: project.id,
        pageId: page.id,
        slug: page.slug,
        label: page.label,
        position: index,
        sections: page.sections.join(','),
        canonical: pageUrl(bundle.base, page),
        title: String(row.name || ''),
        description: ''
      }))
    })
  ])

  await db.websiteVersion.create({
    data: {
      projectId: project.id,
      number,
      family: chosen,
      summary,
      content: String(row.siteContent || ''),
      html: bundle.html
    }
  })

  await db.websiteProject.update({
    where: { id: project.id },
    data: { family: chosen, status: 'generated' }
  })

  return { jobId: job.id, version: number, family: chosen, pages: bundle.pages, stages, sections: bundle.composition.home.length }
}

/** The page plan of the latest generation, for listings and the sitemap. */
export async function plannedPages(businessId: string) {
  const project = await db.websiteProject.findUnique({ where: { businessId } })
  if (!project) return []
  return db.websitePage.findMany({ where: { projectId: project.id }, orderBy: { position: 'asc' } })
}

export interface WebsiteStatus {
  family: string
  status: string
  versions: { number: number; family: string; summary: string; createdAt: Date }[]
  published: { version: number; url: string; publishedAt: Date } | null
}

export async function websiteStatus(businessId: string): Promise<WebsiteStatus> {
  const project = await db.websiteProject.findUnique({
    where: { businessId },
    include: {
      versions: { orderBy: { number: 'desc' }, take: 8 },
      publications: { orderBy: { publishedAt: 'desc' }, take: 1 }
    }
  })
  if (!project) return { family: '', status: 'none', versions: [], published: null }
  const live = project.publications[0]
  return {
    family: project.family,
    status: project.status,
    versions: project.versions.map((v) => ({ number: v.number, family: v.family, summary: v.summary, createdAt: v.createdAt })),
    published: live ? { version: live.version, url: live.url, publishedAt: live.publishedAt } : null
  }
}

/** Records which generated version is live. The URL never changes. */
export async function publishWebsite(businessId: string, origin: string, version?: number) {
  const project = await db.websiteProject.findUnique({ where: { businessId } })
  if (!project) throw new Error('Generate the website before publishing it')
  const wanted = version
    ? await db.websiteVersion.findUnique({ where: { projectId_number: { projectId: project.id, number: version } } })
    : await db.websiteVersion.findFirst({ where: { projectId: project.id }, orderBy: { number: 'desc' } })
  if (!wanted) throw new Error('That version is not available')

  const url = `${origin.replace(/\/$/, '')}/business/${businessId}/website`
  const created = await db.websitePublication.create({
    data: { projectId: project.id, version: wanted.number, url }
  })
  await db.websiteProject.update({ where: { id: project.id }, data: { status: 'published', family: wanted.family } })
  return { version: wanted.number, url, publishedAt: created.publishedAt }
}

/**
 * Rolls a listing back to an earlier build: the stored design family and the
 * editable copy from that run go back onto the live row.
 */
export async function rollbackWebsite(businessId: string, version: number) {
  const project = await db.websiteProject.findUnique({ where: { businessId } })
  if (!project) throw new Error('This website has no saved versions yet')
  const wanted = await db.websiteVersion.findUnique({ where: { projectId_number: { projectId: project.id, number: version } } })
  if (!wanted) throw new Error('That version is not available')

  const restored = await db.business.update({
    where: { id: businessId },
    data: { template: wanted.family, siteContent: wanted.content }
  })
  await db.websiteProject.update({ where: { id: project.id }, data: { family: wanted.family } })
  return { version: wanted.number, family: wanted.family, business: restored }
}
