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

## Next Steps
- [x] Migrate existing softsolution folder from presentation-builder
- [ ] Consolidate into one repo (Option B) — merge `softsolution-presentations` into this repo under `dist/`:
  - [x] Create `dist/` folder here and move finished presentations into it
  - [x] Update `outputDir` in all build configs (e.g. `builds/grupo-navas.js`) to point to `docs/GrupoNavas-Spain/` etc.
  - [x] Update GitHub Pages settings on this repo to serve from `/docs`
- [x] Refactor build system to use a shared assets folder — LineScanner images now live in `docs/shared/assets/` and `docs/shared/general/`. Build auto-copies them on first run. Each customer output only contains their logo + index.html.

## Key Decisions
(Record important choices made during the project)

## Notes

---
Last updated: 2026-03-27
