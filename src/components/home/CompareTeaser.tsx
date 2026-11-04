'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const comparison = {
  attributes: ['Duration', 'Eligibility', 'Avg. Fees', 'Career Paths'],
  courseA: { name: 'B.Tech CSE', values: ['4 Years', '10+2 (PCM)', '₹2L—₹15L/yr', 'Software, AI, Data'] },
  courseB: { name: 'BCA', values: ['3 Years', '10+2 (Any)', '₹50K—₹3L/yr', 'Web, IT, Support'] },
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
            <div className="text-[var(--color-ch6-accent)] font-mono text-sm tracking-widest mb-6">05 / DECIDE</div>
            <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-ch6-text)] leading-[1.1] mb-6">
              Compare your options<br />
              <span className="font-serif italic text-[var(--color-ch6-graphite)]">with clarity.</span>
            </h2>
            <p className="text-lg text-[var(--color-ch6-graphite)] opacity-80 mb-8 font-light">
              Information is the antidote to uncertainty. Align universities, courses, and fees side-by-side to make your final decision.
            </p>
            <Link 
              href="/compare" 
              className="inline-flex items-center gap-3 px-6 py-4 bg-[var(--color-ch6-text)] text-[var(--color-ch6-bg)] font-mono text-xs uppercase tracking-widest hover:bg-[var(--color-ch6-accent)] transition-colors w-fit"
            >
              Start Comparison <ArrowRight className="w-4 h-4" />
            </Link>
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
                <div className="text-xs font-mono tracking-widest text-[var(--color-ch6-accent)]">ATTRIBUTE</div>
                <div className="text-lg font-display font-medium text-[var(--color-ch6-text)]">{comparison.courseA.name}</div>
                <div className="text-lg font-display font-medium text-[var(--color-ch6-text)]">{comparison.courseB.name}</div>
              </div>
              {/* Rows */}
              {comparison.attributes.map((attr, i) => (
                <div
                  key={attr}
                  className="grid grid-cols-3 py-4 border-b border-[var(--color-ch6-graphite)]/20 hover:bg-[var(--color-ch6-accent)]/5 transition-colors"
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
