# Ynmo Tifli — Landing Page

Production MVP of the Ynmo Tifli landing page. Arabic-first, RTL-native, Angular
standalone + SSR. Built per `YNMO-TIFLI-LANDING-BUILD-PLAN.md` — that file is the
authoritative spec; this README is just the practical "how do I run/extend this" guide.

Node.js ≥ 22.22.3 (or ≥ 24.15 / ≥ 26) is required for the Angular 22 CLI. If your
global `node` is older, point `PATH` at a newer install for these commands, e.g.
`export PATH="/opt/homebrew/opt/node/bin:$PATH"` on an Apple Silicon Homebrew setup.

## Commands

```bash
npm install

ng serve              # dev server, http://localhost:4300 (or 4200 default)
ng build              # production build + prerender → dist/ynmo-tifli-landing
```

The build prerenders the single route (SSR + static prerender) per the plan's §1
rendering strategy. There is no separate "prerender" command — `ng build` does both.

## Where things live

- **Tokens**: `src/styles/_tokens.scss` — the only file allowed to declare colour
  values. Every component resolves colour through a `var(--token-name)`. If you need
  a new value, add it here with a semantic name and a comment noting it has no
  Ynmotomic equivalent yet (see the `§13 B-7` backfill list below).
- **Copy**: `src/app/content/ar.ts` (everything except S03) and
  `src/app/content/features.data.ts` (S03's 9 scenes). No Arabic string literals
  live in any `.html` template — even aria-labels and alt text are bound from these
  files.
- **Sections**: `src/app/sections/<name>/` — one standalone, `OnPush` component per
  plan §7 section (S00–S12).
- **S03 core logic**: `src/app/core/scroll-driver.ts` — the framework-free scroll
  driver (§8.6 of the plan). It's plain TypeScript with no Angular imports, so it's
  unit-testable on its own.

## Adding a real feature scene (S03, once B-1 unblocks)

Scenes 2–9 currently reuse scene 1's artwork and the plan's proposed titles. To swap
in real content for scene *N*, edit its row in `src/app/content/features.data.ts`:

```ts
{
  index: N,
  titleAr: '…',                                   // update if the proposed title changes
  appIcon: '/assets/icons/feature-scroll/app-icon-N.svg',
  chipIconOff: '/assets/icons/feature-scroll/chip-icon-N-off.svg',
  chipIconOn: '/assets/icons/feature-scroll/chip-icon-N-on.svg',
  scene: '/assets/img/features/scene-0N.png',
  sceneWebp: '/assets/img/features/scene-0N.webp',
  sceneAlt: '…',
}
```

Export the new assets from Figma once the real design lands — the scene PNG must be
**transparent background, 2x** (see the chroma-key note below if you're re-exporting
via `get_screenshot`, which bakes in an opaque page background). No component code
needs to change; the driver and template are already generic over all 9 rows.

## Known placeholders / blockers (plan §13)

| ID | Status |
|---|---|
| B-1 | Feature titles 2–9 + scene artwork — using proposed titles + scene 1 art everywhere. Rail icon glyphs for scenes 2–9 *are* real (cropped from Figma's rendered chips) but only in muted/outline form — no distinct active-state colour variant exists yet. |
| B-2 | No tablet/mobile Figma frame — every responsive rule below 1024px is a judgement call per plan §9, not a design. |
| B-3 | Blogs (S08) ships 6 static posts (plan's own mock repeats one placeholder title across all cards) — no CMS wiring. |
| B-4 | Every CTA href is `#` — no real destinations provided yet. |
| B-5 | No analytics wired (GA4/GTM undecided). |
| B-6 | WhatsApp FAB (S12) is built and gated behind `WHATSAPP_FAB_ENABLED = false` in `content/ar.ts` — flip it to `true` once a real number exists. |
| B-7 | Tokens added with no Ynmotomic equivalent yet (all in `_tokens.scss`, each commented): `--shadow-cta-brand`, `--shadow-header-float`, `--fs-22/28/60/64`, `--border-decorative-strong`, `--brand-secondary-700`, `--partner-tawakkalna-green`, `--brand-whatsapp-green`, `--surface-translucent-white`, `--shadow-tint-neutral`, `--shadow-cta-soft`, `--shadow-pagination`, `--shadow-cta-blue`, `--shadow-whatsapp`, `--shadow-ground-strong` / `--shadow-ground-transparent`, `--radius-hero`, `--state-success-50`, `--state-rating-gold`, `--icon-disabled`. Flag these for Ynmotomic backfill. |

## Content deviations from the plan's §7 prose (Figma trusted instead)

A few sections' live Figma nodes didn't match the plan's written description. Per
the plan's own rule ("Figma wins on visual values"), and confirmed with Saad for
the header specifically, the live node was trusted over the prose in each case:

- **S00 header**: no "تسجيل دخول" link or "العربية" text pill exist in the node —
  it has 5 nav tabs (المناهج / تواصل معنا / مدونة ينمو / منتجاتنا / من نحن), a
  `احجز الآن` CTA, and a flag+chevron language control instead.
- **S04 specialists**: the 4 practitioner cards have no per-card booking button.

## A pattern worth knowing before touching RTL layout

Throughout this build, matching Figma's screenshot under `dir="rtl"` came down to
one of two moves, and picking the wrong one silently breaks the layout:

1. **Fixed compositions** (a logo's corner, a CTA's position) — DOM order is the
   *mirror* of Figma's left-to-right visual order, so `flex-direction: row` (never
   `row-reverse`) reproduces the screenshot exactly.
2. **Flat, order-arbitrary lists** (a tile grid, a card rail) — keep natural
   reading order in the DOM and let `dir=rtl` mirror it; don't fight it.

Two traps that bit this build and are worth checking if something looks
mirrored wrong:

- `justify-content: flex-end` resolves to the **left** under `dir="rtl"` (verified
  empirically — it is *not* the intuitive "packs right" default). Use `flex-start`
  to pack content to the right.
- `justify-content: flex-end`/`flex-start` only affects `flex-direction: row`
  containers — `column` containers' main axis is vertical and unaffected by `dir`.
- A row with `justify-content` set on a *content-sized* flex item (rather than one
  stretched to a wider parent) makes the property a no-op — don't assume a
  correct-looking screenshot proves the value is right; check the CSS too.

## Testing

No Playwright suite is checked in yet (plan §1 calls for Playwright smoke + visual
snapshots at 1440/1024/390 — not set up in this pass). Verification so far has been
manual: `ng build` after every section, plus ad-hoc Playwright screenshots (not
committed) compared against each Figma node's `get_screenshot` output.
