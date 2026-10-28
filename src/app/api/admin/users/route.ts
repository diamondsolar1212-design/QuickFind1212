import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin-only: list all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await db.user.findMany({
      orderBy: [{ isAdmin: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { businesses: true } }
      }
    })

    return NextResponse.json({ users, total: users.length })
  } catch (err) {
    console.error('[GET /api/admin/users]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// Admin-only: update user role or delete user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminId, userId, action, updates } = body

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 401 })
    }
    const admin = await db.user.findUnique({ where: { id: adminId } })
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (action === 'delete' || action === 'update') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 })
      }
    }

    if (action === 'update' && (!updates || typeof updates !== 'object')) {
      return NextResponse.json({ error: 'Updates are required' }, { status: 400 })
    }

    if (action === 'delete') {
      // Prevent admin from deleting themselves
      if (userId === adminId) {
        return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 })
      }
      await db.user.delete({ where: { id: userId } })
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    if (action === 'update') {
      const allowed: Record<string, any> = {}
      const allowedFields = ['name', 'phone', 'role', 'isAdmin']
      for (const f of allowedFields) {
        if (updates[f] !== undefined) allowed[f] = updates[f]
      }
      if (allowed.role !== undefined && !['CUSTOMER', 'BUSINESS_OWNER'].includes(allowed.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      if (allowed.isAdmin !== undefined) allowed.isAdmin = Boolean(allowed.isAdmin)
      const user = await db.user.update({
        where: { id: userId },
        data: allowed,
        select: { id: true, email: true, name: true, phone: true, role: true, isAdmin: true }
      })
      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/admin/users]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
