// scripts/validate.js
// One-time check:  node scripts/validate.js
// Watch mode:      node scripts/validate.js --watch

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const SLIDE_LIB  = path.join(ROOT, 'slide-library');
const PREVIEW    = path.join(SLIDE_LIB, '_preview.html');
const IMAGES_DIR = path.join(SLIDE_LIB, 'linescanner', 'Slide Images');
const SLIDES_DIR = path.join(SLIDE_LIB, 'linescanner');

// Known filename remaps applied by _preview.html fixPaths() and build.js.
// These are intentional — don't flag them as missing.
const KNOWN_REMAPS = {
  'logo-litesentry.png':   'LOGO LiteSentry Greys.png',
  'logo-[customer].jpg':   'LOGO SoftSolution.png',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function extractSlideFiles(html) {
  const match = html.match(/const SLIDE_FILES\s*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.trim().replace(/['"]/g, '').replace(/,$/, ''))
    .filter(l => l.endsWith('.html'));
}

function getOuterSlideClass(html) {
  // First div with class containing "slide"
  const m = html.match(/<div class="(slide[^"]*)"/);
  return m ? m[1] : null;
}

function getAssetRefs(html) {
  const refs = new Set();
  // Strip JS line comments first to avoid picking up placeholder examples like assets/...
  const stripped = html.replace(/\/\/[^\n]*/g, '');
  for (const m of stripped.matchAll(/src="assets\/([^"]+)"/g))          refs.add(m[1]);
  for (const m of stripped.matchAll(/url\(['"]?assets\/([^'")+]+)/g))   refs.add(m[1]);
  for (const m of stripped.matchAll(/openLb\('assets\/([^']+)'/g))      refs.add(m[1]);
  for (const m of stripped.matchAll(/openPopover\('assets\/([^']+)'/g)) refs.add(m[1]);
  for (const m of stripped.matchAll(/['"]assets\/([^'"]+)['"]/g))       refs.add(m[1]);
  // Filter out placeholder-style values (e.g. "..." or very short)
  return [...refs].filter(r => !r.includes('...') && r.length > 3);
}

function getIds(html) {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
}

function tagBalance(html, tag) {
  const opens  = (html.match(new RegExp(`<${tag}[^>]*>`,  'gi')) || []).length;
  const closes = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
  return { opens, closes, ok: opens === closes };
}

// ── Core validation ───────────────────────────────────────────────────────────

function validate() {
  const errors   = [];
  const warnings = [];

  // ── 1. Read _preview.html and extract SLIDE_FILES ──
  const previewHtml = readFile(PREVIEW);
  if (!previewHtml) {
    errors.push('Cannot read slide-library/_preview.html');
    return print(errors, warnings, 0);
  }

  const slideFiles = extractSlideFiles(previewHtml);
  if (slideFiles.length === 0) {
    errors.push('Could not parse SLIDE_FILES from _preview.html');
    return print(errors, warnings, 0);
  }

  // ── 2. Files listed in SLIDE_FILES but missing on disk ──
  slideFiles.forEach(f => {
    const full = path.join(SLIDE_LIB, f);
    if (!fs.existsSync(full)) {
      errors.push(`${f} — listed in SLIDE_FILES but FILE NOT FOUND on disk`);
    }
  });

  // ── 3. Slide files on disk but not in SLIDE_FILES ──
  const diskFiles = fs.readdirSync(SLIDES_DIR)
    .filter(f => /^slide-\d+.*\.html$/.test(f))
    .sort();
  diskFiles.forEach(f => {
    const key = `linescanner/${f}`;
    if (!slideFiles.includes(key)) {
      warnings.push(`linescanner/${f} — file exists on disk but NOT listed in SLIDE_FILES`);
    }
  });

  // ── 4. Per-slide checks ──
  const seenClasses = {};   // class → slide label (duplicate detection)
  const allIds      = {};   // id    → [slide labels] (cross-slide duplicate detection)

  slideFiles.forEach((f, idx) => {
    const full = path.join(SLIDE_LIB, f);
    if (!fs.existsSync(full)) return; // already reported

    const html  = readFile(full);
    const label = `slide-${String(idx + 1).padStart(2, '0')} (${path.basename(f)})`;

    // 4a. Outer div class must be unique
    const outerClass = getOuterSlideClass(html);
    if (!outerClass) {
      errors.push(`${label} — no outer <div class="slide ..."> found`);
    } else if (seenClasses[outerClass]) {
      errors.push(
        `${label} — outer class "${outerClass}" is a DUPLICATE of ${seenClasses[outerClass]}`
      );
    } else {
      seenClasses[outerClass] = label;
    }

    // 4b. Asset references must exist on disk
    getAssetRefs(html).forEach(asset => {
      const resolved = KNOWN_REMAPS[asset] || asset;
      if (!fs.existsSync(path.join(IMAGES_DIR, resolved))) {
        warnings.push(`${label} — missing asset: assets/${asset}`);
      }
    });

    // 4c. <style> and <script> tags must be balanced
    ['style', 'script'].forEach(tag => {
      const { opens, closes, ok } = tagBalance(html, tag);
      if (!ok) {
        errors.push(
          `${label} — <${tag}> tags unbalanced: ${opens} open, ${closes} close`
        );
      }
    });

    // 4d. Collect element IDs for cross-slide duplicate check
    getIds(html).forEach(id => {
      if (!allIds[id]) allIds[id] = [];
      allIds[id].push(label);
    });
  });

  // ── 5. Cross-slide duplicate IDs ──
  Object.entries(allIds).forEach(([id, labels]) => {
    if (labels.length > 1) {
      warnings.push(`Duplicate ID "${id}" in: ${labels.join(' AND ')}`);
    }
  });

  print(errors, warnings, slideFiles.length);
}

// ── Output ────────────────────────────────────────────────────────────────────

function print(errors, warnings, total) {
  const line = '─'.repeat(52);
  console.log('');
  console.log(line);
  console.log('  Slide Validator  ·  Softsolution LineScanner');
  console.log(line);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`\n  ✅  All ${total} slides are healthy\n`);
  } else {
    console.log('');
    errors.forEach(e   => console.log('  ❌  ' + e));
    warnings.forEach(w => console.log('  ⚠️   ' + w));
    console.log('');
  }

  const summary = errors.length > 0
    ? `  ${errors.length} error(s)  ·  ${warnings.length} warning(s)`
    : warnings.length > 0
      ? `  0 errors  ·  ${warnings.length} warning(s)`
      : `  No issues found`;

  console.log(summary);
  console.log(line);
  console.log('');
}

// ── Entry point ───────────────────────────────────────────────────────────────

validate();

if (process.argv.includes('--watch')) {
  console.log('  Watching for changes in slide-library/linescanner/ ...');
  console.log('  Press Ctrl+C to stop.\n');

  let debounce;
  fs.watch(SLIDES_DIR, (_event, filename) => {
    if (filename && filename.endsWith('.html')) {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        console.log(`  → ${filename} changed — re-validating...\n`);
        validate();
      }, 400);
    }
  });
}
