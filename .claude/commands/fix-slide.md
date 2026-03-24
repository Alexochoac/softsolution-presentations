# Fix Slide — Softsolution LineScanner

Use this command whenever editing an existing slide in `customers/softsolution/slide-library/linescanner/`.

---

## Before Touching Anything

1. **Read the full slide file first.** Never edit from memory or assumptions.
2. **Check if the fix affects other slides.** If changing a CSS class name, grep for it across all slides. If renaming a global JS function, check who calls it.
3. **If anything will be deleted, flag it explicitly to the user first.** "I'm about to remove X — confirm?" Never silently delete working content.

---

## Architecture Rules (Non-Negotiable)

### Slide templates are the source of truth
- `_preview.html` is a **dev tool only** — it never ships to the customer
- Each template must be fully self-contained: its own scoped `<style>`, its own IIFE `<script>`
- Templates are later assembled into a single `index.html` per customer project — this is why namespacing matters so much

### Unique namespace per slide — CRITICAL
Every slide gets its own prefix based on its number. **No two slides share a prefix.**

| Slide | Prefix |
|---|---|
| slide-01 | `ls01-` |
| slide-02 | `ls02-` |
| slide-06 | `ls06-` / `s6` |
| slide-07 | `ls7-` |
| slide-08 | `ls8p-` |
| slide-09 | `ls8-` (legacy) |
| slide-10 | `ls10-` |
| slide-11 | `ls11-` |

Apply to:
- CSS class names: `.ls10-carousel`, `.ls11-viewport`, etc.
- Global JS functions: `ls10LbClose()`, `ls11LbNav()`, etc.
- Element IDs: `id="ls10-lb"`, `id="ls11-prev"`, etc.

> If you create a new slide or notice a collision, rename to the correct prefix immediately.

### Image paths always use `assets/`
```html
<!-- ✅ Correct -->
<img src="assets/image101.png">
{ src: 'assets/Slide43.jpg', caption: '...' }

<!-- ❌ Wrong -->
<img src="linescanner/Slide Images/image101.png">
<img src="Slide%20Images/image101.png">
```
`_preview.html` rewrites `assets/` → `linescanner/Slide Images/` at preview time. The build process handles it at build time.

### No bottom clearance compensation
`_preview.html` globally applies `padding-bottom: 80px !important` to `.slide.content`. **Never add `margin-bottom` or `padding-bottom` to slide content to compensate** — it will double-stack.

### Standard slide wrapper
```html
<div class="slide content ls[NN]" style="justify-content:flex-start; align-items:center; padding:52px 80px 0;">
  <div class="slide-logo-row">...</div>
  <!-- content -->
  <script>
  (function () { var s = document.currentScript;
    setTimeout(function () { if (window.PE && s) PE.initSlide(s.closest('.slide')); }, 0); })();
  </script>
</div>
```

### Carousel requirements
Any carousel the editor should be able to add images to needs:
```html
<div class="ls[NN]-viewport" id="ls[NN]-viewport" data-pe-carousel=""></div>
```
And in JS:
```js
viewport._peAddImage = function (src, caption) { ... };
```

---

## Making the Fix

1. Read the slide → understand current structure
2. Make the smallest change that achieves the goal
3. Check: does this introduce a class collision? Does it break carousel path rewriting?
4. If `SLIDE_FILES` in `_preview.html` needs updating (new slide, reorder), do it
5. Tell the user what changed and what to look for in the preview

---

## After the Fix — Quick Checklist

- [ ] Class/ID names are unique to this slide's prefix
- [ ] Global JS function names are namespaced
- [ ] All image `src` values use `assets/`
- [ ] No compensating `margin-bottom` / `padding-bottom` added
- [ ] PE init script is still the last `<script>` block
- [ ] Nothing was silently removed
- [ ] If carousel exists: `data-pe-carousel` present + `_peAddImage` exposed
