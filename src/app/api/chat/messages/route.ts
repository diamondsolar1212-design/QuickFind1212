import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/messages?conversationId=&userId=
// Returns the thread and marks the other side's messages as seen.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId') || ''
    const userId = searchParams.get('userId') || ''
    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'Missing conversationId or userId' }, { status: 400 })
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { business: { select: { id: true, name: true, profileImage: true, ownerId: true, phone: true } } }
    })
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const isCustomer = conversation.customerId === userId
    const isOwner = !!conversation.business.ownerId && conversation.business.ownerId === userId
    if (!isCustomer && !isOwner) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const role = isCustomer ? 'customer' : 'business'
    await db.chatMessage.updateMany({
      where: {
        conversationId,
        senderRole: role === 'customer' ? 'business' : 'customer',
        ...(role === 'customer' ? { seenByCustomer: false } : { seenByBusiness: false })
      },
      data: role === 'customer' ? { seenByCustomer: true } : { seenByBusiness: true }
    })

    const messages = await db.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 300
    })

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        businessId: conversation.businessId,
        customerId: conversation.customerId,
        businessName: conversation.business.name,
        businessImage: conversation.business.profileImage,
        businessPhone: conversation.business.phone
      },
      role,
      messages
    })
  } catch (err) {
    console.error('[GET /api/chat/messages]', err)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

// POST /api/chat/messages — send a text message and/or an image.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : ''
    const senderId = typeof body?.senderId === 'string' ? body.senderId : ''
    const text = typeof body?.body === 'string' ? body.body.trim().slice(0, 2000) : ''
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.slice(0, 500) : ''
    if (!conversationId || !senderId) {
      return NextResponse.json({ error: 'Missing conversationId or senderId' }, { status: 400 })
    }
    if (!text && !imageUrl) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { business: { select: { ownerId: true } } }
    })
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const isCustomer = conversation.customerId === senderId
    const isOwner = !!conversation.business.ownerId && conversation.business.ownerId === senderId
    if (!isCustomer && !isOwner) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }
    const senderRole = isCustomer ? 'customer' : 'business'

    const message = await db.chatMessage.create({
      data: {
        conversationId,
        senderId,
        senderRole,
        body: text,
        imageUrl,
        seenByCustomer: senderRole === 'customer',
        seenByBusiness: senderRole === 'business'
      }
    })
    await db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } })

    return NextResponse.json({ message, senderRole })
  } catch (err) {
    console.error('[POST /api/chat/messages]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
