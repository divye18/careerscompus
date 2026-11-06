'use client';

import { useEffect, useState } from 'react';
import { RAIL_COMPARE_INDEX, RAIL_COURSES_INDEX, RAIL_NEXT_INDEX, RAIL_UNIVERSITIES_INDEX, RailNav } from './DirectionRail';

/**
 * One direction rail for the natural-scroll scenes (Courses, Universities, Compare), so the rail never doubles up at the
 * boundary between them. It parks in the right margin of its container (sticky) and the active stop follows
 * whichever scene crosses the middle of the screen (IntersectionObserver; state changes only at the boundary).
 * Drop it as the last child of a `relative` wrapper around those scenes. Desktop only (phones have no rail).
 */
export function SceneRailLane() {
  const [active, setActive] = useState(RAIL_COURSES_INDEX);

  useEffect(() => {
    const map: [string, number][] = [
      ['act-courses', RAIL_COURSES_INDEX],
      ['act-universities', RAIL_UNIVERSITIES_INDEX],
      ['act-comparison', RAIL_COMPARE_INDEX],
      ['act-next-steps', RAIL_NEXT_INDEX],
    ];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const hit = map.find(([id]) => id === (e.target as HTMLElement).id);
          if (hit) setActive(hit[1]);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    map.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-[584px] right-0 top-0 hidden w-[clamp(110px,10vw,180px)] lg:block">
      <div className="pointer-events-auto sticky top-[calc(50vh-262px)]">
        <RailNav active={active} className="absolute right-[clamp(10px,1.6vw,26px)] top-0 z-20" />
      </div>
    </div>
  );
}
