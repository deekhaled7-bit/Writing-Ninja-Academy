import HeroSection from "@/components/home/hero-section";
import HeroSection2 from "@/components/home/HeroSection2";
import FeaturedStories from "@/components/home/featured-stories";
import HowItWorksSection from "@/components/home/how-it-works-section";
import StatsSection from "@/components/home/stats-section";
import TestimonialsSection from "@/components/home/testimonials-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection2 />
      <FeaturedStories />
      <HowItWorksSection />
      {/* <StatsSection /> */}
      <TestimonialsSection />
    </div>
  );
}
