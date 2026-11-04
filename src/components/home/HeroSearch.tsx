'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Hero search — PREVIEW ONLY.
 * There is no backend or database. Suggestions come from the small, clearly
 * labelled SAMPLE_ENTRIES list below, and selecting one scrolls to the related
 * section of this page. It does not search real data.
 */

type Kind = 'Course' | 'Career' | 'University';

interface SampleEntry {
  label: string;
  kind: Kind;
  /** id of an existing homepage section */
  target: string;
}

const SECTION_FOR_KIND: Record<Kind, { id: string; name: string }> = {
  Course: { id: 'act-courses', name: 'Courses' },
  Career: { id: 'act-discovery', name: 'Careers' },
  University: { id: 'act-universities', name: 'Universities' },
};

const SAMPLE_ENTRIES: SampleEntry[] = [
  { label: 'B.Tech Computer Science', kind: 'Course', target: 'act-courses' },
  { label: 'MBBS', kind: 'Course', target: 'act-courses' },
  { label: 'MBA', kind: 'Course', target: 'act-courses' },
  { label: 'B.Des', kind: 'Course', target: 'act-courses' },
  { label: 'Technology', kind: 'Career', target: 'act-discovery' },
  { label: 'Medicine', kind: 'Career', target: 'act-discovery' },
  { label: 'Business', kind: 'Career', target: 'act-discovery' },
  { label: 'Data Science', kind: 'Career', target: 'act-discovery' },
  { label: 'Architecture', kind: 'Career', target: 'act-discovery' },
  { label: 'Law', kind: 'Career', target: 'act-discovery' },
  { label: 'IIT Delhi', kind: 'University', target: 'act-universities' },
  { label: 'BITS Pilani', kind: 'University', target: 'act-universities' },
  { label: 'VIT Vellore', kind: 'University', target: 'act-universities' },
  { label: 'University of Delhi', kind: 'University', target: 'act-universities' },
];

const QUICK_TAGS = ['B.Tech Computer Science', 'MBBS', 'MBA', 'Data Science', 'IIT Delhi'];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export function HeroSearch() {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SAMPLE_ENTRIES.filter((e) => e.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const choose = (entry: SampleEntry) => {
    setQuery(entry.label);
    setOpen(false);
    setActive(-1);
    setStatus(
      `Preview: showing the ${SECTION_FOR_KIND[entry.kind].name} section. Full search is not available yet.`
    );
    scrollToSection(entry.target);
  };

  const clear = () => {
    setQuery('');
    setOpen(false);
    setActive(-1);
    setStatus('');
    inputRef.current?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setStatus('Type a course, college, university or career to try the preview search.');
      return;
    }
    const pick = active >= 0 ? results[active] : results[0];
    if (pick) {
      choose(pick);
    } else {
      setOpen(false);
      setStatus(`No sample match for “${q}”. Full search is coming soon.`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (results.length ? (i + 1) % results.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
    } else if (e.key === 'Escape') {
      if (open) {
        setOpen(false);
        setActive(-1);
      } else if (query) {
        clear();
      }
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div className="w-full max-w-xl mx-auto lg:mx-0 text-left">
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search courses, colleges, universities or careers
        </label>
        <div className="flex items-center gap-2 h-14 pl-4 pr-2 bg-white border border-[var(--color-royal-deep)]/15 rounded-lg shadow-[0_8px_30px_rgba(30,42,120,0.08)] focus-within:border-[var(--color-royal-blue)] focus-within:ring-2 focus-within:ring-[var(--color-royal-blue)]/20 transition-shadow">
          <Search className="w-5 h-5 shrink-0 text-[var(--color-royal-blue)]" aria-hidden="true" />
          <input
            id={`${listId}-input`}
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showList}
            aria-controls={`${listId}-list`}
            aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
              setStatus('');
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            placeholder="Search courses, colleges, universities or careers..."
            className="flex-1 min-w-0 h-full bg-transparent text-base text-[var(--color-accent-midnight)] placeholder:text-[var(--color-royal-deep)]/60 focus:outline-none truncate"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="shrink-0 w-11 h-11 inline-flex items-center justify-center rounded-md text-[var(--color-royal-deep)]/60 hover:text-[var(--color-royal-deep)] hover:bg-[var(--color-bg-lavender)] transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className="shrink-0 h-11 px-5 rounded-md bg-[var(--color-royal-blue)] hover:bg-[var(--color-royal-deep)] text-white text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </div>

        {showList && (
          <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-[var(--color-royal-deep)]/10 rounded-lg shadow-[0_16px_40px_rgba(30,42,120,0.12)] overflow-hidden">
            {results.length > 0 ? (
              <ul id={`${listId}-list`} role="listbox" aria-label="Sample suggestions">
                {results.map((r, i) => (
                  <li
                    key={r.label}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    // onMouseDown fires before the input's blur closes the list
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(r);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-[15px] text-[var(--color-royal-deep)] ${
                      i === active ? 'bg-[var(--color-bg-lavender)]' : ''
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--color-royal-deep)]/70 bg-[var(--color-bg-pearl)] border border-[var(--color-royal-deep)]/10 px-2 py-0.5 rounded">
                      {r.kind}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p id={`${listId}-list`} className="px-4 py-3 text-sm text-[var(--color-royal-deep)]/80">
                No sample match for “{query.trim()}”.
              </p>
            )}
            <p className="px-4 py-2 text-xs text-[var(--color-royal-deep)]/70 bg-[var(--color-bg-pearl)] border-t border-[var(--color-royal-deep)]/10">
              Preview: sample suggestions only, not a live database search.
            </p>
          </div>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-[var(--color-royal-deep)]/70 mr-1">Try</span>
        {QUICK_TAGS.map((tag) => {
          const entry = SAMPLE_ENTRIES.find((e) => e.label === tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => entry && choose(entry)}
              className="min-h-[44px] sm:min-h-[36px] px-3 rounded-md text-sm text-[var(--color-royal-deep)] bg-white/70 border border-[var(--color-royal-deep)]/15 hover:border-[var(--color-royal-blue)] hover:text-[var(--color-royal-blue)] transition-colors"
            >
              {tag}
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-[1.25rem] text-sm text-[var(--color-royal-deep)]/80" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
