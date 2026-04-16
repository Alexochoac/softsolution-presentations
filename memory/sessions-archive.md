# Sessions Archive

## 2026-03-26 — Grupo Navas Spain presentation + lightbox fix

- Created `docs/grupo-navas-spain/` by duplicating `starglass-spain`
- Updated branding: logo, alt text, company name, contact (Cristian Martin, Jefe de Planta), BASE_URL
- Fixed `openLb()` path bug across all 3 presentations
- Committed and pushed all changes

---

## 2026-03-25 — slide-01 gallery carousel (CSS-only)
- Added gallery button to cover slide that opens a centered floating popup carousel
- 3 images: Tempering Line, IG Line, Automotive Printing Line
- Auto-advances every 3 seconds using CSS `@keyframes` animation (no JS)
- Open/close toggle uses hidden checkbox + label pattern (no JS)
- Diagnosed persistent `SyntaxError: Failed to execute 'appendChild'` — confirmed from slide-01 script via line number shifting after code removal
- Removed entire main IIFE script from the slide to resolve the error
- Only the tiny `PE.initSlide` script remains
