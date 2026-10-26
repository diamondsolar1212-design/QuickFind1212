import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Update own profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowed: Record<string, any> = {}
    const allowedFields = ['name', 'phone']
    for (const f of allowedFields) {
      if (updates[f] !== undefined) allowed[f] = updates[f]
    }

    // If user wants to change password, verify old password first
    if (updates.newPassword) {
      if (updates.currentPassword !== user.password) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      allowed.password = updates.newPassword
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: allowed,
      select: { id: true, email: true, name: true, phone: true, role: true, isAdmin: true }
    })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error('[POST /api/user/profile]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
