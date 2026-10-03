# CareersCompus Content Model & Strategy

This is the central **Content Model** document for CareersCompus — a premium Indian education and career discovery platform. It serves as the single source of truth for content structures, governance, verifiability, and brand voice.

---

## 1. Content Philosophy
- **Accuracy over volume**: Quality and reliability trump having the most pages.
- **Verifiable Data**: Every piece of quantitative data should be verifiable against an authoritative source.
- **Admin-Managed**: Content is strictly curated by the internal team (no user-generated content in v1).
- **Fact vs. Editorial**: Clear distinction between editorial guidance (e.g., career outlook) and factual data (e.g., fee structures).
- **Transparent Sourcing**: Always display 'Last updated', 'Source', and links to 'Official website' where appropriate to build trust.
- **Zero Fabrication**: No fabricated statistics, fake rankings, or synthetic reviews. Integrity is a core differentiator.

---

## 2. Content Entities

### Course Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| name | String | Yes | N/A | Admin | 'B.Tech Computer Science' |
| slug | String | Yes (auto) | N/A | System | 'btech-computer-science' |
| stream | Relation | Yes | N/A | Admin | Engineering & Technology |
| level | Enum | Yes | N/A | Admin | UNDERGRADUATE |
| duration | String | Yes | Yes | University websites | '4 Years' |
| description | Rich Text | Yes | N/A | Editorial | Overview paragraph |
| eligibility | Rich Text | Yes | Yes | University websites, exam bodies | '10+2 with PCM, min 50%' |
| feeRangeMin | Number | No | Yes | University websites | 50000 |
| feeRangeMax | Number | No | Yes | University websites | 2000000 |
| subjects | String[] | No | Yes | UGC/University curricula | ['Data Structures', 'AI'] |
| curriculum | JSON | No | Yes | University curricula | Semester-wise breakdown |
| specialisations | String[] | No | Yes | University websites | ['AI/ML', 'Cybersecurity'] |
| entranceExams | Relation[] | No | Yes | Exam conducting bodies | [JEE Main, JEE Advanced] |
| careerOpportunities | Rich Text | No | Partially | Industry data | Description of career paths |
| averageSalaryMin | Number | No | Partially | Industry surveys | 400000 |
| averageSalaryMax | Number | No | Partially | Industry surveys | 2500000 |
| salaryDisclaimer | String | Conditional| N/A | System default | 'Indicative figures. Actual salary varies...' |
| admissionProcess | Rich Text | No | Yes | University websites | Step-by-step admission flow |
| metaTitle | String | Yes | N/A | Editorial/System | SEO title |
| metaDescription | String | Yes | N/A | Editorial/System | SEO description |
| lastVerified | DateTime | No | N/A | Admin | 2024-06-15 |
| sourceUrl | String | No | N/A | Admin | Official source |
| relatedCourses | Relation[] | No | N/A | Editorial | Similar courses |
| relatedCareers | Relation[] | No | N/A | Editorial | Connected careers |
| universities | Relation[] | No | N/A | Admin | Universities offering this course |
| faqs | Relation[] | No | N/A | Editorial | Course-specific FAQs |

### University Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| name | String | Yes | Yes | Official Website | 'Indian Institute of Technology Madras' |
| slug | String | Yes (auto) | N/A | System | 'iit-madras' |
| type | Enum | Yes | Yes | UGC | PRIVATE, PUBLIC, DEEMED |
| location | JSON | Yes | Yes | Official Website | { city: 'Chennai', state: 'Tamil Nadu' } |
| establishedYear | Number | Yes | Yes | Official Website | 1959 |
| description | Rich Text | Yes | N/A | Editorial | University overview |
| accreditation | String[] | No | Yes | NAAC, NBA, UGC | ['NAAC A++', 'UGC Approved'] |
| nirfRanking | Number | No | Yes | NIRF Portal | 1 |
| coursesOffered | Relation[] | Yes | Yes | University Prospectus| [B.Tech, M.Tech, MBA] |
| feeRangeMin | Number | No | Yes | Official Website | 100000 |
| feeRangeMax | Number | No | Yes | Official Website | 1200000 |
| admissionProcess | Rich Text | Yes | Yes | Official Website | Process description |
| entranceExams | Relation[] | No | Yes | Official Website | [JEE Advanced, GATE] |
| scholarships | Rich Text | No | Yes | Official Website | Merit and need-based info |
| placementData | JSON | No | Yes | Official Reports | { highestLPA: 131, averageLPA: 21.4 } |
| placementDisclaimer| String | Conditional| N/A | System Default | 'Placement data is indicative...' |
| campusInfo | Rich Text | No | Yes | Official Website | 617-acre campus description |
| facilities | String[] | No | Yes | Official Website | ['Library', 'Labs', 'Sports Complex'] |
| hostelInfo | Rich Text | No | Yes | Official Website | Accommodation details |
| contactInfo | JSON | No | Yes | Official Website | { phone: '...', email: '...' } |
| websiteUrl | String | Yes | Yes | Web Search | 'https://www.iitm.ac.in/' |
| logo | URL/String| Yes | Yes | Official Assets | S3/CDN link |
| images | URL[] | No | Yes | Official Assets | S3/CDN links |
| faqs | Relation[] | No | N/A | Editorial | University-specific FAQs |
| metaTitle | String | Yes | N/A | Editorial | SEO title |
| metaDescription | String | Yes | N/A | Editorial | SEO description |
| lastVerified | DateTime | Yes | N/A | Admin | 2024-06-15 |
| sourceUrl | String | Yes | N/A | Admin | 'https://nirfindia.org/...' |

**IMPORTANT:** For placement data, ALWAYS include:
- Disclaimer: 'Placement data is indicative and sourced from publicly available information. Verify with the university.'
- `sourceUrl` field
- `lastVerified` field

### Career Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| name | String | Yes | N/A | Editorial | 'Data Scientist' |
| slug | String | Yes (auto) | N/A | System | 'data-scientist' |
| description | Rich Text | Yes | N/A | Editorial | General overview |
| whatItInvolves | Rich Text | Yes | N/A | Editorial | Day-to-day responsibilities |
| dayInTheLife | Rich Text | No | N/A | Editorial | Narrative schedule |
| skillsRequired | String[] | Yes | Partially | Industry reports | ['Python', 'Machine Learning', 'SQL'] |
| educationPath | Rich Text | Yes | N/A | Editorial | Step-by-step educational requirements |
| recommendedCourses| Relation[] | No | N/A | System/Admin | [B.Tech CS, B.Sc Statistics] |
| recommendedDegrees| String[] | No | N/A | Editorial | ['B.Tech', 'M.Tech', 'B.Sc'] |
| entranceExams | Relation[] | No | N/A | System/Admin | [JEE Main, GATE] |
| relevantStreams | Relation[] | Yes | N/A | System/Admin | [Engineering & Technology, Science] |
| averageSalaryMin | Number | No | Partially | Industry Surveys | 600000 |
| averageSalaryMax | Number | No | Partially | Industry Surveys | 3000000 |
| salaryDisclaimer | String | Conditional| N/A | System Default | 'Indicative figures...' |
| careerProgression | JSON | No | Partially | Industry Trends | { Junior: 'Analyst', Mid: 'Scientist', Senior: 'Lead' } |
| growthOutlook | Rich Text | No | Partially | Econ/Industry Data| '35% growth expected by 2030...' |
| workEnvironment | String[] | No | N/A | Editorial | ['Office', 'Hybrid', 'High-pressure'] |
| relatedCareers | Relation[] | No | N/A | Editorial | [Machine Learning Engineer, Data Analyst] |
| faqs | Relation[] | No | N/A | Editorial | Career FAQs |
| metaFields | JSON | Yes | N/A | Editorial/System | SEO data |

### Stream Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| name | String | Yes | N/A | Editorial | 'Engineering & Technology' |
| slug | String | Yes (auto) | N/A | System | 'engineering-and-technology' |
| description | Rich Text | Yes | N/A | Editorial | Broad domain overview |
| icon | String | Yes | N/A | Design Assets | Lucide Icon name / SVG path |
| color | String | No | N/A | Design System | '#3B82F6' (tailwind-blue-500) |
| featuredImage | URL | Yes | N/A | Design Assets | Hero image for stream page |
| popularCourses | Relation[] | No | N/A | Admin | Top 5 courses in stream |
| popularCareers | Relation[] | No | N/A | Admin | Top 5 careers in stream |
| metaFields | JSON | Yes | N/A | Editorial/System | SEO data |

### EntranceExam Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| name | String | Yes | Yes | Official Body | 'JEE Main' |
| slug | String | Yes (auto) | N/A | System | 'jee-main' |
| fullName | String | Yes | Yes | Official Body | 'Joint Entrance Examination - Main' |
| description | Rich Text | Yes | N/A | Editorial | Exam purpose and overview |
| conductingBody | String | Yes | Yes | Official Body | 'National Testing Agency (NTA)' |
| examLevel | Enum | Yes | Yes | Official Body | NATIONAL, STATE, UNIVERSITY |
| examMode | String | Yes | Yes | Official Body | 'Computer Based Test (CBT)' |
| eligibility | Rich Text | Yes | Yes | Exam Brochure | '10+2 with PCM...' |
| applicationFee | JSON | No | Yes | Exam Brochure | { General: 1000, SC/ST: 500 } |
| importantDates | JSON | No | Yes | Official Site | { registration: '...', examDate: '...' } |
| syllabus | Rich Text | No | Yes | Official Site | Link or summary of topics |
| officialWebsite | String | Yes | Yes | Web Search | 'https://jeemain.nta.nic.in/' |
| preparationTips | Rich Text | No | N/A | Editorial | Study strategies |
| relatedCourses | Relation[] | No | N/A | System/Admin | [B.Tech, B.E., B.Arch] |
| relatedUniversities| Relation[] | No | N/A | System/Admin | [NITs, IIITs, GFITs] |

### FAQ Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| question | String | Yes | N/A | Editorial | 'What is the average package at IIT Madras?' |
| answer | Rich Text | Yes | Conditional| Depends on topic | 'The average package is...' |
| category | String | No | N/A | Editorial | 'Placements', 'Admissions' |
| order | Number | Yes | N/A | Admin | 1 |
| associatedEntity | Polymorphic| Yes | N/A | Admin | [Type: 'University', ID: 123] |

### Enquiry/Lead Content Model

| Field | Type | Required | Verifiable | Source | Example |
|---|---|---|---|---|---|
| name | String | Yes | N/A | User Input | 'Rahul Sharma' |
| email | String | Yes | N/A | User Input | 'rahul@example.com' |
| phone | String | Yes | N/A | User Input | '+919876543210' |
| currentEducation | Enum | Yes | N/A | User Input | CLASS_12 |
| interestedStream | String/Rel| No | N/A | User Input | 'Engineering' |
| interestedCourse | String/Rel| No | N/A | User Input | 'B.Tech' |
| interestedUniversity| String/Rel| No | N/A | User Input | 'VIT Vellore' |
| preferredState | String | No | N/A | User Input | 'Karnataka' |
| preferredCity | String | No | N/A | User Input | 'Bangalore' |
| message | Text | No | N/A | User Input | 'I want to know about management quota...' |
| source | String | Yes | N/A | System | '/university/vit-vellore (Sidebar Form)' |
| utmSource | String | No | N/A | URL Params | 'google' |
| utmMedium | String | No | N/A | URL Params | 'cpc' |
| utmCampaign | String | No | N/A | URL Params | 'btech_admissions_2024' |
| status | Enum | Yes | N/A | System/Admin | NEW, CONTACTED, CONVERTED, CLOSED |
| assignedTo | String/Rel| No | N/A | Admin | 'Counselor_01' |
| notes | Text[] | No | N/A | Admin | Internal progress notes |
| followUpDate | DateTime | No | N/A | Admin | 2024-07-01T10:00:00Z |

---

## 3. Content Verification Framework

To maintain premium positioning, CareersCompus strictly verifies factual data.

### Authoritative Sources
| Data Type | Authoritative Source |
|---|---|
| University accreditation | UGC, NAAC, NBA official websites |
| Course eligibility | University prospectus, exam body websites |
| Fee information | University official fee structure pages |
| Entrance exam details | Conducting body official website |
| NIRF Rankings | NIRF official portal (nirfindia.org) |
| Placement data | University official placement reports |
| Scholarship info | Scholarship provider official source |

### Verification Workflow
1. **Data Entry**: Admin/Editor inputs data.
2. **Citation Requirement**: Any field marked "Verifiable" requires a `sourceUrl`.
3. **Approval**: Senior Content Manager reviews the draft against the `sourceUrl`.
4. **Publish & Stamp**: On approval, the system stamps the entity with `lastVerified` = `NOW()`.

### Staleness Rules
- **Fees & Eligibility**: Flag for review every 6 months (pre-admission cycles).
- **Exam Dates**: Flag for review monthly during active application windows.
- **Rankings & Placements**: Flag for update annually (July/August for NIRF, September for Placements).

---

## 4. Content Tone & Voice

### Brand Voice
- **Confident but not arrogant**: Authoritative, yet accessible.
- **Informative but not academic**: Digestible formatting, no walls of text.
- **Friendly but not casual**: Professional empathy.
- **Encouraging but not pushy**: Counsel rather than sell.
- **Specific but not overwhelming**: Provide key facts, hide deep details behind tabs/accordions.

### Writing Guidelines
- Use **active voice** (e.g., "The university offers...", not "Courses are offered by...").
- Short paragraphs (**3-4 sentences max**).
- Extensive use of **bullet points** for readability.
- Clean section headings (`h2`, `h3`).
- Explain jargon gracefully on first use.
- Indian English spelling (e.g., *programme, counselling, centre*).

### Content Templates

**1. Course Overview Paragraph**
> [Course Name] is a [Duration] undergraduate/postgraduate programme that prepares students for careers in [Industry/Field]. The curriculum focuses on [Key Subject 1] and [Key Subject 2], bridging the gap between theoretical knowledge and practical application. It is ideal for students who possess [Key Skill] and have an aptitude for [Interest Area].

**2. University Overview Paragraph**
> Established in [Year], [University Name] is a premier [Public/Private] institution located in [City, State]. Accredited by [Accreditations] and ranked [NIRF Rank] by NIRF, the campus spans [Size] acres and is equipped with state-of-the-art facilities. The university is renowned for its [Top Stream/Department] programmes and robust industry connections.

**3. Career Overview Paragraph**
> A career as a [Career Name] involves [Primary Responsibility 1] and [Primary Responsibility 2] to drive [Core Outcome]. Professionals in this field blend [Skill 1] with [Skill 2] to solve complex challenges in [Industry]. With the rapid adoption of [Relevant Trend/Tech], demand for skilled [Career Plural] is experiencing significant growth.

---

## 5. Content Governance

### Roles
- **Content Admin**: Unrestricted access. Can configure templates, taxonomies, and manage users.
- **Editor**: Can draft, edit, and update content. Cannot publish without review.
- **Reviewer**: Can approve, reject, and publish content. Typically a domain expert.
- **Viewer**: Read-only access to internal admin panel.

### Update Triggers
- **March–July**: University admission season updates (forms, fees, new courses).
- **August–September**: Placement reports and NIRF ranking updates.
- **October–December**: Major entrance exam notifications (JEE, CAT, CLAT).

---

## 6. Data Disclaimers

Standardized, legally and ethically sound disclaimers to be appended automatically:

1. **Fee Disclaimer**: "Fees shown are indicative and may vary. Please verify with the university's official prospectus."
2. **Salary Disclaimer**: "Salary figures are indicative estimates based on industry data and surveys. Actual compensation varies significantly based on skill, experience, location, and employer."
3. **Placement Disclaimer**: "Placement data is sourced from publicly available information and official reports. Actual figures for the current batch may differ."
4. **Ranking Disclaimer**: "Rankings are sourced from official NIRF data. Other institutional or magazine rankings may differ."
5. **General Verification**: "Information on this page was last verified on {date}. For the absolute latest information, please visit the official website."

---

## 7. Seed Data Strategy

To prevent a "blank slate" experience and ensure the platform looks premium from day one, we will roll out content in phases.

### Phase 1 (MVP)
- **Streams**: 15 main streams (Engineering, Medical, Management, Law, etc.)
- **Courses**: Top 50 high-traffic courses (B.Tech CS, MBBS, MBA Finance, B.A. LLB).
- **Universities**: 30 premier institutions (Top IITs, IIMs, NITs, and elite private colleges like BITS, VIT).
- **Careers**: 30 aspirational profiles (Data Scientist, Corporate Lawyer, Investment Banker).
- **Exams**: 10 major national-level exams (JEE, NEET, CAT, CLAT).

### Phase 2 (Growth)
- Scale to **200+ courses**.
- Scale to **100+ universities** (adding top state universities).
- Scale to **75+ careers**.
- Cover all major state-level entrance exams (MHT CET, KCET, etc.).

### Phase 3 (Scale)
- Comprehensive database: 1000+ courses, 300+ universities.
- Highly granular career mapping.
- Deep state-level and tier-2 city institution data.

### Seed Data Format (For bulk Prisma import)
Data should be collected in normalized CSVs or JSON.
Example JSON structure for a university import script:
```json
{
  "name": "Indian Institute of Technology Bombay",
  "slug": "iit-bombay",
  "location": { "city": "Mumbai", "state": "Maharashtra" },
  "establishedYear": 1958,
  "accreditation": ["UGC"],
  "nirfRanking": 3,
  "websiteUrl": "https://www.iitb.ac.in",
  "lastVerified": "2024-03-01T00:00:00Z"
}
```
