# Create Slide — Softsolution LineScanner

Guides the user through a short interview, then generates a correctly structured slide file for `customers/softsolution/slide-library/linescanner/`.

---

## Step-by-step Process

Go **one step at a time**. Wait for the answer before moving to the next.

---

### Step 1 — Topic & Purpose

Ask:
1. **What is this slide about?** (one sentence — what does the viewer take away?)
2. **Where does it fit in the sequence?** (after which slide? check the current list in `_preview.html` → `SLIDE_FILES`)
3. **Is there a script or talking points?** (paste anything — bullet points, rough notes, full sentences — all welcome)

---

### Step 2 — Inspiration & References

Ask:
> "Do you have any inspiration or reference material for this slide?
> For example: a screenshot, a competitor slide, a photo, a diagram, rough sketch, or just a description of what you're imagining."

Accept anything:
- Image files in the `Slide Images/` folder → reference them directly
- A description of a layout or visual they saw somewhere
- "Something like slide X" → go read that slide for reference
- "No idea" → that's fine, move on

---

### Step 3 — Layout

Based on the topic and inspiration, suggest **one layout** as your recommendation. Explain why in one sentence. Then ask: "Does this work or would you prefer a different one?"

#### Available layouts (from `components.html`):

| Layout | Best for |
|---|---|
| **Section header** | Transition slides, single strong statement |
| **Big stat** | One powerful number — mic-drop moment |
| **KPI row** | 3–4 key metrics side by side |
| **3-col feature cards** | Three benefits, capabilities, or features |
| **Integration grid** | Partner logos, compatible systems |
| **Numbered feature list** | Steps, how-it-works, process |
| **Column list** | Before/after bullet points inside two panels |
| **Two column** | Any two-panel layout — mix content freely |
| **Old vs new comparison** | Red/green contrast between old and new way |
| **Image + text split** | One image + text side by side |
| **Carousel** | Multiple screenshots or images with lightbox |
| **Carousel + tabs** | Multiple image sets grouped by category |
| **CTA box** | Next steps, call to action, contact |

---

### Step 4 — Confirm & Build

Summarise back:
- Slide topic: ...
- Position in sequence: slide-XX-[topic].html
- Layout: ...
- Key content: ...

Say: "Ready to build — confirm and I'll generate the file."

Wait for approval, then build.

---

## Generation Rules

### File naming
`slide-[NN]-[topic-slug].html`
- `NN` = two-digit number (01, 02 … 14)
- `topic-slug` = lowercase, hyphens, short
- Save to: `customers/softsolution/slide-library/linescanner/`

### If inserting mid-sequence
- Rename any slides that need to shift
- Update `SLIDE_FILES` in `_preview.html` to match the new order

### Namespace — assign the next available prefix
Check the existing slides and assign the correct `ls[NN]-` prefix. Never reuse a prefix.

| Slide | Prefix |
|---|---|
| slide-01 | `ls01-` |
| slide-02 | `ls02-` |
| slide-06 | `s6` |
| slide-07 | `ls7-` |
| slide-08 | `ls8p-` |
| slide-09 | `ls8-` |
| slide-10 | `ls10-` |
| slide-11 | `ls11-` |

### Required slide wrapper
```html
<div class="slide content ls[NN]" style="justify-content:flex-start; align-items:center; padding:52px 80px 0;">
  <div class="slide-logo-row">
    <img src="assets/logo-[customer].jpg" alt="[Customer]">
    <span class="slide-logo-sep"></span>
    <img src="assets/logo-litesentry.png" alt="LiteSentry" class="slide-logo-ls">
  </div>
  <div class="section-label">Section Name</div>
  <h1 class="slide-title">Title with <span class="blue">highlight</span></h1>
  <!-- content -->
  <script>
  (function () { var s = document.currentScript;
    setTimeout(function () { if (window.PE && s) PE.initSlide(s.closest('.slide')); }, 0); })();
  </script>
</div>
```

### Image paths — always `assets/`
```html
<img src="assets/filename.jpg">           <!-- ✅ -->
{ src: 'assets/filename.jpg' }            <!-- ✅ in JS arrays -->
```
Never use full paths. `_preview.html` rewrites `assets/` automatically.

### No bottom clearance compensation
Do NOT add `margin-bottom` or `padding-bottom` to compensate for the nav bar. The preview shell handles this globally.

### Carousel slides must include
- `data-pe-carousel=""` on the viewport element
- `viewport._peAddImage = function(src, caption){...}` in the script
- Unique `ls[NN]-` prefix on all classes, IDs, and global functions

### Light mode
Use CSS variables (`var(--text)`, `var(--bg-card)`, `var(--border)`) — never hardcode colours on themed elements.

### After generating
1. Save the file
2. Update `SLIDE_FILES` in `_preview.html`
3. Run `npm run validate` — fix any errors before continuing
4. Tell the user: "Open Live Server on `_preview.html` to preview. Run `npm run watch` in a terminal to catch issues as you edit."
