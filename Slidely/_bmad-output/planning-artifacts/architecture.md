---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - "product-brief-slidely.md"
  - "prd-slidely.md"
  - "ux-design-specification.md"
workflowType: 'architecture'
project_name: 'slidely'
user_name: 'Mehdi'
date: '2026-03-19'
status: 'complete'
completedAt: '2026-03-19'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- 5 pages: Homepage, Portfolio Grid, Case Study (dynamic), About, Contact
- 32 functional requirements across 6 categories (Home, Portfolio, Case Study, About, Contact, Navigation)
- Image-heavy content with 30-50 slide images across case studies
- Category filtering on portfolio page (Pitch Decks, Keynote, Sales, Reports)

**Non-Functional Requirements:**
- Performance: LCP <2s, Lighthouse 90+, TTI <3.5s, CLS <0.1
- Accessibility: WCAG AA compliance (4.5:1 contrast, keyboard navigation, screen reader support)
- Responsive: 4 breakpoints (Desktop 1200px+, Laptop 992px, Tablet 768px, Mobile <768px)
- Browser Support: Last 2 versions of Chrome, Firefox, Safari, Edge

**Scale & Complexity:**

- Primary domain: Static Web (marketing/portfolio site)
- Complexity level: Low-Medium
- Estimated architectural components: 15-20 React components

### Technical Constraints & Dependencies

1. Static Export Required - Next.js must use `output: 'export'` for Vercel free tier
2. Image Optimization Critical - 30-50 slide images need aggressive optimization
3. Form Backend External - Contact form requires third-party (Formspree or similar)
4. No Database - All content is static/Markdown-based
5. Free Tier Hosting - Vercel free tier limits build minutes, bandwidth

### Cross-Cutting Concerns Identified

1. Image Performance - Affects every page; requires consistent optimization strategy
2. Responsive Design - Every component must handle 4 breakpoints
3. Accessibility - Keyboard navigation, focus indicators, alt text across all interactive elements
4. SEO/Discoverability - Semantic HTML, Open Graph tags, structured data for portfolio
5. Navigation Consistency - Sticky header, mobile hamburger, footer across all pages

---

## Starter Template Evaluation

### Primary Technology Domain

**Static Web Application** based on PRD requirements

### Starter Options Considered

| Option | Pros | Cons |
|--------|------|------|
| create-next-app (Official) | Actively maintained, perfect Vercel compatibility, minimal boilerplate | No testing framework included |
| Third-party boilerplates | More opinionated, may include testing | Variable maintenance, potential bloat |

### Selected Starter: create-next-app@latest

**Rationale for Selection:**
- Matches PRD technical stack exactly (Next.js 14, Tailwind CSS 3)
- Official Vercel maintenance ensures longevity
- Minimal setup with maximum flexibility for portfolio content
- App Router pattern aligns with modern Next.js best practices
- `src/` directory matches the PRD folder structure

**Initialization Command:**

```bash
npx create-next-app@latest slidely --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript with strict mode enabled
- React 18 with Next.js 14 App Router

**Styling Solution:**
- Tailwind CSS 3 pre-configured
- `globals.css` with Tailwind directives
- CSS modules support available

**Build Tooling:**
- Next.js compiler (Turbopack in development mode)
- Automatic image optimization via `next/image`
- Static export capability (`output: 'export'`)

**Testing Framework:**
- Not included by default (can add Jest/Playwright manually if needed)

**Code Organization:**
- `src/` folder structure
- Import alias `@/` for clean imports
- App Router file-based routing

**Development Experience:**
- Hot reloading with Fast Refresh
- Automatic code splitting
- Edge runtime support if needed

---

## Core Architectural Decisions

### Decision Priority Analysis

**Already Decided (from PRD + Starter Template):**
- Framework: Next.js 14 (static export)
- Styling: Tailwind CSS 3
- Hosting: Vercel free tier
- Language: TypeScript
- Icons: Lucide React
- No database (static content)

**Critical Decisions Made:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content Management | Markdown/MDX | Content separate from code, designer-friendly updates |
| Image Pipeline | Local `/public` + `next/image` | Free, sufficient for ~50 images, no vendor lock-in |
| Form Backend | Formspree (free tier) | No backend needed, spam protection, works with static export |

**Important Decisions Made:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component Structure | Custom UI components | Simple site, specific patterns, no library overhead |
| Analytics | Vercel Analytics | Free, integrated, tracks Core Web Vitals (NFR requirement) |

---

### Content Management

**Decision:** Markdown/MDX with frontmatter for case study content

**Implementation:**
- Case studies stored in `content/projects/[slug].mdx`
- Frontmatter fields: title, client, role, year, category, results
- Body content: challenge, approach, solution gallery descriptions
- Parse using `gray-matter` or Next.js built-in MDX support

**Rationale:** Case studies are content-heavy and will be updated by the designer (non-developer). Markdown allows easy content updates without touching code, while frontmatter provides structured metadata for filtering and display.

---

### Image Pipeline

**Decision:** Local images in `/public` folder with `next/image` component

**Implementation:**
- Images stored in `public/images/projects/[slug]/`
- Use `next/image` with explicit `width`, `height`, `quality` props
- WebP format with automatic fallback
- Lazy loading (`loading="lazy"`) for below-fold images
- Priority loading (`priority={true}`) for above-fold hero images

**Rationale:** For a portfolio with ~50 images, Vercel's free tier image optimization is sufficient. No need for external CDN initially. Local storage gives full control and zero vendor dependency.

---

### Form Backend

**Decision:** Formspree (free tier) for contact form handling

**Implementation:**
- Form action points to Formspree endpoint
- Required fields: Name, Email, Project Type, Budget, Message
- Honeypot field for spam protection (no CAPTCHA needed)
- Success/error states handled client-side

**Rationale:** Matches PRD "Out of Scope: Contact form backend". No backend code needed, built-in spam protection, works seamlessly with static export. Free tier sufficient for MVP traffic.

---

### Component Structure

**Decision:** Custom UI components built with Tailwind CSS

**Implementation:**
- Base primitives: Button, Card, Input, Badge
- Layout components: Header, Footer, Nav, MasonryGrid
- Feature components: ProjectCard, FilterPills, Hero, ProcessTimeline
- All components responsive with 4 breakpoints (1200px, 992px, 768px, <768px)

**Rationale:** For a simple portfolio site, custom components are sufficient. The PRD defines specific patterns (filter pills, project cards, masonry grid) that don't require a component library. Full control over design and no dependency overhead.

---

### Analytics

**Decision:** Vercel Analytics (free tier)

**Implementation:**
- Vercel Analytics script in `_document.tsx`
- Track page views, CTA clicks, portfolio filter usage
- Core Web Vitals monitoring (LCP, FCP, CLS)
- UTM parameters on outbound links for attribution

**Rationale:** Free, integrated with hosting, and tracks Core Web Vitals which are explicit NFR requirements. Sufficient for MVP success metrics (portfolio views, CTA click-through rate, conversion tracking).

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (`create-next-app`)
2. Component primitives (Button, Card, Input)
3. Layout components (Header, Footer, Nav)
4. Content infrastructure (MDX parsing, project data loading)
5. Image pipeline setup
6. Form integration (Formspree endpoint)
7. Analytics integration
8. Pages implementation (Home, Portfolio, Case Study, About, Contact)

**Cross-Component Dependencies:**
- Image pipeline affects all project display components
- Content management affects Case Study page routing
- Analytics affects global layout (`_document.tsx`)
- Form backend affects Contact page only (isolated)

---

## Core Architectural Decisions

### Decision Priority Analysis

**Already Decided (from PRD + Starter):**
- Framework: Next.js 14 (static export)
- Styling: Tailwind CSS 3
- Hosting: Vercel free tier
- Language: TypeScript
- No database (static content)

**Critical Decisions Made:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content Management | Markdown/MDX | Content separate from code, designer-friendly updates |
| Image Pipeline | Local `/public` + `next/image` | Free, sufficient for ~50 images, no vendor lock-in |
| Form Backend | Formspree (free tier) | No backend needed, spam protection, matches PRD scope |

**Important Decisions Made:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component Structure | Custom UI components | Simple site, specific patterns, no library overhead |
| Analytics | Vercel Analytics | Free, integrated, tracks Core Web Vitals NFRs |

**Deferred/Nice-to-Have:**
- Dark mode (Phase 2, per PRD)
- Blog/Content marketing (out of scope per PRD)
- Client portal (out of scope per PRD)

---

### Content Management

**Decision:** Markdown/MDX for case study content

**Implementation:**
- Store case studies in `content/projects/[slug].mdx`
- Frontmatter for: title, client, role, year, category, results
- Body for: challenge, approach, solution gallery
- Parse with `gray-matter` or Next.js MDX

**Rationale:** Case studies are content-heavy and will be updated by the designer (non-developer). Markdown allows easy content updates without touching code.

---

### Image Pipeline

**Decision:** Local `/public` folder with `next/image` component

**Implementation:**
- Store images in `public/images/projects/[slug]/`
- Use `next/image` with `width`, `height`, `quality` props
- WebP format with automatic fallback
- Lazy loading for below-fold images
- Blur-up placeholder (LQIP) for perceived performance

**Rationale:** For a portfolio with ~50 images, Vercel's free tier image optimization is sufficient. No need for external CDN initially.

---

### Form Backend

**Decision:** Formspree (free tier)

**Implementation:**
- Form endpoint: `https://formspree.io/f/{form_id}`
- Fields: Name, Email, Project Type, Budget, Message
- Honeypot field for spam protection (no CAPTCHA)
- Success/error states handled client-side

**Rationale:** Matches PRD "Out of Scope: Contact form backend". No backend code needed, spam protection included, works with static export.

---

### Component Structure

**Decision:** Custom UI components with Tailwind CSS

**Implementation:**
- Build primitives from scratch: Button, Card, Input, Badge
- Layout components: Header, Footer, Nav, MasonryGrid
- Feature components: ProjectCard, FilterPills, CaseStudyGallery
- All components styled with Tailwind utility classes
- No headless UI library dependency

**Rationale:** For a simple portfolio site, custom components are sufficient. The PRD defines specific patterns (filter pills, project cards, masonry grid) that don't need a component library.

---

### Analytics & Tracking

**Decision:** Vercel Analytics (free tier)

**Implementation:**
- Add `@vercel/analytics` package
- Track page views automatically
- Track CTA clicks with `track()` events
- Core Web Vitals dashboard in Vercel
- UTM parameters on Upwork/Fiverr links for attribution

**Rationale:** Free, integrated with hosting, tracks Core Web Vitals (which are NFRs). Sufficient for MVP metrics (page views, CTA clicks, conversion rate).

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (`create-next-app`)
2. Folder structure setup (`content/`, `public/images/`)
3. Base layout components (Header, Footer, Nav)
4. Homepage with hero and featured projects
5. Portfolio grid with filtering
6. Case study template (MDX parsing)
7. About page
8. Contact page with Formspree
9. Analytics integration
10. Image optimization pass
11. Performance tuning (LCP, CLS)
12. Accessibility audit (WCAG AA)

**Cross-Component Dependencies:**
- MDX content parsing affects all case study pages
- Image optimization affects every page with images
- Navigation component is shared across all pages
- Filter state affects portfolio grid and URL state

---

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase + `.tsx` | `ProjectCard.tsx`, `FilterPills.tsx` |
| Utilities | camelCase + `.ts` | `utils.ts`, `formatDate.ts` |
| Pages | kebab-case + `page.tsx` | `work/page.tsx`, `about/page.tsx` |
| Content files | kebab-case + `.mdx` | `pitch-deck-redesign.mdx` |
| Image folders | lowercase + hyphens | `public/images/projects/` |
| Functions | camelCase | `getProjectData`, `formatDate` |
| Variables | camelCase | `projectId`, `isLoading` |
| Types/Interfaces | PascalCase | `interface Project`, `type ProjectProps` |

---

### Structure Patterns

**Component Organization:**
- `src/components/layout/` - Header, Footer, Nav (shared layout)
- `src/components/ui/` - Button, Card, Input, Badge (primitives)
- `src/components/sections/` - Hero, FeaturedWork, Services (feature sections)

**Content Organization:**
- `content/projects/` - MDX case study files
- `public/images/projects/` - Project images organized by slug
- `public/images/logos/` - Client logo files

**Test Organization:**
- Co-located with components (`*.test.ts` next to source) - deferred for MVP

---

### Format Patterns

**TypeScript Types:**
```typescript
interface ProjectFrontmatter {
  title: string;
  client: string;
  role: string;
  year: number;
  category: 'pitch-deck' | 'keynote' | 'sales' | 'reports';
  results?: string[];
}
```

**MDX Frontmatter:**
```markdown
---
title: "Seed Fundraising Pitch Deck"
client: "TechStart Inc."
role: "Full Redesign"
year: 2025
category: "pitch-deck"
results: ["Raised $2M seed round", "Featured in TC"]
---
```

---

### Process Patterns

**Error Handling:**
| Scenario | Pattern |
|----------|---------|
| Image load failure | Placeholder with alt text |
| 404 (missing project) | Custom 404 page with "Back to Work" link |
| Form submission error | Inline error messages, red border |
| MDX parse error | Build fails (caught at build time) |

**Loading States:**
| Scenario | Pattern |
|----------|---------|
| Image loading | Blur-up placeholder (LQIP) |
| Page navigation | Instant (static site) |
| Form submission | Disabled button + "Sending..." text |

---

### Enforcement Guidelines

**All AI Agents MUST:**
1. Use PascalCase for component files and names
2. Use kebab-case for page routes and content files
3. Place components in `src/components/` by type (layout, ui, sections)
4. Use TypeScript interfaces for MDX frontmatter types
5. Use `next/image` for all images (no raw `<img>` tags)
6. Store case study content in `/content/projects/*.mdx`

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
slidely/
├── README.md
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml (optional - Phase 2)
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout with Analytics
│   │   ├── page.tsx            # Homepage
│   │   ├── not-found.tsx       # Custom 404
│   │   ├── work/
│   │   │   ├── page.tsx        # Portfolio grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Case study (dynamic)
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Nav.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Input.tsx
│   │   └── sections/
│   │       ├── Hero.tsx
│   │       ├── FeaturedWork.tsx
│   │       ├── Services.tsx
│   │       ├── MasonryGrid.tsx
│   │       ├── FilterPills.tsx
│   │       └── ProcessTimeline.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── projects.ts         # MDX parsing utilities
│   └── types/
│       └── project.ts          # TypeScript types
├── content/
│   └── projects/               # MDX case study files
│       ├── project-1.mdx
│       ├── project-2.mdx
│       └── ...
├── public/
│   ├── images/
│   │   ├── projects/           # Case study images
│   │   │   └── [slug]/
│   │   └── logos/              # Client logos
│   └── favicon.ico
├── tests/                      # (Phase 2 - optional)
│   └── components/
└── .vercel/                    # Vercel config (auto-generated)
```

---

### Requirements to Structure Mapping

| FR Category | Files/Directories |
|-------------|-------------------|
| Homepage | `src/app/page.tsx`, `src/components/sections/Hero.tsx`, `FeaturedWork.tsx`, `Services.tsx` |
| Portfolio Grid | `src/app/work/page.tsx`, `src/components/sections/MasonryGrid.tsx`, `FilterPills.tsx` |
| Case Study | `src/app/work/[slug]/page.tsx`, `content/projects/*.mdx` |
| About | `src/app/about/page.tsx`, `src/components/sections/ProcessTimeline.tsx` |
| Contact | `src/app/contact/page.tsx`, `src/components/ui/Input.tsx`, `Button.tsx` |
| Navigation | `src/components/layout/Header.tsx`, `Footer.tsx`, `Nav.tsx` |

---

### Cross-Cutting Concerns Mapping

| Concern | Files/Directories |
|---------|-------------------|
| Image Performance | `src/components/ui/`, `next/image` usage across all pages |
| Responsive Design | All components use Tailwind responsive utilities |
| Accessibility | `src/components/` - focus indicators, alt text, ARIA |
| Analytics | `src/app/layout.tsx` - Vercel Analytics script |
| SEO | `src/app/` - metadata exports, Open Graph tags |

---

### Integration Points

**Internal Communication:**
- Components communicate via React props
- Layout components wrap page components
- MDX content parsed by `lib/projects.ts` utilities

**External Integrations:**
| Service | Integration Point |
|---------|-------------------|
| Formspree | `src/app/contact/page.tsx` - form action attribute |
| Vercel Analytics | `src/app/layout.tsx` - Analytics component |
| Upwork/Fiverr | CTA links in components (external hrefs) |

**Data Flow:**
1. MDX files → `lib/projects.ts` → Project data objects
2. Project data → `MasonryGrid`/`ProjectCard` components → Rendered UI
3. Form input → Formspree API → Success/error state

---

### File Organization Patterns

**Configuration Files:**
- `next.config.mjs` - Next.js configuration (static export, image optimization)
- `tailwind.config.ts` - Tailwind CSS configuration (colors, fonts, breakpoints)
- `tsconfig.json` - TypeScript configuration (strict mode, paths)
- `.env.local` - Environment variables (Formspree endpoint, analytics ID)

**Source Organization:**
- `app/` - Next.js App Router pages and layouts
- `components/` - React components organized by type
- `lib/` - Utility functions and data parsing
- `types/` - TypeScript type definitions

**Asset Organization:**
- `public/` - Static assets served at root
- `content/` - MDX content files (not in public)
- `globals.css` - Global styles with Tailwind directives

---

### Development Workflow Integration

**Development Server:**
- `npm run dev` - Next.js dev server with Turbopack
- Hot reloading with Fast Refresh
- Local preview at `http://localhost:3000`

**Build Process:**
- `npm run build` - Next.js static export
- Output to `out/` folder
- Deploy to Vercel automatically via Git

**Deployment:**
- Push to Git → Vercel auto-deploys
- Static files served via Vercel CDN
- Analytics and performance metrics in Vercel dashboard

---

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
All technology choices work together without conflicts:
- Next.js 14 + Tailwind CSS 3 + TypeScript is a proven, compatible stack
- Static export mode works with Vercel free tier
- Formspree integrates cleanly with static sites
- MDX content parsing is supported by Next.js
- `next/image` works with local `/public` folder structure

**Pattern Consistency:**
- Naming conventions are consistent (PascalCase components, kebab-case pages)
- Component organization aligns with Tailwind CSS approach
- MDX frontmatter types match TypeScript patterns
- Error handling and loading states follow React conventions

**Structure Alignment:**
- Project structure directly supports the PRD requirements
- `app/` folder matches Next.js App Router patterns
- `content/projects/` supports MDX case study workflow
- `public/images/` supports the image pipeline decision

---

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR Category | Architectural Support | Status |
|-------------|----------------------|--------|
| Homepage | `src/app/page.tsx`, `Hero.tsx`, `FeaturedWork.tsx`, `Services.tsx` | ✅ Covered |
| Portfolio Grid | `src/app/work/page.tsx`, `MasonryGrid.tsx`, `FilterPills.tsx` | ✅ Covered |
| Case Study | `src/app/work/[slug]/page.tsx`, `content/projects/*.mdx` | ✅ Covered |
| About | `src/app/about/page.tsx`, `ProcessTimeline.tsx` | ✅ Covered |
| Contact | `src/app/contact/page.tsx`, Formspree integration | ✅ Covered |
| Navigation | `Header.tsx`, `Footer.tsx`, `Nav.tsx` | ✅ Covered |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Support | Status |
|-----|----------------------|--------|
| Performance (LCP <2s) | `next/image`, static export, local images | ✅ Covered |
| Accessibility (WCAG AA) | Pattern guidelines for focus, alt text, keyboard nav | ✅ Covered |
| Responsive (4 breakpoints) | Tailwind responsive utilities in all components | ✅ Covered |
| Browser Support | Next.js handles cross-browser compatibility | ✅ Covered |

---

### Implementation Readiness Validation

**Decision Completeness:**
- All critical decisions documented with rationale
- Technology versions specified (Next.js 14, Tailwind CSS 3, React 18)
- Implementation patterns include concrete examples
- Enforcement guidelines are clear

**Structure Completeness:**
- Complete directory tree defined
- All pages have file locations specified
- Component types categorized (layout, ui, sections)
- Integration points mapped (Formspree, Analytics)

**Pattern Completeness:**
- Naming conventions cover all file/code types
- Error handling patterns for all scenarios
- Loading states defined for images, forms, navigation
- TypeScript types for MDX frontmatter

---

### Gap Analysis Results

**No Critical Gaps Found**

**Nice-to-Have (Deferred Intentionally):**
1. **Testing strategy** - Deferred for MVP, can add Playwright later
2. **CI/CD workflow** - Optional Phase 2 (`.github/workflows/ci.yml`)
3. **Dark mode** - Explicitly deferred per PRD ("phase 2 feature")

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low-Medium)
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented (Content, Images, Form, Components, Analytics)
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

---

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Prescribed stack from PRD eliminates decision paralysis
2. Static site architecture is simple and well-understood
3. MDX content separation enables designer-friendly updates
4. No backend complexity (Formspree handles forms)
5. Clear component organization prevents conflicts

**Areas for Future Enhancement:**
- Testing suite (Phase 2)
- CI/CD automation (Phase 2)
- Dark mode (Phase 2 per PRD)

---

### Implementation Handoff

**Next Step:** Begin implementation with project initialization

**First Command:**
```bash
npx create-next-app@latest slidely --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project, naming conventions, and structure
- Refer to this document for all architectural questions
