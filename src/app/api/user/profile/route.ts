import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'

// Update own profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'No updates supplied' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowed: Record<string, unknown> = {}
    if (updates.name !== undefined) {
      const name = String(updates.name).trim().slice(0, 80)
      if (!name) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      }
      allowed.name = name
    }
    if (updates.phone !== undefined) {
      allowed.phone = String(updates.phone).trim().slice(0, 30) || null
    }

    // If user wants to change password, verify old password first
    if (updates.newPassword) {
      const newPassword = String(updates.newPassword)
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }
      if (!verifyPassword(String(updates.currentPassword || ''), user.password)) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      allowed.password = hashPassword(newPassword)
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
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
