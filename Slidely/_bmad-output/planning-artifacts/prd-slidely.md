---
title: "Product Requirements Document: Slidely"
status: "final"
created: "2026-03-19"
author: "Mehdi"
inputs: ["product-brief-slidely.md", "UX Design Specification"]
---

# Product Requirements Document: Slidely

## 1. Product Overview

### 1.1 Purpose

Slidely is a presentation design agency portfolio website designed to attract freelance clients and establish credibility for custom, high-quality presentation design services.

### 1.2 Problem Statement

Clients seeking presentation design help face a frustrating middle-ground:
- **DIY tools** (Canva, Beautiful.ai) produce generic results lacking strategic thinking
- **Premium agencies** charge $6,000-$15,000, pricing out startups and small businesses
- **Marketplace freelancers** offer inconsistent quality and unreliable communication

### 1.3 Solution

A portfolio website that:
1. Showcases 5-7 curated presentation projects with case studies
2. Communicates accessible quality positioning
3. Directs qualified leads to Upwork/Fiverr for engagement
4. Builds trust through process transparency and founder credibility

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

| Goal | Priority | Success Measure |
|------|----------|-----------------|
| Generate inbound leads | High | 2+ inquiries/month by month 3 |
| Establish credibility | High | 5%+ CTA click-through rate |
| Showcase range of work | High | 25+ portfolio views/week |
| Convert visitors to clients | Medium | 10% inquiry-to-project conversion |

### 2.2 User Goals

| User Type | Goal | How Site Supports |
|-----------|------|-------------------|
| Startup founder | Find affordable pitch deck design | Filter by "Pitch Decks", see case studies |
| Marketing manager | Find reliable presentation support | Process page, testimonials |
| Agency consultant | Find overflow design partner | Portfolio quality, About page |

### 2.3 Technical Goals

| Goal | Target |
|------|--------|
| Page Load (LCP) | <2 seconds |
| Lighthouse Score | 90+ |
| Mobile Responsiveness | 100% functional on all breakpoints |
| Image Performance | WebP format, lazy loading, <500KB per image |

---

## 3. User Personas

### 3.1 Primary: Sarah, Startup Founder

- **Age:** 28-40
- **Context:** Raising seed/Series A, needs investor pitch deck
- **Pain Points:** Can't afford $10K agency, worried about freelancer quality
- **Needs:** Strategic thinking, clean design, reliable delivery
- **Success:** Deck that clearly communicates vision, raises funding

### 3.2 Secondary: Marcus, Marketing Manager

- **Age:** 30-50
- **Context:** Needs sales deck or corporate presentation
- **Pain Points:** Internal design team overloaded, need external help
- **Needs:** Professional quality, brand alignment, quick turnaround
- **Success:** Presentation that closes deals or aligns stakeholders

### 3.3 Tertiary: Dr. Chen, Academic/Educator

- **Age:** 35-60
- **Context:** Needs educational content or conference presentation
- **Pain Points:** Limited budget, complex information to visualize
- **Needs:** Clear communication, data visualization, affordable rates
- **Success:** Presentation that engages audience, communicates research

---

## 4. Functional Requirements

### 4.1 Homepage

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| HOM-001 | Display hero with tagline and CTAs | High | H1 visible above fold, 2 CTAs functional |
| HOM-002 | Show 3-4 featured projects | High | Cards display with thumbnails, link to case studies |
| HOM-003 | Display services overview | High | 3 service cards with icons and descriptions |
| HOM-004 | Show client logos (trust signals) | Medium | 5-8 logos in horizontal strip, grayscale→color hover |
| HOM-005 | Display testimonial (optional) | Low | Quote card with author attribution |
| HOM-006 | Final CTA section | High | Full-width section with button linking to contact |

### 4.2 Portfolio Grid

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| POR-001 | Display masonry grid of projects | High | 3-column desktop, 2-column tablet, 1-column mobile |
| POR-002 | Category filter pills | High | All, Pitch Decks, Keynote, Sales, Reports - functional filtering |
| POR-003 | Project cards with hover state | High | Thumbnail, title, category; hover shows border + shadow |
| POR-004 | Pagination (Load More button) | Medium | Loads next 6 projects, no infinite scroll |
| POR-005 | Empty state for filtered results | Low | Message + "Clear Filters" button when no matches |

### 4.3 Case Study Page

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| CS-001 | Full-bleed hero image | High | 16:9 presentation screenshot, edge-to-edge |
| CS-002 | Project metadata | High | Client name, role, year displayed |
| CS-003 | Challenge section | High | 2-3 paragraphs describing problem |
| CS-004 | Approach section with process steps | High | 4 steps with icons (Discover→Define→Design→Deliver) |
| CS-005 | Solution gallery | High | 6-10 slide images in vertical gallery |
| CS-006 | Results section | Medium | 2-3 metrics in stat cards |
| CS-007 | Next project navigation | Medium | Link to next case study at bottom |

### 4.4 About Page

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ABT-001 | Personal photo/bio section | High | Photo + 2-3 paragraph introduction |
| ABT-002 | Philosophy statement | High | 1-2 paragraphs on approach |
| ABT-003 | Services list | High | 3-4 services with descriptions |
| ABT-004 | Process visualization | Medium | 5-step horizontal timeline |
| ABT-005 | CTA to contact | High | Button linking to contact form |

### 4.5 Contact

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| CON-001 | Contact form | High | Fields: Name, Email, Project Type, Budget, Message |
| CON-002 | Form validation | High | Required fields enforced, error messages shown |
| CON-003 | Direct email link | Medium | mailto: link as alternative |
| CON-004 | Social links | Medium | LinkedIn, Instagram, Behance icons |
| CON-005 | Availability status | Low | "Currently accepting projects" badge |

### 4.6 Global Navigation

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NAV-001 | Sticky header with logo | High | Logo links home, header stays on scroll |
| NAV-002 | Desktop nav (Home, Work, About, Contact) | High | 4 items, hover underline on active |
| NAV-003 | Mobile hamburger menu | High | Full-screen overlay on tap |
| NAV-004 | Footer with links | High | 4-column layout, dark background |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-001 | Largest Contentful Paint | <2.0 seconds |
| PERF-002 | Time to Interactive | <3.5 seconds |
| PERF-003 | Cumulative Layout Shift | <0.1 |
| PERF-004 | Total page weight | <2MB |
| PERF-005 | Image optimization | All images WebP, lazy loaded |

### 5.2 Accessibility

| ID | Requirement | Standard |
|----|-------------|----------|
| ACC-001 | Color contrast | WCAG AA (4.5:1 minimum) |
| ACC-002 | Keyboard navigation | Full site navigable via keyboard |
| ACC-003 | Focus indicators | Visible 2px ring on all interactive elements |
| ACC-004 | Alt text | All images have descriptive alt text |
| ACC-005 | Screen reader support | Semantic HTML, ARIA where needed |

### 5.3 Responsive Design

| Breakpoint | Width | Requirements |
|------------|-------|--------------|
| Desktop | 1200px+ | 3-column grid, full navigation |
| Laptop | 992-1199px | 3-column grid, full navigation |
| Tablet | 768-991px | 2-column grid, hamburger menu |
| Mobile | <768px | 1-column, hamburger, stacked sections |

### 5.4 Browser Support

| Browser | Support |
|---------|---------|
| Chrome (last 2 versions) | Full support |
| Firefox (last 2 versions) | Full support |
| Safari (last 2 versions) | Full support |
| Edge (last 2 versions) | Full support |

---

## 6. Technical Requirements

### 6.1 Architecture

| Requirement | Choice | Rationale |
|-------------|--------|-----------|
| Framework | Next.js (static export) | Fast, SEO-friendly, Vercel hosting |
| Styling | Tailwind CSS | Rapid development, small bundle |
| Hosting | Vercel (free tier) | Free, fast CDN, easy deploys |
| Images | WebP with fallback | Best compression, broad support |
| Icons | Lucide Icons | Lightweight, consistent style |

### 6.2 Folder Structure

```
slidely/
├── src/
│   ├── components/
│   │   ├── ui/           # Buttons, inputs, cards
│   │   ├── layout/       # Header, Footer, Nav
│   │   └── sections/     # Hero, FeaturedWork, Services
│   ├── pages/
│   │   ├── index.tsx     # Homepage
│   │   ├── work/
│   │   │   ├── index.tsx # Portfolio grid
│   │   │   └── [slug].tsx # Case study
│   │   ├── about.tsx
│   │   └── contact.tsx
│   ├── styles/
│   │   └── globals.css
│   └── lib/
│       └── utils.ts
├── public/
│   ├── images/
│   │   ├── projects/     # Case study images
│   │   └── logos/        # Client logos
│   └── favicon.ico
└── package.json
```

### 6.3 Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x"
}
```

---

## 7. Content Requirements

### 7.1 Copy Guidelines

| Element | Tone | Character Limit |
|---------|------|-----------------|
| Headlines | Bold, confident | 60 characters |
| Body text | Clear, helpful | 280 characters per paragraph |
| CTAs | Action-oriented | 25 characters |
| Project titles | Descriptive | 40 characters |

### 7.2 Required Content

| Page | Content Needed | Owner |
|------|----------------|-------|
| Home | Hero copy, services descriptions | Founder |
| Work | 5-7 project case studies | Founder |
| About | Bio, philosophy, process | Founder |
| Contact | Form labels, confirmation message | Founder |

### 7.3 Visual Assets

| Asset | Specification | Quantity |
|-------|---------------|----------|
| Project thumbnails | 16:10, WebP, <200KB | 7-10 |
| Case study hero images | 16:9, WebP, <500KB | 5-7 |
| Slide gallery images | 16:9 or 4:3, WebP, <300KB | 30-50 total |
| Client logos | PNG/SVG, <50KB | 5-8 |
| Personal photo | JPG/WebP, professional | 1-2 |

---

## 8. Out of Scope (Explicitly)

The following are **NOT** part of MVP:

- Pricing page (handled on Upwork/Fiverr)
- Blog or content marketing
- Client portal or project management
- Direct payment processing
- Real-time chat or booking system
- Multi-language support
- Dark mode (phase 2 feature)
- Contact form backend (use Formspree or similar)

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Images slow down site | Medium | High | Aggressive optimization, lazy loading |
| Not enough portfolio content | Medium | Medium | Launch with 5 projects, add more over time |
| Form spam | Low | Low | Honeypot field, no CAPTCHA needed initially |
| Mobile layout issues | Low | Medium | Test early, use responsive utilities |

---

## 10. Open Questions

| Question | Decision Needed | Owner |
|----------|-----------------|-------|
| Contact form backend? | Formspree vs email redirect | Founder |
| Case study count at launch? | Minimum 5, ideal 7 | Founder |
| Testimonials available? | Need 1-2 client quotes | Founder |
| Client logos approved for use? | Verify usage rights | Founder |

---

## 11. Approval & Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | Mehdi | TBD | Pending |

---

*This PRD is based on the Product Brief and UX Design Specification. Next step: Create technical architecture and epics/stories for implementation.*
