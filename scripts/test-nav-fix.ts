// Test that all 6 templates generate valid HTML with:
//   - working anchor links (each #anchor has matching id="anchor")
//   - NAV_INTERCEPTOR_SCRIPT injected before </body>
//   - all tel:/mailto:/wa.me: links have target="_blank" rel="noopener noreferrer"
//   - no remaining allow-top-navigation usage

import { generateBusinessWebsite, BusinessData } from '../src/lib/template-engine'

const base: BusinessData = {
  name: 'Test Business',
  description: 'A sample description for testing the template engine output.',
  category: 'Restaurant',
  subcategory: 'Italian',
  city: 'Mumbai',
  state: 'Maharashtra',
  address: '123 Main Road, Andheri West',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'hello@test.com',
  website: 'https://test.com',
  rating: 4.5,
  reviewCount: 100,
  profileImage: '',
  imageUrls: 'https://example.com/a.jpg,https://example.com/b.jpg',
  products: JSON.stringify([
    { name: 'Pizza Margherita', price: '₹250', details: 'Wood-fired', image: 'https://example.com/p.jpg' },
    { name: 'Pasta Carbonara', price: '₹320', details: 'Fresh made' }
  ]),
  hours: JSON.stringify({ mon: '9-22', tue: '9-22' }),
  themeColor: '#0d9488',
  template: 'calm-sage'
}

const TEMPLATES = ['calm-sage', 'jungle-gold', 'athletic-bold', 'tech-lime', 'journalism-red', 'default']

let pass = 0, fail = 0

for (const tpl of TEMPLATES) {
  const html = generateBusinessWebsite({ ...base, template: tpl })

  // 1. Has NAV_INTERCEPTOR_SCRIPT
  const hasInterceptor = html.includes('NAV_INTERCEPTOR_SCRIPT') === false && html.includes('a[href^="#"]')
  // Check it's actually injected (the const name gets resolved to the script content)
  const hasInterceptorInjected = html.includes("document.querySelectorAll('a[href^=\"#\"]')")
  if (!hasInterceptorInjected) {
    console.error(`[${tpl}] FAIL: NAV_INTERCEPTOR_SCRIPT not injected`)
    fail++
  } else {
    console.log(`[${tpl}] PASS: NAV_INTERCEPTOR_SCRIPT injected`)
    pass++
  }

  // 2. All external links have target="_blank"
  const externalLinks = html.match(/href="(tel:|mailto:|https:\/\/wa\.me\/)[^"]+"/g) || []
  const linksWithoutTarget = externalLinks.filter(link => {
    // Find the <a ...> tag containing this href and check if it has target="_blank"
    const idx = html.indexOf(link)
    // Walk backwards 80 chars to find <a
    const tagStart = html.lastIndexOf('<a', idx)
    const tagEnd = html.indexOf('>', idx)
    const tag = html.slice(tagStart, tagEnd + 1)
    return !tag.includes('target="_blank"')
  })
  if (linksWithoutTarget.length > 0) {
    console.error(`[${tpl}] FAIL: ${linksWithoutTarget.length} external links missing target="_blank"`)
    fail++
  } else {
    console.log(`[${tpl}] PASS: all ${externalLinks.length} external links have target="_blank"`)
    pass++
  }

  // 3. No allow-top-navigation usage in HTML output (it shouldn't appear)
  if (html.includes('allow-top-navigation')) {
    console.error(`[${tpl}] FAIL: HTML contains "allow-top-navigation"`)
    fail++
  } else {
    console.log(`[${tpl}] PASS: no allow-top-navigation in HTML`)
    pass++
  }

  // 4. Each nav anchor #X has a matching id="X" in the doc (except #top which is a div)
  const navHrefs = Array.from(html.matchAll(/href="#([a-z]+)"/g)).map(m => m[1])
  const uniqueHrefs = [...new Set(navHrefs)]
  let anchorOk = true
  for (const h of uniqueHrefs) {
    if (h === 'top') {
      // #top is allowed to have a div with id="top"
      if (!html.includes('id="top"')) {
        console.error(`[${tpl}] FAIL: nav link "#top" but no id="top"`)
        anchorOk = false
      }
    } else {
      if (!html.includes(`id="${h}"`)) {
        console.error(`[${tpl}] FAIL: nav link "#${h}" but no id="${h}"`)
        anchorOk = false
      }
    }
  }
  if (anchorOk) {
    console.log(`[${tpl}] PASS: all ${uniqueHrefs.length} nav anchors have matching ids`)
    pass++
  } else {
    fail++
  }
}

console.log('\n=== SUMMARY ===')
console.log(`PASS: ${pass}`)
console.log(`FAIL: ${fail}`)
process.exit(fail > 0 ? 1 : 0)
