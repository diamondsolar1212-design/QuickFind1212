// Quick smoke test for template engine — verifies section IDs and nav anchors exist
import { generateBusinessWebsite } from '../src/lib/template-engine'

const sample = {
  name: 'Sharma Electronics',
  description: 'Trusted electronics store in Mumbai with quality products and reliable service.',
  category: 'Electronics',
  subcategory: 'Retail',
  city: 'Mumbai',
  state: 'Maharashtra',
  address: '123 Main Road',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'contact@sharma.com',
  website: 'https://sharma.com',
  rating: 4.5,
  reviewCount: 128,
  profileImage: 'https://example.com/profile.jpg',
  imageUrls: 'https://example.com/1.jpg,https://example.com/2.jpg',
  products: JSON.stringify([
    { name: 'LED TV 55"', price: '₹45,000', details: '4K Ultra HD Smart TV', image: 'https://example.com/tv.jpg' },
    { name: 'Bluetooth Speaker', price: '₹2,500', details: 'Portable waterproof speaker', image: '' }
  ]),
  hours: '{}',
  themeColor: '#0d9488',
  template: 'calm-sage'
}

const templates = ['calm-sage', 'jungle-gold', 'athletic-bold', 'tech-lime', 'journalism-red', 'default']

for (const tpl of templates) {
  const html = generateBusinessWebsite({ ...sample, template: tpl })
  const checks = {
    'id="about"': html.includes('id="about"'),
    'id="gallery"': html.includes('id="gallery"'),
    'id="products"': html.includes('id="products"'),
    'id="reviews"': html.includes('id="reviews"'),
    'id="contact"': html.includes('id="contact"'),
    'href="#about"': html.includes('href="#about"'),
    'href="#gallery"': html.includes('href="#gallery"'),
    'href="#products"': html.includes('href="#products"'),
    'href="#reviews"': html.includes('href="#reviews"'),
    'href="#contact"': html.includes('href="#contact"'),
    'navBg image': html.includes("url('https://example.com/profile.jpg')") || html.includes('linear-gradient(180deg,rgba'),
    'scroll-behavior:smooth': html.includes('scroll-behavior:smooth'),
    'scroll-margin-top': html.includes('scroll-margin-top:80px'),
  }
  const passed = Object.values(checks).filter(Boolean).length
  const total = Object.keys(checks).length
  const failed = Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k)
  console.log(`\n[${tpl}] ${passed}/${total} checks passed`)
  if (failed.length) console.log(`  ❌ FAILED: ${failed.join(', ')}`)
  else console.log(`  ✅ All checks passed`)
}

console.log('\n=== Template size summary ===')
for (const tpl of templates) {
  const html = generateBusinessWebsite({ ...sample, template: tpl })
  console.log(`${tpl}: ${html.length} chars`)
}
