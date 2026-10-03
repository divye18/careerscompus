# CareersCompus - Homepage Wireframe & Specification

**Document Type:** Design & Implementation Specification
**Project:** CareersCompus (https://careerscompus.in)
**Purpose:** Provide a comprehensive, pixel-perfect blueprint for the Homepage architecture and UI components.

## Design System Overview

*   **Design Philosophy:** "Premium editorial education technology"
*   **Brand Identity:** Intelligent, trustworthy, aspirational, modern, youthful, technology-driven
*   **Typography:**
    *   Headlines: **Plus Jakarta Sans** (Weights: 600, 700, 800)
    *   Body/UI: **Inter** (Weights: 400, 500, 600)
*   **Color Palette:**
    *   Primary: Deep Blue (`#1E3A5F`, `#0F172A`)
    *   Accent: Teal (`#0EA5E9`, `#06B6D4`)
    *   Backgrounds: White (`#FFFFFF`), Off-white (`#F8FAFC`, `#F1F5F9`)
    *   Text: Dark Slate (`#334155`, `#64748B`, `#94A3B8`)
*   **Quality References:** Apple, Stripe, Linear, Vercel

---

## Global Layout & Behaviors

*   **Section Spacing:** 96px between sections (desktop) / 64px (mobile)
*   **Internal Padding:** 96px vertical padding per section (desktop) / 48px (mobile)
*   **Scroll Animations:**
    *   IntersectionObserver-triggered animations for all sections.
    *   Default behavior: Fade-up (`translateY(20px)` → `0`, `opacity 0` → `1`), 500ms duration, ease-out timing function.
    *   Lists/Grids (Cards): Staggered entrance by 75ms each.
    *   *Accessibility Note:* Must respect `prefers-reduced-motion` media queries (disable transforms, keep simple opacity fades or instant appearance).

---

## Section 1: Global Navigation

### Desktop (>= 1024px)
*   **Behavior:** Fixed/sticky on scroll with backdrop blur.
*   **Height:** 64px (Reduces to 56px with a subtle shadow on scroll).
*   **Background:** White with a subtle bottom border (`1px solid #E2E8F0`).

| Position | Element | Specification |
| :--- | :--- | :--- |
| **Left** | Logo Wordmark | "CareersCompus" / Plus Jakarta Sans, 600, 20px, Primary Blue |
| **Center** | Navigation Links | Home, Courses (Mega Menu), Universities (Mega Menu), Careers, Compare / Inter 500, 14px, `#334155`, Hover: Primary Blue |
| **Right** | Search Icon | Lucide Search (20px), Ghost button style |
| **Right** | CTA Button | "Get Guidance" / Primary button, small size, Teal background |

#### Courses / Universities Mega Menu (Hover/Click)
*   **Layout:** Full-width dropdown, max-width 1280px, centered.
*   **Content (Left):** Stream categories (Engineering, Medical, Management, etc.) with accompanying Lucide icons.
*   **Content (Right):** Popular programs/entities with brief metadata.
*   **Footer:** "View All [Category] →" link.
*   **Animation:** Fade in + slide down (`translateY(-10px)` → `0`), 200ms duration.

### Mobile (< 1024px)
*   **Layout:** Logo left, hamburger icon right, search icon positioned before hamburger.
*   **Interaction:** Hamburger opens a full-screen dark overlay.
*   **Overlay Design:** Dark background, white text. Large navigation items (20px). Staggered animation entry.
*   **Sub-menus:** Accordion-style expanders for Courses/Universities.
*   **Bottom:** Sticky "Get Guidance" full-width CTA button.
*   **Close Action:** Top-right 'X' icon.

---

## Section 2: Hero / Career Compass

### Concept
The hero visually communicates "Find Your Direction" (Careers + Compass). The centerpiece is an interactive 3D "Career Compass".

### Layout: Desktop (>= 1024px)
*   **Dimensions:** `calc(100vh - 64px)` minimum height.
*   **Grid:** Two-column split (60% Text / 40% 3D Visualization).

**Left Column (Typography & CTA):**
*   **Overline:** "DISCOVER YOUR PATH" (11px, uppercase, Teal, letter-spacing 2px, Inter 600).
*   **Headline:** "Find Your \n Direction" (Display size, 60-72px, Plus Jakarta Sans 800, `#0F172A`).
*   **Subtitle:** "Explore careers, compare courses, discover universities — and chart your future with confidence." (18px, Inter 400, `#64748B`, max-width 520px).
*   **CTA Row:**
    *   Primary: "Explore Careers" (Teal bg, White text, `px-8 py-3`, rounded-lg).
    *   Secondary: "Browse Courses" (Outline style, border `#CBD5E1`, text `#334155`).
*   **Trust Indicator:** "✔ Trusted by 50,000+ students" (14px, `#94A3B8`, placed below CTAs).

**Right Column (3D Visualization):**
*   **Container:** Canvas element, ~500x500px visible area.
*   **Elements:** Abstract central geometric compass (wireframe dodecahedron/torus knot) surrounded by floating career domain labels (Technology, Engineering, Medicine, etc.).
*   **Label Styling:** Pill-shaped, semi-transparent white bg, backdrop-blur, 13px Inter 500.
*   **Interactivity:**
    *   Slow orbital movement on 3 depth layers (parallax).
    *   Mouse tracking (labels drift max 20px based on cursor).
    *   Hover state: Scale up (1.05), glow effect, connection line to center highlights while others dim.
*   **Fallbacks:** CSS-only static constellation for WebGL failure; completely static layout for `prefers-reduced-motion`.

### Layout: Tablet (768px - 1023px)
*   **Grid:** Tighter two-column (55% / 45% split).
*   **Sizing:** Headline 48px; 3D area 400px height.

### Layout: Mobile (< 768px)
*   **Grid:** Single column, stacked. Text centered.
*   **Sizing:** Headline 36-40px; Subtitle 16px. CTAs stack vertically full-width.
*   **Visual:** Simplified 3D area (300px height, fewer labels, auto-orbit only, no mouse tracking) or replaced with premium static illustration.

---

## Section 3: Global Search Bar

### Layout
*   **Position:** Below hero (can overlap slightly with negative margin).
*   **Container:** Centered, max-width 720px. White card background, elevation level 2 (shadow), `rounded-xl` (16px), 8px padding.

### Search Input
*   **Sizing:** Height 56px, 16px body text.
*   **Placeholder:** Cycling animation ("Search courses...", "Search universities...", "Search careers...").
*   **Icon:** Lucide Search on the inside left.
*   **Focus State:** Input border transitions to Teal, subtle card scale (`1.01`).

### Quick Tags
*   **Position:** Row directly below the search card.
*   **Items:** MBA, B.Tech, MBBS, BCA, LLB, IIT Delhi, Data Science, etc.
*   **Style:** Small pills, bg `#F1F5F9`, text `#334155`, 13px. Hover: bg Teal/10%, text Teal.

### Autocomplete Dropdown
*   **Trigger:** On type.
*   **Container:** White card, elevation 3, max-height 400px, absolute positioned below input.
*   **Content:** Results grouped by category (Courses, Universities, Careers). Features icons, names, and brief context (stream/location).
*   **Empty State:** Shows "Popular Searches" and "Recent Searches".

---

## Section 4: Career Exploration

### Section Header
*   **Overline:** "CAREER DISCOVERY" (Teal, uppercase, tracked).
*   **Headline:** "What do you want to become?" (H2, 36px, Plus Jakarta Sans 700).
*   **Subtitle:** "Start with a career goal and we'll help you find the right course and university." (16px, `#64748B`).

### Layout & Cards
*   **Grid:** 4 columns (desktop) / 2 columns (tablet) / 1 column (mobile).
*   **Item Count:** 8-12 career cards.
*   **Card Design:**
    *   White bg, 1px border `#E2E8F0`, `rounded-xl`, padding 24px.
    *   Top: Lucide icon (24px) centered in a 48px circle (Teal/10% bg).
    *   Title: Career name (16px, 600 weight).
    *   Description: 2-line excerpt (14px, `#64748B`).
    *   Bottom: "Explore path →" link (14px, Teal, 500 weight).
*   **Interaction:** Hover triggers `translateY(-4px)`, shadow elevation 2, border-color Teal/20%.

---

## Section 5: Popular Streams

### Section Header
*   **Headline:** "Explore by Stream" (H2, 36px).
*   **Subtitle:** "Browse courses organized by academic discipline".

### Layout & Cards
*   **Grid:** Horizontal scrollable row with snap (mobile/tablet), or 4x2 grid (desktop).
*   **Card Design:**
    *   Dimensions: ~180px width, ~160px height.
    *   Background: Subtle gradient from stream's theme color (5% to 10% opacity).
    *   Center: Stream icon (Lucide, 32px).
    *   Name: 16px, 600 weight.
    *   Meta: Course count (e.g., "45 Courses", 13px, `#94A3B8`).
*   **Interaction:** Minimal borders. Hover intensifies background gradient and scales icon slightly (`1.1`).

---

## Section 6: Featured Courses

### Section Header
*   **Headline:** "Popular Courses" (H2).
*   **Action:** Right-aligned "View all courses →" link.

### Layout & Cards
*   **Grid:** 4 columns (desktop) / 2 columns (tablet) / 1 column (mobile). Shows 8 cards.
*   **Card Design:**
    *   Container: White bg, `rounded-xl`, 1px border, `overflow-hidden`.
    *   Top: Stream badge (solid pill, stream color) + Level badge (outline pill) - 11px font.
    *   Title: Course name (18px, 600 weight, line-clamp 2).
    *   Details Row: Duration (icon + text) | Fees (icon + text).
    *   Bottom: "View Details →" link (14px, Teal).
*   **Interaction:** Card lift and increased shadow on hover.

---

## Section 7: University Discovery

### Section Header
*   **Headline:** "Top Universities" (H2).
*   **Subtitle:** "Explore India's leading institutions".
*   **Action:** Right-aligned "View all universities →" link.

### Layout & Cards
*   **Grid:** 4 columns (desktop) / 2 columns (tablet) / scroll row (mobile). Shows 8 cards.
*   **Card Design:**
    *   Container: White bg, `rounded-xl`, border.
    *   Top: University logo (48x48, rounded-md), Name (16px, 600), Location (14px, `#94A3B8`).
    *   Middle: Type badge (e.g., "Private"), Accreditation badge (e.g., "A++ NAAC").
    *   Stats: Courses offered count | Established year.
    *   Bottom: "Explore →" link.

---

## Section 8: Compare CTA

### Layout
*   **Container:** Full-width section. Background: `#F8FAFC` or very light gradient.
*   **Grid:** 50/50 two-column split.
*   **Left (Text):**
    *   Headline: "Compare Before You Choose" (H2, 36px).
    *   Body: "Not sure which course or university is right for you? Compare fees, eligibility, duration, and career outcomes side by side." (16px, `#64748B`).
    *   CTA: "Start Comparing →" (Primary button).
*   **Right (Visual):** Stylized UI mockup card showing "Course A vs Course B" comparison rows, or a high-quality abstract illustration.

---

## Section 9: How CareersCompus Works

### Layout
*   **Grid:** 4-step horizontal timeline (desktop); vertical timeline (mobile).
*   **Step Elements:** Number in circle (Teal), connector line, Title, Description.

### Content
1.  **Discover Your Career:** "Explore career paths and find what excites you"
2.  **Find the Right Course:** "Match your career goals with the perfect academic programme"
3.  **Compare Universities:** "Evaluate institutions by fees, placements, and accreditation"
4.  **Get Expert Guidance:** "Connect with our counsellors for personalized admission support"

### Visuals
*   **Connectors:** Dashed or thin solid `#E2E8F0` lines.
*   **Animation:** Scroll-triggered progression (active step highlights Teal as user scrolls).

---

## Section 10: Counselling CTA

### Layout
*   **Container:** Dark theme (Background `#0F172A` or deep primary blue).
*   **Grid:** Two-column split.
*   **Left (Text):**
    *   Overline: "FREE CAREER COUNSELLING"
    *   Headline: "Not sure where to start?" (H2, White, 36px)
    *   Body: "Our expert counsellors will help you find the perfect course based on your interests, marks, budget, and career goals." (16px, `#94A3B8`)
    *   Trust points: "✔ 100% Free", "✔ No spam", "✔ Expert counsellors" (Row layout, 14px, `#CBD5E1`).
*   **Right (Form/Action):**
    *   Quick Form Card: Dark card bg (slightly lighter than section bg). Contains Name input, Phone input, "Interest" dropdown, and full-width Teal "Get Free Guidance" button.
    *   *Alternative:* A large "Start Guided Journey →" button linking to `/counselling`.

---

## Section 11: Trust / Statistics

### Layout
*   **Container:** Centered, 4-column grid. White or subtle patterned background.
*   **Stats Data (Dynamic/Realistic mapping):**
    *   `1,200+` / Courses Listed
    *   `300+` / Universities
    *   `100+` / Career Paths
    *   `50,000+` / Students Guided
*   **Styling:** Numbers are Display size (48px), Plus Jakarta Sans 800, Primary Blue (optional subtle gradient text). Labels are 14px, Inter 400, `#64748B`.
*   **Animation:** Intersection Observer count-up animation (fires once).

### Trust Badges (Below Stats)
*   **Row Layout:** 4 items.
*   **Badges:** Verified Information, Free Counselling, 100% Secure, Expert Team.
*   **Style:** Lucide icon in Teal circle + 14px label.

---

## Section 12: Frequently Asked Questions

### Layout
*   **Header:** "Frequently Asked Questions" (H2, centered).
*   **Container:** Accordion style, max-width 768px, centered. 6-8 questions total.
*   **Item Design:**
    *   Question: 16px, 500 weight, `#0F172A`.
    *   Answer: 14px, 400 weight, `#64748B`, 8px top padding.
    *   Icon: Chevron right/down.
    *   Divider: 1px `#E2E8F0` between items.
    *   Animation: Smooth height transition (300ms).

---

## Section 13: Final CTA

### Layout
*   **Container:** Full-width.
*   **Background:** Teal gradient (`#0EA5E9` to `#06B6D4`) with subtle CSS floating shapes (low opacity).
*   **Text (Centered, max-width 640px):**
    *   Headline: "Ready to Find Your Direction?" (H2, White, 36px).
    *   Body: "Start exploring careers, courses, and universities today." (16px, White/90%).
*   **Action:** "Get Started →" (White bg, Teal text, large button padding `px-10 py-4`).

---

## Section 14: Footer

### Layout
*   **Background:** Dark (`#0F172A`).
*   **Grid:** 4-column (desktop), 2-column (tablet), stacked (mobile). Generous spacing.
*   **Typography:** Headings (14px, uppercase, tracked, white, 600). Links (14px, `#94A3B8`, hover white).

### Columns
1.  **Brand:** CareersCompus Logo, "Find Your Direction" tagline, brief 2-line description, Social media icon row.
2.  **Quick Links:** Home, Courses, Universities, Careers, Compare, Counselling, About, Contact.
3.  **Top Streams:** Engineering, Medical, Management, Law, Science, Commerce, Arts, Design.
4.  **Contact:** Email, Phone, WhatsApp link, Address.

### Bottom Bar
*   **Divider:** 1px solid `#1E293B`.
*   **Left:** "© 2024 CareersCompus. All rights reserved."
*   **Right:** Privacy Policy | Terms of Service | Sitemap.
