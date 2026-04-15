# Umami Analytics Tracking Reference

This document maps every analytics event tracked across all 5 presentations.
Use it as a quick reference when adding, changing, or auditing tracking — so you
don't need to read entire HTML files to find where events are fired.

Events are organized by slide/feature. Each entry shows:
- The event name that appears in the Umami dashboard
- The JS function or handler where the umami.track() call lives
- A note if the event is present in all 5 files or only some

All events carry `{ slide: currentSlideName }` as a property, set by the
`goTo()` function whenever the user navigates to a new slide.

---

## Notes on using this document

- **Line numbers are intentionally omitted** — they shift whenever slides are edited.
  Use the function name with Ctrl+F to locate the code quickly.
- `password-unlock-attempt` is the **only remaining `data-umami-event` HTML attribute**
  across all 5 files. Every other event uses `umami.track()` in JavaScript.
- All 5 presentations share the same structure and function names. A change to
  the tracking in one file must be replicated manually to all others.

---

## Global / Navigation

| What | Detail |
|------|--------|
| `currentSlideName` variable | Declared as `let currentSlideName = SLIDE_NAMES[0] \|\| 'Cover'` near the bottom of the `<script>` block, just before `function goTo(n)` |
| Updated on navigation | `goTo(n)` sets `currentSlideName = SLIDE_NAMES[n] \|\| 'Slide ' + (n + 1)` |
| `slide-view: {name}` | Fired inside `goTo()` — fires on every slide navigation |
| `theme-toggle` | Fired inside the theme toggle handler (anonymous function). Carries `{ mode: 'dark' \| 'light', slide: currentSlideName }` |
| `password-unlock-attempt` | The one remaining **`data-umami-event` HTML attribute**, on the `<button id="pw-btn">` element |

---

## Share Modal

All share events fire inside the IIFE at the bottom of the file (the share functionality block).

| Event | Handler |
|-------|---------|
| `share-modal-open` | `window.shareOpen` |
| `share-modal-close` | `window.shareClose` |
| `share-whatsapp` | `window.shareSub` — fires when `id === 'wa'` |
| `share-email` | `window.shareSub` — fires when `id !== 'wa'` |
| `share-copy-link` | Anonymous handler inside `window.shareSub`, after clipboard write |

---

## Slide 2 — Company

All events fire inside the `<script>` block for the Company slide. Functions are
assigned as `window.xxx = function(...)`.

| Event | Handler |
|-------|---------|
| `iqc-group-expand` | `window.toggleIQC` |
| `tab-click: {label}` | `window.coTab` — label is `btn.textContent.trim()` |
| `technology-expand: {name}` | `window.toggleTech` — name comes from `item.dataset.name` |
| `subtab-click: {label}` | `window.mapSubTab` — label is `btn.textContent.trim()` |
| `map-color-toggle` | `window.mapSubTab` — fires at the end after toggling the map color class |

---

## Slide 4 — LineScanner Capabilities

Tab switching and matrix/card controls are `window.xxx` functions. Image zooms
are inline `onclick` attributes on the HTML elements.

| Event | Handler |
|-------|---------|
| `tab-click: {label}` | `window.ls4Tab` |
| `matrix-column-toggle: {name}` | `window.ls4ToggleCol` |
| `process-card-toggle: {name}` | `window.ls4ToggleCard` |
| `process-card-move: {name}` | `window.ls4MoveCard` — also carries `{ direction: 'up' \| 'down' }` |
| `image-zoom: Vertical LineScanner` | Inline `onclick` on `.ls4-card.ls4-card-v` element |
| `image-zoom: Horizontal LineScanner` | Inline `onclick` on `.ls4-card.ls4-card-wide` element |
| `process-zoom: Grinding Line` | Inline `onclick` on `.ls4-proc-card` element |
| `process-zoom: Tempering Line` | Inline `onclick` on `.ls4-proc-card` element |
| `process-zoom: Lamination Line` | Inline `onclick` on `.ls4-proc-card` element |
| `process-zoom: IG Line` | Inline `onclick` on `.ls4-proc-card` element |
| `process-zoom: Coating Line` | Inline `onclick` on `.ls4-proc-card` element |
| `process-zoom: Automotive Printing Line` | Inline `onclick` on `.ls4-proc-card` element |

Note: the `openLb()` function itself (global lightbox, used for single-image
zoom) has no tracking — tracking is on the calling `onclick`.

---

## Slide 5 — Technology

Tab switching is `window.t5Tab`. Diagram interactions are inline `onclick`
attributes. `t5VcHide` is assigned as `window.t5VcHide`.

| Event | Handler |
|-------|---------|
| `tab-click: {label}` | `window.t5Tab` |
| `image-zoom: Technology Diagram - How It Works` | Inline `onclick` on `.t5-diagram.t5-diagram-full` (How It Works tab) |
| `image-zoom: 16-bit Technology Diagram` | Inline `onclick` on `.t5-diagram.t5-diagram-full` (16-bit tab) |
| `diagram-hide-toggle: Drillhole - Camera System` | Inline `onclick` on `.t5-vc-hide` button |
| `image-zoom: Drillhole - Camera System` | Inline `onclick` on `.t5-diagram` inside the vs-Camera panel |
| `diagram-hide-toggle: IG Unit - Camera vs LineScanner` | Inline `onclick` on `.t5-vc-hide` button |
| `image-zoom: IG Unit - Camera vs LineScanner` | Inline `onclick` on `.t5-diagram` inside the vs-Camera panel |

---

## Slide 6 — Surface Quality

Gallery prev/next and defect selection fire from `addEventListener` handlers.
Image zoom fires from `buildSlides()` via `imgEl.addEventListener('click')`.
The global lightbox (`openLb` / `closeLb`) used here has **no** Umami tracking
on close or nav — those events are not captured for slide 6.

| Event | Handler |
|-------|---------|
| `defect-select: {name}` | `selectDefect(idx)` — name comes from `DEFECTS[idx].name` |
| `gallery-prev` | `prevBtn.addEventListener('click', ...)` |
| `gallery-next` | `nextBtn.addEventListener('click', ...)` |
| `image-zoom: {caption}` | `imgEl.addEventListener('click')` inside `buildSlides()` — caption from `img.caption` or `'Image N'` |

Note: lightbox-close and lightbox-nav are **not tracked** for slide 6. The slide
uses the global `openLb()` / `closeLb()` functions which have no Umami calls.

---

## Slide 7 — Dimensional Control

All lightbox functions are assigned as `window.ls7xxx`. Gallery and thumbnail
handlers use `addEventListener`.

| Event | Handler |
|-------|---------|
| `conveyor-lightbox-open` | Inline `onclick` on `.ls7-trigger` — calls `ls7OpenConveyor()` |
| `image-zoom: {caption}` | `imgEl.addEventListener('click')` inside the slide's `IMAGES.forEach` loop |
| `gallery-thumbnail: {i+1}` | `t.addEventListener('click')` inside `lbOpen()` — fires when a thumbnail is clicked |
| `gallery-prev` | `prevBtn.addEventListener('click', ...)` |
| `gallery-next` | `nextBtn.addEventListener('click', ...)` |
| `lightbox-close` | `window.ls7LbClose` |
| `lightbox-nav: prev \| next` | `window.ls7LbNav` |

---

## Slide 8A — Screenprint & Logo

Lightbox functions assigned as `window.ls8axxx`. Slide image clicks use
`SLIDES.forEach` with `img.addEventListener('click')`. Gallery prev/next use
`prev.onclick` / `next.onclick` (not `addEventListener`).

| Event | Handler |
|-------|---------|
| `gallery-prev` | `prev.onclick` handler |
| `gallery-next` | `next.onclick` handler |
| `image-zoom: {cap}` | `img.addEventListener('click')` inside `SLIDES.forEach` — caption from `IMGS[i].cap` |
| `lightbox-close` | `window.ls8aLbClose` |
| `lightbox-nav: prev \| next` | `window.ls8aLbNav` |

---

## Slide 8B — Position & Marking

Carousel prev/next are button elements with IDs `ls8bPrev` / `ls8bNext`,
wired via `addEventListener`. Lightbox functions assigned as `window.ls8bxxx`.

| Event | Handler |
|-------|---------|
| `carousel-prev` | `prevBtn.addEventListener('click')` where `prevBtn = document.getElementById('ls8bPrev')` |
| `carousel-next` | `nextBtn.addEventListener('click')` where `nextBtn = document.getElementById('ls8bNext')` |
| `image-zoom: {caption}` | `imgEl.addEventListener('click')` inside `buildSlides()` |
| `gallery-thumbnail: {i+1}` | `t.addEventListener('click')` inside thumbnail builder |
| `gallery-filter` | `tag.addEventListener('click')` — also carries `{ tag: tag.textContent.trim() }` |
| `lightbox-close` | `window.ls8bLbClose` |
| `lightbox-nav: prev \| next` | `window.ls8bLbNav` |

---

## Slide 10 — Traceability

Tab switching via `window.ls10Switch`. Lightbox assigned as `window.ls10xxx`.

| Event | Handler |
|-------|---------|
| `traceability-tab` | `window.ls10Switch` — carries `{ tab: tabKey }` instead of a value in the event name |
| `image-zoom: {caption}` | `imgEl.addEventListener('click')` inside `buildSlides()` |
| `gallery-thumbnail: {i+1}` | `t.addEventListener('click')` inside `buildThumbs()` |
| `gallery-prev` | `prevBtn.addEventListener('click')` |
| `gallery-next` | `nextBtn.addEventListener('click')` |
| `lightbox-close` | `window.ls10LbClose` |
| `lightbox-nav: prev \| next` | Anonymous function inside `window.ls10LbClose`'s script block (no named function for nav) |

---

## Slide 11 — Sensitivity Adjustment

Lightbox assigned as `window.lssenxxx`.

| Event | Handler |
|-------|---------|
| `image-zoom: {caption}` | `imgEl.addEventListener('click')` inside `buildSlides()` |
| `gallery-thumbnail: {i+1}` | `t.addEventListener('click')` inside `buildThumbs()` |
| `gallery-prev` | `prevBtn.addEventListener('click')` |
| `gallery-next` | `nextBtn.addEventListener('click')` |
| `lightbox-close` | `window.lssenLbClose` |
| `lightbox-nav: prev \| next` | Anonymous function inside `window.lssenLbClose`'s script block (no named function for nav) |

---

## Slide 12 — Footprint

Lightbox assigned as `window.ls11xxx` (note: slide is 12 but prefix is `ls11`).

| Event | Handler |
|-------|---------|
| `image-zoom: {caption}` | `imgEl.addEventListener('click')` inside `buildSlides()` |
| `gallery-thumbnail: {i+1}` | `t.addEventListener('click')` inside `buildThumbs()` |
| `gallery-prev` | `prevBtn.addEventListener('click')` |
| `gallery-next` | `nextBtn.addEventListener('click')` |
| `lightbox-close` | `window.ls11LbClose` |
| `lightbox-nav: prev \| next` | `window.ls11LbNav` |

---

## CTA — Next Steps

Both events are inline `onclick` attributes on anchor tags.

| Event | Handler |
|-------|---------|
| `cta-whatsapp` | Inline `onclick` on `<a class="cta-btn-wa">` |
| `cta-email` | Inline `onclick` on `<a class="cta-btn-email">` |

---

## Presentation coverage summary

All 5 presentations (`softsolution-general-presentation`, `starglass-spain`,
`vitropor-portugal`, `grupo-navas-spain`, `Vidreira-algarvia-portugal`) contain
the same tracking across all slides listed above. Event counts per file are
approximately 77–78 `umami.track()` calls plus 1 `data-umami-event` attribute.
The small count variation between files is due to minor structural differences
in a slide, not missing events.
