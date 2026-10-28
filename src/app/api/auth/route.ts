import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const name = String(body.name || '').trim()
    const phone = String(body.phone || '').trim()
    const requestedRole = body.role === 'BUSINESS_OWNER' ? 'BUSINESS_OWNER' : 'CUSTOMER'
    const mode = body.mode === 'signup' ? 'signup' : body.mode === 'login' ? 'login' : null

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })

    // Explicit login: never create an account implicitly.
    if (mode === 'login' || (mode === null && existing)) {
      if (!existing) {
        return NextResponse.json({ error: 'No account found with this email. Please sign up.' }, { status: 404 })
      }
      if (!verifyPassword(password, existing.password)) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }
      return NextResponse.json({ user: safeUser(existing) })
    }

    // Sign up
    if (existing) {
      return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 409 })
    }
    if (!name) {
      return NextResponse.json({ error: 'Name required for signup' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const user = await db.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        password: hashPassword(password),
        role: requestedRole
      }
    })

    return NextResponse.json({ user: safeUser(user) }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/auth]', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST to sign in or sign up' }, { status: 405 })
}

function safeUser(user: { id: string; email: string; name: string | null; phone: string | null; role: string; isAdmin: boolean }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isAdmin: user.isAdmin
  }
}
