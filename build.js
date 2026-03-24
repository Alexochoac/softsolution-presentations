#!/usr/bin/env node
'use strict';
// ─────────────────────────────────────────────────────────────────────────────
//  Softsolution LineScanner — Presentation Builder
//  Usage:  node build.js <config-name>
//  Example: node build.js grupo-navas
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const configName = process.argv[2];
if (!configName) { console.error('Usage: node build.js <config-name>'); process.exit(1); }

const ROOT      = __dirname;
const LIBRARY   = path.join(ROOT, 'slide-library');
const SLIDE_DIR  = path.join(LIBRARY, 'linescanner');
const PREVIEW    = path.join(LIBRARY, '_preview.html');
const GENERAL_SRC = path.join(SLIDE_DIR, 'General Slide Images', 'GENERAL Softsolution-LiteSentry 25-09v16 Extended');

const cfg = require(path.join(ROOT, 'builds', configName));
const OUT_DIR    = cfg.outputDir;
const ASSETS_DIR = path.join(OUT_DIR, 'assets');

// ── COLOR HELPERS ─────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r, g, b];
}
function adjustHex(hex, factor) {
  let [r,g,b] = hexToRgb(hex);
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  if (factor > 0) { r = clamp(r+(255-r)*factor); g = clamp(g+(255-g)*factor); b = clamp(b+(255-b)*factor); }
  else            { r = clamp(r*(1+factor));       g = clamp(g*(1+factor));       b = clamp(b*(1+factor)); }
  return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}

async function extractColors(logoPath) {
  try {
    const { Vibrant } = require('node-vibrant/node');
    const palette = await Vibrant.from(logoPath).getPalette();
    const sw = palette.Vibrant || palette.DarkVibrant || palette.LightVibrant || palette.Muted;
    if (!sw) throw new Error('No usable swatch');
    const [r,g,b] = sw.rgb.map(Math.round);
    const accent = '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
    return {
      accent,
      accentMid:   adjustHex(accent, -0.15),
      accentLight: adjustHex(accent,  0.35),
      accentRgb:   `${r},${g},${b}`,
    };
  } catch(e) {
    console.warn('  ⚠ Color extraction failed:', e.message, '— using Softsolution defaults');
    return { accent:'#F5A623', accentMid:'#E8890C', accentLight:'#FFD27F', accentRgb:'245,166,35' };
  }
}

// ── SHELL EXTRACTION ──────────────────────────────────────────────────────────
function extractShell(html, colors) {
  // Extract <style> block
  const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  let css = cssMatch ? cssMatch[1] : '';

  // Inject customer colors
  css = css
    .replace(/(--accent:\s*)#[0-9A-Fa-f]{6}/,       `$1${colors.accent}`)
    .replace(/(--accent-mid:\s*)#[0-9A-Fa-f]{6}/,   `$1${colors.accentMid}`)
    .replace(/(--accent-light:\s*)#[0-9A-Fa-f]{6}/, `$1${colors.accentLight}`)
    .replace(/(--accent-rgb:\s*)[\d,]+/,             `$1${colors.accentRgb}`);

  // Strip preview-badge and save-button CSS (editor-only)
  css = css.replace(/\/\* Preview badge \*\/[\s\S]*?#peSaveBtn:hover[\s\S]*?\}/m, '');

  // Extract initPresentation() function
  const initMatch = html.match(/(function initPresentation\(\) \{[\s\S]*?\n  \})\n/);
  let initJs = initMatch ? initMatch[1] : '';
  // Remove SLIDE_FILES reference (not defined in the built output)
  initJs = initJs.replace(/,\s*name:\s*SLIDE_FILES\[current\]/, '');

  // Extract lightbox + popover functions
  const scriptMatch = html.match(/\/\/ ── Lightbox ──([\s\S]*?)\/\/ ── Dynamic Slide Loader/);
  const utilJs = scriptMatch ? scriptMatch[1].trim() : '';

  return { css, initJs, utilJs };
}

// ── SLIDE PROCESSING ──────────────────────────────────────────────────────────
function processSlide(html, cfg) {
  // Replace logo placeholder (both .jpg and any variant)
  html = html.replace(/logo-\[customer\]\.jpg/g, cfg.logoFile);

  // Replace cover page placeholders
  html = html.replace(/\[Customer\]/g,                       cfg.prospectName);
  html = html.replace(/\[Product or Products\]/g,            cfg.products || 'LineScanner');
  html = html.replace(/\[Category or Categories\] Glass/g,   cfg.glassCategory || 'Glass');
  if (cfg.contactName)  html = html.replace(/\[Name\]/g,   cfg.contactName);
  if (cfg.contactTitle) html = html.replace(/\[Title\]/g,  cfg.contactTitle);

  // Replace 'general/' image paths → 'general/' folder in output
  // (general/ images are copied separately — see asset report)
  // src="general/..." stays as-is; we collect them separately below

  // Strip PE init script block (always at the bottom of each slide)
  html = html.replace(
    /<script>\s*\(function\s*\(\)\s*\{\s*var s\s*=\s*document\.currentScript;[\s\S]*?\}\)\(\);\s*<\/script>/g, ''
  );

  // Strip editor-only attributes and elements
  html = html.replace(/\s*data-pe-source-file="[^"]*"/g, '');
  html = html.replace(/\s*data-pe-carousel(="[^"]*")?/g, '');
  html = html.replace(/<button class="why3-add-btn[^"]*"[^>]*>.*?<\/button>/gs, '');

  // Strip contenteditable (editor artifact on gallery captions)
  html = html.replace(/\s*contenteditable="true"\s*spellcheck="false"/g, '');

  return html;
}

// ── ASSET COLLECTION ──────────────────────────────────────────────────────────
function collectAssets(slides) {
  const assets  = new Set();
  const general = new Set();
  // Strip JS line comments before scanning so placeholder examples aren't collected
  const stripComments = html => html.replace(/\/\/[^\n]*/g, '');
  for (const html of slides) {
    const clean = stripComments(html);
    for (const m of clean.matchAll(/['"]assets\/([^'"]+)['"]/g))  assets.add(m[1]);
    for (const m of clean.matchAll(/['"]general\/([^'"]+)['"]/g)) general.add(m[1]);
    for (const m of clean.matchAll(/src="assets\/([^"]+)"/g))     assets.add(m[1]);
    for (const m of clean.matchAll(/src="general\/([^"]+)"/g))    general.add(m[1]);
  }
  return { assets, general };
}

// ── STRING EXTRACTION ─────────────────────────────────────────────────────────
// Extracts visible text from key elements into a JSON file for translation.
// Claude reads strings-en.json, writes strings-XX.json, and the build applies it.
function extractStrings(slides) {
  const result = {};
  const extract = (html, selector) => {
    const re = new RegExp(`class="${selector}"[^>]*>([\\s\\S]*?)<\\/`, 'g');
    const out = [];
    for (const m of html.matchAll(re)) {
      const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
      if (text) out.push(text);
    }
    return out.length === 1 ? out[0] : out.length > 1 ? out : undefined;
  };

  slides.forEach((html, i) => {
    const key = `slide-${String(i+1).padStart(2,'0')}`;
    const s = {};
    const sectionLabel = extract(html, 'section-label');
    const title        = extract(html, 'slide-title');
    const subtitle     = extract(html, 'slide-subtitle');
    const colLabels    = extract(html, 'col-label');
    const colItems     = extract(html, 'col-item');
    const featureTexts = extract(html, 'feature-text');
    if (sectionLabel) s.sectionLabel = sectionLabel;
    if (title)        s.title        = title;
    if (subtitle)     s.subtitle     = subtitle;
    if (colLabels)    s.colLabels    = colLabels;
    if (colItems)     s.colItems     = colItems;
    if (featureTexts) s.featureTexts = featureTexts;
    if (Object.keys(s).length) result[key] = s;
  });
  return result;
}

// ── TRANSLATION APPLICATION ───────────────────────────────────────────────────
// Does exact innerHTML replacement for each translated string.
function applyTranslations(slides, translations) {
  return slides.map((html, i) => {
    const key = `slide-${String(i+1).padStart(2,'0')}`;
    const t = translations[key];
    if (!t) return html;

    const replaceOne = (cls, original, translated) => {
      // Replace the inner text of the first matching element with that exact text
      const re = new RegExp(`(class="${cls}"[^>]*>)${escRe(original)}(<\/)`, 'g');
      return html.replace(re, `$1${translated}$2`);
    };

    if (t.sectionLabel && typeof t.sectionLabel === 'string') {
      const en = extractFirst(html, 'section-label');
      if (en) html = replaceOne('section-label', en, t.sectionLabel);
    }
    // title and subtitle contain nested HTML (.blue span etc) — replace text node only
    // For simplicity we do full innerHTML replacement if no nested tags
    if (t.title && typeof t.title === 'string') {
      html = html.replace(
        /(class="slide-title"[^>]*>)([^<]+)(<span)/,
        (_, pre, _txt, next) => `${pre}${t.title.replace(/<[^>]+>/g,'')} ${next}`
      );
    }

    return html;
  });
}

function extractFirst(html, cls) {
  const m = html.match(new RegExp(`class="${cls}"[^>]*>([\\s\\S]*?)<\\/`));
  return m ? m[1].replace(/<[^>]+>/g,'').trim() : null;
}
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// ── SHARE MODAL ───────────────────────────────────────────────────────────────
function shareModalHtml() {
  return `
<!-- Share Modal -->
<div id="shareOverlay" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);align-items:center;justify-content:center;">
  <div style="background:#111;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:36px;width:min(480px,90vw);position:relative;">
    <button onclick="closeShare()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#aaa;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;font-family:inherit;display:flex;align-items:center;justify-content:center;">×</button>
    <h3 style="font-size:17px;font-weight:700;margin-bottom:20px;color:#fff;">Compartir presentación</h3>
    <div style="margin-bottom:14px;">
      <label style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#aaa;display:block;margin-bottom:6px;">Tu nombre *</label>
      <input id="shareName" type="text" placeholder="ej. Alex García" style="width:100%;padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#fff;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;">
    </div>
    <div style="margin-bottom:22px;">
      <label style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#aaa;display:block;margin-bottom:6px;">Tu cargo *</label>
      <input id="sharePosition" type="text" placeholder="ej. Director Comercial" style="width:100%;padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#fff;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;">
    </div>
    <p id="shareError" style="color:#f87171;font-size:12px;margin-bottom:12px;display:none;">Por favor completa tu nombre y cargo antes de compartir.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      <button onclick="sendWa()"    style="flex:1;min-width:110px;padding:11px 14px;background:rgba(37,211,102,.12);border:1px solid rgba(37,211,102,.3);color:#25d366;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">WhatsApp</button>
      <button onclick="sendEmail()" style="flex:1;min-width:110px;padding:11px 14px;background:rgba(245,166,35,.10);border:1px solid rgba(245,166,35,.28);color:var(--accent);border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Email</button>
      <button onclick="copyLink()" id="copyBtn" style="flex:1;min-width:110px;padding:11px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#fff;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Copiar enlace</button>
    </div>
  </div>
</div>`;
}

function shareModalJs(cfg) {
  return `
  // ── Share Modal ──────────────────────────────────────────────────────────
  var SHARE_BASE = '${cfg.shareUrl}';
  document.getElementById('peShareBtn').onclick = openShare;

  function openShare()  { document.getElementById('shareOverlay').style.display = 'flex'; }
  function closeShare() { document.getElementById('shareOverlay').style.display = 'none'; document.getElementById('shareError').style.display='none'; }

  function validateShare() {
    var name = document.getElementById('shareName').value.trim();
    var pos  = document.getElementById('sharePosition').value.trim();
    if (!name || !pos) { document.getElementById('shareError').style.display='block'; return null; }
    document.getElementById('shareError').style.display='none';
    return { name: name, position: pos };
  }
  function buildUrl(channel) {
    var v = validateShare(); if (!v) return null;
    return SHARE_BASE + '?' + [
      'utm_source=sharepresentationbutton',
      'utm_medium='   + encodeURIComponent(channel),
      'utm_content='  + encodeURIComponent(v.name + ' | ' + v.position),
      'utm_term='     + encodeURIComponent('${cfg.prospectName}'),
      'utm_campaign=' + encodeURIComponent(new Date().toISOString().slice(0,10))
    ].join('&');
  }
  function sendWa() {
    var url = buildUrl('whatsapp'); if (!url) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(url), '_blank');
  }
  function sendEmail() {
    var url = buildUrl('email'); if (!url) return;
    window.location.href = 'mailto:?subject=' + encodeURIComponent('${cfg.prospectName} — LineScanner')
      + '&body=' + encodeURIComponent('Hola,\\n\\nTe comparto la presentación:\\n' + url);
  }
  function copyLink() {
    var url = buildUrl('link'); if (!url) return;
    navigator.clipboard.writeText(url).then(function() {
      var btn = document.getElementById('copyBtn');
      var orig = btn.textContent; btn.textContent = '✓ Copiado';
      setTimeout(function(){ btn.textContent = orig; }, 2000);
    });
  }`;
}

// ── ASSEMBLY ──────────────────────────────────────────────────────────────────
function assembleHtml(css, initJs, utilJs, slides, cfg) {
  const umamiSnippet = cfg.umamiId
    ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${cfg.umamiId}"></script>`
    : `<!--\n  ANALYTICS: set umamiId in config to activate\n  <script defer src="https://cloud.umami.is/script.js" data-website-id="[UUID]"></script>\n-->`;

  return `<!DOCTYPE html>
<html lang="${cfg.lang || 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cfg.prospectName} — LineScanner · GlassQuality.com</title>
${umamiSnippet}
<style>
${css}
</style>
</head>
<body>

<div class="glow-orb a"></div>
<div class="glow-orb b"></div>

<div id="lightbox" onclick="closeLb()">
  <button id="lb-close" onclick="closeLb()">&#x2715;</button>
  <img id="lb-img" src="" alt="">
</div>

<div id="popover" onclick="closePopover()">
  <div id="popover-card" onclick="event.stopPropagation()">
    <button id="popover-close" onclick="closePopover()">&#x2715;</button>
    <img id="popover-img" src="" alt="">
  </div>
</div>

<button class="nav-arrow prev hidden" id="prevBtn">&#8592;</button>
<button class="nav-arrow next" id="nextBtn">&#8594;</button>
<div class="nav-dots" id="navDots"></div>
<div class="slide-counter" id="slideCounter"></div>
<button id="peShareBtn" title="Compartir presentación"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>

<div class="slides-container" id="slidesContainer">
${slides.join('\n\n')}
</div>

${shareModalHtml()}

<script>
  ${utilJs}

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeLb(); closePopover(); closeShare(); }
  });

  ${initJs}

  initPresentation();

  ${shareModalJs(cfg)}
</script>
</body>
</html>`;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔨  Building: ${cfg.prospectName} [${configName}]\n`);

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // 1. Color extraction
  const logoPath = path.join(ASSETS_DIR, cfg.logoFile);
  if (!fs.existsSync(logoPath)) {
    console.error(`  ✗ Logo not found: ${logoPath}`); process.exit(1);
  }
  const colors = await extractColors(logoPath);
  console.log(`🎨  Accent: ${colors.accent}  mid: ${colors.accentMid}  light: ${colors.accentLight}`);

  // 2. Parse _preview.html shell
  const previewHtml = fs.readFileSync(PREVIEW, 'utf8');
  const { css, initJs, utilJs } = extractShell(previewHtml, colors);

  // 3. Read + process slides
  let slideList;
  if (cfg.slides === 'all') {
    slideList = fs.readdirSync(SLIDE_DIR)
      .filter(f => /^slide-\d+.*\.html$/.test(f))
      .sort();
  } else {
    slideList = cfg.slides.map(n => {
      const found = fs.readdirSync(SLIDE_DIR).find(f => f.startsWith(`slide-${String(n).padStart(2,'0')}`));
      return found || null;
    }).filter(Boolean);
  }

  const processedSlides = [];
  for (const file of slideList) {
    const raw = fs.readFileSync(path.join(SLIDE_DIR, file), 'utf8');
    processedSlides.push(processSlide(raw, cfg));
    console.log(`  ✓ ${file}`);
  }

  // 4. Extract strings → strings-en.json
  const strings = extractStrings(processedSlides);
  const stringsEnPath = path.join(OUT_DIR, 'strings-en.json');
  fs.writeFileSync(stringsEnPath, JSON.stringify(strings, null, 2), 'utf8');
  console.log(`\n📝  Strings → strings-en.json`);

  // 5. Apply translations (if strings-XX.json exists)
  let finalSlides = processedSlides;
  if (cfg.lang && cfg.lang !== 'en') {
    const transPath = path.join(OUT_DIR, `strings-${cfg.lang}.json`);
    if (fs.existsSync(transPath)) {
      const trans = JSON.parse(fs.readFileSync(transPath, 'utf8'));
      finalSlides = applyTranslations(processedSlides, trans);
      console.log(`🌍  Translations applied: ${cfg.lang}`);
    } else {
      console.warn(`⚠   No strings-${cfg.lang}.json found — building in English`);
      console.warn(`    Translate strings-en.json → strings-${cfg.lang}.json then rebuild.`);
    }
  }

  // 6. Assemble + write
  const html = assembleHtml(css, initJs, utilJs, finalSlides, cfg);
  const outPath = path.join(OUT_DIR, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`\n✅  Written: ${outPath}`);
  console.log(`    Size:    ${(html.length / 1024).toFixed(1)} KB`);

  // 7. Asset report
  const { assets, general } = collectAssets(finalSlides);
  const IMAGE_SRC = path.join(SLIDE_DIR, 'Slide Images');

  console.log(`\n📦  Assets needed (${assets.size} files in assets/):`);
  for (const a of [...assets].sort()) {
    const inOut = fs.existsSync(path.join(ASSETS_DIR, a));
    const inSrc = fs.existsSync(path.join(IMAGE_SRC, a));
    const tag   = inOut ? '✓' : inSrc ? '⚠ needs copy' : '✗ MISSING';
    console.log(`    ${tag.padEnd(14)} ${a}`);
  }

  if (general.size) {
    console.log(`\n📦  General images needed (${general.size} files in general/):`);
    const GEN_OUT = path.join(OUT_DIR, 'general');
    fs.mkdirSync(GEN_OUT, { recursive: true });
    for (const a of [...general].sort()) {
      const inOut = fs.existsSync(path.join(GEN_OUT, a));
      const inSrc = fs.existsSync(path.join(GENERAL_SRC, a));
      const tag   = inOut ? '✓' : inSrc ? '⚠ needs copy' : '✗ MISSING';
      console.log(`    ${tag.padEnd(14)} ${a}`);
    }
  }

  console.log('\nDone.\n');
}

main().catch(err => { console.error('\n✗ Build failed:', err.message); process.exit(1); });
