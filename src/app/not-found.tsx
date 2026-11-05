import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist on CareersCompus.',
  robots: { index: false },
};

const link =
  'inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-cyan';

/** Only the homepage exists so far, so every way out of this page leads to one of its real sections. */
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col justify-center bg-ink-950 px-5 py-16 text-ivory sm:px-12 lg:px-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-champagne">Error 404</p>
      <h1 className="mt-4 max-w-3xl font-atlas text-[clamp(44px,8vw,96px)] font-normal leading-[1] tracking-[-0.01em] text-ivory">
        This page is <span className="italic text-champagne">off the map.</span>
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ivory/85">The address may be mistyped, or the page may not exist yet. These are good places to pick up your bearings.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={`${link} bg-ivory text-ink-950 hover:bg-ivory-100`}>
          Back to the start
        </Link>
        <Link href="/#act-courses" className={`${link} border border-ivory/30 text-ivory hover:border-ivory/60`}>
          Course pathways
        </Link>
        <Link href="/#act-universities" className={`${link} border border-ivory/30 text-ivory hover:border-ivory/60`}>
          University atlas
        </Link>
      </div>
    </main>
  );
}
