# SEO Strategy: CareersCompus

This document outlines the comprehensive SEO strategy for CareersCompus, a premium Indian education and career discovery platform.

**Domain:** `https://careerscompus.in`

---

## 1. SEO Philosophy

- **Built-In, Not Bolted-On:** SEO is integrated into the architecture from day one.
- **Focus on Long-Tail:** Target specific educational and career queries.
- **Quality First:** Content must be accurate, verified, and genuinely helpful to students.
- **White-Hat Only:** No black-hat techniques, keyword stuffing, or cloaking.
- **Rich Results:** Extensive use of structured data for enhanced search visibility.

---

## 2. Technical SEO

### URL Structure
- Clean, semantic URLs indicating site hierarchy.
- Consistent slug generation (lowercase, hyphenated, no special characters).
- No query parameters for permanent, indexable content.
- Canonical URLs explicitly defined on every page.
- Self-referencing canonicals to prevent duplicate content issues.

### Crawling & Indexing
- **robots.txt Configuration:**
  - `Allow` all public pages.
  - `Disallow` `/admin/*`, `/api/*`, and `/search` (optional, to prevent infinite crawl spaces).
  - Explicitly reference the sitemap location.
- **XML Sitemap:**
  - Dynamic generation via Next.js `sitemap.ts`.
  - Separate sitemaps for scalable indexing: courses, universities, careers, streams.
  - Logical `priority` and `changefreq` values.
  - Submit automatically/manually to Google Search Console and Bing Webmaster Tools.
- **Meta Robots Rules:**
  - `index, follow` all detail pages (Courses, Universities, Careers).
  - `noindex, follow` search results pages.
  - `noindex, nofollow` admin and private routes.
  - `noindex, follow` paginated pages beyond page 1 (using `rel=next/prev` appropriately).

### Performance (SEO Impact)
- **Core Web Vitals:** Focus on LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint).
- **Rendering:** Server-side rendering (SSR) or Incremental Static Regeneration (ISR) for all content pages.
- **Optimization:** Use `next/image` for images, `next/font` for fonts.
- **Lazy Loading:** Defer loading of below-the-fold content and heavy 3D elements.

### Rendering Strategy
- All content pages are server-rendered (ISR preferred for cacheability).
- JavaScript-dependent interactive content must have a server-rendered semantic fallback.
- The 3D Career Compass hero must have a static HTML/Image fallback for crawlers.

---

## 3. On-Page SEO

### Title Tag Patterns

| Page Type | Pattern | Example |
| :--- | :--- | :--- |
| **Homepage** | `CareersCompus | Find Your Direction — Careers, Courses & Universities` | `CareersCompus | Find Your Direction` |
| **Course Catalogue** | `Explore {count}+ Courses in India | CareersCompus` | `Explore 1200+ Courses in India | CareersCompus` |
| **Course Detail** | `{Course Name} — Eligibility, Fees, Universities | CareersCompus` | `B.Tech Computer Science — Eligibility, Fees, Universities | CareersCompus` |
| **University Catalogue** | `Top Universities in India | CareersCompus` | `Top Universities in India | CareersCompus` |
| **University Detail** | `{University} — Courses, Fees, Admissions | CareersCompus` | `IIT Delhi — Courses, Fees, Admissions | CareersCompus` |
| **Career Detail** | `How to Become a {Career} — Courses, Skills, Salary | CareersCompus` | `How to Become a Data Scientist — Courses, Skills, Salary | CareersCompus` |
| **Stream Landing** | `{Stream} Courses & Careers in India | CareersCompus` | `Engineering Courses & Careers in India | CareersCompus` |
| **Compare** | `Compare {Type} Side-by-Side | CareersCompus` | `Compare B.Tech vs BCA Side-by-Side | CareersCompus` |

### Meta Description Patterns
- Descriptions should be concise, compelling, and between **150-160 characters**.
- Example (Course): *"Discover everything about {Course Name}. Check eligibility criteria, syllabus, fee structure, and top offering universities in India on CareersCompus."*
- Example (University): *"Explore {University Name} admissions, fee structure, placement records, and available courses. Plan your higher education journey with CareersCompus."*

### Heading Hierarchy
- **H1:** Strictly ONE per page. Must match the primary topic (e.g., Course Name).
- **H2:** Major content sections (e.g., "Eligibility Criteria", "Top Universities").
- **H3:** Sub-sections within H2 (e.g., specific semester syllabus under "Curriculum").
- **Rule:** Strict nesting. Do not skip heading levels for styling purposes.

### Open Graph & Twitter Cards
- **OG:** `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (`website` or `article`).
- **Twitter:** `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`.
- Implement a high-quality default OG image for social sharing.
- Consider dynamic OG images (`@vercel/og`) for dynamic routes like Courses and Universities.

---

## 4. Structured Data (Schema.org)

Implement via JSON-LD injection in Next.js `<head>`.

### Organization (Sitewide)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CareersCompus",
  "url": "https://careerscompus.in",
  "logo": "https://careerscompus.in/images/logo.png"
}
```

### WebSite with SearchAction (Homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://careerscompus.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://careerscompus.in/search?q={search_term}",
    "query-input": "required name=search_term"
  }
}
```

### Course Pages
- Schema: `Course` or `EducationalOccupationalProgram`.
- Key properties: `name`, `description`, `provider`, `timeRequired`, `educationalLevel`.

### University Pages
- Schema: `CollegeOrUniversity`.
- Key properties: `name`, `address`, `foundingDate`, `accreditation`.

### Career Pages
- Schema: `Occupation`.
- Key properties: `name`, `description`, `skills`, `qualifications`.

### Shared Schemas
- **FAQ:** `FAQPage` schema on any page utilizing an FAQ accordion.
- **Breadcrumb:** `BreadcrumbList` schema on all pages to communicate site structure.

---

## 5. Content SEO

### Keyword Strategy (By Page Type)

**Course Detail Pages:**
- `{course name} eligibility`
- `{course name} fees`
- `{course name} top universities`
- `{course name} career scope`
- `{course name} vs {course name}`

**University Detail Pages:**
- `{university name} courses`
- `{university name} fees`
- `{university name} admissions`
- `{university name} placements`
- `{university name} ranking`

**Career Pages:**
- `how to become a {career}`
- `{career} salary in India`
- `{career} courses`
- `{career} skills required`

**Stream Pages:**
- `{stream} courses in India`
- `best {stream} universities`

### Internal Linking Strategy
- **Contextual Hubs:**
  - Course pages link to: related courses, universities offering them, relevant careers, and the parent stream.
  - University pages link to: offered courses, related universities (nearby or similar rank).
  - Career pages link to: recommended courses and relevant universities.
- **Structural Links:**
  - Contextual in-content links (not just isolated "related items" blocks).
  - Breadcrumbs provide clear hierarchical linking on every page.
  - Footer contains links to top-level categories and high-traffic streams.

---

## 6. Local SEO
- Incorporate location-based filtering for universities.
- Include structured address and location data on University pages.
- Future roadmap: Dedicated State/City landing pages (e.g., "Top Engineering Colleges in Maharashtra").

---

## 7. Analytics & Monitoring

### Google Search Console (GSC)
- Monitor indexing coverage and crawl stats.
- Track search performance (Clicks, Impressions, CTR, Position).
- Submit and monitor XML sitemaps.
- Monitor Core Web Vitals reports.

### Google Analytics 4 (GA4)
- Track page views, sessions, bounce rate, and user behavior flows.
- Monitor internal site search queries.
- Track macro conversions (counselling form submissions) and micro conversions (CTA clicks, WhatsApp initiates).

### Rank Tracking
- Use external tools (Ahrefs, Semrush, or SE Ranking) to monitor target keywords weekly.
- Track SERP features like Featured Snippets and People Also Ask.
- Monitor competitor ranking movements.

---

## 8. Implementation Checklist

### Pre-Launch
- [ ] Implement semantic HTML hierarchy across all templates.
- [ ] Configure `robots.txt` and static `sitemap.xml`.
- [ ] Implement dynamic sitemap generation for database entities.
- [ ] Add JSON-LD structured data to layout templates.
- [ ] Configure Next.js Metadata API for all routes.
- [ ] Optimize images with `next/image` and compress static assets.
- [ ] Set up 301 redirects for any legacy URLs (if migrating).
- [ ] Run Lighthouse audits for Performance and SEO scores (>90 required).

### Launch
- [ ] Verify production domain is accessible and SSL is active.
- [ ] Add site to Google Search Console and verify ownership.
- [ ] Submit XML sitemap in GSC.
- [ ] Verify GA4 tracking is active and receiving data.

### Ongoing (Weekly/Monthly)
- [ ] Review GSC Coverage report for indexing errors (Weekly).
- [ ] Analyze Search Performance data for keyword opportunities (Monthly).
- [ ] Audit Core Web Vitals and address any regressions (Monthly).
- [ ] Review and update out-of-date content (Quarterly).

---

## 9. Next.js SEO Implementation

### Metadata API Configuration
Next.js 14 App Router provides a powerful Metadata API.

**Static Metadata (`layout.tsx`):**
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | CareersCompus',
    default: 'CareersCompus | Find Your Direction',
  },
  description: 'Premium Indian higher-education and career discovery platform.',
  metadataBase: new URL('https://careerscompus.in'),
  // ... openGraph, twitter config
};
```

**Dynamic Metadata (`page.tsx`):**
```typescript
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const course = await getCourse(params.slug);
  return {
    title: `${course.name} — Eligibility, Fees, Universities`,
    description: `Discover everything about ${course.name}. Check eligibility criteria, syllabus, and fee structure.`,
  };
}
```

### Sitemap Generation (`app/sitemap.ts`)
```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://careerscompus.in';
  
  // Fetch dynamic routes
  const courses = await getCourseSlugs();
  const courseUrls = courses.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...courseUrls,
  ];
}
```

### Robots Configuration (`app/robots.ts`)
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://careerscompus.in/sitemap.xml',
  };
}
```

---

## 10. Performance & SEO Monitoring Dashboard

To maintain SEO excellence, monitor the following metrics using a combination of GSC, GA4, and Lighthouse/Vercel Analytics:

- **Organic Traffic:** Total sessions originating from search engines (GA4).
- **Indexation Rate:** Ratio of submitted pages vs. indexed pages (GSC).
- **Average Position:** Sitewide ranking average for non-branded queries (GSC).
- **Core Web Vitals:** Focus strictly on Mobile performance scores.
- **Click-Through Rate (CTR):** Optimize titles and descriptions for pages with high impressions but low CTR.
- **Review Cadence:** Weekly check of GSC errors; Monthly deep-dive into traffic and ranking trends.
