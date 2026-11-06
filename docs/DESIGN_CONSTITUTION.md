# CareersCompus Design Constitution

Status: permanent standard for all existing and future work. Adopted 2026-11-05.
Companion: `docs/WEBSITE_QUALITY_AUDIT.md` records where the site currently falls short of this document.

**Final principle: CareersCompus should look intentionally designed, not decorated. Every icon, badge, container, animation, gradient and visual detail must earn its place.**

---

## 1. What the product should feel like

Premium, editorial, intelligent, minimal, confident, modern, purposeful, human-designed.

It must never read as a generic AI-generated template, a marketplace theme or a typical vibe-coded React project. Every visual decision needs a reason that can be stated in one sentence. If the only reason is "it looks more elaborate", remove it.

## 2. The earn-its-place test

Before adding any visual element, answer yes to at least one:

1. Does it explain something (a pathway, a relationship, a state)?
2. Does it help the student find or decide something?
3. Is it part of the identity (the compass, the atlas, the ledger)?

## 3. Patterns that are not default solutions

These are not absolute bans where a real product need exists, but none may be used just to make a page look richer:

- clickable radiance, glossy icons, sparkle icons
- repetitive three-feature-card layouts, bento grids everywhere, glass cards
- excessive glow, a coloured stripe on every card
- emojis in headings or as icons, excessive em dashes
- generic testimonial sections, generic pricing tiers
- decorative dot-grid backgrounds, repetitive gradients
- animations on every element, random floating objects
- generic AI illustrations, unnecessary decorative icons
- default loading indicators without context

## 4. Typography leads

Typography is a defining element. If a section looks boring, first change type scale, weight contrast, line breaks, composition, spacing and alignment. Do not reach first for illustration, gradient or animation. If it feels flat, improve contrast through type, surface and composition. If it feels too simple, add a thoughtful detail, not clutter.

| Role | Face | Rules |
|---|---|---|
| Display | Instrument Serif | Headlines and names. It has one weight, so contrast comes from size and italic. |
| Reading | Inter | Body, descriptions, controls. |
| Metadata | JetBrains Mono | Labels, coordinates, data. Use sparingly: it is seasoning, not the meal. |

- **No fourth typeface.** Plus Jakarta Sans exists only for interim sections and leaves with them.
- **Figures:** Instrument Serif's "1" reads like a capital I or lowercase l. Do not set meaningful numbers (years, counts, durations) in it at text sizes. Use Inter or JetBrains Mono, or a display size where the digit is unambiguous. In display text that can contain a number, wrap it with `<Figures>` (`src/journey/Figures.tsx`), which sets the digits in JetBrains Mono.
- **Minimum size:** new text is at least 12px; mono uppercase labels at least 11px. Long text is never uppercase mono.
- **Mobile:** scale with `clamp()`, never with a compressed desktop layout.
- **Headings set their own colour.** The base rule in `globals.css` gives `h1`-`h6` a dark colour, so a heading on a night ground without `text-ivory` becomes invisible.

## 5. Colour: Nocturne Atlas is preserved

Midnight `#101014`, Ink `#1A1A22`, Deep Aubergine `#241333`, Royal Plum `#43205F`, Soft Ivory `#F4F0E8`, Champagne `#C9A96E`, Electric Cyan `#35E6E6`.

- Colours come from `src/theme/tokens.ts` and `@theme`. Run `node scripts/check-tokens.mjs`. No independent palette, no stray hex.
- **Champagne:** meaningful structure and institutional markers.
- **Cyan:** active selection, focus, directional signal. Never a fill, never decoration.
- **Ivory and ink:** readable contrast. On ivory grounds use the `-800` variants.
- Dark and light scenes may alternate where it serves the story. The site must not become a purple-and-cyan gradient.

## 6. Composition

Every scene has its own composition inside one design system. Audit each new scene for repeated cards, repeated two-column layouts, identical section structure, identical heading placement, identical decorative illustrations and repeated icon treatments.

Prefer editorial and asymmetric layouts, carefully structured information, custom SVG, purposeful diagrams, strong whitespace and clear hierarchy. Do not add complexity that does not improve the experience.

A new scene may not reuse the opening of the previous scene (for example: centred eyebrow, centred title, centred paragraph, line drawing).

## 7. Components

**Cards.** Use a card only for a genuinely distinct content unit. No cards inside cards inside cards. Prefer section boundaries, type hierarchy, spacing, dividers and background contrast.

**Grouping.** Related things sit together: headings with descriptions, labels with fields, institution facts, course details, navigation controls, actions, supporting metadata. Do not separate them to fill space.

**Badges must mean something.** Examples: Verified, New, Application open, Admission information unavailable, Selected. Remove decorative badges. Never invent a status. A non-interactive label must not look like a button.

**Icons.** No emojis as interface icons. Use one coherent SVG family with consistent stroke weight, size and alignment, plus custom SVG where needed. Do not mix unrelated styles, and do not mix drawn icons with text arrows for the same job.

**Buttons.** Ivory primary on night, ink primary on day, transparent with border for secondary. An enabled button does exactly what it says. A disabled action is labelled as disabled and says why.

## 8. Radius system

Central tokens (`src/theme/tokens.ts`, `@theme` in `globals.css`):

| Token | Class | Value | Use |
|---|---|---:|---|
| Small | `rounded-atlas-sm` | 8px | Controls, chips, small panels |
| Standard | `rounded-atlas` | 14px | Panels and cards |
| Large | `rounded-atlas-lg` | 20px | Rare, large surfaces |
| Pill | `rounded-pill` | 999px | Only where a pill shape means something; round markers |

These are a starting scale, not a rule that every element must be rounded. **Nested elements:** inner radius equals the outer radius minus the padding between them. Avoid arbitrary combinations.

## 9. Gradients and surfaces

No large gradient strips or gradient-filled containers used to make a section look attractive. Use typography, composition, spacing, meaningful contrast and subtle material treatment instead. A gradient is allowed when it has a stated job, such as carrying one scene's ground colour into the next without a seam.

## 10. Motion

Animation must communicate: explaining a pathway, showing a relationship, indicating selection, navigation or progress, a state change, a scene transition, or interaction feedback.

**Do not:** animate every card, icon, button and heading; float objects; pulse, shimmer or glow continuously; add hover transforms for their own sake; pile on scroll effects; or make anyone wait for information.

**Continuous motion** is allowed only when it communicates information or real system activity, and it stops when that stops. Prefer motion that runs once on a state change or follows scroll.

**Once means once.** An entrance or signal animation runs one iteration when its element first appears, ends in a stable state (`both`/`forwards`) and never replays. Rooms in the Explore scene carry `data-opened` after the first visit for exactly this. The 3D compass's idle drift is run through `idleTime()` in `choreography.ts`, which slows to a stop after about twelve seconds. Hover and focus effects play one iteration, not a loop.

Respect `prefers-reduced-motion` everywhere, including `whileInView` reveals. Preserve the scroll architecture: per-frame work never goes through React state.

## 11. Honesty is part of the design

- Never invent statistics, claims, testimonials, rankings, fees, placements, salaries, eligibility, entrance requirements, accreditation or contact details.
- A fact is **verified** (with a source and date), **not available** (with a reason) or **not applicable**. A missing value is never zero and never a negative result.
- Illustrative content is labelled as such, and is never styled as verified.
- **Four status labels**, one vocabulary for every scene (`src/content/verification.ts`, rendered by `StatusLabel`): **Verified** (every part confirmed on an official source, with source and date), **Partially verified** (part confirmed, the rest not), **Orientation** (general guidance written by CareersCompus, not independently verified) and **Not verified** (not yet confirmed; says nothing good or bad about the option). Each is words plus a distinct mark, so colour is never the only signal. Orientation is a different kind of content, not a weaker Verified: it is never counted, styled or described as a checked fact. Scenes 4 and 5 use them now; Scene 6 must use the same four.
- Institution data is generated by `scripts/verify-institutions.mjs` and is never edited by hand.

## 12. Functional standard

- Every navigation item works. The logo returns home. The mobile menu works by touch and keyboard. Nothing dead-ends.
- No decorative buttons, no placeholder click handlers, no links to routes that do not exist (they also create 404 prefetches).
- Forms validate, show clear errors and success, show a loading state only during a real submission, and never fail silently.
- Email uses `mailto:`, phone uses `tel:`, external links use `rel="noopener noreferrer"` when opening a new tab. Contact details are never invented.

## 13. Loading and feedback

Use a loading indicator only for a real wait: a button loader for an async submission, a skeleton when content truly takes time, a spinner for a short background operation. Always show success and failure. Never add multiple decorative loaders, unnecessary full-screen loaders, fake progress bars, infinite loading animations, or loaders for content that is already available.

## 14. Responsive and accessible

- Test 1440, 1280, 768 and 390 px, both with classic scrollbars and with touch emulation.
- No unintended horizontal scroll, clipped text, overlaps or oversized desktop decoration on phones. Never hide overflow globally: find the offending element. `vw` includes a classic scrollbar, so avoid it for widths inside a column.
- Touch targets at least 44px. Mobile is designed, not squeezed.
- WCAG AA contrast, measured on rendered pixels. Keyboard reachable, visible focus, correct landmarks and headings, accessible names, reduced-motion support, no dependence on WebGL.

## 15. Website completeness

Real page titles and descriptions, Open Graph metadata, the CareersCompus favicon (no starter or emoji icons), a branded 404, canonical URLs, sitemap, robots and a correct copyright year. No starter-template branding or assets.

## 16. Images and assets

No generic stock illustration in place of custom artwork. The SVG environments are part of the identity. Any raster image needs correct dimensions, compression, responsive variants, lazy loading where appropriate and real alt text. Remove unused assets.

## 17. Engineering

Maintain the architecture. No wholesale rewrites, no removal of working features, no unnecessary dependencies. No duplicate components, unused imports or dead code left behind by a change. No console errors. `any`, render-time randomness and setState in effect bodies remain banned.

Do not run `next dev` and `next build` at the same time: `tsconfig.json` includes `.next/dev/types`, and a half-written file there fails the build.

## 18. Domain, indexing and interim sections

- Production is `https://careerscompus.in` (non-www). `www` redirects permanently (308) to it, `SITE_URL` is the canonical origin on every deployment, and the sitemap lists only canonical production URLs.
- Only production may be indexed. `SITE_ENV=production` or `VERCEL_ENV=production` enables it; any other build sends `X-Robots-Tag: noindex`, `<meta name="robots" content="noindex">` and a disallow-all `robots.txt`, so a missing variable fails safe. Preview URLs are never submitted to search engines and should also sit behind access protection in the hosting settings (not configured by this code).
- HTTPS is enforced by the host's edge; the app adds `Strict-Transport-Security`.
- Older Light Royal sections (How It Works, Platform Principles, Final CTA) are hidden behind `SHOW_INTERIM_SECTIONS` in `src/lib/site.ts` until Scenes 6 to 8 replace them. Their code is kept. No navigation or footer link may point at hidden or unfinished content.

## 19. The review gate

Before any scene or significant change is called complete:

1. Run the earn-its-place test on every new icon, badge, container, gradient and animation.
2. List every animation. Is any of it infinite? Why?
3. Is the opening composition different from the previous scene?
4. Are all radii from the scale? Any nested card? Any label that looks like a button?
5. Any number set in a misleading face? Any text under the minimum size?
6. Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `node scripts/check-tokens.mjs`, `node scripts/site-audit.mjs`, and the scene's own checks.
7. Inspect the screenshots at all four widths. Do not claim anything is fixed unless it was tested.

**Violation classes** used in audits:

- **Critical design inconsistency:** contradicts the identity or misleads the student.
- **Repeated design-system violation:** the same rule broken across several places.
- **Optional refinement:** works, but could be more considered.

Approved scenes are not redesigned on sight. Document the violation, its location and class, then wait for approval, unless it is a small, objectively broken issue that can be fixed safely and tested.
