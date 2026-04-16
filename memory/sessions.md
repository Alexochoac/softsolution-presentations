# Sessions

## 2026-04-15 — Umami analytics overhaul across all 5 presentations

- Audited all Umami event names — found generic names like `slide-view`, `slide5-tab` gave no context in dashboard
- Renamed all tab events to topic-based names: `company-tab`, `applications-tab`, `technology-tab`
- Changed `slide-view` to fire as `slide-view: {slide name}` so each slide gets its own Umami row
- Changed `render-card-zoom` to `process-zoom: {card name}` pattern
- Added `currentSlideName` global variable — updated in `goTo()` on every navigation
- Converted ALL `data-umami-event` HTML attributes to JS `umami.track()` calls so every event carries `{ slide: currentSlideName }` as a property — enables filtering all events by slide in Umami
- Added missing tracking to slides 4–12: gallery prev/next, image zooms, thumbnails, lightbox nav/close, share modal, matrix toggles, process card buttons
- Applied all changes to all 5 presentations sequentially
- Created `docs/shared/UMAMI_TRACKING_Directory.md` — reference doc mapping every event to its JS function
- Removed old `docs/GrupoNavas-Spain/` folder (was replaced by `docs/grupo-navas-spain/` lowercase)
- All changes committed and pushed to GitHub Pages

**Pending:**
- Apply same tracking audit to any new presentations created in future
- Consider adding `presentation: 'Customer Name'` property to distinguish events across presentations in Umami

---

## 2026-03-27 — Local builder web app foundation

- Designed new architecture: `builder/` folder with self-contained slides, centralized `style.css`, config-driven customer defaults, lazy-loading shell
- Built `builder/server.js` — Express server with `/api/save`, `/api/upload-image`, `/api/save-image-src` endpoints; static routes for slides, assets, shared, uploads
- Built `builder/slides/style.css` — single source of truth for all CSS variables and components
- Built `builder/slides/slide-01-cover.html` — clean cover slide with `data-edit` + `contenteditable` on all editable elements, self-contained gallery JS, customer logo upload, carousel image swap, drag-to-reorder thumbnail strip, auto-advance (pause on hover, configurable interval saved to file), add image/text buttons
- Built `builder/public/preview.html` — lazy-loading shell with nav (arrows, keyboard, swipe), Umami analytics (`slide:name` on enter, `slide:name:time` with seconds on exit), lightbox, auto-save (1.5s debounce), green dot save indicator
- Established Umami event naming convention: `slide:cover`, `slide:cover:time {seconds}`, `gallery:image-name`, `zoom:image-name`, `cta:email`, `cta:whatsapp`
- Added cheerio to builder dependencies for safe HTML file updates

**Pending:**
- Build remaining slides (slide-02 through slide-14) in new system
- Build customer config system (per-customer name, logo, language, slide defaults)
- Build customer list UI in builder
- Build "publish to GitHub" flow
- Strip `data-builder-only` elements during customer presentation build
- Add `window.__BUILDER__` flag or build-time strip for builder-only UI

---

## 2026-03-27 — slide-04 carousel + validator + Save All recovery

- Built `scripts/validate.js` — catches missing files, duplicate classes/IDs, broken assets, unbalanced tags across all 14 slides. Added `npm run validate` and `npm run watch` scripts to package.json
- Rewrote `.claude/commands/fix-slide.md` — validator is now Step 1, symptom diagnosis is fallback
- Added `npm run watch` guidance to `.claude/commands/create-slide.md`
- Fixed slide-12 outer class `ls11` → `ls12` (all 40 occurrences renamed)
- Replaced 3 stacked scanner image cards in slide-04 capability matrix with a single auto-rotating carousel (fade transition, 3.5s interval, dot indicators, click to zoom)
- Diagnosed and fixed `position:absolute; inset:0` carousel slides escaping their container
- Diagnosed Save All corruption: style block truncated mid-CSS in slide-01. Restored missing media queries
- Restored slides 02–14 from git after Save All damage; re-applied slide-12 ls11→ls12 fix

**Pending:**
- Replace Phrase 1/2/3 placeholder text slides in gallery with real content
- Text slide font sizes in gallery may need adjustment

