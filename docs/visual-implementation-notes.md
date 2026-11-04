# CareersCompus - Visual Implementation Notes

## Architecture Overview
The homepage prototype for CareersCompus was successfully implemented following a **Hybrid Visual System**. It combines a premium, cinematic 3D entrance (Hero) with highly readable, clean editorial UI for the content sections, delivering on the "Your Future Has More Than One Direction" concept without sacrificing accessibility or readability.

## Design System & Styling
- **CSS Framework**: Tailwind CSS v4, utilizing `@theme` blocks in `globals.css`.
- **Color Usage**: 
  - `bg-white` and `bg-slate-50` used for structural content elements.
  - `text-slate-900` used for authoritative headings.
  - Deep Cinematic Palette (`#080B18`, `#11163A`, `#5B5CE2`, `#38BDF8`) reserved exclusively for the 3D environment and Hero.
- **Typography**: 
  - **Plus Jakarta Sans** mapped to `font-display` for confident, editorial headlines.
  - **Inter** mapped to `font-sans` for highly readable body copy.

## Hybrid Cinematic Journey
The homepage relies on continuous scroll progression to blend a deep, immersive 3D world with clean content sections.
- **Layered Composition**: A global `<CinematicEnvironment>` sits fixed in the background (`-z-10`). The `Hero` and `FinalCTA` sections are transparent, revealing the deep space/compass world. The middle sections (Career Exploration, Universities, etc.) feature solid white/off-white backgrounds that smoothly cover the 3D world, ensuring zero contrast issues for text-heavy content.
- **Entrance Sequence**: The Hero features a staggered, cinematic entrance (1.4s headline reveal, 1.6s search reveal) over a 3D compass that slowly materializes its core, rings, and career nodes organically.
- **Scroll Tracking**: `useScroll` from `framer-motion` maps the user's scroll depth across the page. This is fed directly into the `useFrame` loop of the `@react-three/fiber` canvas, causing the camera to move and the compass to shift deeper as the user explores the content.

## The Premium Career Compass
The visual centerpiece in the Hero is crafted using `three` and `@react-three/drei`.
- **Materials**: Utilizes `MeshTransmissionMaterial` for a futuristic, glassy, metallic look that bends light around a glowing cyan core.
- **Organic Nodes**: Career nodes (Technology, Medicine, etc.) orbit at varying depths, radii, and speeds. Hovering over a node increases its brightness, scales it up, and draws a subtle connection line to the center, alongside a premium HTML tooltip.

## Reusable Component Structure
1.  **Layout**: `Header.tsx` (Transitions from transparent/dark to glassy/light on scroll), `Footer.tsx`.
2.  **Base UI (`src/components/ui/`)**: `Button.tsx`, `Input.tsx`, `Badge.tsx`.
3.  **Homepage Sections (`src/components/home/`)**:
    -   `CareerExploration.tsx`, `PopularStreams.tsx`, `FeaturedCourses.tsx`
    -   `UniversityPreview.tsx`, `CompareTeaser.tsx`, `HowItWorks.tsx`
    -   `CounsellingCTA.tsx`, `TrustStats.tsx`, `FAQSection.tsx`, `FinalCTA.tsx`

## Accessibility & Performance
- **Optimized Rendering**: The 3D canvas disables complex shadows, limits the node/particle count, and uses efficient instancing/geometries for better performance.
- **Readable Contrast**: The hybrid approach guarantees that text-heavy catalog sections (Courses, Universities) retain classic web contrast standards (dark slate on white).
- **Graceful Degradation**: Devices with limited WebGL support will automatically fallback to the rich CSS gradient background defined in the `CinematicEnvironment` container.
