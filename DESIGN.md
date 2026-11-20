# Matsya Sathi — Visual Design System
**Status:** Proposed visual baseline from approved 17-screen concept board; refine through implementation reviews.

## Creative direction — Coastal Intelligence
**Character:** Goan coastal, human, calm, trustworthy, maritime-specific. Everyday UI is light and airy with navy headers and rich illustrative moments; emergency screens shift to high-contrast dark navy/red. Avoid generic AI/SaaS dashboards, indiscriminate gradients, and decorative clutter.

## Design tokens (initial)
```css
:root {
  --ocean-950: #071C30;
  --ocean-900: #0B2545;
  --ocean-700: #1863A6;
  --sea-glass: #158498;
  --sky-100: #BDE9FF;
  --sand-100: #EFE6D8;
  --gold-500: #E3A857;
  --surface: #F4F8FC;
  --paper: #FFFFFF;
  --text: #0B2545;
  --muted: #4B6178;
  --success: #0E766E;
  --danger: #D90429;
  --radius-card: 18px;
  --radius-control: 12px;
  --content-max: 1280px;
}
```
These are proposed values, not a pixel-perfect extraction from the generated concept image. Verify text/background contrast before finalizing.

## Typography
- Headings: **Outfit** (or Sora if selected after first-screen review).
- Body: **Manrope**, with **Noto Sans Devanagari** fallback for Konkani scripts.
- Use fluid sizes via `clamp()`, readable body copy (typically 16px), line-height 1.45–1.65, and limited type hierarchy.

## Imagery
- Distinctive Goan coast: fishing boats, jetty, sunrise, sea horizon, palms, and weathered maritime details.
- Use consistent illustration treatment, color grading, horizon placement, and negative space.
- Prefer local optimized WebP/AVIF assets with meaningful alt text; no hotlinked temporary AI-hosted image URLs in final build.
- Keep artwork behind readable content; use overlays only when necessary.

## Layout by device
- **320–767px:** full-width app, single-column content, bottom nav on main views; safe-area padding.
- **768–1023px:** two-column cards where useful, balanced gutters; navigation adapted to available space.
- **1024px+:** sidebar/top navigation and multi-column dashboard; max-width content container. Do not show a decorative phone frame in the actual product.
- Use CSS Grid/Flexbox, `minmax(0, 1fr)`, `min-width:0`, responsive image sizing, and fluid gaps. Never solve overflow by hiding meaningful content.

## Components
`AppShell`, `BrandHeader`, `BottomNav`, `DesktopSidebar`, `PrimaryButton`, `StatusBadge`, `InfoCard`, `TripTimeline`, `SchemeCard`, `EmptyState`, `DemoLabel`, `SOSHoldButton`, `AccessibleToggle`, `LanguageSwitcher`.

## Screen-by-screen visual direction
| Screen group | Treatment |
|---|---|
| Splash / language | Full-bleed coastal art, readable navy typography or overlay, simple strong CTA |
| Role / accessibility / profile | Airy sky and sea backdrop, crisp white cards, generous spacing |
| Fisherman dashboard | Rich harbor header, clear current status, prominent trip action, uncluttered cards |
| Family dashboard | Reassuring lighter surface, person/boat identity, latest update prominent |
| Trip | Ocean-toned route visualization labeled simulated, timestamp and status controls |
| Weather | Compact condition cards, legible values, explicit demo/source labeling |
| Welfare | Searchable calm list, restrained colored chips, easy scheme-detail reading |
| SOS | Dedicated high-contrast red/navy state, oversized hold control, cancellation clarity |
| Notifications / profile | Quiet white/sky surfaces and consistent navigation |

## Interaction and motion
- Transitions 120–240ms where helpful; no continuous decorative motion in normal screens.
- Honor `prefers-reduced-motion`.
- SOS feedback must not depend on animation alone; text and state must remain clear.

## Anti-slop quality gate
- No repeated identical card blocks where hierarchy calls for different treatment.
- No emojis as UI icons; use a coherent icon family.
- No tiny labels, fake metrics, fake live indicators, or impossible precision.
- No overused glows, gradients, floating glass cards, or inconsistent corner radii.
- Keep content concise, real-world appropriate, and culturally respectful.
- Visually review every screen at mobile/tablet/desktop sizes before approval.

## References
- User-approved generated 17-screen concept board (visual reference only; not code).
- Uploaded coastal, oceanic, and tactical HTML references. Reuse selected visual ideas, not conflicting design systems wholesale.
