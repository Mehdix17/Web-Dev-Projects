# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

_Empty. Components will be added here as they are built._

## Components

### Layout

**Navbar** — `components/layout/Navbar.tsx`
```
<header class="w-full bg-surface border-b border-border h-16">
  Logo: gradient bg-accent div, w-9 h-9 rounded-[10px]
  Logo text: font-bold text-text-darkest text-[19px]
  Nav links: text-text-dark font-medium text-sm hover:text-accent
  CTA button: bg-text-primary text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg
```

**Footer** — `components/layout/Footer.tsx`
```
<footer class="w-full bg-surface border-t border-border">
  Same logo pattern as Navbar
  Links: text-text-secondary text-sm hover:text-text-primary
```

### Homepage

**Hero** — `components/homepage/Hero.tsx`
```
<section> with gradient background (inline style — linear-gradient to bg-background)
  h1: font-bold text-text-primary text-[48px]
  subline: text-text-secondary text-base
  Primary CTA: bg-text-primary text-accent-foreground px-5 py-2.5 rounded-lg
  Secondary CTA: bg-surface border border-border text-text-primary px-5 py-2.5 rounded-lg
```

**DashboardPreview** — `components/homepage/DashboardPreview.tsx`
```
Outer wrapper: max-w-[900px] rounded-2xl border border-border
Browser bar: bg-surface-secondary border-b border-border
Traffic lights: bg-error / bg-warning / bg-success, w-3 h-3 rounded-full
URL pill: bg-surface border border-border rounded text-text-muted font-mono text-xs
Image: next/image, fill parent, object-cover object-top
```

**HowItWorks** — `components/homepage/HowItWorks.tsx`
```
<section class="w-full bg-background py-20 px-6">
  h2: font-bold text-text-primary text-[36px]
  Feature bullets: left accent bar w-1 bg-accent, title font-semibold text-sm, desc text-text-secondary text-sm
  Screenshot: max-w-[460px] rounded-2xl border border-border
```

**Features** — `components/homepage/Features.tsx`
```
<section class="w-full bg-surface-tertiary py-20 px-6">
  h2: font-bold text-text-primary text-[36px]
  Feature bullets: title font-semibold text-text-primary text-sm, desc text-text-secondary text-sm
  Screenshot: max-w-[480px] rounded-2xl border border-border
```

**Testimonial** — `components/homepage/Testimonial.tsx`
```
<section class="w-full bg-background py-20 px-6">
  Label: text-xs font-semibold tracking-widest uppercase text-success-darker
  Quote: font-bold text-text-primary text-[28px]
  Author: text-sm font-medium text-text-primary / text-xs text-text-muted
```

**CTASection** — `components/homepage/CTASection.tsx`
```
<section> with gradient background (matches Hero)
  h2: font-bold text-text-primary text-[36px]
  Buttons: same pattern as Hero CTAs
```

