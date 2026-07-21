# components/AGENTS.md

This folder holds all React components for the JobPilot app. It is split into two areas.

## Areas

- `layout/` — Shared layout components: Navbar and Footer. Used on every page via the root layout or page composition.
- `homepage/` — Homepage only components: Hero, DashboardPreview, HowItWorks, Features, Testimonial, CTASection.

## Conventions

- All components are Server Components by default. Add `"use client"` only when a component requires state, event handlers, browser APIs, or lifecycle effects.
- Named exports only. No default exports.
- One component per file. No barrel exports from these folders.
- Files use PascalCase names: `Hero.tsx`, `Navbar.tsx`.
- No data fetching inside components. No direct DB calls.
- All styling uses Tailwind utility classes with CSS variable tokens from `app/globals.css`. Never hardcode hex values. Never use raw Tailwind color classes like `bg-purple-500`.
- Inline `style` props are allowed only for values that cannot be expressed as a Tailwind class (gradients, pixel values not on the spacing scale). Use CSS vars (`var(--color-*)`) inside inline styles, not raw hex.
- Images use `next/image` with explicit `width` and `height` for all local images from `public/`.

## File map

```
components/
  layout/
    Navbar.tsx   — top nav bar: logo, three nav links, Start for free CTA
    Footer.tsx   — footer: logo, Dashboard / Privacy / Terms links
  homepage/
    Hero.tsx              — headline, subheadline, two CTA buttons
    DashboardPreview.tsx  — browser chrome frame wrapping dashboard-demo.png
    HowItWorks.tsx        — two column: feature bullets left, jobs-lists.png right
    Features.tsx          — two column: agnet-log.png left, feature bullets right
    Testimonial.tsx       — pull quote, user avatar, attribution
    CTASection.tsx        — bottom CTA mirroring the hero
```

## Component patterns (see also context/ui-registry.md)

The exact Tailwind class patterns for every component above are recorded in `context/ui-registry.md`. Read that file before building any new component to match existing patterns.

_Drafted by /sync from the introducing change, worth a quick human pass._
