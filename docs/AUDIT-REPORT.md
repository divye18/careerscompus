# CareersCompus Blueprint — Cross-Document Consistency Audit

**Audited on:** 2026-10-03
**Documents reviewed:** 10 (product-requirements.md, information-architecture.md, design-system.md, technical-architecture.md, database-schema.md, routes.md, seo-strategy.md, content-model.md, homepage-wireframe.md, development-roadmap.md)

---

## Summary

| Check | Result | Details |
|---|---|---|
| 1. Route Consistency | ✅ PASS | All three docs agree on route paths |
| 2. Database Relationship Consistency | ✅ PASS | All entities present and properly related |
| 3. Design System Component Coverage | ✅ PASS | All page-required components defined |
| 4. Responsive Breakpoints | ⚠️ WARNING | Minor gap in breakpoint definitions |
| 5. Scale Support (1000+ courses) | ✅ PASS | Pagination, caching, indexing strategies in place |
| 6. SEO Consistency | ✅ PASS | Title/description patterns match all route types |
| 7. Development Roadmap Alignment | ✅ PASS | Routes, components, and features correctly referenced |
| 8. Content Model ↔ Database Alignment | ⚠️ WARNING | Minor field naming differences |

**Totals:** 6 PASS, 2 WARNING, 0 FAIL

---

## Detailed Findings

### 1. Route Consistency ✅ PASS

**Verified across:** routes.md, information-architecture.md, technical-architecture.md

All three documents agree on the following route structure:

| Route | routes.md | IA.md | tech-arch.md |
|---|---|---|---|
| `/` | ✅ | ✅ | ✅ |
| `/courses` | ✅ | ✅ | ✅ |
| `/courses/[slug]` | ✅ | ✅ | ✅ |
| `/universities` | ✅ | ✅ | ✅ |
| `/universities/[slug]` | ✅ | ✅ | ✅ |
| `/careers` | ✅ | ✅ | ✅ |
| `/careers/[slug]` | ✅ | ✅ | ✅ |
| `/streams/[slug]` | ✅ | ✅ | ✅ |
| `/compare` | ✅ | ✅ | ✅ |
| `/counselling` | ✅ | ✅ | ✅ |
| `/search` | ✅ | ✅ | ✅ |
| `/about` | ✅ | ✅ | ✅ |
| `/contact` | ✅ | ✅ | ✅ |
| `/privacy` | ✅ | ✅ | ✅ |
| `/terms` | ✅ | ✅ | ✅ |
| `/admin/*` | ✅ | ✅ | ✅ |

**Note:** The IA document includes `/streams` (overview page) which is implicitly supported by the route structure. The routes doc defines `/streams/[slug]` but not a bare `/streams` listing page. This is acceptable as stream navigation happens through the secondary nav bar and stream cards on the homepage.

---

### 2. Database Relationship Consistency ✅ PASS

**Verified across:** database-schema.md, information-architecture.md, content-model.md

All entities are defined and relationships are consistent:

| Entity | DB Schema | IA | Content Model |
|---|---|---|---|
| University | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| Course | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| Career | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| Stream | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| EntranceExam | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| Scholarship | ✅ Prisma model | ✅ Referenced | ✅ Mentioned |
| CourseUniversity | ✅ Junction table | ✅ Described | ✅ Relation |
| CareerCourse | ✅ Junction table | ✅ Described | ✅ Relation |
| CareerStream | ✅ Junction table | ✅ Described | ✅ Relation |
| CourseExam | ✅ Junction table | ✅ Described | ✅ Relation |
| UniversityExam | ✅ Junction table | ✅ Described | ✅ Relation |
| Enquiry | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| FAQ | ✅ Prisma model | ✅ Referenced | ✅ Content spec |
| Admin | ✅ Prisma model | ✅ Referenced | N/A |

The KEY relationship chain (CAREER → COURSE → UNIVERSITY → ADMISSION) is consistently documented across all three documents.

---

### 3. Design System Component Coverage ✅ PASS

**Verified against:** homepage-wireframe.md, information-architecture.md

| Required Component | Design System Defines |
|---|---|
| Course Card | ✅ Cards section |
| University Card | ✅ Cards section |
| Career Card | ✅ Cards section |
| Stream Card | ✅ Cards section |
| Stat Card | ✅ Cards section |
| Comparison Table | ✅ Data Display section |
| Search Overlay | ✅ Overlay section |
| Modal/Drawer | ✅ Overlay section |
| Multi-step Form | ✅ Form section |
| Navigation (Desktop + Mobile) | ✅ Navigation section |
| Breadcrumbs | ✅ Navigation section |
| Tabs | ✅ Navigation section |
| Pagination | ✅ Navigation section |
| FAQ Accordion | ✅ (covered by interactive patterns) |
| Buttons (all variants) | ✅ Buttons section |
| Inputs (all variants) | ✅ Inputs section |
| Badges (stream, level, type) | ✅ Badges section |
| Loading Skeletons | ✅ Feedback section |
| Empty States | ✅ Feedback section |
| Tooltips | ✅ Overlay section |
| Toasts/Alerts | ✅ Feedback section |

---

### 4. Responsive Breakpoints ⚠️ WARNING

**Required breakpoints:** 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px

**Design system defines:** sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1440px), 3xl(1920px)

**Gap identified:** The specific mobile breakpoints at 390px and 430px are not explicitly defined as Tailwind breakpoints. However, this is standard Tailwind CSS practice — mobile is the default (no prefix), and these widths fall within the default mobile range (0–639px).

**Recommendation:** No code changes needed. The mobile-first approach covers 390px and 430px naturally. However, during QA testing, explicitly test at these viewport widths as specified in the requirements. Add a note to the design system document acknowledging these as QA test points.

---

### 5. Scale Support ✅ PASS

**Verified across:** technical-architecture.md, database-schema.md

Strategies in place for 1000+ courses / 300+ universities:

| Concern | Strategy |
|---|---|
| Database queries | ✅ Indexed fields (slug, streamId+level composite, state+type composite) |
| Pagination | ✅ Cursor-based for public, offset for admin |
| Caching | ✅ ISR with appropriate revalidation periods |
| Static generation | ✅ `generateStaticParams` for top items, ISR for rest |
| Search performance | ✅ PostgreSQL full-text search with tsvector indexes |
| Image delivery | ✅ next/image with CDN |
| Bundle size | ✅ Dynamic imports, code splitting, tree shaking |

---

### 6. SEO Consistency ✅ PASS

**Verified across:** seo-strategy.md, routes.md

Every route type defined in routes.md has corresponding:
- Title tag pattern in seo-strategy.md ✅
- Meta description pattern ✅
- Structured data specification ✅
- Canonical URL strategy ✅
- Breadcrumb schema ✅

The `noindex` directives are correctly applied to `/search` results pages in both documents.

---

### 7. Development Roadmap Alignment ✅ PASS

**Verified against:** all other documents

| Roadmap Phase | References Correct Routes | References Correct Components | References Correct Data |
|---|---|---|---|
| Phase 0 (Foundation) | ✅ | ✅ Design system components match | ✅ DB schema |
| Phase 1 (Content Pages) | ✅ /courses, /universities, /careers, /streams | ✅ Card, filter, detail components | ✅ Prisma queries |
| Phase 2 (Homepage) | ✅ / | ✅ All homepage sections from wireframe | ✅ Featured data |
| Phase 3 (Interactive) | ✅ /search, /compare, /counselling | ✅ Search overlay, comparison, form | ✅ API endpoints |
| Phase 4 (Polish) | ✅ /about, /contact, /privacy, /terms | ✅ | ✅ |
| Phase 5 (Admin) | ✅ /admin/* | ✅ CRUD components | ✅ Admin model |

---

### 8. Content Model ↔ Database Alignment ⚠️ WARNING

**Minor inconsistencies found:**

| Content Model Field | DB Schema Field | Note |
|---|---|---|
| `duration` (String, e.g., "4 Years") | `durationYears` (Float) | Content model uses String, DB uses Float. Need consistent approach. |
| `accreditation` (String[]) in content model | `naacGrade`, `nbaAccredited`, `ugcRecognized` in DB | DB uses separate fields; content model uses array. DB approach is more structured — keep DB version. |
| `placementData` (JSON) in content model | `averagePackage`, `highestPackage`, `placementRate` in DB | DB uses separate fields; content model uses JSON. DB approach is better for queries — keep DB version. |
| `contactInfo` (JSON) in content model | `email`, `phone`, `website` in DB | DB uses separate fields; content model uses JSON. DB is better — keep DB version. |
| `averageSalaryMin`/`Max` in content model for Course | Not present in Course DB model | Course salary is on Career entity, not Course. Content model should reference Career relation for salary data. |

**Recommendation:** These are minor representation differences. The database schema is the authoritative source. Update the content model document to note that:
1. Duration is stored as Float (years) in DB but displayed as formatted string
2. Accreditation, placement, and contact use structured fields (not JSON blobs)
3. Salary data for courses comes through the Career relationship

These do not block implementation.

---

## Final Implementation Sequence

This is the dependency-ordered implementation checklist, derived from all 10 documents:

### Week 1: Foundation

1. Initialize Next.js 14+ project with TypeScript (`npx create-next-app@latest`)
2. Configure `tailwind.config.ts` with design system tokens (colors, typography, spacing, shadows from design-system.md)
3. Install and configure shadcn/ui
4. Set up fonts (Plus Jakarta Sans + Inter) via `next/font`
5. Install core dependencies: `framer-motion`, `lucide-react`, `react-hook-form`, `zod`
6. Set up Prisma ORM with PostgreSQL connection
7. Write `prisma/schema.prisma` (from database-schema.md)
8. Run initial migration (`npx prisma migrate dev`)
9. Create seed script (`prisma/seed.ts`) with sample data for 5 streams, 5 courses, 5 universities, 5 careers
10. Build design system foundation components: Button, Input, Card, Badge, Container, Section, Typography
11. Build layout components: Header (desktop + mobile nav), Footer, Breadcrumbs
12. Configure root `layout.tsx` with metadata defaults, font loading, global styles
13. Create `robots.ts`, `sitemap.ts` stubs
14. Create global error, loading, and not-found pages
15. Set up CSS custom properties in `globals.css`

### Week 2: Course Pages

16. Create `/courses` catalogue page with server-side Prisma queries
17. Build CourseCard component
18. Build StreamFilter and LevelFilter components
19. Implement pagination component
20. Add `generateMetadata()` for courses catalogue
21. Create `/courses/[slug]` detail page
22. Build course detail sections: Overview, Eligibility, Curriculum (tabs), Top Universities, Related Courses
23. Build FAQ accordion component
24. Add counselling CTA sidebar component
25. Implement Course structured data (JSON-LD)
26. Add breadcrumb component to course pages

### Week 3: University + Career + Stream Pages

27. Create `/universities` catalogue page
28. Build UniversityCard component
29. Build state/type filters
30. Create `/universities/[slug]` detail page
31. Build university detail sections: Overview, Courses Offered, Placements (with disclaimer), Campus, FAQs
32. Implement CollegeOrUniversity structured data
33. Create `/careers` catalogue page
34. Build CareerCard component
35. Create `/careers/[slug]` detail page
36. Build career detail sections: Overview, Skills, Education Path, Recommended Courses, Progression, Related Careers
37. Implement Occupation structured data
38. Create `/streams/[slug]` landing page
39. Build internal linking between all entity pages (course↔university, course↔career, career↔stream)

### Week 4: Homepage

40. Build homepage hero section (text + CTAs)
41. Build Career Compass 3D component (Three.js/R3F with dynamic import)
42. Build mobile fallback for 3D hero (CSS animation or static layout)
43. Build global search bar component
44. Build career exploration section (career cards grid)
45. Build popular streams section (stream cards)
46. Build featured courses section (data from `isFeatured` flag)
47. Build top universities section
48. Build compare CTA section
49. Build "How It Works" 4-step section
50. Build counselling CTA section (dark bg, inline form)
51. Build stats section with animated count-up
52. Build homepage FAQ section
53. Build final CTA section
54. Implement scroll-reveal animations (Intersection Observer + Framer Motion)
55. Test `prefers-reduced-motion` fallbacks

### Week 5: Interactive Features

56. Build global search overlay (full-screen on mobile, dropdown on desktop)
57. Create `/api/search` endpoint with multi-entity search
58. Implement autocomplete with debouncing
59. Build search results page `/search`
60. Build comparison tool page `/compare`
61. Build entity selector for comparison (courses or universities)
62. Build comparison table component
63. Implement URL state for comparison (`?type=course&items=slug1,slug2`)
64. Build multi-step counselling form `/counselling`
65. Create `/api/enquiry` endpoint with Zod validation
66. Build inline counselling forms for detail page sidebars
67. Test all forms for validation and submission

### Week 6: Static Pages + Polish

68. Build `/about` page
69. Build `/contact` page with form
70. Build `/privacy` and `/terms` pages
71. Finalize custom 404 and error pages
72. Verify all meta tags across all pages
73. Validate structured data (Google Rich Results Test)
74. Generate and verify XML sitemap
75. Finalize `robots.txt`
76. Run Lighthouse audit (target 90+ all categories)
77. Run accessibility audit (keyboard nav, focus states, contrast, screen reader)
78. Cross-browser testing (Chrome, Firefox, Safari, Edge)
79. Responsive QA at: 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px
80. Performance optimize: bundle analysis, image audit, 3D performance

### Weeks 7-8: Admin Dashboard

81. Set up admin authentication (NextAuth.js with credentials)
82. Build admin layout (sidebar, header, protected routes)
83. Build admin dashboard with key metrics
84. Build course CRUD (list, create, edit) with rich text editor
85. Build university CRUD
86. Build career CRUD
87. Build stream CRUD
88. Build lead/enquiry management (list, status updates, notes)
89. Build featured items management
90. Test admin auth and RBAC

### Week 9: Launch Preparation

91. Production database setup and migration
92. Environment variables configuration
93. Deploy to Vercel with custom domain (careerscompus.in)
94. SSL configuration verification
95. Analytics setup (GA4)
96. Error monitoring setup (Sentry)
97. Seed production database with verified content
98. Final QA round
99. Performance benchmark
100. Launch 🚀

---

> **Verdict:** The blueprint is internally consistent and ready for implementation. The two warnings are minor representation differences that do not block development. The implementation sequence above follows proper dependency ordering.
