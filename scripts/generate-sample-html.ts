// Generate sample HTML files for visual verification
import { generateBusinessWebsite } from '../src/lib/template-engine'
import * as fs from 'fs'
import * as path from 'path'

const sample = {
  name: 'Sharma Electronics',
  description: 'Trusted electronics store in Mumbai with quality products and reliable service for over 15 years.',
  category: 'Electronics',
  subcategory: 'Retail',
  city: 'Mumbai',
  state: 'Maharashtra',
  address: '123 Main Road, Andheri West',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'contact@sharma-electronics.com',
  website: 'https://sharma-electronics.com',
  rating: 4.5,
  reviewCount: 128,
  profileImage: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=800',
  imageUrls: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600,https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600,https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  products: JSON.stringify([
    { name: 'LED TV 55"', price: '₹45,000', details: '4K Ultra HD Smart TV with HDR', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600' },
    { name: 'Bluetooth Speaker', price: '₹2,500', details: 'Portable waterproof speaker with 12hr battery', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7ad?w=600' },
    { name: 'Wireless Headphones', price: '₹3,200', details: 'Noise cancelling, 30hr battery', image: '' }
  ]),
  hours: '{}',
  themeColor: '#0d9488',
  template: 'calm-sage'
}

const outDir = path.join(__dirname, '..', 'download', 'template-previews')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const templates = ['calm-sage', 'jungle-gold', 'athletic-bold', 'tech-lime', 'journalism-red', 'default']
for (const tpl of templates) {
  const html = generateBusinessWebsite({ ...sample, template: tpl })
  const outPath = path.join(outDir, `${tpl}.html`)
  fs.writeFileSync(outPath, html)
  console.log(`✓ ${tpl} → ${outPath} (${html.length} chars)`)
}

console.log('\nAll template HTML files generated.')
