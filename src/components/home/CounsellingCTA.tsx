'use client';

import { motion } from 'framer-motion';

export function CounsellingCTA() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden pointer-events-none">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="text-[var(--color-ch7-champagne)] font-mono text-sm tracking-widest mb-6">06 / GUIDANCE</div>
            <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-ch7-white)] leading-[1.1] mb-6">
              When the possibilities<br />
              <span className="font-serif italic text-[var(--color-ch7-periwinkle)]">feel overwhelming,</span>
            </h2>
            <p className="text-xl text-[var(--color-ch7-lavender)] font-light mb-8 max-w-md">
              Start with one conversation. Our academic counsellors help you map your capabilities to the right future.
            </p>
            
            <ul className="space-y-4 border-l border-[var(--color-ch7-periwinkle)]/30 pl-6">
              {['Free Initial Consultation', 'Profile Assessment', 'Unbiased Recommendations', 'Admission Support'].map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-1.5 h-1.5 bg-[var(--color-ch7-champagne)] rounded-full shrink-0" />
                  <span className="text-[var(--color-ch7-white)] font-light tracking-wide">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 lg:col-start-7 w-full"
          >
            {/* Editorial Form, not a typical glassmorphic card */}
            <div className="bg-[var(--color-ch7-indigo)]/40 p-8 sm:p-12 border border-[var(--color-ch7-periwinkle)]/20 rounded-sm">
              <h3 className="text-2xl font-display font-light text-[var(--color-ch7-white)] mb-8">Request a Callback</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="border-b border-[var(--color-ch7-periwinkle)]/30">
                  <label className="block text-xs font-mono text-[var(--color-ch7-champagne)] mb-2 uppercase tracking-widest">Full Name</label>
                  <input type="text" className="w-full bg-transparent text-[var(--color-ch7-white)] placeholder:text-[var(--color-ch7-periwinkle)]/50 pb-3 focus:outline-none font-light" placeholder="Jane Doe" />
                </div>
                <div className="border-b border-[var(--color-ch7-periwinkle)]/30">
                  <label className="block text-xs font-mono text-[var(--color-ch7-champagne)] mb-2 uppercase tracking-widest">Phone Number</label>
                  <input type="tel" className="w-full bg-transparent text-[var(--color-ch7-white)] placeholder:text-[var(--color-ch7-periwinkle)]/50 pb-3 focus:outline-none font-light" placeholder="+91 9876543210" />
                </div>
                <div className="border-b border-[var(--color-ch7-periwinkle)]/30">
                  <label className="block text-xs font-mono text-[var(--color-ch7-champagne)] mb-2 uppercase tracking-widest">Interested In</label>
                  <select className="w-full bg-transparent text-[var(--color-ch7-white)] pb-3 focus:outline-none font-light appearance-none cursor-pointer">
                    <option className="text-slate-900">Undergraduate</option>
                    <option className="text-slate-900">Postgraduate</option>
                    <option className="text-slate-900">Diploma</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-4 mt-8 bg-[var(--color-ch7-champagne)] text-[var(--color-ch7-indigo)] font-mono text-sm tracking-widest uppercase hover:bg-[var(--color-ch7-white)] transition-colors">
                  Begin Journey
                </button>
              </form>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
