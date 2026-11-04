# 08 — Colour Identity: "Nocturne Atlas"

Status: **PROPOSAL — awaiting approval. No application code, 3D scene or animation has been changed for this.**
Supersedes the Light Royal palette (see `04_VISUAL_SYSTEM.md`, now marked as superseded-pending-approval).
Note: `08_IMPLEMENTATION_ARCHITECTURE.md` already exists; on approval it will be renumbered `09_…`.

---

## 1. Recommendation in one paragraph

Adopt your preferred direction — **Midnight Black + Deep Aubergine + Electric Cyan** — but only in a specific structure that stops it collapsing into the generic "dark purple + cyan glow" look of AI/crypto/SaaS sites. The structure is: **two times of day** (ink-dark night scenes and ivory paper day scenes, alternating), **one material** (champagne brass, carried by the compass), and **one signal** (electric cyan, used only as *light that comes from the compass* — the needle tip, the active meridian, focus and progress — never as a background, gradient or decoration). Warm brass and ivory against cold cyan and aubergine is the tension that makes it distinctive; the alternation of dark and paper scenes is what makes it cinematic rather than monotonous.

## 2. Why it is stronger than the alternatives

Assessed against: premium/international feel, distinctiveness (not AI-generic), trust for students **and parents**, fit with the Meridian Atlas concept (night, instruments, maps), readability, and range across 8 scenes.

| # | Combination | Verdict for CareersCompus |
|---|---|---|
| 1 | **Black + Deep Purple + Electric Cyan** | **Strongest base, high risk.** Cinematic, night-sky, fits the compass and "signal" idea. Unstructured, it is the #1 cliché of AI/crypto landing pages (purple→cyan gradients, glow blobs). Needs warm counterweight + strict cyan rules → **recommended with the structure in §1**. |
| 2 | Sage Green + Walnut + Amber | Crafted and warm, but reads lifestyle/coffee/furniture; low energy for 16–22-year-olds; accents lack the contrast a "signal" needs. |
| 3 | Grey + Silver + Red | Automotive/corporate; red reads as error/danger — wrong emotion for anxious students choosing a future. |
| 4 | Midnight Black + Pure Grey + Golden Yellow | Luxury-card/finance language (black card, gold). Strong, but signals exclusivity; risks alienating families; also very close to the reference site's own black-card look. |
| 5 | Ivory + Midnight + Neon Green | Excellent editorial base; neon green is fintech/gaming coded and fails contrast on ivory. |
| 6 | Ivory + Teal + Coral | Friendly and accessible, but it *is* the generic friendly-edtech/health-startup palette; not cinematic. |
| 7 | Black + Cobalt + Acid Lime | Sport/streetwear energy; aggressive; lime unusable on light grounds. |
| 8 | Orchid Pink + Violet + Orange | Playful, Gen-Z, creative-agency; hard to make trustworthy for parents; weak for data-heavy scenes (Compare). |
| 9 | Sage Grey + Beige + Burgundy | Academic, heritage, trustworthy — but dated; reads "old university crest", the opposite of "your future". |
| 10 | Lavender + Royal Purple + Electric Lime | Trend-bound (2021–23 startup), clashing; low longevity. |
| 11 | Royal Blue + White + Sunshine Yellow | Closest to the current palette and to mass-market Indian e-commerce/edtech brands — the generic look you want to leave. |
| 12 | Cream + Deep Purple + Soft Lavender | Elegant, but soft and low-contrast; no electric accent, so nothing can act as the "signal". Its cream + deep purple pairing is, however, absorbed into the recommendation as the day scenes. |

What the recommendation borrows from the others: #12's cream/purple warmth (day scenes), #4's restraint of a single metallic (champagne brass), #5's ivory editorial pages.

## 3. Final palette

### 3.1 Core (60 / 30 / 10 rule across the whole journey)
| Role | Token | Hex | Notes |
|---|---|---|---|
| Night ground | `ink-950` Midnight | `#101014` | Near-black with a violet cast; never pure #000 |
| Night ground (raised) | `ink-900` | `#1A1A22` | Surfaces/cards/inputs on Midnight |
| Night atmosphere | `aubergine-900` Deep Aubergine | `#241333` | Grounds for Discover/Universities; the "colour of night" |
| Accent environment | `plum-700` Royal Plum | `#43205F` | The only saturated full-bleed ground (Scene 7) |
| Day ground | `ivory-50` Soft Ivory | `#F4F0E8` | Paper; light scenes |
| Day surface | `ivory-100` | `#ECE6DA` | Panels on ivory |
| Neutral | `silver-400` Cool Silver | `#A7A9B5` | Secondary text/hairlines on dark |
| Neutral (on light) | `silver-700` | `#5C5E6D` | Secondary text on ivory (5.64:1) |
| Material | `champagne-400` Muted Champagne | `#C9A96E` | Brass, rules, small caps on dark |
| Material (on light) | `champagne-800` | `#7D6331` | Brass-coloured text/lines on ivory (4.99:1) |
| **Signal** | `cyan-400` Electric Cyan | `#35E6E6` | Light only. ≤5% of any frame. |
| Signal (on light) | `cyan-800` Deep Cyan | `#0A6F78` | The only cyan allowed on ivory (5.19:1) |

### 3.2 Semantic tokens
```
--bg-night: ink-950;        --bg-night-raised: ink-900;   --bg-atmos: aubergine-900;
--bg-accent: plum-700;      --bg-day: ivory-50;           --bg-day-raised: ivory-100;
--text-on-night: ivory-50;  --text-on-night-muted: silver-400 (or ivory @ 70% = #B0AEA9, 8.56:1)
--text-on-day: ink-950;     --text-on-day-muted: silver-700;
--rule-on-night: champagne-400 @ 35%;   --rule-on-day: champagne-800 @ 30%;
--signal: cyan-400 (night) / cyan-800 (day);
--focus-ring: cyan-400 2px + 2px offset (night), cyan-800 (day);
--action-primary: ivory-50 fill + ink-950 text (night); ink-950 fill + ivory-50 text (day);
--action-secondary: transparent + 1px champagne/silver border;
```
**Primary actions are monochrome (ivory/ink), not cyan.** Royal Blue is retired as the action colour (this changes an earlier approved decision — please confirm). Cyan never fills a button except one optional "signal CTA" per page (Scene 8).

### 3.3 Domain hues (redesigned for dark grounds, kept ≥28° away from cyan's 180° hue)
| Domain | Hue (night) | °  | on Midnight | on Aubergine | Ink variant (day) | on Ivory |
|---|---|---|---|---|---|---|
| Technology | Iris `#8C95FF` | 235 | 7.10 | 6.46 | `#3B44B8` | 6.83 |
| Medicine | Jade `#5FCB98` | 152 | 9.48 | 8.62 | `#1D6E49` | 5.47 |
| Business | Saffron `#E9B44C` | 40 | 10.03 | 9.13 | `#7A5512` | 5.89 |
| Design | Rose `#EE7FA8` | 338 | 7.45 | 6.77 | `#9E2F5A` | 6.14 |
| Law | Lilac `#B993F0` | 265 | 7.68 | 6.99 | `#5E3A96` | 7.33 |
| Architecture | Terracotta `#E58A64` | 18 | 7.37 | 6.70 | `#99441F` | 5.77 |
| Science | Sky `#6DB5F2` | 208 | 8.63 | 7.85 | `#1F5E92` | 6.01 |
Rule: domain hues identify; **cyan selects**. A selected domain gets a cyan ring/needle, never a cyan fill.

## 4. Typography
- **Display: Instrument Serif** (keep). On dark it gains drama: ivory, very large, tight leading; italic for the emotional clause. Do **not** colour italics cyan — use champagne (dark scenes) or ink (day scenes).
- **Text/UI: Inter** (keep), 16–18 px body, ivory on night at 100% for body, 70% for secondary.
- **Instrument labels:** add a mono for coordinates, scene numbers and data (`JetBrains Mono` or `IBM Plex Mono`, one weight, 11–12 px, tracking 0.08em). It reinforces "atlas instrument" and helps the Compare ledger. Optional; one extra font file.
- **Wordmark:** drop Plus Jakarta Sans (one fewer font); set the wordmark in Inter semibold with a brass compass glyph, or a custom wordmark later.
- Type on dark is optically heavier: increase body line-height to 1.6 and avoid weights below 400.

## 5. Backgrounds & surfaces
- **Night grounds:** flat Midnight or Aubergine plus *one* soft radial light source tied to the compass (warm champagne, ≤12% opacity). No purple→cyan gradients, no blobs, no starfield noise wallpaper.
- **Grain:** keep the very fine paper/film grain (≤4%), plain alpha (no blend modes — measured perf cost).
- **Day grounds:** ivory paper, ink hairlines, champagne-800 rules.
- **Surfaces:** solid, not glass. Night cards = `ink-900` with 1px `ivory @ 8%` border; day cards = `ivory-100` with 1px `ink @ 10%`. Radius 6–8 px.
- **Depth** comes from light (radial key light, rim light on the compass), scale and typography — not shadows or blur. One allowed shadow: soft `0 20px 60px rgba(0,0,0,0.45)` under floating objects on night grounds.

## 6. Scene-by-scene colour atmospheres
Rhythm: **night → deeper night → jewel rooms → dawn paper → night sky → daylight lab → plum signal → warm paper.**

| Scene | Ground | Text | Accent use | Transition in |
|---|---|---|---|---|
| 1 Arrival | Midnight with a warm champagne key-light pooling behind the compass | Ivory headline, champagne italic clause, silver support | Cyan only at the primary needle tip (a small emitted glow) and the search focus ring | — (first screen) |
| 2 Discover | Midnight deepening into Aubergine as meridians extend (cross-fade) | Ivory titles, silver labels | Meridians in domain hues (as light lines); cyan marks the selected meridian + rail position | Ground lerps ink→aubergine; key light cools slightly |
| 3 Explore | Seven "jewel rooms": domain hue at 14–18% over Midnight | Ivory; domain ink for numerals | Cyan only for the active rail item / selection | Room colour cross-dissolves per domain |
| 4 Courses | **Dawn: Ivory paper** (first light scene) | Ink | Route line in ink; cyan-800 "you are here" marker; domain ink colours for stops | Night lifts to paper (a horizon wipe, not a fade-through-grey) |
| 5 Universities | **Night sky: Aubergine** | Ivory/silver | Institutions as champagne points of light; cyan only for the hovered/selected point | Paper darkens to aubergine like dusk |
| 6 Compare | **Daylight lab: Ivory with ivory-100 ledger** | Ink, mono for values | Cyan-800 difference markers; champagne-800 rules | Aubergine → ivory as two stars slide into ledger anchors |
| 7 Next step | **Accent environment: Royal Plum** | Ivory | The converged single needle in cyan — the brightest cyan moment of the page | Ivory → plum; meridians converge |
| 8 Guidance | **Warm paper: Ivory** with a band of ink for the form panel | Ink / ivory (inside the panel) | One optional cyan "signal" CTA; otherwise monochrome actions | Plum settles into paper; footer returns to Midnight |

No two consecutive scenes share a ground, and the darkest/brightest moments (Arrival, Next step) bracket the journey.

## 7. Compass material & lighting (specification for later implementation)
- **Case/bezel/crown:** champagne brass matcap (`#C9A96E` family; highlight `#FFF4D6`, mid `#B89452`, terminator `#3A2808`). On night grounds the warm metal is the main warm element of the frame.
- **Dial:** smoked ivory (`#EAE3D3`) with ink engraving; N marker in cyan-400 (the only cyan on the dial).
- **Primary needle:** blued steel (ink-900 → silver) with a **cyan emissive tip** (small, emissive intensity low; no bloom post-processing — perf).
- **Ghost needles:** cool silver at 35–55% opacity.
- **Orbit rings:** one champagne, one silver; no blue.
- **Meridians (Scene 2):** emissive lines in domain hues at 85%; selected meridian gains a cyan core.
- **Lighting:** warm key (≈3200 K, champagne) from upper-left; cool rim (cyan at 15–20%) from lower-right — this rim is what ties the cyan accent to the object physically. No IBL (the PMREM environment was measured to block the main thread ~3 s on Windows/ANGLE; matcaps achieve the brass look cheaply).

## 8. Accessibility & contrast (measured, WCAG 2.x)
| Pair | Ratio | Use |
|---|---|---|
| Ivory on Midnight | 16.70 | body/headlines |
| Ivory on Aubergine | 15.19 | body/headlines |
| Ivory on Plum | 11.47 | body/headlines |
| Silver on Midnight / Aubergine / Plum | 8.12 / 7.39 / 5.58 | secondary text |
| Cyan on Midnight / Aubergine / Plum | 12.31 / 11.19 / 8.45 | signal, focus |
| Champagne on Midnight / Aubergine / Plum | 8.48 / 7.72 / 5.83 | labels, rules |
| Midnight on Ivory | 16.70 | day body |
| Silver-700 on Ivory | 5.64 | day secondary |
| Deep Cyan on Ivory | 5.19 | day signal/links |
| Champagne-800 on Ivory | 4.99 | day labels |
| **Cyan on Ivory** | **1.36 — never** | — |
| **Champagne / Silver on Ivory** | **1.97 / 2.06 — decorative only** | — |
Rules: never convey meaning by hue alone (domain marks keep glyph + label); focus rings 2 px with 2 px offset; dark scenes keep body ≥16 px; reduced-motion users see the same atmospheres without animated transitions; respect `prefers-contrast: more` by raising muted text to 100% ivory/ink.

## 9. Mobile
Same atmospheres, fewer gradients: on phones the radial key light becomes a static, smaller radial; scene grounds change at section boundaries (natural scroll) with a 160 px gradient seam instead of scroll-scrubbed cross-fades. OLED-friendly night grounds; ensure ivory day scenes are not glaring (ivory, never pure white).

## 10. What changes on approval (implementation preview — not done)
- Token layer in `globals.css`; remove Light Royal / `ch*` tokens.
- `domains.ts` hues → table §3.3 (night + ink variants).
- Compass materials per §7 (matcap tones already prototyped in the paused stabilisation work).
- Scene 1–2 grounds per §6; header/footer/action styles per §3.2.
- Re-run contrast + visual QA (harness) at 1440/1280/390 and reduced-motion/no-WebGL.

See `docs/redesign/colour-board.jpg` for the visual board.
