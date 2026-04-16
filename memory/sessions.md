# Sessions

## 2026-04-16 — Umami tracking strategy redesign

- Discussed limitations of Umami dashboard for cross-customer analysis
- Defined new tracking structure: event name = slide, properties = component type + label
- Two analysis layers: Umami dashboard (per-customer) and n8n + direct Postgres query (cross-customer)
- Created `docs/umami-guidelines.md` with full strategy, examples, naming conventions, and risks
- Saved reference memory to project memory folder
- Added `label` property to tracking structure (e.g. `label: 'About Us'`) so specific element names are captured alongside component types

**Pending:**
- Implement new tracking structure in LineScanner presentation (test case)
- Update existing `umami.track()` calls across all presentations to match new structure

---

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
- Built `builder/server.js` — Express server with `/api/save`, `/api/upload-image`, `/api/save-image-src` endpoints
- Built `builder/slides/style.css` — single source of truth for all CSS variables and components
- Built `builder/slides/slide-01-cover.html` — clean cover slide with `data-edit`, contenteditable, gallery JS, logo upload, carousel, drag-to-reorder thumbnails, auto-advance
- Built `builder/public/preview.html` — lazy-loading shell with nav, Umami analytics, lightbox, auto-save
- Established Umami event naming convention: `slide:cover`, `slide:cover:time {seconds}`, `gallery:image-name`
- Added cheerio to builder dependencies

**Pending:**
- Build remaining slides (slide-02 through slide-14) in new system
- Build customer config system and list UI
- Build "publish to GitHub" flow
- Strip `data-builder-only` elements during build
