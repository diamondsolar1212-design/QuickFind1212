import { db } from '../src/lib/db'
async function main() {
  const b = await db.business.findFirst()
  if (b) {
    console.log('Fields in returned business:')
    console.log(Object.keys(b).join(', '))
  }
}
main().finally(() => db.$disconnect())
