# Duplicate Presentation — New Customer

Guides the user through creating a new customer presentation by duplicating one presentation in `docs/`.

---

## Step-by-step Process

Go **one step at a time**. Wait for the answer before moving to the next.

---

### Step 1 — Customer Info

Ask:
1. **What is the customer's company name?** (e.g. Vidreira Algarvia)
2. **What folder name should we use?** (e.g. `vidreira-algarvia-portugal` — lowercase, hyphens, include country)
3. **Who is the contact person?** (name and title — e.g. Rogerio Moreira, General Manager)
4. **Do you have a logo?** (ask them to attach or confirm it's ready to save)

---

### Step 2 — Language

Ask:
> "What language should the presentation be in?"
> - **Same as source** — no translation needed
> - **Different language** — translation will be needed after setup

---

### Step 3 — Confirm & Execute

Summarise back:
- Customer: ...
- Folder: `docs/[folder-name]/`
- Contact: ...
- Language: ...

Say: "Ready — confirm and I'll set it up."

Wait for approval, then follow the steps below.

---

## Execution Steps

### Agent 1 — Setup + Branding (foreground)

Launch a **foreground general-purpose agent** to handle steps 1–4. Wait for it to complete before continuing.

The agent should:

**1. Copy the folder**
```bash
cp -r docs/[source-folder] docs/[folder-name]
```

**2. Confirm logo is saved**
Tell the user to save the logo to:
```
docs/[folder-name]/assets/LOGO [Customer Name].png
```
Wait for the user to confirm before continuing.

**3. Update branding in `index.html`**

First read the source `index.html` to find the exact logo filename, alt text, company name, and BASE_URL. Then run:

```bash
# Replace logo filename in HTML src= attributes
sed -i 's|assets/[source-logo-file]|assets/LOGO [Customer Name].png|g' docs/[folder-name]/index.html

# Replace alt text
sed -i 's|alt="[Source Company]"|alt="[Customer Name]"|g' docs/[folder-name]/index.html

# Replace company name in visible text
sed -i 's|[Source Company Full Name]|[Customer Name]|g; s|[Source Company]|[Customer Name]|g' docs/[folder-name]/index.html

# Update BASE_URL
sed -i 's|[source-folder-name]/|[folder-name]/|g' docs/[folder-name]/index.html
```

**4. Update contact name on cover slide**
```bash
sed -i 's|[Source Contact Name, Source Title]|[Contact Name], [Contact Title]|g' docs/[folder-name]/index.html
```

---

### Agent 2 — Translation (background, only if language ≠ source)

Once Agent 1 is complete, launch a **background general-purpose agent** to translate all visible text to the target language.

Agent instructions:
- Read the file in chunks of 200 lines at a time
- Translate ONLY visible user-facing text (headings, paragraphs, buttons, labels, list items, table cells, JS strings)
- Do NOT translate: CSS class names, JS variable/function names, HTML attributes, URLs, file paths, code comments
- Do NOT translate proper nouns: LineScanner, LiteSentry, Softsolution, SoftSolution, Osprey, Avalon, StrainOptics, Benteler
- Use Edit tool to apply changes as you go

Notify the user that translation is running in the background and they will be notified when done.

---

### Final Step — Commit and push

After Agent 1 completes (and Agent 2 if translation was needed):

```bash
git add docs/[folder-name]/
git commit -m "feat: add [Customer Name] presentation"
git push
```

---

## Notes
- Image paths are already correct — `starglass-spain` points to `../shared/assets/` so the copy inherits this automatically
- The old logo file (`logo-company.jpg`) will remain in the assets folder — it is unused and can be deleted
- The presentation URL will be: `https://alexochoac.github.io/softsolution-presentations/[folder-name]/`
