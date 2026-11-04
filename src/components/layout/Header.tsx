'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Courses', href: '/courses' },
  { label: 'Universities', href: '/universities' },
  { label: 'Careers', href: '/careers' },
  { label: 'Compare', href: '/compare' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress, scrollY } = useScroll();

  // Light theme for almost everything, dark theme at the very end (Future CTA).
  // 0: Pearl, 0.2: Ivory, 0.7: Ivory, 0.8: Pearl, 0.9: Lavender, 1: Royal Deep
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.8, 0.9, 1],
    ['#121936', '#121936', '#121936', '#F8F9FC']
  );
  
  const logoColor = useTransform(
    scrollYProgress,
    [0, 0.8, 0.9, 1],
    ['#3155D9', '#3155D9', '#3155D9', '#F8F9FC']
  );

  const bgBorder = useTransform(
    scrollYProgress,
    [0, 0.8, 0.9, 1],
    ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)']
  );

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(248, 249, 252, 0)', 'rgba(248, 249, 252, 0.8)'] // Pearl background when scrolled
  );

  return (
    <motion.header 
      style={{ backgroundColor: headerBg, borderBottomColor: bgBorder }}
      className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md border-b transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}>
          <Link href="/">
            <motion.span 
              className="text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-plus-jakarta)', color: logoColor }}
            >
              CareersCompus
            </motion.span>
          </Link>
        </motion.div>

        {/* Center: Desktop Navigation */}
        <motion.nav 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          className="hidden lg:flex items-center space-x-8"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href}>
              <motion.span 
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: textColor }}
              >
                {link.label}
              </motion.span>
            </Link>
          ))}
        </motion.nav>

        {/* Right: Actions */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
          className="flex items-center space-x-4"
        >
          <button aria-label="Search" className="p-2 transition-opacity hover:opacity-70 hidden sm:block">
            <motion.div style={{ color: textColor }}>
              <Search className="w-5 h-5" />
            </motion.div>
          </button>
          
          <motion.button 
            style={{ color: '#ffffff', backgroundColor: '#3155D9' }}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full transition-transform hover:scale-105 shadow-[0_4px_15px_rgba(49,85,217,0.3)]"
          >
            Get Guidance
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 hover:opacity-70 transition-opacity"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <motion.div style={{ color: textColor }}>
              <Menu className="w-6 h-6" />
            </motion.div>
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-[var(--color-bg-pearl)] text-[var(--color-royal-deep)] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-royal-deep)]/10">
              <Link 
                href="/" 
                className="text-2xl font-extrabold text-[var(--color-royal-blue)] tracking-tight"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                CareersCompus
              </Link>
              <button 
                className="p-2 text-[var(--color-royal-deep)]/50 hover:text-[var(--color-royal-deep)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col px-4 py-6 space-y-6 flex-1 overflow-y-auto">
              <nav className="flex flex-col space-y-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={link.href}
                      className="text-xl font-medium hover:text-[var(--color-royal-blue)] transition-colors block py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pt-8 border-t border-[var(--color-royal-deep)]/10"
              >
                <button 
                  className="w-full py-4 bg-[var(--color-royal-blue)] text-white font-bold rounded-xl text-lg hover:bg-[#1E2A78] transition-colors shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Guidance
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
