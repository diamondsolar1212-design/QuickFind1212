import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/chat/start — open (or reuse) the conversation between a customer
// and a business. One thread per pair, enforced by the unique constraint.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const businessId = typeof body?.businessId === 'string' ? body.businessId : ''
    const customerId = typeof body?.customerId === 'string' ? body.customerId : ''
    if (!businessId || !customerId) {
      return NextResponse.json({ error: 'Missing businessId or customerId' }, { status: 400 })
    }

    const [business, customer] = await Promise.all([
      db.business.findUnique({ where: { id: businessId }, select: { id: true, ownerId: true, name: true } }),
      db.user.findUnique({ where: { id: customerId }, select: { id: true, name: true, email: true } })
    ])
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (!customer) return NextResponse.json({ error: 'Please sign in to start a chat' }, { status: 401 })
    if (business.ownerId && business.ownerId === customerId) {
      return NextResponse.json({ error: 'This is your own business listing' }, { status: 400 })
    }

    const conversation = await db.conversation.upsert({
      where: { businessId_customerId: { businessId, customerId } },
      create: { businessId, customerId },
      update: { updatedAt: new Date() },
      select: { id: true, businessId: true, customerId: true, updatedAt: true }
    })

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('[POST /api/chat/start]', err)
    return NextResponse.json({ error: 'Failed to start chat' }, { status: 500 })
  }
}
