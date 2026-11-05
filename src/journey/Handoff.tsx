/**
 * TEMPORARY handoff from the night journey (Scenes 1–2) to the interim sections below.
 * Night lifts to ivory like first light — the "dawn" the full storyboard uses before Scene 4.
 * A brass hairline with a bead continues the needle motif. Replaced when Scene 3+ land.
 *
 * Seams: the top is --handoff-top, the same colour the stage and the flow Discover section end on;
 * the champagne glow is faded out before the bottom edge so it meets flat ivory without a line.
 */
export function Handoff() {
  return (
    <div
      aria-hidden="true"
      className="relative -mt-px h-[clamp(200px,28vh,280px)] overflow-hidden bg-[linear-gradient(to_bottom,var(--handoff-top)_0%,color-mix(in_srgb,var(--color-aubergine)_38%,var(--color-ivory))_58%,var(--color-ivory)_100%)]"
    >
      {/* top half is still night: keeps the header in its night theme until the ground has lifted */}
      <div data-header-theme="night" className="absolute inset-x-0 top-0 h-1/2" />
      <div className="absolute inset-0 bg-[radial-gradient(52%_100%_at_50%_74%,rgb(201_169_110/0.34)_0%,rgb(201_169_110/0)_72%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent to-ivory" />
      <div className="absolute left-1/2 top-0 h-[40%] w-px -translate-x-1/2 bg-gradient-to-b from-champagne/80 to-champagne/0" />
      <div className="absolute left-1/2 top-[40%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne" />
    </div>
  );
}
