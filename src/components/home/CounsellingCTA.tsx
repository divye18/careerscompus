'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Callback request form — PREVIEW ONLY. There is no backend: nothing is sent
 * or stored. Submitting validates the fields and shows a local confirmation
 * that says so.
 */

type Errors = { name?: string; phone?: string };

const LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma'];

const labelClass =
  'block text-xs font-semibold text-[var(--color-royal-blue)] mb-1 uppercase tracking-widest';
const fieldClass =
  'w-full min-h-[44px] bg-transparent text-[var(--color-accent-midnight)] placeholder:text-[var(--color-royal-deep)]/75 py-2.5 focus:outline-none text-base';

export function CounsellingCTA() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState(LEVELS[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Please enter your name.';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) e.phone = 'Please enter a valid phone number (at least 10 digits).';
    return e;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      // Preview only: no network request is made and nothing is stored.
      setSubmittedName(name.trim());
    }
  };

  const reset = () => {
    setName('');
    setPhone('');
    setLevel(LEVELS[0]);
    setErrors({});
    setSubmittedName(null);
  };

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden pointer-events-none">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="text-[var(--color-royal-blue)] font-mono text-sm tracking-widest mb-6">06 / GUIDANCE</div>
            <h2 className="text-4xl sm:text-5xl font-display font-light text-[var(--color-accent-midnight)] leading-[1.1] mb-6">
              When the possibilities
              <br />
              <span className="font-serif italic text-[var(--color-royal-blue)]">feel overwhelming,</span>
            </h2>
            <p className="text-xl text-[var(--color-royal-deep)]/85 font-light mb-8 max-w-md">
              Choosing a direction is easier with a little help. Tell us a bit about yourself and what you are
              considering.
            </p>

            <ul className="space-y-4 border-l border-[var(--color-royal-blue)]/30 pl-6">
              {[
                'Share your name and a phone number',
                'Tell us the level of study you are exploring',
                'Callback requests open when the service launches',
              ].map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent-champagne)] rounded-full shrink-0" />
                  <span className="text-[var(--color-accent-midnight)] font-light tracking-wide">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 lg:col-start-7 w-full"
          >
            <div className="bg-[var(--color-bg-lavender)] p-6 sm:p-12 border border-[var(--color-royal-blue)]/20 rounded-sm">
              <h3 className="text-2xl font-display font-light text-[var(--color-accent-midnight)] mb-2">
                Request a Callback
              </h3>
              <p className="text-sm text-[var(--color-royal-deep)]/80 mb-8">
                Preview only: this form does not send or store anything yet.
              </p>

              {submittedName ? (
                <div role="status" aria-live="polite" className="space-y-5">
                  <p className="text-lg text-[var(--color-accent-midnight)]">
                    Thanks, {submittedName}. Your details look complete.
                  </p>
                  <p className="text-base text-[var(--color-royal-deep)]/85 leading-relaxed">
                    This is a preview, so <strong>nothing was sent or saved</strong> and no one will call you.
                    Callback requests will be available once the service launches.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="min-h-[44px] px-6 border border-[var(--color-royal-blue)] text-[var(--color-royal-blue)] hover:bg-white font-semibold text-sm transition-colors"
                  >
                    Clear and start again
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={onSubmit} noValidate>
                  <div className="border-b border-[var(--color-royal-blue)]/30 focus-within:border-[var(--color-royal-blue)]">
                    <label htmlFor="cc-name" className={labelClass}>Full Name</label>
                    <input
                      id="cc-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'cc-name-err' : undefined}
                      className={fieldClass}
                      placeholder="Jane Doe"
                    />
                  </div>
                  {errors.name && (
                    <p id="cc-name-err" role="alert" className="-mt-3 text-sm text-red-700">{errors.name}</p>
                  )}

                  <div className="border-b border-[var(--color-royal-blue)]/30 focus-within:border-[var(--color-royal-blue)]">
                    <label htmlFor="cc-phone" className={labelClass}>Phone Number</label>
                    <input
                      id="cc-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'cc-phone-err' : undefined}
                      className={fieldClass}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.phone && (
                    <p id="cc-phone-err" role="alert" className="-mt-3 text-sm text-red-700">{errors.phone}</p>
                  )}

                  <div className="border-b border-[var(--color-royal-blue)]/30 focus-within:border-[var(--color-royal-blue)]">
                    <label htmlFor="cc-level" className={labelClass}>Interested In</label>
                    <select
                      id="cc-level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className={`${fieldClass} cursor-pointer`}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[52px] mt-4 bg-[var(--color-royal-blue)] text-white font-semibold text-sm tracking-widest uppercase hover:bg-[var(--color-royal-deep)] transition-colors"
                  >
                    Check my details
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
