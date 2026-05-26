# Sales Metrics Dashboard — Technical Documentation

**Location:** `docs/internal/Sales Metrics/`
**Live URL:** `https://alexochoac.github.io/softsolution-presentations/internal/Sales%20Metrics/`
**Password:** `SOSO2026`
**Last documented:** 2026-05-26

---

## What This Is

An internal sales dashboard for the Softsolution & LiteSentry team. It tracks how many units of each product were sold (reached) vs. the annual sales budget, broken down by team member and time period. Data is pulled automatically from HubSpot every morning by an n8n workflow and published to GitHub Pages.

---

## File Structure

```
docs/internal/Sales Metrics/
├── index.html          ← Single-file dashboard (all HTML, CSS, JS in one file)
└── assets/
    └── data.json       ← All data: budgets, reached numbers, owner names
```

Everything runs as a static website. There is no server. The dashboard reads `data.json` at load time using `fetch()`.

---

## How the Dashboard Works

### 1. Password Gate
On load, checks `sessionStorage` for `ss-auth = SOSO2026`. If not set, shows a password screen. Password is hardcoded as `SOSO2026`.

### 2. Data Load
```js
fetch('./assets/data.json?t=' + Date.now())
```
The `?t=` timestamp busts the browser cache so you always get fresh data.

### 3. State
Two global variables control what's shown:
```js
let activeOwners = ['all'];              // ['all'] or array of owner ID strings
let activeMonths = [0,1,2,...,11];       // month indices (0=Jan, 11=Dec)
```

### 4. Filter UI
- **All Team button** — resets `activeOwners` to `['all']`
- **Team Member dropdown** — multi-select checkboxes; sets `activeOwners` to an array of selected owner IDs
- **Full Year / Q1 / Q2 / Q3 / Q4** — quick presets for `activeMonths`
- **Month dropdown** — fine-grained month checkbox selection
- **Date range inputs** — start/end date pickers that compute which month indices to include

Any filter change calls `refreshDashboard()`, which recomputes and re-renders everything.

### 5. Budget vs. Reached Logic

Key helper functions:

```js
// Returns the reached array for a specific owner
getReached(p, owner)
// → if owner === 'all', returns p.reached['all']
// → if owner is specific, returns p.reached[ownerKey] or zeros (NOT all-team fallback)

// Returns the budget array for a specific owner
getBudget(p, owner)
// → if owner === 'all' or no budgetByOwner data, returns p.budget (team total)
// → otherwise returns p.budgetByOwner[ownerKey]

// Sums reached across multiple selected owners
getSummedReached(p, owners)
// → if ['all'], returns getReached(p, 'all')
// → otherwise loops owners and sums their individual arrays

// Sums budget across multiple selected owners
getSummedBudget(p, owners)
// → if ['all'], returns p.budget (team total)
// → otherwise sums budgetByOwner for selected owners
// → 0 budget IS real data — no fallback or proportional estimate
```

**Important rule:** Owner IDs like `daniel_obregon` and `alex_ochoa` exist in the owners map and budget table but have no entries in `reached` (n8n only tracks HubSpot owner IDs). `getReached` returns zeros for them — it does NOT fall back to the all-team total, which would inflate numbers.

---

## data.json Structure

```json
{
  "year": 2026,
  "lastUpdated": "2026-05-22T08:42:59.021Z",

  "hubspot": {
    "propertyName": "inspection_system__multiple_checkbox_",
    "productMap": {
      "linescanner":       ["linescanner"],
      "osprey":            ["osprey25", "osprey"],
      "bowscanner":        ["bowscanner"],
      "culletscanner":     ["culletscanner"],
      "virtualdigitizing": ["virtualdigitizing"]
    }
  },

  "owners": {
    "90583398":     "Peter Pfannenstill",
    "90583466":     "Nate Huffman",
    "98277992":     "Jonas Pfannenstill",
    "36636696": "Daniel Obregon",
    "107285591":    "Markus Stefan",
    "87123134":   "Alex Ochoa",
    "1813254685":   "Dave Cousins",
    "all":          "All Team"
  },

  "products": {
    "linescanner": {
      "label": "LineScanner",
      "color": "#F5A623",
      "budget": [6,6,7,7,7,7,7,6,6,6,7,7],       ← 12 values, one per month (team total)
      "budgetByOwner": {
        "90583398": [0,0,...],                      ← per-person monthly budget (editable via UI)
        "90583466": [0,0,...],
        ... (one entry per owner, 12 values each)
      },
      "reached": {
        "90583398": [1,1,4,4,1,0,0,...],           ← actual deals closed per month (written by n8n)
        "90583466": [0,0,1,1,0,...],
        ... (one entry per HubSpot owner ID)
        "all": [4,4,13,9,7,0,0,...]                ← team total (written by n8n)
      }
    },
    "osprey": { ... },
    "bowscanner": { ... },
    "culletscanner": { ... },
    "virtualdigitizing": { ... }
  }
}
```

**What n8n writes:** Only the `reached` fields (both per-owner and `all`). It also updates `lastUpdated` and `owners` (HubSpot owner names). It does NOT touch `budget` or `budgetByOwner`.

**What the Budget UI writes:** Only `budgetByOwner` and `budget` (team total recalculated from per-person sums). Written via a separate n8n webhook.

---

## n8n Workflow 1 — HubSpot to GitHub (Daily Sync)

**Workflow name:** `Sales Metrics — HubSpot to GitHub`
**Trigger:** Scheduled daily at 6:00 AM
**What it does:** Pulls closed deals from HubSpot for the current year, counts them by product and owner, writes updated `reached` data back to `data.json` on GitHub.

### Node Chain

```
Schedule Trigger
  → Get HubSpot Owners       (GET /crm/v3/owners)
  → Search HubSpot Deals     (POST /crm/v3/objects/deals/search)
  → Process Deals            (Code node)
  → Get GitHub File          (GET /repos/.../contents/data.json) [executeOnce: true]
  → Build JSON               (Code node)
  → Update GitHub File       (PUT /repos/.../contents/data.json)
```

### Key Details

**Get HubSpot Owners:** Fetches all owners to build a name map `{ id → full name }`.

**Search HubSpot Deals:** Searches for deals with `closedate` in the current year and `dealstage = closedwon`. Uses pagination to get all results.

**Process Deals (Code node):**
- Accesses HubSpot owners via `$('Get HubSpot Owners').first().json`
- Reads the `inspection_system__multiple_checkbox_` property (semicolon-separated string like `"linescanner;osprey25"`)
- Parses the close date using `new Date(props.closedate).getTime()` — **must use `new Date()`, not `parseInt()`** (parseInt on an ISO date string returns just the year)
- Maps HubSpot values to product keys using `productMap`
- Builds a structure: `{ productKey: { ownerID: [12 monthly counts] } }`

**Get GitHub File:** Reads the current `data.json` to get its SHA (required for the GitHub PUT API to update a file). Has `executeOnce: true` to prevent running once per deal.

**Build JSON (Code node):** Merges the new reached data into the existing JSON. Writes per-owner arrays and the `all` aggregate. Preserves `budget` and `budgetByOwner` (does not overwrite them).

**Update GitHub File:** Sends a PUT request to the GitHub Contents API with:
- `message`: commit message
- `content`: base64-encoded JSON
- `sha`: the current file SHA (from Get GitHub File step)
- `Authorization: token GITHUB_PAT` — must use a **classic PAT** with `repo` scope. Fine-grained PATs have caused 403 errors.

### Known Bugs Fixed
- **Date parsing:** `parseInt(props.closedate)` returns `2026` from an ISO string, putting all deals in January. Fixed with `new Date(props.closedate).getTime()`.
- **Wrong property name:** The HubSpot property is `inspection_system__multiple_checkbox_` (with double underscores), not `inspection_system`.
- **Double execution:** The Process Deals node was directly connected to Get HubSpot Owners, causing it to run twice. Fixed by removing the direct connection and accessing owners via `$('Get HubSpot Owners').first().json` instead.

---

## n8n Workflow 2 — Budget Update (Webhook)

**Workflow name:** `Sales Metrics — Budget Update`
**Trigger:** POST webhook at `https://n8n.wbtm.io/webhook/sales-metrics-budget`
**What it does:** Receives updated budget values from the dashboard's Budget table, writes them to `data.json` on GitHub.

### Node Chain

```
POST Webhook
  → Validate Password        (If node: body.password === 'SOSO2026')
  → Get GitHub File          (GET current data.json + SHA)
  → Merge Budget             (Code node)
  → Update GitHub File       (PUT updated data.json)
  → Respond Success          (200 OK)
```

### Payload Format

The dashboard sends:
```json
{
  "password": "SOSO2026",
  "budget": {
    "linescanner": {
      "90583398": [0, 0, 2, 2, ...],    ← per-owner monthly budget
      "90583466": [0, 0, 1, 1, ...],
      "_total":   [0, 0, 3, 3, ...]     ← sum of all owners (team total)
    },
    "osprey": { ... },
    ...
  },
  "owners": {
    "90583398": "Peter Pfannenstill",   ← editable owner names
    ...
  }
}
```

### Merge Budget Node
Updates `data.json`:
- Sets `products[pk].budgetByOwner[ownerKey]` from budget payload
- Sets `products[pk].budget` from `budget[pk]._total`
- Updates `owners` map with any renamed owner names

---

## Adding a New Product

1. **`data.json`** — add a new key under `products`:
   ```json
   "newproduct": {
     "label": "Product Name",
     "color": "#hexcolor",
     "budget": [1,1,1,1,1,1,1,1,1,1,1,1],
     "budgetByOwner": {
       "90583398": [0,0,0,0,0,0,0,0,0,0,0,0],
       "90583466": [0,0,...],
       "98277992": [0,0,...],
       "36636696": [0,0,...],
       "107285591": [0,0,...],
       "87123134": [0,0,...],
       "1813254685": [0,0,...]
     },
     "reached": {
       "90583398": [0,0,...],
       ...
       "all": [0,0,...]
     }
   }
   ```

2. **n8n Process Deals node** — add the new product to `productMap` and `productKeys`.

3. **n8n `hubspot.productMap`** in data.json — add the HubSpot checkbox value(s) that map to this product.

---

## Adding a New Team Member

1. **`data.json` `owners`** — add their key and name:
   ```json
   "new_owner_key": "Full Name"
   ```
   - If they are a HubSpot user, use their HubSpot numeric ID as the key.
   - If not in HubSpot, use a string key like `first_last`.

2. **`data.json` `budgetByOwner`** — add their key to every product's `budgetByOwner` with 12 zeros.

3. **`index.html` `OWNER_ORDER`** — add their key to the ordered list used by the budget table:
   ```js
   var OWNER_ORDER = ['90583398','90583466',...,'new_owner_key'];
   ```

**Note:** Only HubSpot owner IDs will have data in `reached`. Non-HubSpot owners will always show 0 reached, which is correct — do not fall back to the all-team total.

---

## Editing Budgets

Open the live dashboard → click **Budget** button (top right) → enter password `SOSO2026` → click **Edit** → enter per-person monthly values → click **Save Changes**.

The dashboard sends the data to the n8n webhook, which writes to GitHub. The page auto-reloads after ~5 seconds. GitHub Pages takes 2–5 minutes to reflect the change.

---

## GitHub Pages Setup

- **Repository:** `Alexochoac/softsolution-presentations`
- **Branch:** `master`
- **Source folder:** `docs/`
- **URL pattern:** `https://alexochoac.github.io/softsolution-presentations/[path-from-docs]`

When n8n pushes a commit to this repo, the n8n workflow will sometimes have committed ahead of local changes. If `git push` is rejected, run:
```
git pull --rebase origin master
git push origin master
```

GitHub Pages has a ~2–5 minute CDN cache delay after each push.

---

## GitHub API Authentication

The n8n workflows use a **classic GitHub Personal Access Token (PAT)** with `repo` scope.

- Fine-grained PATs caused 403 errors and should not be used.
- The Authorization header value must be: `token ghp_YOURTOKEN` (with the `token ` prefix).
- Store the PAT as a credential in n8n, not hardcoded.

---

## Number Display Rules

All numbers displayed on the dashboard go through `fmt(n)`:
```js
function fmt(n) { return parseFloat((+n).toFixed(2)); }
```
This caps decimals to 2 places and removes trailing zeros. `37` stays `37`, `11.28571` becomes `11.29`.

---

## Chart Library

Chart.js `v4.4.0` loaded from CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

Charts used:
- **All Products** — grouped bar chart (Budget vs. Reached per product)
- **Per-product** — line chart (monthly budget target, actual reached, pace projection)

---

## Custom Breakdown Tooltip

Both the All Products bar chart and the per-product line charts use a custom HTML tooltip (not the default Chart.js one).

**Why custom:** The native tooltip can't scroll. When the team + OEM breakdown is long, the custom tooltip adds a scrollbar.

### How It Works

A single `<div id="chart-tooltip-custom">` is created once on `document.body` and reused across all charts. It is positioned with `position:absolute` and repositioned on every hover via `placeTooltip()`.

```js
function getOrCreateTooltipEl() {
  var el = document.getElementById('chart-tooltip-custom');
  if (!el) {
    el = document.createElement('div');
    el.id = 'chart-tooltip-custom';
    el.addEventListener('mouseenter', function() { el._hovered = true; });
    el.addEventListener('mouseleave', function() { el._hovered = false; el.style.opacity = '0'; });
    document.body.appendChild(el);
  }
  return el;
}
```

**Scrollbar hover fix:** The tooltip uses `pointer-events:auto` so the mouse can interact with it. When Chart.js fires the hide signal (opacity → 0), the external callback checks `el._hovered` — if the mouse is over the tooltip, it stays visible. It hides when the mouse leaves the tooltip.

### Tooltip Content

Each chart passes `datasetIndex` to detect which dataset is hovered (0 = Budget, 1 = Reached), then calls `tooltipOwnerRows()` which loops `TEAM_ORDER` and `OEM_ORDER` and lists every owner with a non-zero value, grouped under **Team** and **OEM** sections.

```js
function tooltipOwnerRows(p, monthIdx, isYTD, activeM, curMonthIdx, mode)
```

- `isYTD = true` → sums across all active months (used by bar chart)
- `isYTD = false` → reads a single month index (used by line chart)

### CSS

```css
#chart-tooltip-custom {
  position:absolute; pointer-events:auto;
  background:rgba(10,10,10,.96); border:1px solid rgba(255,255,255,.1);
  border-radius:8px; padding:10px 12px; font-size:11px; line-height:1.55;
  z-index:9999; min-width:170px; max-width:240px;
  max-height:250px; overflow-y:auto;
  transition:opacity .1s ease; color:#f1f5f9;
}
```

The `max-height` + `overflow-y:auto` combination enables the scrollbar.

---

## Budget Save Status Message

The save feedback message (`Saving...` / `Saved successfully...` / `Save failed:...`) is displayed **below the Save Changes button**, not below the table.

The element `#budgetSaveStatus` sits inside the same flex column as the button row, aligned to the right. It renders with `min-height:16px` so the layout does not shift when it appears.

The save flow:
1. Click **Save Changes** → status shows `Saving...` in gray
2. On success → status shows `Saved successfully. Reload in ~30s to see updated data.` in green; page auto-reloads after 5 seconds
3. On failure → status shows `Save failed: <error>` in red
