# Fix Slide — Softsolution LineScanner

---

## Step 1 — Run the Validator First

```
npm run validate
```

This catches most issues instantly: missing files, duplicate classes/IDs, broken asset paths, unbalanced tags. **Fix anything it reports before going further.**

If the validator is clean but the problem persists → go to Step 2.

---

## Step 2 — Read Before Touching

Read the full slide file. Never edit from memory. If anything will be deleted, flag it to the user first.

---

## Step 3 — Diagnose by Symptom

### Images not showing
- All paths must use `src="assets/filename.png"` — never hardcoded preview paths
- Confirm the file exists in `slide-library/linescanner/Slide Images/`
- If using a new path pattern, update `fixPaths()` in `_preview.html` and `rewriteAssetPaths()` in `build.js`

### JS / onclick not working
`<script>` blocks in slides don't execute in preview (createContextualFragment limitation). Any `onclick="fn()"` must also be defined in `_preview.html`'s post-load init block and called after `container.appendChild`.

Keep the function in the slide's `<script>` too — it runs correctly in built presentations.

### Overlay hidden behind other elements
Use `position: fixed; z-index: 9000+` — never `position: absolute`. The slide's `transform: scale()` traps absolutely positioned children inside the stacking context.

### Layout collapsed / wrong size
- `height: 100%` only works if every ancestor has an explicit height — use `min-height` or `px` instead
- `.slide.content` already has `padding-bottom: 80px !important` — don't add more

### Slide missing from preview (validator passes)
1. Check it's in `SLIDE_FILES` in `_preview.html`
2. If listed but absent from DOM: `_preview.html` must inject slides one-by-one, not as one joined string — see the confirmed fix in the validator docs
3. Check the outer div class is unique and matches the slide number

### CSS leaking between slides
Every slide needs a unique prefix for CSS classes, IDs, and JS function names. Run:
```
grep -r "ls[NN]-" slide-library/linescanner/
```
before renaming anything.

---

## Step 4 — After-Fix Checklist

- [ ] `npm run validate` is clean
- [ ] All `src` values use `assets/`
- [ ] Full-screen overlays use `position: fixed; z-index: 9000+`
- [ ] Class/ID/function names use this slide's unique prefix
- [ ] PE init script is the last `<script>` block in the slide
- [ ] Nothing was silently removed

---

## Reference — Standard Slide Wrapper

```html
<!-- SLIDE_META {"title":"...", "default":"visible", "tags":["..."]} -->
<div class="slide content ls[NN]" style="justify-content:flex-start; align-items:center; padding:52px 80px 0;">
  <div class="slide-logo-row">...</div>
  <!-- content -->
  <style>/* scoped styles — ls[NN]- prefix */</style>
  <script>
  (function () { var s = document.currentScript;
    setTimeout(function () { if (window.PE && s) PE.initSlide(s.closest('.slide')); }, 0); })();
  </script>
</div>
```
