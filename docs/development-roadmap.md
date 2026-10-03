# Development Roadmap

This is the DEVELOPMENT ROADMAP document for CareersCompus — a premium Indian education and career discovery platform.

## 1. Development Philosophy
- Incremental, vertical slices (complete features end-to-end)
- Mobile-first responsive design
- Component-driven development
- Design system before pages
- Database and data model before UI
- SEO from day one
- Performance testing throughout

## 2. Phase Overview

### Phase 0: Foundation (Week 1)
**Goal: Project setup, design system, database**

Tasks:
1. Initialize Next.js project with TypeScript
2. Configure Tailwind CSS with design system tokens
3. Set up shadcn/ui
4. Configure fonts (Plus Jakarta Sans + Inter via next/font)
5. Set up Prisma with PostgreSQL
6. Create database schema and run initial migration
7. Create seed data script with 5 courses, 5 universities, 5 careers, 5 streams
8. Build core UI components:
   - Button (all variants)
   - Input (all variants)
   - Card (base)
   - Badge
   - Container/Section layout
   - Typography components
9. Build layout components:
   - Header/Navigation (desktop + mobile)
   - Footer
   - Page layout wrapper
   - Breadcrumbs
10. Set up global styles, CSS custom properties
11. Configure SEO defaults (root layout metadata, robots.txt, sitemap.ts)
12. Set up error and loading states

Deliverables:
- Running Next.js app with navigation and footer
- Database with seed data
- Design system components in Storybook-like review
- Mobile-responsive navigation

---

### Phase 1: Core Content Pages (Weeks 2-3)
**Goal: Course, University, and Career pages (catalogue + detail)**

#### Week 2: Courses
1. Course catalogue page (/courses)
   - Server component with Prisma queries
   - Stream filter tabs
   - Level filter
   - Course cards grid (responsive)
   - Pagination
   - SEO metadata (generateMetadata)
   - Breadcrumbs
2. Course detail page (/courses/[slug])
   - Full course information layout
   - Tabbed content (Overview, Eligibility, Curriculum, Universities, Careers)
   - Related courses section
   - Counselling CTA sidebar
   - FAQ accordion
   - Structured data (Course schema)
   - Breadcrumbs
3. Course card component (reusable)
4. Course filter components

#### Week 3: Universities + Careers
1. University catalogue page (/universities)
   - State filter, Type filter
   - University cards grid
   - Pagination
2. University detail page (/universities/[slug])
   - Full university layout
   - Courses offered section
   - Placement info (with disclaimer)
   - Campus/facility information
   - FAQs
   - Structured data (CollegeOrUniversity)
3. Career catalogue page (/careers)
   - Stream filter
   - Career cards grid
4. Career detail page (/careers/[slug])
   - Career overview, skills, education path
   - Recommended courses with links
   - Career progression visualization
   - Related careers
   - Structured data (Occupation)
5. Stream landing page (/streams/[slug])
   - Courses in stream
   - Careers in stream
   - Featured universities

Deliverables:
- All content pages functional with real data from DB
- Full responsive design
- SEO metadata and structured data
- Internal linking between entities

---

### Phase 2: Homepage (Week 4)
**Goal: Premium homepage with all sections**

1. Hero section with text content + CTAs
2. Career Compass 3D component:
   - Three.js scene setup
   - Central compass object
   - Floating career labels
   - Mouse interaction
   - Mobile fallback
   - Dynamic import (no SSR)
   - prefers-reduced-motion support
3. Global search bar component
4. Career exploration section
5. Popular streams section
6. Featured courses section (data from DB, isFeatured flag)
7. University discovery section
8. Compare CTA section
9. How it works section
10. Counselling CTA section (with inline form)
11. Stats section (with count-up animation)
12. FAQ section
13. Final CTA section
14. Scroll animations (IntersectionObserver + Framer Motion)

Deliverables:
- Complete premium homepage
- 3D Career Compass working on desktop with fallback
- All sections responsive
- Smooth scroll animations

---

### Phase 3: Interactive Features (Week 5)
**Goal: Search, Comparison, Counselling**

1. Global search overlay:
   - Search API endpoint
   - Autocomplete with debouncing
   - Category-grouped results
   - Keyboard navigation
   - Popular/recent searches
   - Mobile-friendly
2. Search results page (/search)
   - Server-rendered results
   - Filtering by type
3. Comparison tool (/compare):
   - Entity type selection (Course/University)
   - Item selection UI
   - Side-by-side comparison table
   - URL state management
   - Responsive layout (stack on mobile)
4. Counselling flow (/counselling):
   - Multi-step form with React Hook Form + Zod
   - Step 1: Interest area
   - Step 2: Education level
   - Step 3: What you're looking for
   - Step 4: Preferences (location, course, university)
   - Step 5: Contact details
   - Form submission to API
   - Success state
   - Progress indicator
5. Inline counselling forms (sidebar/modal on detail pages)

Deliverables:
- Working search with autocomplete
- Functional comparison tool
- Multi-step counselling flow
- All forms validated and submitted

---

### Phase 4: Static Pages & Polish (Week 6)
**Goal: Remaining pages, SEO, performance**

1. About page (/about)
2. Contact page (/contact) with form
3. Privacy policy (/privacy)
4. Terms of service (/terms)
5. Custom 404 page
6. Custom error page
7. SEO finalization:
   - All meta tags verified
   - Structured data validated (Google Rich Results Test)
   - Sitemap generated and verified
   - robots.txt finalized
   - Open Graph images
8. Performance optimization:
   - Lighthouse audit (target 90+ all categories)
   - Image optimization audit
   - Bundle size analysis
   - 3D component performance testing
   - Core Web Vitals verification
9. Accessibility audit:
   - Keyboard navigation testing
   - Screen reader testing
   - Color contrast verification
   - Focus state verification
10. Cross-browser testing
11. Responsive design QA at all breakpoints

Deliverables:
- All pages complete
- Lighthouse 90+ scores
- Accessibility compliant
- Production-ready frontend

---

### Phase 5: Admin & Backend (Weeks 7-8)
**Goal: Admin dashboard for content management**

1. Admin authentication (NextAuth.js)
2. Admin layout (sidebar navigation)
3. Admin dashboard (key metrics)
4. Course management:
   - List with search/filter
   - Create/Edit form
   - Rich text editor for descriptions
   - Relationship management (streams, exams, universities)
5. University management
6. Career management
7. Stream management
8. Lead/enquiry management:
   - List with status filters
   - Detail view
   - Status updates
   - Notes
9. Featured items management
10. Content verification workflow

Deliverables:
- Functional admin dashboard
- CRUD for all entities
- Lead management

---

### Phase 6: Launch Preparation (Week 9)
**Goal: Production deployment**

1. Production database setup
2. Environment configuration
3. Deploy to Vercel
4. Custom domain setup (careerscompus.in)
5. SSL configuration
6. CDN verification
7. Analytics setup (GA4)
8. Error monitoring setup (Sentry)
9. Seed production database with verified data
10. Final QA round
11. Performance benchmark
12. Security audit
13. Backup strategy

---

### Phase 7: Post-Launch (Weeks 10+)
1. Monitor performance and errors
2. User feedback collection
3. Content expansion
4. SEO monitoring and optimization
5. Feature iteration based on data

## 3. Implementation Sequence (Detailed)

1. Setup:
   - `npx create-next-app@latest careerscompus`
   - Configure Tailwind, shadcn/ui, next/font
2. Database Foundation:
   - Setup Prisma schema (`prisma/schema.prisma`)
   - Create seed script (`prisma/seed.ts`)
3. Global UI & Layout:
   - Global CSS (`app/globals.css`)
   - Layout components (`components/layout/*`)
   - Basic UI components (`components/ui/*`)
4. Navigation & Core Pages Setup:
   - Main layout (`app/layout.tsx`)
   - Homepage placeholder (`app/page.tsx`)
   - Navigation component (`components/layout/Navbar.tsx`)
5. Catalogue Pages:
   - Courses (`app/courses/page.tsx`)
   - Universities (`app/universities/page.tsx`)
   - Careers (`app/careers/page.tsx`)
6. Detail Pages:
   - Course detail (`app/courses/[slug]/page.tsx`)
   - University detail (`app/universities/[slug]/page.tsx`)
   - Career detail (`app/careers/[slug]/page.tsx`)
7. Homepage Implementation:
   - Hero Section & 3D Compass
   - Feature Sections
8. Interactive Features:
   - Global Search component
   - Compare tool (`app/compare/page.tsx`)
   - Counselling Flow (`app/counselling/page.tsx`)
9. Static Pages & Optimization:
   - About, Contact, Privacy, Terms
   - SEO tags, Sitemap, Robots.txt
10. Admin Dashboard:
    - NextAuth setup
    - Admin layouts and CRUD pages (`app/admin/*`)
11. Final Polish & Launch Prep

## 4. Quality Gates

Define quality criteria that must be met before moving between phases:
- Phase 0 → 1: Design system reviewed, DB schema validated, nav responsive
- Phase 1 → 2: All content pages render correctly, SEO metadata present
- Phase 2 → 3: Homepage Lighthouse score > 80, 3D fallback works
- Phase 3 → 4: Search, comparison, counselling all functional
- Phase 4 → 5: Lighthouse 90+, accessibility audit passed
- Phase 5 → 6: Admin CRUD tested, leads captured successfully

## 6. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| 3D performance issues | High | Medium | Fallback design ready, lazy load, device detection |
| Content verification delays | Medium | High | Launch with smaller verified dataset, scale later |
| SEO not indexing | High | Low | Server rendering, structured data, sitemap |
| Database scaling | Medium | Low | Indexed queries, caching, cursor pagination |
| Mobile UX issues | High | Medium | Mobile-first design, continuous testing |

## 7. Team Responsibilities (Solo Developer Scenario)
Since this may be built by a solo developer or small team, prioritize:
- Vertical slices over horizontal layers
- Reusable components over one-off designs
- Database-driven content over hard-coded
- Automated SEO over manual optimization
