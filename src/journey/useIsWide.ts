import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 1024px)';
const subscribe = (onChange: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener('change', onChange);
  return () => m.removeEventListener('change', onChange);
};

/** True at Tailwind's `lg` and wider. The server renders the narrow case; layout itself stays in CSS. */
export function useIsWide(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
