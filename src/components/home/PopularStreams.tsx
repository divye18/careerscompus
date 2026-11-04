'use client';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Briefcase, Stethoscope } from 'lucide-react';

const streams = [
  { id: 1, name: 'Engineering', count: 'Technology and applied science', icon: Calculator, bg: 'from-blue-50 to-blue-100' },
  { id: 2, name: 'Medical', count: 'Health care and life sciences', icon: Stethoscope, bg: 'from-teal-50 to-teal-100' },
  { id: 3, name: 'Management', count: 'Business, finance and leadership', icon: Briefcase, bg: 'from-purple-50 to-purple-100' },
  { id: 4, name: 'Arts & Humanities', count: 'Society, language and the arts', icon: BookOpen, bg: 'from-orange-50 to-orange-100' },
];

export function PopularStreams() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-8">Explore by Stream</h2>
        <div className="flex flex-wrap gap-6 justify-between">
          {streams.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex-1 min-w-[250px] bg-gradient-to-br ${s.bg} rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow`}
            >
              <s.icon className="w-8 h-8 text-slate-900 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">{s.name}</h3>
              <p className="text-sm text-slate-600 mt-1">{s.count}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
