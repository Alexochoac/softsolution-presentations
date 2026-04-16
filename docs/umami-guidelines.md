# Umami Analytics Guidelines

## Goals

We use Umami to track two distinct things:

1. **Per-customer analysis** — What are users doing inside each slide of a specific presentation?
2. **Cross-presentation analysis** — Which features and components get used the most across all customer presentations?

---

## Tracking Structure

### Event Name = Slide Name

The event name always identifies the slide where the interaction happened.

```
umami.track('slide-iqc', { component: 'tab', label: 'About Us' })
umami.track('slide-overview', { component: 'carousel', label: 'Position Control' })
umami.track('slide-iqc', { component: 'image', label: 'Camera Detail' })
```

### Properties = What Was Clicked

Properties describe the specific interaction. Use consistent property names across all presentations so cross-customer queries are reusable.

| Property | Description | Example values |
|----------|-------------|----------------|
| `component` | The type of UI element | `tab`, `carousel`, `image`, `toggle`, `button` |
| `label` | The name or title of the specific element | `About Us`, `Position Control`, `Camera Detail` |
| `action` | Optional — the type of action if needed | `open`, `close`, `next`, `prev` |

This allows three levels of analysis:
- *"Which component types are used most?"* → group by `component`
- *"Which specific tab/image/item gets clicked most?"* → group by `label`
- *"What is the user doing inside this slide?"* → filter by event name

---

## Why This Structure

- **Umami dashboard** (per-customer): Each customer presentation is a separate "website" in Umami. Event name = slide means the dashboard shows exactly what users did inside each slide — no extra setup.
- **n8n + direct DB** (cross-customer): By querying the Umami Postgres database directly from n8n, we bypass dashboard limitations. We can group by `component` property across all `website_id`s to find which features get used most across all presentations.

---

## Two Analysis Layers

### Layer 1 — Umami Dashboard (Per-Customer)
- Use this to understand a specific customer's behavior
- See which slides they engage with and what they click
- No extra tooling needed

### Layer 2 — n8n + Umami DB (Cross-Customer)
- Query the `website_event` table directly via Postgres
- Join across all `website_id`s (one per customer presentation)
- Group by property values to find patterns across all presentations
- Use this to find improvements to the presentation structure

---

## Naming Conventions

- Slide event names: `slide-[slide-identifier]` (e.g. `slide-iqc`, `slide-overview`, `slide-linescanner`)
- `component` values: lowercase type only (e.g. `tab`, `carousel`, `image`, `toggle`, `button`)
- `label` values: human-readable name of the element (e.g. `About Us`, `Position Control`) — match the visible text or title in the UI
- `action` values: lowercase verb (e.g. `open`, `close`, `next`, `prev`, `click`)
- Use lowercase and hyphens for event names and component values — no spaces, no camelCase

---

## Risks & Notes

- Umami stores event properties in a JSON column (`event_data`) inside the `website_event` table — queryable in Postgres but requires JSON syntax
- If Umami updates its DB schema, n8n queries may need updating
- Keep component names consistent across all presentations so cross-customer queries work without modification

---

## Status

- Strategy defined: 2026-04-16
- First implementation target: LineScanner presentation (test case)
