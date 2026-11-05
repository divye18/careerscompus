import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Journey } from '@/journey/Journey';
import { Handoff } from '@/journey/Handoff';
import { SceneRailLane } from '@/journey/layers/SceneRailLane';
import { CoursesPathway } from '@/journey/courses/CoursesPathway';
import { UniversityAtlas } from '@/journey/universities/UniversityAtlas';
import { ComparisonStudio } from '@/journey/compare/ComparisonStudio';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CounsellingCTA } from '@/components/home/CounsellingCTA';
import { PlatformPrinciples } from '@/components/home/PlatformPrinciples';
import { FAQSection } from '@/components/home/FAQSection';
import { FinalCTA } from '@/components/home/FinalCTA';

/**
 * Meridian Atlas — Scenes 1–3 (Arrival, Discover, Explore) live in <Journey />; Scene 4 (Courses & Pathways) is <CoursesPathway />; Scene 5 (University Atlas) is <UniversityAtlas />; Scene 6 (Comparison Studio) is <ComparisonStudio />.
 * The sections below are the previous homepage content, kept as interim content until
 * their scenes are rebuilt in later milestones.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full relative">
        <Journey />
        <div className="relative">
          <CoursesPathway />
          <UniversityAtlas />
          <ComparisonStudio />
          <SceneRailLane />
        </div>
        <Handoff />

        <div className="py-16 sm:py-24">
          <HowItWorks />
        </div>
        <div id="act-guidance" className="scroll-mt-16">
          <CounsellingCTA />
        </div>
        <div id="act-trust" className="scroll-mt-16 py-16 sm:py-24">
          <PlatformPrinciples />
          <FAQSection />
        </div>
        <div id="act-future" className="scroll-mt-16">
          <FinalCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
