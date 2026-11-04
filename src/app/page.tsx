import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollJourney, JourneySection } from '@/components/home/ScrollJourney';
import { Hero } from '@/components/home/Hero';
import { CareerExploration } from '@/components/home/CareerExploration';
import { PopularStreams } from '@/components/home/PopularStreams';
import { FeaturedCourses } from '@/components/home/FeaturedCourses';
import { UniversityPreview } from '@/components/home/UniversityPreview';
import { CompareTeaser } from '@/components/home/CompareTeaser';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CounsellingCTA } from '@/components/home/CounsellingCTA';
import { TrustStats } from '@/components/home/TrustStats';
import { FAQSection } from '@/components/home/FAQSection';
import { FinalCTA } from '@/components/home/FinalCTA';
import { Scroll3DScene } from '@/components/home/Scroll3DScene';

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full relative min-h-screen">
        <ScrollJourney>
          
          {/* THE NEW PERSISTENT ABSTRACT 3D LAYER */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Scroll3DScene />
          </div>

          <JourneySection mode="light" id="act-hero">
            <Hero />
          </JourneySection>

          <JourneySection mode="light" id="act-discovery">
            <CareerExploration />
          </JourneySection>
          
          <JourneySection mode="light" id="act-courses">
            <div className="py-16 sm:py-24">
              <PopularStreams />
              <FeaturedCourses />
            </div>
          </JourneySection>
          
          <JourneySection mode="light" id="act-universities">
            <div className="py-16 sm:py-24">
              <UniversityPreview />
            </div>
          </JourneySection>
          
          <JourneySection mode="light" id="act-comparison">
            <div className="py-16 sm:py-24">
              <CompareTeaser />
              <HowItWorks />
            </div>
          </JourneySection>
          <JourneySection mode="light" id="act-guidance">
            <CounsellingCTA />
          </JourneySection>
          
          <JourneySection mode="light" id="act-trust">
            <div className="py-16 sm:py-24">
              <TrustStats />
              <FAQSection />
            </div>
          </JourneySection>

          
          <JourneySection mode="light" id="act-future">
            <FinalCTA />
          </JourneySection>

        </ScrollJourney>
      </main>
      <Footer />
    </>
  );
}
