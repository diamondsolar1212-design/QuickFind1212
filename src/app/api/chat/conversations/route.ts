import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/conversations?userId=&role=customer|business
// Lists every thread for a customer, or every thread across the businesses
// owned by a business user. Includes unread counts for the inbox badge.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''
    const role = searchParams.get('role') === 'business' ? 'business' : 'customer'
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    let conversationIds: string[] = []

    if (role === 'business') {
      const owned = await db.business.findMany({
        where: { ownerId: userId },
        select: { id: true }
      })
      if (owned.length === 0) {
        return NextResponse.json({ conversations: [], unread: 0 })
      }
      const rows = await db.conversation.findMany({
        where: { businessId: { in: owned.map((b) => b.id) } },
        select: { id: true }
      })
      conversationIds = rows.map((row) => row.id)
    } else {
      const rows = await db.conversation.findMany({
        where: { customerId: userId },
        select: { id: true }
      })
      conversationIds = rows.map((row) => row.id)
    }

    if (conversationIds.length === 0) {
      return NextResponse.json({ conversations: [], unread: 0 })
    }

    const conversations = await db.conversation.findMany({
      where: { id: { in: conversationIds } },
      orderBy: { updatedAt: 'desc' },
      include: {
        business: { select: { id: true, name: true, profileImage: true, city: true, phone: true } },
        customer: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    })

    const unreadWhere = role === 'business' ? { seenByBusiness: false } : { seenByCustomer: false }
    const unreadRows = await db.chatMessage.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversationIds },
        senderRole: role === 'business' ? 'customer' : 'business',
        ...unreadWhere
      },
      _count: { _all: true }
    })
    const unreadMap = new Map(unreadRows.map((row) => [row.conversationId, row._count._all]))

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        businessId: conversation.businessId,
        customerId: conversation.customerId,
        business: conversation.business,
        customer: conversation.customer,
        updatedAt: conversation.updatedAt,
        lastMessage: conversation.messages[0] || null,
        unread: unreadMap.get(conversation.id) || 0
      })),
      unread: [...unreadMap.values()].reduce((sum, count) => sum + count, 0)
    })
  } catch (err) {
    console.error('[GET /api/chat/conversations]', err)
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }
}
