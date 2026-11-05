import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { toBusinessData } from '@/lib/business-site'
import { generateBusinessWebsite } from '@/lib/template-engine'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) return new Response('Missing business id', { status: 400 })

  const business = await db.business.findUnique({ where: { id } }).catch(() => null)
  if (!business) return new Response('Business not found', { status: 404 })

  const html = generateBusinessWebsite(toBusinessData(business), {
    businessId: id,
    origin: new URL(_request.url).origin
  })
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  })
}
