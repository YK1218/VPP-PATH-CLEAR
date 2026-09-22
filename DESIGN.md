---
name: Serene Mobility
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006948'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855d'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: '0'
  headline-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: '0'
  headline-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: '0'
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: 0.01em
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.015em
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: 0.02em
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 0.9375rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 0.8125rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a calm, dignified, and exceptionally clear navigation experience tailored for wheelchair users, power scooter operators, and travelers with motor or mobility constraints. The interface prioritizes psychological comfort, immediate legibility, and zero ambiguity.

### Aesthetic Principles
- **Clarity over Cleverness:** High-contrast elements, zero visual clutter, and instant spatial orientation to eliminate transit anxiety.
- **Warm Reassurance:** A soft, natural off-white foundational canvas replacing stark clinical whites with a warm, grounded environment.
- **Physical Tactility & Safety:** Large interactive surfaces (minimum 48–56px hit bounds), unmistakable physical feedback, and explicit iconography for physical barrier states (curb ramps, incline degrees, elevator outages).
- **Style Blend:** Modern functional minimalism balanced with accessible tactile interaction: crisp architectural structure, soft boundary definitions, and high-visibility status indicators.

## Colors

The palette achieves strict WCAG AAA contrast ratios across text, action points, and safety-critical state indicators.

### Palette Architecture
- **Base Canvas:** `#FBFBFA` (Canvas Main) and `#F5F4F0` (Surface Muted) provide a glare-free, organic backdrop.
- **Card & Elevated Surfaces:** `#FFFFFF` offers clear elevation against the warm background.
- **Primary Ink & Navigation:** `#0F172A` (Navy 900) for all critical text and navigation anchors; `#1E293B` (Navy 800) for sub-headers and secondary data points.
- **Action & Focus:** `#0D9488` (Accessible Teal) provides distinct, high-contrast wayfinding and interaction cues, with `#0F766E` used for active focus and pressed states.
- **Safe & Verified Status:** `#059669` text on `#ECFDF5` surface with `#A7F3D0` boundary for step-free and certified accessible routes.
- **Cautionary Warning:** `#B45309` text on `#FEF3C7` surface with `#FCD34D` boundary for steep slopes, rough paving, or narrow walkways.
- **Barrier & Blocked Status:** `#B91C1C` text on `#FEE2E2` surface with `#FCA5A5` boundary for impassable steps, non-functioning lifts, and detours.
- **Structural Outlines:** `#E2E8F0` provides crisp, non-distracting visual boundaries.

## Typography

Atkinson Hyperlegible Next is utilized across all typographical tiers. Specifically developed to maximize character differentiation, it disambiguates easily confused glyphs (such as 'I', 'l', '1', and '0' versus 'O'), directly supporting users navigating outdoors in variable sunlight or users with low vision.

### Typographic Hierarchy Rules
- Never use font sizes below `0.8125rem` (13px), ensuring micro-labels remain readable at arm's length when mounted on a wheelchair control rig.
- Keep body line length between 45 and 65 characters to support fluid tracking.
- Apply high-weight labels (`600` or `700`) for all live navigation stats (e.g., incline percentage, sidewalk surface, curb cut distance).

## Layout & Spacing

The layout model is built on an accessible responsive fluid grid with strict minimum touch barriers:
- **Mobile (< 768px):** 4-column fluid layout with `1rem` margins and `1rem` gutters. Map and primary direction sheets stack vertically, prioritizing continuous thumb and single-hand accessibility.
- **Tablet (768px – 1024px):** 8-column layout with `1.5rem` margins. Split-screen layout anchors route details alongside active satellite/vector mapping.
- **Desktop (1024px+):** 12-column layout with `2.5rem` margins and max container width of `1280px`. Left rail anchors navigation controls and telemetry; right viewports manage map geometry.

### Touch Target Guarantees
All touch and pointer targets must measure at least `48px` by `48px` (ideally `52px` to `56px`), with an enforced `8px` (`space-sm`) safety clearance between interactive boundaries to prevent accidental activation from tremors or bumpy terrain.

## Elevation & Depth

This design system avoids heavy, disorienting 3D drops or busy skeuomorphic textures, relying instead on tonal layering, delicate containment lines, and subtle ambient shadows.

### Surface Tiers
- **Tier 0 (Canvas Base):** `#FBFBFA` flat background for map backdrops and root screens.
- **Tier 1 (Surface Standard):** `#FFFFFF` cards with a `1px` border of `#E2E8F0` and an ambient shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 6px rgba(15, 23, 42, 0.02)`.
- **Tier 2 (Floating Modals & Sheets):** `#FFFFFF` persistent navigation sheets and turn-by-turn cards with a `1px` border of `#E2E8F0` and an ambient shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)`.
- **Tier 3 (Urgent Alerts & Overlays):** `#FFFFFF` high-priority obstacle alerts with an ambient shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 10px 10px -5px rgba(15, 23, 42, 0.03)`.

Focus states feature an explicit outer ring: `0 0 0 3px rgba(13, 148, 136, 0.35)` with a `1px` inner offset.

## Shapes

A moderate `12px` to `16px` corner radius (`roundedness: 2`) softens the interface without reducing functional click/tap target area:
- **Small components (Chips, Badges, Micro-toggles):** `8px` (`0.5rem`).
- **Standard components (Buttons, Inputs, Metric tiles):** `12px` (`0.75rem`).
- **Containers (Cards, Navigation sheets, Dialogs):** `16px` (`1rem`).
- **Floating Controls (Map recenter, SOS quick actions):** Fully circular (`9999px`) to distinguish spatial map tools from static content cards.

## Components

### Buttons
- **Primary Action:** Solid `#0D9488` surface, `#FFFFFF` text, `52px` height, `12px` radius. Hover: `#0F766E`. Focus: explicit 3px teal glow.
- **Secondary Action:** `#FFFFFF` surface, `#0F172A` text, `1.5px` border in `#E2E8F0`. Hover: `#F5F4F0`.
- **Hazard / Detour Action:** `#EF4444` background with `#FFFFFF` text, applied only for barrier reporting or emergency rerouting.

### Route State Chips & Pills
- **Step-Free / Verified:** `#ECFDF5` background, `#047857` label, `#A7F3D0` outline. Includes checkmark icon.
- **Caution (Incline/Surface):** `#FEF3C7` background, `#B45309` label, `#FCD34D` outline. Displays grade percentage (e.g., "7.2% Slope").
- **Impassable / Blocked:** `#FEE2E2` background, `#B91C1C` label, `#FCA5A5` outline. Displays obstacle icon.

### Form Inputs & Search
- Container height minimum `52px` with a `1.5px` solid outline in `#CBD5E1`.
- Background `#FFFFFF` with `#0F172A` value text.
- Integrated voice input action and clear-text button with minimum `48px` hit areas.
- Placeholder text in `#64748B` maintaining 4.5:1 contrast against `#FFFFFF`.

### Cards & Route Summaries
- Pure `#FFFFFF` background with `16px` corner radius and `1px` border in `#E2E8F0`.
- Internal padding: `1.5rem` (`space-lg`).
- Segmented metrics strip dividing route length, estimated transit time, maximum slope percentage, and curb ramp frequency.

### Checkboxes & Segmented Toggles
- Checkbox dimensions: `24px` by `24px` housed within a `48px` tap target box.
- Checked state: `#0D9488` fill with a `2.5px` white checkmark.
- Route filter toggles (e.g., "Avoid Hills", "Power Recharging", "Covered Paths"): Segmented buttons with full-width states and active teal highlights.