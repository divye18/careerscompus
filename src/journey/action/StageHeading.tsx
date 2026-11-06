/** A stage heading: its number, and a bead sitting on the route meridian. */
export function StageHeading({ id, n, children }: { id: string; n: string; children: string }) {
  return (
    <h3 id={id} className="relative font-atlas text-[clamp(32px,4vw,44px)] font-normal leading-tight text-ivory">
      <span aria-hidden="true" data-no-print className="absolute -left-[32px] top-[0.55em] h-2 w-2 -translate-x-1/2 rounded-pill bg-champagne sm:-left-[40px] lg:-left-[48px]" />
      <span aria-hidden="true" className="mr-3 align-middle font-mono text-[13px] tracking-[0.14em] text-champagne">{n}</span>
      {children}
    </h3>
  );
}
