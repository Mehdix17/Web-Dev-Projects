import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";

export default function Home() {
  return (
    <div className="-mt-20 min-h-screen bg-white pt-20">
      <div className="relative">
        <HeroSection />
        <FeaturedProjectsSection />
        <ServicesSection />
        <FinalCtaSection />
      </div>
    </div>
  );
}
