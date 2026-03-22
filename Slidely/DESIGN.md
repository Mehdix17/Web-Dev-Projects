# Slidely Design System And Implementation Guardrails

This document is the source of truth for visual and interaction decisions.

All agents and contributors must read this file before implementing or modifying UI.

## 1. Design Intent

Slidely should feel:

- Strategic and premium
- Clean and editorial
- Motion-aware but never noisy
- Confident in hierarchy and spacing

The brand tone is creative professionalism, not generic startup UI.

## 2. Core Visual Tokens

Defined in `src/app/globals.css` via CSS variables.

### Light mode

- `--background`: `#ffffff`
- `--foreground`: `#2a0659`
- `--primary`: `#b353ff`
- `--primary-foreground`: `#2a0659`

### Dark mode

- `--background`: `#140725`
- `--foreground`: `#f4eaff`
- `--primary`: `#bd6bff`
- `--primary-foreground`: `#2a0659`

### Practical color usage

- Primary action surfaces: `#2A0659` base, `#B353FF` interaction accent
- Surface borders: soft lilac and lavender (`#EAD2FF`, `#D9B1FF`, `#E3D7EE`)
- Body copy: reduced-opacity foreground (`/70` or `/75`) for readability rhythm

## 3. Typography Rules

Global font family comes from `--font-geist-sans` in `src/app/layout.tsx`.

Hierarchy style:

- Headlines: bold/black with tight tracking (`tracking-tight`)
- Section labels: uppercase micro-labels with wide letter spacing (`tracking-[0.14em+]`)
- Body: compact but readable (`text-sm` to `text-base`, relaxed line height)

Do:

- Keep typographic contrast explicit between heading, label, and body.
- Use consistent title casing for visible headings.

Do not:

- Introduce a second headline font family.
- Use default browser typography without utility classes.

## 4. Spacing And Layout Rhythm

Preferred containers:

- Main content width: `max-w-6xl` or `max-w-5xl`
- Horizontal padding: `px-4`
- Vertical rhythm: major sections usually `py-10` to `py-16`

Card language:

- Rounded corners are part of brand feel (`rounded-2xl`, `rounded-3xl`)
- Borders are visible and soft (no heavy black borders)
- Shadows are subtle, often violet-tinted

## 5. Motion Language

Motion must communicate hierarchy and responsiveness, not decoration overload.

Current motion patterns include:

- Hero ambient effects: aurora/stars (`aurora-shift`, `starfall-dot`, `starfall-streak`)
- Header shell sheen/floating (`nav-shell`, `nav-sheen`, `nav-float`)
- Card micro-lift on hover (`hover:-translate-y-1`)

Rules:

- Keep transitions short and smooth (200-500ms typical)
- Favor transform/opacity changes over layout-shifting animations
- Preserve reduced visual stress in dense content sections

## 6. Cursor Behavior

Custom cursor is implemented using Kursor in `src/components/ui/AppCursor.tsx`.

Required behavior:

- Type 1 Kursor mode
- Accent color from `--primary`
- Enlarged hover state for interactive targets
- Auto-tagging of interactive elements with `.k-hover`

Kursor style overrides are defined in `src/app/globals.css` and are part of visual identity.

Do not switch cursor libraries without explicit request.

## 7. Navigation And Header Patterns

Header is a floating, pill-based top navigation in `src/components/layout/Header.tsx`.

Design characteristics:

- Logo chip on left
- Soft translucent nav shell on desktop
- Active route has visible filled chip state
- Mobile menu uses full-screen overlay style

Accessibility requirements:

- Visible focus ring for interactive elements
- Escape closes mobile menu
- Keyboard focus trap in mobile menu
- Scroll lock when mobile menu is open

## 8. Section-Level Design Notes

### Hero

File: `src/components/sections/HeroSection.tsx`

- Big, high-contrast headline with two-line lockup
- Ambient glow + falling star visual system
- Primary CTA and trust signal cluster beneath

### Services

File: `src/components/sections/ServicesSection.tsx`

- Strong top label + headline + short support copy
- Service cards use numbered micro-labels and strong title hierarchy
- Gradient top edge accent is intentional

### Featured Projects

File: `src/components/sections/FeaturedProjectsSection.tsx`

- Masonry-like responsive grid emphasis
- Project card interaction via hover lift and border accent

### Footer

File: `src/components/layout/Footer.tsx`

- Deep purple background with light lilac text system
- Four-column information architecture on desktop

## 9. Gallery And Presentation UX

Gallery listing file: `src/app/gallery/page.tsx`

Rules:

- Filter chips remain rounded-pill style
- Search is prominent and always visible
- Empty/loading states are friendly and informative

Presentation detail viewer file: `src/components/work/PresentationViewer.tsx`

Rules:

- 16:9 slide frame feel must be preserved
- PDF-first rendering with fallback image slides
- Prev/Next and thumbnail navigation must remain clear and keyboard reachable

## 10. Interaction And Accessibility Baseline

Required:

- Focus-visible states on links/buttons/inputs
- High contrast between text and surfaces
- Clear disabled states
- Meaningful aria labels for icon-only controls

Avoid:

- Removing visible focus styles
- Using color-only indicators without additional cues
- Hover-only critical interactions

## 11. Implementation Do And Do Not

### Do

- Reuse existing UI primitives (`Button`, `Card`) when possible
- Preserve established color palette and rounded geometry
- Keep border + shadow style language consistent
- Match nearby components instead of introducing unrelated visual patterns

### Do not

- Introduce new design system conventions ad hoc
- Replace the purple identity with unrelated palettes
- Add large animations in dense content regions
- Shift key spacing scales without updating related sections

## 12. Change Protocol For Agents

Before any UI change:

1. Read this file fully.
2. Inspect neighboring components in the same section/page.
3. Follow existing utility and spacing patterns first.

After UI change:

1. Verify mobile + desktop rendering.
2. Verify focus and keyboard behavior for new interactives.
3. Ensure no visual regression in established brand language.

If a request conflicts with this guide, follow the explicit user request and update this file accordingly in the same PR/change set.
