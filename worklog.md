---
Task ID: nav-fix-1
Agent: main
Task: Fix Live Preview iframe showing main app instead of template page when nav links (About/Gallery/Products/Reviews/Contact) are clicked inside the iframe.

Work Log:
- Read template-engine.ts and confirmed all 6 templates use `<a href="#about">` etc. for nav
- Identified root cause: `sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"` lets hash clicks escape the iframe and load the parent app URL
- Added `NAV_INTERCEPTOR_SCRIPT` constant — a tiny inline `<script>` that intercepts all `a[href^="#"]` clicks inside the iframe, calls `e.preventDefault()` + `e.stopPropagation()`, and smooth-scrolls to the target section via `scrollIntoView({behavior:'smooth'})`
- Injected `${NAV_INTERCEPTOR_SCRIPT}` before every `</body></html>` in all 6 templates (replace_all)
- Added `target="_blank" rel="noopener noreferrer"` to all external links (tel:, mailto:, https://wa.me/) so they still open in a new tab without needing `allow-top-navigation`
- Replaced `allow-top-navigation` with `allow-popups-to-escape-sandbox` in 3 iframes (ListBusinessModal.tsx lines 415, 678, 718 + BusinessDetailModal.tsx line 780)
- Wrote `/scripts/test-nav-fix.ts` — 24 checks across 6 templates, ALL PASS

Stage Summary:
- 4 files changed: template-engine.ts, ListBusinessModal.tsx, BusinessDetailModal.tsx, scripts/test-nav-fix.ts
- 6 templates verified: calm-sage / jungle-gold / athletic-bold / tech-lime / journalism-red / default
- Each template now has 5 working nav anchors (#about, #gallery, #products, #reviews, #contact) + #top logo
- All external links open in new tab via target="_blank"
- Hash clicks now stay inside the iframe and smooth-scroll, no more escape to parent app
- Dev server still serving HTTP 200 at localhost:3000
- User should hard-refresh browser (Ctrl+Shift+R) to clear cached bundle from previous session
