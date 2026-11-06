/**
 * Instrument Serif has no alternate numerals, and its "1" reads like a capital I or a lowercase l ("17" looks like "l7").
 * Digits inside display text are therefore set in JetBrains Mono, scaled to sit with the serif. Use this for any display
 * text that can contain a number (DESIGN_CONSTITUTION section 4).
 */
export function Figures({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <span key={i} className="font-mono text-[0.8em] tracking-[-0.04em]">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
