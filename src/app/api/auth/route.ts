import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    if (email) {
      // Login attempt — find existing user
      const user = await db.user.findUnique({ where: { email }, include: { businesses: true } })
      if (!user) {
        return NextResponse.json({ error: 'User not found. Please sign up.' }, { status: 404 })
      }
      return NextResponse.json({ user: { ...user, password: undefined } })
    }

    // Sign up
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Provide email for login or POST body for signup' }, { status: 400 })
    }
    const { email: bEmail, name, phone, password, role: bodyRole } = body
    if (!bEmail || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email: bEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 400 })
    }

    const user = await db.user.create({
      data: {
        email: bEmail,
        name: name || null,
        phone: phone || null,
        password, // demo only — do not use plaintext in production
        role: bodyRole || role || 'CUSTOMER'
      }
    })

    return NextResponse.json({ user: { ...user, password: undefined } }, { status: 201 })
  } catch (err) {
    console.error('[/api/auth]', err)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Try existing
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      if (existing.password !== password) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }
      return NextResponse.json({ user: { ...existing, password: undefined } })
    }

    // Sign up
    if (!name) {
      return NextResponse.json({ error: 'Name required for signup' }, { status: 400 })
    }
    const user = await db.user.create({
      data: { email, name, phone: phone || null, password, role: role || 'CUSTOMER' }
    })
    return NextResponse.json({ user: { ...user, password: undefined } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth]', err)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
}