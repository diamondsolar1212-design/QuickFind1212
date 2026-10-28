import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const PREFIX = 'scrypt'

/**
 * Hash a password using scrypt. Format: scrypt$<salt>$<hash>
 * Used for all newly created accounts and password changes.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${PREFIX}$${salt}$${hash}`
}

/**
 * Verify a password against a stored hash.
 * Also accepts legacy plaintext values so the seeded demo accounts keep working.
 */
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!password || !stored) return false

  if (stored.startsWith(`${PREFIX}$`)) {
    const [, salt, hash] = stored.split('$')
    if (!salt || !hash) return false
    try {
      const expected = Buffer.from(hash, 'hex')
      const actual = scryptSync(password, salt, expected.length)
      return expected.length === actual.length && timingSafeEqual(expected, actual)
    } catch {
      return false
    }
  }

  // Legacy plaintext password (demo seed data)
  return stored === password
}
