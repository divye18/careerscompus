'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const universities = [
  { id: 'iit-delhi', name: 'Indian Institute of Technology Delhi', loc: 'New Delhi', type: 'Public', acc: 'NAAC A++', rating: '4.5', city: 'Delhi', stats: '2.4% Acceptance' },
  { id: 'bits-pilani', name: 'BITS Pilani', loc: 'Pilani, Rajasthan', type: 'Private', acc: 'NAAC A', rating: '4.4', city: 'Pilani', stats: '100% Placement' },
  { id: 'vit-vellore', name: 'VIT Vellore', loc: 'Vellore, Tamil Nadu', type: 'Private', acc: 'NAAC A++', rating: '4.3', city: 'Vellore', stats: 'Global Connect' },
  { id: 'du', name: 'University of Delhi', loc: 'New Delhi', type: 'Public', acc: 'NAAC A+', rating: '4.2', city: 'Delhi', stats: 'Diverse Alumni' },
];

const horizonCities = [
  { name: 'Delhi NCR', x: '10%', size: 6 },
  { name: 'Mumbai', x: '25%', size: 5 },
  { name: 'Bangalore', x: '50%', size: 5 },
  { name: 'Chennai', x: '70%', size: 4 },
  { name: 'Hyderabad', x: '85%', size: 4 },
];

export function UniversityPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const horizonY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const horizonOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-transparent py-24">
      {/* Abstract Academic Horizon — subtle city points */}
      <motion.div
        style={{ y: horizonY, opacity: horizonOpacity }}
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
      >
        {/* Horizon line */}
        <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-ch5-text)]/30 to-transparent" />
        
        {/* City indicator dots */}
        {horizonCities.map((city, i) => (
          <div
            key={i}
            className="absolute bottom-20 flex flex-col items-center"
            style={{ left: city.x }}
          >
            <span className="text-[10px] text-[var(--color-ch5-sand)] font-medium mb-2 whitespace-nowrap tracking-wider uppercase">{city.name}</span>
            <div
              className="rounded-full bg-[var(--color-ch5-terracotta)]"
              style={{ width: city.size, height: city.size }}
            />
            {/* Subtle glow beneath */}
            <div
              className="absolute -bottom-1 rounded-full bg-[var(--color-ch5-terracotta)]/20 blur-sm"
              style={{ width: city.size * 3, height: city.size * 3 }}
            />
          </div>
        ))}
      </motion.div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] uppercase tracking-[0.25em] font-medium text-[var(--color-ch5-terracotta)] mb-4">
              The Academic Horizon
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-medium text-[var(--color-ch5-text)] leading-tight">
              Where will your <br />
              <span className="italic font-light text-[var(--color-ch5-sand)]">journey unfold?</span>
            </h2>
          </div>
          <p className="text-[var(--color-ch5-sand)]/80 max-w-sm text-sm font-light leading-relaxed">
            Trace the coordinates of India&apos;s most prestigious institutions. Your academic destination is waiting on the horizon.
          </p>
        </motion.div>

        {/* Sophisticated horizontal scroll layout */}
        <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
          {universities.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="min-w-[300px] md:min-w-[360px] snap-start"
            >
              <Link
                href={`/universities/${u.id}`}
                className="group block h-full border border-[var(--color-ch5-text)]/10 p-6 flex flex-col justify-between hover:border-[var(--color-ch5-terracotta)]/50 transition-colors duration-500 relative overflow-hidden bg-[var(--color-ch5-bg)]/40 backdrop-blur-sm"
              >
                {/* Elegant Typography Header instead of grey box */}
                <div className="mb-12 relative z-10">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--color-ch5-terracotta)] mb-4 flex items-center gap-2">
                    <span className="w-4 h-px bg-[var(--color-ch5-terracotta)]"></span>
                    {u.city}
                  </div>
                  <h3 className="text-2xl font-display font-medium text-[var(--color-ch5-text)] leading-snug group-hover:text-[var(--color-ch5-sand)] transition-colors">
                    {u.name}
                  </h3>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center text-xs text-[var(--color-ch5-sand)]/70 mb-6 gap-2 font-light">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-ch5-terracotta)]" /> {u.loc}
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-[var(--color-ch5-text)]/10 pt-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-ch5-sand)]/50">Focus</span>
                      <span className="text-xs text-[var(--color-ch5-text)] font-light">{u.stats}</span>
                    </div>
                    
                    <span className="text-[var(--color-ch5-terracotta)] group-hover:translate-x-2 transition-transform duration-300">
                      <ArrowRight className="w-5 h-5 stroke-[1.5]" />
                    </span>
                  </div>
                </div>

                {/* Subtle background element */}
                <div className="absolute -right-8 -bottom-8 text-8xl font-display font-bold text-[var(--color-ch5-text)]/[0.02] select-none pointer-events-none group-hover:text-[var(--color-ch5-text)]/[0.04] transition-colors duration-500">
                  {u.city.charAt(0)}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
