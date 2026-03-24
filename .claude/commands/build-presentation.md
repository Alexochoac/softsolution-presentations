# Build Presentation — Softsolution LineScanner

Assembles selected slide templates into a single self-contained `index.html` for a specific customer/prospect.
Also handles **modifying an existing build** — detects the state automatically.

---

## Step 1 — Detect State

Check if a build already exists:
```
customers/softsolution/finished-presentations/[prospect-slug]/index.html
```

**If NO build exists → New Build flow (Step 2)**
**If build exists → Modify flow (Step 2M)**

---

## Step 2 — New Build Interview

Ask these one at a time:

1. **Who is this presentation for?**
   (Company name + slug, e.g. "Starglass Spain" → `starglass-spain`)

2. **Which slides to include?**
   Show the full list from `linescanner/` sorted by number. Let user pick all or a subset.
   Default: all slides in order.

3. **Customer logo filename?**
   Check `customers/softsolution/slide-library/linescanner/Slide Images/` for available logos.
   This replaces `logo-[customer].jpg` in every slide.

4. **Umami website ID?**
   Optional — if provided, analytics will be active. If skipped, analytics block is commented out.

5. **Hosted URL for share button?**
   e.g. `https://alexochoac.github.io/softsolution-presentations/starglass-spain/`
   This sets `PE.config.baseUrl` equivalent in the share modal.

Confirm summary and wait for approval before building.

---

## Step 2M — Modify Existing Build

Read the existing `index.html`. Show:
- Which slides are currently included
- Current customer logo
- Current share URL

Ask what to change:
- Add / remove slides
- Update logo or branding
- Update share URL
- Rebuild from scratch

Then apply changes and regenerate.

---

## Step 3 — Build

### Output location
```
customers/softsolution/finished-presentations/[prospect-slug]/
├── index.html       ← everything inlined
└── assets/          ← only images actually used by included slides
```

### What goes into index.html

**1. Shell HTML** — extracted from `_preview.html`, keeping:
- `<head>` (meta, CSS variables, layout CSS, responsive CSS)
- Nav arrows, nav dots, slide counter
- Share button + share modal (inline — no editor.js dependency)
- Theme toggle
- Umami snippet (active if ID provided, commented out if not)

Strip from shell:
- Preview badge (`Slide Library Preview`)
- Save buttons (`💾 Save slide`, `💾 Save all`)
- `editor.js` script tag
- `fetch()` / `SLIDE_FILES` dynamic loading logic

**2. Slide HTML** — for each included slide in order:
- Read the full `.html` file
- Replace `assets/` image paths → `assets/` (same — images will be in `assets/` folder)
- Replace `logo-[customer].jpg` → actual logo filename
- Replace `logo-litesentry.png` → `logo-litesentry.png` (keep as-is)
- Strip any `data-pe-source-file` attributes (editor artifacts)
- Wrap in slide container as-is (scoped styles and scripts stay inline)

**3. Share modal** — inline the share button CSS + modal HTML + JS directly in the shell.
Use the same logic as `editor.js` `_buildShareModal`, `_buildUrl`, `_sendWa`, `_sendEmail`, `_copyLink`, `_validateShare` — but as standalone functions, not under `PE.*`.

### Path resolution for assets
After generating `index.html`, list every unique `assets/[filename]` reference found in the output.
Copy (or instruct to copy) those files from:
```
customers/softsolution/slide-library/linescanner/Slide Images/[filename]
```
to:
```
customers/softsolution/finished-presentations/[prospect-slug]/assets/[filename]
```

---

## Step 4 — Verify & Report

After writing the file:
1. Count slides included
2. List all asset files needed in `assets/`
3. Report output path
4. Say: "Open `index.html` directly in the browser to test — no Live Server needed."

---

## Rules

- Output must work as `file://` (no fetch, no external JS/CSS dependencies except Umami CDN)
- All CSS and JS inlined — one file is self-contained
- Images stay as separate files in `assets/` (base64 encoding avoided — too heavy)
- Share modal ships without editor tools (no save buttons, no resize handles, no PE overlays)
- `_validateShare` logic (name + position required) must be preserved in the output
- UTM params preserved exactly: `utm_source=sharepresentationbutton`, `utm_medium`, `utm_content`, `utm_term`, `utm_campaign`
