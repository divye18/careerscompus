'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] w-full flex items-center pt-24 pb-16 overflow-hidden bg-transparent pointer-events-none">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center pointer-events-auto flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col items-center gap-6"
        >
          <span className="inline-block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-royal-blue)] mb-2">
            CAREERSCOMPUS
          </span>
          <h1 className="text-[40px] leading-[1.1] sm:text-6xl lg:text-[5rem] font-extrabold text-[var(--color-ch1-text)] tracking-tight font-display max-w-4xl">
            Your Future Has <br className="hidden sm:block" />
            <span className="text-[var(--color-royal-blue)]">
              More Than One Direction.
            </span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mt-6 leading-relaxed"
        >
          Explore careers, compare courses, discover universities, and chart your future with confidence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 mt-10"
        >
          <button className="bg-[var(--color-royal-blue)] hover:bg-[#1e3a8a] text-white px-8 py-3.5 rounded-lg font-bold transition-all shadow-md">
            Explore Careers
          </button>
          <button className="bg-white/80 backdrop-blur-md border border-slate-300 hover:bg-slate-50 text-[var(--color-ch1-text)] px-8 py-3.5 rounded-lg font-medium transition-colors shadow-sm">
            Get Guidance
          </button>
        </motion.div>

      </div>
    </section>
  );
}
