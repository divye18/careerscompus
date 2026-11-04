import type { Domain } from '@/content/domains';

/**
 * Seven original hairline glyphs, one per domain, engraved-instrument style.
 * 24×24 viewBox, stroke only, inherits `currentColor`.
 */
export function DomainGlyph({ id, size = 22 }: { id: Domain['id']; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (id) {
    case 'technology': // chip with pins
      return (
        <svg {...common}>
          <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
          <rect x="10" y="10" width="4" height="4" />
          <path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21" />
        </svg>
      );
    case 'medicine': // cross in ring
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v9M7.5 12h9" />
        </svg>
      );
    case 'business': // rising line over baseline
      return (
        <svg {...common}>
          <path d="M3.5 19.5h17" />
          <path d="M5 15l4.5-4.5 3.5 3L19 7" />
          <path d="M15.5 7H19v3.5" />
        </svg>
      );
    case 'design': // bezier with handles
      return (
        <svg {...common}>
          <path d="M4.5 17.5C8 17.5 7 6.5 12 6.5s4 11 7.5 11" />
          <circle cx="4.5" cy="17.5" r="1.4" />
          <circle cx="19.5" cy="17.5" r="1.4" />
          <circle cx="12" cy="6.5" r="1.4" />
        </svg>
      );
    case 'law': // balance
      return (
        <svg {...common}>
          <path d="M12 4v16M8 20h8M5 7.5h14" />
          <path d="M5 7.5l-2.5 6h5z" />
          <path d="M19 7.5l-2.5 6h5z" transform="translate(-0.0 0)" />
        </svg>
      );
    case 'architecture': // arch & columns
      return (
        <svg {...common}>
          <path d="M4 20.5h16M6 20.5V10.5M18 20.5V10.5" />
          <path d="M6 10.5a6 6 0 0 1 12 0" />
          <path d="M9.5 20.5v-4.5a2.5 2.5 0 0 1 5 0v4.5" />
        </svg>
      );
    case 'science': // atom
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
  }
}
