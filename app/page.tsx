import HeroSection from "@/components/home/hero-section";
import HeroSection2 from "@/components/home/HeroSection2";
import WelcomeSection from "@/components/home/welcome-section";
import QuoteSection from "@/components/home/quote-section";
import FeaturedStories from "@/components/home/featured-stories";
import HowItWorksSection from "@/components/home/how-it-works-section";
import WhyChooseSection from "@/components/home/why-choose-section";
import StatsSection from "@/components/home/stats-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import HowItWorksTeachers from "@/components/home/HowItWorksTeachers";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection2 />
      <WelcomeSection />
      <FeaturedStories />
      <QuoteSection />
      <HowItWorksSection />
      <HowItWorksTeachers />
      {/* <StatsSection /> */}
      <WhyChooseSection />
      <TestimonialsSection />
    </div>
  );
}
