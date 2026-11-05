import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Journey } from '@/journey/Journey';
import { Handoff } from '@/journey/Handoff';
import { PopularStreams } from '@/components/home/PopularStreams';
import { FeaturedCourses } from '@/components/home/FeaturedCourses';
import { UniversityPreview } from '@/components/home/UniversityPreview';
import { CompareTeaser } from '@/components/home/CompareTeaser';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CounsellingCTA } from '@/components/home/CounsellingCTA';
import { PlatformPrinciples } from '@/components/home/PlatformPrinciples';
import { FAQSection } from '@/components/home/FAQSection';
import { FinalCTA } from '@/components/home/FinalCTA';

/**
 * Meridian Atlas — Milestone 1: Scenes 1–2 (Arrival, Discover) live in <Journey />.
 * The sections below are the previous homepage content, kept as interim content until
 * their scenes are rebuilt in later milestones.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full relative">
        <Journey />
        <Handoff />

        <div id="act-courses" className="scroll-mt-16 py-16 sm:py-24">
          <PopularStreams />
          <FeaturedCourses />
        </div>
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
