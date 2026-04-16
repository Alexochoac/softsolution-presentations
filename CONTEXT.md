# Presentation Builder — Softsolution

## What Is This?
A Node.js build system that assembles customizable sales presentations for
Softsolution & LiteSentry products (LineScanner and others), targeting
different glass industry customers.

## Type
GitHub code (HTML, JS, Node.js)

## Status
Active — in progress

## Goal
Allow one reusable slide library to be configured and built into tailored
presentations for different customers, with custom colors, logos, and content.
A local web builder app (`builder/`) is being built to make this fast (1 customer/day).

## Next Steps
- [x] Migrate existing softsolution folder from presentation-builder
- [x] Consolidate into one repo — presentations served from `/docs` via GitHub Pages
- [x] Refactor build system to use a shared assets folder
- [x] Design new builder architecture (self-contained slides, data-edit, lazy loading)
- [x] Build builder foundation: server.js, style.css, slide-01-cover.html, preview.html
- [x] Auto-save, image upload, carousel thumbnail strip, auto-advance
- [ ] Build remaining slides 02–14 in new system
- [ ] Build customer config UI (name, logo, language, slide defaults per customer)
- [ ] Build customer list page in builder
- [ ] Build "publish to GitHub" flow from builder
- [ ] Strip `data-builder-only` elements during customer presentation build

## Key Decisions
- New slides live in `builder/slides/` — old `slide-library/linescanner/` kept as read-only reference
- Each slide is self-contained: own HTML, scoped CSS, own JS
- `data-edit` attributes mark editable elements; `contenteditable` enables inline editing
- Auto-save debounced 1.5s, saves back to slide file via cheerio
- Umami events: `slide:name`, `slide:name:time {seconds}`, `gallery:image-name`, `zoom:name`, `cta:email/whatsapp`
- Carousel auto-advance interval stored as `data-autoplay` on track element, saved to file
- Builder-only UI marked with `data-builder-only` — to be stripped at build time

## Notes

---
Last updated: 2026-04-16
