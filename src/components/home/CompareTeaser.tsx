'use client';

import { motion } from 'framer-motion';

const comparison = {
  attributes: ['Duration', 'Eligibility', 'Fees', 'Career Paths'],
  // No figures here: durations, eligibility and fees differ by institution and none is verified for this preview.
  courseA: { name: 'B.Tech', values: ['Not verified yet', 'Not verified yet', 'Not verified yet', 'Software, AI, Data (orientation)'] },
  courseB: { name: 'BCA', values: ['Not verified yet', 'Not verified yet', 'Not verified yet', 'Web, IT, Support (orientation)'] },
};

export function CompareTeaser() {
  return (
    <div className="py-24 sm:py-32 relative z-10 pointer-events-none">
      <div className="container mx-auto px-6 max-w-7xl pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4 flex flex-col justify-center"
          >
            <div className="text-champagne-800 font-mono text-sm tracking-widest mb-6">DECIDE</div>
            <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-ch6-text)] leading-[1.1] mb-6">
              Compare your options<br />
              <span className="font-serif italic text-[var(--color-ch6-graphite)]">with clarity.</span>
            </h2>
            <p className="text-lg text-[var(--color-ch6-graphite)] opacity-80 mb-8 font-light">
              A side-by-side comparison of courses and institutions is planned. It is not available yet, and nothing here is a real comparison.
            </p>
            <div>
              <span className="inline-flex items-center gap-3 px-6 py-4 border border-[var(--color-ch6-text)]/30 text-[var(--color-ch6-text)]/80 font-mono text-xs uppercase tracking-widest w-fit">
                Comparison · not available yet
              </span>
              <p className="mt-3 text-sm text-[var(--color-ch6-graphite)]">
                This table shows the layout only. Values will appear once they are verified. The career paths row is general orientation, not a verified record.
              </p>
            </div>
          </motion.div>

          {/* Right: Clean Editorial Table */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-8 flex items-center"
          >
            <div className="w-full">
              {/* Header */}
              <div className="grid grid-cols-3 border-b border-[var(--color-ch6-text)] pb-4 mb-4">
                <div className="text-xs font-mono tracking-widest text-champagne-800">ATTRIBUTE</div>
                <div className="text-lg font-display font-medium text-[var(--color-ch6-text)]">{comparison.courseA.name}</div>
                <div className="text-lg font-display font-medium text-[var(--color-ch6-text)]">{comparison.courseB.name}</div>
              </div>
              {/* Rows */}
              {comparison.attributes.map((attr, i) => (
                <div
                  key={attr}
                  className="grid grid-cols-3 py-4 border-b border-[var(--color-ch6-graphite)]/20"
                >
                  <div className="text-sm font-medium text-[var(--color-ch6-graphite)] flex items-center">{attr}</div>
                  <div className="text-sm font-light text-[var(--color-ch6-text)] pr-4">{comparison.courseA.values[i]}</div>
                  <div className="text-sm font-light text-[var(--color-ch6-text)] pr-4">{comparison.courseB.values[i]}</div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
