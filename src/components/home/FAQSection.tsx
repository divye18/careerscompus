'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: "What is CareersCompus?", a: "CareersCompus is an education discovery platform for students in India, currently in early development. It is being built to help you explore careers, compare courses and discover universities in one place. This homepage is a preview." },
  { q: "Is the information on this page real?", a: "The courses, universities and comparison details shown here are sample content used to demonstrate the design. They are not verified data and should not be used for admission decisions. Always check details with the institution's official sources." },
  { q: "Can I search for courses and colleges yet?", a: "Not fully. The search box on this page offers a small set of sample suggestions and jumps to the related section. A searchable directory is planned but does not exist yet." },
  { q: "How do I choose the right stream after 10th?", a: "Start with the subjects you enjoy and do well in, look at the careers each stream can lead to, and talk it over with teachers, family or a counsellor. The career section on this page is a simple starting point for exploring options." },
  { q: "Does the callback form send my details anywhere?", a: "No. The form is a preview: it does not send, store or share anything. When a callback service launches, this page will say so clearly." },
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
