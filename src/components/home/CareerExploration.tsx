'use client';

import { useState } from 'react';


const careers = [
  { id: 1, title: 'Technology', desc: 'Software, AI, and digital infrastructure.', color: '#3155D9' },
  { id: 2, title: 'Medicine', desc: 'Healthcare, surgery, and medical research.', color: '#365C52' },
  { id: 3, title: 'Business', desc: 'Leadership, finance, and global markets.', color: '#1E2A78' },
  { id: 4, title: 'Data Science', desc: 'Analytics, machine learning, and statistics.', color: '#0EA5E9' },
  { id: 5, title: 'Architecture', desc: 'Urban design, structures, and spaces.', color: '#B8755E' },
  { id: 6, title: 'Law', desc: 'Justice, corporate counsel, and advocacy.', color: '#D8B86A' },
];

export function CareerExploration() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleHover = (id: number | null) => {
    setHoveredId(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('career-hover', { detail: { id } }));
    }
  };

  return (
    <section className="py-24 sm:py-32 relative z-10 pointer-events-none">
      <div className="container mx-auto px-6 max-w-7xl pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Text & Index */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <span className="inline-block text-[11px] uppercase tracking-[0.25em] font-medium text-[var(--color-royal-blue)] mb-4">
                01 / EXPLORE
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-royal-deep)] leading-tight mb-8">
                What will <br className="hidden lg:block" />
                you <span className="italic font-medium text-[var(--color-royal-blue)]">become?</span>
              </h2>
              <p className="text-[var(--color-royal-deep)] opacity-70 text-sm leading-relaxed max-w-sm font-light mb-12">
                Discover the interconnected pathways of the future economy.
              </p>

              <div className="flex flex-col group/list">
                {careers.map((c, i) => {
                  const isOtherHovered = hoveredId !== null && hoveredId !== c.id;

                  return (
                    <div
                      key={c.id}
                      tabIndex={0}
                      onFocus={() => handleHover(c.id)}
                      onBlur={() => handleHover(null)}
                      onMouseEnter={() => handleHover(c.id)}
                      onMouseLeave={() => handleHover(null)}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[var(--color-royal-deep)]/10 transition-all duration-300 hover:pl-2 focus-visible:pl-2 focus:outline-none relative ${
                        isOtherHovered ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-baseline gap-4 relative z-10">
                        <span className="font-mono text-xs text-[var(--color-royal-blue)] opacity-50 group-hover:opacity-100 transition-opacity w-5">0{i+1}</span>
                        <h3 className="text-xl font-display text-[var(--color-royal-deep)] transition-colors duration-300 group-hover:text-[var(--color-royal-blue)]">
                          {c.title}
                        </h3>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 relative z-10">
                        <p className="text-xs text-[var(--color-royal-deep)] opacity-60 max-w-[180px] hidden sm:block">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visualization Space */}
          <div data-compass-anchor data-compass-nodes aria-hidden="true" className="lg:col-span-7 h-[360px] sm:h-[460px] lg:h-[520px] pointer-events-none">
            {/* The global Scroll3DScene renders the interactive nodes here */}
          </div>
          
        </div>
      </div>
    </section>
  );
}
