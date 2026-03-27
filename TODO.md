# TODO — Presentation Builder Softsolution

## In Progress
- [ ] Build remaining slides 02–14 in new builder system
- [ ] Build customer config UI (name, logo, language, per-slide defaults)

## Backlog
- [ ] Build customer list page in builder
- [ ] Build "publish to GitHub" flow from builder
- [ ] Strip `data-builder-only` elements during customer presentation build
- [ ] Add `window.__BUILDER__` flag for builder-only features
- [ ] Replace Phrase 1/2/3 placeholder text slides in old gallery with real content

## Done
- [x] Build builder foundation: server.js, style.css, slide-01-cover.html, preview.html
- [x] Auto-save (1.5s debounce) with green dot indicator
- [x] Customer logo upload + image swap in carousel
- [x] Carousel thumbnail strip with drag-to-reorder
- [x] Carousel auto-advance (pause on hover, configurable interval, saved to file)
- [x] Add image / add text buttons in carousel
- [x] Umami event naming convention defined and implemented
- [x] Create Grupo Navas Spain presentation
- [x] Fix openLb() path bug in all 3 presentations
- [x] Build slide validator (scripts/validate.js) with watch mode
- [x] Fix slide-12 outer class ls11 → ls12
- [x] Replace 3 stacked scanner cards in slide-04 with auto-rotating carousel
- [x] Rebuild gallery with JS-controlled fixed overlay + auto-advance
- [x] Rewrite fix-slide skill as diagnostic-first process
- [x] Migrate existing softsolution folder from presentation-builder
- [x] Refactor build system to use shared assets folder
- [x] Update GitHub Pages to serve from /docs
