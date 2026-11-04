'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

/**
 * SAMPLE content: a small illustrative set of well-known institutions.
 * Only publicly known basics (location, public/private) are shown. There are
 * no rankings, admission rates, placement figures or accreditation claims,
 * and no profile pages exist yet.
 */
const universities = [
  { id: 'iit-delhi', name: 'Indian Institute of Technology Delhi', location: 'New Delhi', type: 'Public' },
  { id: 'bits-pilani', name: 'BITS Pilani', location: 'Pilani, Rajasthan', type: 'Private' },
  { id: 'vit-vellore', name: 'VIT Vellore', location: 'Vellore, Tamil Nadu', type: 'Private' },
  { id: 'du', name: 'University of Delhi', location: 'New Delhi', type: 'Public' },
];

export function UniversityPreview() {
  return (
    <div className="relative py-16 sm:py-24">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <span className="inline-block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-royal-blue)] mb-4">
              Universities
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-semibold text-[var(--color-royal-deep)] leading-tight">
              Where will your <br />
              <span className="italic font-medium text-[var(--color-royal-blue)]">journey unfold?</span>
            </h2>
          </div>
          <p className="text-[var(--color-royal-deep)]/80 max-w-sm text-base leading-relaxed">
            A university directory is on the way. These four institutions are sample entries that show how listings
            will look.
          </p>
        </motion.div>

        <ul className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible gap-5 pb-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0 list-none">
          {universities.map((u, i) => (
            <motion.li
              key={u.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-start"
            >
              <article className="h-full flex flex-col justify-between bg-white border border-[var(--color-royal-deep)]/10 rounded-md p-7">
                <div>
                  <span
                    className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded text-[var(--color-royal-deep)] ${
                      u.type === 'Public' ? 'bg-[var(--color-accent-sky)]/50' : 'bg-[var(--color-bg-lavender)]'
                    }`}
                  >
                    {u.type}
                  </span>
                  <h3 className="mt-5 text-2xl font-display font-semibold text-[var(--color-royal-deep)] leading-snug">
                    {u.name}
                  </h3>
                </div>

                <div className="mt-10 pt-5 border-t border-[var(--color-royal-deep)]/10">
                  <p className="flex items-center gap-2 text-sm text-[var(--color-royal-deep)]/80">
                    <MapPin className="w-4 h-4 shrink-0 text-[var(--color-royal-blue)]" aria-hidden="true" />
                    {u.location}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-wider text-[var(--color-royal-deep)]/60">
                    Sample listing
                  </p>
                </div>
              </article>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
