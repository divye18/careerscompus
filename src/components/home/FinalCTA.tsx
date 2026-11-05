'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="relative py-28 sm:py-40 overflow-hidden bg-transparent pointer-events-auto">
      {/* Decorative: Glowing horizon line */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-24 sm:pb-32">
        <div className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--color-accent-sky)]/40 to-transparent" />
        {/* Glow beneath the horizon */}
        <div className="absolute bottom-20 sm:bottom-28 w-80 h-20 bg-[var(--color-accent-sky)]/10 rounded-full blur-3xl" />
      </div>
      
      {/* Compass echo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="absolute top-8 sm:top-12 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <Compass className="w-12 h-12 text-[var(--color-royal-blue)]/30" strokeWidth={1} />
      </motion.div>

      <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block text-[11px] uppercase tracking-[0.25em] font-bold text-champagne-800 mb-4">
            The Journey Continues
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-royal-deep)] mb-5 leading-tight">
            Your Next Direction <br className="hidden sm:block" />
            <span className="italic font-serif">Starts Here.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed font-light">
            Keep exploring careers, courses and universities, or ask for guidance when you are ready.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/#act-discovery" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-royal-blue)] hover:bg-[#1E2A78] text-white font-bold rounded-lg transition-all hover:-translate-y-1 shadow-[0_4px_25px_rgba(49,85,217,0.4)]"
            >
              Explore Careers <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/#act-guidance"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-md border border-[var(--color-royal-deep)]/20 hover:bg-white text-[var(--color-royal-deep)] font-medium rounded-lg transition-colors"
            >
              Get Guidance
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
