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

### Profile

**CompletionIndicator** — `components/profile/CompletionIndicator.tsx`
```
<div class="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
  Exclamation warning icon in bg-error/10 wrapper
  Pill tags (red text, bg-error/10) for PHONE, LOCATION, EDUCATION
  Circular progress SVG with radius 36, text center percentage
```

**ResumeUpload** — `components/profile/ResumeUpload.tsx`
```
<div class="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
  Dotted dropzone border-2 border-dashed border-border-muted
  Cloud upload icon text-accent, "Select Resume" secondary button
  Action bar at the bottom with "Generate Resume from Profile" accent button
```

**DatePicker** — `components/ui/DatePicker.tsx`
```
<div class="relative w-full">
  Trigger Button: formatted selected date or placeholder, calendar icon
  Calendar Popover: DayPicker from react-day-picker, styled with accent purple hover and selection highlights
</div>
```

**ProfileForm** — `components/profile/ProfileForm.tsx`
```
<form class="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-8">
  Personal Info: Grid-cols-1 md:grid-cols-2, standard inputs, editable email, select work auth
  Professional Info: Select level, skills and industries text input with "Add" button and purple tag pills (bg-accent-light, text-accent, border-accent/20)
  Work Experience: List of roles, custom DatePicker popovers for start and end dates, checkbox current, key responsibilities textarea
  Education: List of education blocks with add and remove controls, degree select, field, institution, and integer graduation year input
  Job Preferences: seeking title, remote preference, salary, preferred locations
   Save Profile button: bg-accent full-width button
```

### Find Jobs

**SearchControls** — `components/find-jobs/SearchControls.tsx`
```
<form class="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
  Grid 2-col: Job Title label + input with Search icon, Location label + input with MapPin icon
  Input: w-full bg-surface border border-border rounded-lg text-sm placeholder:text-text-muted
  Find Jobs button: bg-accent text-accent-foreground px-5 py-2 rounded-lg, Search icon
  Success message: bg-success-lightest border border-success/20 text-success-foreground rounded-lg
```

**JobFilters** — `components/find-jobs/JobFilters.tsx`
```
<div class="flex flex-col sm:flex-row gap-3">
  Search input: filter by company or role, flex-1 relative with Search icon
  Select dropdowns: bg-surface border border-border rounded-lg, appearance-none, ChevronDown icon
  Options: All Matches / High Match / Low Match, Match Score / Newest / Oldest
```

**JobsTable** — `components/find-jobs/JobsTable.tsx`
```
<div class="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
  Table: COMPANY, ROLE, MATCH SCORE (progress bar + %), SALARY EST., SOURCE badge, DATE FOUND
  Match score bar: 64px h-1 bg-border-light, fill bg-success/info/warning by score range
  Row hover: hover:bg-surface-secondary
  Source badges: Search (bg-accent-light), LinkedIn (bg-linkedin-light), URL (bg-surface-secondary)
  "Jobs by Adzuna" credit at bottom
```

**JobsPagination** — `components/find-jobs/JobsPagination.tsx`
```
<div class="flex items-center justify-between pt-4">
  Results text: "Showing X to Y of Z results"
  Previous/Next buttons: text-text-secondary, disabled state
  Page numbers: accent bg for active, surface-secondary hover for inactive
```


