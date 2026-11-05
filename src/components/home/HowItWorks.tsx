'use client';
import { motion } from 'framer-motion';
import { Search, Map, BarChart, Phone } from 'lucide-react';

const steps = [
  { id: 1, title: 'Discover Your Career', desc: 'Identify the right career path based on your interests.', icon: Search },
  { id: 2, title: 'Find the Right Course', desc: 'Browse courses linked to the paths you are curious about.', icon: Map },
  { id: 3, title: 'Compare Universities', desc: 'Line up universities and courses on the same criteria.', icon: BarChart },
  { id: 4, title: 'Talk It Through', desc: 'Discuss your shortlist with family, teachers or a counsellor.', icon: Phone },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-16 text-center">How It Works</h2>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center mb-6">
                  <s.icon className="w-6 h-6 text-accent-base" />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="text-cyan-800 font-bold text-sm mb-2">STEP {s.id}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-600 text-sm">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
