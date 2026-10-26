import { db } from '../src/lib/db'
async function main() {
  const a = await db.user.findFirst({ where: { isAdmin: true } })
  console.log(a?.id || 'not found')
}
main().finally(() => db.$disconnect())
