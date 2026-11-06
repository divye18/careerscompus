import type { ReactNode } from 'react';
import { VERIFICATION, type VerificationStatus } from '@/content/verification';

/**
 * A verification label: always words plus a mark, so the state never depends on colour alone.
 * Verified and Partially verified are champagne because they rest on a source. Orientation and Not verified are ivory
 * because they do not, and Orientation uses a separate shape so it can never be mistaken for a lesser "Verified".
 */
const MARK: Record<VerificationStatus, ReactNode> = {
  verified: (
    <>
      <circle cx="6" cy="6" r="5.25" fill="currentColor" stroke="none" />
      <path d="M3.4 6.2 5.2 8l3.4-3.8" stroke="var(--color-ink-950)" />
    </>
  ),
  partial: (
    <>
      <circle cx="6" cy="6" r="5.25" />
      <path d="M6 .75a5.25 5.25 0 0 0 0 10.5z" fill="currentColor" stroke="none" />
    </>
  ),
  orientation: <path d="M6 .9 11.1 6 6 11.1.9 6z" />,
  unverified: <circle cx="6" cy="6" r="5.25" strokeDasharray="2 2" />,
};

const TONE: Record<VerificationStatus, string> = {
  verified: 'text-champagne',
  partial: 'text-champagne',
  orientation: 'text-ivory/85',
  unverified: 'text-ivory/75',
};

export function StatusLabel({ state, className = '' }: { state: VerificationStatus; className?: string }) {
  const s = VERIFICATION[state];
  return (
    <span data-status={state} title={s.meaning} className={`inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] ${TONE[state]} ${className}`}>
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        {MARK[state]}
      </svg>
      {s.label}
    </span>
  );
}

/** What the labels mean, in plain text (never hover-only). */
export function StatusLegend({ states, className = '' }: { states: readonly VerificationStatus[]; className?: string }) {
  return (
    <dl className={className}>
      {states.map((state) => (
        <div key={state}>
          <dt>
            <StatusLabel state={state} />
          </dt>
          <dd className="mt-1 text-[13px] leading-snug text-ivory/80">{VERIFICATION[state].meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
