import { db } from '../src/lib/db'
async function main() {
  // Set Bawarchi to athletic-bold template
  const b = await db.business.findFirst({ where: { name: 'Bawarchi Restaurant' } })
  if (b) {
    await db.business.update({
      where: { id: b.id },
      data: { template: 'athletic-bold', themeColor: '#FF5400' }
    })
    console.log('Updated Bawarchi to athletic-bold')
  }
  // Set Chandni Chowk to jungle-gold
  const c = await db.business.findFirst({ where: { name: 'Chandni Chowk Sweets & Snacks' } })
  if (c) {
    await db.business.update({
      where: { id: c.id },
      data: { template: 'jungle-gold', themeColor: '#C9A227' }
    })
    console.log('Updated Chandni Chowk to jungle-gold')
  }
  // Set Indiranagar Coffee to calm-sage
  const ic = await db.business.findFirst({ where: { name: 'Indiranagar Coffee Roasters' } })
  if (ic) {
    await db.business.update({
      where: { id: ic.id },
      data: { template: 'calm-sage', themeColor: '#8a9a87' }
    })
    console.log('Updated Indiranagar Coffee to calm-sage')
  }
}
main().finally(() => db.$disconnect())
