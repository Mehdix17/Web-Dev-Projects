---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "product-brief-slidely.md"
project: slidely
created: "2026-03-18"
updated: "2026-03-19"
lastStep: 4
---

# UX Design Specification: Slidely

**Author:** Mehdi
**Date:** 2026-03-18

---

## Executive Summary

### Project Vision

Slidely is a presentation design agency portfolio that bridges the gap between generic DIY tools and expensive agencies. Founded by a designer with AI/technical expertise, it offers custom, strategic presentation design at accessible prices—proving that professional quality and fair pricing aren't mutually exclusive.

### Target Users

**Primary: Early-stage startups and small businesses**
- Need pitch decks for fundraising, corporate presentations for sales, or educational materials
- Can't afford agency rates but need professional quality
- Value clear communication and reliable delivery over speed

**Secondary: Students, academics, and non-profits**
- Limited budgets but high standards for their presentations
- Appreciate the student-to-student connection

**Tertiary: Marketing agencies and consultants**
- Need overflow presentation support from a reliable freelancer

### Key Design Challenges

1. **Trust at First Sight** - Visitors must immediately see quality work to believe in the service before any interaction
2. **Showcasing Intangible Value** - The design process and strategic thinking need visual representation, not just final slide images
3. **External Conversion Path** - Directing visitors to Upwork/Fiverr profiles without losing professional credibility

### Design Opportunities

1. **Technical Differentiation** - Leverage founder's AI/technical background as a unique selling point in a design-focused space
2. **Process Transparency** - Show how work gets done to build client confidence before first contact
3. **Portfolio Storytelling** - Transform each project from image gallery into compelling case study narrative

## Core User Experience

### Defining Experience

The core user experience of Slidely centers on **effortless portfolio discovery and trust-building** tailored specifically for presentation design services. Users must be able to quickly find relevant presentation examples, understand the strategic design approach, and feel confident reaching out—all within a seamless, fast-loading experience.

**User Intent States:**
- **Warm Referrals** (50%): Coming directly from Upwork/Fiverr profiles, already interested
- **Explorers** (25%): Browsing for inspiration, not yet ready to hire
- **Evaluators** (15%): Actively comparing designers, need proof of capability
- **Ready-to-Hire** (10%): Decision made, need clear path to contact

**Primary User Journey:**
Discover → Evaluate → Trust → Connect

*Alternative Path for Explorers:* Browse → Save/Share → Return Later

### Platform Strategy

**Primary Platform:** Responsive web application
- **Desktop-first** for detailed portfolio browsing and project evaluation
- **Mobile-optimized** for quick checks and social sharing
- **Static export (Next.js)** for maximum performance and SEO
- **Image-heavy** with WebP optimization, lazy loading, and responsive srcset

**Technical Requirements:**
- Sub-2 second initial page load (Lighthouse Performance 90+)
- Smooth scrolling and transitions (60fps animations)
- SEO-friendly semantic HTML with structured data
- Open Graph meta tags for social sharing
- **Accessibility:** WCAG 2.1 AA compliance (keyboard nav, alt text, color contrast 4.5:1)

**Error Resilience:**
- Graceful image fallbacks if WebP unsupported
- Skeleton loaders during image fetch
- "No results" state for filtering with suggested alternatives

### Effortless Interactions

**Must Be Effortless:**
- **Portfolio Filtering** - One-click filtering by project type with instant visual feedback and URL state preservation
- **Project Browsing** - Smooth, fast-loading galleries with zoom-to-detail on click, keyboard navigation (← → arrows)
- **Navigation** - Clear, persistent nav with scroll progress indicator; sticky on mobile
- **Contact Discovery** - Platform links visible on every page footer + prominent CTA on project pages

**Micro-interactions That Delight:**
- Hover states on project cards (subtle lift + shadow)
- Loading shimmer for images (branded color)
- Filter transition animations (staggered fade-in)
- Scroll-triggered reveals for process sections

**Automatic Behaviors:**
- Image lazy loading with blur-up placeholder
- Smooth scroll to sections with offset for fixed header
- Responsive image delivery based on device pixel density
- **Auto-save** filter preferences in session storage

### Critical Success Moments

1. **First Impression (0-3 seconds)** - Hero showcases 3 rotating high-quality slide examples; value proposition immediately clear
2. **Portfolio Discovery (5-20 seconds)** - User finds project matching their industry/type; filtering feels instant
3. **Quality Validation (20-45 seconds)** - Project detail page reveals before/after or process insight; not just pretty pictures
4. **Process Understanding (1-2 minutes)** - "How I Work" section answers: timeline, deliverables, communication style
5. **Trust Deepening (2-3 minutes)** - About page connects technical background to design capability; personal but professional
6. **Conversion Decision** - Multiple touchpoints to platforms (Upwork/Fiverr) with context-appropriate CTAs

**Make-or-Break Flows:**
- Primary: Homepage → Filtered Portfolio → Project Detail → Platform Link
- Secondary: Direct Project Link (from social) → Project Detail → Related Projects → Platform Link

**Failure Recovery:**
- If user filters to empty state: Show "No [type] projects yet" + suggest similar categories
- If image fails: Show placeholder with project title + description
- If external platform link fails: Show email fallback

### Experience Principles

1. **Trust Through Demonstrated Quality** - Portfolio must immediately showcase exceptional *presentation design* (not just generic web design); emphasize data visualization, narrative flow, and strategic layout
2. **Frictionless Discovery** - Users find relevant examples within two clicks; filters remember state; related projects surface automatically
3. **Process Transparency** - Show *how* presentations are designed: discovery → wireframes → visual design → refinement; include timeline expectations
4. **Speed as Professionalism** - Every interaction <100ms response; images load progressively; no layout shift
5. **Accessibility as Quality** - Keyboard navigable, screen reader friendly, color-blind safe; professional design includes everyone
6. **Technical Credibility** - Subtle signals of technical fluency (clean code, performance, data viz examples) reinforce the AI/technical background

### Analytics & Tracking Strategy (Admin Dashboard)

**Free Analytics Implementation:**
- **Plausible Analytics** (privacy-focused, lightweight, free self-hosted option)
- **Vercel Analytics** (free tier for Core Web Vitals)
- Custom dashboard built into the site ("/admin" route with password protection)

**Key Metrics to Track:**
- Traffic sources (Upwork/Fiverr referrals vs organic)
- Portfolio views by project type
- Filter usage patterns
- Time on project detail pages
- Click-through rate to platform profiles
- New vs returning visitors

**UTM Parameters for Attribution:**
All Upwork/Fiverr links include tracking tags:
- `?utm_source=slidely&utm_medium=portfolio&utm_campaign=[project-type]`
- Enables measuring which portfolio projects drive most inquiries

### Technical Implementation Details

**Performance Budget:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Total page weight: <500KB (excluding images)

**Image Strategy:**
- Next.js Image component with `priority={true}` for above-fold
- Blur-up placeholder: 20x20px LQIP (Low Quality Image Placeholder)
- CDN: Cloudinary or Imgix for on-the-fly format conversion
- Fallback chain: AVIF → WebP → JPEG

**Session Storage Spec:**
```javascript
// Filter preferences with TTL
{
  "filters": { "type": "pitch-deck" },
  "timestamp": 1710844800000, // 24hr TTL
  "version": "1.0" // for cache busting
}
```

**Accessibility Implementation:**
- Focus indicators: 3px solid with 2px offset
- Screen reader announcements: `aria-live="polite"` for filter changes
- Reduced motion: Respect `prefers-reduced-motion` for all animations
- Color contrast: Test with APCA for modern standards

**Error Resilience:**
- Graceful image fallbacks if WebP unsupported
- Skeleton loaders during image fetch
- "No results" state for filtering with suggested alternatives
- "/debug" route with Lighthouse scores visible (technical transparency)

## Desired Emotional Response

### Primary Emotional Goals

**Core Feeling: Confidence and Inspiration**

Visitors should feel **confident** in the designer's expertise and **inspired** by the quality of presentation design work. The portfolio should immediately communicate: "This is professional work that solves real business problems."

**By User Intent State:**
- **Warm Referrals (50%):** Confirmation—"My decision to consider this designer is validated"
- **Evaluators (15%):** Assurance—"This work demonstrates clear presentation design expertise"
- **Explorers (25%):** Discovery—"I'm seeing work that stands out from typical portfolios"
- **Ready-to-Hire (10%):** Trust—"This is someone I can work with"

### Emotional Journey Mapping

| Stage | Desired Emotion | How It's Created |
|-------|-----------------|------------------|
| **First Impression (0-3s)** | Impressed, Curious | High-quality hero showcasing best work immediately |
| **Portfolio Discovery (5-20s)** | Confident, Finding | Smooth filtering, relevant examples surface quickly |
| **Quality Validation (20-45s)** | Assured, Seeing Value | Before/after insights, process transparency |
| **Process Understanding (1-2m)** | Understanding, Trusting | Clear explanation of how work gets done |
| **Trust Deepening (2-3m)** | Connected, Believing | Personal story, technical background, testimonials |
| **Conversion Decision** | Ready, Committed | Clear CTA to platforms, confident in next step |

### Micro-Emotions

**Emotions to Cultivate:**
- ✅ **Confidence** — Through demonstrated quality and professional polish
- ✅ **Trust** — Through process transparency and technical credibility
- ✅ **Discovery** — Finding exactly the type of work they're looking for
- ✅ **Inspiration** — Seeing presentations that elevate their expectations

**Emotions to Avoid:**
- ❌ **Skepticism** — Prevented by avoiding generic templates, showing real projects
- ❌ **Confusion** — Prevented by clear navigation, organized structure
- ❌ **Frustration** — Prevented by fast loading, effortless interactions
- ❌ **Overwhelm** — Prevented by focused content, clear filtering

### Design Implications

| Desired Emotion | UX Design Approach |
|-----------------|------------------|
| **Confidence** | High-quality hero images, professional typography, clear organization |
| **Trust** | Process transparency, technical credibility signals, real project examples |
| **Discovery** | Instant filtering with visual feedback, related project suggestions |
| **Quality** | Performance (fast load), attention to details (accessibility, responsive design) |
| **Inspiration** | Showcase best work prominently, storytelling around projects |

### Emotional Design Principles

1. **Quality Signals Trust** — Every pixel, every interaction, every millisecond of load time signals professionalism
2. **Transparency Builds Confidence** — Showing process, pricing approach, and communication style reduces uncertainty
3. **Discovery Feels Effortless** — Finding relevant work should feel like magic, not work
4. **Technical Excellence = Design Excellence** — Performance and accessibility are quality indicators

## Desired Emotional Response

### Primary Emotional Goals

**Core Feeling: Confidence and Inspiration**

Visitors should feel **confident** in the designer's expertise and **inspired** by the quality of presentation design work. The portfolio should immediately communicate: "This is professional work that solves real business problems."

**By User Intent State:**
- **Warm Referrals (50%):** Confirmation—"My decision to consider this designer is validated"
- **Evaluators (15%):** Assurance—"This work demonstrates clear presentation design expertise"
- **Explorers (25%):** Discovery—"I'm seeing work that stands out from typical portfolios"
- **Ready-to-Hire (10%):** Trust—"This is someone I can work with"

### Emotional Journey Mapping

| Stage | Desired Emotion | How It's Created |
|-------|-----------------|------------------|
| **First Impression (0-3s)** | Impressed, Curious | High-quality hero showcasing best work immediately |
| **Portfolio Discovery (5-20s)** | Confident, Finding | Smooth filtering, relevant examples surface quickly |
| **Quality Validation (20-45s)** | Assured, Seeing Value | Before/after insights, process transparency |
| **Process Understanding (1-2m)** | Understanding, Trusting | Clear explanation of how work gets done |
| **Trust Deepening (2-3m)** | Connected, Believing | Personal story, technical background, testimonials |
| **Conversion Decision** | Ready, Committed | Clear CTA to platforms, confident in next step |

### Micro-Emotions

**Emotions to Cultivate:**
- ✅ **Confidence** — Through demonstrated quality and professional polish
- ✅ **Trust** — Through process transparency and technical credibility
- ✅ **Discovery** — Finding exactly the type of work they're looking for
- ✅ **Inspiration** — Seeing presentations that elevate their expectations

**Emotions to Avoid:**
- ❌ **Skepticism** — Prevented by avoiding generic templates, showing real projects
- ❌ **Confusion** — Prevented by clear navigation, organized structure
- ❌ **Frustration** — Prevented by fast loading, effortless interactions
- ❌ **Overwhelm** — Prevented by focused content, clear filtering

### Design Implications

| Desired Emotion | UX Design Approach |
|-----------------|------------------|
| **Confidence** | High-quality hero images, professional typography, clear organization |
| **Trust** | Process transparency, technical credibility signals, real project examples |
| **Discovery** | Instant filtering with visual feedback, related project suggestions |
| **Quality** | Performance (fast load), attention to details (accessibility, responsive design) |
| **Inspiration** | Showcase best work prominently, storytelling around projects |

### Emotional Design Principles

1. **Quality Signals Trust** — Every pixel, every interaction, every millisecond of load time signals professionalism
2. **Transparency Builds Confidence** — Showing process, pricing approach, and communication style reduces uncertainty
3. **Discovery Feels Effortless** — Finding relevant work should feel like magic, not work
4. **Technical Excellence = Design Excellence** — Performance and accessibility are quality indicators

## Desired Emotional Response

### Primary Emotional Goals

**Core Feeling: Confidence and Inspiration**

Visitors should feel **confident** in the designer's expertise and **inspired** by the quality of presentation design work. The portfolio should immediately communicate: "This is professional work that solves real business problems."

**By User Intent State:**
- **Warm Referrals (50%):** Confirmation—"My decision to consider this designer is validated"
- **Evaluators (15%):** Assurance—"This work demonstrates clear presentation design expertise"
- **Explorers (25%):** Discovery—"I'm seeing work that stands out from typical portfolios"
- **Ready-to-Hire (10%):** Trust—"This is someone I can work with"

### Emotional Journey Mapping

| Stage | Desired Emotion | How It's Created |
|-------|-----------------|------------------|
| **First Impression (0-3s)** | Impressed, Curious | High-quality hero showcasing best work immediately |
| **Portfolio Discovery (5-20s)** | Confident, Finding | Smooth filtering, relevant examples surface quickly |
| **Quality Validation (20-45s)** | Assured, Seeing Value | Before/after insights, process transparency |
| **Process Understanding (1-2m)** | Understanding, Trusting | Clear explanation of how work gets done |
| **Trust Deepening (2-3m)** | Connected, Believing | Personal story, technical background, testimonials |
| **Conversion Decision** | Ready, Committed | Clear CTA to platforms, confident in next step |

### Micro-Emotions

**Emotions to Cultivate:**
- ✅ **Confidence** — Through demonstrated quality and professional polish
- ✅ **Trust** — Through process transparency and technical credibility
- ✅ **Discovery** — Finding exactly the type of work they're looking for
- ✅ **Inspiration** — Seeing presentations that elevate their expectations

**Emotions to Avoid:**
- ❌ **Skepticism** — Prevented by avoiding generic templates, showing real projects
- ❌ **Confusion** — Prevented by clear navigation, organized structure
- ❌ **Frustration** — Prevented by fast loading, effortless interactions
- ❌ **Overwhelm** — Prevented by focused content, clear filtering

### Design Implications

| Desired Emotion | UX Design Approach |
|-----------------|------------------|
| **Confidence** | High-quality hero images, professional typography, clear organization |
| **Trust** | Process transparency, technical credibility signals, real project examples |
| **Discovery** | Instant filtering with visual feedback, related project suggestions |
| **Quality** | Performance (fast load), attention to details (accessibility, responsive design) |
| **Inspiration** | Showcase best work prominently, storytelling around projects |

### Emotional Design Principles

1. **Quality Signals Trust** — Every pixel, every interaction, every millisecond of load time signals professionalism
2. **Transparency Builds Confidence** — Showing process, pricing approach, and communication style reduces uncertainty
3. **Discovery Feels Effortless** — Finding relevant work should feel like magic, not work
4. **Technical Excellence = Design Excellence** — Performance and accessibility are quality indicators

