# 04 — Visual System

Status: PROPOSAL. Light Royal is treated as the **brand core**, expanded into a richer "Atlas" system.

## 1. Colour

### Grounds (scene backgrounds)
| Token | Hex | Role |
|---|---|---|
| `paper` | `#F6F1E7` | Primary warm ground (Scenes 1, 4, 6, 8) |
| `pearl` | `#F8F9FC` | Cool light ground, UI surfaces |
| `mist` | `#EEEFFD` | Subtle panels, rail background |
| `ink` | `#11142E` | Dark ground (Scene 5 "night") and primary text |
| `royal-deep` | `#1E2A78` | Secondary text/headline colour, dark accents |

### Brand
| Token | Hex | Role |
|---|---|---|
| `royal` | `#3155D9` | Primary action, links, focus |
| `champagne` | `#D8B86A` | Brass details, compass bezel, highlights |
| `sky` | `#BFD9FF` | Soft light, dawn tint |

### Domain hues (each used for one domain's world + object + rail highlight)
| Domain | Name | Hex |
|---|---|---|
| Technology | Ultramarine | `#2F46D9` |
| Medicine | Viridian | `#1F7A6B` |
| Business | Ochre | `#C58A2B` |
| Design | Rose Madder | `#C2556B` |
| Law | Deep Plum | `#4E3470` |
| Architecture | Clay | `#B5654A` |
| Science | Cerulean | `#2D8CC4` |

Rules:
- A domain hue fills **at most ~35 %** of the stage; the ground is its 8–12 % tint over `paper`.
- Text on any ground must meet WCAG AA (≥ 4.5:1); verified per domain tint in the build.
- Terracotta-like `Clay` is used **only** for Architecture (deliberate, documented — supersedes the earlier blanket removal).
- Forbidden: neon, pure saturated RGB, rainbow gradients, more than one domain hue on screen at once (except Scene 2 where each meridian carries its own).
- Gradients: allowed only as sky/dawn ground washes (≤ 2 stops, low contrast). No decorative blobs.

## 2. Typography
| Role | Face | Notes |
|---|---|---|
| Display | **Instrument Serif** (Google Fonts, via `next/font`) | Headlines 64–200 px; italic for emphasis words. Single weight; large optical size. |
| Text/UI | **Inter** (already loaded) | 15–18 px body, 1.55 line height |
| Labels | Inter, 11–12 px, uppercase, tracking 0.16–0.2 em | Scene labels, rail, tags |
| Numerals | Inter tabular | Ledger, rail indices |
| Wordmark | Plus Jakarta Sans (already loaded) — **revisit**; may be dropped to cut one font | |

Type scale (desktop): Display XL `clamp(64px, 11vw, 176px)`; Display L `clamp(48px, 7vw, 112px)`; H2 `clamp(32px, 4vw, 56px)`; Body L 20; Body 17; Label 12.
Rules: ≤ 2 weights per face, headline measure ≤ 14 words, body measure ≤ 62 ch, never body text over busy 3D without a ground tint scrim.

## 3. Imagery and assets
- **Primary visuals are procedural 3D and SVG** (no licensing risk, tiny payload): compass, domain objects, meridians, constellation.
- **Photography:** optional, used sparingly (e.g. Scene 8 or a "Student life" strip). Must be licensed/commissioned, optimised AVIF/WebP, and never used to imply a specific institution.
- **Textures:** subtle paper grain (SVG noise, 3–4 % opacity) on grounds; brushed-brass normal map for the compass bezel (≤ 512 px).
- **Environment lighting:** local, small HDR/EXR or a procedural `Lightformer` rig — **no remote HDR fetch** (the current `Environment preset="city"` depends on an external CDN).
- **Iconography:** hairline (1.25 px) custom glyphs for the seven domains; consistent with engraved-instrument feel.

## 4. Spacing and layout
- 12-column grid, 1440 base; outer margin `clamp(20px, 4vw, 72px)`; stage content max width 1320.
- 8 px base unit; section rhythm in the flow sections 96/128 px.
- Composition rules in pinned scenes: **one focal object, one headline, one supporting block**; text sits on the left or right third; the compass never sits behind copy.
- Safe zones: top 76 px (header), right 72 px (Direction Rail).

## 5. Components (re-skinned or new)
| Component | Style |
|---|---|
| Primary button | `royal` fill, white text, 8 px radius, 48 px min height, hover → `royal-deep` |
| Secondary button | Transparent, 1 px `royal-deep`/25 % border |
| Direction Rail | Hairline vertical line, 8 px dots, label in small caps; focusable |
| Domain mark | Glyph + label, 44 px min target |
| Route stop | Text marker on a stroked path; expands to a readable panel |
| Constellation node | 6–10 px glow dot + tooltip |
| Ledger | Table semantics (`<table>`), hairline rules, sample values in italic with "Sample" tag |
| Form fields | Underline style, 44 px min height, AA placeholder contrast (preserved from current) |
| Tags/chips | 1 px border, 4 px radius — **not** pill-heavy |

Radius scale: 4 (tags) / 8 (buttons, inputs). No large rounded cards.

## 6. Content honesty system
- `Sample` label (small-caps, `royal-deep`/70 %) on any illustrative value.
- No figures, rankings, partners, press or achievements unless sourced and recorded in a `docs/content-sources.md`.
- Entrance exam/eligibility facts require a source link before shipping.

## 7. Accessibility
- AA contrast verified for each ground × text pair; focus visible; 44 px targets on touch; all information in 3D also exists in DOM text; motion-safe alternatives (see 03, 06).
