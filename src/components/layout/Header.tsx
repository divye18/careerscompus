'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  // Only the homepage exists so far, so nav items jump to homepage sections.
  { label: 'Courses', href: '/#act-courses' },
  { label: 'Universities', href: '/#act-universities' },
  { label: 'Careers', href: '/#act-discovery' },
];

const NAV_IDS = NAV_LINKS.map((l) => l.href.split('#')[1]);

function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

function focusHeroSearch() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector<HTMLInputElement>('input[role="combobox"]')?.focus({ preventScroll: true });
}

/**
 * The section nearest the middle of the viewport, among the ones the nav points at. Observed with one band across the
 * viewport middle, so React state changes only when the reader crosses into another section.
 */
function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        const next = ids.find((id) => inBand.has(id)) ?? null;
        setActive((a) => (a === next ? a : next));
      },
      { rootMargin: '-45% 0px -54% 0px', threshold: 0 }
    );
    const observe = () => ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    observe();
    // the journey swaps presenters after hydration, so look again once
    const t = window.setTimeout(observe, 800);
    return () => { window.clearTimeout(t); io.disconnect(); };
  }, [ids]);
  return active;
}

type Theme = 'night' | 'day';

/**
 * The header follows the environment beneath it (Nocturne Atlas alternates night and ivory grounds).
 * Sections declare `data-header-theme="night"`; anywhere else is day. React state only changes when a
 * boundary is crossed.
 */
function useHeaderTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('night');
  useEffect(() => {
    // IntersectionObserver watches a 1px strip through the middle of the header. Unlike measuring
    // getBoundingClientRect on every scroll frame, it never forces synchronous layout.
    const visible = new Set<Element>();
    let io: IntersectionObserver | null = null;
    const apply = () => {
      const next: Theme = visible.size > 0 ? 'night' : 'day';
      setTheme((t) => (t === next ? t : next));
    };
    const build = () => {
      io?.disconnect();
      visible.clear();
      const bottomInset = Math.max(0, window.innerHeight - 33);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          apply();
        },
        { rootMargin: `-32px 0px -${bottomInset}px 0px`, threshold: 0 }
      );
      document.querySelectorAll('[data-header-theme="night"]').forEach((el) => io!.observe(el));
    };
    build();
    window.addEventListener('resize', build, { passive: true });
    // The journey swaps presenters after hydration (flow → pinned), replacing the observed sections.
    // Re-scan when the main content's structure changes (debounced to one frame), otherwise the pinned
    // presenter is never observed and the header stays on the day theme over night grounds.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    });
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('resize', build);
      cancelAnimationFrame(raf);
      mo.disconnect();
      io?.disconnect();
    };
  }, []);
  return theme;
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuPanel = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Mobile menu is a modal dialog: move focus in, keep it in, Escape closes, focus returns to the menu button.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const opener = menuButton.current;
    menuPanel.current?.querySelector<HTMLElement>('button,a[href]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !menuPanel.current) return;
      const items = [...menuPanel.current.querySelectorAll<HTMLElement>('button,a[href]')];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [isMobileMenuOpen]);
  const theme = useHeaderTheme();
  const activeId = useActiveSection(NAV_IDS);
  const night = theme === 'night';

  // text / surface classes per environment (tokens only)
  const bar = night ? 'bg-ink-950/90 border-ivory/10 text-ivory' : 'bg-ivory/92 border-ink-950/10 text-ink-950';
  const link = night ? 'text-ivory/85 hover:text-ivory' : 'text-ink-950/80 hover:text-ink-950';
  const focus = night ? 'focus-visible:outline-cyan' : 'focus-visible:outline-cyan-800';
  const cta = night
    ? 'bg-ivory text-ink-950 hover:bg-ivory-100'
    : 'bg-ink-950 text-ivory hover:bg-ink-900';

  return (
    <>
      <header
        data-theme={theme}
        className={`fixed top-0 left-0 right-0 z-50 h-16 border-b transition-colors duration-300 ${bar}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className={`inline-flex items-center gap-2 py-3 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 ${focus}`}>
            <span aria-hidden="true" className={`block h-2.5 w-2.5 rounded-full ${night ? 'bg-champagne' : 'bg-champagne-800'}`} />
            <span className="text-xl font-semibold tracking-tight">CareersCompus</span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-8">
            {LINK_LIST(NAV_LINKS, link, focus, activeId, night)}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={focusHeroSearch}
              aria-label="Search"
              className={`hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-atlas-sm outline-none transition-colors focus-visible:outline-2 focus-visible:outline-solid ${focus} ${link}`}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => jumpTo('act-guidance')}
              className={`hidden sm:inline-flex min-h-[44px] items-center justify-center rounded-atlas px-5 text-sm font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 ${focus} ${cta}`}
            >
              About guidance
            </button>

            <button
              ref={menuButton}
              className={`lg:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-atlas-sm outline-none focus-visible:outline-2 focus-visible:outline-solid ${focus}`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay (sibling of the header so `fixed` is relative to the viewport) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            ref={menuPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] bg-ink-950 text-ivory flex flex-col"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-ivory/10">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight" onClick={() => setIsMobileMenuOpen(false)}>
                <span aria-hidden="true" className="block h-2.5 w-2.5 rounded-full bg-champagne" />
                CareersCompus
              </Link>
              <button
                aria-label="Close mobile menu"
                className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-atlas-sm text-silver hover:text-ivory outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-cyan"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col px-4 py-6 flex-1 overflow-y-auto">
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV_LINKS.map((l, i) => (
                  <motion.div key={l.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link
                      href={l.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={activeId && l.href.endsWith('#' + activeId) ? 'location' : undefined}
                      className="block min-h-[56px] py-3 font-atlas text-[32px] leading-none text-ivory border-b border-ivory/10 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-cyan"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto pt-8">
                <button
                  className="w-full min-h-[52px] rounded-atlas bg-ivory text-ink-950 font-semibold text-lg hover:bg-ivory-100 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTimeout(() => jumpTo('act-guidance'), 250);
                  }}
                >
                  About guidance
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LINK_LIST(links: typeof NAV_LINKS, link: string, focus: string, activeId: string | null, night: boolean) {
  return links.map((l) => {
    const current = l.href.endsWith('#' + activeId);
    return (
      <Link
        key={l.label}
        href={l.href}
        aria-current={current ? 'location' : undefined}
        className={`inline-flex min-h-[44px] items-center border-b-2 text-sm font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 ${focus} ${link} ${current ? (night ? 'border-champagne' : 'border-champagne-800') : 'border-transparent'}`}
      >
        {l.label}
      </Link>
    );
  });
}
