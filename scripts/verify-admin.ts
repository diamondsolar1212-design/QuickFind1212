import { db } from '../src/lib/db'
async function main() {
  const users = await db.user.findMany({ select: { email: true, name: true, role: true, isAdmin: true } })
  console.log('Users:')
  for (const u of users) console.log(`  ${u.email} | ${u.role} | isAdmin=${u.isAdmin}`)
}
main().finally(() => db.$disconnect())
