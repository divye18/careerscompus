'use client';

import { motion } from 'framer-motion';

/**
 * Guidance section — callback requests are NOT available. There is no backend, so the form is a disabled outline of what
 * will exist: it collects nothing (no name, no phone number), sends nothing and never shows a success message.
 * When a real, approved service exists this becomes a working form again.
 */

const LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma'];

const labelClass =
  'block text-xs font-semibold text-[var(--color-royal-blue)] mb-1 uppercase tracking-widest';
const fieldClass =
  'w-full min-h-[44px] bg-transparent text-[var(--color-accent-midnight)] py-2.5 focus:outline-none text-base disabled:cursor-not-allowed disabled:opacity-70';

export function CounsellingCTA() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden pointer-events-none">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="text-[var(--color-royal-blue)] font-mono text-sm tracking-widest mb-6">GUIDANCE</div>
            <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-accent-midnight)] leading-[1.1] mb-6">
              When the possibilities
              <br />
              <span className="font-serif italic text-[var(--color-royal-blue)]">feel overwhelming,</span>
            </h2>
            <p className="text-xl text-[var(--color-royal-deep)]/85 font-light mb-8 max-w-md">
              Choosing a direction is easier with a little help. A callback service is planned, but it is not available yet.
            </p>
            <p className="max-w-md border-l border-[var(--color-royal-blue)]/30 pl-6 text-[var(--color-accent-midnight)] font-light">
              For now, talk it over with teachers, family or a school counsellor, and use the career and course sections above as a starting point.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 lg:col-start-7 w-full"
          >
            <div className="bg-[var(--color-bg-lavender)] p-6 sm:p-12 border border-[var(--color-royal-blue)]/20 rounded-atlas-sm">
              <h3 className="text-2xl font-display font-light text-[var(--color-accent-midnight)] mb-2">
                Callback requests are not available yet
              </h3>
              <p role="status" className="text-base text-[var(--color-royal-deep)] mb-8">
                Nothing can be submitted here, and we are not collecting names or phone numbers. This is an outline of the form to come.
              </p>

              <form className="space-y-6" aria-label="Callback request (not available)" onSubmit={(e) => e.preventDefault()}>
                <fieldset disabled className="space-y-6">
                  <div className="border-b border-[var(--color-royal-blue)]/30">
                    <label htmlFor="cc-level" className={labelClass}>Interested In</label>
                    <select id="cc-level" className={fieldClass} defaultValue={LEVELS[0]}>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled
                    aria-disabled="true"
                    className="w-full min-h-[52px] mt-4 border border-[var(--color-royal-blue)]/40 text-[var(--color-royal-deep)] font-semibold text-sm tracking-widest uppercase cursor-not-allowed"
                  >
                    Not available yet
                  </button>
                </fieldset>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
