# Routes Architecture: CareersCompus

This document outlines the routes architecture for CareersCompus, a premium Indian education and career discovery platform built with Next.js 14+ App Router.

**Domain:** https://careerscompus.in

---

## Route Groups (Next.js App Router)
- `(public)` — all public-facing pages sharing the public layout (header, footer, common elements).
- `admin` — admin pages with the admin layout (sidebar, authentication, dashboard elements).
- `api` — API routes for backend functionality.

---

## Public Routes

### / (Homepage)
1. **Path:** `/`
2. **Page component location:** `app/(public)/page.tsx`
3. **Purpose:** Landing page, first impression, career discovery entry point.
4. **Primary user intent:** Explore what CareersCompus offers, discover career/course options.
5. **Data requirements:** Featured courses, featured universities, popular streams, platform statistics.
6. **Rendering strategy:** ISR (revalidate: 3600)
7. **SEO requirements:**
   - **Title:** `CareersCompus | Find Your Direction — Discover Careers, Courses & Universities in India`
   - **Description:** Premium guidance for students to discover top careers, university programs, and courses in India.
   - **Structured data:** Organization, WebSite (with SearchAction), BreadcrumbList
8. **Breadcrumb trail:** Home
9. **Key components used:** `HeroSearch`, `CareerCompass3D`, `FeaturedCoursesGrid`, `FeaturedUniversitiesGrid`, `PopularStreamsGrid`, `CounsellingCTA`
10. **Related routes:** `/courses`, `/universities`, `/careers`, `/counselling`

### /courses
1. **Path:** `/courses`
2. **Page component location:** `app/(public)/courses/page.tsx`
3. **Purpose:** Browsable, filterable catalogue of all courses.
4. **Primary user intent:** Find courses by stream, level, duration, keyword.
5. **Data requirements:** Course list with stream, level, duration, fee range, pagination details (Cursor-based, 12 items per page). URL params: `?stream=engineering&level=ug&page=1`
6. **Rendering strategy:** ISR (revalidate: 3600)
7. **SEO requirements:**
   - **Title:** `Explore {count}+ Courses in India | CareersCompus`
   - **Description:** Browse thousands of undergraduate and postgraduate courses across various streams in India.
   - **Structured data:** ItemList, BreadcrumbList
8. **Breadcrumb trail:** Home > Courses
9. **Key components used:** `CourseFilters`, `CourseCard`, `Pagination`, `EmptyState`
10. **Related routes:** `/courses/[slug]`, `/streams/[slug]`

### /courses/[slug]
1. **Path:** `/courses/[slug]`
2. **Page component location:** `app/(public)/courses/[slug]/page.tsx`
3. **Purpose:** Comprehensive course information page.
4. **Primary user intent:** Learn everything about a specific course.
5. **Data requirements:** Full course record + related universities, related courses, related careers, FAQs.
6. **Rendering strategy:** ISR (revalidate: 86400), `generateStaticParams` for top courses.
7. **SEO requirements:**
   - **Title:** `{Course Name} — Eligibility, Fees, Top Universities, Career Scope | CareersCompus`
   - **Description:** Get complete details about {Course Name}. Discover eligibility criteria, curriculum, fee structure, and top universities offering this course.
   - **Structured data:** Course, FAQPage, BreadcrumbList
8. **Breadcrumb trail:** Home > Courses > {Stream Name} > {Course Name}
9. **Key components used:** `CourseHero`, `CourseCurriculum`, `TopCollegesList`, `FAQSection`, `RelatedCareers`
10. **Related routes:** `/universities/[slug]`, `/careers/[slug]`, `/counselling`

### /universities
1. **Path:** `/universities`
2. **Page component location:** `app/(public)/universities/page.tsx`
3. **Purpose:** Browsable, filterable catalogue of all universities.
4. **Primary user intent:** Find universities by state, type, stream offered.
5. **Data requirements:** University list with location, type, streams offered, pagination (12 per page).
6. **Rendering strategy:** ISR
7. **SEO requirements:**
   - **Title:** `Top Universities in India | CareersCompus`
   - **Description:** Discover top-ranked universities and colleges in India for engineering, medical, management, and more.
   - **Structured data:** ItemList, BreadcrumbList
8. **Breadcrumb trail:** Home > Universities
9. **Key components used:** `UniversityFilters`, `UniversityCard`, `Pagination`
10. **Related routes:** `/universities/[slug]`

### /universities/[slug]
1. **Path:** `/universities/[slug]`
2. **Page component location:** `app/(public)/universities/[slug]/page.tsx`
3. **Purpose:** Comprehensive university information page.
4. **Primary user intent:** Learn everything about a specific university.
5. **Data requirements:** Full university record + courses offered, scholarships, exams, FAQs.
6. **Rendering strategy:** ISR (revalidate: 86400)
7. **SEO requirements:**
   - **Title:** `{University Name} — Courses, Fees, Admissions, Placements | CareersCompus`
   - **Description:** Complete guide to {University Name}. Check out offered courses, fee structure, admission process, placement records, and more.
   - **Structured data:** CollegeOrUniversity, FAQPage, BreadcrumbList
8. **Breadcrumb trail:** Home > Universities > {University Name}
9. **Key components used:** `UniversityHero`, `CoursesOfferedList`, `PlacementStats`, `CampusGallery`, `FAQSection`
10. **Related routes:** `/courses/[slug]`, `/compare`

### /careers
1. **Path:** `/careers`
2. **Page component location:** `app/(public)/careers/page.tsx`
3. **Purpose:** Career exploration catalogue.
4. **Primary user intent:** Discover career options, understand what careers exist.
5. **Data requirements:** List of careers, filtered by stream or keyword.
6. **Rendering strategy:** ISR
7. **SEO requirements:**
   - **Title:** `Explore Career Options & Pathways | CareersCompus`
   - **Description:** Discover high-growth career options. Learn about skills required, salary expectations, and educational pathways.
   - **Structured data:** ItemList, BreadcrumbList
8. **Breadcrumb trail:** Home > Careers
9. **Key components used:** `CareerFilters`, `CareerCardGrid`
10. **Related routes:** `/careers/[slug]`

### /careers/[slug]
1. **Path:** `/careers/[slug]`
2. **Page component location:** `app/(public)/careers/[slug]/page.tsx`
3. **Purpose:** Detailed career information with pathway to courses.
4. **Primary user intent:** Learn how to become a professional in this field.
5. **Data requirements:** Career details + recommended courses + relevant universities.
6. **Rendering strategy:** ISR (revalidate: 86400)
7. **SEO requirements:**
   - **Title:** `{Career Name} — How to Become, Courses, Skills, Salary | CareersCompus`
   - **Description:** Comprehensive guide to becoming a {Career Name}. Discover required skills, average salary, and top courses to pursue this career.
   - **Structured data:** Occupation, FAQPage, BreadcrumbList
8. **Breadcrumb trail:** Home > Careers > {Career Name}
9. **Key components used:** `CareerHero`, `SalaryInsights`, `RequiredSkills`, `RecommendedCourses`, `FAQSection`
10. **Related routes:** `/courses/[slug]`, `/counselling`

### /streams/[slug]
1. **Path:** `/streams/[slug]`
2. **Page component location:** `app/(public)/streams/[slug]/page.tsx`
3. **Purpose:** Stream landing page aggregating courses, universities, and careers in a stream.
4. **Primary user intent:** Explore everything related to a specific educational stream (e.g., Engineering, Medical).
5. **Data requirements:** Stream details + courses in stream + careers in stream + featured universities.
6. **Rendering strategy:** ISR
7. **SEO requirements:**
   - **Title:** `{Stream Name} Courses, Careers & Universities in India | CareersCompus`
   - **Description:** Explore the {Stream Name} domain. Find top courses, leading universities, and lucrative career opportunities in {Stream Name}.
   - **Structured data:** ItemList, BreadcrumbList
8. **Breadcrumb trail:** Home > Streams > {Stream Name}
9. **Key components used:** `StreamHero`, `TopCoursesGrid`, `TopUniversitiesSlider`, `CareerOpportunities`
10. **Related routes:** `/courses`, `/universities`, `/careers`

### /compare
1. **Path:** `/compare`
2. **Page component location:** `app/(public)/compare/page.tsx`
3. **Purpose:** Side-by-side comparison tool.
4. **Primary user intent:** Compare 2-3 courses or universities to make a decision.
5. **Data requirements:** Client-side with URL state (`?type=course&items=slug1,slug2`).
6. **Rendering strategy:** CSR (data fetched client-side based on URL params).
7. **SEO requirements:**
   - **Title:** `Compare Courses & Universities Side-by-Side | CareersCompus`
   - **Description:** Use our intelligent comparison tool to compare courses and universities based on fees, placements, eligibility, and curriculum.
   - **Structured data:** None
8. **Breadcrumb trail:** Home > Compare
9. **Key components used:** `CompareSelector`, `ComparisonTable`, `CompareEntityCard`
10. **Related routes:** `/courses/[slug]`, `/universities/[slug]`

### /counselling
1. **Path:** `/counselling`
2. **Page component location:** `app/(public)/counselling/page.tsx`
3. **Purpose:** Multi-step guided counselling enquiry flow.
4. **Primary user intent:** Get personalized guidance from an expert.
5. **Data requirements:** Steps: Interest selection → Education level → Preferences → Location → Contact.
6. **Rendering strategy:** CSR
7. **SEO requirements:**
   - **Title:** `Free Career Counselling & Admission Guidance | CareersCompus`
   - **Description:** Confused about your career path? Get free expert career counselling and admission guidance from CareersCompus.
   - **Structured data:** Service
8. **Breadcrumb trail:** Home > Counselling
9. **Key components used:** `MultiStepForm`, `InterestSelector`, `ContactDetailsForm`, `WhatsAppIntegration`
10. **Related routes:** `/`

### /search
1. **Path:** `/search`
2. **Page component location:** `app/(public)/search/page.tsx`
3. **Purpose:** Search results page for global search.
4. **Primary user intent:** Find specific courses, universities, or careers quickly.
5. **Data requirements:** URL: `/search?q=computer+science&type=course`. Fetched search results.
6. **Rendering strategy:** SSR (Server-rendered results with client-side filtering).
7. **SEO requirements:**
   - **Title:** `Search Results for "{query}" | CareersCompus`
   - **Description:** Search results.
   - **Structured data:** None (noindex applied).
   - **Meta:** `noindex` (search results pages should not be indexed)
8. **Breadcrumb trail:** Home > Search
9. **Key components used:** `SearchResultsList`, `SearchFilters`, `EmptySearchState`
10. **Related routes:** All entity pages.

### /about
1. **Path:** `/about`
2. **Page component location:** `app/(public)/about/page.tsx`
3. **Purpose:** Company/platform information, mission, team.
4. **Primary user intent:** Learn about the organization behind CareersCompus.
5. **Data requirements:** Static content, team members.
6. **Rendering strategy:** ISR (revalidate: 86400)
7. **SEO requirements:**
   - **Title:** `About CareersCompus | Our Mission to Guide India's Students`
   - **Description:** Learn about CareersCompus, our mission to revolutionize educational discovery in India, and the team behind the platform.
   - **Structured data:** AboutPage
8. **Breadcrumb trail:** Home > About Us
9. **Key components used:** `MissionStatement`, `TeamGrid`, `CompanyValues`
10. **Related routes:** `/contact`

### /contact
1. **Path:** `/contact`
2. **Page component location:** `app/(public)/contact/page.tsx`
3. **Purpose:** Contact form, office information, support channels.
4. **Primary user intent:** Reach out for support or inquiries.
5. **Data requirements:** Static contact info.
6. **Rendering strategy:** ISR
7. **SEO requirements:**
   - **Title:** `Contact CareersCompus | Get in Touch`
   - **Description:** Contact CareersCompus for support, partnerships, or general inquiries. Reach out via email, phone, or WhatsApp.
   - **Structured data:** ContactPage, LocalBusiness (if applicable)
8. **Breadcrumb trail:** Home > Contact
9. **Key components used:** `ContactForm`, `OfficeLocationMap`, `SupportChannels`
10. **Related routes:** `/about`, `/counselling`

### /privacy
1. **Path:** `/privacy`
2. **Page component location:** `app/(public)/privacy/page.tsx`
3. **Purpose:** Privacy policy (legal requirement).
4. **Primary user intent:** Understand data handling practices.
5. **Data requirements:** Legal text content.
6. **Rendering strategy:** ISR (revalidate: 86400*7)
7. **SEO requirements:**
   - **Title:** `Privacy Policy | CareersCompus`
   - **Description:** CareersCompus Privacy Policy.
8. **Breadcrumb trail:** Home > Privacy Policy
9. **Key components used:** `ProseContainer`
10. **Related routes:** `/terms`

### /terms
1. **Path:** `/terms`
2. **Page component location:** `app/(public)/terms/page.tsx`
3. **Purpose:** Terms of service (legal requirement).
4. **Primary user intent:** Understand rules of using the platform.
5. **Data requirements:** Legal text content.
6. **Rendering strategy:** ISR (revalidate: 86400*7)
7. **SEO requirements:**
   - **Title:** `Terms of Service | CareersCompus`
   - **Description:** CareersCompus Terms of Service.
8. **Breadcrumb trail:** Home > Terms of Service
9. **Key components used:** `ProseContainer`
10. **Related routes:** `/privacy`

---

## Admin Routes (Protected)

These routes reside in `app/admin/...` and share an authenticated layout. SEO is not applicable (all admin pages are behind auth and should have `noindex`).

### /admin
- **Purpose:** Dashboard with key metrics (total leads, active users, content stats).
- **Data:** Aggregated analytics.

### /admin/courses
- **Purpose:** CRUD for courses, list view with search/filter.

### /admin/courses/new
- **Purpose:** Create new course form.

### /admin/courses/[id]/edit
- **Purpose:** Edit existing course.

### /admin/universities
- **Purpose:** CRUD for universities.

### /admin/universities/new
- **Purpose:** Create new university form.

### /admin/universities/[id]/edit
- **Purpose:** Edit existing university.

### /admin/careers
- **Purpose:** CRUD for careers.

### /admin/careers/new
- **Purpose:** Create new career form.

### /admin/careers/[id]/edit
- **Purpose:** Edit existing career.

### /admin/streams
- **Purpose:** CRUD for streams.

### /admin/leads
- **Purpose:** View and manage enquiries/leads.
- **Data/Features:** Filters (status, date, source), Actions (Update status, assign, add notes).

### /admin/settings
- **Purpose:** Platform settings, featured items management (hero, featured universities).

---

## API Routes

These routes reside in `app/api/...` and handle client-side requests and webhooks.

### GET /api/search
- **Purpose:** Global search endpoint.
- **Params:** `q`, `type`, `limit`
- **Returns:** Categorized results (courses, universities, careers).

### POST /api/enquiry
- **Purpose:** Submit counselling enquiry.
- **Body:** name, email, phone, interest, education, preferences.
- **Notes:** Must be rate limited to prevent spam.

### GET /api/courses/autocomplete
- **Purpose:** Course search autocomplete for fast UI feedback.
- **Params:** `q`, `limit`

### POST /api/admin/*
- **Purpose:** Admin CRUD endpoints.
- **Notes:** Protected by session authentication.

### POST /api/revalidate
- **Purpose:** On-demand revalidation webhook for ISR content updates.
- **Notes:** Secret-protected.

---

## URL Conventions
- **Case:** All lowercase
- **Separators:** Hyphens (`-`) for word separation
- **Trailing Slashes:** No trailing slashes
- **Clean Slugs:** E.g., `/courses/btech-computer-science` (Avoid dots and complex characters: not `/courses/b.tech-computer-science-engineering`)
- **Consistency:** Use a consistent slug generation algorithm across the app.

---

## Redirect Rules
To maintain SEO integrity and handle legacy/intuitive URLs gracefully:
- `/course/*` → 301 Redirect to `/courses/*`
- `/university/*` → 301 Redirect to `/universities/*`
- `/career/*` → 301 Redirect to `/careers/*`
- `/stream/*` → 301 Redirect to `/streams/*`
