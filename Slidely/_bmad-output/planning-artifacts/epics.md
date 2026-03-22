---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "prd-slidely.md"
  - "architecture.md"
  - "ux-design-specification.md"
---

# Slidely - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Slidely, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Homepage:**

- FR-HOM-001: Display hero with tagline and CTAs (H1 visible above fold, 2 CTAs functional)
- FR-HOM-002: Show 3-4 featured projects (cards with thumbnails, link to case studies)
- FR-HOM-003: Display services overview (3 service cards with icons and descriptions)
- FR-HOM-004: Show client logos (5-8 logos in horizontal strip, grayscale→color hover)
- FR-HOM-005: Display testimonial (quote card with author attribution)
- FR-HOM-006: Final CTA section (full-width section with button linking to contact)

**Portfolio Grid:**

- FR-POR-001: Display masonry grid of projects (3-column desktop, 2-column tablet, 1-column mobile)
- FR-POR-002: Category filter pills (All, Pitch Decks, Keynote, Sales, Reports - functional filtering)
- FR-POR-003: Project cards with hover state (thumbnail, title, category; hover shows border + shadow)
- FR-POR-004: Pagination (Load More button - loads next 6 projects, no infinite scroll)
- FR-POR-005: Empty state for filtered results (message + "Clear Filters" button when no matches)

**Case Study Page:**

- FR-CS-001: Full-bleed hero image (16:9 presentation screenshot, edge-to-edge)
- FR-CS-002: Project metadata (client name, role, year displayed)
- FR-CS-003: Challenge section (2-3 paragraphs describing problem)
- FR-CS-004: Approach section with process steps (4 steps with icons: Discover→Define→Design→Deliver)
- FR-CS-005: Solution gallery (6-10 slide images in vertical gallery)
- FR-CS-006: Results section (2-3 metrics in stat cards)
- FR-CS-007: Next project navigation (link to next case study at bottom)

**About Page:**

- FR-ABT-001: Personal photo/bio section (photo + 2-3 paragraph introduction)
- FR-ABT-002: Philosophy statement (1-2 paragraphs on approach)
- FR-ABT-003: Services list (3-4 services with descriptions)
- FR-ABT-004: Process visualization (5-step horizontal timeline)
- FR-ABT-005: CTA to contact (button linking to contact form)

**Contact:**

- FR-CON-001: Contact form (fields: Name, Email, Project Type, Budget, Message)
- FR-CON-002: Form validation (required fields enforced, error messages shown)
- FR-CON-003: Direct email link (mailto: link as alternative)
- FR-CON-004: Social links (LinkedIn, Instagram, Behance icons)
- FR-CON-005: Availability status ("Currently accepting projects" badge)

**Global Navigation:**

- FR-NAV-001: Sticky header with logo (logo links home, header stays on scroll)
- FR-NAV-002: Desktop nav (Home, Work, About, Contact - 4 items, hover underline on active)
- FR-NAV-003: Mobile hamburger menu (full-screen overlay on tap)
- FR-NAV-004: Footer with links (4-column layout, dark background)

### Non-Functional Requirements

**Performance:**

- NFR-PERF-001: Largest Contentful Paint <2.0 seconds
- NFR-PERF-002: Time to Interactive <3.5 seconds
- NFR-PERF-003: Cumulative Layout Shift <0.1
- NFR-PERF-004: Total page weight <2MB
- NFR-PERF-005: All images WebP format, lazy loaded

**Accessibility:**

- NFR-ACC-001: Color contrast WCAG AA (4.5:1 minimum)
- NFR-ACC-002: Keyboard navigation (full site navigable via keyboard)
- NFR-ACC-003: Focus indicators (visible 2px ring on all interactive elements)
- NFR-ACC-004: Alt text (all images have descriptive alt text)
- NFR-ACC-005: Screen reader support (semantic HTML, ARIA where needed)

**Responsive Design:**

- NFR-RESP-001: Desktop 1200px+ (3-column grid, full navigation)
- NFR-RESP-002: Laptop 992-1199px (3-column grid, full navigation)
- NFR-RESP-003: Tablet 768-991px (2-column grid, hamburger menu)
- NFR-RESP-004: Mobile <768px (1-column, hamburger, stacked sections)

**Browser Support:**

- NFR-BRW-001: Chrome (last 2 versions) - Full support
- NFR-BRW-002: Firefox (last 2 versions) - Full support
- NFR-BRW-003: Safari (last 2 versions) - Full support
- NFR-BRW-004: Edge (last 2 versions) - Full support

### Additional Requirements (from Architecture)

- ARCH-001: Use create-next-app starter template with TypeScript, Tailwind, App Router, src-dir
- ARCH-002: Configure Next.js for static export (`output: 'export'`) for Vercel free tier
- ARCH-003: Implement MDX/Markdown content system for case studies in `content/projects/[slug].mdx`
- ARCH-004: Store images in `public/images/projects/[slug]/` with next/image component
- ARCH-005: Integrate Formspree (free tier) for contact form backend
- ARCH-006: Build custom UI components (Button, Card, Input, Badge) - no external component library
- ARCH-007: Integrate Vercel Analytics for Core Web Vitals tracking
- ARCH-008: Implement folder structure: `src/components/layout/`, `src/components/ui/`, `src/components/sections/`
- ARCH-009: Use PascalCase for component files, kebab-case for pages and content files
- ARCH-010: Define TypeScript interfaces for MDX frontmatter (ProjectFrontmatter)

### UX Design Requirements

- UX-DR-001: Implement design token system (color palette, spacing scale, typography tokens)
- UX-DR-002: Build reusable components: FilterPills, ProjectCard, MasonryGrid, ProcessTimeline, Hero, Services
- UX-DR-003: Implement accessibility patterns (3px focus indicators, keyboard nav, aria-live announcements)
- UX-DR-004: Apply responsive breakpoints consistently across all components (1200px, 992px, 768px, <768px)
- UX-DR-005: Implement image loading patterns (blur-up LQIP placeholders, lazy loading, priority for above-fold)
- UX-DR-006: Add micro-interactions (hover lift+shadow, staggered fade-in animations, scroll-triggered reveals)
- UX-DR-007: Implement error states (empty filter with suggestions, image fallbacks, inline form errors)
- UX-DR-008: Build navigation patterns (sticky header, mobile full-screen overlay, scroll progress indicator)
- UX-DR-009: Respect performance budget (FCP <1.5s, LCP <2.5s, prefers-reduced-motion media query)

### FR Coverage Map

| FR ID                      | Epic   | Description                                 |
| -------------------------- | ------ | ------------------------------------------- |
| FR-HOM-001 through HOM-006 | Epic 1 | Homepage Experience                         |
| FR-NAV-001 through NAV-004 | Epic 1 | Global Navigation (shared across all pages) |
| FR-POR-001 through POR-005 | Epic 2 | Portfolio Grid Page                         |
| FR-CS-001 through CS-007   | Epic 3 | Case Study Template                         |
| FR-ABT-001 through ABT-005 | Epic 4 | About Page                                  |
| FR-CON-001 through CON-005 | Epic 5 | Contact Page                                |

## Epic List

### Epic 1: Homepage Experience

Users land on the homepage and immediately understand the value proposition, see featured work, and can navigate to explore the portfolio or learn about the designer.
**FRs covered:** FR-HOM-001, FR-HOM-002, FR-HOM-003, FR-HOM-004, FR-HOM-005, FR-HOM-006, FR-NAV-001, FR-NAV-002, FR-NAV-003, FR-NAV-004

### Epic 2: Discover Portfolio Work

Users can browse the portfolio grid, filter projects by category (Pitch Decks, Keynote, Sales, Reports), and find relevant presentation design examples.
**FRs covered:** FR-POR-001, FR-POR-002, FR-POR-003, FR-POR-004, FR-POR-005

### Epic 3: View Case Study Details

Users can explore individual project case studies, see the full-bleed hero image, understand the challenge and approach, view the solution gallery, and see results.
**FRs covered:** FR-CS-001, FR-CS-002, FR-CS-003, FR-CS-004, FR-CS-005, FR-CS-006, FR-CS-007

### Epic 4: Learn About the Designer

Users can read the designer's bio, understand their philosophy, see the services offered, view the process timeline, and be guided to contact.
**FRs covered:** FR-ABT-001, FR-ABT-002, FR-ABT-003, FR-ABT-004, FR-ABT-005

### Epic 5: Make Contact

Users can fill out the contact form, see direct email and social links, and understand current availability status.
**FRs covered:** FR-CON-001, FR-CON-002, FR-CON-003, FR-CON-004, FR-CON-005

---

## Epic Details with Stories

---

## Epic 1: Homepage Experience

**Goal:** Users land on the homepage and immediately understand the value proposition, see featured work, and can navigate to explore the portfolio or learn about the designer.

**FRs covered:** FR-HOM-001 through HOM-006, FR-NAV-001 through NAV-004

**NFRs applicable:** NFR-PERF-001 (LCP <2s), NFR-RESP-001 to RESP-004 (responsive), NFR-ACC-001 to ACC-005 (accessibility)

**UX-DR applicable:** UX-DR-001 (design tokens), UX-DR-002 (Hero, Services components), UX-DR-005 (image loading), UX-DR-006 (micro-interactions), UX-DR-008 (sticky header, navigation)

---

### Story 1.1: Global Navigation Header and Footer

**As a** visitor,
**I want** consistent navigation across all pages,
**So that** I can easily access Home, Work, About, and Contact sections from anywhere on the site.

**Acceptance Criteria:**

**Given** the user is on any page
**When** the page loads
**Then** a sticky header displays with logo (links home) and desktop nav (Home, Work, About, Contact)
**And** the header remains fixed on scroll

**Given** the user is on desktop (1200px+)
**When** hovering over nav items
**Then** the active page is underlined by default
**And** an underline appears on hover for inactive nav items
**And** nav items are displayed horizontally

**Given** the user is on mobile (<768px)
**When** tapping the hamburger icon
**Then** a full-screen overlay menu appears with nav links
**And** the overlay can be dismissed

**Given** the user scrolls to any page
**When** reaching the bottom
**Then** a 4-column footer with dark background displays
**And** footer contains links to all main pages and social icons

---

### Story 1.2: Hero Section with Tagline and CTAs

**As a** first-time visitor,
**I want** to immediately see the value proposition and clear calls-to-action,
**So that** I understand what Slidely offers and can take next steps.

**Acceptance Criteria:**

**Given** the homepage loads
**When** the hero section renders
**Then** an H1 tagline is visible above the fold
**And** 2 functional CTA buttons are displayed (e.g., "View Work" and "Contact")
**And** LCP is <2.0 seconds

**Given** the user clicks a CTA button
**When** clicking "View Work"
**Then** they are navigated to the Portfolio Grid page
**And** when clicking "Contact" they are navigated to the Contact page

---

### Story 1.3: Featured Projects Section

**As a** visitor,
**I want** to see 3-4 featured projects on the homepage,
**So that** I can quickly assess the quality and range of work.

**Acceptance Criteria:**

**Given** the homepage loads
**When** the featured projects section renders
**Then** 3-4 project cards display with thumbnails
**And** each card links to its case study page
**And** cards have hover state (border + shadow lift)

**Given** the user clicks a featured project card
**When** clicking
**Then** they navigate to the case study page for that project

---

### Story 1.4: Services Overview Section

**As a** visitor,
**I want** to see the services offered,
**So that** I understand what types of presentation design are available.

**Acceptance Criteria:**

**Given** the homepage loads
**When** the services section renders
**Then** 3 service cards display with icons and descriptions
**And** each card shows: service title, brief description, and icon

**Given** the user views the services on any device
**When** the viewport changes
**Then** the layout adapts (3-col desktop, 2-col tablet, 1-col mobile)

---

### Story 1.5: Client Logos and Testimonial

**As a** visitor,
**I want** to see social proof through client logos and testimonials,
**So that** I build trust in the designer's credibility.

**Acceptance Criteria:**

**Given** the homepage loads
**When** the client logos section renders
**Then** 5-8 client logos display in a horizontal strip
**And** logos have grayscale→color hover effect

**Given** testimonials are available
**When** the testimonial section renders
**Then** a quote card displays with author attribution
**And** if no testimonial exists, the section gracefully hides

---

### Story 1.6: Final CTA Section

**As a** visitor,
**I want** to see a clear final call-to-action,
**So that** I'm prompted to reach out after viewing the homepage content.

**Acceptance Criteria:**

**Given** the user scrolls to the bottom of homepage
**When** they reach the final CTA section
**Then** a full-width section with a button displays
**And** the button links to the Contact page
**And** copy is action-oriented (e.g., "Let's Work Together")

---

## Epic 2: Discover Portfolio Work

**Goal:** Users can browse the portfolio grid, filter projects by category (Pitch Decks, Keynote, Sales, Reports), and find relevant presentation design examples.

**FRs covered:** FR-POR-001 through POR-005

**NFRs applicable:** NFR-RESP-001 to RESP-004 (responsive breakpoints), NFR-ACC-002 (keyboard navigation), NFR-ACC-003 (focus indicators)

**UX-DR applicable:** UX-DR-002 (FilterPills, ProjectCard, MasonryGrid), UX-DR-004 (responsive breakpoints), UX-DR-006 (staggered fade-in animations), UX-DR-007 (empty filter state)

---

### Story 2.1: Portfolio Masonry Grid Layout

**As a** visitor,
**I want** to see all projects in a masonry grid layout,
**So that** I can browse the portfolio efficiently.

**Acceptance Criteria:**

**Given** the user navigates to /work
**When** the portfolio page loads
**Then** projects display in a masonry grid (3-column desktop, 2-column tablet, 1-column mobile)
**And** each project card shows thumbnail, title, and category

**Given** the user resizes the viewport
**When** crossing breakpoint thresholds (1200px, 992px, 768px)
**Then** the grid reflows to the appropriate column count
**And** CLS remains <0.1

---

### Story 2.2: Category Filter Pills

**As a** visitor,
**I want** to filter projects by category,
**So that** I can find relevant presentation design examples quickly.

**Acceptance Criteria:**

**Given** the user is on the portfolio page
**When** the page loads
**Then** filter pills display: All, Pitch Decks, Keynote, Sales, Reports
**And** "All" is selected by default

**Given** the user clicks a filter pill
**When** selecting a category
**Then** only projects matching that category display
**And** the filter state persists in session storage
**And** URL updates with filter parameter

**Given** no projects match the selected filter
**When** the filter results are empty
**Then** an empty state message displays
**And** a "Clear Filters" button is shown

---

### Story 2.3: Project Card Hover States

**As a** visitor,
**I want** visual feedback when hovering over project cards,
**So that** I know which projects are clickable.

**Acceptance Criteria:**

**Given** the user hovers over a project card
**When** the cursor is over the card
**Then** a border appears and shadow lifts the card
**And** the transition is smooth (150-200ms)

**Given** the user uses keyboard navigation
**When** tabbing to a project card
**Then** a visible 3px focus indicator appears
**And** the card is activatable with Enter key

---

### Story 2.4: Load More Pagination

**As a** visitor,
**I want** to load more projects without infinite scroll,
**So that** I can control the browsing experience.

**Acceptance Criteria:**

**Given** the user views the portfolio page
**When** there are more than 6 projects
**Then** a "Load More" button displays below the grid
**And** clicking loads the next 6 projects

**Given** all projects are loaded
**When** the user scrolls to the bottom
**Then** the "Load More" button is hidden
**And** no further loading occurs

---

## Epic 3: View Case Study Details

**Goal:** Users can explore individual project case studies, see the full-bleed hero image, understand the challenge and approach, view the solution gallery, and see results.

**FRs covered:** FR-CS-001 through CS-007

**NFRs applicable:** NFR-PERF-005 (image optimization), NFR-RESP-001 to RESP-004 (responsive), NFR-ACC-004 (alt text), NFR-ACC-005 (screen reader support)

**UX-DR applicable:** UX-DR-002 (CaseStudyGallery), UX-DR-005 (blur-up LQIP, priority loading), UX-DR-006 (scroll-triggered reveals)

---

### Story 3.1: Case Study Hero Image and Metadata

**As a** visitor,
**I want** to see the project hero image and metadata,
**So that** I immediately understand the project context.

**Acceptance Criteria:**

**Given** the user navigates to a case study page
**When** the page loads
**Then** a full-bleed 16:9 hero image displays edge-to-edge
**And** project metadata shows: client name, role, year

**Given** the hero image is loading
**When** fetching the image
**Then** a blur-up LQIP placeholder displays
**And** the image loads with lazy loading

**Given** the user views on any device
**When** the viewport changes
**Then** the hero image scales responsively

---

### Story 3.2: Challenge Section

**As a** visitor,
**I want** to read about the project challenge,
**So that** I understand the problem the designer solved.

**Acceptance Criteria:**

**Given** the user scrolls past the hero
**When** reaching the challenge section
**Then** 2-3 paragraphs describe the problem
**And** the text is readable with proper line length

**Given** the user uses screen reader
**When** navigating to the section
**Then** semantic HTML and ARIA labels announce the section

---

### Story 3.3: Approach Section with Process Steps

**As a** visitor,
**I want** to see the design process steps,
**So that** I understand how the designer works.

**Acceptance Criteria:**

**Given** the user scrolls to the approach section
**When** the section renders
**Then** 4 steps display with icons: Discover → Define → Design → Deliver
**And** each step has a title and description

**Given** the user views on mobile
**When** on small screens
**Then** steps stack vertically
**And** on desktop they display horizontally

---

### Story 3.4: Solution Gallery

**As a** visitor,
**I want** to see 6-10 slide images from the project,
**So that** I can evaluate the quality of the design work.

**Acceptance Criteria:**

**Given** the user scrolls to the solution gallery
**When** the gallery section renders
**Then** 6-10 slide images display in a vertical gallery
**And** each image has descriptive alt text

**Given** the images are loading
**When** fetching multiple images
**Then** blur-up placeholders display for each
**And** images are WebP format with lazy loading

---

### Story 3.5: Results Section

**As a** visitor,
**I want** to see the project results and metrics,
**So that** I understand the impact of the design work.

**Acceptance Criteria:**

**Given** the user scrolls past the solution gallery
**When** reaching the results section
**Then** 2-3 metrics display in stat cards
**And** each stat has a label and value

**Given** the user views the stats
**When** on any device
**Then** stat cards are responsive (stack on mobile, row on desktop)

---

### Story 3.6: Next Project Navigation

**As a** visitor,
**I want** to navigate to the next case study,
**So that** I can continue exploring the portfolio.

**Acceptance Criteria:**

**Given** the user reaches the bottom of a case study
**When** at the end of the content
**Then** a "Next Project" link displays
**And** clicking navigates to the next case study

**Given** this is the last case study
**When** no next project exists
**Then** the link shows "Back to Work" and links to /work

---

## Epic 4: Learn About the Designer

**Goal:** Users can read the designer's bio, understand their philosophy, see the services offered, view the process timeline, and be guided to contact.

**FRs covered:** FR-ABT-001 through ABT-005

**NFRs applicable:** NFR-RESP-001 to RESP-004 (responsive), NFR-ACC-001 (color contrast), NFR-ACC-002 (keyboard navigation)

**UX-DR applicable:** UX-DR-002 (ProcessTimeline), UX-DR-006 (scroll-triggered reveals), UX-DR-008 (navigation patterns)

---

### Story 4.1: Personal Bio Section

**As a** visitor,
**I want** to see the designer's photo and bio,
**So that** I connect with the person behind the work.

**Acceptance Criteria:**

**Given** the user navigates to /about
**When** the page loads
**Then** a personal photo displays
**And** 2-3 paragraph introduction renders

**Given** the user views on mobile
**When** on small screens
**Then** photo stacks above text
**And** on desktop they display side-by-side

---

### Story 4.2: Philosophy Statement

**As a** visitor,
**I want** to read the designer's approach philosophy,
**So that** I understand their design thinking.

**Acceptance Criteria:**

**Given** the user scrolls past the bio
**When** reaching the philosophy section
**Then** 1-2 paragraphs on approach display
**And** typography is readable with proper contrast

---

### Story 4.3: Services List

**As a** visitor,
**I want** to see the services offered,
**So that** I know what types of engagements are available.

**Acceptance Criteria:**

**Given** the user scrolls to the services section
**When** the section renders
**Then** 3-4 services display with descriptions
**And** each service has a title and brief explanation

---

### Story 4.4: Process Timeline Visualization

**As a** visitor,
**I want** to see a 5-step process timeline,
**So that** I understand how engagements unfold.

**Acceptance Criteria:**

**Given** the user scrolls to the process section
**When** the timeline renders
**Then** 5 steps display horizontally with icons
**And** each step has a title and description

**Given** the user views on mobile
**When** on small screens
**Then** steps stack vertically
**And** scroll-triggered reveals animate each step

---

### Story 4.5: Contact CTA

**As a** visitor,
**I want** to be guided to contact the designer,
**So that** I can start a project engagement.

**Acceptance Criteria:**

**Given** the user reaches the end of the about page
**When** finishing the content
**Then** a CTA button displays linking to /contact
**And** copy encourages reaching out

---

## Epic 5: Make Contact

**Goal:** Users can fill out the contact form, see direct email and social links, and understand current availability status.

**FRs covered:** FR-CON-001 through CON-005

**NFRs applicable:** NFR-ACC-002 (keyboard navigation), NFR-ACC-003 (focus indicators), NFR-ACC-007 (form error messages)

**UX-DR applicable:** UX-DR-002 (Input, Button components), UX-DR-007 (inline form errors), UX-DR-009 (performance budget)

---

### Story 5.1: Contact Form

**As a** visitor,
**I want** to fill out a contact form,
**So that** I can reach out about a project.

**Acceptance Criteria:**

**Given** the user navigates to /contact
**When** the page loads
**Then** a form displays with fields: Name, Email, Project Type, Budget, Message
**And** all fields are properly labeled

**Given** the user submits the form
**When** clicking submit
**Then** the form posts to Formspree endpoint
**And** success message displays on submission
**And** error message displays on failure

---

### Story 5.2: Form Validation

**As a** visitor,
**I want** clear validation feedback,
**So that** I know if I filled the form correctly.

**Acceptance Criteria:**

**Given** the user submits with empty required fields
**When** validation runs
**Then** error messages show for each empty field
**And** the field border turns red

**Given** the user enters invalid email
**When** the email format is wrong
**Then** an email format error displays
**And** the form does not submit

---

### Story 5.3: Direct Email Link

**As a** visitor,
**I want** an alternative email contact option,
**So that** I can email directly if preferred.

**Acceptance Criteria:**

**Given** the user views the contact page
**When** looking for direct contact
**Then** a mailto: link displays
**And** the email address is visible

---

### Story 5.4: Social Links

**As a** visitor,
**I want** to see social media links,
**So that** I can connect on other platforms.

**Acceptance Criteria:**

**Given** the user views the contact page or footer
**When** looking for social presence
**Then** LinkedIn, Instagram, Behance icons display
**And** each icon links to the respective profile

---

### Story 5.5: Availability Status

**As a** visitor,
**I want** to see current availability,
**So that** I know if the designer is accepting projects.

**Acceptance Criteria:**

**Given** the user views the contact page
**When** the page loads
**Then** an availability badge displays
**And** shows "Currently accepting projects" or "Not accepting new projects"

---

## Implementation Notes

### Technical Infrastructure Stories (Implicit)

The following technical setup is implied by the architecture decisions and will be addressed during Epic 1 implementation:

- **Project Initialization:** Run `npx create-next-app@latest slidely --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
- **Folder Structure:** Create `src/components/layout/`, `src/components/ui/`, `src/components/sections/`, `content/projects/`, `public/images/`
- **MDX Infrastructure:** Implement `lib/projects.ts` for MDX parsing with `ProjectFrontmatter` TypeScript interface
- **Image Pipeline:** Configure `next/image` with WebP, lazy loading, LQIP placeholders
- **Analytics:** Add `@vercel/analytics` to `layout.tsx`
- **Form Backend:** Configure Formspree endpoint in `.env.local`

These are implementation enablers rather than user-facing stories, and will be completed as part of the first development session.

---

## Workflow Complete

All epics and stories have been created and validated. The document is ready for development.

**Summary:**

- **5 Epics** covering all user journeys
- **26 Stories** with complete acceptance criteria
- **32 FRs** fully covered
- **18 NFRs** addressed
- **10 Architecture requirements** implemented
- **9 UX Design requirements** integrated

---

_Next: Invoke `/bmad-help` to determine next steps, or begin implementation with `/bmad-create-story` for a specific story._
