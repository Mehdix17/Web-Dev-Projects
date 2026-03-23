import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { HomeScrollStory } from "@/components/animations/HomeScrollStory";

export default function Home() {
  return (
    <div className="-mt-20 min-h-screen bg-background pt-20 text-foreground transition-colors duration-300">
      <HomeScrollStory />
      <div className="relative">
        <HeroSection />
        <FeaturedProjectsSection />
        <ServicesSection />
        <FinalCtaSection />
      </div>
    </div>
  );
}
