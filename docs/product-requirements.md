# Product Requirements Document (PRD)
**Product Name:** CareersCompus
**Domain:** [https://careerscompus.in](https://careerscompus.in)
**Tagline:** Find Your Direction
**Status:** DRAFT

## 1. Product Overview
CareersCompus is a premium Indian higher-education and career discovery platform designed to help students discover their direction. Merging the concepts of "Careers" and "Compass", the platform serves as an intelligent, trustworthy, and modern guide through the complex landscape of education and professional development.

*   **Target Audience:** Indian students (ages 16-28) exploring higher education and career paths.
*   **Secondary Audience:** Parents researching options for their children, and working professionals seeking upskilling or career changes.
*   **Product Category:** Education discovery and Career exploration platform.

## 2. Problem Statement
The Indian education discovery space is currently broken. Students face fragmented, outdated, and often biased information. Existing platforms resemble cluttered coaching-centre websites rather than modern technological solutions.
*   **Disconnect:** No single platform cleanly connects the crucial journey of Career → Course → University → Admission.
*   **Trust Deficit:** Students lack trustworthy, objective comparison tools to evaluate their options.
*   **Misguided Focus:** Career discovery is typically an afterthought, with platforms pushing courses rather than helping students find their true calling first.

## 3. Product Vision
To be the most trusted, modern, and intelligent education and career discovery platform in India. We aim to connect the entire educational journey seamlessly: **Career Discovery → Course Selection → University Comparison → Admission Guidance**, wrapped in a premium, venture-backed quality user experience.

## 4. Core Value Propositions
1.  **Career-First Discovery:** A unique approach that starts with the end goal (what you want to become) rather than just what to study.
2.  **Comprehensive Course Catalogue:** Deep, structured data on 1000+ courses across various streams.
3.  **Verified University Discovery:** Trustworthy, fact-checked data for 300+ universities.
4.  **Intelligent Comparison:** Side-by-side objective comparison tools for both courses and universities.
5.  **Expert Counselling:** Free, transparent, and non-manipulative guidance for students.
6.  **Premium Experience:** Clean, aspirational, technology-driven design language (akin to Stripe, Linear, Apple) that builds immediate trust.

## 5. User Personas

### Persona 1: The Explorer (Class 12 Student)
*   **Name:** Rahul (17)
*   **Goal:** Figuring out what to do after 12th Science.
*   **Pain Points:** Overwhelmed by parental pressure and peer choices. Doesn't know what careers are actually viable beyond traditional Engineering/Medical.
*   **Needs:** Visual career paths, simple explanations of courses, engaging UI (3D Career Compass), mobile-friendly experience.

### Persona 2: The Advancer (Graduate Student)
*   **Name:** Priya (21)
*   **Goal:** Finding the right MBA specialization and top B-schools.
*   **Pain Points:** Existing sites have fake placement stats and spammy lead forms. Needs authentic ROI data.
*   **Needs:** Deep comparison tools, detailed curriculum breakdowns, alumni network information, clear admission criteria.

### Persona 3: The Investor (Parent)
*   **Name:** Sharma Ji (48)
*   **Goal:** Ensuring his daughter gets into a reputed, safe university with good placements.
*   **Pain Points:** Worried about fake universities and hidden fees. Needs reliable rankings and contact details.
*   **Needs:** Trust signals, clear fee structures, campus facilities, easy way to book a counselling call (WhatsApp/Phone).

### Persona 4: The Pivot (Working Professional)
*   **Name:** Amit (26)
*   **Goal:** Transitioning from Sales to Data Analytics via an executive course.
*   **Pain Points:** Time-poor, needs flexible or executive options. Hard to separate genuine upskilling from diploma mills.
*   **Needs:** Filter by part-time/executive, career outcomes, quick enquiry process.

## 6. Core Features

### P0 (Launch - MVP)
*   **Homepage:** Premium landing page with interactive 3D Career Compass hero, quick-link tags, and trust signals.
*   **Course Catalogue:** Paginated listings with stream filters.
*   **University Catalogue:** Paginated listings with location/stream filters.
*   **Detail Pages:** Comprehensive Course and University pages with structured data (Breadcrumbs, About, Eligibility, Curriculum).
*   **Career Pages:** Dedicated pages detailing career paths, required skills, and linked courses.
*   **Global Search:** Accessible from the header.
*   **Counselling Flow:** Multi-step, user-friendly enquiry form present across the site.
*   **Static Pages:** About, Contact, Terms, Privacy.
*   **Technical Foundation:** Responsive design, basic SEO optimization, fast load times.

### P1 (Post-Launch - Fast Follows)
*   **Comparison Tool:** Side-by-side comparison for up to 3 courses or universities.
*   **Stream Landing Pages:** Dedicated hubs for Engineering, Management, Medical, etc.
*   **Advanced Search:** Autocomplete, typo-tolerance, and rich visual results.
*   **Admin Dashboard:** Headless CMS/Admin panel for content management.
*   **Lead Management:** Basic CRM integration for counselling leads.
*   **WhatsApp Integration:** Direct chat capability for instant support.

### P2 (Future Expansion)
*   **User Accounts:** Ability to save courses, universities, and careers.
*   **Career Assessment Quiz:** Interactive tool to recommend paths.
*   **Personalized Recommendations:** ML-driven suggestions based on browsing history.
*   **University Reviews:** Verified alumni reviews.
*   **Mobile App:** Native iOS/Android applications.
*   **Push Notifications/Alerts:** Admission deadline reminders.

## 7. Success Metrics
*   **Engagement:** Monthly Active Users (MAU), Average Session Duration, Pages per Session.
*   **Content:** Course/University page views.
*   **Conversion:** Number of counselling requests (Lead generation volume and quality).
*   **Feature Adoption:** Search usage rate, Comparison tool usage rate.
*   **Technical/Marketing:** Core Web Vitals scores, SEO ranking improvements for target keywords.

## 8. Non-Functional Requirements
*   **Performance:** LCP (Largest Contentful Paint) < 2.5s, FID (First Input Delay) < 100ms, CLS (Cumulative Layout Shift) < 0.1.
*   **Accessibility:** Target WCAG 2.1 AA compliance.
*   **SEO:** Server-Side Rendering (SSR) for all content pages, rich structured data (JSON-LD), clean and semantic URLs.
*   **Security:** Enforced HTTPS, strict input sanitization, rate limiting on APIs/forms.
*   **Scalability:** Architecture capable of supporting 10K+ concurrent users without degradation.
*   **Browser Support:** Last 2 versions of Chrome, Firefox, Safari, Edge (Desktop and Mobile).

## 9. Assumptions & Constraints
*   **Content Assumption:** Initial content will be entirely admin-managed and editorially verified to ensure premium quality. No user-generated content (UGC) in v1.
*   **Resource Constraint:** Course and university data requires manual editorial verification before publishing.
*   **Scope Constraint:** No payment processing or transactional features will be built in v1.
*   **Design Constraint:** Visual identity must strictly adhere to the premium, aspirational guidelines.

## 10. Out of Scope for v1
*   Hosting or selling online courses/LMS capabilities.
*   Direct application submission to universities through the platform.
*   Dedicated University dashboards or B2B portals.
*   Payment gateway integration.
*   Real-time peer-to-peer chat or community forums.
