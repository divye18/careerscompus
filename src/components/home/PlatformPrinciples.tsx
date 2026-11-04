'use client';

import { motion } from 'framer-motion';

/**
 * Replaces the former TrustStats block. It contained unverified numbers and
 * press/media names. Only statements of intent are shown here: no counts,
 * partners, press mentions or outcomes.
 */
const principles = [
  {
    title: 'Start from the career',
    body: 'Begin with what you might want to become, then work back to the courses and institutions that can lead there.',
  },
  {
    title: 'Compare side by side',
    body: 'Line options up on the same criteria so the trade-offs between courses and universities are easy to see.',
  },
  {
    title: 'Plain, honest information',
    body: 'Clear language and no inflated promises. This site is an early preview and its sample content is labelled as such.',
  },
];

export function PlatformPrinciples() {
  return (
    <section className="py-16 border-b border-[var(--color-royal-deep)]/10 pointer-events-none">
      <div className="container mx-auto px-6 max-w-7xl pointer-events-auto">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-royal-blue)] mb-8">
          What we&apos;re building
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-t border-[var(--color-royal-deep)]/15 pt-5"
            >
              <h3 className="text-xl font-display font-semibold text-[var(--color-royal-deep)] mb-2">{p.title}</h3>
              <p className="text-base text-[var(--color-royal-deep)]/80 leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
