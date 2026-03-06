import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TechCarousel } from "@/components/TechCarousel";
import { HorizontalFeature } from "@/components/HorizontalFeature";
import { ComparisonSection } from "@/components/ComparisonSection";
import { SecuritySection } from "@/components/SecuritySection";
import { VideoFeatureSection } from "@/components/VideoFeatureSection";
import { ScrollTypographySection } from "@/components/ScrollTypographySection";
import { SaaSJourneySection } from "@/components/SaaSJourneySection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "GitGraph – Understand your codebase",
  description: "Analyze your GitHub repositories with intelligent reports, metrics and insights to better understand your codebase.",
};

export default function Home() {

  return (
    <main className="bg-black font-sans">
      <Header />
      <Hero />
      <TechCarousel />
      <HorizontalFeature />
      <ComparisonSection />
      <SecuritySection />
      <VideoFeatureSection />
      <ScrollTypographySection />
      <SaaSJourneySection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
