'use client';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Courses', value: '1,200+' },
  { label: 'Universities', value: '300+' },
  { label: 'Careers', value: '100+' },
  { label: 'Students Guided', value: '50,000+' },
];

export function TrustStats() {
  return (
    <section className="py-16 border-b border-slate-200 pointer-events-none">
      <div className="container mx-auto px-4 max-w-7xl pointer-events-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-display font-bold text-accent-base mb-2">{s.value}</div>
              <div className="text-slate-600 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-wider">Trusted By Students Across India</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Placeholder trust badges */}
            <div className="text-xl font-bold font-display">THE HINDU</div>
            <div className="text-xl font-bold font-display">TIMES OF INDIA</div>
            <div className="text-xl font-bold font-display">FORBES</div>
            <div className="text-xl font-bold font-display">EDTECH</div>
          </div>
        </div>
      </div>
    </section>
  );
}
