# 02 — Scroll Storyboard (Desktop)

Status: PROPOSAL. Scroll lengths are in viewport heights (vh); `progress` = 0→1 across the whole pinned journey.

## 0. Frame
- **Stage:** a single `100dvh` sticky stage. Scenes 1–7 live inside it. Scene 8 and the footer are normal flowing content after the stage.
- **Persistent UI (all scenes):** wordmark top-left; "Get Guidance" CTA top-right (scrolls to Scene 8); right-hand **Direction Rail** (scene index + progress dots, labels in small caps); a "Scroll" cue in Scene 1 only.
- **Total pinned length:** ~1000 vh (≈ 9,000 px at 900 px height).

| Scene | Name | Length | Cumulative progress |
|---|---|---|---|
| 1 | Arrival | 100 vh (hold + first move) | 0.00 – 0.10 |
| 2 | Discover your direction | 110 vh | 0.10 – 0.21 |
| 3 | Explore possibilities (7 domains) | 290 vh | 0.21 – 0.50 |
| 4 | Courses & learning routes | 130 vh | 0.50 – 0.63 |
| 5 | Universities (constellation) | 130 vh | 0.63 – 0.76 |
| 6 | Compare your options | 130 vh | 0.76 – 0.89 |
| 7 | Find your next step | 110 vh | 0.89 – 1.00 |
| 8 | Guidance (after the stage) | normal flow | — |

(Sum ≈ 1000 vh; exact values tuned in build.)

---

## Scene 01 — The Introduction ("Arrival")
**Idea:** *You are standing at a crossroads.*
**Ground:** warm paper (`Paper`), soft dawn light gradient at the horizon.
**Visual:** a large brass-and-ivory compass instrument, slightly tilted, centred-right. Its needle does not settle: **five faint ghost needles** point in different directions and drift slowly — "more than one direction".
**Type:** headline in oversized serif — *Your Future Has More Than One Direction.* (second clause in italic). One line of support: "Explore careers, courses and universities — and find the route that's yours."
**Interaction:** the search field and two CTAs (current functionality, preserved). Pointer parallax tilts the compass ±4°.
**Scroll behaviour (0 → 0.10):** headline lines slide up and fade (stagger), compass rises to the stage centre and scales up 1.0 → 1.25; ghost needles lengthen. Scroll cue fades in the first 3 vh.
**Exit:** paper ground cools toward a pale sky tint as the needles extend.

## Scene 02 — Discover Your Direction
**Idea:** *Every direction is a different world.*
**Visual:** the ghost needles lengthen into **seven meridian lines** radiating across the whole stage. At the end of each line a **domain mark** (a small engraved glyph + name) appears: Technology, Medicine, Business, Design, Law, Architecture, Science. Each line takes its domain hue as it arrives — the page begins to gain colour.
**Type:** centred small-caps label "7 directions to begin with" (a statement about our launch scope, not a statistic) and a short headline: *Pick a direction.*
**Scroll behaviour (0.10 → 0.21):** needles extend one by one (staggered by 6 % of the scene), domain marks fade in with a 200 ms delay after their needle lands. At the end, the camera begins to dolly toward the first domain.
**Hover/tap:** a mark scales 1.08 and its line brightens; click jumps scroll to that domain in Scene 3.

## Scene 03 — Explore Career Possibilities
**Idea:** *Step inside a direction.*
**Visual:** the stage becomes a **domain gallery** that scrubs through seven sub-scenes while the **compass stays small at the centre-bottom as a fixed anchor** (it points to the active domain). Each domain has:
- a full-stage **colour world** (tinted ground + domain hue),
- a **signature 3D object** (procedural, material-driven): *Technology* — prismatic lattice; *Medicine* — slow double helix in satin glass; *Business* — ascending offset planes; *Design* — intersecting ribbons; *Law* — balanced beam & plates, abstracted; *Architecture* — a field of extruded forms; *Science* — orbit of spheres on rings,
- giant ghosted domain name behind the object (editorial, 8–10 % opacity),
- left: domain name (serif, large) + one-sentence description; right: **"Paths in"** — 3–4 typical routes (e.g. degree programmes) and **"Ways it shows up"** — 3–4 role *types* (no salaries, no promises).
**Rail:** the Direction Rail highlights the current domain (labels visible).
**Scroll behaviour (0.21 → 0.50):** each domain occupies ~41 vh: 8 vh in-transition, 25 vh hold with slow object rotation, 8 vh out-transition. Transition = colour-world cross-dissolve (ground colour lerp), object swap through a 0.9 → 0 scale-and-rotate exit and a 0 → 1 entry, text masks sliding in/out.
**Interaction:** click a rail label to jump; keyboard `←/→` on the rail; hover the object to nudge its rotation.
**Why not cards:** one domain, one world, one object — never a grid.

## Scene 04 — Courses and Learning
**Idea:** *Every direction has a route.*
**Visual:** the last domain's object unfolds into a **horizontal route drawn as a line** (SVG stroke animates with scroll): *After Class 12 → Degree → Specialisation → Career*. Course "stops" sit on the route as editorial typographic markers (not cards). The compass shrinks to the route's starting point.
**Content:** illustrative examples (clearly labelled *Illustrative — verify with the institution*): e.g. B.Tech, MBBS, BBA→MBA, B.Des, LLB, B.Arch, B.Sc. For the selected domain, show eligibility *type* ("typically needs: Class 12 with …") and duration ranges **only when verified**; otherwise omit.
**Scroll behaviour (0.50 → 0.63):** route line draws left → right; each stop reveals with a 120 ms stagger; the supporting paragraph fades in at 60 % of the scene.
**Interaction:** hover/focus a stop expands a short, readable panel. A domain switcher (small pills) lets the user re-point the route.

## Scene 05 — Universities
**Idea:** *Places that could be yours.*
**Visual:** ground shifts to deep ink (`Ink`) — the first dark scene, giving the journey a visual "night". A **constellation**: points of light arranged by *region clusters* (North, South, East, West, Central) rather than a literal map, so there is no border/geography risk. Faint lines connect institutions sharing a property (e.g. type). Slow parallax on three depth layers.
**Content:** only verified, basic facts (name, city, public/private) — until a data source exists, the scene shows the **four sample entries** labelled "Sample". **No rankings, grades, placement or admission statistics.**
**Scroll behaviour (0.63 → 0.76):** ground cross-fades paper → ink; stars appear region by region; the camera drifts forward (scale 1 → 1.15).
**Interaction:** hover/focus an institution → name, type and location in a readable tooltip; click → (future) profile; today "Profile coming soon".

## Scene 06 — Compare Your Options
**Idea:** *Side by side, nothing hidden.*
**Visual:** two constellation points slide to left/right and the ground cross-fades ink → paper while a **comparison ledger** draws itself between them: rows for **Fees, Duration, Eligibility, Entrance exams, Courses offered, Location**. Cells show illustrative placeholders in a distinct "sample" style until real data exists.
**Scroll behaviour (0.76 → 0.89):** rows reveal one at a time (every ~8 vh), the active row highlights; a subtle "difference" marker appears where values differ.
**Interaction:** a "Swap" button and two selectors (disabled/labelled "coming soon" until the data layer exists).

## Scene 07 — Find Your Next Step
**Idea:** *From many directions to yours.*
**Visual:** all domain meridians **converge** on the compass; the multiple needles collapse into **one needle** that settles on a single heading while the ground warms to a soft champagne dawn. Three steps appear as a simple list: **Shortlist → Check eligibility and exams → Talk it through.**
**Scroll behaviour (0.89 → 1.00):** needles interpolate to one angle (ease-out); steps type-in sequentially; at 100 % the stage un-pins and the page continues.
**Payoff:** the visual arc of the whole page resolves here.

## Scene 08 — Guidance and Counselling (flow section)
**Idea:** *One clear next action.*
**Visual:** the settled compass (small) above a centred, calm layout on paper ground.
**Content:** honest preview of the callback form (validation + clear "nothing was sent" confirmation — current logic preserved), FAQ (honest answers), footer.
**Interaction:** standard scroll-reveal; no pinned behaviour.

---

## Copy rules (all scenes)
- No invented numbers, rankings, partnerships or outcomes.
- Illustrative content is labelled.
- Entrance-exam and eligibility specifics appear only once verified against official sources.

## Direction Rail (specification summary)
Right edge, vertical; 8 items (S1…S7 + S8 marker). Current item: label visible + filled dot; others: dots only (labels on hover/focus). Keyboard-focusable; each item is an anchor that scrolls to the scene's start offset.
