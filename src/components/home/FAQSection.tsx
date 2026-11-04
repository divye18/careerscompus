'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "How do I choose the right stream after 10th?", a: "Choosing the right stream involves understanding your interests, aptitude, and long-term career goals. Our platform offers personalized career assessments and expert counselling to help you make an informed decision." },
  { q: "Are the university rankings reliable?", a: "Yes, our rankings are aggregated from reputed national and international ranking frameworks like NIRF, QS, and our own proprietary metrics focusing on student outcomes and placements." },
  { q: "Can I apply to universities directly through CareersCompus?", a: "Absolutely. For partner universities, we offer a seamless one-click application process. For others, we provide detailed step-by-step guidance and official application links." },
  { q: "Is the initial career counselling session really free?", a: "Yes, your first 30-minute discovery call with our expert counsellors is completely free, with no obligations." },
  { q: "How accurate is the fee and placement data?", a: "We regularly update our database directly from official university records and alumni reports to ensure high accuracy in fees and placement statistics." },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button 
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-bold text-slate-900">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-4 text-slate-600">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
