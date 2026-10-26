import { db } from '../src/lib/db'
async function main() {
  const b = await db.business.findFirst({ where: { name: 'CoolCare AC & Refrigeration' } })
  console.log(b?.id || 'not found')
}
main().finally(() => db.$disconnect())
