import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Journey } from '@/journey/Journey';
import { Handoff } from '@/journey/Handoff';
import { SHOW_INTERIM_SECTIONS } from '@/lib/site';
import { SceneRailLane } from '@/journey/layers/SceneRailLane';
import { CoursesPathway } from '@/journey/courses/CoursesPathway';
import { UniversityAtlas } from '@/journey/universities/UniversityAtlas';
import { CompareTeaser } from '@/components/home/CompareTeaser';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CounsellingCTA } from '@/components/home/CounsellingCTA';
import { PlatformPrinciples } from '@/components/home/PlatformPrinciples';
import { FAQSection } from '@/components/home/FAQSection';
import { FinalCTA } from '@/components/home/FinalCTA';

/**
 * Meridian Atlas — Scenes 1–3 (Arrival, Discover, Explore) live in <Journey />; Scene 4 (Courses & Pathways) is <CoursesPathway />; Scene 5 (University Atlas) is <UniversityAtlas />.
 * The sections below are the previous homepage content, kept as interim content until
 * their scenes are rebuilt in later milestones.
 */
export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-atlas bg-ivory px-4 py-3 text-sm font-semibold text-ink-950 outline-none focus-visible:not-sr-only focus-visible:fixed focus-visible:px-4 focus-visible:py-3 focus-visible:left-3 focus-visible:top-3 focus-visible:z-[70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-cyan"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="w-full relative outline-none">
        <Journey />
        <div className="relative">
          <CoursesPathway />
          <UniversityAtlas />
          <SceneRailLane />
        </div>
        <Handoff />

        <div id="act-comparison" data-interim className="scroll-mt-16 py-16 sm:py-24">
          <CompareTeaser />
          {SHOW_INTERIM_SECTIONS && <HowItWorks />}
        </div>
        <div id="act-guidance" data-interim className="scroll-mt-16">
          <CounsellingCTA />
        </div>
        <div id="act-trust" data-interim className="scroll-mt-16 py-16 sm:py-24">
          {SHOW_INTERIM_SECTIONS && <PlatformPrinciples />}
          <FAQSection />
        </div>
        {SHOW_INTERIM_SECTIONS && (
          <div id="act-future" data-interim className="scroll-mt-16">
            <FinalCTA />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
