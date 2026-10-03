# Design System: CareersCompus

This document serves as the single source of truth for the visual and interaction design language of CareersCompus — a premium Indian higher-education and career discovery platform.

## Design Philosophy

**"Premium editorial education technology"**

CareersCompus aims to elevate the standard of education discovery in India. Our design language signals trust, authority, and aspiration. We eschew the cluttered, overly dense interfaces typical of legacy education portals in favor of a clean, structured, and modern aesthetic. 

**Quality References:** Apple, Stripe, Linear, Notion, Vercel.

---

## Visual Direction Exploration & Selection

Before finalizing the design system, we explored three distinct visual directions to find the perfect balance for CareersCompus.

### Direction A: 'Midnight Scholar'
- **Vibe:** Dark primary palette (deep navy/midnight blue) with gold/amber accents.
- **Typography:** Serif headlines + sans-serif body for a strong editorial feel.
- **Pros:** Premium, distinctive, stands out sharply against typical Indian edtech platforms.
- **Cons:** Dark themes can feel heavy for the information-dense pages required for university and course comparisons. Accessibility challenges with high-contrast text over long reading sessions.

### Direction B: 'Clean Horizon'
- **Vibe:** Light/white primary background, deep blue primary (#1a365d range) + vibrant teal/cyan accent.
- **Typography:** All sans-serif, relying on strong weight contrast.
- **Pros:** Highly readable, easily scalable, profoundly professional, and universally accessible.
- **Cons:** Could feel generic if not executed with meticulous care regarding spacing and typography.

### Direction C: 'Warm Intelligence'
- **Vibe:** Warm off-white backgrounds, deep indigo primary + warm coral/orange accent.
- **Typography:** Friendly yet premium modern geometric sans-serif.
- **Pros:** Approachable, youthful, and warm.
- **Cons:** Coral accents can feel trendy, potentially dating the design prematurely, and may lack the gravitas required for serious career decisions.

### 🏆 Selected Direction: Refined 'Clean Horizon'
We have selected **Direction B ('Clean Horizon')**, but enriched it with the editorial confidence of Direction A. The final system features a clean and spacious canvas, authoritative typography, deep blue trust-signals, and a distinctive, tech-forward teal accent. It maximizes readability for data-heavy views while maintaining a premium, venture-backed aesthetic.

---

## 1. Color System

Our color system is built around trust (deep blues), action (vibrant teal), and extreme readability (high contrast neutral scales).

### Primary Colors
Used for typography, main navigation, and authoritative structural elements.
- **Primary Base:** `#0F172A` (Slate 900 - Near black for main text)
- **Primary Brand:** `#1E3A8A` (Blue 900 - Trust and authority)
- **Primary Hover/Active:** `#1E40AF` (Blue 800)

### Accent Colors
Used for primary actions, active states, and highlighting key differentiators.
- **Accent Base:** `#0EA5E9` (Sky 500 - Vibrant, tech-forward teal/cyan)
- **Accent Hover:** `#0284C7` (Sky 600)
- **Accent Light:** `#E0F2FE` (Sky 100 - Subdued backgrounds)

### Semantic Colors
- **Success:** `#10B981` (Emerald 500) - For successful form submissions, positive ROI stats.
- **Warning:** `#F59E0B` (Amber 500) - For alerts, missing prerequisites.
- **Error:** `#EF4444` (Red 500) - For validation errors, critical alerts.
- **Info:** `#3B82F6` (Blue 500) - For neutral informational badges and tooltips.

### Neutral Colors
Used for backgrounds, borders, and secondary text.
- **Background Main:** `#FFFFFF` (White)
- **Background Alt 1:** `#F8FAFC` (Slate 50)
- **Background Alt 2:** `#F1F5F9` (Slate 100)
- **Surface:** `#FFFFFF`
- **Border Light:** `#F1F5F9` (Slate 100)
- **Border Default:** `#E2E8F0` (Slate 200)
- **Border Strong:** `#CBD5E1` (Slate 300)
- **Text Primary:** `#0F172A` (Slate 900)
- **Text Secondary:** `#334155` (Slate 700)
- **Text Muted:** `#64748B` (Slate 500)
- **Text Placeholder:** `#94A3B8` (Slate 400)

*Note: Dark mode is not in v1 scope but the token architecture will support future implementation.*

---

## 2. Typography

Our typography creates a structural hierarchy that feels both editorial and highly functional.

### Font Families
- **Headlines (`font-display`):** **Plus Jakarta Sans** — Geometric, confident, modern. Excellent weight range for impactful headers.
- **Body (`font-sans`):** **Inter** — Supreme readability, extensive character set, excellent performance as a variable font.
- **Monospace (`font-mono`):** **JetBrains Mono** — For code blocks, technical stats, or data tabular displays.

### Type Scale

| Level | Size (px/rem) | Line Height | Weight | Letter Spacing | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | 72px (4.5rem) | 1.1 | Bold (700) | -0.02em | Plus Jakarta | Hero headlines |
| **Display 2** | 60px (3.75rem)| 1.1 | Bold (700) | -0.02em | Plus Jakarta | Major section headers |
| **Display 3** | 48px (3rem) | 1.1 | SemiBold (600)| -0.02em | Plus Jakarta | Landing page intros |
| **H1** | 36px (2.25rem)| 1.2 | SemiBold (600)| -0.01em | Plus Jakarta | Page titles |
| **H2** | 30px (1.875rem)| 1.3 | SemiBold (600)| -0.01em | Plus Jakarta | Section titles |
| **H3** | 24px (1.5rem) | 1.4 | Medium (500) | Normal | Plus Jakarta | Card titles, subsections |
| **H4** | 20px (1.25rem)| 1.4 | Medium (500) | Normal | Plus Jakarta | Small module titles |
| **Body Large** | 18px (1.125rem)| 1.6 | Regular (400)| Normal | Inter | Lead paragraphs |
| **Body Base** | 16px (1rem) | 1.5 | Regular (400)| Normal | Inter | Standard body text |
| **Body Small** | 14px (0.875rem)| 1.5 | Regular (400)| Normal | Inter | Secondary text, UI elements |
| **Caption** | 12px (0.75rem)| 1.5 | Medium (500) | 0.01em | Inter | Tooltips, disclaimers |
| **Overline** | 11px (0.6875rem)| 1.5 | SemiBold (600)| 0.05em (uppercase) | Inter | Eyebrows, categories |

---

## 3. Spacing Scale

Based on an 8px grid to ensure rhythmic, predictable layouts.

- `0`: 0px
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px (Base padding)
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px
- `24`: 96px
- `32`: 128px (Hero section padding)

---

## 4. Layout & Containers

- **Max content width (`max-w-7xl`):** 1280px (Standard pages)
- **Wide content width (`max-w-[1440px]`):** 1440px (Dashboards, wide tables)
- **Narrow content width (`max-w-3xl`):** 768px (Editorial content, articles, forms)
- **Page padding (X-axis):** 
  - Mobile: 16px (`px-4`)
  - Tablet: 24px (`px-6`)
  - Desktop: 32px (`px-8`)
  - Large Desktop: 48px (`px-12`)
- **Section spacing (Y-axis):** 
  - Mobile: 64px (`py-16`)
  - Tablet: 96px (`py-24`)
  - Desktop: 128px (`py-32`)

---

## 5. Border Radius

- **None (`rounded-none`):** 0px
- **Small (`rounded-sm`):** 4px (Badges, checkboxes, tooltips)
- **Default (`rounded`):** 8px (Buttons, inputs, small cards)
- **Medium (`rounded-md`):** 12px (Standard cards, dropdowns)
- **Large (`rounded-lg`):** 16px (Featured cards, modals)
- **XL (`rounded-xl`):** 24px (Hero images, large surface areas)
- **Full (`rounded-full`):** 9999px (Avatars, pills, radio buttons)

---

## 6. Shadows & Elevation

Shadows are primarily soft and diffuse to communicate depth without introducing visual noise.

- **Level 0 (Flat):** `box-shadow: none`
- **Level 1 (Subtle):** `0 1px 2px 0 rgb(0 0 0 / 0.05)` — Cards at rest, secondary buttons.
- **Level 2 (Medium):** `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — Cards on hover, sticky headers, dropdown menus.
- **Level 3 (High):** `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` — Modals, popovers, large interactive elements on hover.
- **Level 4 (Highest):** `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` — Tooltips, global toasts, critical dialogs.

---

## 7. Component Specifications

### 7.1 Buttons
- **Primary:** Background `Accent Base`, Text `White`. Hover: `Accent Hover`, slight transform scale.
- **Secondary:** Background `Primary Brand`, Text `White`. Hover: `Primary Hover`.
- **Outline:** Background `Transparent`, Border `Border Strong`, Text `Text Primary`. Hover: Background `Background Alt 1`.
- **Ghost:** Background `Transparent`, Text `Text Secondary`. Hover: Background `Background Alt 1`, Text `Text Primary`.
- **Link:** Background `Transparent`, Text `Accent Base`. Hover: Underline.
- **Sizes:**
  - `sm`: height 32px, px 12px, font 14px, rounded 8px
  - `md` (default): height 40px, px 16px, font 14px, rounded 8px
  - `lg`: height 48px, px 24px, font 16px, rounded 8px

### 7.2 Inputs & Forms
- **Style:** Background `White`, Border `Border Default`, Text `Text Primary`, Placeholder `Text Placeholder`.
- **Focus:** Border `Accent Base`, Ring `Accent Base` (opacity 20%).
- **Error:** Border `Error`, Helper text `Error`.
- **Sizes:** Map to button heights (sm: 32px, md: 40px, lg: 48px). Rounded 8px.
- **Labels:** `Body Small`, `Medium` weight, `Text Secondary`.

### 7.3 Cards
- **Course/University Cards:** Background `White`, Border `Border Light`, Radius `Medium (12px)`, Elevation `Level 1`.
- **Interaction:** On hover, transition Elevation to `Level 2` and transform `translateY(-4px)`.
- **Padding:** Internal padding usually `24px` (Desktop) / `16px` (Mobile).

### 7.4 Badges & Tags
- **Style:** Padding X `8px`, Padding Y `2px`, Font `Caption` or `Overline`, Radius `Full` or `Small`.
- **Variants:** 
  - Stream/Category: Background `Background Alt 2`, Text `Text Secondary`.
  - Highlight/Status: Background `Accent Light`, Text `Accent Hover`.

### 7.5 Navigation
- **Desktop Nav:** Height `72px`, fixed top, Blur background with 80% opacity `White`. Text `Body Small`, `Medium`.
- **Tabs:** Underline style preferred over pill style for data heavy pages. Active state: `Accent Base` border bottom.

### 7.6 Feedback & Overlays
- **Modals:** Radius `Large (16px)`, Elevation `Level 3`, Backdrop `rgba(15, 23, 42, 0.4)` + 4px blur.
- **Toasts:** Position bottom-right, Radius `Default (8px)`, Elevation `Level 4`.

---

## 8. Motion System

All animations must feel purposeful, snappy, and hardware-accelerated. 

### Timing
- **Instant:** 100ms (Button states, toggles)
- **Fast:** 200ms (Hover effects, dropdowns, tooltips)
- **Normal:** 300ms (Page transitions, reveals, accordions)
- **Slow:** 500ms (Complex layout shifts, modal open)
- **Deliberate:** 800ms (Hero 3D animations, narrative scroll reveals)

### Easing
- **Default:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Enter (Deceleration):** `cubic-bezier(0, 0, 0.2, 1)` - Starts fast, ends slow.
- **Exit (Acceleration):** `cubic-bezier(0.4, 0, 1, 1)` - Starts slow, ends fast.
- **Spring:** Framer Motion default spring (`stiffness: 400, damping: 30`).

### Animation Patterns
- **Scroll Reveal:** Fade in + `translateY(20px)` upward motion. Staggered by 100ms for lists.
- **Hover Lift:** `transform: translateY(-4px)` + Shadow expansion.
- **Page Transition:** Gentle fade in + `translateY(10px)`.

### Accessibility (Reduced Motion)
- Always wrap complex animations in `useReducedMotion` hooks (Framer Motion) or `@media (prefers-reduced-motion: reduce)`.
- Fallback: Replace spatial motion (translates/scales) with simple opacity cross-fades.
- Disable all 3D canvas autoplay if reduced motion is enabled.

---

## 9. Iconography

- **Library:** Lucide Icons (React)
- **Sizes:** 
  - `16px`: Inline with text, dense tables
  - `20px`: Standard UI elements, buttons
  - `24px`: Section headers, standalone actions
  - `32px+`: Empty states, feature blocks
- **Stroke Width:** `1.5px` (default for elegance), `2px` (for emphasis in small sizes).
- **Accessibility:** All `<Icon>` components must receive appropriate `aria-label` or `aria-hidden="true"`.

---

## 10. Responsive Breakpoints (Tailwind Default + 3xl)

Mobile-first approach.

- `sm`: **640px** (Large phones, phablets)
- `md`: **768px** (Tablets portrait)
- `lg`: **1024px** (Tablets landscape, small laptops)
- `xl`: **1280px** (Standard desktop)
- `2xl`: **1440px** (Large desktop, wide tables)
- `3xl`: **1920px** (Ultra-wide screens)

---

## 11. Grid System

- **Mobile (Default):** 4 columns, 16px gutter.
- **Tablet (md):** 8 columns, 24px gutter.
- **Desktop (lg):** 12 columns, 32px gutter.
- **Large (xl+):** 12 columns, 32px gutter, max-width constrained.

---

## 12. Design Tokens Summary

These tokens will be mapped into `tailwind.config.ts`.

| CSS Custom Property | Tailwind Class mapping | Value |
| :--- | :--- | :--- |
| `--color-background` | `bg-background` | `#FFFFFF` |
| `--color-foreground` | `text-foreground` | `#0F172A` |
| `--color-primary` | `bg-primary` | `#1E3A8A` |
| `--color-primary-foreground` | `text-primary-foreground` | `#FFFFFF` |
| `--color-accent` | `bg-accent` | `#0EA5E9` |
| `--color-accent-foreground`| `text-accent-foreground` | `#FFFFFF` |
| `--color-muted` | `bg-muted` | `#F1F5F9` |
| `--color-muted-foreground` | `text-muted-foreground` | `#64748B` |
| `--color-border` | `border-border` | `#E2E8F0` |
| `--radius-sm` | `rounded-sm` | `4px` |
| `--radius-md` | `rounded-md` | `8px` |
| `--radius-lg` | `rounded-lg` | `12px` |
| `--radius-xl` | `rounded-xl` | `16px` |

*(This structure follows the standard shadcn/ui theming approach, allowing seamless integration with our component library choice).*
