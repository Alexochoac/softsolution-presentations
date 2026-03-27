# Sessions

## 2026-03-27 — slide-04 carousel + validator + Save All damage recovery

- Built `scripts/validate.js` — catches missing files, duplicate classes/IDs, broken assets, unbalanced tags across all 14 slides. Added `npm run validate` and `npm run watch` scripts to package.json
- Rewrote `.claude/commands/fix-slide.md` — validator is now Step 1, symptom diagnosis is fallback
- Added `npm run watch` guidance to `.claude/commands/create-slide.md`
- Fixed slide-12 outer class `ls11` → `ls12` (all 40 occurrences renamed)
- Replaced 3 stacked scanner image cards in slide-04 capability matrix with a single auto-rotating carousel (fade transition, 3.5s interval, dot indicators, click to zoom)
- Diagnosed and fixed `position:absolute; inset:0` carousel slides escaping their container and overlapping other slides — switched to `display:none/flex` toggle approach
- Diagnosed Save All corruption: style block truncated mid-CSS in slide-01, `</style></div>` inserted mid-selector. Restored missing media queries and PE init script closing tag
- Restored slides 02–14 from git after Save All damage; re-applied slide-12 ls11→ls12 fix
- Fixed gallery carousel arrows (HTML entities converted to raw chars by Save All) and removed contenteditable from stat block elements to prevent editor.js gradient conflicts

**Pending:**
- Replace Phrase 1/2/3 placeholder text slides in gallery with real content
- Text slide font sizes in gallery may need adjustment

---

## 2026-03-26 — Grupo Navas Spain presentation + lightbox fix

- Created `docs/grupo-navas-spain/` by duplicating `starglass-spain` (already in Spanish)
- Updated branding: logo, alt text, company name, contact (Cristian Martin, Jefe de Planta), BASE_URL
- Fixed `openLb()` path bug across all 3 presentations (starglass, vidreira, grupo-navas)
  - Root cause: `openLb('assets/...')` should be `openLb('../shared/assets/...')` — images displayed but zoom was broken
  - 12 calls fixed per file, 3 files total
- Committed and pushed all changes

**Pending:**
- Replace Phrase 1/2/3 placeholder text slides in gallery with real content

---

## 2026-03-25 — slide-01 gallery rebuild (JS) + fix-slide skill overhaul

- Rebuilt gallery from scratch: replaced CSS checkbox trick with JS-controlled `position:fixed` overlay
- Discovered root cause: slide `<script>` blocks don't execute via `createContextualFragment` in Chrome — `onclick="fn()"` throws ReferenceError
- Fix: gallery functions (`ls1OpenGallery`, `ls1CloseGallery`, `ls1CarMove`) defined in `_preview.html`'s post-load `initSlide01Gallery()` function
- Added auto-advance (3 s interval, resets on manual nav) and Escape/backdrop-click to close
- Added 3 editable text-only placeholder slides (dark gradient + dashed border) alongside render images
- Updated fix-slide skill: rewritten as diagnostic-first process organized by symptom type
- Committed and pushed all changes

**Pending:**
- Replace Phrase 1/2/3 placeholder text slides with real content when ready

