'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    id: 'computer-science',
    label: 'Computer Science',
    featured: {
      title: 'B.Tech Computer Science & Eng.',
      description: 'The foundation of the digital age. A rigorous four-year program covering algorithms, AI, systems, and software engineering.',
      duration: '4 Years',
      fees: '₹2L – ₹15L/yr',
      level: 'Undergraduate',
      outcomes: ['Software Engineer', 'Data Scientist', 'AI Researcher'],
      link: '/courses/btech-cse'
    }
  },
  {
    id: 'engineering',
    label: 'Core Engineering',
    featured: {
      title: 'B.Tech Mechanical Engineering',
      description: 'Classical engineering principles applied to modern problems in manufacturing, robotics, and energy systems.',
      duration: '4 Years',
      fees: '₹1L – ₹12L/yr',
      level: 'Undergraduate',
      outcomes: ['Mechanical Engineer', 'Robotics Specialist', 'Operations Manager'],
      link: '/courses/btech-mech'
    }
  },
  {
    id: 'medicine',
    label: 'Medicine',
    featured: {
      title: 'Bachelor of Medicine, Bachelor of Surgery',
      description: 'An intensive medical program producing the next generation of physicians, surgeons, and healthcare leaders.',
      duration: '5.5 Years',
      fees: '₹5L – ₹50L/yr',
      level: 'Undergraduate',
      outcomes: ['Physician', 'Surgeon', 'Medical Researcher'],
      link: '/courses/mbbs'
    }
  },
  {
    id: 'management',
    label: 'Management',
    featured: {
      title: 'Master of Business Administration',
      description: 'Premier business leadership program focusing on strategic thinking, finance, marketing, and global operations.',
      duration: '2 Years',
      fees: '₹5L – ₹25L/yr',
      level: 'Postgraduate',
      outcomes: ['Management Consultant', 'Product Manager', 'Investment Banker'],
      link: '/courses/mba'
    }
  },
  {
    id: 'design',
    label: 'Design',
    featured: {
      title: 'Bachelor of Design',
      description: 'Interdisciplinary program merging aesthetics, technology, and human-centered problem solving.',
      duration: '4 Years',
      fees: '₹2L – ₹10L/yr',
      level: 'Undergraduate',
      outcomes: ['UX Designer', 'Industrial Designer', 'Art Director'],
      link: '/courses/bdes'
    }
  },
  {
    id: 'law',
    label: 'Law',
    featured: {
      title: 'Bachelor of Laws (LLB)',
      description: 'Comprehensive legal education covering constitutional, criminal, and corporate law jurisprudence.',
      duration: '3 Years',
      fees: '₹50K – ₹5L/yr',
      level: 'Undergraduate',
      outcomes: ['Advocate', 'Corporate Counsel', 'Legal Advisor'],
      link: '/courses/llb'
    }
  }
];

export function FeaturedCourses() {
  const [activeId, setActiveId] = useState(categories[0].id);

  const activeCategory = categories.find(c => c.id === activeId) || categories[0];
  const activeIndex = categories.findIndex(c => c.id === activeId);

  return (
    <div className="relative overflow-hidden py-24 bg-transparent text-[var(--color-ch4-text)]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 border-b border-[var(--color-ch4-text)]/10 pb-6 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <h2 className="text-4xl md:text-5xl font-display font-light tracking-tight">
            Knowledge <span className="font-semibold">Archive</span>
          </h2>
          <span className="text-sm font-medium tracking-widest uppercase text-[var(--color-ch4-accent)]">
            Editorial Selection
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column: Index List */}
          <div className="w-full lg:w-1/3 flex flex-col">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveId(cat.id)}
                className={`group cursor-pointer py-4 border-b border-[var(--color-ch4-text)]/10 transition-colors duration-300 ${
                  activeId === cat.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-xs font-mono mt-1 w-6">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-medium">
                    {cat.label}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Details */}
          <div className="w-full lg:w-2/3 min-h-[400px] flex items-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full"
              >
                <div className="flex flex-col h-full">
                  <div className="text-[120px] leading-none font-display font-light text-[var(--color-ch4-text)]/5 absolute -top-16 -left-8 pointer-events-none select-none">
                    {(activeIndex + 1).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 text-xs font-medium tracking-widest uppercase border border-[var(--color-ch4-text)]/20 text-[var(--color-ch4-text)] mb-6 rounded-full">
                      {activeCategory.featured.level}
                    </span>
                    
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight mb-6 text-[var(--color-ch4-text)]">
                      {activeCategory.featured.title}
                    </h3>
                    
                    <p className="text-lg md:text-xl leading-relaxed text-[var(--color-ch4-text)]/70 mb-10 max-w-2xl font-sans font-light">
                      {activeCategory.featured.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-[var(--color-ch4-text)]/10 mb-10">
                      <div>
                        <div className="text-xs tracking-widest uppercase text-[var(--color-ch4-text)]/50 mb-2">Duration</div>
                        <div className="text-lg font-medium">{activeCategory.featured.duration}</div>
                      </div>
                      <div>
                        <div className="text-xs tracking-widest uppercase text-[var(--color-ch4-text)]/50 mb-2">Avg. Fees</div>
                        <div className="text-lg font-medium">{activeCategory.featured.fees}</div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <div className="text-xs tracking-widest uppercase text-[var(--color-ch4-text)]/50 mb-2">Outcomes</div>
                        <div className="text-sm font-medium leading-snug">
                          {activeCategory.featured.outcomes.join(', ')}
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={activeCategory.featured.link}
                      className="inline-flex items-center gap-3 text-sm font-medium tracking-widest uppercase text-[var(--color-ch4-text)] group hover:text-[var(--color-ch4-accent)] transition-colors"
                    >
                      Explore Program
                      <span className="p-2 border border-[var(--color-ch4-text)]/20 rounded-full group-hover:border-[var(--color-ch4-accent)] transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
