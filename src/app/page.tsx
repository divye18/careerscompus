import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Journey } from '@/journey/Journey';
import { Handoff } from '@/journey/Handoff';
import { CoursesPathway } from '@/journey/courses/CoursesPathway';
import { UniversityPreview } from '@/components/home/UniversityPreview';
import { CompareTeaser } from '@/components/home/CompareTeaser';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CounsellingCTA } from '@/components/home/CounsellingCTA';
import { PlatformPrinciples } from '@/components/home/PlatformPrinciples';
import { FAQSection } from '@/components/home/FAQSection';
import { FinalCTA } from '@/components/home/FinalCTA';

/**
 * Meridian Atlas — Scenes 1–3 (Arrival, Discover, Explore) live in <Journey />; Scene 4 (Courses & Pathways) is <CoursesPathway />.
 * The sections below are the previous homepage content, kept as interim content until
 * their scenes are rebuilt in later milestones.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full relative">
        <Journey />
        <CoursesPathway />
        <Handoff />

        <div id="act-universities" className="scroll-mt-16 py-16 sm:py-24">
          <UniversityPreview />
        </div>
        <div id="act-comparison" className="scroll-mt-16 py-16 sm:py-24">
          <CompareTeaser />
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
